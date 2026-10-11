import { MongoClient, type Db } from "mongodb";

const uri = process.env.MONGODB_URI;
const DB_NAME = "cv-chat";

// Cache the client across invocations: Netlify Functions are ephemeral, so a
// fresh cold start must not open a new connection pool every request.
const globalWithMongo = globalThis as typeof globalThis & {
  _mongoClientPromise?: Promise<MongoClient>;
};

export function getDb(): Promise<Db> | null {
  if (!uri) {
    console.warn("MONGODB_URI is not set; chat messages will not be stored.");
    return null;
  }

  if (!globalWithMongo._mongoClientPromise) {
    const client = new MongoClient(uri);
    globalWithMongo._mongoClientPromise = client.connect();
  }

  return globalWithMongo._mongoClientPromise.then((client) => client.db(DB_NAME));
}
