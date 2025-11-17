"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function BottomNav() {
  const pathname = usePathname();
  const isActive = (href: string) => (pathname === href ? 'active' : '');
  return (
    <nav className="bottom-nav">
      <div className="inner">
        <Link className={isActive('/')} href="/">??</Link>
        <Link className={isActive('/notes')} href="/notes">??</Link>
        <Link className={isActive('/todos')} href="/todos">?</Link>
        <Link className={isActive('/reminders')} href="/reminders">?</Link>
        <Link className={isActive('/files')} href="/files">??</Link>
      </div>
    </nav>
  );
}
