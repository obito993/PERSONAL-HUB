import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { CustomCursor } from '@/components/ui/comic/CustomCursor';
import { ParticleBackground } from '@/components/ui/comic/ParticleBackground';
import { AIAssistantGuide } from '@/components/ui/comic/AIAssistantGuide';
import { ComicIntroOverlay } from '@/components/ui/comic/ComicIntroOverlay';
import { ComicAudioSFX } from '@/components/ui/comic/ComicAudioSFX';

export const metadata: Metadata = {
  title: 'ResumeForge AI - AI Career Command Center & ATS Resume Builder',
  description: 'Analyze job descriptions, discover missing ATS keywords, repair resume mistakes, and generate tailored resumes with strict change tracking.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col bg-[#09090b] text-zinc-100 selection:bg-orange-500/30 selection:text-orange-400">
        <CustomCursor />
        <ParticleBackground />
        <ComicIntroOverlay />
        <ComicAudioSFX />
        <Navbar />
        <main className="flex-1 relative z-10">{children}</main>
        <AIAssistantGuide />
        <footer className="relative z-10 border-t-2 border-orange-500/20 bg-[#09090b] py-8 text-center text-xs text-zinc-500 no-print">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="font-mono text-zinc-400">
              © {new Date().getFullYear()} RESUMEFORGE AI — CAREER COMMAND CENTER.
            </div>
            <div className="flex gap-6 font-bold text-zinc-400">
              <a href="/about" className="hover:text-orange-400 transition-colors uppercase">About</a>
              <a href="/templates" className="hover:text-orange-400 transition-colors uppercase">Templates</a>
              <a href="/ats" className="hover:text-orange-400 transition-colors uppercase">ATS Scanner</a>
              <a href="/privacy" className="hover:text-orange-400 transition-colors uppercase">Privacy</a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
