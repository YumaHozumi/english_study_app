/**
 * LLM Provider Interface
 * 
 * LLMのモック化/切り替えを可能にするための共通インターフェース
 */

export interface SearchResultItem {
    word: string;
    phonetic: string;
    meaning: string;
    example: string;
    example_jp: string;
}

export interface SentencePair {
    en: string;
    ja: string;
    structure?: SentenceStructure;
}

export interface Chunk {
    id: number;
    text: string;
    label: string;
    jp_label: string;
    modifies_id: number | null;
    ja_text: string;
    grammar_note?: string;
}

export interface SentenceStructure {
    chunks: Chunk[];
}

export interface LLMResponse {
    words: SearchResultItem[];
    sentence_pairs?: SentencePair[];
}

export interface LLMProviderOptions {
    /** リクエストのタイムアウト（ミリ秒） */
    timeout?: number;
}

/**
 * LLM Provider インターフェース
 * 
 * 全てのLLMプロバイダー（Gemini, Mock, OpenAI等）はこのインターフェースを実装する
 */
export interface LLMProvider {
    /**
     * プロバイダー名を返す
     */
    readonly name: string;

    /**
     * テキストを解析して単語/フレーズの定義を取得する
     * 
     * @param query - 検索クエリ（単語、フレーズ、または文章）
     * @returns 解析結果
     */
    analyze(query: string): Promise<LLMResponse>;
}
