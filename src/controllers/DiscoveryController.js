export class DiscoveryController {
  #discoveryService;
  #config;

  constructor(discoveryService, config) {
    this.#discoveryService = discoveryService;
    this.#config = config;
  }

  /** GET /.well-known/oauth-authorization-server */
  getAuthServerMetadata(req, res) {
    res.json(this.#discoveryService.getAuthorizationServerMetadata());
  }

  /** GET /.well-known/openid-configuration — mirror for clients that probe OIDC path */
  getOpenIdConfiguration(req, res) {
    res.redirect(`${this.#config.baseUrl}/.well-known/oauth-authorization-server`);
  }
}
