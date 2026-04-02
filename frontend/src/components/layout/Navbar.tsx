"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';

export function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  if (pathname.startsWith('/onboarding')) return null;

  const links = [
    { href: '/home', label: 'Início' },
    { href: '/session', label: 'Hoje' },
    { href: '/history', label: 'Jornada' },
    { href: '/plans', label: 'Planos' },
    { href: '/profile', label: 'Perfil' },
  ];

  if (user?.role === 'ADMIN') {
    links.push({ href: '/admin', label: 'Admin' });
  }

  return (
    <nav className="hidden md:block sticky top-0 z-50 bg-[var(--q-bg-void)]/80 backdrop-blur-xl border-b border-[var(--q-border-subtle)] h-16">
      <div className="max-w-4xl mx-auto px-6 flex justify-between items-center h-full">
        {/* Logo area */}
        <Link href="/session" className="text-[var(--q-accent-9)] font-[family-name:var(--font-instrument)] italic text-xl font-bold tracking-tight glow-accent">
          Quantum
        </Link>

        {/* Links */}
        <div className="flex items-center gap-8 h-full">
          {links.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-2 flex items-center h-full text-sm font-medium transition-colors ${
                  isActive ? 'text-[var(--q-text-primary)]' : 'text-[var(--q-text-secondary)] hover:text-[var(--q-text-primary)]'
                }`}
              >
                {link.label}
                {isActive && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--q-accent-8)] rounded-t-full shadow-[var(--q-shadow-glow-accent)]"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
          
          <button
            onClick={logout}
            className="ml-4 px-4 py-1.5 rounded-full border border-[var(--q-border-default)] text-xs text-[var(--q-text-secondary)] bg-[var(--q-bg-surface)] hover:text-[var(--q-text-primary)] hover:border-[var(--q-border-strong)] transition-all"
          >
            Sair
          </button>
        </div>
      </div>
    </nav>
  );
}
