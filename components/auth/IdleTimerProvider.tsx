'use client';

import React, { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';

const THROTTLE_INTERVAL_MS = 2 * 60 * 1000; // Send server activity heartbeat at most every 2 minutes
const IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

export function IdleTimerProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const lastActivityTimeRef = useRef<number>(Date.now());
  const lastServerUpdateRef = useRef<number>(Date.now());
  const isUpdatingRef = useRef<boolean>(false);

  // Send activity update to server
  const sendServerActivity = async () => {
    if (isUpdatingRef.current) return;
    isUpdatingRef.current = true;

    try {
      const res = await fetch('/api/auth/activity', { method: 'POST' });
      const data = await res.json();

      if (data.expired || res.status === 401) {
        // Session expired after 30 minutes of inactivity
        console.warn('[IDLE TIMER] Server reports session expired.');
        const returnUrl = encodeURIComponent(pathname);
        router.push(`/login?expired=true&returnUrl=${returnUrl}`);
        return;
      }

      if (data.success) {
        lastServerUpdateRef.current = Date.now();
      }
    } catch (err) {
      // Network error — non-fatal
    } finally {
      isUpdatingRef.current = false;
    }
  };

  useEffect(() => {
    // Skip idle tracking on login and signup pages
    if (pathname === '/login' || pathname === '/signup') return;

    const handleUserActivity = () => {
      const now = Date.now();
      lastActivityTimeRef.current = now;

      // Throttle server activity updates to every 2 minutes
      if (now - lastServerUpdateRef.current >= THROTTLE_INTERVAL_MS) {
        sendServerActivity();
      }
    };

    // Attach activity listeners
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'pointerdown'];
    events.forEach((evt) => {
      window.addEventListener(evt, handleUserActivity, { passive: true });
    });

    // Check inactivity locally every 15 seconds
    const interval = setInterval(() => {
      const now = Date.now();
      if (now - lastActivityTimeRef.current >= IDLE_TIMEOUT_MS) {
        console.warn('[IDLE TIMER] Local 30-minute inactivity threshold reached.');
        const returnUrl = encodeURIComponent(pathname);
        router.push(`/login?expired=true&returnUrl=${returnUrl}`);
      }
    }, 15000);

    return () => {
      events.forEach((evt) => {
        window.removeEventListener(evt, handleUserActivity);
      });
      clearInterval(interval);
    };
  }, [pathname, router]);

  return <>{children}</>;
}
