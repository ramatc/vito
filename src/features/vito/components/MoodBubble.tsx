import { cn } from '../../../utils/cn'

/**
 * What Vito is saying, in a speech bubble with a tail.
 *
 * Presentational on purpose: the copy arrives as props from
 * `features/vito/copy/moodMessages`, which is the one file where the product's
 * voice gets reviewed.
 *
 * The bubble is a polite live region. Completing a habit changes what Vito says
 * — often the most human feedback in the app — and without this a screen reader
 * hears only the XP toast. Polite, never assertive: a mood is worth mentioning
 * when the user next pauses, never worth cutting them off mid-sentence.
 */

export interface MoodBubbleProps {
  headline: string
  body: string
  className?: string
}

export function MoodBubble({ headline, body, className }: MoodBubbleProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn('relative max-w-xs text-center', className)}
    >
      {/* The tail, pointing back up at Vito. Decorative, so it stays unlabelled. */}
      <span
        aria-hidden="true"
        className="absolute -top-1.5 left-1/2 size-3 -translate-x-1/2 rotate-45 rounded-sm bg-white ring-1 ring-slate-200"
      />
      <div className="relative rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-200">
        <p className="text-sm font-medium text-slate-900">{headline}</p>
        <p className="mt-0.5 text-sm text-slate-600">{body}</p>
      </div>
    </div>
  )
}
