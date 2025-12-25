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

interface LLMResponse {
    words: SearchResultItem[];
    full_translation?: string;
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

        const modelName = process.env.MODEL_NAME || 'gemini-2.0-flash-exp';
        const model = genAI.getGenerativeModel({ model: modelName });

        // Check if input is a sentence (3+ words)
        const wordCount = query.trim().split(/\s+/).length;
        const isSentence = wordCount >= 3;

        const prompt = isSentence
            ? `You are an English teacher. The user has provided the following sentence/paragraph: "${query}".

INSTRUCTIONS:
1. Provide a full Japanese translation of the entire input.
2. Identify 1 to 3 most difficult/important keywords (vocabulary) from the input.

Return your response in this STRICT JSON format:
{
  "full_translation": "Full Japanese translation of the entire input",
  "words": [
    {
      "word": "The word/phrase",
      "phonetic": "IPA pronunciation",
      "meaning": "Clear definition in JAPANESE (日本語)",
      "example": "Use the original input sentence as the example",
      "example_jp": "Japanese translation of the example"
    }
  ]
}

Do not include any markdown formatting like \`\`\`json. Just the raw JSON object.`
            : `You are an English teacher. The user has provided the following word/phrase: "${query}".

INSTRUCTIONS:
Define this word/phrase with the following details.

Return your response in this STRICT JSON format:
{
  "words": [
    {
      "word": "The word/phrase",
      "phonetic": "IPA pronunciation",
      "meaning": "Clear definition in JAPANESE (日本語)",
      "example": "A simple, memorable example sentence",
      "example_jp": "Japanese translation of the example"
    }
  ]
}

Do not include any markdown formatting like \`\`\`json. Just the raw JSON object.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean up potential code blocks
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

        // Parse JSON
        let data: LLMResponse;
        try {
            data = JSON.parse(cleanText);
        } catch {
            return NextResponse.json(
                { detail: 'Failed to parse LLM response' },
                { status: 500 }
            );
        }

        // Ensure words is an array
        const wordsArray = Array.isArray(data.words) ? data.words : [data.words];

        // Convert to response format (example_jp -> exampleJp)
        const results = wordsArray.map((item: SearchResultItem) => ({
            word: item.word,
            phonetic: item.phonetic,
            meaning: item.meaning,
            example: item.example,
            exampleJp: item.example_jp
        }));

        // Build response with optional fullTranslation
        const responseData: {
            results: typeof results;
            fullTranslation?: string;
            originalText?: string;
        } = { results };

        if (isSentence && data.full_translation) {
            responseData.fullTranslation = data.full_translation;
            responseData.originalText = query;
        }

        return NextResponse.json(responseData);

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json(
            { detail: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        );
    }
}
