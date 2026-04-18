import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { messages, bookTitle, bookAuthor, preferredLanguage = 'Tamil' } = await req.json();

    if (!messages || !bookTitle) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API Key not found in environment." }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const systemInstruction = `You are "Book Buddy AI," a specialized study companion for the book "${bookTitle}"${bookAuthor ? ` by ${bookAuthor}` : ''}.
    
    CORE MISSION:
    1. Help the user understand this specific book through conversational dialogue.
    2. Provide translations and linguistic explanations.
    
    LANGUAGE STYLE (NATURAL BILINGUAL MIX):
    - The user's preferred language for translation is ${preferredLanguage}.
    - You MUST respond in a NATURAL BILINGUAL MIX of English and ${preferredLanguage}.
    - Use ${preferredLanguage} for the "connective tissue" of your response (explanations, helpful tips), but keep technical terms, book quotes, and complex concepts in English.
    
    STRICT BOUNDARIES:
    - NO EMOJIS: Do not use any emojis in your responses. Keep it purely text-based.
    - DO NOT answer general questions unrelated to the book.
    - If a user asks for a translation, link it back to "${bookTitle}".
    `;

    // Using the official systemInstruction parameter for better optimization
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: systemInstruction
    });

    // TOKEN PROTECTION: Truncate history to only the last 6 messages
    // This prevents the chat from getting more expensive as it grows.
    const recentMessages = messages.slice(-6);

    // Format the conversation into a single prompt
    const historyText = recentMessages.map((m: any) => `${m.role === 'user' ? 'Reader' : 'Companion'}: ${m.content}`).join("\n");

    const prompt = `Recent Conversation:\n${historyText}\n\nCompanion:`;

    let result;
    try {
      result = await model.generateContent(prompt);
    } catch (primaryError: any) {
      console.warn("Primary API key failed:", primaryError.message);
      const apiKey2 = process.env.GEMINI_API_KEY_2;
      
      if (apiKey2) {
        console.log("Attempting fallback with GEMINI_API_KEY_2...");
        const fallbackGenAI = new GoogleGenerativeAI(apiKey2);
        const fallbackModel = fallbackGenAI.getGenerativeModel({
          model: "gemini-2.5-flash",
          systemInstruction: systemInstruction
        });
        // If this also fails, the error will be caught by the outer catch block
        result = await fallbackModel.generateContent(prompt);
      } else {
        throw primaryError; // Rethrow to outer catch if no fallback key
      }
    }

    const response = await result.response;
    const text = response.text();

    return NextResponse.json({
      role: "assistant",
      content: text
    });

  } catch (error: any) {
    console.error("Gemini Chat Error:", error);
    // Return a structured error that the client can handle gracefully
    return NextResponse.json({
      error: "Service temporarily unavailable",
      details: error.message
    }, { status: 200 }); // status 200 to avoid browser 'Connection Error' popups
  }
}
