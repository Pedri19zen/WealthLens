'use client';

import * as React from 'react';
import { formatCurrency } from '@/lib/utils/formatters';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { addNetWorthItem, snapshotNetWorth } from './actions';
import { PlusCircle, Camera, TrendingUp, TrendingDown } from 'lucide-react';
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { format } from 'date-fns';
import { PageWrapper, FadeIn, GlassCard } from '@/components/motion-wrapper';
import { motion } from 'framer-motion';

export default function NetWorthClient({ items, snapshots }: { items: any[], snapshots: any[] }) {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [type, setType] = React.useState('asset');

  const assets = items.filter(i => i.item_type === 'asset');
  const liabilities = items.filter(i => i.item_type === 'liability');

  const totalAssets = assets.reduce((sum, item) => sum + item.value_cents, 0);
  const totalLiabilities = liabilities.reduce((sum, item) => sum + item.value_cents, 0);
  const currentNetWorth = totalAssets - totalLiabilities;

  async function handleAddItem(formData: FormData) {
    setLoading(true);
    formData.append('item_type', type);
    const result = await addNetWorthItem(formData);
    setLoading(false);
    if (!result?.error) {
      setOpen(false);
    } else {
      alert(result.error);
    }
  }

  async function handleSnapshot() {
    await snapshotNetWorth(totalAssets, totalLiabilities, currentNetWorth);
  }

  const chartData = snapshots.map(s => ({
    date: format(new Date(s.snapped_at), 'MMM d'),
    netWorth: s.net_worth_cents / 100
  }));

  const isNetWorthPositive = currentNetWorth >= 0;

  return (
    <PageWrapper>
      <FadeIn>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Net Worth</h2>
            <p className="text-muted-foreground mt-1 text-sm">Track your wealth over time</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={() => setOpen(true)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-muted hover:bg-muted/80 text-sm font-medium transition-colors active:scale-95"
            >
              <PlusCircle className="h-4 w-4" /> Add Item
            </button>
            <button
              onClick={handleSnapshot}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors active:scale-95"
            >
              <Camera className="h-4 w-4" /> Snapshot
            </button>
          </div>
        </div>
      </FadeIn>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Net Worth Item</DialogTitle>
            <DialogDescription>Add a new asset or liability.</DialogDescription>
          </DialogHeader>
          <form action={handleAddItem} className="space-y-4">
            <div className="flex gap-3">
              <button type="button" onClick={() => setType('asset')}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors active:scale-95 ${type === 'asset' ? 'bg-emerald-500 text-white' : 'bg-muted hover:bg-muted/80'}`}>
                Asset
              </button>
              <button type="button" onClick={() => setType('liability')}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors active:scale-95 ${type === 'liability' ? 'bg-rose-500 text-white' : 'bg-muted hover:bg-muted/80'}`}>
                Liability
              </button>
            </div>

            <div className="space-y-2">
              <Label>Item Name</Label>
              <Input name="name" required placeholder={type === 'asset' ? "e.g., Savings Account" : "e.g., Car Loan"} className="h-11 rounded-xl" />
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select name="category" required>
                <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent>
                  {type === 'asset' ? (
                    <>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="Savings">Savings account</SelectItem>
                      <SelectItem value="Investment">Investment portfolio</SelectItem>
                      <SelectItem value="Real estate">Real estate</SelectItem>
                      <SelectItem value="Vehicle">Vehicle</SelectItem>
                      <SelectItem value="Other">Other asset</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="Mortgage">Mortgage</SelectItem>
                      <SelectItem value="Car loan">Car loan</SelectItem>
                      <SelectItem value="Student loan">Student loan</SelectItem>
                      <SelectItem value="Credit card">Credit card debt</SelectItem>
                      <SelectItem value="Other">Other liability</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Current Value</Label>
              <Input name="value" type="number" step="0.01" min="0" required className="h-11 rounded-xl" />
            </div>

            <button type="submit" disabled={loading} className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-colors disabled:opacity-60 active:scale-[0.98]">
              {loading ? 'Adding...' : 'Add Item'}
            </button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Net Worth Hero */}
      <FadeIn delay={0.1}>
        <div className="glass-card p-6 sm:p-8 text-center mb-6">
          <p className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wider mb-2">Current Net Worth</p>
          <motion.h1
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            className={`text-4xl sm:text-5xl md:text-6xl font-bold tracking-tighter ${isNetWorthPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}
          >
            {formatCurrency(currentNetWorth)}
          </motion.h1>
          <div className="flex justify-center gap-6 sm:gap-8 mt-5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/10">
                <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-500" />
              </div>
              <div className="text-left">
                <p className="text-[10px] sm:text-xs text-muted-foreground">Assets</p>
                <p className="font-semibold text-sm sm:text-base text-emerald-600 dark:text-emerald-400">{formatCurrency(totalAssets)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-rose-500/10">
                <TrendingDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-rose-500" />
              </div>
              <div className="text-left">
                <p className="text-[10px] sm:text-xs text-muted-foreground">Liabilities</p>
                <p className="font-semibold text-sm sm:text-base text-rose-600 dark:text-rose-400">{formatCurrency(totalLiabilities)}</p>
              </div>
            </div>
          </div>
        </div>
      </FadeIn>

      <div className="grid gap-5 grid-cols-1 md:grid-cols-2">
        <FadeIn delay={0.2}>
          <div className="glass-card p-5 sm:p-6">
            <h3 className="font-semibold mb-1">History</h3>
            <p className="text-sm text-muted-foreground mb-4">Net worth over time</p>
            <div className="h-[200px] sm:h-[250px]">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: '12px', fontSize: '13px' }} />
                    <Line type="monotone" dataKey="netWorth" stroke="#10B981" strokeWidth={2.5} dot={{ r: 3, fill: '#10B981' }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                  Take a snapshot to see your history
                </div>
              )}
            </div>
          </div>
        </FadeIn>

        <div className="space-y-5">
          <FadeIn delay={0.25}>
            <div className="glass-card p-4 sm:p-5">
              <h3 className="font-semibold text-emerald-600 dark:text-emerald-400 mb-3 text-sm">Assets ({assets.length})</h3>
              <div className="space-y-1">
                {assets.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-2 text-center">No assets added yet</p>
                ) : assets.map(a => (
                  <div key={a.id} className="flex justify-between items-center py-2.5 px-3 rounded-xl hover:bg-muted/50 transition-colors">
                    <div className="min-w-0 flex-1 mr-3">
                      <p className="font-medium text-sm truncate">{a.name}</p>
                      <p className="text-xs text-muted-foreground">{a.asset_category}</p>
                    </div>
                    <span className="font-semibold text-sm text-emerald-600 dark:text-emerald-400 whitespace-nowrap">{formatCurrency(a.value_cents)}</span>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.3}>
            <div className="glass-card p-4 sm:p-5">
              <h3 className="font-semibold text-rose-600 dark:text-rose-400 mb-3 text-sm">Liabilities ({liabilities.length})</h3>
              <div className="space-y-1">
                {liabilities.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-2 text-center">No liabilities added yet</p>
                ) : liabilities.map(l => (
                  <div key={l.id} className="flex justify-between items-center py-2.5 px-3 rounded-xl hover:bg-muted/50 transition-colors">
                    <div className="min-w-0 flex-1 mr-3">
                      <p className="font-medium text-sm truncate">{l.name}</p>
                      <p className="text-xs text-muted-foreground">{l.asset_category}</p>
                    </div>
                    <span className="font-semibold text-sm text-rose-600 dark:text-rose-400 whitespace-nowrap">{formatCurrency(l.value_cents)}</span>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </PageWrapper>
  );
}
