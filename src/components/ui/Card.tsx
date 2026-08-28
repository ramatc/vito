import type { HTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

/** A plain surface. Nothing clever — one place to change the app's card look. */
export function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('rounded-2xl bg-white p-4 ring-1 ring-slate-200', className)}
      {...rest}
    />
  )
}
