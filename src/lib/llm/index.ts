/**
 * LLM Provider Factory
 * 
 * 環境変数に基づいて適切なプロバイダーを返す
 * 
 * 環境変数:
 *   USE_MOCK_LLM=true  → モックプロバイダーを使用
 *   未設定 or false    → 本番Geminiプロバイダーを使用
 */

import type { LLMProvider } from './types';
import { GeminiProvider } from './gemini-provider';
import { MockProvider } from './mock-provider';

export type { LLMProvider, LLMResponse, SearchResultItem } from './types';
export { GeminiProvider } from './gemini-provider';
export { MockProvider, MockErrorProvider } from './mock-provider';

let cachedProvider: LLMProvider | null = null;

/**
 * LLMプロバイダーを取得する
 * 
 * @returns 環境設定に基づいたLLMプロバイダー
 */
export function getLLMProvider(): LLMProvider {
    if (cachedProvider) {
        return cachedProvider;
    }

    const useMock = process.env.USE_MOCK_LLM === 'true';

    if (useMock) {
        cachedProvider = new MockProvider();
    } else {
        cachedProvider = new GeminiProvider();
    }

    return cachedProvider;
}

/**
 * キャッシュされたプロバイダーをクリアする
 * 
 * テスト時にプロバイダーを切り替える場合に使用
 */
export function clearProviderCache(): void {
    cachedProvider = null;
}
