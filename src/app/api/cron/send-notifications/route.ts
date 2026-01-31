import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';
import { db } from '@/db';
import { pushSubscriptions, users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getDueWordCount } from '@/db/queries';

// Configure VAPID keys
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@example.com';

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

export async function GET(request: NextRequest) {
    // Verify that this is a legitimate cron request
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
        return NextResponse.json({ error: 'VAPID keys not configured' }, { status: 500 });
    }

    try {
        // Get all users with push subscriptions
        const subscriptions = await db
            .select({
                subscription: pushSubscriptions,
                user: users,
            })
            .from(pushSubscriptions)
            .innerJoin(users, eq(pushSubscriptions.userId, users.id));

        let sentCount = 0;
        let errorCount = 0;

        for (const { subscription, user } of subscriptions) {
            // Check if this user has words due for review
            const wordCount = await getDueWordCount(user.id);

            if (wordCount === 0) {
                continue; // No words due, skip this user
            }

            // Send push notification
            const payload = JSON.stringify({
                title: '📚 復習の時間です！',
                body: `${wordCount}語の復習が待っています`,
                url: '/study',
            });

            try {
                await webpush.sendNotification(
                    {
                        endpoint: subscription.endpoint,
                        keys: {
                            p256dh: subscription.p256dh,
                            auth: subscription.auth,
                        },
                    },
                    payload
                );
                sentCount++;
            } catch (error) {
                console.error(`Failed to send notification to user ${user.id}:`, error);
                errorCount++;

                // If subscription is invalid, remove it
                if (error instanceof webpush.WebPushError && error.statusCode === 410) {
                    await db
                        .delete(pushSubscriptions)
                        .where(eq(pushSubscriptions.id, subscription.id));
                }
            }
        }

        return NextResponse.json({
            success: true,
            sent: sentCount,
            errors: errorCount,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Cron job error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
