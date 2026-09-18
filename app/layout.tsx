import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'ResumeForge AI - AI Resume Analyzer, Job Matcher & Resume Builder',
  description: 'Analyze job descriptions, discover missing ATS keywords, repair resume mistakes, and generate tailored resumes with strict change tracking.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100 selection:bg-orange-500/30 selection:text-orange-300">
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-zinc-900 bg-zinc-950 py-8 text-center text-xs text-zinc-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              © {new Date().getFullYear()} ResumeForge AI. All rights reserved. ATS Matcher & Resume Builder.
            </div>
            <div className="flex gap-6 text-zinc-400">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Security</a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
