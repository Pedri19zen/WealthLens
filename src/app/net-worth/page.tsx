import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import NetWorthClient from './net-worth-client'

export default async function NetWorthPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const [{ data: items }, { data: snapshots }] = await Promise.all([
    supabase
      .from('net_worth_items')
      .select('*')
      .eq('user_id', user.id),
    supabase
      .from('net_worth_snapshots')
      .select('*')
      .eq('user_id', user.id)
      .order('snapped_at', { ascending: true })
  ])


  return <NetWorthClient items={items || []} snapshots={snapshots || []} />
}
