'use server';

import { auth } from '@/lib/auth';
import { db } from '@/db';
import { users, accounts, sessions, vocabularyEntries } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function deleteAccount() {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error('Unauthorized');
    }

    const userId = session.user.id;

    // Delete all user data in order (respecting foreign key constraints)
    // 1. Delete vocabulary entries
    await db.delete(vocabularyEntries).where(eq(vocabularyEntries.userId, userId));

    // 2. Delete sessions
    await db.delete(sessions).where(eq(sessions.userId, userId));

    // 3. Delete accounts (OAuth connections)
    await db.delete(accounts).where(eq(accounts.userId, userId));

    // 4. Delete user
    await db.delete(users).where(eq(users.id, userId));

    return { success: true };
}
