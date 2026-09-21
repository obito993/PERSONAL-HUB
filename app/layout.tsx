import type { Metadata } from 'next';
import './globals.css';
import { LayoutContent } from './layout-content';

export const metadata: Metadata = {
  title: "PERSONAL HUB — Your Everyday Internet Toolbox",
  description: 'A fast, creative collection of everyday tools, AI utilities, productivity features, study tools, career utilities, calculators, developer tools, and creative tools.',
  manifest: '/manifest.json',
  openGraph: {
    title: "PERSONAL HUB — Your Everyday Internet Toolbox",
    description: 'Everyday calculators, text tools, developer utilities, AI assistance, and productivity in one comic book design universe.',
    siteName: "PERSONAL HUB",
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&family=JetBrains+Mono:wght@400;600;700;800&family=Space+Grotesk:wght@500;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="text-[#050505] antialiased selection:bg-[#FFD83D] min-h-screen">
        <LayoutContent>{children}</LayoutContent>
      </body>
    </html>
  );
}
