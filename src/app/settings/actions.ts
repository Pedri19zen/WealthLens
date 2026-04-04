'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Not authenticated' }
  }

  const currency_code = formData.get('currency_code') as string
  const locale = formData.get('locale') as string
  const week_start = formData.get('week_start') as string

  const { error } = await supabase
    .from('profiles')
    .update({
      currency_code,
      locale,
      week_start
    })
    .eq('id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/settings')
  revalidatePath('/', 'layout')
  
  return { success: true }
}
