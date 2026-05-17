export class RegistrationController {
  #registrationService;

  constructor(registrationService) {
    this.#registrationService = registrationService;
  }

  /** POST /connect/register — Dynamic Client Registration (RFC 7591) */
  register(req, res) {
    const redirectUris = Array.isArray(req.body?.redirect_uris) ? req.body.redirect_uris : [];
    log(`DCR: registered client redirect_uris=[${redirectUris.join(', ')}]`);

    const client = this.#registrationService.register(redirectUris);
    res.status(201).json(client);
  }
}

function log(msg) { process.stderr.write(`[shim] ${msg}\n`); }
