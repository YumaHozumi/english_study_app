'use server';

import { auth } from '@/lib/auth';
import { db } from '@/db';
import { vocabularyEntries } from '@/db/schema';
import { eq, and, gte, lte, count } from 'drizzle-orm';

// Helper to get start of day
function getStartOfDay(date: Date): number {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
}

// Helper to get end of day
function getEndOfDay(date: Date): number {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d.getTime();
}

export interface StudyStats {
    totalWords: number;
    masteredWords: number;
    learningWords: number;
    masteryRate: number;
    totalReviews: number;
    todayReviews: number;
    streakDays: number;
}

export interface DailyReviewData {
    date: string;
    count: number;
}

/**
 * Get study statistics for the current user
 */
export async function getStudyStats(): Promise<StudyStats> {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error('Unauthorized');
    }

    // Get all vocabulary entries for this user
    const entries = await db
        .select()
        .from(vocabularyEntries)
        .where(eq(vocabularyEntries.userId, session.user.id));

    const totalWords = entries.length;
    const masteredWords = entries.filter(e => e.isMastered).length;
    const learningWords = totalWords - masteredWords;
    const masteryRate = totalWords > 0 ? Math.round((masteredWords / totalWords) * 100) : 0;

    // Total reviews (sum of reviewCount)
    const totalReviews = entries.reduce((sum, e) => sum + (e.reviewCount ?? 0), 0);

    // Today's reviews
    const todayStart = getStartOfDay(new Date());
    const todayEnd = getEndOfDay(new Date());
    const todayReviews = entries.filter(e =>
        e.lastReviewedAt && e.lastReviewedAt >= todayStart && e.lastReviewedAt <= todayEnd
    ).length;

    // Calculate streak (consecutive days with reviews)
    const streakDays = await calculateStreak(session.user.id);

    return {
        totalWords,
        masteredWords,
        learningWords,
        masteryRate,
        totalReviews,
        todayReviews,
        streakDays,
    };
}

/**
 * Calculate consecutive study days streak
 */
async function calculateStreak(userId: string): Promise<number> {
    const entries = await db
        .select()
        .from(vocabularyEntries)
        .where(eq(vocabularyEntries.userId, userId));

    // Get unique dates with reviews
    const reviewDates = new Set<string>();
    entries.forEach(e => {
        if (e.lastReviewedAt) {
            const date = new Date(e.lastReviewedAt);
            reviewDates.add(date.toISOString().split('T')[0]);
        }
    });

    if (reviewDates.size === 0) return 0;

    // Count consecutive days from today backwards
    let streak = 0;
    const today = new Date();

    for (let i = 0; i < 365; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - i);
        const dateStr = checkDate.toISOString().split('T')[0];

        if (reviewDates.has(dateStr)) {
            streak++;
        } else if (i > 0) {
            // Skip today if no reviews yet (allow current day to be incomplete)
            break;
        }
    }

    return streak;
}

/**
 * Get review history for the last N days
 */
export async function getReviewHistory(days: number = 7): Promise<DailyReviewData[]> {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error('Unauthorized');
    }

    const entries = await db
        .select()
        .from(vocabularyEntries)
        .where(eq(vocabularyEntries.userId, session.user.id));

    // Create a map of date -> review count
    const reviewMap = new Map<string, number>();

    entries.forEach(e => {
        if (e.lastReviewedAt) {
            const date = new Date(e.lastReviewedAt).toISOString().split('T')[0];
            reviewMap.set(date, (reviewMap.get(date) || 0) + 1);
        }
    });

    // Generate data for the last N days
    const result: DailyReviewData[] = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        result.push({
            date: dateStr,
            count: reviewMap.get(dateStr) || 0,
        });
    }

    return result;
}
