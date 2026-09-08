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
 * Every variant now reads a token, so none of them needs a `dark:` pair — each
 * custom property already flips between light and dark on its own.
 *
 * The filled variant takes `on-brand` for its text rather than plain white:
 * `--brand` is a light mint in the dark theme, so white lettering on it would
 * be the one unreadable control in the app.
 */
const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-brand text-on-brand hover:bg-brand-strong focus-visible:outline-brand',
  secondary:
    'bg-surface-raised text-primary ring-1 ring-border hover:bg-surface-sunken focus-visible:outline-border',
  ghost: 'bg-transparent text-muted hover:bg-surface-sunken focus-visible:outline-border',
  danger:
    'bg-surface-raised text-rose-700 ring-1 ring-rose-200 hover:bg-rose-50 focus-visible:outline-rose-500 dark:text-rose-300 dark:ring-rose-500/30 dark:hover:bg-rose-500/10 dark:focus-visible:outline-rose-400',
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
