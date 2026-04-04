'use client';

import * as React from 'react';
import { formatCurrency } from '@/lib/utils/formatters';
import { CATEGORY_ICONS } from '@/lib/utils/categories';
import { format } from 'date-fns';
import Link from 'next/link';
import { PageWrapper, FadeIn, StaggerContainer, StaggerItem, GlassCard } from '@/components/motion-wrapper';
import { ArrowUpRight, ArrowDownRight, TrendingUp, Wallet, ArrowRight } from 'lucide-react';
import { QuickAdd } from '@/components/quick-add';
import { PieChart as RePieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface Props {
  balance: number;
  monthIncome: number;
  monthExpense: number;
  monthNet: number;
  recentTransactions: any[];
  currentMonthLabel: string;
  frequentCategories: { category: string; type: string; count: number }[];
  chartData7d: { name: string; value: number }[];
  chartData30d: { name: string; value: number }[];
}

const CHART_COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

export default function DashboardClient({ 
  balance, 
  monthIncome, 
  monthExpense, 
  monthNet, 
  recentTransactions, 
  currentMonthLabel, 
  frequentCategories,
  chartData7d,
  chartData30d
}: Props) {
  const [timeRange, setTimeRange] = React.useState<'7d' | '30d'>('30d');
  const rawData = timeRange === '7d' ? chartData7d : chartData30d;

  // Sort once and memoize so legend dots always match pie segments
  const activeChartData = React.useMemo(
    () => [...rawData].sort((a, b) => b.value - a.value),
    [rawData]
  );

  const totalValue = React.useMemo(
    () => activeChartData.reduce((acc, curr) => acc + curr.value, 0),
    [activeChartData]
  );

  return (
    <PageWrapper>
      <FadeIn className="mb-8">
        <h2 className="text-3xl sm:text-4xl font-black tracking-tight uppercase">Overview</h2>
        <p className="text-muted-foreground mt-1 text-sm font-medium tracking-wide opacity-80">
          Your finances for {currentMonthLabel}
        </p>
      </FadeIn>

      <StaggerContainer className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4 mb-8">
        <StaggerItem>
          <GlassCard className="flex flex-col justify-between min-h-[140px] !p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-muted-foreground">Total Balance</span>
              <div className="p-2 rounded-full bg-foreground/5">
                <Wallet className="h-4 w-4 text-foreground/60" />
              </div>
            </div>
            <div>
              <p className={`text-xl sm:text-2xl font-black tracking-tight ${balance >= 0 ? '' : 'text-destructive'}`}>
                {formatCurrency(balance)}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground mt-1">All time</p>
            </div>
          </GlassCard>
        </StaggerItem>

        <StaggerItem>
          <GlassCard className="flex flex-col justify-between min-h-[140px] !p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-muted-foreground">Income</span>
              <div className="p-2 rounded-full bg-foreground/5">
                <ArrowUpRight className="h-4 w-4 text-foreground/60" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-black tracking-tight">
              {formatCurrency(monthIncome)}
            </p>
          </GlassCard>
        </StaggerItem>

        <StaggerItem>
          <GlassCard className="flex flex-col justify-between min-h-[140px] !p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-muted-foreground">Expenses</span>
              <div className="p-2 rounded-full bg-foreground/5">
                <ArrowDownRight className="h-4 w-4 text-foreground/60" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-black tracking-tight">
              {formatCurrency(monthExpense)}
            </p>
          </GlassCard>
        </StaggerItem>

        <StaggerItem>
          <GlassCard className="flex flex-col justify-between min-h-[140px] !p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-muted-foreground">Net Savings</span>
              <div className="p-2 rounded-full bg-foreground/5">
                <TrendingUp className="h-4 w-4 text-foreground/60" />
              </div>
            </div>
            <p className={`text-xl sm:text-2xl font-black tracking-tight ${monthNet < 0 ? 'text-destructive' : ''}`}>
              {formatCurrency(monthNet)}
            </p>
          </GlassCard>
        </StaggerItem>
      </StaggerContainer>

      {/* Quick Add */}
      <FadeIn delay={0.15} className="mb-8">
        <QuickAdd frequentCategories={frequentCategories} />
      </FadeIn>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3 mb-8">
        {/* Expense Distribution Chart */}
        <FadeIn delay={0.2} className="lg:col-span-2">
          <div className="glass-card h-full min-h-[420px] flex flex-col p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-black text-lg uppercase tracking-tight">Expense Distribution</h3>
                <p className="text-xs font-medium text-muted-foreground mt-0.5">Where your money is going</p>
              </div>
              <div className="flex p-1 bg-muted/30 rounded-xl border border-border/50">
                <button
                  onClick={() => setTimeRange('7d')}
                  className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${timeRange === '7d' ? 'bg-foreground text-background shadow-lg' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  7 Days
                </button>
                <button
                  onClick={() => setTimeRange('30d')}
                  className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${timeRange === '30d' ? 'bg-foreground text-background shadow-lg' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  30 Days
                </button>
              </div>
            </div>

            {activeChartData.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-sm text-muted-foreground italic">No expenses in this period</p>
              </div>
            ) : (
              <div className="flex-1 min-h-[300px] flex flex-col sm:flex-row items-center gap-6">
                <div className="w-full sm:flex-1 h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        data={activeChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={75}
                        outerRadius={105}
                        paddingAngle={3}
                        dataKey="value"
                        stroke="none"
                        animationBegin={0}
                        animationDuration={600}
                      >
                        {activeChartData.map((_, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={CHART_COLORS[index % CHART_COLORS.length]} 
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const val = payload[0].value as number;
                            const pct = totalValue > 0 ? Math.round((val / totalValue) * 100) : 0;
                            return (
                              <div className="bg-background/95 backdrop-blur-xl border border-border/50 px-4 py-3 rounded-xl shadow-2xl">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">{payload[0].name}</p>
                                <p className="text-sm font-black">{formatCurrency(val * 100)}</p>
                                <p className="text-[10px] font-bold text-muted-foreground mt-0.5">{pct}% of total</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </RePieChart>
                  </ResponsiveContainer>
                </div>

                <div className="w-full sm:w-52 space-y-2.5">
                  {activeChartData.slice(0, 6).map((item, index) => {
                    const pct = totalValue > 0 ? Math.round((item.value / totalValue) * 100) : 0;
                    return (
                      <div key={item.name} className="flex items-center justify-between group">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} />
                          <span className="text-xs font-bold truncate text-muted-foreground group-hover:text-foreground transition-colors">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] font-black tabular-nums">{pct}%</span>
                        </div>
                      </div>
                    );
                  })}
                  {activeChartData.length > 6 && (
                    <p className="text-[10px] text-muted-foreground italic pl-5">+{activeChartData.length - 6} more</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </FadeIn>

        {/* Recent Transactions */}
        <FadeIn delay={0.25}>
          <div className="glass-card h-full p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-black text-lg uppercase tracking-tight">Recents</h3>
                <p className="text-xs font-medium text-muted-foreground mt-0.5">Latest activity</p>
              </div>
              <Link href="/transactions" className="p-2 rounded-full hover:bg-muted/50 transition-colors">
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            
            <div className="space-y-1">
              {recentTransactions.length === 0 ? (
                <p className="text-xs text-muted-foreground py-8 text-center italic">No recent transactions</p>
              ) : recentTransactions.map((tx) => {
                const Icon = CATEGORY_ICONS[tx.category];
                const isExpense = tx.type === 'expense';
                return (
                  <div key={tx.id} className="flex items-center justify-between py-3 px-2 rounded-xl hover:bg-foreground/[0.03] transition-colors group">
                    <div className="flex items-center gap-3 min-w-0 flex-1 mr-3">
                      <div className="p-2 rounded-full bg-foreground/[0.04] text-foreground/50 group-hover:bg-foreground group-hover:text-background transition-all shrink-0">
                        {Icon && <Icon className="w-3.5 h-3.5" />}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-[13px] tracking-tight truncate">{tx.description || tx.category}</p>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-60">{format(new Date(tx.date), 'MMM d')}</p>
                      </div>
                    </div>
                    <span className={`font-black text-xs tabular-nums ${isExpense ? '' : 'text-emerald-500'}`}>
                      {isExpense ? '-' : '+'}{formatCurrency(tx.amount_cents)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </FadeIn>
      </div>
    </PageWrapper>
  );
}
