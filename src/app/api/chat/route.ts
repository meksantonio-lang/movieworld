import { convertToModelMessages, streamText } from "ai";
import { google } from "@ai-sdk/google";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  // Extract the conversation history from the user's request
  const { messages } = await req.json();

  // Call the Gemini 1.5 Flash model
  const result = streamText({
    model: google("gemini-flash-latest"),
    messages: await convertToModelMessages(messages),
    abortSignal: AbortSignal.timeout(25_000),
    // THE SYSTEM PROMPT: This is where we give the AI its personality and rules
    system: "You are the official AI assistant for MovieWrld. You are a friendly, highly knowledgeable expert on Hollywood movies, Anime, and K-Dramas. Only answer questions related to entertainment, cinema, TV shows, and actors. If a user asks about sports, politics, or coding, politely remind them that you only discuss entertainment.",
  });

  return result.toUIMessageStreamResponse();
}