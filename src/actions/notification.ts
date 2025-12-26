'use server';

import { auth } from '@/lib/auth';
import { db } from '@/db';
import { pushSubscriptions } from '@/db/schema';
import { eq } from 'drizzle-orm';

interface PushSubscriptionData {
    endpoint: string;
    keys: {
        p256dh: string;
        auth: string;
    };
}

/**
 * Save push subscription to database
 */
export async function savePushSubscription(subscription: PushSubscriptionData) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error('Unauthorized');
    }

    // Check if subscription already exists for this user
    const existing = await db
        .select()
        .from(pushSubscriptions)
        .where(eq(pushSubscriptions.userId, session.user.id))
        .limit(1);

    if (existing.length > 0) {
        // Update existing subscription
        await db
            .update(pushSubscriptions)
            .set({
                endpoint: subscription.endpoint,
                p256dh: subscription.keys.p256dh,
                auth: subscription.keys.auth,
            })
            .where(eq(pushSubscriptions.userId, session.user.id));
    } else {
        // Create new subscription
        await db.insert(pushSubscriptions).values({
            userId: session.user.id,
            endpoint: subscription.endpoint,
            p256dh: subscription.keys.p256dh,
            auth: subscription.keys.auth,
        });
    }

    return { success: true };
}

/**
 * Delete push subscription from database
 */
export async function deletePushSubscription() {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error('Unauthorized');
    }

    await db
        .delete(pushSubscriptions)
        .where(eq(pushSubscriptions.userId, session.user.id));

    return { success: true };
}

/**
 * Check if user has an active push subscription
 */
export async function hasPushSubscription() {
    const session = await auth();
    if (!session?.user?.id) {
        return false;
    }

    const existing = await db
        .select()
        .from(pushSubscriptions)
        .where(eq(pushSubscriptions.userId, session.user.id))
        .limit(1);

    return existing.length > 0;
}
