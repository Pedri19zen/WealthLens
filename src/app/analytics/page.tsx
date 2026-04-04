import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AnalyticsCharts from './charts'

export default async function AnalyticsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: true })

  return <AnalyticsCharts transactions={transactions || []} />
}
