'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { login } from '@/app/auth-actions';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Wallet, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const result = await login(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6 relative overflow-hidden bg-background">
      <div className="mesh-bg" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        className="glass-card w-full max-w-sm p-8 sm:p-10"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2.5 rounded-xl bg-foreground text-background shadow-2xl">
            <Wallet className="w-5 h-5" />
          </div>
          <span className="font-black text-xl tracking-tighter uppercase">
            Wealth<span className="opacity-50">Lens</span>
          </span>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-black uppercase tracking-tighter mb-2">Welcome</h1>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest opacity-70">
            Sign in to your private vault
          </p>
        </div>

        <form action={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email</Label>
            <Input id="email" name="email" type="email" placeholder="you@example.com" required className="h-12 rounded-xl bg-muted/20 border-border/50 text-sm font-bold" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Password</Label>
            <Input id="password" name="password" type="password" required className="h-12 rounded-xl bg-muted/20 border-border/50 text-sm font-bold" />
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-[10px] font-black uppercase tracking-widest text-destructive bg-destructive/10 px-4 py-2 rounded-xl text-center"
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl bg-foreground text-background text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-40 shadow-2xl active:scale-[0.98]"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-background/30 border-t-background rounded-full animate-spin" />
            ) : (
              <>Sign in <ArrowRight className="h-4 w-4" /></>
            )}
          </button>
        </form>

        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-8 text-center">
          New here?{' '}
          <Link href="/signup" className="text-foreground hover:underline underline-offset-4 decoration-2">
            Create Account
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
