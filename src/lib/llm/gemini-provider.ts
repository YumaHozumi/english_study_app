import { GoogleGenerativeAI } from '@google/generative-ai';
import type { LLMProvider, LLMResponse } from './types';

/**
 * Gemini API を使用する本番用プロバイダー
 */
export class GeminiProvider implements LLMProvider {
    readonly name = 'gemini';
    private model;

    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error('GEMINI_API_KEY is not set');
        }
        const genAI = new GoogleGenerativeAI(apiKey);
        const modelName = process.env.MODEL_NAME || 'gemini-2.0-flash-exp';
        this.model = genAI.getGenerativeModel({ model: modelName });
    }

    async analyze(query: string): Promise<LLMResponse> {
        const wordCount = query.trim().split(/\s+/).length;
        const isSentence = wordCount >= 3;

        const prompt = this.buildPrompt(query, isSentence);
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean up potential code blocks
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

        try {
            return JSON.parse(cleanText) as LLMResponse;
        } catch {
            throw new Error('Failed to parse LLM response');
        }
    }

    private buildPrompt(query: string, isSentence: boolean): string {
        if (isSentence) {
            return `You are an English teacher. The user has provided the following sentence/paragraph: "${query}".

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

Do not include any markdown formatting like \`\`\`json. Just the raw JSON object.`;
        }

        return `You are an English teacher. The user has provided the following word/phrase: "${query}".

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
    }
}
