'use client';

import { useState, useEffect, useTransition } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, BookOpen, CheckCircle, Calendar, Flame, TrendingUp } from 'lucide-react';
import { getStudyStats, getReviewHistory, type StudyStats, type DailyReviewData } from '@/actions/stats';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';

export default function StatsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [stats, setStats] = useState<StudyStats | null>(null);
    const [history, setHistory] = useState<DailyReviewData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        if (status === 'loading') return;

        if (!session?.user) {
            setIsLoading(false);
            return;
        }

        startTransition(async () => {
            try {
                const [statsData, historyData] = await Promise.all([
                    getStudyStats(),
                    getReviewHistory(7),
                ]);
                setStats(statsData);
                setHistory(historyData);
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            } finally {
                setIsLoading(false);
            }
        });
    }, [session, status]);

    if (status === 'loading' || isLoading || isPending) {
        return (
            <div className="p-8 text-center text-[var(--text-secondary)]">
                <p>Loading...</p>
            </div>
        );
    }

    if (!session?.user) {
        return (
            <div className="p-8 text-center text-[var(--text-secondary)]">
                <h2 className="text-lg mb-2">ログインが必要です</h2>
                <p className="mb-4">統計を確認するにはログインしてください</p>
                <button
                    onClick={() => router.push('/settings')}
                    className="px-6 py-3 bg-indigo-500 text-white border-none rounded-lg cursor-pointer"
                >
                    設定へ
                </button>
            </div>
        );
    }

    // Format date for display (MM/DD)
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return `${date.getMonth() + 1}/${date.getDate()}`;
    };

    // Get day of week in Japanese
    const getDayOfWeek = (dateStr: string) => {
        const days = ['日', '月', '火', '水', '木', '金', '土'];
        const date = new Date(dateStr);
        return days[date.getDay()];
    };

    return (
        <div className="p-4 max-w-[600px] mx-auto">
            <header className="mb-6 flex items-center gap-4">
                <button
                    onClick={() => router.back()}
                    className="bg-transparent border-none cursor-pointer p-2 flex items-center"
                >
                    <ArrowLeft size={24} className="text-[var(--text-secondary)]" />
                </button>
                <div>
                    <h1 className="text-xl m-0">📊 学習統計</h1>
                    <p className="text-[var(--text-secondary)] text-sm m-0">
                        Your progress at a glance
                    </p>
                </div>
            </header>

            {stats && (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        {/* Total Words */}
                        <div className="bg-[var(--card-bg)] p-4 rounded-xl shadow-md">
                            <div className="flex items-center gap-2 mb-2">
                                <BookOpen size={18} className="text-indigo-500" />
                                <span className="text-sm text-[var(--text-secondary)]">総単語数</span>
                            </div>
                            <p className="text-2xl font-bold m-0">{stats.totalWords}</p>
                        </div>

                        {/* Mastery Rate */}
                        <div className="bg-[var(--card-bg)] p-4 rounded-xl shadow-md">
                            <div className="flex items-center gap-2 mb-2">
                                <CheckCircle size={18} className="text-green-500" />
                                <span className="text-sm text-[var(--text-secondary)]">習得率</span>
                            </div>
                            <p className="text-2xl font-bold m-0">{stats.masteryRate}%</p>
                            <p className="text-xs text-[var(--text-secondary)] m-0">
                                {stats.masteredWords} / {stats.totalWords}
                            </p>
                        </div>

                        {/* Streak */}
                        <div className="bg-[var(--card-bg)] p-4 rounded-xl shadow-md">
                            <div className="flex items-center gap-2 mb-2">
                                <Flame size={18} className="text-orange-500" />
                                <span className="text-sm text-[var(--text-secondary)]">連続学習</span>
                            </div>
                            <p className="text-2xl font-bold m-0">{stats.streakDays}日</p>
                        </div>

                        {/* Today's Reviews */}
                        <div className="bg-[var(--card-bg)] p-4 rounded-xl shadow-md">
                            <div className="flex items-center gap-2 mb-2">
                                <Calendar size={18} className="text-blue-500" />
                                <span className="text-sm text-[var(--text-secondary)]">今日の復習</span>
                            </div>
                            <p className="text-2xl font-bold m-0">{stats.todayReviews}</p>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="bg-[var(--card-bg)] p-4 rounded-xl shadow-md mb-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">習得進捗</span>
                            <span className="text-sm text-[var(--text-secondary)]">
                                {stats.masteredWords} / {stats.totalWords} 習得済み
                            </span>
                        </div>
                        <div className="w-full h-3 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                                style={{ width: `${stats.masteryRate}%` }}
                            />
                        </div>
                        <div className="flex justify-between mt-2 text-xs text-[var(--text-secondary)]">
                            <span>学習中: {stats.learningWords}語</span>
                            <span>習得済み: {stats.masteredWords}語</span>
                        </div>
                    </div>

                    {/* Weekly Chart */}
                    <div className="bg-[var(--card-bg)] p-4 rounded-xl shadow-md">
                        <div className="flex items-center gap-2 mb-4">
                            <TrendingUp size={18} className="text-indigo-500" />
                            <span className="font-medium">過去7日間の学習</span>
                        </div>

                        {history.length > 0 ? (
                            <div className="h-[200px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <XAxis
                                            dataKey="date"
                                            tickFormatter={(date) => `${formatDate(date)}\n${getDayOfWeek(date)}`}
                                            tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <YAxis
                                            tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
                                            axisLine={false}
                                            tickLine={false}
                                            allowDecimals={false}
                                        />
                                        <Bar
                                            dataKey="count"
                                            radius={[4, 4, 0, 0]}
                                        >
                                            {history.map((entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={entry.count > 0 ? '#6366f1' : '#374151'}
                                                />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="h-[200px] flex items-center justify-center text-[var(--text-secondary)]">
                                まだデータがありません
                            </div>
                        )}
                    </div>

                    {/* Total Reviews */}
                    <div className="mt-6 text-center text-[var(--text-secondary)] text-sm">
                        <p>累計復習回数: {stats.totalReviews}回</p>
                    </div>
                </>
            )}
        </div>
    );
}
