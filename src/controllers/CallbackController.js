export class CallbackController {
  #authorizationService;

  constructor(authorizationService) {
    this.#authorizationService = authorizationService;
  }

  /** GET /connect/callback — Entra ID posts the auth code here; we relay it to Claude Code */
  callback(req, res) {
    const {
      code  = '',
      state: shimState = '',
      error = '',
      error_description: errorDescription = '',
    } = req.query;

    if (error) {
      log(`Callback error: ${error} — ${errorDescription}`);
      return res.status(400).type('text/plain').send(`Authentication failed: ${error}\n${errorDescription}`);
    }

    const redirectUrl = this.#authorizationService.resolvePendingAuth(shimState, code);
    res.redirect(redirectUrl);
  }
}

function log(msg) { process.stderr.write(`[shim] ${msg}\n`); }
