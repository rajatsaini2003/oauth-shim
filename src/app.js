import express from 'express';

import { config }                       from './config/config.js';
import { InMemoryClientRepository }     from './repositories/InMemoryClientRepository.js';
import { InMemoryPendingAuthRepository } from './repositories/InMemoryPendingAuthRepository.js';
import { CleanupService }               from './services/CleanupService.js';
import { DiscoveryService }             from './services/DiscoveryService.js';
import { RegistrationService }          from './services/RegistrationService.js';
import { AuthorizationService }         from './services/AuthorizationService.js';
import { TokenService }                 from './services/TokenService.js';
import { DiscoveryController }          from './controllers/DiscoveryController.js';
import { RegistrationController }       from './controllers/RegistrationController.js';
import { AuthorizationController }      from './controllers/AuthorizationController.js';
import { CallbackController }           from './controllers/CallbackController.js';
import { TokenController }              from './controllers/TokenController.js';
import { createRouter }                 from './routes/index.js';
import { errorHandler }                 from './middleware/errorHandler.js';

export function createApp() {
  // ── Repositories ─────────────────────────────────────────────────────────────
  const clientRepository     = new InMemoryClientRepository();
  const pendingAuthRepository = new InMemoryPendingAuthRepository();

  // ── Services ──────────────────────────────────────────────────────────────────
  const discoveryService    = new DiscoveryService(config);
  const registrationService = new RegistrationService(clientRepository);
  const authorizationService = new AuthorizationService(config, pendingAuthRepository);
  const tokenService        = new TokenService(config);
  const cleanupService      = new CleanupService([clientRepository, pendingAuthRepository]);

  // ── Controllers ───────────────────────────────────────────────────────────────
  const discoveryController     = new DiscoveryController(discoveryService, config);
  const registrationController  = new RegistrationController(registrationService);
  const authorizationController = new AuthorizationController(authorizationService);
  const callbackController      = new CallbackController(authorizationService);
  const tokenController         = new TokenController(tokenService);

  // ── Express app ───────────────────────────────────────────────────────────────
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  app.use(createRouter({
    discoveryController,
    registrationController,
    authorizationController,
    callbackController,
    tokenController,
  }));

  app.use(errorHandler);

  return { app, cleanupService };
}
