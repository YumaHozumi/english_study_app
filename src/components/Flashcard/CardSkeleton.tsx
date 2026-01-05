import { motion } from 'framer-motion';

export const CardSkeleton = () => {
    return (
        <div className="relative w-full max-w-[400px] mx-auto" style={{ minHeight: '450px' }}>
            {/* Undoボタンのスペース */}
            <div className="w-full flex justify-end pr-4 mb-4" style={{ height: '40px' }} />

            {/* スケルトンカード */}
            <div className="relative" style={{ minHeight: '400px' }}>
                <motion.div
                    className="bg-[var(--card-bg)]"
                    style={{
                        width: '100%',
                        maxWidth: '400px',
                        minHeight: '400px',
                        borderRadius: '20px',
                        boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        marginLeft: 'auto',
                        marginRight: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        padding: 'clamp(1rem, 4vw, 2rem)',
                        paddingTop: 'clamp(3rem, 8vh, 5rem)',
                    }}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    {/* タイトルプレースホルダー */}
                    <div
                        className="skeleton-pulse"
                        style={{
                            width: '60%',
                            height: '36px',
                            borderRadius: '8px',
                            marginBottom: '12px',
                        }}
                    />

                    {/* 発音プレースホルダー */}
                    <div
                        className="skeleton-pulse"
                        style={{
                            width: '40%',
                            height: '24px',
                            borderRadius: '6px',
                            marginBottom: '32px',
                        }}
                    />

                    {/* 意味セクション */}
                    <div className="w-full text-left mb-6">
                        <div
                            className="skeleton-pulse"
                            style={{
                                width: '80px',
                                height: '14px',
                                borderRadius: '4px',
                                marginBottom: '8px',
                            }}
                        />
                        <div
                            className="skeleton-pulse"
                            style={{
                                width: '100%',
                                height: '20px',
                                borderRadius: '6px',
                                marginBottom: '8px',
                            }}
                        />
                        <div
                            className="skeleton-pulse"
                            style={{
                                width: '85%',
                                height: '20px',
                                borderRadius: '6px',
                            }}
                        />
                    </div>

                    {/* 例文セクション */}
                    <div className="w-full text-left">
                        <div
                            className="skeleton-pulse"
                            style={{
                                width: '80px',
                                height: '14px',
                                borderRadius: '4px',
                                marginBottom: '8px',
                            }}
                        />
                        <div
                            className="skeleton-pulse"
                            style={{
                                width: '100%',
                                height: '16px',
                                borderRadius: '6px',
                                marginBottom: '8px',
                            }}
                        />
                        <div
                            className="skeleton-pulse"
                            style={{
                                width: '70%',
                                height: '14px',
                                borderRadius: '6px',
                            }}
                        />
                    </div>

                    {/* ローディングメッセージ */}
                    <div className="mt-auto pt-8 text-center">
                        <motion.p
                            className="text-[var(--text-tertiary)] text-sm"
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        >
                            AIが翻訳・解析中...
                        </motion.p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
