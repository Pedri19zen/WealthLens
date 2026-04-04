'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { type ThemeProviderProps } from 'next-themes'

// Suppress known React 19 / next-themes / base-ui development warnings
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  const orig = console.error;
  console.error = (...args: unknown[]) => {
    if (typeof args[0] === 'string') {
      const msg = args[0];
      if (
        msg.includes('Encountered a script tag') ||
        msg.includes('cannot be a descendant of') ||
        msg.includes('cannot contain a nested') ||
        msg.includes('does not recognize the') ||
        msg.includes('Hydration failed') ||
        msg.includes('did not match')
      ) {
        return;
      }
    }
    orig.apply(console, args);
  };
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [mounted, setMounted] = React.useState(false)
  
  React.useEffect(() => {
    setMounted(true)
  }, [])
  
  if (!mounted) {
    return <>{children}</>
  }
  
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
