/**
 * SRS (Spaced Repetition System) Logic
 * 
 * Based on a simplified SM-2 algorithm.
 * Intervals: 1 day -> 3 days -> 7 days -> 14 days -> 30 days (mastered)
 */

// Interval in days for each SRS level
export const SRS_INTERVALS = [1, 3, 7, 14, 30] as const;

// Maximum SRS level (mastered)
export const SRS_MAX_LEVEL = 4;

// Milliseconds in a day
export const MS_PER_DAY = 24 * 60 * 60 * 1000;

// JST (UTC+9) offset in milliseconds
export const JST_OFFSET_MS = 9 * 60 * 60 * 1000;

/**
 * Get the start of today (midnight) in milliseconds
 * Note: Always returns JST midnight regardless of server timezone
 * This ensures Cron (JST 08:00) can correctly detect words due at JST 00:00
 */
export function getStartOfToday(): number {
    const now = Date.now();
    // Convert to JST
    const jstNow = now + JST_OFFSET_MS;
    // Get JST midnight (floor to day boundary)
    const jstMidnight = Math.floor(jstNow / MS_PER_DAY) * MS_PER_DAY;
    // Convert back to UTC milliseconds
    return jstMidnight - JST_OFFSET_MS;
}

/**
 * Get JST date string (YYYY-MM-DD) from timestamp
 */
export function getJSTDateString(timestamp: number): string {
    const jstTimestamp = timestamp + JST_OFFSET_MS;
    return new Date(jstTimestamp).toISOString().split('T')[0];
}

/**
 * Calculate the next review date based on SRS level
 */
export function calculateNextReviewDate(level: number): number {
    const intervalDays = SRS_INTERVALS[Math.min(level, SRS_MAX_LEVEL)] || 30;
    const today = getStartOfToday();
    return today + intervalDays * MS_PER_DAY;
}

/**
 * Calculate new SRS state after a review
 * @param currentLevel Current SRS level (0-5+)
 * @param remembered Whether the user remembered the word
 * @returns New SRS state
 */
export function calculateReviewResult(
    currentLevel: number,
    remembered: boolean
): {
    newLevel: number;
    nextReviewAt: number;
    isMastered: boolean;
} {
    if (remembered) {
        // User remembered: increase level
        const newLevel = Math.min(currentLevel + 1, SRS_MAX_LEVEL + 1);
        const isMastered = newLevel > SRS_MAX_LEVEL;

        return {
            newLevel,
            nextReviewAt: calculateNextReviewDate(newLevel),
            isMastered,
        };
    } else {
        // User forgot: reset to level 0
        return {
            newLevel: 0,
            nextReviewAt: calculateNextReviewDate(1), // Review tomorrow
            isMastered: false,
        };
    }
}

/**
 * Check if a word is due for review
 * @param nextReviewAt Next review timestamp (can be null for new words)
 */
export function isDueForReview(nextReviewAt: number | null): boolean {
    if (nextReviewAt === null) {
        // New word, always due
        return true;
    }
    return Date.now() >= nextReviewAt;
}

/**
 * Get SRS level label for display
 */
export function getSrsLevelLabel(level: number, isMastered: boolean): string {
    if (isMastered) return '✅ 習得済み';

    const labels = [
        '🆕 新規',
        '📖 覚えかけ',
        '📚 やや定着',
        '💪 定着中',
        '🎯 ほぼ定着',
        '🏆 習得間近',
    ];

    return labels[Math.min(level, labels.length - 1)];
}

/**
 * Get days until next review
 */
export function getDaysUntilReview(nextReviewAt: number | null): number {
    if (nextReviewAt === null) return 0;

    const today = getStartOfToday();
    const daysUntil = Math.ceil((nextReviewAt - today) / MS_PER_DAY);
    return Math.max(0, daysUntil);
}
