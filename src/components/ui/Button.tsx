import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

/**
 * The app's only button. Every tap target is at least 44px tall because the
 * design baseline is a 375px phone, where a 32px control is a miss waiting to
 * happen.
 */

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
export type ButtonSize = 'md' | 'sm'

/*
 * Each variant carries its light classes and their `dark:` pair.
 *
 * The filled variant inverts rather than darkens: `--brand` is a light mint in
 * the dark theme, so white lettering on it would be the one unreadable control
 * in the app. It takes `--surface` for its text instead, which is the darkest
 * value the theme owns.
 */
const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:outline-emerald-600 dark:bg-brand dark:text-surface dark:hover:bg-emerald-300 dark:focus-visible:outline-brand',
  secondary:
    'bg-white text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50 focus-visible:outline-slate-400 dark:bg-surface-raised dark:text-primary dark:ring-slate-700 dark:hover:bg-slate-700 dark:focus-visible:outline-slate-500',
  ghost:
    'bg-transparent text-slate-600 hover:bg-slate-100 focus-visible:outline-slate-400 dark:text-muted dark:hover:bg-slate-700 dark:focus-visible:outline-slate-500',
  danger:
    'bg-white text-rose-700 ring-1 ring-rose-200 hover:bg-rose-50 focus-visible:outline-rose-500 dark:bg-surface-raised dark:text-rose-300 dark:ring-rose-500/30 dark:hover:bg-rose-500/10 dark:focus-visible:outline-rose-400',
}

const SIZE_CLASSES: Record<ButtonSize, string> = {
  md: 'min-h-11 px-4 text-sm',
  sm: 'min-h-9 px-3 text-xs',
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      // Explicit default: an unset `type` inside a form is `submit`, which turns
      // every icon button into an accidental form submission.
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors',
        'focus-visible:outline-2 focus-visible:outline-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        fullWidth && 'w-full',
        className,
      )}
      {...rest}
    />
  )
}
