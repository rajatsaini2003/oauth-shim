import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * @param {{
 *   discoveryController: import('../controllers/DiscoveryController.js').DiscoveryController,
 *   registrationController: import('../controllers/RegistrationController.js').RegistrationController,
 *   authorizationController: import('../controllers/AuthorizationController.js').AuthorizationController,
 *   callbackController: import('../controllers/CallbackController.js').CallbackController,
 *   tokenController: import('../controllers/TokenController.js').TokenController,
 * }} controllers
 */
export function createRouter({ discoveryController, registrationController, authorizationController, callbackController, tokenController }) {
  const router = Router();

  // ── Discovery ────────────────────────────────────────────────────────────────
  router.get('/.well-known/oauth-authorization-server',
    asyncHandler((req, res) => discoveryController.getAuthServerMetadata(req, res)));

  router.get('/.well-known/openid-configuration',
    asyncHandler((req, res) => discoveryController.getOpenIdConfiguration(req, res)));

  // ── Dynamic Client Registration ──────────────────────────────────────────────
  router.post('/connect/register',
    asyncHandler((req, res) => registrationController.register(req, res)));

  // ── Authorization flow ───────────────────────────────────────────────────────
  router.get('/connect/authorize',
    asyncHandler((req, res) => authorizationController.authorize(req, res)));

  router.get('/connect/callback',
    asyncHandler((req, res) => callbackController.callback(req, res)));

  // ── Token exchange ───────────────────────────────────────────────────────────
  router.post('/connect/token',
    asyncHandler((req, res) => tokenController.token(req, res)));

  return router;
}
