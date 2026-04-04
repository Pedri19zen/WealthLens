'use client';

import * as React from 'react';
import { Progress } from '@/components/ui/progress';
import { formatCurrency } from '@/lib/utils/formatters';
import { EXPENSE_CATEGORIES } from '@/lib/utils/categories';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { setBudgetLimit, deleteBudgetLimit, setGeneralLimit, deleteGeneralLimit, createSavingsGoal, contributeSavingsGoal, deleteSavingsGoal } from './actions';
import { AlertCircle, PlusCircle, Trash2, Target, Wallet, CalendarDays, TrendingUp, Coins, Sparkles } from 'lucide-react';
import { PageWrapper, FadeIn, StaggerContainer, StaggerItem, GlassCard } from '@/components/motion-wrapper';
import { motion } from 'framer-motion';

interface Props {
  budgets: any[];
  spentByCategory: Record<string, number>;
  currentMonth: string;
  generalLimits: any[];
  savingsGoals: any[];
  monthlySpent: number;
  weeklySpent: number;
}

export default function BudgetClient({ budgets, spentByCategory, currentMonth, generalLimits, savingsGoals, monthlySpent, weeklySpent }: Props) {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [deletingCategory, setDeletingCategory] = React.useState<string | null>(null);

  // General Limit dialogs
  const [generalLimitOpen, setGeneralLimitOpen] = React.useState(false);
  const [generalLimitPeriod, setGeneralLimitPeriod] = React.useState<'monthly' | 'weekly'>('monthly');
  const [generalLoading, setGeneralLoading] = React.useState(false);

  // Savings Goal dialogs
  const [goalOpen, setGoalOpen] = React.useState(false);
  const [goalLoading, setGoalLoading] = React.useState(false);
  const [contributeGoalId, setContributeGoalId] = React.useState<string | null>(null);
  const [contributeLoading, setContributeLoading] = React.useState(false);
  const [deletingGoalId, setDeletingGoalId] = React.useState<string | null>(null);

  // ─── Per-Category Handlers ───
  async function handleSetLimit(formData: FormData) {
    setLoading(true);
    formData.append('month', currentMonth);
    const result = await setBudgetLimit(formData);
    setLoading(false);
    if (!result?.error) setOpen(false);
    else alert(result.error);
  }

  async function handleDeleteLimit(category: string) {
    if (!confirm(`Delete budget limit for ${category}?`)) return;
    setDeletingCategory(category);
    const formData = new FormData();
    formData.append('category', category);
    formData.append('month', currentMonth);
    const result = await deleteBudgetLimit(formData);
    setDeletingCategory(null);
    if (result?.error) alert(result.error);
  }

  // ─── General Limit Handlers ───
  async function handleSetGeneralLimit(formData: FormData) {
    setGeneralLoading(true);
    formData.append('period', generalLimitPeriod);
    const result = await setGeneralLimit(formData);
    setGeneralLoading(false);
    if (!result?.error) setGeneralLimitOpen(false);
    else alert(result.error);
  }

  async function handleDeleteGeneralLimit(period: string) {
    if (!confirm(`Delete ${period} budget limit?`)) return;
    const formData = new FormData();
    formData.append('period', period);
    const result = await deleteGeneralLimit(formData);
    if (result?.error) alert(result.error);
  }

  // ─── Savings Goal Handlers ───
  async function handleCreateGoal(formData: FormData) {
    setGoalLoading(true);
    const result = await createSavingsGoal(formData);
    setGoalLoading(false);
    if (!result?.error) setGoalOpen(false);
    else alert(result.error);
  }

  async function handleContribute(formData: FormData) {
    setContributeLoading(true);
    formData.append('goalId', contributeGoalId!);
    const result = await contributeSavingsGoal(formData);
    setContributeLoading(false);
    if (!result?.error) setContributeGoalId(null);
    else alert(result.error);
  }

  async function handleDeleteGoal(goalId: string) {
    if (!confirm('Delete this savings goal?')) return;
    setDeletingGoalId(goalId);
    const formData = new FormData();
    formData.append('goalId', goalId);
    const result = await deleteSavingsGoal(formData);
    setDeletingGoalId(null);
    if (result?.error) alert(result.error);
  }

  // Computed
  const budgetSummary = budgets.reduce((acc, b) => acc + b.limit_cents, 0);
  const spentSummary = Object.values(spentByCategory).reduce((acc, v) => acc + v, 0);
  const totalPercentage = budgetSummary > 0 ? (spentSummary / budgetSummary) * 100 : 0;
  const isOverBudgetOverall = totalPercentage >= 100;

  const monthlyLimit = generalLimits.find(l => l.period === 'monthly');
  const weeklyLimit = generalLimits.find(l => l.period === 'weekly');

  return (
    <PageWrapper>
      <FadeIn>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tighter">Budgets</h2>
            <p className="text-muted-foreground mt-1 text-sm font-medium opacity-70">Limits, goals & progress</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => { setGeneralLimitPeriod('monthly'); setGeneralLimitOpen(true); }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-foreground/5 border border-border/50 text-[10px] font-black uppercase tracking-widest hover:bg-foreground/10 transition-all"
            >
              <CalendarDays className="h-3.5 w-3.5" /> General Limit
            </button>
            <button
              onClick={() => setGoalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-foreground/5 border border-border/50 text-[10px] font-black uppercase tracking-widest hover:bg-foreground/10 transition-all"
            >
              <Target className="h-3.5 w-3.5" /> New Goal
            </button>
            <button
              onClick={() => setOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-foreground text-background text-[10px] font-black uppercase tracking-widest shadow-xl transition-all active:scale-95"
            >
              <PlusCircle className="h-3.5 w-3.5" /> Set Limit
            </button>
          </div>
        </div>
      </FadeIn>

      {/* ─── General Budget Limits ─── */}
      <FadeIn delay={0.05}>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 mb-8">
          {/* Monthly Limit Card */}
          <GeneralLimitCard
            label="Monthly Budget"
            icon={<CalendarDays className="h-4 w-4" />}
            limit={monthlyLimit}
            spent={monthlySpent}
            onEdit={() => { setGeneralLimitPeriod('monthly'); setGeneralLimitOpen(true); }}
            onDelete={() => handleDeleteGeneralLimit('monthly')}
          />
          {/* Weekly Limit Card */}
          <GeneralLimitCard
            label="Weekly Budget"
            icon={<Wallet className="h-4 w-4" />}
            limit={weeklyLimit}
            spent={weeklySpent}
            onEdit={() => { setGeneralLimitPeriod('weekly'); setGeneralLimitOpen(true); }}
            onDelete={() => handleDeleteGeneralLimit('weekly')}
          />
        </div>
      </FadeIn>

      {/* ─── Savings Goals ─── */}
      {savingsGoals.length > 0 && (
        <FadeIn delay={0.1}>
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-5">
              <Sparkles className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Savings Goals</h3>
            </div>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {savingsGoals.map((goal: any) => {
                const pct = goal.target_cents > 0 ? (goal.current_cents / goal.target_cents) * 100 : 0;
                const isComplete = pct >= 100;
                return (
                  <div key={goal.id} className="glass-card p-6 group relative">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl ${isComplete ? 'bg-emerald-500/10 text-emerald-500' : 'bg-foreground/5 text-foreground/50'}`}>
                          <Target className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-black text-sm uppercase tracking-tight">{goal.name}</p>
                          {isComplete && <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Goal Reached!</p>}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteGoal(goal.id)}
                        disabled={deletingGoalId === goal.id}
                        className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-baseline gap-1.5 mb-1">
                        <p className="text-2xl font-black tabular-nums tracking-tighter">{formatCurrency(goal.current_cents)}</p>
                        <p className="text-xs font-bold text-muted-foreground">/ {formatCurrency(goal.target_cents)}</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="h-2 rounded-full bg-foreground/5 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(pct, 100)}%` }}
                          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
                          className={`h-full rounded-full ${isComplete ? 'bg-emerald-500' : 'bg-foreground'}`}
                        />
                      </div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mt-1.5 text-right">
                        {Math.round(pct)}%
                      </p>
                    </div>

                    {!isComplete && (
                      <button
                        onClick={() => setContributeGoalId(goal.id)}
                        className="w-full py-2.5 rounded-xl bg-foreground/5 border border-border/50 text-[10px] font-black uppercase tracking-widest hover:bg-foreground/10 transition-all flex items-center justify-center gap-1.5"
                      >
                        <Coins className="h-3.5 w-3.5" /> Add Funds
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </FadeIn>
      )}

      {/* ─── Category Budget Overview ─── */}
      <FadeIn delay={0.15}>
        <div className="glass-card p-6 sm:p-8 mb-10 overflow-hidden relative group">
          <div className="absolute inset-x-0 bottom-0 h-1 bg-foreground/5 overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(totalPercentage, 100)}%` }}
              className={`h-full ${isOverBudgetOverall ? 'bg-destructive' : 'bg-foreground'}`}
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-6 relative z-10">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Category Budget Total</p>
              <div className="flex items-baseline gap-2">
                <p className="text-4xl font-black tabular-nums tracking-tighter">{formatCurrency(spentSummary)}</p>
                <p className="text-sm font-bold text-muted-foreground">/ {formatCurrency(budgetSummary)}</p>
              </div>
            </div>
            <div className="sm:text-right">
              {budgetSummary > 0 && (
                <div className={`inline-flex px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${isOverBudgetOverall ? 'bg-destructive/10 text-destructive' : 'bg-foreground/5 text-foreground'}`}>
                  {budgetSummary - spentSummary >= 0 
                    ? `${formatCurrency(budgetSummary - spentSummary)} left` 
                    : `${formatCurrency(Math.abs(budgetSummary - spentSummary))} over`
                  }
                </div>
              )}
            </div>
          </div>
        </div>
      </FadeIn>

      <StaggerContainer className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {EXPENSE_CATEGORIES.map(category => {
          const budget = budgets.find(b => b.category === category.name);
          const limit = budget?.limit_cents || 0;
          const spent = spentByCategory[category.name] || 0;
          const percentage = limit > 0 ? (spent / limit) * 100 : 0;
          const isOverBudget = spent > limit && limit > 0;
          const Icon = category.icon;

          if (limit === 0 && spent === 0) return null;

          return (
            <StaggerItem key={category.name}>
              <GlassCard className="flex flex-col h-full !p-6">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-foreground/5 text-foreground/50">
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="font-black text-xs uppercase tracking-tight">{category.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {isOverBudget && <AlertCircle className="h-4 w-4 text-destructive animate-pulse" />}
                    {limit > 0 && (
                      <button 
                        onClick={() => handleDeleteLimit(category.name)}
                        disabled={deletingCategory === category.name}
                        className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        title="Delete limit"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex-1 mb-6">
                  <p className="text-2xl font-black tabular-nums tracking-tighter mb-1">{formatCurrency(spent)}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    {limit > 0 ? `of ${formatCurrency(limit)}` : '(No limit)'}
                  </p>
                </div>
                {limit > 0 && (
                  <div className="space-y-2">
                    <Progress value={percentage > 100 ? 100 : percentage} className="h-1.5 bg-foreground/5">
                      <div className={`h-full transition-all duration-500 rounded-full ${isOverBudget ? 'bg-destructive' : 'bg-foreground'}`} style={{ width: `${Math.min(percentage, 100)}%` }} />
                    </Progress>
                    <div className="flex items-center justify-between">
                      <p className={`text-[9px] font-black uppercase tracking-widest ${isOverBudget ? 'text-destructive' : 'text-muted-foreground'}`}>
                        {isOverBudget ? 'Limit Exceeded' : `${Math.round(percentage)}% of target`}
                      </p>
                    </div>
                  </div>
                )}
              </GlassCard>
            </StaggerItem>
          );
        })}
      </StaggerContainer>

      {/* ─── Dialogs ─── */}

      {/* Set Category Limit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md glass-card !bg-background/95 backdrop-blur-2xl">
          <DialogHeader>
            <DialogTitle className="font-black uppercase tracking-tight">Set Budget Limit</DialogTitle>
            <DialogDescription className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
              Control your monthly spend by category
            </DialogDescription>
          </DialogHeader>
          <form action={handleSetLimit} className="space-y-6 pt-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Category</Label>
              <Select name="category" required>
                <SelectTrigger className="h-12 rounded-xl bg-muted/20 border-border/50 text-sm font-bold">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent className="glass-card">
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.name} value={cat.name} className="text-xs font-bold uppercase tracking-tight">{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Limit Amount</Label>
              <Input name="limit" type="number" step="0.01" min="0.01" required className="h-12 rounded-xl bg-muted/20 border-border/50 text-sm font-bold tabular-nums" />
            </div>
            <button type="submit" disabled={loading} className="w-full h-12 rounded-xl bg-foreground text-background text-[11px] font-black uppercase tracking-widest transition-all disabled:opacity-40 active:scale-[0.98] shadow-2xl">
              {loading ? 'Processing...' : 'Save Limit'}
            </button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Set General Limit Dialog */}
      <Dialog open={generalLimitOpen} onOpenChange={setGeneralLimitOpen}>
        <DialogContent className="sm:max-w-md glass-card !bg-background/95 backdrop-blur-2xl">
          <DialogHeader>
            <DialogTitle className="font-black uppercase tracking-tight">Set General Limit</DialogTitle>
            <DialogDescription className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
              Set an overall spending cap
            </DialogDescription>
          </DialogHeader>
          <form action={handleSetGeneralLimit} className="space-y-6 pt-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Period</Label>
              <div className="flex p-1 bg-muted/30 rounded-xl border border-border/50">
                <button
                  type="button"
                  onClick={() => setGeneralLimitPeriod('monthly')}
                  className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${generalLimitPeriod === 'monthly' ? 'bg-foreground text-background shadow-lg' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setGeneralLimitPeriod('weekly')}
                  className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${generalLimitPeriod === 'weekly' ? 'bg-foreground text-background shadow-lg' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  Weekly
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Limit Amount</Label>
              <Input 
                name="limit" 
                type="number" 
                step="0.01" 
                min="0.01" 
                required 
                defaultValue={generalLimitPeriod === 'monthly' ? (monthlyLimit ? (monthlyLimit.limit_cents / 100).toString() : '') : (weeklyLimit ? (weeklyLimit.limit_cents / 100).toString() : '')}
                key={generalLimitPeriod}
                className="h-12 rounded-xl bg-muted/20 border-border/50 text-sm font-bold tabular-nums" 
              />
            </div>
            <button type="submit" disabled={generalLoading} className="w-full h-12 rounded-xl bg-foreground text-background text-[11px] font-black uppercase tracking-widest transition-all disabled:opacity-40 active:scale-[0.98] shadow-2xl">
              {generalLoading ? 'Processing...' : 'Save Limit'}
            </button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Savings Goal Dialog */}
      <Dialog open={goalOpen} onOpenChange={setGoalOpen}>
        <DialogContent className="sm:max-w-md glass-card !bg-background/95 backdrop-blur-2xl">
          <DialogHeader>
            <DialogTitle className="font-black uppercase tracking-tight">New Savings Goal</DialogTitle>
            <DialogDescription className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
              Set a target and start saving
            </DialogDescription>
          </DialogHeader>
          <form action={handleCreateGoal} className="space-y-6 pt-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Goal Name</Label>
              <Input name="name" placeholder="e.g. Vacation, Emergency Fund" required className="h-12 rounded-xl bg-muted/20 border-border/50 text-sm font-bold" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Target Amount</Label>
              <Input name="target" type="number" step="0.01" min="0.01" required className="h-12 rounded-xl bg-muted/20 border-border/50 text-sm font-bold tabular-nums" />
            </div>
            <button type="submit" disabled={goalLoading} className="w-full h-12 rounded-xl bg-foreground text-background text-[11px] font-black uppercase tracking-widest transition-all disabled:opacity-40 active:scale-[0.98] shadow-2xl">
              {goalLoading ? 'Creating...' : 'Create Goal'}
            </button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Contribute to Goal Dialog */}
      <Dialog open={!!contributeGoalId} onOpenChange={(open) => !open && setContributeGoalId(null)}>
        <DialogContent className="sm:max-w-md glass-card !bg-background/95 backdrop-blur-2xl">
          <DialogHeader>
            <DialogTitle className="font-black uppercase tracking-tight">Add Funds</DialogTitle>
            <DialogDescription className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
              Contribute toward your goal
            </DialogDescription>
          </DialogHeader>
          <form action={handleContribute} className="space-y-6 pt-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Amount</Label>
              <Input name="amount" type="number" step="0.01" min="0.01" required className="h-12 rounded-xl bg-muted/20 border-border/50 text-sm font-bold tabular-nums" />
            </div>
            <button type="submit" disabled={contributeLoading} className="w-full h-12 rounded-xl bg-foreground text-background text-[11px] font-black uppercase tracking-widest transition-all disabled:opacity-40 active:scale-[0.98] shadow-2xl">
              {contributeLoading ? 'Adding...' : 'Add Funds'}
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </PageWrapper>
  );
}

// ─── General Limit Card Component ───
function GeneralLimitCard({ label, icon, limit, spent, onEdit, onDelete }: {
  label: string;
  icon: React.ReactNode;
  limit: any;
  spent: number;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const limitCents = limit?.limit_cents || 0;
  const pct = limitCents > 0 ? (spent / limitCents) * 100 : 0;
  const isOver = pct >= 100;
  const remaining = limitCents - spent;

  return (
    <div className="glass-card p-6 group relative overflow-hidden">
      {/* Background progress bar */}
      {limitCents > 0 && (
        <div className="absolute inset-x-0 bottom-0 h-1 bg-foreground/5 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(pct, 100)}%` }}
            transition={{ duration: 0.8 }}
            className={`h-full ${isOver ? 'bg-destructive' : 'bg-foreground'}`}
          />
        </div>
      )}

      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${isOver ? 'bg-destructive/10 text-destructive' : 'bg-foreground/5 text-foreground/50'}`}>
            {icon}
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</p>
        </div>
        <div className="flex items-center gap-1">
          {limit && (
            <button
              onClick={onDelete}
              className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {limitCents > 0 ? (
        <>
          <div className="flex items-baseline gap-2 mb-2">
            <p className="text-3xl font-black tabular-nums tracking-tighter">{formatCurrency(spent)}</p>
            <p className="text-sm font-bold text-muted-foreground">/ {formatCurrency(limitCents)}</p>
          </div>
          <div className={`inline-flex px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${isOver ? 'bg-destructive/10 text-destructive' : 'bg-foreground/5 text-muted-foreground'}`}>
            {remaining >= 0 ? `${formatCurrency(remaining)} left` : `${formatCurrency(Math.abs(remaining))} over`}
          </div>
        </>
      ) : (
        <button
          onClick={onEdit}
          className="flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors mt-2"
        >
          <PlusCircle className="h-4 w-4" /> Set a {label.toLowerCase()}
        </button>
      )}
    </div>
  );
}
