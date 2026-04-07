/// <reference types="node" />
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Pinecone } from "@pinecone-database/pinecone";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ChunkData {
  id: string;
  type: string;
  text: string;
  metadata: Record<string, any>;
}

function cleanMetadata(metadata: Record<string, any>): Record<string, any> {
  return Object.fromEntries(
    Object.entries(metadata).filter(([_, value]) => value !== null && value !== undefined)
  );
}

async function updateKnowledgeBase() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
  const index = pc.index({name: "cv-docs"});
  const model = genAI.getGenerativeModel({ model: "gemini-embedding-2-preview" });

  const dataDir = path.resolve(__dirname, '../data');
  const chunksPath = path.join(dataDir, 'CHUNKS.json');
  
  const chunksData = JSON.parse(fs.readFileSync(chunksPath, 'utf-8'));
  const chunks: ChunkData[] = chunksData.chunks;

  let allChunks = [];
  let processed = 0;

  for (const chunk of chunks) {
    try {
      const result = await model.embedContent({
        content: { parts: [{ text: chunk.text }], role: "cv" },
      });

      const cleanedMetadata = cleanMetadata({
        text: chunk.text,
        type: chunk.type,
        ...chunk.metadata
      });

      allChunks.push({
        id: chunk.id,
        values: result.embedding.values,
        metadata: cleanedMetadata
      });

      processed++;
      if (processed % 10 === 0) {
        console.log(`📍 Processed ${processed}/${chunks.length} chunks...`);
      }
    } catch (error) {
      console.error(`❌ Error embedding chunk ${chunk.id}:`, error);
    }
  }

  try {
    console.log("🧹 Cleaning old data...");
    await index.namespace('cv-docs').deleteMany({ filter: {} });
  } catch (e) {
    console.log("ℹ️ Namespace was already empty or new.");
  }

  await index.namespace('cv-docs').upsert({records: allChunks});
  console.log(`✅ Synced ${allChunks.length} chunks to Pinecone.`);
}

updateKnowledgeBase().catch(console.error);