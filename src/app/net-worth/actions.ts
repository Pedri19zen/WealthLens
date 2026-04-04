'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addNetWorthItem(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const valueInput = parseFloat(formData.get('value') as string)
  if (isNaN(valueInput) || valueInput < 0) return { error: 'Invalid value' }

  const value_cents = Math.round(valueInput * 100)

  const { error } = await supabase.from('net_worth_items').insert({
    user_id: user.id,
    name: formData.get('name') as string,
    item_type: formData.get('item_type') as string, // 'asset' | 'liability'
    asset_category: formData.get('category') as string,
    value_cents,
  })

  if (error) return { error: error.message }

  revalidatePath('/net-worth')
  revalidatePath('/', 'layout')
  
  return { success: true }
}

export async function snapshotNetWorth(totalAssets: number, totalLiabilities: number, netWorth: number) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase.from('net_worth_snapshots').insert({
    user_id: user.id,
    total_assets_cents: totalAssets,
    total_liabilities_cents: totalLiabilities,
    net_worth_cents: netWorth,
  })

  if (error) return { error: error.message }

  revalidatePath('/net-worth')
  return { success: true }
}
