/**
 * Repository contract:
 *   save(clientId: string): void
 *   exists(clientId: string): boolean
 *   pruneOlderThan(seconds: number): void
 */
export class InMemoryClientRepository {
  /** @type {Map<string, number>} clientId → unix seconds */
  #clients = new Map();

  /** @param {string} clientId */
  save(clientId) {
    this.#clients.set(clientId, Math.floor(Date.now() / 1000));
  }

  /** @param {string} clientId @returns {boolean} */
  exists(clientId) {
    return this.#clients.has(clientId);
  }

  /** @param {number} seconds */
  pruneOlderThan(seconds) {
    const cutoff = Math.floor(Date.now() / 1000) - seconds;
    for (const [id, createdAt] of this.#clients) {
      if (createdAt < cutoff) this.#clients.delete(id);
    }
  }
}
