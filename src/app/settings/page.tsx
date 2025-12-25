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
        <div style={{ padding: '1rem', maxWidth: '600px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>⚙️ Settings</h1>

            {/* Account Section */}
            <div style={{
                background: 'var(--card-bg)',
                padding: '1.25rem',
                borderRadius: '12px',
                boxShadow: 'var(--shadow)',
                marginBottom: '1rem',
            }}>
                <h2 style={{
                    fontSize: '0.85rem',
                    color: 'var(--text-secondary)',
                    marginBottom: '1rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                }}>
                    Account
                </h2>

                {status === 'loading' ? (
                    <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        Loading...
                    </div>
                ) : session?.user ? (
                    // Logged in state
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            {session.user.image ? (
                                <img
                                    src={session.user.image}
                                    alt={session.user.name || 'User'}
                                    style={{
                                        width: '48px',
                                        height: '48px',
                                        borderRadius: '50%',
                                    }}
                                />
                            ) : (
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '50%',
                                    background: 'var(--primary-color)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                }}>
                                    <User size={24} />
                                </div>
                            )}
                            <div>
                                <p style={{
                                    fontWeight: 600,
                                    color: 'var(--text-color)',
                                    margin: 0,
                                }}>
                                    {session.user.name}
                                </p>
                                <p style={{
                                    fontSize: '0.85rem',
                                    color: 'var(--text-secondary)',
                                    margin: 0,
                                }}>
                                    {session.user.email}
                                </p>
                            </div>
                        </div>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.5rem 0',
                            borderTop: '1px solid var(--border-color)',
                        }}>
                            <span style={{
                                fontSize: '0.8rem',
                                color: 'var(--text-secondary)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                            }}>
                                ✅ Synced across devices
                            </span>
                        </div>
                        <button
                            onClick={() => signOut()}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                padding: '0.75rem 1rem',
                                background: 'transparent',
                                border: '1px solid var(--border-color)',
                                borderRadius: '8px',
                                color: 'var(--text-color)',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                transition: 'background 0.2s',
                            }}
                        >
                            <LogOut size={18} />
                            Sign Out
                        </button>
                    </div>
                ) : (
                    // Not logged in state
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <p style={{
                            fontSize: '0.9rem',
                            color: 'var(--text-secondary)',
                            margin: 0,
                            lineHeight: 1.5,
                        }}>
                            Sign in to sync your vocabulary across all your devices.
                        </p>
                        <button
                            onClick={() => signIn('github')}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                padding: '0.75rem 1rem',
                                background: 'var(--primary-color)',
                                border: 'none',
                                borderRadius: '8px',
                                color: 'white',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                fontWeight: 500,
                                transition: 'opacity 0.2s',
                            }}
                        >
                            <LogIn size={18} />
                            Sign in with GitHub
                        </button>
                    </div>
                )}
            </div>

            {/* Appearance Section */}
            <div style={{
                background: 'var(--card-bg)',
                padding: '1.25rem',
                borderRadius: '12px',
                boxShadow: 'var(--shadow)',
            }}>
                <h2 style={{
                    fontSize: '0.85rem',
                    color: 'var(--text-secondary)',
                    marginBottom: '1rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                }}>
                    Appearance
                </h2>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}>
                    <div>
                        <h3 style={{ fontSize: '1rem', marginBottom: '0.25rem', color: 'var(--text-color)' }}>
                            Dark Mode
                        </h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                            Switch between light and dark themes
                        </p>
                    </div>
                    {/* Toggle Switch */}
                    <button
                        onClick={toggleTheme}
                        role="switch"
                        aria-checked={isDark}
                        style={{
                            width: '52px',
                            height: '28px',
                            borderRadius: '999px',
                            border: 'none',
                            padding: '2px',
                            cursor: 'pointer',
                            background: isDark
                                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                : '#cbd5e0',
                            transition: 'background 0.3s ease',
                            position: 'relative',
                        }}
                    >
                        <span
                            style={{
                                display: 'block',
                                width: '24px',
                                height: '24px',
                                borderRadius: '50%',
                                background: 'white',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                transition: 'transform 0.3s ease',
                                transform: isDark ? 'translateX(24px)' : 'translateX(0)',
                            }}
                        />
                    </button>
                </div>
            </div>

            {/* Danger Zone - Only show for logged in users */}
            {session?.user && (
                <div style={{
                    marginTop: '1rem',
                    background: 'var(--card-bg)',
                    padding: '1.25rem',
                    borderRadius: '12px',
                    boxShadow: 'var(--shadow)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                }}>
                    <h2 style={{
                        fontSize: '0.85rem',
                        color: '#ef4444',
                        marginBottom: '1rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                    }}>
                        Danger Zone
                    </h2>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}>
                        <div>
                            <h3 style={{ fontSize: '1rem', marginBottom: '0.25rem', color: 'var(--text-color)' }}>
                                Delete Account
                            </h3>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                                Permanently delete your account and all data
                            </p>
                        </div>
                        <button
                            onClick={() => setShowDeleteModal(true)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.5rem 1rem',
                                background: 'transparent',
                                border: '1px solid #ef4444',
                                borderRadius: '8px',
                                color: '#ef4444',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                            }}
                        >
                            <Trash2 size={16} />
                            Delete
                        </button>
                    </div>
                </div>
            )}

            {/* Version info */}
            <div style={{
                marginTop: '2rem',
                textAlign: 'center',
                color: 'var(--text-secondary)',
                fontSize: '0.8rem',
            }}>
                <p>English Study App v0.1.0</p>
            </div>

            {/* Delete Account Modal */}
            {showDeleteModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '1rem',
                }}>
                    <div style={{
                        background: 'var(--card-bg)',
                        borderRadius: '16px',
                        padding: '1.5rem',
                        maxWidth: '400px',
                        width: '100%',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            marginBottom: '1rem',
                        }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                background: 'rgba(239, 68, 68, 0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <AlertTriangle size={20} color="#ef4444" />
                            </div>
                            <h3 style={{ margin: 0, color: 'var(--text-color)' }}>
                                Delete Account
                            </h3>
                        </div>

                        <p style={{
                            color: 'var(--text-secondary)',
                            fontSize: '0.9rem',
                            lineHeight: 1.5,
                            marginBottom: '1rem',
                        }}>
                            This action cannot be undone. This will permanently delete:
                        </p>

                        <ul style={{
                            color: 'var(--text-color)',
                            fontSize: '0.9rem',
                            margin: '0 0 1rem 0',
                            paddingLeft: '1.5rem',
                        }}>
                            <li>All your saved vocabulary</li>
                            <li>Your account information</li>
                            <li>All synced data</li>
                        </ul>

                        <p style={{
                            color: 'var(--text-secondary)',
                            fontSize: '0.85rem',
                            marginBottom: '0.5rem',
                        }}>
                            Type <strong>delete</strong> to confirm:
                        </p>

                        <input
                            type="text"
                            value={deleteConfirmText}
                            onChange={(e) => setDeleteConfirmText(e.target.value)}
                            placeholder="delete"
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '1px solid var(--border-color)',
                                borderRadius: '8px',
                                fontSize: '0.9rem',
                                marginBottom: '1rem',
                                background: 'var(--card-bg)',
                                color: 'var(--text-color)',
                            }}
                        />

                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setDeleteConfirmText('');
                                }}
                                style={{
                                    flex: 1,
                                    padding: '0.75rem',
                                    background: 'transparent',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '8px',
                                    color: 'var(--text-color)',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem',
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteAccount}
                                disabled={deleteConfirmText !== 'delete' || isPending}
                                style={{
                                    flex: 1,
                                    padding: '0.75rem',
                                    background: deleteConfirmText === 'delete' ? '#ef4444' : '#ccc',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: 'white',
                                    cursor: deleteConfirmText === 'delete' ? 'pointer' : 'not-allowed',
                                    fontSize: '0.9rem',
                                    fontWeight: 500,
                                }}
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
