import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { pushSubscriptions } from '@/db/schema';
import { eq } from 'drizzle-orm';

// Configure VAPID keys
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@example.com';

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

export async function POST(request: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
        return NextResponse.json({ error: 'VAPID keys not configured' }, { status: 500 });
    }

    try {
        // Get user's push subscription
        const subscriptions = await db
            .select()
            .from(pushSubscriptions)
            .where(eq(pushSubscriptions.userId, session.user.id));

        if (subscriptions.length === 0) {
            return NextResponse.json({ error: 'No subscription found' }, { status: 404 });
        }

        const subscription = subscriptions[0];

        // Send test notification
        const payload = JSON.stringify({
            title: '🧪 テスト通知',
            body: '通知が正しく設定されています！',
            url: '/settings',
        });

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

        return NextResponse.json({ success: true, message: 'Test notification sent!' });
    } catch (error) {
        console.error('Failed to send test notification:', error);
        return NextResponse.json(
            { error: 'Failed to send notification' },
            { status: 500 }
        );
    }
}
