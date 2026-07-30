'use client'

import * as React from 'react'
import { Moon, Sun, Monitor } from 'lucide-react'
import { useTheme } from 'next-themes'

import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0)
    return () => clearTimeout(timer)
  }, [])

  const cycleTheme = () => {
    if (theme === 'light') setTheme('dark')
    else if (theme === 'dark') setTheme('system')
    else setTheme('light')
  }

  const label = mounted
    ? theme === 'light'
      ? 'Light mode'
      : theme === 'dark'
        ? 'Dark mode'
        : 'System theme'
    : 'Toggle theme'

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={cycleTheme}
            aria-label={label}
          />
        }
      >
        {mounted && theme === 'dark' ? (
          <Moon className="h-4 w-4" />
        ) : mounted && theme === 'system' ? (
          <Monitor className="h-4 w-4" />
        ) : (
          <Sun className="h-4 w-4" />
        )}
      </TooltipTrigger>
      <TooltipContent side="bottom" sideOffset={8}>
        {label}
      </TooltipContent>
    </Tooltip>
  )
}
