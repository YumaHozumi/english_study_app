import { auth } from '@/lib/auth';
import { db } from '@/db';
import { vocabularyEntries } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { VocabularyList } from '@/components/Vocabulary/VocabularyList';
import type { WordEntry } from '@/types';

async function getInitialWords(userId: string): Promise<WordEntry[]> {
    const entries = await db
        .select()
        .from(vocabularyEntries)
        .where(eq(vocabularyEntries.userId, userId))
        .orderBy(desc(vocabularyEntries.timestamp));

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

export default async function VocabularyPage() {
    const session = await auth();

    let initialWords: WordEntry[] = [];
    const isAuthenticated = !!session?.user?.id;

    if (isAuthenticated) {
        initialWords = await getInitialWords(session.user.id);
    }

    return (
        <VocabularyList
            initialWords={initialWords}
            isAuthenticated={isAuthenticated}
        />
    );
}
