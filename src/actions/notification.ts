'use server';

import { auth } from '@/lib/auth';
import { db } from '@/db';
import { pushSubscriptions } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

interface PushSubscriptionData {
    endpoint: string;
    keys: {
        p256dh: string;
        auth: string;
    };
}

export async function savePushSubscription(subscription: PushSubscriptionData) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error('Unauthorized');
    }

    const existing = await db
        .select()
        .from(pushSubscriptions)
        .where(
            and(
                eq(pushSubscriptions.userId, session.user.id),
                eq(pushSubscriptions.endpoint, subscription.endpoint)
            )
        )
        .limit(1);

    if (existing.length > 0) {
        await db
            .update(pushSubscriptions)
            .set({
                p256dh: subscription.keys.p256dh,
                auth: subscription.keys.auth,
            })
            .where(
                and(
                    eq(pushSubscriptions.userId, session.user.id),
                    eq(pushSubscriptions.endpoint, subscription.endpoint)
                )
            );
    } else {
        await db.insert(pushSubscriptions).values({
            userId: session.user.id,
            endpoint: subscription.endpoint,
            p256dh: subscription.keys.p256dh,
            auth: subscription.keys.auth,
        });
    }

    return { success: true };
}

export async function deletePushSubscription(endpoint: string) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error('Unauthorized');
    }

    await db
        .delete(pushSubscriptions)
        .where(
            and(
                eq(pushSubscriptions.userId, session.user.id),
                eq(pushSubscriptions.endpoint, endpoint)
            )
        );

    return { success: true };
}

export async function hasPushSubscription(endpoint: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return false;
    }

    const existing = await db
        .select()
        .from(pushSubscriptions)
        .where(
            and(
                eq(pushSubscriptions.userId, session.user.id),
                eq(pushSubscriptions.endpoint, endpoint)
            )
        )
        .limit(1);

    return existing.length > 0;
}
