# vendo.uy

## Seguridad de produccion

La aplicacion ahora separa claramente desarrollo local y produccion.

## Modelo de autenticacion

- `tenant`: cada usuario pertenece a un tenant y su configuracion vive en `data/tenants.json`.
- `jwt session`: el login devuelve `accessToken` JWT para el frontend y mantiene compatibilidad con sesion server-side.
- `m2m api key`: las integraciones backend o n8n usan API keys tenant-scoped con scopes en `data/api-keys.json`.
- `google identity`: cada tenant tiene configuracion Google propia y cada usuario puede guardar `authProviders.google`.
- `oauth callback`: el login puede iniciar con Google via `start/callback`, intercambiar el `code` server-side y crear automaticamente un usuario `agent` si el email pasa las reglas del tenant.
- `google invite`: desde el panel puedes preasignar rol y crear usuarios `invited` con acceso Google sin password; el primer OAuth los activa y conserva el rol.

### Capas implementadas

- `helmet` con CSP, HSTS en produccion, `frame-ancestors 'none'` y politicas de referrer.
- sesiones con `express-session` y `session-file-store`.
- cookie de sesion `httpOnly`, `sameSite=strict` y `secure` en produccion.
- regeneracion de sesion en login para evitar fixation.
- CSRF token para operaciones autenticadas mutantes.
- validacion de `Origin` para `POST`, `PATCH`, `PUT` y `DELETE`.
- rate limiting general para `/api` y mas estricto para `/api/auth/login`.
- `Cache-Control: no-store` para panel y APIs.
- bootstrap seguro para produccion: no arranca con cuentas demo.
- rechazo explicito de usuarios `@casamedanos.local` en produccion.
- configuracion publica del chat servida por backend, sin webhook hardcodeado en frontend.
- JWT para sesion de usuario con `Bearer`.
- tenant model para separar configuracion, usuarios y API keys.
- endpoint M2M para provisionar usuarios Google ya verificados por un backend confiable.
- callback OAuth Google con `state` en sesion, `code exchange` server-side y alta automatica segura.

### Variables de entorno para produccion

Revisa `.env.example`.

Variables minimas:

- `NODE_ENV=production`
- `APP_BASE_URL=https://tu-dominio-real`
- `SESSION_SECRET=...`
- `JWT_SECRET=...`
- `BOOTSTRAP_OWNER_EMAIL=...`
- `BOOTSTRAP_OWNER_PASSWORD=...`

### Notas operativas

- En desarrollo local se crean cuentas demo en `data/users.json`.
- En produccion debes reemplazar esas cuentas por usuarios reales o dejar que el bootstrap cree solo el owner inicial.
- Si vas a escalar horizontalmente, cambia `session-file-store` por Redis o una store compartida.
- El endpoint `POST /api/m2m/google/register` espera una API key con scope `identity:google-provision`.
- Para login Google en UI, cada tenant necesita `clientId`, `clientSecret` y `redirectUri` validos. El secret se guarda del lado servidor y el panel solo expone si ya fue configurado.
- El callback esperado por Google queda en `https://tu-dominio/auth/google/callback` salvo que definas otra URL compatible en el tenant.
