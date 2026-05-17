import { createApp }  from './src/app.js';
import { config }     from './src/config/config.js';

const { app, cleanupService } = createApp();

cleanupService.start();

const server = app.listen(config.port, () => {
  console.log(`[oauth-shim] Listening on          ${config.baseUrl}`);
  console.log(`[oauth-shim] Entra tenant:          ${config.tenantId}`);
  console.log(`[oauth-shim] ─────────────────────────────────────────────────────`);
  console.log(`[oauth-shim] Register this redirect URI in Entra (Web platform):`);
  console.log(`[oauth-shim]   ${config.callbackUri}`);
  console.log(`[oauth-shim] ─────────────────────────────────────────────────────`);
  console.log(`[oauth-shim] Update APIM well-known to point here:`);
  console.log(`[oauth-shim]   authorization_servers: ["${config.baseUrl}"]`);
});

function shutdown() {
  cleanupService.stop();
  server.close(() => process.exit(0));
}

process.on('SIGTERM', shutdown);
process.on('SIGINT',  shutdown);
