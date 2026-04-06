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

    // Using the high-quota stable model to avoid 404s and rate limits
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const systemInstruction = `You are "Book Buddy AI," a specialized study companion for the book "${bookTitle}"${bookAuthor ? ` by ${bookAuthor}` : ''}.
    
    CORE MISSION:
    1. Help the user understand this specific book through conversational dialogue.
    2. Provide translations and linguistic explanations.
    
    LANGUAGE STYLE (NATURAL MIX):
    - The user's preferred language for translation is ${preferredLanguage}.
    - You MUST respond in a NATURAL BILINGUAL MIX of English and ${preferredLanguage} (natural conversational ${preferredLanguage === 'Sinhala' ? 'Singlish' : 'Tanglish'} style).
    - Use ${preferredLanguage} for the "connective tissue" of your response (explanations, helpful tips, greetings), but keep technical terms, specific book quotes, and complex concepts in English.
    - This "Hybrid" style helps the user bridge the gap between their native intuition and the book's English text.
    
    STRICT BOUNDARIES:
    - DO NOT answer general questions unrelated to the book (e.g., "how to bake a cake", "current news").
    - If a user asks for a translation of a specific word or phrase, provide it and then link it back to how it appears or might be used in the context of "${bookTitle}".
    - If the user asks a general knowledge question, politely explain that you are specialized for this book and redirect them to related themes within the text.
    `;

    // Format the conversation into a single prompt for simpler processing
    const historyText = messages.map((m: any) => `${m.role === 'user' ? 'Reader' : 'Companion'}: ${m.content}`).join("\n");

    const prompt = `${systemInstruction}\n\nRecent Conversation:\n${historyText}\n\nCompanion:`;

    const result = await model.generateContent(prompt);
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
