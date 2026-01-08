import { NextResponse, type NextRequest } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Upstash Redis クライアント
const redis = Redis.fromEnv();

// レートリミッター: 1分間に10リクエストまで
const ratelimit = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(10, '1 m'),
    analytics: true,
});

export async function proxy(request: NextRequest) {
    // APIルートに対してのみ適用
    if (request.nextUrl.pathname.startsWith('/api/')) {
        const host = request.headers.get('host') || '';

        // 認証コールバックパスはオリジン/リファラー検証をスキップ
        // (OAuth プロバイダーからのリダイレクトは外部リファラーを持つため)
        const isAuthCallback = request.nextUrl.pathname.startsWith('/api/auth/');

        // Chrome拡張機能からのリクエストを許可
        const origin = request.headers.get('origin');
        const isChromeExtension = origin?.startsWith('chrome-extension://');

        if (isChromeExtension) {
            // プリフライトリクエスト（OPTIONS）の場合
            if (request.method === 'OPTIONS') {
                return new NextResponse(null, {
                    status: 204,
                    headers: {
                        'Access-Control-Allow-Origin': origin!,
                        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                    },
                });
            }

            // 通常のリクエストはCORSヘッダー付きで続行
            const response = NextResponse.next();
            response.headers.set('Access-Control-Allow-Origin', origin!);
            response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            return response;
        }

        // 本番環境でのオリジン検証（認証コールバック以外）
        if (process.env.NODE_ENV === 'production' && !isAuthCallback) {
            const referer = request.headers.get('referer');

            // ブラウザからのリクエストでオリジンが不正な場合はブロック
            if (origin && !origin.includes(host)) {
                return NextResponse.json(
                    { error: 'Forbidden: Invalid origin' },
                    { status: 403 }
                );
            }

            // Refererも検証（オリジンがない場合のフォールバック）
            if (!origin && referer && !referer.includes(host)) {
                return NextResponse.json(
                    { error: 'Forbidden: Invalid referer' },
                    { status: 403 }
                );
            }
        }

        // レート制限（開発環境でも適用するが、Upstash未設定時はスキップ）
        if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
            // IPアドレスを識別子として使用
            const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
                request.headers.get('x-real-ip') ||
                '127.0.0.1';

            const { success, limit, reset, remaining } = await ratelimit.limit(ip);

            if (!success) {
                return NextResponse.json(
                    { error: 'Too Many Requests. Please try again later.' },
                    {
                        status: 429,
                        headers: {
                            'X-RateLimit-Limit': limit.toString(),
                            'X-RateLimit-Remaining': remaining.toString(),
                            'X-RateLimit-Reset': reset.toString(),
                        },
                    }
                );
            }
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: '/api/:path*',
};
