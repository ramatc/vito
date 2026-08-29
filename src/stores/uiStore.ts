import { create } from 'zustand'
import { newId } from '../utils/id'

/**
 * Ephemeral UI state. Deliberately NOT persisted: a toast or a half-open modal
 * surviving a reload is a bug, not a feature.
 *
 * This store is a broadcast channel rather than a coupling. `habitStore` never
 * writes to it — it returns a `CompletionOutcome` and the hooks layer decides
 * what that means visually. The habit list and Vito's avatar live in different
 * subtrees, which is why a shared store beats prop drilling here.
 */

export type ReactionType = 'celebrate' | 'levelUp' | 'unlock' | 'wake'

export interface Reaction {
  type: ReactionType
  /**
   * Monotonic counter, and the whole reason this is not just a string.
   *
   * Two identical consecutive reactions (celebrate -> celebrate) would be
   * reference-equal state, React would not re-render, and the animation would
   * silently fail to replay. The nonce makes every emission distinct.
   */
  nonce: number
  /**
   * Wall-clock time the reaction was emitted.
   *
   * The only consumer of `reaction` is whichever `VitoAvatar` happens to be
   * mounted, and a habit can be completed from `/habits`, where nothing is
   * mounted to react. This timestamp is how a `VitoAvatar` that mounts later
   * — on navigating back to Home — can tell a reaction that just happened
   * apart from one it merely inherited from the store.
   */
  emittedAt: number
}

export interface Toast {
  id: string
  message: string
  tone: 'celebrate' | 'info'
}

export interface UiStore {
  reaction: Reaction | null
  toasts: Toast[]
  activeModal: string | null
  /** Set when persistence fails, so the UI can warn that progress may not save. */
  storageError: string | null
  emitReaction(type: ReactionType): void
  clearReaction(): void
  pushToast(toast: Omit<Toast, 'id'>): string
  dismissToast(id: string): void
  openModal(id: string): void
  closeModal(): void
  setStorageError(message: string): void
  clearStorageError(): void
}

let reactionNonce = 0

export const useUiStore = create<UiStore>()((set, get) => ({
  reaction: null,
  toasts: [],
  activeModal: null,
  storageError: null,

  emitReaction: (type) => {
    reactionNonce += 1
    set({ reaction: { type, nonce: reactionNonce, emittedAt: Date.now() } })
  },

  clearReaction: () => {
    set({ reaction: null })
  },

  pushToast: (toast) => {
    const id = newId()
    set({ toasts: [...get().toasts, { ...toast, id }] })

    return id
  },

  dismissToast: (id) => {
    set({ toasts: get().toasts.filter((toast) => toast.id !== id) })
  },

  openModal: (id) => {
    set({ activeModal: id })
  },

  closeModal: () => {
    set({ activeModal: null })
  },

  setStorageError: (message) => {
    set({ storageError: message })
  },

  clearStorageError: () => {
    set({ storageError: null })
  },
}))
