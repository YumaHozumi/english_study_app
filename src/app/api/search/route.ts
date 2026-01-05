import { NextRequest, NextResponse } from 'next/server';
import { searchCache } from '@/lib/cache';
import { getLLMProvider, type SearchResultItem } from '@/lib/llm';

export async function POST(request: NextRequest) {
    try {
        const { query } = await request.json();

        if (!query || typeof query !== 'string' || !query.trim()) {
            return NextResponse.json(
                { detail: 'Query cannot be empty' },
                { status: 400 }
            );
        }

        // キャッシュチェック
        const cached = await searchCache.get(query);
        if (cached) {
            return NextResponse.json(cached);
        }

        // LLMプロバイダーを取得（環境変数に基づいてモック/本番を切り替え）
        const provider = getLLMProvider();
        const data = await provider.analyze(query);

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

        // Check if input is a sentence (3+ words)
        const wordCount = query.trim().split(/\s+/).length;
        const isSentence = wordCount >= 3;

        // Build response with optional sentencePairs
        const responseData: {
            results: typeof results;
            sentencePairs?: { en: string; ja: string }[];
        } = { results };

        if (isSentence && data.sentence_pairs) {
            responseData.sentencePairs = data.sentence_pairs;
        }

        // キャッシュに保存
        await searchCache.set(query, responseData);

        return NextResponse.json(responseData);

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json(
            { detail: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        );
    }
}
