'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addTransaction(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const amount = parseFloat(formData.get('amount') as string)
  if (isNaN(amount) || amount <= 0) return { error: 'Invalid amount' }

  // Amount is stored in cents
  const amount_cents = Math.round(amount * 100)
  
  const is_recurring = formData.get('is_recurring') === 'on'

  const { error } = await supabase.from('transactions').insert({
    user_id: user.id,
    type: formData.get('type') as string,
    amount_cents,
    category: formData.get('category') as string,
    description: formData.get('description') as string,
    date: formData.get('date') as string,
    is_recurring,
  })

  if (error) return { error: error.message }

  // If recurring, we would also add to recurring_templates in a real scenario
  // Let's implement that logic if needed, but for now just transaction.

  revalidatePath('/transactions')
  revalidatePath('/', 'layout')
  
  return { success: true }
}

export async function deleteTransaction(id: string) {
  const supabase = await createClient()

  const { error } = await supabase.from('transactions').delete().eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/transactions')
  revalidatePath('/', 'layout')
  
  return { success: true }
}

export async function bulkDeleteTransactions(ids: string[]) {
  const supabase = await createClient()

  const { error } = await supabase.from('transactions').delete().in('id', ids)

  if (error) return { error: error.message }

  revalidatePath('/transactions')
  revalidatePath('/', 'layout')
  
  return { success: true }
}
