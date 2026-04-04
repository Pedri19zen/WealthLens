'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CATEGORY_ICONS } from '@/lib/utils/categories';
import { addTransaction } from '@/app/transactions/actions';
import { format } from 'date-fns';
import { Zap, Check, X, AlignLeft } from 'lucide-react';

interface QuickAddProps {
  frequentCategories: { category: string; type: string; count: number }[];
}

export function QuickAdd({ frequentCategories }: QuickAddProps) {
  const [activeCategory, setActiveCategory] = React.useState<{ category: string; type: string } | null>(null);
  const [amount, setAmount] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Build the display list: user's frequent + popular defaults
  const quickItems = React.useMemo(() => {
    const defaults = [
      { category: 'Food & Groceries', type: 'expense', count: 0 },
      { category: 'Transport', type: 'expense', count: 0 },
      { category: 'Shopping', type: 'expense', count: 0 },
      { category: 'Salary', type: 'income', count: 0 },
      { category: 'Utilities', type: 'expense', count: 0 },
      { category: 'Entertainment', type: 'expense', count: 0 },
    ];
    const existing = new Set(frequentCategories.map(f => f.category));
    const merged = [...frequentCategories];
    for (const d of defaults) {
      if (!existing.has(d.category) && merged.length < 6) {
        merged.push(d);
      }
    }
    return merged.slice(0, 6);
  }, [frequentCategories]);

  async function handleSubmit() {
    if (!activeCategory || !amount || parseFloat(amount) <= 0) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('amount', amount);
    formData.append('category', activeCategory.category);
    formData.append('type', activeCategory.type);
    formData.append('description', description || activeCategory.category);
    formData.append('date', format(new Date(), 'yyyy-MM-dd'));

    const result = await addTransaction(formData);
    setLoading(false);

    if (!result?.error) {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setActiveCategory(null);
        setAmount('');
        setDescription('');
      }, 1200);
    }
  }

  return (
    <div className="glass-card p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 rounded-lg bg-foreground/5">
          <Zap className="h-4 w-4 text-foreground/70" />
        </div>
        <div>
          <h3 className="font-semibold text-sm">Quick Add</h3>
          <p className="text-xs text-muted-foreground">Tap a category to start</p>
        </div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-3">
        {quickItems.map((item) => {
          const Icon = CATEGORY_ICONS[item.category];
          const isActive = activeCategory?.category === item.category;

          return (
            <motion.button
              key={item.category}
              whileTap={{ scale: 0.92 }}
              onClick={() => {
                const newActive = isActive ? null : { category: item.category, type: item.type };
                setActiveCategory(newActive);
                setAmount('');
                setDescription('');
                setSuccess(false);
                if (newActive) setTimeout(() => inputRef.current?.focus(), 100);
              }}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl text-center transition-all duration-300 ${
                isActive
                  ? 'bg-foreground text-background shadow-xl'
                  : 'bg-muted/30 hover:bg-muted/50 text-muted-foreground hover:text-foreground'
              }`}
            >
              {Icon && <Icon className="h-4 w-4 shrink-0" />}
              <span className="text-[10px] sm:text-xs font-medium leading-tight truncate w-full px-1">
                {item.category.split(' ')[0]}
              </span>
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {activeCategory && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="overflow-hidden"
          >
            <div className="space-y-3 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">€</span>
                  <input
                    ref={inputRef}
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full h-11 pl-7 pr-3 rounded-xl bg-muted/20 border border-border/50 focus:border-foreground/30 focus:ring-1 focus:ring-foreground/10 outline-none text-sm transition-all"
                  />
                </div>
                <div className="relative">
                  <AlignLeft className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Description (optional)"
                    className="w-full h-11 pl-9 pr-3 rounded-xl bg-muted/20 border border-border/50 focus:border-foreground/30 focus:ring-1 focus:ring-foreground/10 outline-none text-sm transition-all"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={handleSubmit}
                  disabled={loading || !amount || parseFloat(amount) <= 0}
                  className={`flex-1 h-11 rounded-xl font-semibold text-sm transition-all active:scale-95 disabled:opacity-40 ${
                    success
                      ? 'bg-emerald-500 text-white'
                      : 'bg-foreground text-background hover:opacity-90'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    {success ? <Check className="h-4 w-4" /> : loading ? 'Processing...' : 'Add Transaction'}
                  </div>
                </motion.button>
                <button
                  onClick={() => { setActiveCategory(null); setAmount(''); setDescription(''); }}
                  className="h-11 px-4 rounded-xl bg-muted/50 hover:bg-muted text-muted-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
