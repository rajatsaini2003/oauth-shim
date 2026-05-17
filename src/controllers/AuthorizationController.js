export class AuthorizationController {
  #authorizationService;

  constructor(authorizationService) {
    this.#authorizationService = authorizationService;
  }

  /** GET /connect/authorize — proxy auth request to Entra ID */
  authorize(req, res) {
    const {
      redirect_uri:          originalRedirectUri   = '',
      state:                 originalState         = '',
      code_challenge:        codeChallenge         = '',
      code_challenge_method: codeChallengeMethod,
      login_hint:            loginHint,
    } = req.query;

    const entraUrl = this.#authorizationService.buildEntraAuthUrl({
      originalRedirectUri,
      originalState,
      codeChallenge,
      codeChallengeMethod,
      loginHint,
    });

    res.redirect(entraUrl);
  }
}
