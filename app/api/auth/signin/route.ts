import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { comparePassword, createSessionToken, setAuthCookie } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    const validPassword = await comparePassword(password, user.password);
    if (!validPassword) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    const userSession = { id: user.id, email: user.email, name: user.name };
    const token = await createSessionToken(userSession);
    await setAuthCookie(token);

    return NextResponse.json({ user: userSession }, { status: 200 });
  } catch (error) {
    console.error('Signin error:', error);
    return NextResponse.json({ error: 'Failed to sign in.' }, { status: 500 });
  }
}
