export class TokenController {
  #tokenService;

  constructor(tokenService) {
    this.#tokenService = tokenService;
  }

  /** POST /connect/token — proxy token exchange to Entra ID and return the real JWT */
  async token(req, res) {
    const grantType = req.body?.grant_type ?? '';
    const { status, body } = await this.#tokenService.exchange(grantType, req.body ?? {});
    res.status(status).type('application/json').send(body);
  }
}
