'use client';

import { useSession } from 'next-auth/react';
import { AuthButton } from '@/components/AuthButton';
import './login.css';

export default function LoginPage() {
    const { data: session, status } = useSession();

    if (status === 'loading') {
        return (
            <div className="login-page">
                <div className="login-card">
                    <div className="login-loading">読み込み中...</div>
                </div>
            </div>
        );
    }

    if (session) {
        return (
            <div className="login-page">
                <div className="login-card">
                    <div className="login-success">
                        <img
                            src={session.user?.image || ''}
                            alt={session.user?.name || 'User'}
                            className="login-avatar"
                        />
                        <h2>ログイン済み</h2>
                        <p>{session.user?.name}</p>
                        <p className="login-email">{session.user?.email}</p>
                        <AuthButton />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="login-page">
            <div className="login-card">
                <h2 className="login-title">ログイン</h2>
                <p className="login-description">
                    ログインすると、複数のデバイスで単語帳を同期できます。
                </p>
                <AuthButton />
            </div>
        </div>
    );
}
