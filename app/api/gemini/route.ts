import { GoogleGenAI, Type } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

// Standard initialization of the Google Gen AI client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { theme, layout, mood } = body;
    
    if (!process.env.GEMINI_API_KEY) {
      // Graceful fallback if no Gemini Key configured yet
      return NextResponse.json({
        commentary: "ARCADE OVERDRIVE! 🔥 (Demo Mode)",
        stickers: [
          { text: "KAWAII!", type: "bubble", color: "#FF9A9A" },
          { text: "SUPER STAR", type: "star", color: "#FDB022" },
          { text: "SNAP!", type: "arcade", color: "#EA2D2D" }
        ],
        fortune: "Your future looks bright and rare like an EPIC badge! 🌟 Keep taking snaps!"
      });
    }

    const themeString = theme || "Retro";
    const layoutString = layout || "4 Photos";
    const userMood = mood || "Playful stickers";

    const prompt = `You are a Japanese Purikura (photobooth) and retro arcade companion AI.
The user just took a photobooth session with the theme: "${themeString}" using a "${layoutString}" layout.
Their mood/vibe is: "${userMood}".

Based on this, generate:
1. A snappy, enthusiastic retro arcade commentary (e.g. "COMBO OVERDRIVE! 🕹️" or "NEON GLOW +999 💖").
2. A list of exactly 3 retro stickers or text bubbles to place on their photo strip. Keep the text very short (1-3 words max), styled in CAPS, matching the theme.
3. A short, fun retro-style "Purikura Fortune" or Omikuji in 1-2 sentence maximum (e.g. "GREAT BLESSING: Your style today is so epic it overrides the matrix. Best spot: any local arcade!").`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["commentary", "stickers", "fortune"],
          properties: {
            commentary: {
              type: Type.STRING,
              description: "Short hyped retro arcade sticker-style comment (max 25 chars)."
            },
            stickers: {
              type: Type.ARRAY,
              description: "Exactly 3 stickers",
              items: {
                type: Type.OBJECT,
                required: ["text", "type", "color"],
                properties: {
                  text: { type: Type.STRING, description: "Short CAPS text, max 10 chars" },
                  type: { type: Type.STRING, enum: ["bubble", "heart", "star", "arcade"] },
                  color: { type: Type.STRING, description: "Hex color (use vibrant reds, pinks, yellow, cyan)" }
                }
              }
            },
            fortune: {
              type: Type.STRING,
              description: "Short retro fortune matching the theme, max 40 words."
            }
          }
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Gemini API Error:", err);
    return NextResponse.json({
      commentary: "SNAP SYSTEM ACTIVE! ✨",
      stickers: [
        { text: "OMG!", type: "bubble", color: "#FF9A9A" },
        { text: "COOL", type: "arcade", color: "#2E90FA" },
        { text: "CHILL", type: "heart", color: "#32D583" }
      ],
      fortune: "System reboot. Your photostrip rating is: LEGENDARY! 🌟 Keep going!"
    });
  }
}
