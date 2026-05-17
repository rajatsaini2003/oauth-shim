/**
 * Builds RFC 8414 OAuth Authorization Server Metadata.
 * Single responsibility: know what endpoints this server exposes.
 */
export class DiscoveryService {
  #config;

  /** @param {{ baseUrl: string }} config */
  constructor(config) {
    this.#config = config;
  }

  getAuthorizationServerMetadata() {
    const { baseUrl } = this.#config;
    return {
      issuer:                                baseUrl,
      authorization_endpoint:                `${baseUrl}/connect/authorize`,
      token_endpoint:                        `${baseUrl}/connect/token`,
      registration_endpoint:                 `${baseUrl}/connect/register`,
      response_types_supported:              ['code'],
      grant_types_supported:                 ['authorization_code', 'refresh_token'],
      code_challenge_methods_supported:      ['S256'],
      token_endpoint_auth_methods_supported: ['none'],
    };
  }
}
