import { cn } from '../../../utils/cn'

/**
 * What Vito is saying, read as part of him rather than a reply from a
 * separate surface.
 *
 * Presentational on purpose: the copy arrives as props from
 * `features/vito/copy/moodMessages`, which is the one file where the product's
 * voice gets reviewed.
 *
 * A polite live region, not a card. Completing a habit changes what Vito says
 * — often the most human feedback in the app — and without this a screen
 * reader hears only the XP toast. Polite, never assertive: a mood is worth
 * mentioning when the user next pauses, never worth cutting them off
 * mid-sentence.
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
      className={cn('flex max-w-xs flex-col items-center gap-1 text-center', className)}
    >
      <p className="text-base font-semibold text-primary">{headline}</p>
      <p className="text-sm leading-relaxed text-muted">{body}</p>
    </div>
  )
}
