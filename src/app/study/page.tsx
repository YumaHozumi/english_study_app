import { auth } from '@/lib/auth';
import { db } from '@/db';
import { vocabularyEntries } from '@/db/schema';
import { eq, and, lte, or, isNull } from 'drizzle-orm';
import { StudyView } from '@/components/Study/StudyView';
import type { WordEntry } from '@/types';

async function getTodayWords(userId: string): Promise<WordEntry[]> {
    const now = Date.now();

    const entries = await db
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

    return entries.map(entry => ({
        id: entry.id,
        word: entry.word,
        phonetic: entry.phonetic,
        meaning: entry.meaning,
        example: entry.example,
        exampleJp: entry.exampleJp,
        timestamp: entry.timestamp,
        srsLevel: entry.srsLevel,
        nextReviewAt: entry.nextReviewAt,
        lastReviewedAt: entry.lastReviewedAt,
        reviewCount: entry.reviewCount,
        isMastered: entry.isMastered,
    }));
}

export default async function StudyPage() {
    const session = await auth();

    let initialWords: WordEntry[] = [];
    const isAuthenticated = !!session?.user?.id;

    if (isAuthenticated) {
        initialWords = await getTodayWords(session.user.id);
    }

    return (
        <StudyView
            initialWords={initialWords}
            isAuthenticated={isAuthenticated}
        />
    );
}
