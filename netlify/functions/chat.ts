/// <reference types="node" />
import dotenv from "dotenv";
const isLocalDev = process.env.NETLIFY_DEV === "true" || process.env.NETLIFY_LOCAL === "true";
if (isLocalDev) dotenv.config({ override: true });

import { Handler } from "@netlify/functions";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Pinecone } from "@pinecone-database/pinecone";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };

  try {
    const { message, previous, cv } = JSON.parse(event.body || "{}");
    console.log("user message:", message)
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

    const cvPageMap = cv ? `\n\nPAGE MAP (Timeline Structure):\nThe page displays a timeline with the following entries:\n${cv.professional_experience.map((exp: any) => `- ${exp.id}: ${exp.company} (${exp.type})`).join('\n')}\n${cv.education.map((edu: any) => `- ${edu.id}: ${edu.institution} (${edu.degree})`).join('\n')}\nWhen referring to these timeline items in your response, use the "action" field with the unique ID of the relevant entry.` : '';
    
    const systemInstruction = `You are an AI assistant for Leonardo Solé Rodrigues, a full stack frontend focused engineer. Answer questions about his professional experience, skills, education, and background based on the provided context.

Be concise, accurate, and professional. If you don't know the answer based on the provided context, clearly state that you don't have that information.

IMPORTANT: Format your response as a JSON object with two fields:
- "message": Your answer to the user's question (as a string)
- "action": Reference(s) to relevant timeline entries (optional, can be omitted or null)
  For each relevant entry, use the unique ID from the CV data:
  { "id": "tcu-frontend-engineer" }
  You can provide a single action object or an array of action objects if multiple entries are relevant

Example 1 (single reference):
{
  "message": "Leonardo is currently working as a Frontend Engineer at TCU.",
  "action": { "id": "tcu-frontend-engineer" }
}

Example 2 (multiple references):
{
  "message": "Leonardo has experience with React and TypeScript. He worked at Trimble and studied at UFRJ.",
  "action": [
    { "id": "trimble-fullstack-engineer" },
    { "id": "ufrj-engineering" }
  ]
}

Example 3 (no action needed):
{
  "message": "I don't have information about that.",
  "action": null
}

RETRIEVED CONTEXT:
${contextText}`

    const chatModel = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite-preview", systemInstruction });
    const prompt = `

PREVIOUS CONVERSATION (if any):
${previous || "No previous conversation"}

${cvPageMap}

USER QUESTION:
${message}

Provide a helpful, accurate response based on the context above. Always return valid JSON with "message" field and optional "action" field. The "action" field should contain the unique IDs of relevant professional_experience or education entries.`;

    const result = await chatModel.generateContent(prompt);
    const responseText = result.response.text();
    
    // Parse the JSON response
    try {
      const parsedResponse = JSON.parse(responseText);
      console.log("response:", parsedResponse.message || responseText)
      console.log("action":, parsedResponse.action)
      return {
        statusCode: 200,
        body: JSON.stringify({ 
          message: parsedResponse.message || responseText,
          action: parsedResponse.action || null
        }),
      };
    } catch (parseError) {
      // If parsing fails, return the raw text as message
      return {
        statusCode: 200,
        body: JSON.stringify({ 
          message: responseText,
          action: null
        }),
      };
    }
  } catch (error) {
    console.error(error);
    return { statusCode: 500, body: JSON.stringify({ error: "RAG Error", message: "An error occurred" }) };
  }
};
