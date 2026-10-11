import { createHash } from "node:crypto";
import type { Db } from "mongodb";

// Per-visitor and per-IP ceilings so one client can't drain the Gemini quota.
const PER_IP_PER_HOUR = 60;
const PER_SESSION_PER_DAY = 30;

const RATE_WINDOW_MS = 60 * 60 * 1000;
const SESSION_WINDOW_MS = 24 * 60 * 60 * 1000;

// One-time index creation per container (functions are reused across invocations)
const globalWithFlags = globalThis as typeof globalThis & { _chatIndexesReady?: boolean };

export function hashIp(ip: string): string {
  return createHash("sha256").update(ip).digest("hex").slice(0, 32);
}

export async function ensureIndexes(db: Db): Promise<void> {
  if (globalWithFlags._chatIndexesReady) return;
  const messages = db.collection("messages");
  // TTL: auto-expire old chats so the collection stays bounded
  await messages.createIndex({ timestamp: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });
  await messages.createIndex({ sessionId: 1, role: 1, timestamp: -1 });
  await messages.createIndex({ ipHash: 1, role: 1, timestamp: -1 });
  globalWithFlags._chatIndexesReady = true;
}

export interface RateLimitVerdict {
  allowed: boolean;
  reason?: string;
}

// Fail-open: if the DB is unreachable we still serve the chat (logged upstream)
export async function checkRateLimit(
  db: Db,
  ipHash: string,
  sessionId: string,
): Promise<RateLimitVerdict> {
  const now = new Date();
  const messages = db.collection("messages");

  const [ipCount, sessionCount] = await Promise.all([
    messages.countDocuments({
      ipHash,
      role: "user",
      timestamp: { $gte: new Date(now.getTime() - RATE_WINDOW_MS) },
    }),
    messages.countDocuments({
      sessionId,
      role: "user",
      timestamp: { $gte: new Date(now.getTime() - SESSION_WINDOW_MS) },
    }),
  ]);

  if (ipCount >= PER_IP_PER_HOUR) {
    return { allowed: false, reason: `Too many requests. Try again later.` };
  }
  if (sessionCount >= PER_SESSION_PER_DAY) {
    return { allowed: false, reason: `Daily message limit reached for this conversation.` };
  }
  return { allowed: true };
}
