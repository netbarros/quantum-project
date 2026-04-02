"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

export function MobileNav() {
  const pathname = usePathname();

  if (pathname.startsWith('/onboarding')) return null;

  const links = [
    { href: '/session', label: 'Hoje', icon: '✦' },
    { href: '/history', label: 'Jornada', icon: '❂' },
    { href: '/plans', label: 'Planos', icon: '✧' },
    { href: '/profile', label: 'Perfil', icon: '👤' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-[72px] bg-[var(--q-bg-void)]/90 backdrop-blur-xl border-t border-[var(--q-border-subtle)] pb-safe z-50 flex justify-around items-center px-2">
      {links.map((link) => {
        const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
        
        return (
          <Link
            key={link.href}
            href={link.href}
            className="relative flex flex-col items-center justify-center w-16 h-full gap-1"
          >
            <motion.span 
              animate={{ 
                color: isActive ? 'var(--q-accent-9)' : 'var(--q-text-secondary)',
                scale: isActive ? 1.1 : 1
              }}
              className="text-xl"
            >
              {link.icon}
            </motion.span>
            
            <span className={`text-[10px] font-medium transition-colors ${isActive ? 'text-[var(--q-text-primary)]' : 'text-[var(--q-text-tertiary)]'}`}>
              {link.label}
            </span>

            {isActive && (
              <motion.div
                layoutId="mobilenav-indicator"
                className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-[var(--q-accent-8)] rounded-b-full shadow-[var(--q-shadow-glow-accent)]"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
