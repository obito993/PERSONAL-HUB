'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Wrench, GraduationCap, Code, Bot, Briefcase } from 'lucide-react';
import Dock, { DockItemData } from '@/components/Dock/Dock';
import { sound } from '@/lib/sound';

interface ComicDockProps {
  onOpenFind: () => void;
}

export function ComicDock({ onOpenFind }: ComicDockProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Hide dock on login or signup screens
  if (pathname === '/login' || pathname === '/signup') return null;

  // 6 PRIMARY DOCK ITEMS IN EXACT REQUESTED SEQUENCE: HUB, TOOLS, STUDY, CODE ARENA, AI, CAREER
  const NAV_ITEMS = [
    {
      id: 'hub',
      label: 'HUB',
      href: '/',
      icon: Home,
      activeColor: 'bg-[#FF5A5F]',
      isActive: pathname === '/',
    },
    {
      id: 'tools',
      label: 'TOOLS',
      href: '/tools',
      icon: Wrench,
      activeColor: 'bg-[#FFD83D]',
      isActive: pathname === '/tools' || pathname.startsWith('/tools/'),
    },
    {
      id: 'study',
      label: 'STUDY',
      href: '/study',
      icon: GraduationCap,
      activeColor: 'bg-[#B9A7FF]',
      isActive: pathname === '/study' || pathname.startsWith('/study/'),
    },
    {
      id: 'coding',
      label: 'CODE ARENA',
      href: '/coding',
      icon: Code,
      activeColor: 'bg-[#5DADE2]',
      isActive: pathname === '/coding' || pathname.startsWith('/coding/'),
    },
    {
      id: 'ai',
      label: 'AI',
      href: '/ai',
      icon: Bot,
      activeColor: 'bg-[#A855F7]',
      isActive: pathname === '/ai' || pathname.startsWith('/ai/'),
    },
    {
      id: 'career',
      label: 'CAREER',
      href: '/career',
      icon: Briefcase,
      activeColor: 'bg-[#FF6B00]',
      isActive: pathname === '/career' || pathname.startsWith('/career/'),
    },
  ];

  const dockItems: DockItemData[] = NAV_ITEMS.map((item) => {
    const IconComponent = item.icon;
    const isActive = item.isActive;

    return {
      label: item.label,
      className: isActive ? 'is-active' : '',
      isActive,
      onClick: () => {
        sound.playPop();
        router.push(item.href);
      },
      icon: (
        <div className="relative flex flex-col items-center justify-center w-full h-full p-2">
          {/* Active indicator comic badge */}
          {isActive && (
            <span className="absolute -top-2 bg-black text-[#FFD83D] text-[8px] font-mono font-black px-1 py-0.2 border border-white shadow-[1px_1px_0_#000] rotate-[-2deg] z-10 leading-none">
              POW!
            </span>
          )}

          <div
            className={`p-1.5 rounded-lg transition-all duration-150 flex items-center justify-center ${
              isActive ? item.activeColor + ' text-black border-2 border-black shadow-[1.5px_1.5px_0_#000]' : 'text-gray-800'
            }`}
          >
            <IconComponent className={`w-5 h-5 sm:w-6 sm:h-6 ${isActive ? 'stroke-[2.8]' : 'stroke-[2]'}`} />
          </div>
        </div>
      ),
    };
  });

  return (
    <Dock
      items={dockItems}
      magnification={70}
      distance={200}
      panelHeight={68}
      dockHeight={256}
      baseItemSize={48}
    />
  );
}
