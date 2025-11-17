import type { Metadata, Viewport } from 'next';
import './globals.css';
import Link from 'next/link';
import { BottomNav } from '@/components/BottomNav';
import { ChatOverlay } from '@/components/ChatOverlay';

export const metadata: Metadata = {
  title: 'Second Brain',
  description: 'AI-powered notes, tasks, reminders, files, and chat',
  themeColor: '#0b0f14',
  applicationName: 'Second Brain',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'Second Brain' }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="container">
          <header className="space-between" style={{ marginBottom: 12 }}>
            <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              <h1>Second Brain</h1>
            </Link>
            <span className="small">AI-powered</span>
          </header>
          {children}
        </div>
        <BottomNav />
        <ChatOverlay />
      </body>
    </html>
  );
}
