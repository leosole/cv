import type { CV } from "@/types/cv"
import type { Theme } from "@/hooks/use-theme"
import type { PageColorChange } from "@/lib/page-colors"

export interface ActionItem {
	id: string
}

export interface ChatAction {
	timeline?: ActionItem | ActionItem[]
	theme?: Theme
	glass?: boolean
	skills?: string[]
	colors?: PageColorChange[]
}

export interface ChatResponse {
	message: string
	action?: ChatAction | null
}

export interface ChatMessage {
	role: "user" | "bot"
	text: string
}

export async function getConversationHistory(sessionId: string, conversationIndex: number): Promise<ChatMessage[]> {
	const query = new URLSearchParams({ sessionId, conversationIndex: String(conversationIndex) })
	const response = await fetch(`/.netlify/functions/chat?${query}`)
	if (!response.ok) {
		throw new Error(`Server error: ${response.status}`)
	}

	const data = await response.json()
	return Array.isArray(data.messages)
		? data.messages.filter((message: unknown): message is ChatMessage =>
			typeof message === "object" && message !== null &&
			(message as ChatMessage).role !== undefined &&
			((message as ChatMessage).role === "user" || (message as ChatMessage).role === "bot") &&
			typeof (message as ChatMessage).text === "string"
		)
		: []
}

export async function sendMessageToBot(
	userInput: string,
	cv: CV,
	sessionId: string,
	conversationIndex: number,
): Promise<ChatResponse> {
	try {
		const response = await fetch("/.netlify/functions/chat", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ message: userInput, cv, sessionId, conversationIndex }),
		});

		if (!response.ok) {
			throw new Error(`Server error: ${response.status}`);
		}

		const data = await response.json();
		return data;
	} catch (error) {
		console.error("Chat Error:", error);
		return { message: "I'm having trouble connecting to my brain right now. Please try again later!" };
	}
}