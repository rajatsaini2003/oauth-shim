/**
 * Periodically prunes stale entries from all registered repositories.
 * Depends on any repository that implements pruneOlderThan(seconds).
 */
export class CleanupService {
  #repositories;
  #intervalMs;
  #maxAgeSeconds;
  #timer = null;

  /**
   * @param {Array<{ pruneOlderThan(s: number): void }>} repositories
   * @param {{ intervalMs?: number, maxAgeSeconds?: number }} options
   */
  constructor(repositories, { intervalMs = 5 * 60 * 1000, maxAgeSeconds = 15 * 60 } = {}) {
    this.#repositories = repositories;
    this.#intervalMs   = intervalMs;
    this.#maxAgeSeconds = maxAgeSeconds;
  }

  start() {
    this.#timer = setInterval(() => this.#prune(), this.#intervalMs);
    this.#timer.unref(); // don't keep the process alive on its own
  }

  stop() {
    if (this.#timer) {
      clearInterval(this.#timer);
      this.#timer = null;
    }
  }

  #prune() {
    for (const repo of this.#repositories) {
      repo.pruneOlderThan(this.#maxAgeSeconds);
    }
  }
}
