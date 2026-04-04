import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { format, subDays } from 'date-fns'
import DashboardClient from './dashboard-client'

export default async function DashboardPage() {
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

  const last7DaysStart = format(subDays(now, 7), 'yyyy-MM-dd')
  const last30DaysStart = format(subDays(now, 30), 'yyyy-MM-dd')

  // Fetch all data in parallel for faster load
  const [
    { data: recentTransactions },
    { data: monthTransactions },
    { data: last30DaysTx },
    { data: allTransactionsResponse }
  ] = await Promise.all([
    supabase
      .from('transactions')
      .select('id, type, amount_cents, category, date, description')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('transactions')
      .select('type, amount_cents')
      .eq('user_id', user.id)
      .gte('date', startOfMonth)
      .lt('date', endOfMonth),
    supabase
      .from('transactions')
      .select('type, amount_cents, category, date')
      .eq('user_id', user.id)
      .eq('type', 'expense')
      .gte('date', last30DaysStart),
    supabase
      .from('transactions')
      .select('type, amount_cents, category')
      .eq('user_id', user.id)
  ])

  const monthIncome = (monthTransactions || []).filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount_cents, 0)
  const monthExpense = (monthTransactions || []).filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount_cents, 0)
  const monthNet = monthIncome - monthExpense

  const allTx = allTransactionsResponse || []
  const allIncome = allTx.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount_cents, 0)
  const allExpense = allTx.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount_cents, 0)
  const balance = allIncome - allExpense

  // Aggregate for Donut Charts
  const aggregateByCategory = (txs: any[]) => {
    const map: Record<string, number> = {}
    txs.forEach(t => {
      map[t.category] = (map[t.category] || 0) + (t.amount_cents / 100)
    })
    return Object.entries(map).map(([name, value]) => ({ name, value }))
  }

  const last7DaysData = aggregateByCategory((last30DaysTx || []).filter(t => t.date >= last7DaysStart))
  const last30DaysData = aggregateByCategory(last30DaysTx || [])

  // Compute frequent categories for QuickAdd
  const categoryCount: Record<string, { count: number; type: string }> = {}
  allTx.forEach(tx => {
    if (!categoryCount[tx.category]) {
      categoryCount[tx.category] = { count: 0, type: tx.type }
    }
    categoryCount[tx.category].count++
  })

  const frequentCategories = Object.entries(categoryCount)
    .map(([category, { count, type }]) => ({ category, type, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)

  return (
    <DashboardClient
      balance={balance}
      monthIncome={monthIncome}
      monthExpense={monthExpense}
      monthNet={monthNet}
      recentTransactions={recentTransactions || []}
      currentMonthLabel={format(new Date(), 'MMMM yyyy')}
      frequentCategories={frequentCategories}
      chartData7d={last7DaysData}
      chartData30d={last30DaysData}
    />
  )
}
