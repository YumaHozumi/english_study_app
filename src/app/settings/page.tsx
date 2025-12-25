'use client';

import { useState, useTransition } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useSession, signIn, signOut } from 'next-auth/react';
import { LogIn, LogOut, User, Trash2, AlertTriangle } from 'lucide-react';
import { deleteAccount } from '@/actions/account';

export default function SettingsPage() {
    const { theme, toggleTheme } = useTheme();
    const { data: session, status } = useSession();
    const isDark = theme === 'dark';
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    const [isPending, startTransition] = useTransition();

    const handleDeleteAccount = () => {
        if (deleteConfirmText !== 'delete') return;

        startTransition(async () => {
            try {
                await deleteAccount();
                signOut({ callbackUrl: '/' });
            } catch (error) {
                console.error('Failed to delete account:', error);
                alert('Failed to delete account. Please try again.');
            }
        });
    };

    return (
        <div className="p-4 max-w-[600px] mx-auto">
            <h1 className="text-2xl mb-6">⚙️ Settings</h1>

            {/* Account Section */}
            <div className="bg-[var(--card-bg)] p-5 rounded-xl shadow-md mb-4">
                <h2 className="text-sm text-[var(--text-secondary)] mb-4 uppercase tracking-wide">
                    Account
                </h2>

                {status === 'loading' ? (
                    <div className="p-4 text-center text-[var(--text-secondary)]">
                        Loading...
                    </div>
                ) : session?.user ? (
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-4">
                            {session.user.image ? (
                                <img
                                    src={session.user.image}
                                    alt={session.user.name || 'User'}
                                    className="w-12 h-12 rounded-full"
                                />
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-[var(--primary-color)] flex items-center justify-center text-white">
                                    <User size={24} />
                                </div>
                            )}
                            <div>
                                <p className="font-semibold text-[var(--text-color)] m-0">
                                    {session.user.name}
                                </p>
                                <p className="text-sm text-[var(--text-secondary)] m-0">
                                    {session.user.email}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 py-2 border-t border-[var(--border-color)]">
                            <span className="text-xs text-[var(--text-secondary)] flex items-center gap-1">
                                ✅ Synced across devices
                            </span>
                        </div>
                        <button
                            onClick={() => signOut()}
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-transparent border border-[var(--border-color)] rounded-lg text-[var(--text-color)] cursor-pointer text-sm transition-colors hover:bg-[var(--border-color)]/20"
                        >
                            <LogOut size={18} />
                            Sign Out
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        <p className="text-sm text-[var(--text-secondary)] m-0 leading-relaxed">
                            Sign in to sync your vocabulary across all your devices.
                        </p>
                        <button
                            onClick={() => signIn('github')}
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-[var(--primary-color)] border-none rounded-lg text-white cursor-pointer text-sm font-medium transition-opacity hover:opacity-90"
                        >
                            <LogIn size={18} />
                            Sign in with GitHub
                        </button>
                    </div>
                )}
            </div>

            {/* Appearance Section */}
            <div className="bg-[var(--card-bg)] p-5 rounded-xl shadow-md">
                <h2 className="text-sm text-[var(--text-secondary)] mb-4 uppercase tracking-wide">
                    Appearance
                </h2>
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="text-base mb-1 text-[var(--text-color)]">
                            Dark Mode
                        </h3>
                        <p className="text-sm text-[var(--text-secondary)] m-0">
                            Switch between light and dark themes
                        </p>
                    </div>
                    <button
                        onClick={toggleTheme}
                        role="switch"
                        aria-checked={isDark}
                        className={`w-[52px] h-7 rounded-full border-none p-0.5 cursor-pointer relative transition-colors duration-300 ${isDark ? 'bg-gradient-to-br from-indigo-500 to-purple-600' : 'bg-gray-300'
                            }`}
                    >
                        <span
                            className={`block w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-300 ${isDark ? 'translate-x-6' : 'translate-x-0'
                                }`}
                        />
                    </button>
                </div>
            </div>

            {/* Danger Zone */}
            {session?.user && (
                <div className="mt-4 bg-[var(--card-bg)] p-5 rounded-xl shadow-md border border-red-500/30">
                    <h2 className="text-sm text-red-500 mb-4 uppercase tracking-wide">
                        Danger Zone
                    </h2>
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-base mb-1 text-[var(--text-color)]">
                                Delete Account
                            </h3>
                            <p className="text-sm text-[var(--text-secondary)] m-0">
                                Permanently delete your account and all data
                            </p>
                        </div>
                        <button
                            onClick={() => setShowDeleteModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-transparent border border-red-500 rounded-lg text-red-500 cursor-pointer text-sm"
                        >
                            <Trash2 size={16} />
                            Delete
                        </button>
                    </div>
                </div>
            )}

            {/* Version info */}
            <div className="mt-8 text-center text-[var(--text-secondary)] text-xs">
                <p>English Study App v0.1.0</p>
            </div>

            {/* Delete Account Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-4">
                    <div className="bg-[var(--card-bg)] rounded-2xl p-6 max-w-[400px] w-full shadow-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                                <AlertTriangle size={20} className="text-red-500" />
                            </div>
                            <h3 className="m-0 text-[var(--text-color)]">
                                Delete Account
                            </h3>
                        </div>

                        <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-4">
                            This action cannot be undone. This will permanently delete:
                        </p>

                        <ul className="text-[var(--text-color)] text-sm mb-4 pl-6 list-disc">
                            <li>All your saved vocabulary</li>
                            <li>Your account information</li>
                            <li>All synced data</li>
                        </ul>

                        <p className="text-[var(--text-secondary)] text-sm mb-2">
                            Type <strong>delete</strong> to confirm:
                        </p>

                        <input
                            type="text"
                            value={deleteConfirmText}
                            onChange={(e) => setDeleteConfirmText(e.target.value)}
                            placeholder="delete"
                            className="w-full px-3 py-3 border border-[var(--border-color)] rounded-lg text-sm mb-4 bg-[var(--card-bg)] text-[var(--text-color)] focus:outline-none focus:ring-2 focus:ring-red-500"
                        />

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setDeleteConfirmText('');
                                }}
                                className="flex-1 py-3 bg-transparent border border-[var(--border-color)] rounded-lg text-[var(--text-color)] cursor-pointer text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteAccount}
                                disabled={deleteConfirmText !== 'delete' || isPending}
                                className={`flex-1 py-3 border-none rounded-lg text-white text-sm font-medium ${deleteConfirmText === 'delete'
                                        ? 'bg-red-500 cursor-pointer'
                                        : 'bg-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                {isPending ? 'Deleting...' : 'Delete Account'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
