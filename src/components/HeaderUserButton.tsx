'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { User } from 'lucide-react';

export function HeaderUserButton() {
    const { data: session, status } = useSession();

    if (status === 'loading') {
        return (
            <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'var(--border-color)',
                animation: 'pulse 1.5s ease-in-out infinite',
            }} />
        );
    }

    return (
        <Link
            href="/settings"
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                textDecoration: 'none',
                transition: 'transform 0.2s, box-shadow 0.2s',
                overflow: 'hidden',
            }}
            title={session?.user ? session.user.name || 'Account' : 'Sign in'}
        >
            {session?.user?.image ? (
                <img
                    src={session.user.image}
                    alt={session.user.name || 'User'}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                    }}
                />
            ) : (
                <div style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: session?.user
                        ? 'var(--primary-color)'
                        : 'var(--border-color)',
                    color: session?.user ? 'white' : 'var(--text-secondary)',
                }}>
                    <User size={18} />
                </div>
            )}
        </Link>
    );
}
