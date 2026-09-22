import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionToken, createSessionToken } from '@/lib/auth';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('dh_session')?.value;

    if (!token) {
      return NextResponse.json({ expired: true, error: 'No active session' }, { status: 401 });
    }

    const session = await verifySessionToken(token);

    if (!session) {
      // Session has expired due to 30-minute inactivity
      const response = NextResponse.json({
        expired: true,
        error: 'Your session expired after 30 minutes of inactivity. Please log in again.'
      }, { status: 401 });

      // Clear stale cookie
      response.cookies.set('dh_session', '', {
        httpOnly: true,
        path: '/',
        expires: new Date(0),
      });

      return response;
    }

    // Refresh activity timestamp in session token
    const now = Date.now();
    const newToken = await createSessionToken({
      userId: session.userId,
      email: session.email,
      name: session.name,
      lastActivityAt: now,
    });

    const response = NextResponse.json({
      success: true,
      lastActivityAt: now,
    });

    response.cookies.set('dh_session', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return response;

  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Activity update failed' }, { status: 500 });
  }
}
