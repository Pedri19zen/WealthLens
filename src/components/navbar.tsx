'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Moon, Sun, Wallet, LayoutDashboard, ArrowLeftRight, PiggyBank, BarChart3, TrendingUp, Settings } from 'lucide-react';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';

const NAV_LINKS = [
  { href: '/', label: 'Overview', icon: LayoutDashboard },
  { href: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { href: '/budgets', label: 'Budgets', icon: PiggyBank },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/net-worth', label: 'Net Worth', icon: TrendingUp },
];

export function Navbar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [isVisible, setIsVisible] = React.useState(true);
  const lastScrollY = React.useRef(0);

  // Hide login/signup pages navbar
  const isAuthPage = pathname === '/login' || pathname === '/signup';

  React.useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsVisible(currentScrollY < 50 || currentScrollY < lastScrollY.current);
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (isAuthPage) return null;

  return (
    <>
      {/* Hover trigger zone for desktop */}
      <div
        className="fixed top-0 left-0 right-0 h-5 z-[60] hidden md:block"
        onMouseEnter={() => setIsVisible(true)}
      />

      {/* Desktop top navbar */}
      <motion.header
        initial={{ y: 0 }}
        animate={{ y: isVisible ? 0 : -80 }}
        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
        className="glass-nav fixed top-0 inset-x-0 z-50 px-4 lg:px-8 hidden md:block"
        onMouseEnter={() => setIsVisible(true)}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="p-2 rounded-xl bg-foreground/5 group-hover:bg-foreground group-hover:text-background transition-all duration-300">
              <Wallet className="w-5 h-5" />
            </div>
            <span className="font-black text-xl tracking-tighter uppercase">
              Wealth<span className="opacity-50">Lens</span>
            </span>
          </Link>

          {/* Desktop Nav Pills */}
          <nav className="flex items-center gap-1 p-1 bg-muted/30 border border-border/40 rounded-full">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-5 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${
                    isActive
                      ? 'text-background'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-full bg-foreground"
                      transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                    />
                  )}
                  <span className="relative z-10">{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right section */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="relative p-2.5 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            >
              <Sun className="h-[18px] w-[18px] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute top-2.5 left-2.5 h-[18px] w-[18px] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </button>

            <Link
              href="/settings"
              className="p-2.5 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            >
              <Settings className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </motion.header>

      {/* ───── MOBILE: Top bar (logo + actions) ───── */}
      <div className="glass-nav fixed top-0 inset-x-0 z-50 px-4 md:hidden">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="p-1.5 rounded-lg bg-foreground/5">
              <Wallet className="w-4 h-4" />
            </div>
            <span className="font-black text-sm uppercase tracking-tighter">
              Wealth<span className="opacity-50">Lens</span>
            </span>
          </Link>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="relative p-2 rounded-full text-muted-foreground"
            >
              <Sun className="h-[16px] w-[16px] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute top-2 left-2 h-[16px] w-[16px] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </button>
            <Link href="/settings" className="p-2 text-muted-foreground">
              <Settings className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* ───── MOBILE: Bottom tab bar ───── */}
      <nav className="fixed bottom-0 inset-x-0 z-50 md:hidden glass-nav !border-t !border-b-0">
        <div className="flex items-center justify-between h-16 px-4">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all duration-300 active:scale-90 ${
                  isActive
                    ? 'text-foreground'
                    : 'text-muted-foreground'
                }`}
              >
                <div className={`p-1.5 rounded-xl transition-all duration-300 ${isActive ? 'bg-foreground text-background scale-110 shadow-lg' : ''}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-[8px] font-black uppercase tracking-widest">{link.label.split(' ')[0]}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
