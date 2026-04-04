'use client';

import * as React from 'react';
import { formatCurrency } from '@/lib/utils/formatters';
import { CATEGORY_ICONS } from '@/lib/utils/categories';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { TransactionDialog } from './transaction-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, ArrowUpDown } from 'lucide-react';
import { deleteTransaction, bulkDeleteTransactions } from './actions';
import { PageWrapper, FadeIn } from '@/components/motion-wrapper';
import { motion, AnimatePresence } from 'framer-motion';

export default function TransactionClient({ initialTransactions }: { initialTransactions: any[] }) {
  const [page, setPage] = React.useState(1);
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const itemsPerPage = 20;

  const totalPages = Math.ceil(initialTransactions.length / itemsPerPage);
  const currentTransactions = initialTransactions.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  async function handleDelete(id: string) {
    if (confirm('Delete this transaction?')) {
      await deleteTransaction(id);
    }
  }

  async function handleBulkDelete() {
    if (selectedIds.length === 0) return;
    if (confirm(`Delete ${selectedIds.length} transactions?`)) {
      await bulkDeleteTransactions(selectedIds);
      setSelectedIds([]);
    }
  }

  function toggleSelect(id: string) {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  }

  function toggleAll() {
    if (selectedIds.length === currentTransactions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(currentTransactions.map(t => t.id));
    }
  }

  return (
    <PageWrapper>
      <FadeIn>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <h2 className="text-3xl font-black uppercase tracking-tighter">History</h2>
            <AnimatePresence>
              {selectedIds.length > 0 && (
                <motion.button
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  onClick={handleBulkDelete}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-destructive text-destructive-foreground text-[10px] font-black uppercase tracking-widest shadow-xl"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete {selectedIds.length}
                </motion.button>
              )}
            </AnimatePresence>
          </div>
          <TransactionDialog />
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <div className="glass-card !p-0 overflow-hidden rounded-2xl">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border/40 h-14 bg-foreground/[0.02]">
                  <TableHead className="w-12 px-6">
                    <Checkbox
                      checked={currentTransactions.length > 0 && selectedIds.length === currentTransactions.length}
                      onCheckedChange={toggleAll}
                      className="border-foreground/20 data-[state=checked]:bg-foreground data-[state=checked]:text-background"
                    />
                  </TableHead>
                  <TableHead className="text-[10px] uppercase font-black tracking-widest text-muted-foreground whitespace-nowrap">Date</TableHead>
                  <TableHead className="text-[10px] uppercase font-black tracking-widest text-muted-foreground whitespace-nowrap">Category</TableHead>
                  <TableHead className="text-[10px] uppercase font-black tracking-widest text-muted-foreground whitespace-nowrap">Description</TableHead>
                  <TableHead className="text-[10px] uppercase font-black tracking-widest text-muted-foreground text-right whitespace-nowrap px-6">Amount</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-48 text-center text-sm font-medium text-muted-foreground italic">
                      No transactions found.
                    </TableCell>
                  </TableRow>
                ) : (
                  currentTransactions.map((tx) => {
                    const Icon = CATEGORY_ICONS[tx.category];
                    const isExpense = tx.type === 'expense';
                    return (
                      <TableRow key={tx.id} className="hover:bg-foreground/[0.03] border-border/20 transition-all group h-16">
                        <TableCell className="px-6">
                          <Checkbox
                            checked={selectedIds.includes(tx.id)}
                            onCheckedChange={() => toggleSelect(tx.id)}
                            className="border-foreground/20 data-[state=checked]:bg-foreground data-[state=checked]:text-background"
                          />
                        </TableCell>
                        <TableCell className="text-[13px] font-bold tabular-nums whitespace-nowrap">
                          {format(new Date(tx.date), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-foreground/[0.04] text-foreground/50 group-hover:bg-foreground group-hover:text-background transition-all">
                              {Icon && <Icon className="h-3.5 w-3.5" />}
                            </div>
                            <span className="text-[13px] font-bold tracking-tight whitespace-nowrap">{tx.category}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-[13px] font-medium text-muted-foreground max-w-[200px] truncate group-hover:text-foreground transition-colors">
                          {tx.description || '—'}
                        </TableCell>
                        <TableCell className={`text-right font-black text-[13px] tabular-nums px-6 ${isExpense ? '' : 'text-emerald-500'}`}>
                          {isExpense ? '-' : '+'}{formatCurrency(tx.amount_cents)}
                        </TableCell>
                        <TableCell className="px-4">
                          <button
                            onClick={() => handleDelete(tx.id)}
                            className="p-2 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </FadeIn>

      {totalPages > 1 && (
        <FadeIn delay={0.2}>
          <div className="flex items-center justify-center gap-6 mt-10">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-foreground text-background hover:opacity-90 disabled:opacity-20 transition-all shadow-lg active:scale-95"
            >
              Prev
            </button>
            <span className="text-xs font-black tabular-nums tracking-widest">
              {page} <span className="opacity-30">/</span> {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-foreground text-background hover:opacity-90 disabled:opacity-20 transition-all shadow-lg active:scale-95"
            >
              Next
            </button>
          </div>
        </FadeIn>
      )}
    </PageWrapper>
  );
}
