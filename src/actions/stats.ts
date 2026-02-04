'use server';

import { auth } from '@/lib/auth';
import { db } from '@/db';
import { vocabularyEntries } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getStartOfToday, getJSTDateString, MS_PER_DAY } from '@/lib/srs';

// Helper to get end of today (JST)
function getEndOfToday(): number {
    return getStartOfToday() + MS_PER_DAY - 1;
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
    const todayStart = getStartOfToday();
    const todayEnd = getEndOfToday();
    const todayReviews = entries.filter(e =>
        e.lastReviewedAt && e.lastReviewedAt >= todayStart && e.lastReviewedAt <= todayEnd
    ).length;

    // Calculate streak (consecutive days with reviews)
    const streakDays = calculateStreakFromEntries(entries);

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
 * Calculate consecutive study days streak from entries
 */
function calculateStreakFromEntries(entries: Array<{ lastReviewedAt: number | null }>): number {
    // Get unique dates with reviews
    const reviewDates = new Set<string>();
    entries.forEach(e => {
        if (e.lastReviewedAt) {
            reviewDates.add(getJSTDateString(e.lastReviewedAt));
        }
    });

    if (reviewDates.size === 0) return 0;

    // Count consecutive days from today backwards
    let streak = 0;
    const today = Date.now();

    for (let i = 0; i < 365; i++) {
        const checkDate = today - (i * MS_PER_DAY);
        const dateStr = getJSTDateString(checkDate);

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
 * Calculate review history from entries
 */
function calculateHistoryFromEntries(entries: Array<{ lastReviewedAt: number | null }>, days: number = 7): DailyReviewData[] {
    // Create a map of date -> review count
    const reviewMap = new Map<string, number>();

    entries.forEach(e => {
        if (e.lastReviewedAt) {
            const date = getJSTDateString(e.lastReviewedAt);
            reviewMap.set(date, (reviewMap.get(date) || 0) + 1);
        }
    });

    // Generate data for the last N days
    const result: DailyReviewData[] = [];
    const today = Date.now();

    for (let i = days - 1; i >= 0; i--) {
        const date = today - (i * MS_PER_DAY);
        const dateStr = getJSTDateString(date);

        result.push({
            date: dateStr,
            count: reviewMap.get(dateStr) || 0,
        });
    }

    return result;
}

/**
 * Get all stats page data with a single DB query
 * Used by the Server Component to fetch all data at once
 */
export async function getStatsPageData(): Promise<{ stats: StudyStats; history: DailyReviewData[] }> {
    const session = await auth();

    const defaultStats: StudyStats = {
        totalWords: 0,
        masteredWords: 0,
        learningWords: 0,
        masteryRate: 0,
        totalReviews: 0,
        todayReviews: 0,
        streakDays: 0,
    };

    if (!session?.user?.id) {
        return { stats: defaultStats, history: [] };
    }

    // Single DB query for all data
    const entries = await db
        .select()
        .from(vocabularyEntries)
        .where(eq(vocabularyEntries.userId, session.user.id));

    // Calculate all stats from the same data
    const totalWords = entries.length;
    const masteredWords = entries.filter(e => e.isMastered).length;
    const learningWords = totalWords - masteredWords;
    const masteryRate = totalWords > 0 ? Math.round((masteredWords / totalWords) * 100) : 0;
    const totalReviews = entries.reduce((sum, e) => sum + (e.reviewCount ?? 0), 0);

    // Today's reviews
    const todayStart = getStartOfToday();
    const todayEnd = getEndOfToday();
    const todayReviews = entries.filter(e =>
        e.lastReviewedAt && e.lastReviewedAt >= todayStart && e.lastReviewedAt <= todayEnd
    ).length;

    // Calculate streak and history from the same entries
    const streakDays = calculateStreakFromEntries(entries);
    const history = calculateHistoryFromEntries(entries, 7);

    return {
        stats: {
            totalWords,
            masteredWords,
            learningWords,
            masteryRate,
            totalReviews,
            todayReviews,
            streakDays,
        },
        history,
    };
}

/**
 * Get review history for the last N days (legacy, still available for backward compatibility)
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

    return calculateHistoryFromEntries(entries, days);
}
