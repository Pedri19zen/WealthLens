'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';
import * as React from 'react';

// ─── Fade In ───
export function FadeIn({ children, delay = 0, className = '', ...props }: { children: React.ReactNode; delay?: number; className?: string } & Omit<HTMLMotionProps<'div'>, 'children'>) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// ─── Stagger Container ───
export function StaggerContainer({ children, className = '', staggerDelay = 0.08 }: { children: React.ReactNode; className?: string; staggerDelay?: number }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: staggerDelay } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Stagger Item ───
export function StaggerItem({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20, scale: 0.97 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Scale on Hover Card ───
export function GlassCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      whileHover={{ scale: 1.015, y: -2 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={`glass-card p-6 ${className}`}
    >
      {children}
    </motion.div>
  );
}

// ─── Page Wrapper ───
export function PageWrapper({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${className}`}
    >
      {children}
    </motion.div>
  );
}
