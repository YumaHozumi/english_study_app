/**
 * Gemini API 構造化出力用 JSON Schema
 * 
 * 注意: types/index.ts の interface と構造を同期させること
 * 
 * @see https://ai.google.dev/gemini-api/docs/json-mode
 */

// 単語情報スキーマ
const WordSchema = {
    type: 'object',
    properties: {
        word: { type: 'string', description: 'The English word or phrase' },
        phonetic: { type: 'string', description: 'IPA pronunciation' },
        meaning: { type: 'string', description: 'Definition in Japanese' },
        example: { type: 'string', description: 'Example sentence in English' },
        example_jp: { type: 'string', description: 'Japanese translation of the example' },
    },
    required: ['word', 'phonetic', 'meaning', 'example', 'example_jp'],
} as const;

// チャンク（文構造）スキーマ
const ChunkSchema = {
    type: 'object',
    properties: {
        id: { type: 'integer', description: 'Unique identifier for this chunk' },
        text: { type: 'string', description: 'English chunk text' },
        label: { type: 'string', description: 'Grammatical role (Subject, Verb, Object, etc.)' },
        jp_label: { type: 'string', description: 'Japanese role name (主語, 動詞, 目的語, etc.)' },
        modifies_id: { type: ['integer', 'null'], description: 'ID of the chunk this modifies, null if root' },
        ja_text: { type: 'string', description: 'Japanese translation of this chunk' },
        grammar_note: { type: 'string', description: 'Grammar explanation for complex structures' },
    },
    required: ['id', 'text', 'label', 'jp_label', 'modifies_id', 'ja_text'],
} as const;

// 文ペアスキーマ
const SentencePairSchema = {
    type: 'object',
    properties: {
        en: { type: 'string', description: 'English sentence' },
        ja: { type: 'string', description: 'Japanese translation' },
        structure: {
            type: 'object',
            properties: {
                chunks: { type: 'array', items: ChunkSchema },
            },
            required: ['chunks'],
        },
    },
    required: ['en', 'ja', 'structure'],
} as const;

/**
 * 単語検索レスポンススキーマ（単語/フレーズ入力時）
 */
export const WordResponseSchema = {
    type: 'object',
    properties: {
        words: { type: 'array', items: WordSchema },
    },
    required: ['words'],
} as const;

/**
 * 文検索レスポンススキーマ（文章入力時）
 */
export const SentenceResponseSchema = {
    type: 'object',
    properties: {
        words: { type: 'array', items: WordSchema },
        sentence_pairs: { type: 'array', items: SentencePairSchema },
    },
    required: ['words', 'sentence_pairs'],
} as const;
