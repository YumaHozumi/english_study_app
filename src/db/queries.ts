import { db } from '@/db';
import { vocabularyEntries } from '@/db/schema';
import { and, eq, lte, or, isNull } from 'drizzle-orm';

/**
 * 復習待ち単語を取得する
 * - マスター済みでない
 * - nextReviewAt が null（新規）または現在時刻以下（復習時期到来）
 */
export async function getDueWords(userId: string) {
    const now = Date.now();

    return db
        .select()
        .from(vocabularyEntries)
        .where(
            and(
                eq(vocabularyEntries.userId, userId),
                eq(vocabularyEntries.isMastered, false),
                or(
                    isNull(vocabularyEntries.nextReviewAt),
                    lte(vocabularyEntries.nextReviewAt, now)
                )
            )
        )
        .orderBy(vocabularyEntries.nextReviewAt);
}

/**
 * 復習待ち単語の件数を取得する（通知用）
 */
export async function getDueWordCount(userId: string): Promise<number> {
    const words = await getDueWords(userId);
    return words.length;
}
