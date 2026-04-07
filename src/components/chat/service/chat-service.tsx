export async function sendMessageToBot(userInput: string, previous: string): Promise<string> {
  try {
    const response = await fetch("/.netlify/functions/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: userInput, previous }),
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error("Chat Error:", error);
    return "I'm having trouble connecting to my brain right now. Please try again later!";
  }
}