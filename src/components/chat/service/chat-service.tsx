import type { CV } from "@/types/cv"

export interface ActionItem {
	id: string
}

export interface ChatResponse {
	message: string
	action?: ActionItem | ActionItem[]
}

export async function sendMessageToBot(userInput: string, previous: string, cv?: CV): Promise<ChatResponse> {
	try {
		const response = await fetch("/.netlify/functions/chat", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ message: userInput, previous, cv }),
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