import { streamText, convertToModelMessages } from "ai";
import { google } from "@ai-sdk/google";
import { NextRequest } from "next/server";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, sessionId, hasFile, fileName } = body;

    let systemPrompt = `You are an expert Technical Recruiter and AI Resume Coach. 
    Your goal is to provide a deep analysis of the user's resume against their career goals.
    
    CRITICAL INSTRUCTIONS:
    1. If a resume is attached, read it immediately.
    2. Do NOT just acknowledge the file. Provide a detailed critique.
    3. Check for: Tech stack match, impact-driven bullet points, and formatting.
    4. Be honest but encouraging.`;

    if (hasFile === "true") {
      systemPrompt += `\n\nThe user has also attached a resume file named: ${fileName}. Acknowledge that you received it, and tell them you are analyzing it now.`;
    }

    const resolvedMessages = await convertToModelMessages(messages);

    const result = await streamText({
      model: google("gemini-2.5-flash"), // Great choice using the new 2.5 Flash model!
      system: systemPrompt,
      messages: resolvedMessages,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Error in chat route:", error);
    return new Response(JSON.stringify({ error: "Failed to process chat" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
