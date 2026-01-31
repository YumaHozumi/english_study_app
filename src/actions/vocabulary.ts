'use server';

import { auth } from '@/lib/auth';
import { db } from '@/db';
import { vocabularyEntries } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import type { SearchResult } from '@/types';

export async function getVocabularyEntries() {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error('Unauthorized');
    }

    const entries = await db
        .select()
        .from(vocabularyEntries)
        .where(eq(vocabularyEntries.userId, session.user.id))
        .orderBy(desc(vocabularyEntries.timestamp));

    return entries;
}

export async function saveVocabularyEntry(result: SearchResult) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error('Unauthorized');
    }

    const newEntry = await db
        .insert(vocabularyEntries)
        .values({
            userId: session.user.id,
            word: result.word,
            phonetic: result.phonetic,
            meaning: result.meaning,
            example: result.example,
            exampleJp: result.exampleJp,
            timestamp: Date.now(),
        })
        .returning();

    return newEntry[0];
}

export async function deleteVocabularyEntry(id: string) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error('Unauthorized');
    }

    // Verify ownership before deleting
    const entry = await db
        .select()
        .from(vocabularyEntries)
        .where(eq(vocabularyEntries.id, id))
        .limit(1);

    if (!entry.length || entry[0].userId !== session.user.id) {
        throw new Error('Not found or unauthorized');
    }

    await db.delete(vocabularyEntries).where(eq(vocabularyEntries.id, id));

    return entry[0];
}

export async function getVocabularyCount() {
    const session = await auth();
    if (!session?.user?.id) {
        return 0;
    }

    const entries = await db
        .select()
        .from(vocabularyEntries)
        .where(eq(vocabularyEntries.userId, session.user.id));

    return entries.length;
}

// ============================================
// SRS (Spaced Repetition System) Actions
// ============================================

import { and, lte, or, isNull } from 'drizzle-orm';
import { calculateReviewResult, getStartOfToday } from '@/lib/srs';
import { getDueWords } from '@/db/queries';

/**
 * Update review result for a vocabulary entry
 */
export async function updateReviewResult(id: string, remembered: boolean) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error('Unauthorized');
    }

    // Get current entry
    const entry = await db
        .select()
        .from(vocabularyEntries)
        .where(eq(vocabularyEntries.id, id))
        .limit(1);

    if (!entry.length || entry[0].userId !== session.user.id) {
        throw new Error('Not found or unauthorized');
    }

    const currentLevel = entry[0].srsLevel ?? 0;
    const result = calculateReviewResult(currentLevel, remembered);

    // Update entry with new SRS values
    const updated = await db
        .update(vocabularyEntries)
        .set({
            srsLevel: result.newLevel,
            nextReviewAt: result.nextReviewAt,
            lastReviewedAt: Date.now(),
            reviewCount: (entry[0].reviewCount ?? 0) + 1,
            isMastered: result.isMastered,
        })
        .where(eq(vocabularyEntries.id, id))
        .returning();

    return updated[0];
}

/**
 * Get words due for review today
 */
export async function getTodayReviewWords() {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error('Unauthorized');
    }

    return getDueWords(session.user.id);
}

/**
 * Get mastered words
 */
export async function getMasteredWords() {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error('Unauthorized');
    }

    const entries = await db
        .select()
        .from(vocabularyEntries)
        .where(
            and(
                eq(vocabularyEntries.userId, session.user.id),
                eq(vocabularyEntries.isMastered, true)
            )
        )
        .orderBy(desc(vocabularyEntries.lastReviewedAt));

    return entries;
}

/**
 * Unmaster a word (move back to learning queue)
 */
export async function unmasterWord(id: string) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error('Unauthorized');
    }

    const entry = await db
        .select()
        .from(vocabularyEntries)
        .where(eq(vocabularyEntries.id, id))
        .limit(1);

    if (!entry.length || entry[0].userId !== session.user.id) {
        throw new Error('Not found or unauthorized');
    }

    const updated = await db
        .update(vocabularyEntries)
        .set({
            srsLevel: 0,
            nextReviewAt: getStartOfToday(),
            isMastered: false,
        })
        .where(eq(vocabularyEntries.id, id))
        .returning();

    return updated[0];
}
