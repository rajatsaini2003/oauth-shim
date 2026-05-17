import { randomBytes } from 'crypto';

/**
 * Handles Dynamic Client Registration (RFC 7591).
 * Single responsibility: issue and persist ephemeral client credentials.
 */
export class RegistrationService {
  #clientRepository;

  /** @param {{ save(id: string): void }} clientRepository */
  constructor(clientRepository) {
    this.#clientRepository = clientRepository;
  }

  /**
   * @param {string[]} redirectUris
   * @returns {{ client_id: string, client_id_issued_at: number, redirect_uris: string[], token_endpoint_auth_method: string, grant_types: string[], response_types: string[] }}
   */
  register(redirectUris = []) {
    const clientId = 'cc_' + randomBytes(8).toString('hex');
    this.#clientRepository.save(clientId);

    return {
      client_id:                  clientId,
      client_id_issued_at:        Math.floor(Date.now() / 1000),
      redirect_uris:              redirectUris,
      token_endpoint_auth_method: 'none',
      grant_types:                ['authorization_code', 'refresh_token'],
      response_types:             ['code'],
    };
  }
}
