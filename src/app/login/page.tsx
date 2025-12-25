'use client';

import { useSession } from 'next-auth/react';
import { AuthButton } from '@/components/AuthButton';

export default function LoginPage() {
    const { data: session, status } = useSession();

    if (status === 'loading') {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="bg-[var(--card-bg)] p-8 rounded-2xl shadow-lg text-center">
                    <p className="text-[var(--text-secondary)]">読み込み中...</p>
                </div>
            </div>
        );
    }

    if (session) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="bg-[var(--card-bg)] p-8 rounded-2xl shadow-lg text-center">
                    <img
                        src={session.user?.image || ''}
                        alt={session.user?.name || 'User'}
                        className="w-20 h-20 rounded-full mx-auto mb-4"
                    />
                    <h2 className="text-xl mb-2 text-[var(--text-color)]">ログイン済み</h2>
                    <p className="text-[var(--text-color)]">{session.user?.name}</p>
                    <p className="text-sm text-[var(--text-secondary)] mb-4">{session.user?.email}</p>
                    <AuthButton />
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="bg-[var(--card-bg)] p-8 rounded-2xl shadow-lg text-center max-w-sm w-full mx-4">
                <h2 className="text-2xl mb-2 text-[var(--text-color)]">ログイン</h2>
                <p className="text-sm text-[var(--text-secondary)] mb-6">
                    ログインすると、複数のデバイスで単語帳を同期できます。
                </p>
                <AuthButton />
            </div>
        </div>
    );
}
