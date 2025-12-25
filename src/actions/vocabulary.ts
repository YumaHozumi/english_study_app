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
