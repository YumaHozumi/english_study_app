'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { User } from 'lucide-react';

export function HeaderUserButton() {
    const { data: session, status } = useSession();

    if (status === 'loading') {
        return (
            <div className="w-8 h-8 rounded-full bg-[var(--border-color)] animate-pulse" />
        );
    }

    return (
        <Link
            href="/settings"
            className="flex items-center justify-center w-8 h-8 rounded-full no-underline transition-transform duration-200 overflow-hidden outline-none"
            style={{ WebkitTapHighlightColor: 'transparent' }}
            title={session?.user ? session.user.name || 'Account' : 'Sign in'}
        >
            {session?.user?.image ? (
                <img
                    src={session.user.image}
                    alt={session.user.name || 'User'}
                    className="w-full h-full object-cover"
                />
            ) : (
                <div className={`w-full h-full flex items-center justify-center ${session?.user
                        ? 'bg-[var(--primary-color)] text-white'
                        : 'bg-[var(--border-color)] text-[var(--text-secondary)]'
                    }`}>
                    <User size={18} />
                </div>
            )}
        </Link>
    );
}
