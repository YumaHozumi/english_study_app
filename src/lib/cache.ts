import { Redis } from '@upstash/redis';

// Redisクライアント（環境変数から自動設定）
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? Redis.fromEnv()
    : null;

// キャッシュの有効期限（24時間）
const CACHE_TTL_SECONDS = 60 * 60 * 24;

// キャッシュキーのプレフィックス
const CACHE_PREFIX = 'search:';

// クエリを正規化（小文字化、トリム、連続スペースを単一スペースに）
function normalizeQuery(query: string): string {
    return query.toLowerCase().trim().replace(/\s+/g, ' ');
}

// キャッシュキーを生成
function getCacheKey(query: string): string {
    return `${CACHE_PREFIX}${normalizeQuery(query)}`;
}

export interface CachedSearchResult {
    results: Array<{
        word: string;
        phonetic: string;
        meaning: string;
        example: string;
        exampleJp: string;
    }>;
    sentencePairs?: { en: string; ja: string }[];
}

export const searchCache = {
    /**
     * キャッシュから検索結果を取得
     */
    async get(query: string): Promise<CachedSearchResult | null> {
        // モックモード時はキャッシュを無効化
        if (process.env.USE_MOCK_LLM === 'true') {
            return null;
        }

        if (!redis) {
            return null;
        }

        const key = getCacheKey(query);
        try {
            const cached = await redis.get<CachedSearchResult>(key);
            if (cached) {
                return cached;
            }
            return null;
        } catch (error) {
            console.error('Cache get error:', error);
            return null;
        }
    },

    /**
     * 検索結果をキャッシュに保存
     */
    async set(query: string, result: CachedSearchResult): Promise<void> {
        // モックモード時はキャッシュを無効化
        if (process.env.USE_MOCK_LLM === 'true') {
            return;
        }

        if (!redis) {
            return;
        }

        const key = getCacheKey(query);
        try {
            await redis.set(key, result, { ex: CACHE_TTL_SECONDS });
        } catch (error) {
            console.error('Cache set error:', error);
        }
    },
};
