'use client';

import * as React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { formatCurrency } from '@/lib/utils/formatters';
import { PageWrapper, FadeIn, StaggerContainer, StaggerItem } from '@/components/motion-wrapper';
import { format, subDays, parseISO, startOfMonth, endOfMonth, eachMonthOfInterval } from 'date-fns';

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

export default function AnalyticsCharts({ transactions }: { transactions: any[] }) {
  const [period, setPeriod] = React.useState('365');

  // Filter transactions by period
  const filteredTx = React.useMemo(() => {
    if (period === 'all') return transactions;
    const cutoff = subDays(new Date(), parseInt(period));
    return transactions.filter(tx => new Date(tx.date) >= cutoff);
  }, [transactions, period]);

  // Income vs Expense by month
  const incomeVsExpense = React.useMemo(() => {
    if (filteredTx.length === 0) return [];
    const dates = filteredTx.map(tx => new Date(tx.date));
    const minDate = startOfMonth(new Date(Math.min(...dates.map(d => d.getTime()))));
    const maxDate = endOfMonth(new Date(Math.max(...dates.map(d => d.getTime()))));
    const months = eachMonthOfInterval({ start: minDate, end: maxDate });

    return months.map(month => {
      const monthStr = format(month, 'yyyy-MM');
      const label = format(month, 'MMM');
      const monthTx = filteredTx.filter(tx => tx.date.startsWith(monthStr));
      const income = monthTx.filter(tx => tx.type === 'income').reduce((s, tx) => s + tx.amount_cents, 0) / 100;
      const expense = monthTx.filter(tx => tx.type === 'expense').reduce((s, tx) => s + tx.amount_cents, 0) / 100;
      return { name: label, income, expense };
    });
  }, [filteredTx]);

  // Category spending breakdown
  const categoryData = React.useMemo(() => {
    const expenses = filteredTx.filter(tx => tx.type === 'expense');
    const byCategory: Record<string, number> = {};
    expenses.forEach(tx => {
      byCategory[tx.category] = (byCategory[tx.category] || 0) + tx.amount_cents;
    });
    return Object.entries(byCategory)
      .map(([name, value]) => ({ name, value: value / 100 }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [filteredTx]);

  // Net savings trend
  const netSavings = React.useMemo(() => {
    if (filteredTx.length === 0) return [];
    const dates = filteredTx.map(tx => new Date(tx.date));
    const minDate = startOfMonth(new Date(Math.min(...dates.map(d => d.getTime()))));
    const maxDate = endOfMonth(new Date(Math.max(...dates.map(d => d.getTime()))));
    const months = eachMonthOfInterval({ start: minDate, end: maxDate });

    return months.map(month => {
      const monthStr = format(month, 'yyyy-MM');
      const label = format(month, 'MMM');
      const monthTx = filteredTx.filter(tx => tx.date.startsWith(monthStr));
      const income = monthTx.filter(tx => tx.type === 'income').reduce((s, tx) => s + tx.amount_cents, 0) / 100;
      const expense = monthTx.filter(tx => tx.type === 'expense').reduce((s, tx) => s + tx.amount_cents, 0) / 100;
      return { name: label, net: income - expense };
    });
  }, [filteredTx]);

  const hasData = filteredTx.length > 0;

  return (
    <PageWrapper>
      <FadeIn>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
            <p className="text-muted-foreground mt-1">Deep dive into your financial data</p>
          </div>
          <Select value={period} onValueChange={(val) => setPeriod(val || '365')}>
            <SelectTrigger className="w-[160px] rounded-xl bg-muted/50 border-border/50">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="180">Last 6 months</SelectItem>
              <SelectItem value="365">Last 12 months</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </FadeIn>

      {!hasData ? (
        <FadeIn delay={0.1}>
          <div className="glass-card p-12 text-center">
            <p className="text-muted-foreground">No transaction data yet. Add some transactions to see your analytics!</p>
          </div>
        </FadeIn>
      ) : (
        <StaggerContainer className="grid gap-5 md:grid-cols-2">
          <StaggerItem>
            <div className="glass-card p-6">
              <h3 className="font-semibold mb-1">Income vs Expenses</h3>
              <p className="text-sm text-muted-foreground mb-4">Monthly comparison</p>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={incomeVsExpense}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <RechartsTooltip
                      cursor={{ fill: 'transparent' }}
                      contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: '12px', fontSize: '13px' }}
                    />
                    <Bar dataKey="income" fill="#10B981" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="expense" fill="#F43F5E" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </StaggerItem>

          <StaggerItem>
            <div className="glass-card p-6">
              <h3 className="font-semibold mb-1">Spending by Category</h3>
              <p className="text-sm text-muted-foreground mb-4">Expense breakdown</p>
              <div className="h-[280px] flex items-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {categoryData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      formatter={(val: any) => formatCurrency((val as number) * 100)}
                      contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: '12px', fontSize: '13px' }}
                    />
                    <Legend
                      verticalAlign="middle"
                      align="right"
                      layout="vertical"
                      wrapperStyle={{ fontSize: '12px', right: 0 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </StaggerItem>

          <StaggerItem className="md:col-span-2">
            <div className="glass-card p-6">
              <h3 className="font-semibold mb-1">Net Savings Trend</h3>
              <p className="text-sm text-muted-foreground mb-4">Monthly net income over time</p>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={netSavings}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <RechartsTooltip
                      contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: '12px', fontSize: '13px' }}
                    />
                    <Line type="monotone" dataKey="net" stroke="#10B981" strokeWidth={2.5} dot={{ r: 4, fill: '#10B981' }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </StaggerItem>
        </StaggerContainer>
      )}
    </PageWrapper>
  );
}
