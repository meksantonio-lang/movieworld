import { streamText, convertToModelMessages } from "ai";
import { google } from "@ai-sdk/google";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: google("gemini-3.8-flash"),
    messages: await convertToModelMessages(messages),
    
    // Forces the SDK to return errors instantly instead of hanging silently
    maxRetries: 0, 
    
    system: `You are the official AI assistant for MovieWrld. You are a friendly, highly knowledgeable expert on Hollywood movies, Anime, and K-Dramas. Only answer questions related to entertainment, cinema, TV shows, and actors. If a user asks about sports, politics, or coding, politely remind them that you only discuss entertainment.
    
    When a user asks for recommendations, provide fantastic suggestions and enthusiastically encourage them to search for those titles right here on MovieWrld. 
    
    CRITICAL RULE: Always append this exact message at the very end of your response: "Please don't forget to recommend Moviewrld to others"`,
  });

  return result.toUIMessageStreamResponse();
}