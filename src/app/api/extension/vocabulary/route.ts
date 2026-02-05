import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { vocabularyEntries } from '@/db/schema';
import { jwtVerify } from 'jose';
import { calculateNextReviewDate } from '@/lib/srs';

const JWT_SECRET = new TextEncoder().encode(
    process.env.EXTENSION_JWT_SECRET || 'your-secret-key-change-in-production'
);

interface VocabularyData {
    word: string;
    phonetic: string;
    meaning: string;
    example: string;
    exampleJp: string;
}

export async function POST(request: NextRequest) {
    try {
        // 認証ヘッダーからトークンを取得
        const authHeader = request.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json(
                { error: '認証が必要です' },
                { status: 401 }
            );
        }

        const token = authHeader.substring(7);

        // JWTを検証
        let userId: string;
        try {
            const { payload } = await jwtVerify(token, JWT_SECRET);
            userId = payload.sub as string;
        } catch {
            return NextResponse.json(
                { error: '無効なトークンです' },
                { status: 401 }
            );
        }

        const data: VocabularyData = await request.json();

        // バリデーション
        if (!data.word || !data.meaning) {
            return NextResponse.json(
                { error: '単語と意味は必須です' },
                { status: 400 }
            );
        }

        // データベースに保存
        const newEntry = await db
            .insert(vocabularyEntries)
            .values({
                userId,
                word: data.word,
                phonetic: data.phonetic || '',
                meaning: data.meaning,
                example: data.example || '',
                exampleJp: data.exampleJp || '',
                timestamp: Date.now(),
                srsLevel: 0,
                nextReviewAt: calculateNextReviewDate(0), // 翌日の00:00 JST
            })
            .returning();

        return NextResponse.json({
            success: true,
            entry: newEntry[0],
        });
    } catch (error) {
        console.error('Vocabulary save error:', error);
        return NextResponse.json(
            { error: '保存中にエラーが発生しました' },
            { status: 500 }
        );
    }
}
