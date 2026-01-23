import { GoogleGenAI } from '@google/genai';
import type { LLMProvider, LLMResponse } from './types';
import { WordResponseSchema, SentenceResponseSchema } from './schemas';

/**
 * Gemini API を使用する本番用プロバイダー
 * 
 * JSON Mode (構造化出力) を使用してLLMレスポンスの形式を保証
 */
export class GeminiProvider implements LLMProvider {
  readonly name = 'gemini';
  private ai: GoogleGenAI;
  private modelName: string;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set');
    }
    this.ai = new GoogleGenAI({ apiKey });
    this.modelName = process.env.MODEL_NAME || 'gemini-2.5-flash-lite';
  }

  async analyze(query: string): Promise<LLMResponse> {
    const wordCount = query.trim().split(/\s+/).length;
    const isSentence = wordCount >= 3;

    const prompt = this.buildPrompt(query, isSentence);
    const schema = isSentence ? SentenceResponseSchema : WordResponseSchema;

    const response = await this.ai.models.generateContent({
      model: this.modelName,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: schema,
      },
    });

    // JSON Modeではクリーンなレスポンスが返るため、直接パース可能
    const text = response.text;
    if (!text) {
      throw new Error('Empty response from LLM');
    }

    return JSON.parse(text) as LLMResponse;
  }

  private buildPrompt(query: string, isSentence: boolean): string {
    if (isSentence) {
      return `You are an English teacher. The user has provided the following sentence/paragraph: "${query}".

INSTRUCTIONS:
1. Split the input into individual sentences.
2. Provide a Japanese translation for EACH sentence.
3. Identify 1 to 3 keywords that are MOST USEFUL for general English learning.
4. For EACH sentence, provide a structure breakdown (chunks) to help understand the sentence structure.

KEYWORD SELECTION RULES:
- AVOID domain-specific jargon (programming terms, legal terms, medical terms, brand names, etc.)
- AVOID technical compound words that only make sense in a specific field (e.g., "context provider", "API endpoint", "null pointer")
- PREFER single words or common phrases that are reusable in everyday, business, or academic contexts
- PREFER verbs, adjectives, and adverbs that appear frequently across multiple domains
- If the input is highly technical, extract only the general-purpose words (e.g., from "the function returns a value", extract "returns" not "function")
- Focus on words that would help the learner communicate more effectively in general situations
- OUTPUT WORDS IN THEIR MOST USEFUL FORM:
  * Normalize simple conjugations: third-person -s (returns→return), simple past for regular verbs (walked→walk), plurals (values→value)
  * KEEP -ing/-ed forms if they function as adjectives with distinct meanings (interesting, excited, given, retired)
  * KEEP forms that have become independent words (e.g., "given" as preposition meaning "considering")

STRUCTURE BREAKDOWN RULES:
- Break each sentence into meaningful chunks (Subject, Verb, Object, Modifier, etc.)
- For each chunk, provide:
  * id (number): unique identifier
  * text (string): the English chunk text
  * label (string): English grammatical role (Subject, Verb, Object, Modifier, Complement, Adverbial, etc.)
  * jp_label (string): Japanese role name (主語, 動詞, 目的語, 修飾節, 補語, 副詞句, etc.)
  * modifies_id (number|null): which chunk this modifies (null if root/main clause)
  * ja_text (string): Japanese translation of THIS chunk (corresponding part from the full translation)
  * grammar_note (string, optional): Only include for complex structures (relative clauses, participle phrases, etc.) to explain the grammar
- Use modifies_id to show dependencies (e.g., a relative clause modifies its antecedent)`;
    }

    return `You are an English teacher. The user has provided the following word/phrase: "${query}".

INSTRUCTIONS:
Define this word/phrase with the following details:
- word: The word/phrase
- phonetic: IPA pronunciation
- meaning: Clear definition in JAPANESE (日本語)
- example: A simple, memorable example sentence
- example_jp: Japanese translation of the example`;
  }
}
