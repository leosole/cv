/// <reference types="node" />
import dotenv from "dotenv";
const isLocalDev = process.env.NETLIFY_DEV === "true" || process.env.NETLIFY_LOCAL === "true";
if (isLocalDev) dotenv.config({ override: true });

import { Handler } from "@netlify/functions";
import { GoogleGenerativeAI, GoogleGenerativeAIFetchError } from "@google/generative-ai";
import { Pinecone } from "@pinecone-database/pinecone";
import type { Db } from "mongodb";
import type { CV } from "../../src/types/cv";
import { pageColorMap } from "../../src/lib/page-colors";
import { getDb } from "./_lib/mongodb";
import { checkRateLimit, ensureIndexes, hashIp } from "./_lib/rate-limit";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });

// Input caps: bound the prompt cost and reject junk before any AI call
const MAX_MESSAGE_CHARS = 4000;
const MAX_PREVIOUS_CHARS = 8000;
const MAX_BODY_BYTES = 64 * 1024;
const MAX_OUTPUT_TOKENS = 1024;
const GROQ_MODEL = "openai/gpt-oss-120b";
const appearanceChangeVerbPattern = /\b(?:change|switch|set|make|turn|update|adjust|customi[sz]e|recolou?r|use)\b/i;
const appearanceChangeTargetPattern = /\b(?:colou?rs?|colourful|colorful|palette|background|surface|text|foreground|primary|secondary|accent|button|timeline|badge|chat|bubble|link|border|layout|design|appearance|look|warmer|cooler|brighter|darker|lighter|vibrant|muted|red|orange|yellow|green|blue|purple|pink|teal|cyan|black|white|gray|grey)\b/i;

const isAppearanceChangeRequest = (message: string) =>
  appearanceChangeVerbPattern.test(message) && appearanceChangeTargetPattern.test(message);

type GroqChatCompletionResponse = {
  choices?: Array<{ message?: { content?: string | null } }>;
};

type StoredMessage = {
  role: "user" | "bot";
  text: string;
};

const getSafeSessionId = (value: unknown): string | undefined =>
  typeof value === "string" && value.length > 0 && value.length <= 128 ? value : undefined;

const getSafeConversationIndex = (value: unknown): number | undefined =>
  typeof value === "number" && Number.isSafeInteger(value) && value >= 0 ? value : undefined;

const loadConversation = async (
  db: Db,
  sessionId: string,
  conversationIndex: number,
): Promise<StoredMessage[]> => {
  const indexFilter = conversationIndex === 0
    ? { $or: [{ conversationIndex: 0 }, { conversationIndex: { $exists: false } }] }
    : { conversationIndex };
  const records = await db.collection("messages")
    .find({ sessionId, ...indexFilter })
    .sort({ timestamp: 1, _id: 1 })
    .project({ role: 1, text: 1 })
    .toArray();

  return records.flatMap((record): StoredMessage[] =>
    (record.role === "user" || record.role === "bot") && typeof record.text === "string"
      ? [{ role: record.role, text: record.text }]
      : [],
  );
};

const jsonResponse = (statusCode: number, message: string) => ({
  statusCode,
  body: JSON.stringify({ message }),
});

const withGeminiRetry = async <T>(operation: () => Promise<T>): Promise<T> => {
  let retries = 0;
  while (true) {
    try {
      return await operation();
    } catch (error) {
      if (!(error instanceof GoogleGenerativeAIFetchError) || error.status !== 503 || retries >= 2) {
        throw error;
      }

      const retryDelayMs = 500 * 2 ** retries;
      retries++;
      console.warn("Gemini returned 503; retrying request", { retries, retryDelayMs });
      await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
    }
  }
};

const generateGroqResponse = async (systemInstruction: string, prompt: string): Promise<string> => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY is not configured");

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: prompt },
      ],
      max_completion_tokens: MAX_OUTPUT_TOKENS,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Groq API returned ${response.status}: ${errorBody.slice(0, 500)}`);
  }

  const result = await response.json() as GroqChatCompletionResponse;
  const content = result.choices?.[0]?.message?.content;
  if (typeof content !== "string" || !content) {
    throw new Error("Groq API returned no response content");
  }
  return content;
};

export const handler: Handler = async (event) => {
  if (event.httpMethod === "GET") {
    const query = event.queryStringParameters ?? {};
    const sessionId = getSafeSessionId(query.sessionId);
    const conversationIndex = query.conversationIndex && /^(0|[1-9]\d*)$/.test(query.conversationIndex)
      ? Number(query.conversationIndex)
      : undefined;
    const safeConversationIndex = getSafeConversationIndex(conversationIndex);
    if (!sessionId || safeConversationIndex === undefined) {
      return jsonResponse(400, "A valid sessionId and conversationIndex are required");
    }

    try {
      const db = await getDb();
      if (db) await ensureIndexes(db);
      const messages = db ? await loadConversation(db, sessionId, safeConversationIndex) : [];
      return { statusCode: 200, body: JSON.stringify({ messages }) };
    } catch (dbError) {
      console.error("Failed to load chat messages:", dbError);
      return { statusCode: 200, body: JSON.stringify({ messages: [] }) };
    }
  }

  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };

  const contentType = event.headers["content-type"] || event.headers["Content-Type"] || "";
  if (!contentType.includes("application/json")) {
    return jsonResponse(415, "Content-Type must be application/json");
  }
  if ((event.body?.length ?? 0) > MAX_BODY_BYTES) {
    return jsonResponse(413, "Request body too large");
  }

  let failureStage = "request processing";
  try {
    const { message, cv, sessionId, conversationIndex } = JSON.parse(event.body || "{}") as {
      message?: unknown;
      cv?: CV;
      sessionId?: unknown;
      conversationIndex?: unknown;
    };
    const safeSessionId = getSafeSessionId(sessionId);
    const safeConversationIndex = getSafeConversationIndex(conversationIndex);
    if (!safeSessionId || safeConversationIndex === undefined) {
      return jsonResponse(400, "A valid sessionId and conversationIndex are required");
    }
    if (typeof message !== "string" || !message.trim()) {
      return jsonResponse(400, "Message is required");
    }
    if (message.length > MAX_MESSAGE_CHARS) {
      return jsonResponse(413, `Message is too long (max ${MAX_MESSAGE_CHARS} characters)`);
    }
    console.log("user message:", message.slice(0, 200))

    // Rate limit (fail-open): reject abusive traffic before paying for AI calls
    const ipHash = hashIp((event.headers["x-forwarded-for"] || "").split(",")[0]?.trim() || "unknown");
    try {
      const db = await Promise.resolve(getDb());
      if (db) {
        await ensureIndexes(db);
        const verdict = await checkRateLimit(db, ipHash, safeSessionId);
        if (!verdict.allowed) {
          return jsonResponse(429, verdict.reason ?? "Too many requests");
        }
      }
    } catch (dbError) {
      console.error("Rate limit check failed (failing open):", dbError);
    }

    let safePrevious = "";
    try {
      const db = await getDb();
      if (db) {
        const previousMessages = await loadConversation(db, safeSessionId, safeConversationIndex);
        safePrevious = previousMessages
          .map((previousMessage) => `${previousMessage.role}: ${previousMessage.text}`)
          .join("\n")
          .slice(-MAX_PREVIOUS_CHARS);
      }
    } catch (dbError) {
      console.error("Failed to load chat context:", dbError);
    }

    const cvSkills = Array.isArray(cv?.technical_skills)
      ? cv.technical_skills.filter((skill: unknown): skill is string => typeof skill === "string")
      : [];
    const availableLinks = [
      ...(typeof cv?.links?.github === "string" ? [{ label: "GitHub", url: cv.links.github }] : []),
      ...(typeof cv?.links?.linkedin === "string" ? [{ label: "LinkedIn", url: cv.links.linkedin }] : []),
      ...(typeof cv?.info?.email === "string" ? [{ label: "Email", url: `mailto:${cv.info.email}` }] : []),
      ...(typeof cv?.info?.phone === "string"
        ? [{ label: "WhatsApp", url: `https://wa.me/${cv.info.phone.replace(/\D/g, "")}` }]
        : []),
      ...(Array.isArray(cv?.professional_experience)
        ? cv.professional_experience.flatMap((experience) =>
          Array.isArray(experience.positions)
            ? experience.positions.flatMap((position) =>
              Array.isArray(position.tasks)
                ? position.tasks.flatMap((task) =>
                  task && typeof task === "object" && typeof task.publication?.title === "string" && typeof task.publication?.link === "string"
                    ? [{ label: task.publication.title, url: task.publication.link }]
                    : [],
                )
                : [],
            )
            : [],
        )
        : []),
    ];
    const index = pc.index({name: "cv-docs"});

    failureStage = "Gemini embedding";
    const embeddingModel = genAI.getGenerativeModel({ model: "gemini-embedding-2-preview" });
    const embeddingResult = await withGeminiRetry(() => embeddingModel.embedContent(message));
    const queryVector = embeddingResult.embedding.values;

    failureStage = "Pinecone retrieval";
    const queryResponse = await index.namespace('cv-docs').query({
      vector: queryVector,
      topK: 8,
      includeMetadata: true,
    });

    const contextParts = queryResponse.matches
      .filter(match => match.metadata?.text)
      .map((match) => {
        const type = match.metadata?.type as string || 'general';
        const text = match.metadata?.text;
        return `[${type.toUpperCase()}]\n${text}`;
      });

    const contextText = contextParts.join("\n\n---\n\n");

    const cvPageMap = cv ? `\n\nPAGE MAP (Timeline Structure):\nThe page displays a timeline with the following entries:\n${cv.professional_experience.map((exp) => `- ${exp.id}: ${exp.company} (${exp.type})`).join('\n')}\n${cv.education.map((edu) => `- ${edu.id}: ${edu.institution} (${edu.degree})`).join('\n')}\nWhen referring to these timeline items in your response, put their unique IDs in the "timeline" field inside "action".` : '';
    const shouldIncludeColorMap = isAppearanceChangeRequest(message);
    const colorMapPrompt = shouldIncludeColorMap
      ? `\n\nPAGE COLOR MAP (editable CSS variables and their exact uses):\n${JSON.stringify(pageColorMap, null, 2)}\nOnly use the exact variable names listed here. When the user explicitly requests color changes, add a "colors" array of { "variable": exact CSS variable name, "color": requested CSS color } objects. Include one entry per requested variable and do not change unspecified colors.`
      : "";
    const colorActionInstructions = shouldIncludeColorMap
      ? `  - "colors": An array of objects with the exact CSS "variable" name and requested "color" value. Include one entry per requested variable, allow multiple entries, and do not invent variable names or change unspecified colors.\n`
      : "";
    
    const systemInstruction = `You are an AI assistant for Leonardo Solé Rodrigues, a full stack frontend focused engineer. Answer questions about his professional experience, skills, education, and background based on the provided context.

Be concise, accurate, and professional. If you don't know the answer based on the provided context, clearly state that you don't have that information.

IMPORTANT: Format your response as a JSON object with these fields:
- "message": Your answer to the user's question (as a string)
- "action": An optional object containing only the page actions relevant to the answer or explicitly requested by the user. Omit it or use null when no action is needed.
  - "timeline": One object or an array of objects with the unique ID of relevant CV timeline entries, e.g. { "id": "tcu-frontend-engineer" }
  - "theme": Set to "light" or "dark" only when the user explicitly asks to change the page theme to that mode.
  - "glass": Set to true or false only when the user explicitly asks to turn the glass effect on or off.
${colorActionInstructions}  - "skills": An array of exact skill names from the allowed skills list below that are explicitly mentioned in your answer. Include all matching skills from the list and no other values.

Do not change page settings based on suggestions, questions, or inferred preferences. Return only valid JSON, without markdown fences.
When a link is useful to answer the question or explicitly requested, include it as a Markdown link in "message". Use only the exact URLs in AVAILABLE LINKS, and do not add links when they are not relevant. For research questions, link the relevant publication(s); for contact or profile questions, provide the requested GitHub, LinkedIn, email, or WhatsApp link.

Example (multiple action types):
{
  "message": "Leonardo uses React and TypeScript at TCU. I switched the page to dark mode.",
  "action": {
    "timeline": { "id": "tcu-frontend-engineer" },
    "theme": "dark",
    "skills": ["React", "TypeScript"]
  }
}

Example (multiple timeline references and a theme change):
{
  "message": "Leonardo worked at Trimble and studied at UFRJ. I changed the theme to dark.",
  "action": {
    "timeline": [
      { "id": "trimble-fullstack-engineer" },
      { "id": "ufrj-engineering" }
    ],
    "theme": "dark"
  }
}

Example (no action needed):
{
  "message": "I don't have information about that.",
  "action": null
}

ALLOWED SKILLS FROM CV JSON (use exact names only):
${JSON.stringify(cvSkills)}

AVAILABLE LINKS (use only these exact URLs as Markdown link destinations):
${JSON.stringify(availableLinks)}

RETRIEVED CONTEXT:
${contextText}`

    const chatModel = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite", systemInstruction });
    const prompt = `

PREVIOUS CONVERSATION (if any):
${safePrevious || "No previous conversation"}

${cvPageMap}
${colorMapPrompt}

USER QUESTION:
${message}

Provide a helpful, accurate response based on the context above. Return valid JSON with a "message" field and an optional "action" object. The action may combine timeline references, explicitly requested theme or glass settings, and exact skills from the allowed CV skills list that appear in your answer. For multiple timeline references, put the ID objects in the action's "timeline" array.${shouldIncludeColorMap ? ' For color requests, return each requested variable and color in the "colors" array.' : ""}`;

    failureStage = "Gemini response generation";
    let responseText: string;
    try {
      const result = await withGeminiRetry(() => chatModel.generateContent({
        generationConfig: { maxOutputTokens: MAX_OUTPUT_TOKENS },
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      }));
      responseText = result.response.text();
    } catch (geminiError) {
      if (!process.env.GROQ_API_KEY) throw geminiError;
      console.warn("Gemini response generation failed; using Groq fallback", {
        model: GROQ_MODEL,
        error: geminiError instanceof Error ? geminiError.message : String(geminiError),
      });
      failureStage = "Groq fallback response generation";
      responseText = await generateGroqResponse(systemInstruction, prompt);
    }
    
    // Parse the JSON response
    let finalMessage = responseText;
    let finalAction: unknown = null;
    try {
      const parsedResponse = JSON.parse(responseText);
      finalMessage = parsedResponse.message || responseText;
      finalAction = parsedResponse.action || null;
      if (
        !shouldIncludeColorMap &&
        finalAction &&
        typeof finalAction === "object" &&
        !Array.isArray(finalAction)
      ) {
        delete (finalAction as Record<string, unknown>).colors;
      }
      console.log("response:", finalMessage)
      console.log("action:", finalAction)
    } catch {
      // If parsing fails, keep the raw text as message
    }

    // Persist the exchange to MongoDB (best-effort: never fail the chat)
    try {
      const db = await getDb();
      if (db) {
        await db.collection("messages").insertMany([
          {
            sessionId: safeSessionId,
            conversationIndex: safeConversationIndex,
            ipHash,
            role: "user",
            text: message.slice(0, 8000),
            timestamp: new Date(),
          },
          {
            sessionId: safeSessionId,
            conversationIndex: safeConversationIndex,
            role: "bot",
            text: String(finalMessage).slice(0, 8000),
            timestamp: new Date(),
          },
        ]);
      }
    } catch (dbError) {
      console.error("Failed to store chat messages:", dbError);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        message: finalMessage,
        action: finalAction
      }),
    };
  } catch (error) {
    const errorDetails = error instanceof Error
      ? { name: error.name, message: error.message, stack: error.stack }
      : { message: String(error) };
    console.error("Chat request failed:", { stage: failureStage, ...errorDetails });
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "RAG Error", message: "An error occurred", stage: failureStage }),
    };
  }
};
