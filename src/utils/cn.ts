/**
 * Joins conditional class names.
 *
 * Deliberately not `clsx` or `tailwind-merge`: the app needs exactly this, and a
 * dependency whose whole API is one eight-line function is a dependency that
 * only exists to be audited later.
 */
export function cn(...values: (string | false | null | undefined)[]): string {
  return values.filter((value) => typeof value === 'string' && value !== '').join(' ')
}
