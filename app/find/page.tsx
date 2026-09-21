'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function FindRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to home page as FIND is a global search overlay, not a standalone page
    router.replace('/');
  }, [router]);

  return (
    <div className="p-12 text-center font-mono font-black text-sm">
      ⚡ REDIRECTING TO GLOBAL COMMAND CENTER...
    </div>
  );
}
