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
    const cvSkills = Array.isArray(cv?.technical_skills)
      ? cv.technical_skills.filter((skill: unknown): skill is string => typeof skill === "string")
      : [];
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

    const cvPageMap = cv ? `\n\nPAGE MAP (Timeline Structure):\nThe page displays a timeline with the following entries:\n${cv.professional_experience.map((exp: any) => `- ${exp.id}: ${exp.company} (${exp.type})`).join('\n')}\n${cv.education.map((edu: any) => `- ${edu.id}: ${edu.institution} (${edu.degree})`).join('\n')}\nWhen referring to these timeline items in your response, put their unique IDs in the "timeline" field inside "action".` : '';
    
    const systemInstruction = `You are an AI assistant for Leonardo Solé Rodrigues, a full stack frontend focused engineer. Answer questions about his professional experience, skills, education, and background based on the provided context.

Be concise, accurate, and professional. If you don't know the answer based on the provided context, clearly state that you don't have that information.

IMPORTANT: Format your response as a JSON object with these fields:
- "message": Your answer to the user's question (as a string)
- "action": An optional object containing only the page actions relevant to the answer or explicitly requested by the user. Omit it or use null when no action is needed.
  - "timeline": One object or an array of objects with the unique ID of relevant CV timeline entries, e.g. { "id": "tcu-frontend-engineer" }
  - "theme": Set to "light" or "dark" only when the user explicitly asks to change the page theme to that mode.
  - "animatedBackground": Set to true or false only when the user explicitly asks to turn the animated background on or off.
  - "skills": An array of exact skill names from the allowed skills list below that are explicitly mentioned in your answer. Include all matching skills from the list and no other values.

Do not change page settings based on suggestions, questions, or inferred preferences. Return only valid JSON, without markdown fences.

Example (multiple action types):
{
  "message": "Leonardo uses React and TypeScript at TCU. I turned on the animated background.",
  "action": {
    "timeline": { "id": "tcu-frontend-engineer" },
    "animatedBackground": true,
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

RETRIEVED CONTEXT:
${contextText}`

    const chatModel = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite", systemInstruction });
    const prompt = `

PREVIOUS CONVERSATION (if any):
${previous || "No previous conversation"}

${cvPageMap}

USER QUESTION:
${message}

Provide a helpful, accurate response based on the context above. Return valid JSON with a "message" field and an optional "action" object. The action may combine timeline references, an explicitly requested theme or animated-background setting, and exact skills from the allowed CV skills list that appear in your answer. For multiple timeline references, put the ID objects in the action's "timeline" array.`;

    const result = await chatModel.generateContent(prompt);
    const responseText = result.response.text();
    
    // Parse the JSON response
    try {
      const parsedResponse = JSON.parse(responseText);
      console.log("response:", parsedResponse.message || responseText)
      console.log("action:", parsedResponse.action)
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
