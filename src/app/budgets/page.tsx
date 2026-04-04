import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import BudgetClient from './budget-client'
import { format, subDays } from 'date-fns'

export default async function BudgetsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const now = new Date()
  const currentMonth = format(now, 'yyyy-MM')
  const startOfMonth = `${currentMonth}-01`
  const nextMonthDate = new Date(currentMonth + '-01')
  nextMonthDate.setMonth(nextMonthDate.getMonth() + 1)
  const endOfMonth = format(nextMonthDate, 'yyyy-MM-dd')
  const startOfWeek = format(subDays(now, 7), 'yyyy-MM-dd')

  const [
    { data: budgets },
    { data: expenses },
    { data: generalLimits },
    { data: savingsGoals },
    { data: weekExpenses }
  ] = await Promise.all([
    supabase
      .from('budgets')
      .select('*')
      .eq('user_id', user.id)
      .eq('month', currentMonth),
    supabase
      .from('transactions')
      .select('category, amount_cents')
      .eq('user_id', user.id)
      .eq('type', 'expense')
      .gte('date', startOfMonth)
      .lt('date', endOfMonth),
    supabase
      .from('general_budget_limits')
      .select('*')
      .eq('user_id', user.id),
    supabase
      .from('savings_goals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('transactions')
      .select('amount_cents')
      .eq('user_id', user.id)
      .eq('type', 'expense')
      .gte('date', startOfWeek)
  ])

  const spentByCategory = (expenses || []).reduce((acc: Record<string, number>, tx) => {
    acc[tx.category] = (acc[tx.category] || 0) + tx.amount_cents
    return acc
  }, {})

  const monthlySpent = (expenses || []).reduce((acc, tx) => acc + tx.amount_cents, 0)
  const weeklySpent = (weekExpenses || []).reduce((acc, tx) => acc + tx.amount_cents, 0)

  return (
    <BudgetClient
      budgets={budgets || []}
      spentByCategory={spentByCategory}
      currentMonth={currentMonth}
      generalLimits={generalLimits || []}
      savingsGoals={savingsGoals || []}
      monthlySpent={monthlySpent}
      weeklySpent={weeklySpent}
    />
  )
}
