import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core';
import type { AdapterAccountType } from 'next-auth/adapters';

// NextAuth.js required tables
export const users = sqliteTable('user', {
    id: text('id')
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    name: text('name'),
    email: text('email').unique(),
    emailVerified: integer('emailVerified', { mode: 'timestamp_ms' }),
    image: text('image'),
});

export const accounts = sqliteTable(
    'account',
    {
        userId: text('userId')
            .notNull()
            .references(() => users.id, { onDelete: 'cascade' }),
        type: text('type').$type<AdapterAccountType>().notNull(),
        provider: text('provider').notNull(),
        providerAccountId: text('providerAccountId').notNull(),
        refresh_token: text('refresh_token'),
        access_token: text('access_token'),
        expires_at: integer('expires_at'),
        token_type: text('token_type'),
        scope: text('scope'),
        id_token: text('id_token'),
        session_state: text('session_state'),
    },
    (account) => [
        primaryKey({ columns: [account.provider, account.providerAccountId] }),
    ]
);

export const sessions = sqliteTable('session', {
    sessionToken: text('sessionToken').primaryKey(),
    userId: text('userId')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    expires: integer('expires', { mode: 'timestamp_ms' }).notNull(),
});

export const verificationTokens = sqliteTable(
    'verificationToken',
    {
        identifier: text('identifier').notNull(),
        token: text('token').notNull(),
        expires: integer('expires', { mode: 'timestamp_ms' }).notNull(),
    },
    (verificationToken) => [
        primaryKey({
            columns: [verificationToken.identifier, verificationToken.token],
        }),
    ]
);

// Application tables
export const vocabularyEntries = sqliteTable('vocabulary_entry', {
    id: text('id')
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    word: text('word').notNull(),
    phonetic: text('phonetic').notNull(),
    meaning: text('meaning').notNull(),
    example: text('example').notNull(),
    exampleJp: text('example_jp').notNull(),
    timestamp: integer('timestamp', { mode: 'number' }).notNull(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).default(
        sql`(unixepoch() * 1000)`
    ),
    // SRS (Spaced Repetition System) fields
    srsLevel: integer('srs_level').default(0),
    nextReviewAt: integer('next_review_at', { mode: 'number' }),
    lastReviewedAt: integer('last_reviewed_at', { mode: 'number' }),
    reviewCount: integer('review_count').default(0),
    isMastered: integer('is_mastered', { mode: 'boolean' }).default(false),
});

// Push notification subscriptions
export const pushSubscriptions = sqliteTable('push_subscription', {
    id: text('id')
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    endpoint: text('endpoint').notNull(),
    p256dh: text('p256dh').notNull(),
    auth: text('auth').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).default(
        sql`(unixepoch() * 1000)`
    ),
});

// Type exports
export type User = typeof users.$inferSelect;
export type VocabularyEntry = typeof vocabularyEntries.$inferSelect;
export type NewVocabularyEntry = typeof vocabularyEntries.$inferInsert;
export type PushSubscription = typeof pushSubscriptions.$inferSelect;

