import { auth } from '@/lib/auth';
import { StudyView } from '@/components/Study/StudyView';
import { getDueWords } from '@/db/queries';
import type { WordEntry } from '@/types';

export default async function StudyPage() {
    const session = await auth();

    let initialWords: WordEntry[] = [];
    const isAuthenticated = !!session?.user?.id;

    if (isAuthenticated) {
        const entries = await getDueWords(session.user.id);
        initialWords = entries.map(entry => ({
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

    return (
        <StudyView
            initialWords={initialWords}
            isAuthenticated={isAuthenticated}
        />
    );
}
