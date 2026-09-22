import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'deion-hub-super-secret-jwt-key-2026-production'
);

// 30-minute inactivity timeout configuration (defaults to 30 mins)
export const SESSION_IDLE_TIMEOUT_MINUTES = parseInt(
  process.env.SESSION_IDLE_TIMEOUT_MINUTES || '30',
  10
);
export const SESSION_IDLE_TIMEOUT_MS = SESSION_IDLE_TIMEOUT_MINUTES * 60 * 1000;

export interface AuthSession {
  userId: string;
  email: string;
  name: string;
  lastActivityAt?: number;
}

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

export async function createSessionToken(payload: AuthSession): Promise<string> {
  const lastActivityAt = payload.lastActivityAt || Date.now();
  return await new SignJWT({
    userId: payload.userId,
    email: payload.email,
    name: payload.name,
    lastActivityAt,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(JWT_SECRET);
}

export async function verifySessionToken(token: string): Promise<AuthSession | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = payload.userId as string;
    const email = payload.email as string;
    const name = payload.name as string;
    const lastActivityAt = typeof payload.lastActivityAt === 'number'
      ? payload.lastActivityAt
      : Date.now();

    // Check 30-minute idle inactivity timeout
    const now = Date.now();
    if (now - lastActivityAt > SESSION_IDLE_TIMEOUT_MS) {
      console.warn(`[AUTH IDLE TIMEOUT] Session expired for userId ${userId}. Inactive for ${Math.round((now - lastActivityAt) / 60000)} mins`);
      return null; // Session expired due to inactivity
    }

    return {
      userId,
      email,
      name,
      lastActivityAt,
    };
  } catch {
    return null;
  }
}

export async function getAuthSession(): Promise<AuthSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('dh_session')?.value;
    if (!token) return null;
    return await verifySessionToken(token);
  } catch {
    return null;
  }
}

export async function requireAuthSession(): Promise<AuthSession> {
  const session = await getAuthSession();
  if (!session) {
    throw new Error('Unauthorized');
  }
  return session;
}
