import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateProfile } from './actions'

export default async function SettingsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-black uppercase tracking-tighter">Settings</h2>
        <p className="text-muted-foreground mt-1 text-sm font-medium">Manage your account</p>
      </div>

      <div className="glass-card p-6 mb-5">
        <h3 className="font-semibold mb-1">Profile Preferences</h3>
        <p className="text-sm text-muted-foreground mb-5">Update your currency, locale, and interface preferences.</p>
        <form action={async (formData) => {
          'use server'
          await updateProfile(formData)
        }} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currency_code">Currency Code (e.g., EUR, USD, GBP)</Label>
            <Input id="currency_code" name="currency_code" defaultValue={profile?.currency_code || 'EUR'} className="rounded-xl bg-muted/50 border-border/50" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="locale">Locale (e.g., en-IE, en-US)</Label>
            <Input id="locale" name="locale" defaultValue={profile?.locale || 'en-IE'} className="rounded-xl bg-muted/50 border-border/50" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="week_start">First Day of Week</Label>
            <Input id="week_start" name="week_start" defaultValue={profile?.week_start || 'monday'} className="rounded-xl bg-muted/50 border-border/50" />
          </div>

          <button type="submit" className="px-6 py-2.5 rounded-xl bg-foreground text-background text-[10px] font-black uppercase tracking-widest transition-all active:scale-[0.98] shadow-xl">
            Save Preferences
          </button>
        </form>
      </div>

      <div className="glass-card p-6 !border-rose-500/20">
        <h3 className="font-semibold text-rose-600 dark:text-rose-400 mb-1">Danger Zone</h3>
        <p className="text-sm text-muted-foreground mb-4">Permanently delete your account and all associated data.</p>
        <button className="px-4 py-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 text-sm font-medium hover:bg-rose-500/20 transition-colors">
          Delete Account
        </button>
      </div>
    </div>
  )
}
