const crypto = require('crypto');
const express = require('express');
const path = require('path');
const fs = require('fs');
const session = require('express-session');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const FileStoreFactory = require('session-file-store');
const jwt = require('jsonwebtoken');
const { execFileSync } = require('child_process');

const app = express();
const port = Number(process.env.PORT) || 3000;
const rootDir = __dirname;
const dataDir = path.join(rootDir, 'data');
const sessionsDir = path.join(dataDir, 'sessions');
const usersFile = path.join(dataDir, 'users.json');
const workspaceFile = path.join(dataDir, 'workspace.json');
const tenantsFile = path.join(dataDir, 'tenants.json');
const apiKeysFile = path.join(dataDir, 'api-keys.json');
const catalogProductsFile = path.join(dataDir, 'catalog-products.json');
const photoJobsFile = path.join(dataDir, 'photo-jobs.json');
const workflowFile = path.join(rootDir, 'n8n', 'casa-medanos-sales-chat.json');
const productsFile = path.join(rootDir, 'sales-chat.js');

const sessionName = 'cm_session';
const sessionTtlMs = 1000 * 60 * 60 * 12;
const jwtTtlSeconds = 60 * 60 * 12;
const oauthStateTtlMs = 1000 * 60 * 10;
const isProduction = process.env.NODE_ENV === 'production';
const appBaseUrl = process.env.APP_BASE_URL || `http://localhost:${port}`;
const sessionSecret = process.env.SESSION_SECRET || '';
const jwtSecret = process.env.JWT_SECRET || sessionSecret;
const publicChatWebhookUrl = process.env.SALES_CHAT_WEBHOOK_URL || (isProduction ? '' : 'http://localhost:5678/webhook/sales-chat');
const publicWhatsappPhone = process.env.PUBLIC_WHATSAPP_PHONE || '59899576144';
const publicSiteName = process.env.PUBLIC_SITE_NAME || 'Casa Medanos';
const trustProxyCount = Number(process.env.TRUST_PROXY || (isProduction ? 1 : 0));
const googleOauthAuthorizeUrl = process.env.GOOGLE_OAUTH_AUTHORIZE_URL || 'https://accounts.google.com/o/oauth2/v2/auth';
const googleOauthTokenUrl = process.env.GOOGLE_OAUTH_TOKEN_URL || 'https://oauth2.googleapis.com/token';
const googleOauthUserInfoUrl = process.env.GOOGLE_OAUTH_USERINFO_URL || 'https://openidconnect.googleapis.com/v1/userinfo';
const SessionFileStore = FileStoreFactory(session);

const roleDefinitions = {
  owner: {
    label: 'Owner',
    summary: 'Controla tenant, dominio, estrategia, usuarios y automatizaciones.',
    permissions: ['manage_tenant', 'manage_domain', 'manage_workspace', 'manage_workflow', 'manage_users', 'manage_api_keys', 'publish_catalog']
  },
  admin: {
    label: 'Automatizador n8n',
    summary: 'Disena, crea y mantiene automatizaciones con n8n y opera los workflows del negocio.',
    permissions: ['manage_workflow', 'view_workspace', 'view_products', 'view_tenant']
  },
  agent: {
    label: 'Vendedor',
    summary: 'Opera el catalogo, atiende consultas y mueve la venta sin tocar configuracion critica.',
    permissions: ['view_workspace', 'view_products', 'view_tenant', 'publish_catalog']
  }
};

function uniqueValues(values) {
  return [...new Set(values.filter(Boolean))];
}

function safeOrigin(value) {
  try {
    return new URL(value).origin;
  } catch (_error) {
    return null;
  }
}

function buildAllowedOrigins() {
  const configuredOrigins = String(process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((value) => safeOrigin(value.trim()));
  return new Set(uniqueValues([safeOrigin(appBaseUrl), ...configuredOrigins]));
}

const allowedOrigins = buildAllowedOrigins();

function buildConnectSources() {
  return uniqueValues([
    "'self'",
    safeOrigin(publicChatWebhookUrl)
  ]);
}

function ensureDirectories() {
  for (const directory of [dataDir, sessionsDir]) {
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }
  }
}

function hashPassword(password, salt) {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

function hashApiKey(value) {
  return crypto.createHash('sha256').update(String(value || ''), 'utf8').digest('hex');
}

function createOpaqueKey(prefix) {
  return `${prefix}_${crypto.randomBytes(24).toString('hex')}`;
}

function timingSafeStringEqual(left, right) {
  const leftBuffer = Buffer.from(String(left || ''), 'utf8');
  const rightBuffer = Buffer.from(String(right || ''), 'utf8');
  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }
  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function validatePasswordPolicy(password, options = {}) {
  const minLength = Number(options.minLength || (isProduction ? 12 : 10));
  const value = String(password || '');
  return [
    value.length >= minLength,
    /[a-z]/.test(value),
    /[A-Z]/.test(value),
    /\d/.test(value)
  ].every(Boolean);
}

function slugify(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 48);
}

function createTenantSeed(now) {
  const siteName = 'Casa Medanos';
  return {
    id: crypto.randomUUID(),
    slug: 'casa-medanos',
    name: siteName,
    status: 'active',
    createdAt: now,
    updatedAt: now,
    domain: {
      siteName,
      customDomain: 'vendo.uy',
      publicUrl: 'https://vendo.uy',
      deployBranch: 'main',
      publicationStatus: 'iterando',
      dnsStatus: 'pendiente',
      sslStatus: 'pendiente'
    },
    publishing: {
      focus: 'catalogo vivo con WhatsApp, chat asistido y entrega coordinada',
      launchChecklist: [
        { id: 'catalog', label: 'Catalogo visible y claro', done: true },
        { id: 'chat', label: 'Asistente de venta conectado', done: true },
        { id: 'domain', label: 'Dominio y DNS verificados', done: false },
        { id: 'workflow', label: 'Flujo de automatizacion documentado', done: true }
      ]
    },
    vision: {
      concept: 'memoria comercial viva',
      thesis: 'El repo no solo publica productos: registra cambios reales de inventario, ventas, automatizacion y mejora continua.',
      nextExperiment: 'Convertir cada cambio del catalogo en una senal para el asistente, el dominio y futuras campanas.'
    },
    identity: {
      google: {
        enabled: false,
        clientId: '',
        clientSecret: '',
        redirectUri: '',
        hostedDomain: '',
        allowedDomains: [],
        buttonLabel: 'Continuar con Google'
      }
    }
  };
}

function createSeedUser(name, email, role, password, timestamp, tenantId) {
  const salt = crypto.randomBytes(16).toString('hex');
  return {
    id: crypto.randomUUID(),
    tenantId,
    name,
    email,
    role,
    status: 'active',
    passwordHash: hashPassword(password, salt),
    salt,
    createdAt: timestamp,
    updatedAt: timestamp,
    lastLoginAt: null,
    authProviders: {
      password: {
        enabled: true,
        registeredAt: timestamp
      },
      google: null
    }
  };
}

function createCatalogSeedProducts(tenantId) {
  const now = new Date().toISOString();
  return extractProducts().map((product) => ({
    id: crypto.randomUUID(),
    tenantId,
    source: 'seed',
    name: String(product.name || '').trim(),
    price: Number(product.price || 0),
    original: Number(product.original || 0),
    category: String(product.category || 'General').trim(),
    room: String(product.room || 'Sin ambiente').trim(),
    image: String(product.image || '').trim(),
    improvedImage: '',
    status: product.sold ? 'sold' : 'active',
    description: '',
    salesNote: '',
    leadAngle: '',
    photoStatus: product.image ? 'original' : 'needs_capture',
    photoPrompt: '',
    aiToolPreference: 'nano-banana',
    createdAt: now,
    updatedAt: now,
    createdByUserId: null,
    lastPublishedAt: product.sold ? now : null
  }));
}

function isDemoUser(user) {
  return String(user.email || '').endsWith('@casamedanos.local');
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2));
}

function ensureDataFiles() {
  ensureDirectories();

  const now = new Date().toISOString();
  const legacyWorkspace = fs.existsSync(workspaceFile) ? readJson(workspaceFile) : null;

  if (!fs.existsSync(tenantsFile)) {
    const tenant = createTenantSeed(now);
    if (legacyWorkspace) {
      tenant.domain = { ...tenant.domain, ...(legacyWorkspace.domain || {}) };
      tenant.publishing = { ...tenant.publishing, ...(legacyWorkspace.publishing || {}) };
      tenant.vision = { ...tenant.vision, ...(legacyWorkspace.vision || {}) };
    }
    writeJson(tenantsFile, { tenants: [tenant] });
  }

  const tenantsStore = readJson(tenantsFile);
  if (!Array.isArray(tenantsStore.tenants) || !tenantsStore.tenants.length) {
    tenantsStore.tenants = [createTenantSeed(now)];
    writeJson(tenantsFile, tenantsStore);
  }
  const defaultTenant = tenantsStore.tenants[0];

  if (!fs.existsSync(usersFile)) {
    if (isProduction) {
      const ownerEmail = String(process.env.BOOTSTRAP_OWNER_EMAIL || '').trim().toLowerCase();
      const ownerPassword = String(process.env.BOOTSTRAP_OWNER_PASSWORD || '');
      const ownerName = String(process.env.BOOTSTRAP_OWNER_NAME || 'Owner').trim();

      if (!ownerEmail || !ownerPassword) {
        throw new Error('Production bootstrap requires BOOTSTRAP_OWNER_EMAIL and BOOTSTRAP_OWNER_PASSWORD.');
      }
      if (!validatePasswordPolicy(ownerPassword, { minLength: 14 })) {
        throw new Error('BOOTSTRAP_OWNER_PASSWORD must be strong: 14+ chars with upper, lower and number.');
      }

      writeJson(usersFile, {
        users: [
          createSeedUser(ownerName, ownerEmail, 'owner', ownerPassword, now, defaultTenant.id)
        ]
      });
    } else {
      writeJson(usersFile, {
        users: [
          createSeedUser('Owner Casa Medanos', 'owner@casamedanos.local', 'owner', 'admin1234', now, defaultTenant.id),
          createSeedUser('Automatizador n8n Casa Medanos', 'automatizador@casamedanos.local', 'admin', 'admin1234', now, defaultTenant.id),
          createSeedUser('Vendedor Casa Medanos', 'vendedor@casamedanos.local', 'agent', 'admin1234', now, defaultTenant.id)
        ]
      });
    }
  }

  if (!fs.existsSync(apiKeysFile)) {
    writeJson(apiKeysFile, { apiKeys: [] });
  }

  if (!fs.existsSync(catalogProductsFile)) {
    writeJson(catalogProductsFile, { products: createCatalogSeedProducts(defaultTenant.id) });
  }

  if (!fs.existsSync(photoJobsFile)) {
    writeJson(photoJobsFile, { jobs: [] });
  }

  if (!fs.existsSync(workspaceFile)) {
    writeJson(workspaceFile, {
      domain: defaultTenant.domain,
      publishing: defaultTenant.publishing,
      vision: defaultTenant.vision
    });
  }

  const usersStore = readJson(usersFile);
  let usersChanged = false;
  usersStore.users = usersStore.users.map((user) => {
    const nextUser = { ...user };
    if (!nextUser.tenantId) {
      nextUser.tenantId = defaultTenant.id;
      usersChanged = true;
    }
    if (!nextUser.authProviders || typeof nextUser.authProviders !== 'object') {
      nextUser.authProviders = {
        password: {
          enabled: Boolean(nextUser.passwordHash),
          registeredAt: nextUser.createdAt || now
        },
        google: null
      };
      usersChanged = true;
    } else if (!Object.prototype.hasOwnProperty.call(nextUser.authProviders, 'password')) {
      nextUser.authProviders.password = {
        enabled: Boolean(nextUser.passwordHash),
        registeredAt: nextUser.createdAt || now
      };
      usersChanged = true;
    } else if (!Object.prototype.hasOwnProperty.call(nextUser.authProviders, 'google')) {
      nextUser.authProviders.google = null;
      usersChanged = true;
    }
    return nextUser;
  });

  if (usersChanged) {
    writeJson(usersFile, usersStore);
  }

  const catalogStore = readJson(catalogProductsFile);
  if (!Array.isArray(catalogStore.products)) {
    catalogStore.products = createCatalogSeedProducts(defaultTenant.id);
    writeJson(catalogProductsFile, catalogStore);
  }

  const photoJobsStore = readJson(photoJobsFile);
  if (!Array.isArray(photoJobsStore.jobs)) {
    photoJobsStore.jobs = [];
    writeJson(photoJobsFile, photoJobsStore);
  }

  const tenantsStoreNormalized = readJson(tenantsFile);
  let tenantsChanged = false;
  tenantsStoreNormalized.tenants = tenantsStoreNormalized.tenants.map((tenant) => {
    const nextTenant = { ...tenant };
    const googleIdentity = {
      enabled: Boolean(nextTenant.identity?.google?.enabled),
      clientId: String(nextTenant.identity?.google?.clientId || ''),
      clientSecret: String(nextTenant.identity?.google?.clientSecret || ''),
      redirectUri: String(nextTenant.identity?.google?.redirectUri || ''),
      hostedDomain: String(nextTenant.identity?.google?.hostedDomain || ''),
      allowedDomains: Array.isArray(nextTenant.identity?.google?.allowedDomains) ? nextTenant.identity.google.allowedDomains : [],
      buttonLabel: String(nextTenant.identity?.google?.buttonLabel || 'Continuar con Google')
    };

    if (!nextTenant.identity || typeof nextTenant.identity !== 'object') {
      nextTenant.identity = { google: googleIdentity };
      tenantsChanged = true;
      return nextTenant;
    }

    if (!nextTenant.identity.google) {
      nextTenant.identity.google = googleIdentity;
      tenantsChanged = true;
      return nextTenant;
    }

    const before = JSON.stringify(nextTenant.identity.google);
    nextTenant.identity.google = {
      ...nextTenant.identity.google,
      ...googleIdentity
    };
    if (before !== JSON.stringify(nextTenant.identity.google)) {
      tenantsChanged = true;
    }
    return nextTenant;
  });

  if (tenantsChanged) {
    writeJson(tenantsFile, tenantsStoreNormalized);
  }

  if (isProduction && usersStore.users.some(isDemoUser)) {
    throw new Error('Production cannot start with demo accounts from @casamedanos.local. Replace them first.');
  }
}

function validateRuntimeSecurity() {
  if (!isProduction) {
    return;
  }
  if (!sessionSecret || sessionSecret.length < 32) {
    throw new Error('SESSION_SECRET is required in production and must be at least 32 characters.');
  }
  if (!jwtSecret || jwtSecret.length < 32) {
    throw new Error('JWT_SECRET is required in production and must be at least 32 characters.');
  }
  if (!String(appBaseUrl).startsWith('https://')) {
    throw new Error('APP_BASE_URL must use https:// in production.');
  }
  if (allowedOrigins.size === 0) {
    throw new Error('At least one allowed origin must be configured for production.');
  }
}

function readUsersFile() {
  ensureDataFiles();
  return readJson(usersFile);
}

function writeUsersFile(data) {
  writeJson(usersFile, data);
}

function readTenantsFile() {
  ensureDataFiles();
  return readJson(tenantsFile);
}

function writeTenantsFile(data) {
  writeJson(tenantsFile, data);
}

function readApiKeysFile() {
  ensureDataFiles();
  return readJson(apiKeysFile);
}

function writeApiKeysFile(data) {
  writeJson(apiKeysFile, data);
}

function readCatalogProductsFile() {
  ensureDataFiles();
  return readJson(catalogProductsFile);
}

function writeCatalogProductsFile(data) {
  writeJson(catalogProductsFile, data);
}

function readPhotoJobsFile() {
  ensureDataFiles();
  return readJson(photoJobsFile);
}

function writePhotoJobsFile(data) {
  writeJson(photoJobsFile, data);
}

function verifyPassword(password, user) {
  if (!user.passwordHash || !user.salt) {
    return false;
  }
  const expected = hashPassword(password, user.salt);
  return crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(user.passwordHash, 'hex'));
}

function createCsrfToken() {
  return crypto.randomBytes(32).toString('hex');
}

function ensureCsrfToken(req) {
  if (!req.session.csrfToken) {
    req.session.csrfToken = createCsrfToken();
  }
  return req.session.csrfToken;
}

function regenerateSession(req) {
  return new Promise((resolve, reject) => {
    req.session.regenerate((error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
}

function destroySession(req) {
  return new Promise((resolve) => {
    req.session.destroy(() => {
      resolve();
    });
  });
}

function saveSession(req) {
  return new Promise((resolve, reject) => {
    req.session.save((error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
}

function deriveUserAccessMode(user) {
  const passwordEnabled = Boolean(user?.authProviders?.password?.enabled);
  const googleEnabled = Boolean(user?.authProviders?.google);

  if (passwordEnabled && googleEnabled) {
    return 'hybrid';
  }
  if (googleEnabled) {
    return 'google';
  }
  return 'password';
}

function sanitizeUser(user) {
  const googleProvider = user.authProviders?.google;
  const googleLinked = Boolean(googleProvider?.sub);
  return {
    id: user.id,
    tenantId: user.tenantId,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    lastLoginAt: user.lastLoginAt,
    accessMode: deriveUserAccessMode(user),
    authProviders: {
      password: user.authProviders?.password ? {
        enabled: Boolean(user.authProviders.password.enabled),
        registeredAt: user.authProviders.password.registeredAt || null
      } : null,
      google: googleProvider ? {
        linked: googleLinked,
        invitationPending: Boolean(googleProvider.invitationPending || (!googleLinked && googleProvider.invitedAt)),
        invitedAt: googleProvider.invitedAt || null,
        invitedByUserId: googleProvider.invitedByUserId || null,
        sub: googleLinked ? googleProvider.sub || null : null,
        emailVerified: googleLinked ? Boolean(googleProvider.emailVerified) : false,
        picture: googleLinked ? googleProvider.picture || '' : '',
        givenName: googleLinked ? googleProvider.givenName || '' : '',
        familyName: googleLinked ? googleProvider.familyName || '' : '',
        linkedAt: googleLinked ? googleProvider.linkedAt || null : null,
        lastLoginAt: googleLinked ? googleProvider.lastLoginAt || null : null
      } : null
    }
  };
}

function sanitizeTenant(tenant) {
  return {
    id: tenant.id,
    slug: tenant.slug,
    name: tenant.name,
    status: tenant.status,
    createdAt: tenant.createdAt,
    updatedAt: tenant.updatedAt,
    domain: tenant.domain,
    publishing: tenant.publishing,
    vision: tenant.vision,
    identity: {
      google: {
        enabled: Boolean(tenant.identity?.google?.enabled),
        clientId: tenant.identity?.google?.clientId || '',
        clientSecretConfigured: Boolean(tenant.identity?.google?.clientSecret),
        redirectUri: tenant.identity?.google?.redirectUri || '',
        hostedDomain: tenant.identity?.google?.hostedDomain || '',
        allowedDomains: Array.isArray(tenant.identity?.google?.allowedDomains) ? tenant.identity.google.allowedDomains : [],
        buttonLabel: tenant.identity?.google?.buttonLabel || 'Continuar con Google'
      }
    }
  };
}

function sanitizeApiKey(apiKey) {
  return {
    id: apiKey.id,
    tenantId: apiKey.tenantId,
    name: apiKey.name,
    keyPrefix: apiKey.keyPrefix,
    scopes: apiKey.scopes,
    status: apiKey.status,
    createdAt: apiKey.createdAt,
    updatedAt: apiKey.updatedAt,
    lastUsedAt: apiKey.lastUsedAt || null,
    createdByUserId: apiKey.createdByUserId || null
  };
}

function sanitizeCatalogProduct(product) {
  return {
    id: product.id,
    tenantId: product.tenantId,
    source: product.source || 'manual',
    name: product.name,
    price: Number(product.price || 0),
    original: Number(product.original || 0),
    category: product.category || 'General',
    room: product.room || 'Sin ambiente',
    image: product.image || '',
    improvedImage: product.improvedImage || '',
    status: product.status || 'draft',
    description: product.description || '',
    salesNote: product.salesNote || '',
    leadAngle: product.leadAngle || '',
    photoStatus: product.photoStatus || 'original',
    photoPrompt: product.photoPrompt || '',
    aiToolPreference: product.aiToolPreference || 'nano-banana',
    createdAt: product.createdAt || null,
    updatedAt: product.updatedAt || null,
    createdByUserId: product.createdByUserId || null,
    lastPublishedAt: product.lastPublishedAt || null
  };
}

function sanitizePhotoJob(job) {
  return {
    id: job.id,
    tenantId: job.tenantId,
    productId: job.productId,
    productName: job.productName || '',
    status: job.status || 'pending',
    requestedTool: job.requestedTool || 'nano-banana',
    prompt: job.prompt || '',
    requestedByUserId: job.requestedByUserId || null,
    requestedAt: job.requestedAt || null,
    assignedToRole: job.assignedToRole || 'admin',
    resultImage: job.resultImage || '',
    resultNotes: job.resultNotes || '',
    updatedAt: job.updatedAt || null,
    completedAt: job.completedAt || null
  };
}

function canAccessPhotoStudio(capabilities) {
  return Boolean(capabilities?.publishCatalog || capabilities?.manageWorkflow);
}

function permissionsForRole(role) {
  return roleDefinitions[role]?.permissions || [];
}

function capabilityFlags(role) {
  const permissions = new Set(permissionsForRole(role));
  return {
    viewWorkspace: permissions.has('view_workspace') || permissions.has('manage_workspace') || permissions.has('manage_domain'),
    viewWorkflow: permissions.has('view_workflow') || permissions.has('manage_workflow'),
    viewProducts: permissions.has('view_products') || permissions.has('publish_catalog'),
    viewTenant: permissions.has('view_tenant') || permissions.has('manage_tenant'),
    manageWorkspace: permissions.has('manage_workspace') || permissions.has('manage_domain'),
    manageDomain: permissions.has('manage_domain'),
    manageWorkflow: permissions.has('manage_workflow'),
    manageUsers: permissions.has('manage_users'),
    manageTenant: permissions.has('manage_tenant'),
    manageApiKeys: permissions.has('manage_api_keys'),
    publishCatalog: permissions.has('publish_catalog')
  };
}

function getTenantById(tenantId) {
  const store = readTenantsFile();
  return store.tenants.find((tenant) => tenant.id === tenantId) || null;
}

function getTenantBySlug(slug) {
  const store = readTenantsFile();
  return store.tenants.find((tenant) => tenant.slug === slug) || null;
}

function getDefaultTenant() {
  return readTenantsFile().tenants[0] || null;
}

function getTenantForRequestSlug(tenantSlug) {
  return tenantSlug ? getTenantBySlug(tenantSlug) : getDefaultTenant();
}

function issueUserJwt(user) {
  return jwt.sign({
    sub: user.id,
    tenantId: user.tenantId,
    role: user.role,
    type: 'user'
  }, jwtSecret || 'dev-only-jwt-secret-change-me', {
    algorithm: 'HS256',
    expiresIn: jwtTtlSeconds,
    issuer: appBaseUrl,
    audience: 'casa-medanos-app'
  });
}

function verifyUserJwt(token) {
  return jwt.verify(token, jwtSecret || 'dev-only-jwt-secret-change-me', {
    algorithms: ['HS256'],
    issuer: appBaseUrl,
    audience: 'casa-medanos-app'
  });
}

function buildAppUrl(relativePath) {
  return new URL(relativePath, appBaseUrl).toString();
}

function cleanupOAuthSession(req) {
  if (req.session?.oauth) {
    delete req.session.oauth;
  }
}

function createGoogleOAuthState(req, tenant) {
  const state = crypto.randomBytes(24).toString('hex');
  req.session.oauth = {
    provider: 'google',
    state,
    tenantId: tenant.id,
    createdAt: Date.now()
  };
  return state;
}

function consumeGoogleOAuthState(req, expectedState) {
  const oauth = req.session?.oauth;
  cleanupOAuthSession(req);

  if (!oauth || oauth.provider !== 'google') {
    return null;
  }
  if (!expectedState || !timingSafeStringEqual(oauth.state, expectedState)) {
    return null;
  }
  if (Date.now() - Number(oauth.createdAt || 0) > oauthStateTtlMs) {
    return null;
  }
  return oauth;
}

function googleOAuthConfigured(tenant) {
  return Boolean(
    tenant &&
    tenant.status === 'active' &&
    tenant.identity?.google?.enabled &&
    tenant.identity.google.clientId &&
    tenant.identity.google.clientSecret &&
    tenant.identity.google.redirectUri
  );
}

function assertGoogleTenantAccess(tenant, email) {
  if (!tenant) {
    throw new Error('Tenant no encontrado para autenticacion Google.');
  }
  if (tenant.status !== 'active') {
    throw new Error('El tenant no esta activo.');
  }
  if (!tenant.identity?.google?.enabled) {
    throw new Error('Google login no esta habilitado para este tenant.');
  }

  const normalizedEmail = String(email || '').trim().toLowerCase();
  const emailDomain = normalizedEmail.split('@')[1] || '';
  const hostedDomain = String(tenant.identity.google.hostedDomain || '').trim().toLowerCase();
  const allowedDomains = Array.isArray(tenant.identity.google.allowedDomains)
    ? tenant.identity.google.allowedDomains.map((value) => String(value).trim().toLowerCase()).filter(Boolean)
    : [];

  if (hostedDomain && emailDomain !== hostedDomain) {
    throw new Error('El email no pertenece al hosted domain configurado.');
  }
  if (allowedDomains.length && !allowedDomains.includes(emailDomain)) {
    throw new Error('El dominio del email no esta autorizado para este tenant.');
  }
}

function upsertGoogleUserFromProfile({ tenant, profile, defaultRole = 'agent', status = 'active' }) {
  const email = String(profile.email || '').trim().toLowerCase();
  const name = String(profile.name || '').trim() || email;
  const sub = String(profile.sub || '').trim();
  const emailVerified = Boolean(profile.emailVerified);
  const validCreateRoles = new Set(['owner', 'admin', 'agent']);

  if (!email || !sub || !emailVerified) {
    throw new Error('Google profile invalido. Se requiere email, sub y emailVerified=true.');
  }
  assertGoogleTenantAccess(tenant, email);
  if (!validCreateRoles.has(defaultRole)) {
    throw new Error('El alta automatica con Google solo puede crear admin o agent.');
  }

  const usersStore = readUsersFile();
  let user = usersStore.users.find((entry) => (
    entry.tenantId === tenant.id &&
    (entry.email.toLowerCase() === email || entry.authProviders?.google?.sub === sub)
  ));

  const now = new Date().toISOString();
  let action = 'updated';
  if (!user) {
    action = 'created';
    user = {
      id: crypto.randomUUID(),
      tenantId: tenant.id,
      name,
      email,
      role: defaultRole,
      status,
      passwordHash: '',
      salt: '',
      createdAt: now,
      updatedAt: now,
      lastLoginAt: now,
      authProviders: {
        password: {
          enabled: false,
          registeredAt: null
        },
        google: {
          invitationPending: false,
          invitedAt: now,
          invitedByUserId: null,
          sub: null,
          emailVerified: false,
          picture: '',
          givenName: '',
          familyName: '',
          locale: '',
          linkedAt: null,
          lastLoginAt: null
        }
      }
    };
    usersStore.users.push(user);
  }

  if (user.status === 'disabled') {
    throw new Error('Tu usuario existe pero no esta activo para iniciar con Google.');
  }

  user.name = name || user.name;
  user.email = email;
  user.status = user.status === 'invited' ? 'active' : (user.status || status);
  user.updatedAt = now;
  user.lastLoginAt = now;
  user.authProviders = user.authProviders || {};
  user.authProviders.google = {
    ...user.authProviders.google,
    invitationPending: false,
    sub,
    emailVerified,
    picture: String(profile.picture || ''),
    givenName: String(profile.givenName || profile.given_name || ''),
    familyName: String(profile.familyName || profile.family_name || ''),
    locale: String(profile.locale || ''),
    linkedAt: user.authProviders.google?.linkedAt || now,
    lastLoginAt: now
  };
  user.authProviders.password = user.authProviders.password || {
    enabled: false,
    registeredAt: null
  };

  writeUsersFile(usersStore);
  return { user, action };
}

async function exchangeGoogleAuthorizationCode(tenant, code) {
  const body = new URLSearchParams({
    code,
    client_id: tenant.identity.google.clientId,
    client_secret: tenant.identity.google.clientSecret,
    redirect_uri: tenant.identity.google.redirectUri,
    grant_type: 'authorization_code'
  });

  const tokenResponse = await fetch(googleOauthTokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body
  });

  const tokenPayload = await tokenResponse.json().catch(() => ({}));
  if (!tokenResponse.ok || !tokenPayload.access_token) {
    throw new Error(tokenPayload.error_description || tokenPayload.error || 'No se pudo intercambiar el codigo OAuth con Google.');
  }

  const userInfoResponse = await fetch(googleOauthUserInfoUrl, {
    headers: {
      Authorization: `Bearer ${tokenPayload.access_token}`
    }
  });
  const userInfo = await userInfoResponse.json().catch(() => ({}));
  if (!userInfoResponse.ok) {
    throw new Error(userInfo.error_description || userInfo.error || 'Google no devolvio el perfil del usuario.');
  }

  return {
    email: String(userInfo.email || '').trim().toLowerCase(),
    sub: String(userInfo.sub || '').trim(),
    emailVerified: userInfo.email_verified === true || userInfo.email_verified === 'true',
    name: String(userInfo.name || '').trim(),
    givenName: String(userInfo.given_name || '').trim(),
    familyName: String(userInfo.family_name || '').trim(),
    picture: String(userInfo.picture || '').trim(),
    locale: String(userInfo.locale || '').trim()
  };
}

async function establishUserLogin(req, user) {
  await regenerateSession(req);
  req.session.userId = user.id;
  req.session.csrfToken = createCsrfToken();
  await saveSession(req);

  return {
    user: sanitizeUser(user),
    tenant: sanitizeTenant(getTenantById(user.tenantId)),
    capabilities: capabilityFlags(user.role),
    csrfToken: req.session.csrfToken,
    accessToken: issueUserJwt(user),
    tokenType: 'Bearer',
    expiresIn: jwtTtlSeconds
  };
}

function getBearerToken(req) {
  const header = req.get('authorization') || '';
  if (!header.startsWith('Bearer ')) {
    return null;
  }
  return header.slice('Bearer '.length).trim();
}

function currentUserFromJwt(req) {
  const token = getBearerToken(req);
  if (!token) {
    return null;
  }

  try {
    const payload = verifyUserJwt(token);
    if (payload.type !== 'user') {
      return null;
    }
    const usersStore = readUsersFile();
    const user = usersStore.users.find((entry) => entry.id === payload.sub && entry.tenantId === payload.tenantId) || null;
    if (!user || user.status !== 'active') {
      return null;
    }
    return { user, authMethod: 'jwt' };
  } catch (_error) {
    return null;
  }
}

function currentUserFromSession(req) {
  if (!req.session.userId) {
    return null;
  }

  const usersStore = readUsersFile();
  const user = usersStore.users.find((entry) => entry.id === req.session.userId) || null;
  if (!user || user.status !== 'active') {
    return null;
  }
  return { user, authMethod: 'session' };
}

function resolveUserContext(req) {
  return currentUserFromJwt(req) || currentUserFromSession(req);
}

function requireAuth(req, res, next) {
  const auth = resolveUserContext(req);
  if (!auth) {
    return res.status(401).json({ error: 'No autenticado.' });
  }

  req.user = auth.user;
  req.authMethod = auth.authMethod;
  req.capabilities = capabilityFlags(auth.user.role);
  ensureCsrfToken(req);
  return next();
}

function requireCapability(capability) {
  return (req, res, next) => {
    if (!req.capabilities?.[capability]) {
      return res.status(403).json({ error: 'Tu rol no tiene permisos para esa accion.' });
    }
    return next();
  };
}

function requireTrustedOrigin(req, res, next) {
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    return next();
  }

  const origin = req.get('origin');
  if (origin && !allowedOrigins.has(safeOrigin(origin))) {
    return res.status(403).json({ error: 'Origen no permitido.' });
  }

  return next();
}

function requireCsrf(req, res, next) {
  if (req.authMethod === 'jwt') {
    return next();
  }

  const providedToken = req.get('x-csrf-token');
  const sessionToken = req.session?.csrfToken;
  if (!providedToken || !sessionToken || !timingSafeStringEqual(providedToken, sessionToken)) {
    return res.status(403).json({ error: 'CSRF token invalido.' });
  }
  return next();
}

function requireApiKey(requiredScopes = []) {
  return (req, res, next) => {
    const apiKey = req.get('x-api-key') || '';
    if (!apiKey) {
      return res.status(401).json({ error: 'API key requerida.' });
    }

    const store = readApiKeysFile();
    const keyHash = hashApiKey(apiKey);
    const keyRecord = store.apiKeys.find((entry) => entry.keyHash === keyHash && entry.status === 'active');
    if (!keyRecord) {
      return res.status(401).json({ error: 'API key invalida.' });
    }

    const scopes = new Set(keyRecord.scopes || []);
    const hasAllScopes = requiredScopes.every((scope) => scopes.has(scope));
    if (!hasAllScopes) {
      return res.status(403).json({ error: 'La API key no tiene los scopes necesarios.' });
    }

    keyRecord.lastUsedAt = new Date().toISOString();
    keyRecord.updatedAt = keyRecord.lastUsedAt;
    writeApiKeysFile(store);

    req.apiKey = keyRecord;
    req.apiTenant = getTenantById(keyRecord.tenantId);
    return next();
  };
}

function canManageTargetUser(actor, targetUser, nextRole) {
  if (actor.role === 'owner') {
    return true;
  }

  if (actor.role === 'admin') {
    if (targetUser?.role === 'owner') {
      return false;
    }
    if (nextRole === 'owner') {
      return false;
    }
    return true;
  }

  return false;
}

function extractProducts() {
  const source = fs.readFileSync(productsFile, 'utf8');
  const startToken = 'const products = [';
  const startIndex = source.indexOf(startToken);
  if (startIndex === -1) {
    return [];
  }

  const endIndex = source.indexOf('\n];', startIndex);
  if (endIndex === -1) {
    return [];
  }

  const snippet = `${source.slice(startIndex, endIndex + 3)}\nreturn products;`;
  try {
    return Function(snippet)();
  } catch (_error) {
    return [];
  }
}

function getTenantCatalogProducts(tenantId) {
  const store = readCatalogProductsFile();
  return store.products
    .filter((product) => product.tenantId === tenantId)
    .map((product) => ({
      ...product,
      price: Number(product.price || 0),
      original: Number(product.original || 0)
    }));
}

function getTenantPhotoJobs(tenantId) {
  const store = readPhotoJobsFile();
  return store.jobs.filter((job) => job.tenantId === tenantId);
}

function summarizeProducts(tenantId) {
  const products = getTenantCatalogProducts(tenantId);
  const available = products.filter((product) => product.status === 'active');
  const sold = products.filter((product) => product.status === 'sold');
  const drafts = products.filter((product) => product.status === 'draft');
  const readyToPublish = products.filter((product) => product.status === 'ready');
  const needsPhoto = products.filter((product) => ['needs_capture', 'needs_ai'].includes(product.photoStatus));
  const aiQueued = products.filter((product) => product.photoStatus === 'ai_requested');
  const categories = [...new Set(products.map((product) => product.category).filter(Boolean))];
  const rooms = [...new Set(products.map((product) => product.room).filter(Boolean))];
  const cheapest = [...available]
    .sort((left, right) => Number(left.price || 0) - Number(right.price || 0))
    .slice(0, 4)
    .map((product) => ({
      name: product.name,
      price: product.price,
      category: product.category,
      room: product.room
    }));

  return {
    total: products.length,
    available: available.length,
    sold: sold.length,
    draft: drafts.length,
    readyToPublish: readyToPublish.length,
    needsPhoto: needsPhoto.length,
    aiQueued: aiQueued.length,
    categories,
    rooms,
    availableValue: available.reduce((sum, product) => sum + Number(product.price || 0), 0),
    cheapest,
    highlighted: products.slice(0, 8).map((product) => ({
      name: product.name,
      price: product.price,
      category: product.category,
      room: product.room,
      sold: product.status === 'sold',
      status: product.status,
      photoStatus: product.photoStatus
    })),
    sellerFocus: {
      pitch: 'Subir rapido, mejorar foto con IA y mover cada consulta a cierre.',
      nextAction: aiQueued.length
        ? `Hay ${aiQueued.length} producto(s) esperando mejora con Nano Banana o revision del automatizador.`
        : (drafts.length
          ? `Hay ${drafts.length} borrador(es) listos para completar y empujar a publicacion.`
          : 'El vendedor tiene el catalogo al dia. Toca empujar cierres y ofertas.'),
      salesScore: Math.max(0, Math.round((available.length * 4) + (readyToPublish.length * 6) - (needsPhoto.length * 3)))
    }
  };
}

function summarizeWorkflow() {
  if (!fs.existsSync(workflowFile)) {
    return {
      exists: false,
      name: 'Workflow no encontrado',
      active: false,
      nodes: [],
      webhookPath: null,
      file: path.relative(rootDir, workflowFile)
    };
  }

  const workflow = readJson(workflowFile);
  const webhookNode = workflow.nodes.find((node) => node.type === 'n8n-nodes-base.webhook');
  return {
    exists: true,
    name: workflow.name,
    active: Boolean(workflow.active),
    versionId: workflow.versionId || null,
    nodeCount: workflow.nodes.length,
    nodes: workflow.nodes.map((node) => ({
      name: node.name,
      type: node.type,
      position: node.position
    })),
    webhookPath: webhookNode?.parameters?.path || null,
    webhookId: webhookNode?.webhookId || null,
    file: path.relative(rootDir, workflowFile)
  };
}

function classifyCommit(subject) {
  const normalized = String(subject || '').toLowerCase();

  if (/(asistente|chatbot|n8n|chat)/.test(normalized)) return 'automation';
  if (/(vendid|venta|se fue|precio|productos|libros|oferta|mantel|tv|estufa|sillon|sommier)/.test(normalized)) return 'inventory';
  if (/(google|lighthouse|clean code|fix|review|mejores cards|mapa|theme|copy|mvp)/.test(normalized)) return 'publishing';
  return 'foundation';
}

function phaseMeta(key) {
  const meta = {
    foundation: {
      title: 'Fundacion del sitio',
      insight: 'Nacimiento del proyecto, layout inicial y primeras decisiones de publicacion.'
    },
    inventory: {
      title: 'Catalogo vivo',
      insight: 'El inventario se fue moviendo con cambios reales de precios, ventas y productos.'
    },
    automation: {
      title: 'Venta conversacional',
      insight: 'El proyecto dejo de ser una pagina estatica y paso a tener flujo asistido con n8n.'
    },
    publishing: {
      title: 'Performance y pulido',
      insight: 'Se reforzo la presentacion publica con fixes, copy y mejoras de calidad.'
    }
  };
  return meta[key] || meta.foundation;
}

function summarizeTimeline() {
  try {
    const output = execFileSync('git', ['log', '--reverse', '--pretty=format:%h|%ad|%s', '--date=short'], {
      cwd: rootDir,
      encoding: 'utf8'
    });

    const commits = output.split(/\r?\n/).filter(Boolean).map((line) => {
      const [hash, date, ...subjectParts] = line.split('|');
      const subject = subjectParts.join('|');
      return {
        hash,
        date,
        subject,
        phase: classifyCommit(subject)
      };
    });

    const phasesMap = new Map();
    commits.forEach((commit) => {
      if (!phasesMap.has(commit.phase)) {
        phasesMap.set(commit.phase, {
          key: commit.phase,
          ...phaseMeta(commit.phase),
          commits: []
        });
      }
      phasesMap.get(commit.phase).commits.push(commit);
    });

    return {
      totalCommits: commits.length,
      commits: commits.slice(-12),
      phases: [...phasesMap.values()].map((phase) => ({
        key: phase.key,
        title: phase.title,
        insight: phase.insight,
        commitCount: phase.commits.length,
        firstDate: phase.commits[0]?.date || null,
        lastDate: phase.commits[phase.commits.length - 1]?.date || null,
        highlights: phase.commits.slice(-3)
      }))
    };
  } catch (_error) {
    return {
      totalCommits: 0,
      commits: [],
      phases: []
    };
  }
}

function buildWorkspaceOverview(user, req) {
  const tenant = getTenantById(user.tenantId);
  const photoJobs = getTenantPhotoJobs(user.tenantId);
  return {
    currentUser: sanitizeUser(user),
    currentTenant: tenant ? sanitizeTenant(tenant) : null,
    roles: roleDefinitions,
    capabilities: capabilityFlags(user.role),
    workspace: tenant ? {
      domain: tenant.domain,
      publishing: tenant.publishing,
      vision: tenant.vision
    } : null,
    products: summarizeProducts(user.tenantId),
    photoStudio: {
      pending: photoJobs.filter((job) => job.status === 'pending').length,
      inProgress: photoJobs.filter((job) => job.status === 'in_progress').length,
      done: photoJobs.filter((job) => job.status === 'done').length,
      preferredTool: 'nano-banana'
    },
    workflow: summarizeWorkflow(),
    timeline: summarizeTimeline(),
    csrfToken: ensureCsrfToken(req)
  };
}

function publicConfig(tenantSlug) {
  const selectedTenant = getTenantForRequestSlug(String(tenantSlug || '').trim());
  return {
    security: {
      production: isProduction,
      demoAccountsVisible: !isProduction,
      authMode: 'jwt-plus-session-compat'
    },
    chat: {
      webhookUrl: publicChatWebhookUrl,
      webhookEnabled: Boolean(publicChatWebhookUrl),
      whatsappPhone: publicWhatsappPhone,
      siteName: publicSiteName
    },
    tenant: selectedTenant ? {
      slug: selectedTenant.slug,
      name: selectedTenant.name
    } : null,
    googleAuth: selectedTenant ? {
      enabled: googleOAuthConfigured(selectedTenant),
      clientId: selectedTenant.identity?.google?.clientId || '',
      redirectUri: selectedTenant.identity?.google?.redirectUri || '',
      hostedDomain: selectedTenant.identity?.google?.hostedDomain || '',
      buttonLabel: selectedTenant.identity?.google?.buttonLabel || 'Continuar con Google',
      startPath: '/api/auth/google/start'
    } : null
  };
}

ensureDataFiles();
validateRuntimeSecurity();

if (trustProxyCount > 0) {
  app.set('trust proxy', trustProxyCount);
}

app.disable('x-powered-by');
app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: buildConnectSources(),
      frameSrc: ["'self'", 'https://www.google.com', 'https://maps.google.com'],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: isProduction ? [] : null
    }
  },
  crossOriginEmbedderPolicy: false,
  referrerPolicy: { policy: 'no-referrer' },
  hsts: isProduction ? {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  } : false
}));
app.use(express.json({ limit: '64kb' }));
app.use(requireTrustedOrigin);

const sessionStore = new SessionFileStore({
  path: sessionsDir,
  ttl: Math.floor(sessionTtlMs / 1000),
  retries: 0,
  reapInterval: 3600,
  logFn: () => {}
});

app.use(session({
  store: sessionStore,
  name: sessionName,
  secret: sessionSecret || 'dev-only-session-secret-change-me',
  resave: false,
  saveUninitialized: false,
  proxy: trustProxyCount > 0,
  cookie: {
    httpOnly: true,
    sameSite: 'strict',
    secure: isProduction,
    maxAge: sessionTtlMs
  }
}));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProduction ? 300 : 1500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas solicitudes. Intenta nuevamente en unos minutos.' }
});

const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: isProduction ? 5 : 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos de login. Intenta mas tarde.' }
});

app.use('/api', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use((req, res, next) => {
  if (req.path.startsWith('/api') || req.path === '/app' || req.path === '/admin') {
    res.set('Cache-Control', 'no-store, max-age=0');
  }
  next();
});

app.use(express.static(rootDir, {
  extensions: ['html']
}));

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/api/public-config', (req, res) => {
  res.json(publicConfig(req.query.tenantSlug));
});

app.get('/api/auth/session', (req, res) => {
  const auth = resolveUserContext(req);
  if (!auth) {
    return res.json({
      authenticated: false,
      user: null,
      capabilities: null,
      csrfToken: null,
      tenant: null
    });
  }

  const tenant = getTenantById(auth.user.tenantId);
  return res.json({
    authenticated: true,
    user: sanitizeUser(auth.user),
    capabilities: capabilityFlags(auth.user.role),
    csrfToken: ensureCsrfToken(req),
    tenant: tenant ? sanitizeTenant(tenant) : null,
    accessToken: issueUserJwt(auth.user),
    tokenType: 'Bearer',
    expiresIn: jwtTtlSeconds
  });
});

app.post('/api/auth/login', async (req, res, next) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');
    const tenantSlug = String(req.body?.tenantSlug || '').trim();

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contrasena son obligatorios.' });
    }

    const usersStore = readUsersFile();
    const matchedTenant = tenantSlug ? getTenantBySlug(tenantSlug) : null;
    const matchingUsers = usersStore.users.filter((entry) => (
      entry.email.toLowerCase() === email &&
      (!matchedTenant || entry.tenantId === matchedTenant.id)
    ));
    if (!tenantSlug && matchingUsers.length > 1) {
      return res.status(409).json({ error: 'Ese email existe en mas de un tenant. Indica el tenant slug para iniciar sesion.' });
    }
    const user = matchingUsers[0];

    if (!user || user.status !== 'active' || !verifyPassword(password, user)) {
      return res.status(401).json({ error: 'Credenciales invalidas.' });
    }

    user.lastLoginAt = new Date().toISOString();
    user.updatedAt = user.lastLoginAt;
    if (user.authProviders?.password) {
      user.authProviders.password.lastLoginAt = user.lastLoginAt;
    }
    writeUsersFile(usersStore);

    return res.json(await establishUserLogin(req, user));
  } catch (error) {
    next(error);
  }
});

app.get('/api/auth/google/start', authLimiter, async (req, res, next) => {
  const tenantSlug = String(req.query?.tenantSlug || '').trim();
  const tenant = getTenantForRequestSlug(tenantSlug);

  if (!tenant) {
    return res.redirect('/app?auth_error=Tenant%20no%20encontrado.');
  }
  if (!googleOAuthConfigured(tenant)) {
    return res.redirect(`/app?auth_error=${encodeURIComponent('Google login no esta configurado para este tenant.')}`);
  }

  const state = createGoogleOAuthState(req, tenant);
  const params = new URLSearchParams({
    client_id: tenant.identity.google.clientId,
    redirect_uri: tenant.identity.google.redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    access_type: 'online',
    prompt: 'select_account'
  });

  const hostedDomain = String(tenant.identity.google.hostedDomain || '').trim();
  if (hostedDomain) {
    params.set('hd', hostedDomain);
  }

  try {
    await saveSession(req);
    return res.redirect(`${googleOauthAuthorizeUrl}?${params.toString()}`);
  } catch (error) {
    return next(error);
  }
});

app.get('/auth/google/callback', async (req, res) => {
  const error = String(req.query?.error || '').trim();
  if (error) {
    cleanupOAuthSession(req);
    return res.redirect(`/app?auth_error=${encodeURIComponent(`Google devolvio: ${error}`)}`);
  }

  const code = String(req.query?.code || '').trim();
  const state = String(req.query?.state || '').trim();
  const oauth = consumeGoogleOAuthState(req, state);
  if (!code || !oauth) {
    return res.redirect(`/app?auth_error=${encodeURIComponent('No se pudo validar la sesion OAuth de Google.')}`);
  }

  const tenant = getTenantById(oauth.tenantId);
  if (!tenant || !googleOAuthConfigured(tenant)) {
    return res.redirect(`/app?auth_error=${encodeURIComponent('Google login no esta disponible para este tenant.')}`);
  }

  try {
    const profile = await exchangeGoogleAuthorizationCode(tenant, code);
    const { user, action } = upsertGoogleUserFromProfile({
      tenant,
      profile,
      defaultRole: 'agent',
      status: 'active'
    });

    await establishUserLogin(req, user);
    return res.redirect(`/app?auth=google&signup=${encodeURIComponent(action)}`);
  } catch (oauthError) {
    return res.redirect(`/app?auth_error=${encodeURIComponent(oauthError.message || 'No se pudo completar el login con Google.')}`);
  }
});

app.get('/api/auth/logout', async (req, res) => {
  const redirectTenant = String(req.query?.tenantSlug || '').trim();
  const suffix = redirectTenant ? `&tenantSlug=${encodeURIComponent(redirectTenant)}` : '';
  const redirectTo = `/app?logged_out=1${suffix}`;

  cleanupOAuthSession(req);
  if (req.session) {
    await destroySession(req);
  }
  res.clearCookie(sessionName);
  return res.redirect(redirectTo);
});

app.post('/api/auth/logout', requireAuth, requireCsrf, async (req, res, next) => {
  try {
    const requestedTenantSlug = String(req.body?.tenantSlug || req.query?.tenantSlug || '').trim();
    const tenant = requestedTenantSlug ? getTenantBySlug(requestedTenantSlug) : getTenantById(req.user.tenantId);
    const tenantSlug = tenant?.slug || '';
    await destroySession(req);
    res.clearCookie(sessionName);
    res.json({ ok: true, redirectTo: `/app?logged_out=1${tenantSlug ? `&tenantSlug=${encodeURIComponent(tenantSlug)}` : ''}` });
  } catch (error) {
    next(error);
  }
});

app.get('/api/workspace/overview', requireAuth, (req, res) => {
  res.json(buildWorkspaceOverview(req.user, req));
});

app.patch('/api/workspace', requireAuth, requireCapability('manageWorkspace'), requireCsrf, (req, res) => {
  const tenantsStore = readTenantsFile();
  const tenant = tenantsStore.tenants.find((entry) => entry.id === req.user.tenantId);

  if (!tenant) {
    return res.status(404).json({ error: 'Tenant no encontrado.' });
  }

  const originalDomain = { ...tenant.domain };
  tenant.domain = {
    ...tenant.domain,
    ...(req.body?.domain || {})
  };
  tenant.publishing = {
    ...tenant.publishing,
    ...(req.body?.publishing || {})
  };
  tenant.vision = {
    ...tenant.vision,
    ...(req.body?.vision || {})
  };
  tenant.updatedAt = new Date().toISOString();

  if (!req.capabilities.manageDomain) {
    tenant.domain = originalDomain;
  }

  writeTenantsFile(tenantsStore);
  return res.json({
    workspace: {
      domain: tenant.domain,
      publishing: tenant.publishing,
      vision: tenant.vision
    },
    tenant: sanitizeTenant(tenant),
    csrfToken: ensureCsrfToken(req)
  });
});

app.patch('/api/tenant', requireAuth, requireCapability('manageTenant'), requireCsrf, (req, res) => {
  const tenantsStore = readTenantsFile();
  const tenant = tenantsStore.tenants.find((entry) => entry.id === req.user.tenantId);

  if (!tenant) {
    return res.status(404).json({ error: 'Tenant no encontrado.' });
  }

  const nextName = String(req.body?.name ?? tenant.name).trim();
  const nextSlug = slugify(req.body?.slug ?? tenant.slug);
  if (!nextName || !nextSlug) {
    return res.status(400).json({ error: 'Nombre y slug del tenant son obligatorios.' });
  }

  const duplicateSlug = tenantsStore.tenants.some((entry) => entry.id !== tenant.id && entry.slug === nextSlug);
  if (duplicateSlug) {
    return res.status(409).json({ error: 'Ya existe otro tenant con ese slug.' });
  }

  tenant.name = nextName;
  tenant.slug = nextSlug;
  tenant.status = String(req.body?.status || tenant.status).trim().toLowerCase();
  const nextGoogleIdentity = req.body?.identity?.google || {};
  tenant.identity = {
    ...tenant.identity,
    google: {
      ...tenant.identity?.google,
      ...nextGoogleIdentity,
      clientSecret: Object.prototype.hasOwnProperty.call(nextGoogleIdentity, 'clientSecret')
        ? String(nextGoogleIdentity.clientSecret || '').trim()
        : String(tenant.identity?.google?.clientSecret || '')
    }
  };
  tenant.updatedAt = new Date().toISOString();

  writeTenantsFile(tenantsStore);
  return res.json({ tenant: sanitizeTenant(tenant), csrfToken: ensureCsrfToken(req) });
});

function normalizeCatalogProductInput(body, currentProduct = null) {
  const nextName = body?.name === undefined ? currentProduct?.name || '' : String(body.name).trim();
  const nextCategory = body?.category === undefined ? currentProduct?.category || 'General' : String(body.category).trim();
  const nextRoom = body?.room === undefined ? currentProduct?.room || 'Sin ambiente' : String(body.room).trim();
  const nextStatus = body?.status === undefined ? currentProduct?.status || 'draft' : String(body.status).trim().toLowerCase();
  const nextPhotoStatus = body?.photoStatus === undefined ? currentProduct?.photoStatus || 'original' : String(body.photoStatus).trim().toLowerCase();
  const nextAiTool = body?.aiToolPreference === undefined ? currentProduct?.aiToolPreference || 'nano-banana' : String(body.aiToolPreference).trim().toLowerCase();
  const nextPrice = body?.price === undefined ? Number(currentProduct?.price || 0) : Number(body.price || 0);
  const nextOriginal = body?.original === undefined ? Number(currentProduct?.original || 0) : Number(body.original || 0);

  const validStatuses = new Set(['draft', 'ready', 'active', 'sold', 'archived']);
  const validPhotoStatuses = new Set(['needs_capture', 'original', 'needs_ai', 'ai_requested', 'ai_ready']);
  const validAiTools = new Set(['nano-banana', 'manual']);

  if (!nextName || !nextCategory || !nextRoom) {
    throw new Error('Nombre, categoria y ambiente son obligatorios.');
  }
  if (!Number.isFinite(nextPrice) || nextPrice < 0 || !Number.isFinite(nextOriginal) || nextOriginal < 0) {
    throw new Error('Precio y valor de referencia deben ser numericos validos.');
  }
  if (!validStatuses.has(nextStatus) || !validPhotoStatuses.has(nextPhotoStatus) || !validAiTools.has(nextAiTool)) {
    throw new Error('Estado del producto, foto o herramienta IA invalido.');
  }

  return {
    name: nextName,
    category: nextCategory,
    room: nextRoom,
    price: nextPrice,
    original: nextOriginal,
    image: body?.image === undefined ? currentProduct?.image || '' : String(body.image || '').trim(),
    improvedImage: body?.improvedImage === undefined ? currentProduct?.improvedImage || '' : String(body.improvedImage || '').trim(),
    status: nextStatus,
    description: body?.description === undefined ? currentProduct?.description || '' : String(body.description || '').trim(),
    salesNote: body?.salesNote === undefined ? currentProduct?.salesNote || '' : String(body.salesNote || '').trim(),
    leadAngle: body?.leadAngle === undefined ? currentProduct?.leadAngle || '' : String(body.leadAngle || '').trim(),
    photoStatus: nextPhotoStatus,
    photoPrompt: body?.photoPrompt === undefined ? currentProduct?.photoPrompt || '' : String(body.photoPrompt || '').trim(),
    aiToolPreference: nextAiTool
  };
}

app.get('/api/catalog/products', requireAuth, requireCapability('viewProducts'), (req, res) => {
  const products = getTenantCatalogProducts(req.user.tenantId)
    .sort((left, right) => new Date(right.updatedAt || 0) - new Date(left.updatedAt || 0))
    .map(sanitizeCatalogProduct);
  return res.json({ products });
});

app.post('/api/catalog/products', requireAuth, requireCapability('publishCatalog'), requireCsrf, (req, res) => {
  try {
    const input = normalizeCatalogProductInput(req.body);
    const store = readCatalogProductsFile();
    const now = new Date().toISOString();
    const product = {
      id: crypto.randomUUID(),
      tenantId: req.user.tenantId,
      source: 'manual',
      ...input,
      createdAt: now,
      updatedAt: now,
      createdByUserId: req.user.id,
      lastPublishedAt: input.status === 'active' ? now : null
    };

    store.products.push(product);
    writeCatalogProductsFile(store);
    return res.status(201).json({ product: sanitizeCatalogProduct(product), csrfToken: ensureCsrfToken(req) });
  } catch (error) {
    return res.status(400).json({ error: error.message || 'No se pudo crear el producto.' });
  }
});

app.patch('/api/catalog/products/:id', requireAuth, requireCapability('publishCatalog'), requireCsrf, (req, res) => {
  const store = readCatalogProductsFile();
  const product = store.products.find((entry) => entry.id === req.params.id && entry.tenantId === req.user.tenantId);

  if (!product) {
    return res.status(404).json({ error: 'Producto no encontrado.' });
  }

  try {
    const input = normalizeCatalogProductInput(req.body, product);
    Object.assign(product, input, {
      updatedAt: new Date().toISOString(),
      lastPublishedAt: input.status === 'active' ? (product.lastPublishedAt || new Date().toISOString()) : product.lastPublishedAt
    });
    writeCatalogProductsFile(store);
    return res.json({ product: sanitizeCatalogProduct(product), csrfToken: ensureCsrfToken(req) });
  } catch (error) {
    return res.status(400).json({ error: error.message || 'No se pudo actualizar el producto.' });
  }
});

app.get('/api/catalog/photo-jobs', requireAuth, (req, res) => {
  if (!canAccessPhotoStudio(req.capabilities)) {
    return res.status(403).json({ error: 'Tu rol no tiene permisos para el estudio de foto.' });
  }
  const jobs = getTenantPhotoJobs(req.user.tenantId)
    .sort((left, right) => new Date(right.updatedAt || 0) - new Date(left.updatedAt || 0))
    .map(sanitizePhotoJob);
  return res.json({ jobs });
});

app.post('/api/catalog/products/:id/photo-jobs', requireAuth, requireCapability('publishCatalog'), requireCsrf, (req, res) => {
  const catalogStore = readCatalogProductsFile();
  const product = catalogStore.products.find((entry) => entry.id === req.params.id && entry.tenantId === req.user.tenantId);

  if (!product) {
    return res.status(404).json({ error: 'Producto no encontrado para pedir mejora de foto.' });
  }

  const prompt = String(req.body?.prompt || '').trim();
  const requestedTool = String(req.body?.requestedTool || 'nano-banana').trim().toLowerCase();
  if (!prompt) {
    return res.status(400).json({ error: 'Describe la mejora visual que necesita el automatizador.' });
  }
  if (!['nano-banana', 'manual'].includes(requestedTool)) {
    return res.status(400).json({ error: 'Herramienta de mejora invalida.' });
  }

  const jobsStore = readPhotoJobsFile();
  const now = new Date().toISOString();
  const job = {
    id: crypto.randomUUID(),
    tenantId: req.user.tenantId,
    productId: product.id,
    productName: product.name,
    status: 'pending',
    requestedTool,
    prompt,
    requestedByUserId: req.user.id,
    requestedAt: now,
    assignedToRole: 'admin',
    resultImage: '',
    resultNotes: '',
    updatedAt: now,
    completedAt: null
  };

  jobsStore.jobs.push(job);
  writePhotoJobsFile(jobsStore);

  product.photoStatus = 'ai_requested';
  product.photoPrompt = prompt;
  product.aiToolPreference = requestedTool;
  product.updatedAt = now;
  writeCatalogProductsFile(catalogStore);

  return res.status(201).json({
    job: sanitizePhotoJob(job),
    product: sanitizeCatalogProduct(product),
    csrfToken: ensureCsrfToken(req)
  });
});

app.patch('/api/catalog/photo-jobs/:id', requireAuth, requireCapability('manageWorkflow'), requireCsrf, (req, res) => {
  const jobsStore = readPhotoJobsFile();
  const job = jobsStore.jobs.find((entry) => entry.id === req.params.id && entry.tenantId === req.user.tenantId);

  if (!job) {
    return res.status(404).json({ error: 'Solicitud de foto no encontrada.' });
  }

  const nextStatus = String(req.body?.status || job.status).trim().toLowerCase();
  const validStatuses = new Set(['pending', 'in_progress', 'done', 'canceled']);
  if (!validStatuses.has(nextStatus)) {
    return res.status(400).json({ error: 'Estado de solicitud invalido.' });
  }

  job.status = nextStatus;
  job.resultImage = req.body?.resultImage === undefined ? job.resultImage : String(req.body.resultImage || '').trim();
  job.resultNotes = req.body?.resultNotes === undefined ? job.resultNotes : String(req.body.resultNotes || '').trim();
  job.updatedAt = new Date().toISOString();
  job.completedAt = nextStatus === 'done' ? job.updatedAt : null;
  writePhotoJobsFile(jobsStore);

  const catalogStore = readCatalogProductsFile();
  const product = catalogStore.products.find((entry) => entry.id === job.productId && entry.tenantId === req.user.tenantId);
  if (product) {
    product.photoStatus = nextStatus === 'done' ? 'ai_ready' : (nextStatus === 'in_progress' ? 'ai_requested' : 'needs_ai');
    product.photoPrompt = job.prompt;
    if (job.resultImage) {
      product.improvedImage = job.resultImage;
    }
    product.updatedAt = job.updatedAt;
    writeCatalogProductsFile(catalogStore);
  }

  return res.json({
    job: sanitizePhotoJob(job),
    product: product ? sanitizeCatalogProduct(product) : null,
    csrfToken: ensureCsrfToken(req)
  });
});

app.get('/api/users', requireAuth, requireCapability('manageUsers'), (req, res) => {
  const usersStore = readUsersFile();
  res.json({
    users: usersStore.users
      .filter((user) => user.tenantId === req.user.tenantId)
      .map(sanitizeUser)
  });
});

app.post('/api/users', requireAuth, requireCapability('manageUsers'), requireCsrf, (req, res) => {
  const name = String(req.body?.name || '').trim();
  const email = String(req.body?.email || '').trim().toLowerCase();
  const role = String(req.body?.role || 'agent').trim().toLowerCase();
  const password = String(req.body?.password || '');
  const status = String(req.body?.status || 'active').trim().toLowerCase();
  const accessMode = String(req.body?.accessMode || 'password').trim().toLowerCase();

  const validRoles = new Set(['owner', 'admin', 'agent']);
  const validStatuses = new Set(['active', 'invited', 'disabled']);
  const validAccessModes = new Set(['password', 'google', 'hybrid']);
  if (!name || !email) {
    return res.status(400).json({ error: 'Nombre y email son obligatorios.' });
  }
  if (!validRoles.has(role) || !validStatuses.has(status) || !validAccessModes.has(accessMode)) {
    return res.status(400).json({ error: 'Rol, estado o tipo de acceso invalido.' });
  }

  const passwordEnabled = accessMode === 'password' || accessMode === 'hybrid';
  const googleEnabled = accessMode === 'google' || accessMode === 'hybrid';

  if (passwordEnabled && !password) {
    return res.status(400).json({ error: 'Define una contrasena para usuarios con acceso por password.' });
  }
  if (passwordEnabled && !validatePasswordPolicy(password)) {
    return res.status(400).json({ error: 'La contrasena debe tener al menos 10 caracteres, mayuscula, minuscula y numero.' });
  }
  if (!canManageTargetUser(req.user, null, role)) {
    return res.status(403).json({ error: 'Tu rol no puede crear ese tipo de usuario.' });
  }

  const usersStore = readUsersFile();
  const exists = usersStore.users.some((user) => user.tenantId === req.user.tenantId && user.email.toLowerCase() === email);
  if (exists) {
    return res.status(409).json({ error: 'Ya existe un usuario con ese email en este tenant.' });
  }

  const now = new Date().toISOString();
  const salt = passwordEnabled ? crypto.randomBytes(16).toString('hex') : '';
  const user = {
    id: crypto.randomUUID(),
    tenantId: req.user.tenantId,
    name,
    email,
    role,
    status,
    passwordHash: passwordEnabled ? hashPassword(password, salt) : '',
    salt,
    createdAt: now,
    updatedAt: now,
    lastLoginAt: null,
    authProviders: {
      password: {
        enabled: passwordEnabled,
        registeredAt: passwordEnabled ? now : null
      },
      google: googleEnabled ? {
        invitationPending: true,
        invitedAt: now,
        invitedByUserId: req.user.id,
        sub: null,
        emailVerified: false,
        picture: '',
        givenName: '',
        familyName: '',
        locale: '',
        linkedAt: null,
        lastLoginAt: null
      } : null
    }
  };

  usersStore.users.push(user);
  writeUsersFile(usersStore);
  return res.status(201).json({ user: sanitizeUser(user), csrfToken: ensureCsrfToken(req) });
});

app.patch('/api/users/:id', requireAuth, requireCapability('manageUsers'), requireCsrf, (req, res) => {
  const usersStore = readUsersFile();
  const user = usersStore.users.find((entry) => entry.id === req.params.id && entry.tenantId === req.user.tenantId);

  if (!user) {
    return res.status(404).json({ error: 'Usuario no encontrado.' });
  }

  const nextName = req.body?.name === undefined ? user.name : String(req.body.name).trim();
  const nextEmail = req.body?.email === undefined ? user.email : String(req.body.email).trim().toLowerCase();
  const nextRole = req.body?.role === undefined ? user.role : String(req.body.role).trim().toLowerCase();
  const nextStatus = req.body?.status === undefined ? user.status : String(req.body.status).trim().toLowerCase();
  const nextPassword = req.body?.password === undefined ? '' : String(req.body.password);
  const nextAccessMode = req.body?.accessMode === undefined ? deriveUserAccessMode(user) : String(req.body.accessMode).trim().toLowerCase();

  const validRoles = new Set(['owner', 'admin', 'agent']);
  const validStatuses = new Set(['active', 'invited', 'disabled']);
  const validAccessModes = new Set(['password', 'google', 'hybrid']);
  if (!nextName || !nextEmail || !validRoles.has(nextRole) || !validStatuses.has(nextStatus) || !validAccessModes.has(nextAccessMode)) {
    return res.status(400).json({ error: 'Datos invalidos para actualizar el usuario.' });
  }
  if (nextPassword && !validatePasswordPolicy(nextPassword)) {
    return res.status(400).json({ error: 'La nueva contrasena debe tener al menos 10 caracteres, mayuscula, minuscula y numero.' });
  }
  if (!canManageTargetUser(req.user, user, nextRole)) {
    return res.status(403).json({ error: 'Tu rol no puede modificar ese usuario.' });
  }

  const duplicateEmail = usersStore.users.some((entry) => (
    entry.id !== user.id &&
    entry.tenantId === req.user.tenantId &&
    entry.email.toLowerCase() === nextEmail
  ));
  if (duplicateEmail) {
    return res.status(409).json({ error: 'Ya existe otro usuario con ese email.' });
  }

  user.name = nextName;
  user.email = nextEmail;
  user.role = nextRole;
  user.status = nextStatus;
  user.updatedAt = new Date().toISOString();

  const passwordShouldBeEnabled = nextAccessMode === 'password' || nextAccessMode === 'hybrid';
  const googleShouldBeEnabled = nextAccessMode === 'google' || nextAccessMode === 'hybrid';
  const hasExistingPassword = Boolean(user.passwordHash && user.salt && user.authProviders?.password?.enabled);

  if (passwordShouldBeEnabled && !hasExistingPassword && !nextPassword) {
    return res.status(400).json({ error: 'Debes definir una contrasena para habilitar acceso por password.' });
  }

  if (passwordShouldBeEnabled && nextPassword) {
    user.salt = crypto.randomBytes(16).toString('hex');
    user.passwordHash = hashPassword(nextPassword, user.salt);
    user.authProviders.password = {
      enabled: true,
      registeredAt: user.authProviders?.password?.registeredAt || user.createdAt,
      lastUpdatedAt: user.updatedAt
    };
  } else if (passwordShouldBeEnabled) {
    user.authProviders.password = {
      enabled: true,
      registeredAt: user.authProviders?.password?.registeredAt || user.createdAt,
      lastUpdatedAt: user.authProviders?.password?.lastUpdatedAt || user.updatedAt
    };
  } else {
    user.passwordHash = '';
    user.salt = '';
    user.authProviders.password = {
      enabled: false,
      registeredAt: user.authProviders?.password?.registeredAt || null,
      lastUpdatedAt: user.updatedAt
    };
  }

  if (googleShouldBeEnabled) {
    user.authProviders.google = {
      ...user.authProviders.google,
      invitationPending: Boolean(!user.authProviders?.google?.sub),
      invitedAt: user.authProviders?.google?.invitedAt || user.updatedAt,
      invitedByUserId: user.authProviders?.google?.invitedByUserId || req.user.id,
      sub: user.authProviders?.google?.sub || null,
      emailVerified: Boolean(user.authProviders?.google?.emailVerified),
      picture: user.authProviders?.google?.picture || '',
      givenName: user.authProviders?.google?.givenName || '',
      familyName: user.authProviders?.google?.familyName || '',
      locale: user.authProviders?.google?.locale || '',
      linkedAt: user.authProviders?.google?.linkedAt || null,
      lastLoginAt: user.authProviders?.google?.lastLoginAt || null
    };
  } else {
    user.authProviders.google = null;
  }

  writeUsersFile(usersStore);
  return res.json({ user: sanitizeUser(user), csrfToken: ensureCsrfToken(req) });
});

app.get('/api/m2m/keys', requireAuth, requireCapability('manageApiKeys'), (req, res) => {
  const store = readApiKeysFile();
  res.json({
    apiKeys: store.apiKeys
      .filter((key) => key.tenantId === req.user.tenantId)
      .map(sanitizeApiKey)
  });
});

app.post('/api/m2m/keys', requireAuth, requireCapability('manageApiKeys'), requireCsrf, (req, res) => {
  const name = String(req.body?.name || '').trim();
  const scopes = Array.isArray(req.body?.scopes) ? req.body.scopes.map((scope) => String(scope).trim()).filter(Boolean) : [];

  if (!name || !scopes.length) {
    return res.status(400).json({ error: 'Nombre y scopes son obligatorios para la API key.' });
  }

  const rawKey = createOpaqueKey('cmk');
  const now = new Date().toISOString();
  const record = {
    id: crypto.randomUUID(),
    tenantId: req.user.tenantId,
    name,
    keyPrefix: rawKey.slice(0, 12),
    keyHash: hashApiKey(rawKey),
    scopes,
    status: 'active',
    createdAt: now,
    updatedAt: now,
    lastUsedAt: null,
    createdByUserId: req.user.id
  };

  const store = readApiKeysFile();
  store.apiKeys.push(record);
  writeApiKeysFile(store);

  return res.status(201).json({
    apiKey: sanitizeApiKey(record),
    rawKey,
    csrfToken: ensureCsrfToken(req)
  });
});

app.post('/api/m2m/keys/:id/revoke', requireAuth, requireCapability('manageApiKeys'), requireCsrf, (req, res) => {
  const store = readApiKeysFile();
  const key = store.apiKeys.find((entry) => entry.id === req.params.id && entry.tenantId === req.user.tenantId);

  if (!key) {
    return res.status(404).json({ error: 'API key no encontrada.' });
  }

  key.status = 'revoked';
  key.updatedAt = new Date().toISOString();
  writeApiKeysFile(store);
  return res.json({ apiKey: sanitizeApiKey(key), csrfToken: ensureCsrfToken(req) });
});

app.post('/api/m2m/google/register', requireApiKey(['identity:google-provision']), (req, res) => {
  const tenantSlug = String(req.body?.tenantSlug || req.apiTenant?.slug || '').trim();
  const tenant = tenantSlug ? getTenantBySlug(tenantSlug) : req.apiTenant;

  if (!tenant) {
    return res.status(404).json({ error: 'Tenant no encontrado para alta Google.' });
  }
  if (!tenant.identity?.google?.enabled) {
    return res.status(403).json({ error: 'Google signup no esta habilitado para este tenant.' });
  }
  try {
    const { user, action } = upsertGoogleUserFromProfile({
      tenant,
      profile: req.body?.profile || {},
      defaultRole: String(req.body?.role || 'agent').trim().toLowerCase(),
      status: String(req.body?.status || 'active').trim().toLowerCase()
    });

    return res.json({
      action,
      user: sanitizeUser(user),
      tenant: sanitizeTenant(tenant),
      accessToken: issueUserJwt(user),
      tokenType: 'Bearer',
      expiresIn: jwtTtlSeconds
    });
  } catch (error) {
    const message = error.message || 'No se pudo provisionar el usuario Google.';
    const statusCode = /no esta autorizado|no pertenece|no esta habilitado|no esta activo/i.test(message) ? 403 : 400;
    return res.status(statusCode).json({ error: message });
  }
});

app.get('/api/tenant/current', requireAuth, requireCapability('viewTenant'), (req, res) => {
  const tenant = getTenantById(req.user.tenantId);
  res.json({ tenant: tenant ? sanitizeTenant(tenant) : null });
});

app.get(['/admin', '/app'], (_req, res) => {
  res.set('Cache-Control', 'no-store, max-age=0');
  res.sendFile(path.join(rootDir, 'app.html'));
});

app.get('*', (_req, res) => {
  res.sendFile(path.join(rootDir, 'index.html'));
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: 'Error interno del servidor.' });
});

app.listen(port, () => {
  console.log(`Casa Medanos server listening on http://localhost:${port}`);
});
