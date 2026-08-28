import type { Repositories } from '../services/storage/repositories'

/**
 * Where the stores find their persistence.
 *
 * The stores are module singletons, so they cannot take `Repositories` as a
 * constructor argument without a React context that every non-component caller
 * would also have to thread through. Instead `bootstrap.ts` binds the instance
 * once at startup and the stores read it here.
 *
 * The seam is the point: a test binds an in-memory `Repositories` and the real
 * stores run against it unchanged, which is exactly what the interface exists
 * for. No store ever names `localStorage` or a storage key.
 */
let repositories: Repositories | null = null

export function setRepositories(next: Repositories): void {
  repositories = next
}

/**
 * Throws rather than lazily calling `createRepositories()`, because a store
 * action running before bootstrap is a wiring bug. Falling back silently would
 * hide it behind data that looks empty for no visible reason.
 */
export function getRepositories(): Repositories {
  if (repositories === null) {
    throw new Error(
      'Repositories are not bound yet — call bootstrap() before using a store.',
    )
  }

  return repositories
}
