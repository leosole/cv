/// <reference types="node" />
import dotenv from "dotenv";
const isLocalDev = process.env.NETLIFY_DEV === "true" || process.env.NETLIFY_LOCAL === "true";
if (isLocalDev) dotenv.config({ override: true });

import { Handler } from "@netlify/functions";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Pinecone } from "@pinecone-database/pinecone";
console.log("key:", process.env.GEMINI_API_KEY);
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };

  try {
    const { message, previous } = JSON.parse(event.body || "{}");
    const index = pc.index({name: "cv-docs"});

    const embeddingModel = genAI.getGenerativeModel({ model: "gemini-embedding-2-preview" });
    const embeddingResult = await embeddingModel.embedContent(message);
    const queryVector = embeddingResult.embedding.values;

    const queryResponse = await index.namespace('cv-docs').query({
      vector: queryVector,
      topK: 5,
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

    const chatModel = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
    const prompt = `You are an AI assistant for Leonardo Solé Rodrigues, a full stack frontend focused engineer. Answer questions about his professional experience, skills, education, and background based on the provided context.

Be concise, accurate, and professional. If you don't know the answer based on the provided context, clearly state that you don't have that information.

RETRIEVED CONTEXT:
${contextText}

PREVIOUS CONVERSATION (if any):
${previous || "No previous conversation"}

USER QUESTION:
${message}

Provide a helpful, accurate response based on the context above.`;

    const result = await chatModel.generateContent(prompt);
    return {
      statusCode: 200,
      body: JSON.stringify({ text: result.response.text() }),
    };
  } catch (error) {
    console.error(error);
    return { statusCode: 500, body: JSON.stringify({ error: "RAG Error" }) };
  }
};