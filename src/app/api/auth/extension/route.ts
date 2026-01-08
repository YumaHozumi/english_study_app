import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users, accounts } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { SignJWT } from 'jose';

// GitHub OAuth設定（既存のOAuth Appと共用）
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const JWT_SECRET = new TextEncoder().encode(
    process.env.EXTENSION_JWT_SECRET || 'your-secret-key-change-in-production'
);

// CORS ヘッダーを追加するヘルパー（Chrome拡張機能のみ許可）
function corsHeaders(request: NextRequest): HeadersInit {
    const origin = request.headers.get('Origin') || '';

    // chrome-extension:// からのリクエストのみ許可
    if (origin.startsWith('chrome-extension://')) {
        return {
            'Access-Control-Allow-Origin': origin,
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        };
    }

    // その他のオリジンは許可しない（ヘッダーなし）
    return {};
}

// プリフライトリクエスト（OPTIONS）のハンドラー
export async function OPTIONS(request: NextRequest) {
    return new NextResponse(null, {
        status: 204,
        headers: corsHeaders(request),
    });
}

interface GitHubTokenResponse {
    access_token: string;
    token_type: string;
    scope: string;
}

interface GitHubUser {
    id: number;
    login: string;
    name: string | null;
    email: string | null;
    avatar_url: string;
}

export async function POST(request: NextRequest) {
    try {
        const { code, codeVerifier } = await request.json();

        if (!code) {
            return NextResponse.json(
                { error: '認証コードが必要です' },
                { status: 400, headers: corsHeaders(request) }
            );
        }

        // GitHubでコードをアクセストークンに交換
        const tokenResponse = await fetch(
            'https://github.com/login/oauth/access_token',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({
                    client_id: GITHUB_CLIENT_ID,
                    client_secret: GITHUB_CLIENT_SECRET,
                    code,
                    code_verifier: codeVerifier, // PKCE用
                }),
            }
        );

        const tokenData: GitHubTokenResponse = await tokenResponse.json();

        if (!tokenData.access_token) {
            return NextResponse.json(
                { error: 'アクセストークンの取得に失敗しました' },
                { status: 401, headers: corsHeaders(request) }
            );
        }

        // GitHubユーザー情報を取得
        const userResponse = await fetch('https://api.github.com/user', {
            headers: {
                Authorization: `Bearer ${tokenData.access_token}`,
            },
        });

        const githubUser: GitHubUser = await userResponse.json();

        // 既存ユーザーを検索（GitHubアカウント経由）
        const existingAccount = await db
            .select()
            .from(accounts)
            .where(eq(accounts.providerAccountId, String(githubUser.id)))
            .get();

        let userId: string;

        if (existingAccount) {
            // 既存ユーザーを使用
            userId = existingAccount.userId;
        } else {
            // 新規ユーザーを作成
            const newUser = await db
                .insert(users)
                .values({
                    id: crypto.randomUUID(),
                    name: githubUser.name || githubUser.login,
                    email: githubUser.email,
                    image: githubUser.avatar_url,
                })
                .returning()
                .get();

            userId = newUser.id;

            // アカウント関連付けを作成
            await db.insert(accounts).values({
                userId,
                type: 'oauth',
                provider: 'github',
                providerAccountId: String(githubUser.id),
                access_token: tokenData.access_token,
                token_type: tokenData.token_type,
                scope: tokenData.scope,
            });
        }

        // 拡張機能用のJWTトークンを発行
        const token = await new SignJWT({ sub: userId })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('7d')
            .sign(JWT_SECRET);

        return NextResponse.json(
            {
                token,
                user: {
                    id: userId,
                    name: githubUser.name || githubUser.login,
                    image: githubUser.avatar_url,
                },
            },
            { headers: corsHeaders(request) }
        );
    } catch (error) {
        console.error('Extension auth error:', error);
        return NextResponse.json(
            { error: '認証処理中にエラーが発生しました' },
            { status: 500, headers: corsHeaders(request) }
        );
    }
}
