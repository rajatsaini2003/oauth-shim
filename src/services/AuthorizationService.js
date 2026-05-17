import { randomBytes } from 'crypto';
import { BadRequestError } from '../errors/AppError.js';

/**
 * Manages the PKCE authorization flow:
 *   - Builds the Entra ID authorization URL (storing original redirect_uri in pending state)
 *   - Resolves the callback from Entra and redirects back to Claude Code
 */
export class AuthorizationService {
  #config;
  #pendingAuthRepository;

  /**
   * @param {{ entraBase: string, clientId: string, callbackUri: string, scope: string }} config
   * @param {{ save(state: string, uri: string, s: string): void, getAndRemove(state: string): object|null }} pendingAuthRepository
   */
  constructor(config, pendingAuthRepository) {
    this.#config = config;
    this.#pendingAuthRepository = pendingAuthRepository;
  }

  /**
   * @param {{ originalRedirectUri: string, originalState: string, codeChallenge: string, codeChallengeMethod?: string, loginHint?: string }} params
   * @returns {string} Entra ID authorization URL to redirect to
   */
  buildEntraAuthUrl({ originalRedirectUri, originalState, codeChallenge, codeChallengeMethod = 'S256', loginHint }) {
    if (!originalRedirectUri.toLowerCase().startsWith('http://localhost')) {
      throw new BadRequestError('redirect_uri must be http://localhost');
    }

    const shimState = randomBytes(16).toString('hex');
    this.#pendingAuthRepository.save(shimState, originalRedirectUri, originalState);

    const { entraBase, clientId, callbackUri, scope } = this.#config;

    const params = new URLSearchParams({
      client_id:             clientId,
      response_type:         'code',
      redirect_uri:          callbackUri,
      scope:                 `${scope} offline_access`,
      code_challenge:        codeChallenge,
      code_challenge_method: codeChallengeMethod,
      state:                 shimState,
    });

    if (loginHint) params.set('login_hint', loginHint);

    log(`Authorize → Entra (shimState=${shimState.slice(0, 8)}...)`);
    return `${entraBase}/authorize?${params}`;
  }

  /**
   * @param {string} shimState
   * @param {string} code
   * @returns {string} URL to redirect Claude Code's local listener to
   */
  resolvePendingAuth(shimState, code) {
    const pending = this.#pendingAuthRepository.getAndRemove(shimState);
    if (!pending) {
      throw new BadRequestError('Invalid or expired state — try connecting again');
    }

    const redirectBack = new URL(pending.originalRedirectUri);
    redirectBack.searchParams.set('code', code);
    if (pending.originalState) {
      redirectBack.searchParams.set('state', pending.originalState);
    }

    log('Callback: code received, redirecting back to Claude Code');
    return redirectBack.toString();
  }
}

function log(msg) { process.stderr.write(`[shim] ${msg}\n`); }
