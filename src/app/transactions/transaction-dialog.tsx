'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '@/lib/utils/categories';
import { Checkbox } from '@/components/ui/checkbox';
import { addTransaction } from './actions';
import { PlusCircle, Info } from 'lucide-react';
import { format } from 'date-fns';

export function TransactionDialog() {
  const [open, setOpen] = React.useState(false);
  const [type, setType] = React.useState('expense');
  const [loading, setLoading] = React.useState(false);

  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    formData.append('type', type);
    const result = await addTransaction(formData);
    setLoading(false);
    if (!result?.error) {
      setOpen(false);
    } else {
      alert(result.error);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-foreground text-background text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-xl"
      >
        <PlusCircle className="h-4 w-4" /> Add Transaction
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md glass-card !bg-background/95 backdrop-blur-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase tracking-tighter">Add Transaction</DialogTitle>
            <DialogDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Record a new financial entry
            </DialogDescription>
          </DialogHeader>
          <form action={handleSubmit} className="space-y-6 pt-4">
            <div className="flex p-1 bg-muted/20 border border-border/40 rounded-2xl">
              <button
                type="button"
                className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${type === 'expense' ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'}`}
                onClick={() => setType('expense')}
              >
                Expense
              </button>
              <button
                type="button"
                className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${type === 'income' ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'}`}
                onClick={() => setType('income')}
              >
                Income
              </button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Amount</Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black opacity-30">€</span>
                <Input id="amount" name="amount" type="number" step="0.01" min="0.01" placeholder="0.00" required className="h-12 pl-8 rounded-xl bg-muted/20 border-border/50 text-sm font-black tabular-nums" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Category</Label>
                <Select name="category" required defaultValue={categories[0].name}>
                  <SelectTrigger className="h-12 rounded-xl bg-muted/20 border-border/50 text-[11px] font-black uppercase tracking-tight">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent className="glass-card">
                    {categories.map((cat) => (
                      <SelectItem key={cat.name} value={cat.name} className="text-xs font-bold uppercase tracking-tight">
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Date</Label>
                <Input id="date" name="date" type="date" defaultValue={format(new Date(), 'yyyy-MM-dd')} required className="h-12 rounded-xl bg-muted/20 border-border/50 text-[11px] font-black uppercase" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Description</Label>
              <Input id="description" name="description" placeholder="Notes..." className="h-12 rounded-xl bg-muted/20 border-border/50 text-sm font-bold" />
            </div>

            <div className="flex items-center space-x-3 p-3 bg-foreground/5 rounded-xl">
              <Checkbox id="is_recurring" name="is_recurring" className="border-foreground/20 data-[state=checked]:bg-foreground data-[state=checked]:text-background" />
              <Label htmlFor="is_recurring" className="text-[10px] font-black uppercase tracking-widest opacity-60">
                Mark as recurring
              </Label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-foreground text-background text-[11px] font-black uppercase tracking-widest transition-all disabled:opacity-40 active:scale-[0.98] shadow-2xl"
            >
              {loading ? 'Processing...' : 'Save Entry'}
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
