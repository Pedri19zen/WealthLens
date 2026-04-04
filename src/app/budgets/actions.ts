'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// ─── Per-Category Budget Limits ───

export async function setBudgetLimit(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const category = formData.get('category') as string
  const limitInput = parseFloat(formData.get('limit') as string)
  const month = formData.get('month') as string // 'YYYY-MM'

  if (!category || isNaN(limitInput) || limitInput <= 0 || !month) {
    return { error: 'Invalid input' }
  }

  const limit_cents = Math.round(limitInput * 100)

  const { error } = await supabase
    .from('budgets')
    .upsert(
      { user_id: user.id, category, limit_cents, month },
      { onConflict: 'user_id, category, month' }
    )

  if (error) return { error: error.message }

  revalidatePath('/budgets')
  revalidatePath('/', 'layout')
  
  return { success: true }
}

export async function deleteBudgetLimit(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const category = formData.get('category') as string
  const month = formData.get('month') as string

  if (!category || !month) return { error: 'Invalid input' }

  const { error } = await supabase
    .from('budgets')
    .delete()
    .eq('user_id', user.id)
    .eq('category', category)
    .eq('month', month)

  if (error) return { error: error.message }

  revalidatePath('/budgets')
  revalidatePath('/', 'layout')
  
  return { success: true }
}

// ─── General Budget Limits (Monthly / Weekly) ───

export async function setGeneralLimit(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const period = formData.get('period') as string
  const limitInput = parseFloat(formData.get('limit') as string)

  if (!period || !['weekly', 'monthly'].includes(period) || isNaN(limitInput) || limitInput <= 0) {
    return { error: 'Invalid input' }
  }

  const limit_cents = Math.round(limitInput * 100)

  const { error } = await supabase
    .from('general_budget_limits')
    .upsert(
      { user_id: user.id, period, limit_cents },
      { onConflict: 'user_id, period' }
    )

  if (error) return { error: error.message }

  revalidatePath('/budgets')
  return { success: true }
}

export async function deleteGeneralLimit(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const period = formData.get('period') as string
  if (!period) return { error: 'Invalid input' }

  const { error } = await supabase
    .from('general_budget_limits')
    .delete()
    .eq('user_id', user.id)
    .eq('period', period)

  if (error) return { error: error.message }

  revalidatePath('/budgets')
  return { success: true }
}

// ─── Savings Goals ───

export async function createSavingsGoal(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const name = formData.get('name') as string
  const targetInput = parseFloat(formData.get('target') as string)

  if (!name || isNaN(targetInput) || targetInput <= 0) {
    return { error: 'Invalid input' }
  }

  const target_cents = Math.round(targetInput * 100)

  const { error } = await supabase
    .from('savings_goals')
    .insert({ user_id: user.id, name, target_cents, current_cents: 0 })

  if (error) return { error: error.message }

  revalidatePath('/budgets')
  return { success: true }
}

export async function contributeSavingsGoal(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const goalId = formData.get('goalId') as string
  const amountInput = parseFloat(formData.get('amount') as string)

  if (!goalId || isNaN(amountInput) || amountInput <= 0) {
    return { error: 'Invalid input' }
  }

  const amount_cents = Math.round(amountInput * 100)

  // Get the current goal
  const { data: goal, error: fetchError } = await supabase
    .from('savings_goals')
    .select('current_cents')
    .eq('id', goalId)
    .eq('user_id', user.id)
    .single()

  if (fetchError || !goal) return { error: 'Goal not found' }

  const { error } = await supabase
    .from('savings_goals')
    .update({ current_cents: goal.current_cents + amount_cents })
    .eq('id', goalId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/budgets')
  return { success: true }
}

export async function deleteSavingsGoal(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const goalId = formData.get('goalId') as string
  if (!goalId) return { error: 'Invalid input' }

  const { error } = await supabase
    .from('savings_goals')
    .delete()
    .eq('id', goalId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/budgets')
  return { success: true }
}
