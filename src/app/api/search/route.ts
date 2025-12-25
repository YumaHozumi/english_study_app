import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

interface SearchResultItem {
    word: string;
    phonetic: string;
    meaning: string;
    example: string;
    example_jp: string;
}

export async function POST(request: NextRequest) {
    try {
        const { query } = await request.json();

        if (!query || typeof query !== 'string' || !query.trim()) {
            return NextResponse.json(
                { detail: 'Query cannot be empty' },
                { status: 400 }
            );
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

        const prompt = `You are an English teacher. The user has provided the following input: "${query}".

INSTRUCTIONS:
1. If the input is a **single word/phrase**, define it directly.
2. If the input is a **sentence or paragraph**, identify 1 to 3 most difficult/important keywords (vocabulary) from it.

For each item, provide the details in a STRICT JSON ARRAY format:
[
  {
    "word": "The word/phrase",
    "phonetic": "IPA pronunciation",
    "meaning": "Clear definition in JAPANESE (日本語)",
    "example": "If input was a long text, USE THE INPUT SENTENCE HERE (highlighting the word if possible). If input was a single word, create a new example.",
    "example_jp": "Japanese translation of the example"
  }
]

Do not include any markdown formatting like \`\`\`json. Just the raw JSON array.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean up potential code blocks
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

        // Parse JSON
        let data: SearchResultItem[];
        try {
            data = JSON.parse(cleanText);
        } catch {
            return NextResponse.json(
                { detail: 'Failed to parse LLM response' },
                { status: 500 }
            );
        }

        // Ensure array format
        const resultsArray = Array.isArray(data) ? data : [data];

        // Convert to response format (example_jp -> exampleJp)
        const results = resultsArray.map((item: SearchResultItem) => ({
            word: item.word,
            phonetic: item.phonetic,
            meaning: item.meaning,
            example: item.example,
            exampleJp: item.example_jp
        }));

        return NextResponse.json({ results });

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json(
            { detail: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        );
    }
}
