import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import TransactionClient from './transaction-client'

export default async function TransactionsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: transactions, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching transactions:', error)
  }

  return <TransactionClient initialTransactions={transactions || []} />
}
