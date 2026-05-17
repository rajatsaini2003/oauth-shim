import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadConfig() {
  let settings = {};
  try {
    const raw = readFileSync(join(__dirname, '../../appsettings.json'), 'utf8');
    settings = JSON.parse(raw);
  } catch {
    // env vars take over
  }

  const tenantId = process.env.TENANT_ID ?? settings.TenantId ?? '';
  const clientId = process.env.CLIENT_ID ?? settings.ClientId ?? '';
  const baseUrl   = (process.env.BASE_URL ?? settings.BaseUrl ?? 'http://localhost:5200').replace(/\/$/, '');
  const port      = parseInt(process.env.PORT ?? settings.Port ?? '5200', 10);
  const scope        = process.env.SCOPE         ?? settings.Scope        ?? `api://${clientId}/access_as_user`;
  // Required when callbackUri is a Web-platform URI (non-localhost) — Entra treats those as confidential clients.
  const clientSecret = process.env.CLIENT_SECRET ?? settings.ClientSecret ?? '';

  if (!tenantId || tenantId === 'YOUR-ENTRA-TENANT-ID') {
    process.stderr.write('[oauth-shim] ERROR: Set TenantId in appsettings.json or TENANT_ID env var.\n');
    process.exit(1);
  }
  if (!clientId) {
    process.stderr.write('[oauth-shim] ERROR: Set ClientId in appsettings.json or CLIENT_ID env var.\n');
    process.exit(1);
  }

  const callbackUri = `${baseUrl}/connect/callback`;
  const entraBase   = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0`;

  return Object.freeze({ tenantId, clientId, clientSecret, scope, baseUrl, port, callbackUri, entraBase });
}

export const config = loadConfig();
