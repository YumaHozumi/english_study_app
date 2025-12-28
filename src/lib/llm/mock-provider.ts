import type { LLMProvider, LLMResponse } from './types';

/**
 * テスト用モックプロバイダー
 * 
 * 実際のAPIを呼び出さず、固定のレスポンスを返す
 */
export class MockProvider implements LLMProvider {
    readonly name = 'mock';

    /** モックレスポンスの遅延時間（ミリ秒） */
    private delay: number;

    constructor(options?: { delay?: number }) {
        this.delay = options?.delay ?? 500;
    }

    async analyze(query: string): Promise<LLMResponse> {
        // 遅延をシミュレート（ローディング表示のテスト用）
        await this.sleep(this.delay);

        const wordCount = query.trim().split(/\s+/).length;
        const isSentence = wordCount >= 3;

        if (isSentence) {
            return this.getMockSentenceResponse(query);
        }

        return this.getMockWordResponse(query);
    }

    private getMockWordResponse(query: string): LLMResponse {
        // クエリに基づいて一貫性のあるモックデータを生成
        const normalizedQuery = query.toLowerCase().trim();

        return {
            words: [
                {
                    word: normalizedQuery,
                    phonetic: `/ˈmɒk.ɪŋ/`,
                    meaning: `【モック】「${normalizedQuery}」の意味です（テスト用モックデータ）`,
                    example: `This is a mock example sentence for "${normalizedQuery}".`,
                    example_jp: `これは「${normalizedQuery}」のモック例文です。`,
                },
            ],
        };
    }

    private getMockSentenceResponse(query: string): LLMResponse {
        // 文章の場合は最初の2-3単語をキーワードとして抽出
        const words = query.trim().split(/\s+/).slice(0, 2);

        return {
            full_translation: `【モック翻訳】${query}`,
            words: words.map((word) => ({
                word: word.replace(/[.,!?]/g, ''),
                phonetic: '/mɒk/',
                meaning: `【モック】「${word}」の意味（テスト用）`,
                example: query,
                example_jp: `【モック】${query}の日本語訳`,
            })),
        };
    }

    private sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}

/**
 * エラーをシミュレートするモックプロバイダー
 * 
 * エラーハンドリングのテスト用
 */
export class MockErrorProvider implements LLMProvider {
    readonly name = 'mock-error';

    async analyze(): Promise<LLMResponse> {
        throw new Error('Mock API Error: Simulated failure for testing');
    }
}
