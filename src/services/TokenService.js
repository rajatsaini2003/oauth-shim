/**
 * Proxies token requests to Entra ID.
 * Single responsibility: exchange auth codes / refresh tokens and forward the result.
 */
export class TokenService {
  #config;

  /** @param {{ entraBase: string, clientId: string, clientSecret: string, callbackUri: string, scope: string }} config */
  constructor(config) {
    this.#config = config;
  }

  /**
   * @param {string} grantType
   * @param {Record<string, string>} body  Parsed form body from the request
   * @returns {Promise<{ status: number, body: string }>}
   */
  async exchange(grantType, body) {
    const { entraBase, clientId, clientSecret, callbackUri, scope } = this.#config;

    const params = grantType === 'refresh_token'
      ? {
          grant_type:    'refresh_token',
          refresh_token: body.refresh_token ?? '',
          client_id:     clientId,
          scope,
        }
      : {
          grant_type:    'authorization_code',
          code:          body.code ?? '',
          code_verifier: body.code_verifier ?? '',
          redirect_uri:  callbackUri,
          client_id:     clientId,
          scope,
        };

    // Entra requires client_secret when the redirect_uri is a Web-platform URI (confidential client).
    if (clientSecret) params.client_secret = clientSecret;

    log(`Token: grant_type=${grantType}`);

    const response = await fetch(`${entraBase}/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(params).toString(),
    });

    const responseBody = await response.text();
    log(`Token ← ${response.status}`);

    if (!response.ok) {
      log(`Token error body: ${responseBody}`);
    } else {
      this.#logTokenClaims(responseBody);
    }

    return { status: response.status, body: responseBody };
  }

  /** @param {string} responseBody */
  #logTokenClaims(responseBody) {
    try {
      const json = JSON.parse(responseBody);
      const accessToken = json.access_token ?? '';
      const parts = accessToken.split('.');
      if (parts.length !== 3) return;

      const padding = (4 - (parts[1].length % 4)) % 4;
      const padded  = parts[1] + '='.repeat(padding);
      const payload = JSON.parse(Buffer.from(padded, 'base64').toString('utf8'));

      const upn = payload.upn ?? payload.preferred_username ?? '?';
      const oid = payload.oid ?? '?';
      const exp = payload.exp ? new Date(payload.exp * 1000).toISOString() : '?';

      log(`Token issued for: ${upn} (oid=${oid}, expires=${exp})`);

      if (Array.isArray(payload.groups)) {
        log(`Groups in token: [${payload.groups.join(', ')}]`);
      } else {
        log('groups claim: absent (user has >200 groups, or claim not configured)');
      }
    } catch {
      // non-fatal — token is still forwarded to the caller
    }
  }
}

function log(msg) { process.stderr.write(`[shim] ${msg}\n`); }
