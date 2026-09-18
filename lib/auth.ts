import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { UserSession } from '@/types';

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'resumeforge-ai-super-secret-jwt-key-2026-production'
);

const TOKEN_NAME = 'resumeforge_token';

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

export async function createSessionToken(user: UserSession): Promise<string> {
  return await new SignJWT({ id: user.id, email: user.email, name: user.name })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET_KEY);
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function removeAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.set(TOKEN_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

export async function getCurrentUser(): Promise<UserSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(TOKEN_NAME)?.value;
    if (!token) return null;

    const verified = await jwtVerify(token, SECRET_KEY);
    const payload = verified.payload as unknown as UserSession;
    if (!payload?.id) return null;

    // Verify user exists in SQLite database (to prevent foreign key constraint failures)
    const { db } = await import('@/lib/db');
    let dbUser = await db.user.findUnique({ where: { id: payload.id } });

    if (!dbUser && payload.email) {
      // Auto-restore database user record if database was reset or created anew
      try {
        dbUser = await db.user.create({
          data: {
            id: payload.id,
            email: payload.email,
            name: payload.name || 'User',
            password: 'session-restored-user',
          },
        });
      } catch {
        dbUser = await db.user.findUnique({ where: { email: payload.email } });
      }
    }

    if (!dbUser) return null;

    return {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
    };
  } catch {
    return null;
  }
}
