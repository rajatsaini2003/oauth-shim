/**
 * Repository contract:
 *   save(shimState, originalRedirectUri, originalState): void
 *   getAndRemove(shimState): PendingAuth | null
 *   pruneOlderThan(seconds): void
 *
 * @typedef {{ originalRedirectUri: string, originalState: string, createdAt: number }} PendingAuth
 */
export class InMemoryPendingAuthRepository {
  /** @type {Map<string, PendingAuth>} shimState → pending auth */
  #pending = new Map();

  /**
   * @param {string} shimState
   * @param {string} originalRedirectUri
   * @param {string} originalState
   */
  save(shimState, originalRedirectUri, originalState) {
    this.#pending.set(shimState, {
      originalRedirectUri,
      originalState,
      createdAt: Math.floor(Date.now() / 1000),
    });
  }

  /**
   * @param {string} shimState
   * @returns {PendingAuth | null}
   */
  getAndRemove(shimState) {
    const entry = this.#pending.get(shimState);
    if (!entry) return null;
    this.#pending.delete(shimState);
    return entry;
  }

  /** @param {number} seconds */
  pruneOlderThan(seconds) {
    const cutoff = Math.floor(Date.now() / 1000) - seconds;
    for (const [state, entry] of this.#pending) {
      if (entry.createdAt < cutoff) this.#pending.delete(state);
    }
  }
}
