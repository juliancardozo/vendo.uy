const state = {
  sessionUser: null,
  capabilities: {},
  overview: null,
  publicConfig: null,
  csrfToken: null,
  accessToken: null,
  currentTenant: null,
  apiKeys: [],
  latestApiKey: null,
  catalogProducts: [],
  photoJobs: [],
  users: [],
  editingUserId: null,
  editingCatalogProductId: null
};

const ACCESS_TOKEN_KEY = 'cm_access_token';

const refs = {
  loginPanel: document.getElementById('loginPanel'),
  dashboardView: document.getElementById('dashboardView'),
  logoutButton: document.getElementById('logoutButton'),
  loginForm: document.getElementById('loginForm'),
  loginEmail: document.getElementById('loginEmail'),
  loginTenantSlug: document.getElementById('loginTenantSlug'),
  loginPassword: document.getElementById('loginPassword'),
  googleLoginButton: document.getElementById('googleLoginButton'),
  googleLoginHelper: document.getElementById('googleLoginHelper'),
  loginStatus: document.getElementById('loginStatus'),
  metricUsers: document.getElementById('metricUsers'),
  metricProducts: document.getElementById('metricProducts'),
  metricSold: document.getElementById('metricSold'),
  metricWorkflow: document.getElementById('metricWorkflow'),
  currentRolePill: document.getElementById('currentRolePill'),
  rolesGrid: document.getElementById('rolesGrid'),
  currentSessionBox: document.getElementById('currentSessionBox'),
  domainSection: document.getElementById('domainSection'),
  domainStatusPill: document.getElementById('domainStatusPill'),
  domainCustomDomain: document.getElementById('domainCustomDomain'),
  domainPublicUrl: document.getElementById('domainPublicUrl'),
  domainDeployBranch: document.getElementById('domainDeployBranch'),
  domainPublicationStatus: document.getElementById('domainPublicationStatus'),
  domainDnsStatus: document.getElementById('domainDnsStatus'),
  domainSslStatus: document.getElementById('domainSslStatus'),
  publishingFocus: document.getElementById('publishingFocus'),
  visionThesis: document.getElementById('visionThesis'),
  visionExperiment: document.getElementById('visionExperiment'),
  workspaceForm: document.getElementById('workspaceForm'),
  workspaceStatus: document.getElementById('workspaceStatus'),
  workflowActivePill: document.getElementById('workflowActivePill'),
  workflowSection: document.getElementById('workflowSection'),
  workflowName: document.getElementById('workflowName'),
  workflowMeta: document.getElementById('workflowMeta'),
  workflowNodes: document.getElementById('workflowNodes'),
  workflowInsightBox: document.getElementById('workflowInsightBox'),
  workflowStudioSection: document.getElementById('workflowStudioSection'),
  workflowOpsTitle: document.getElementById('workflowOpsTitle'),
  workflowOpsMeta: document.getElementById('workflowOpsMeta'),
  workflowSignalsList: document.getElementById('workflowSignalsList'),
  workflowPhotoQueue: document.getElementById('workflowPhotoQueue'),
  workflowActionStatus: document.getElementById('workflowActionStatus'),
  innovationSummary: document.getElementById('innovationSummary'),
  visionSection: document.getElementById('visionSection'),
  checklistSection: document.getElementById('checklistSection'),
  launchChecklist: document.getElementById('launchChecklist'),
  refreshOverviewButton: document.getElementById('refreshOverviewButton'),
  storySection: document.getElementById('storySection'),
  timelineSection: document.getElementById('timelineSection'),
  productsSection: document.getElementById('productsSection'),
  timelineList: document.getElementById('timelineList'),
  productsSummaryTitle: document.getElementById('productsSummaryTitle'),
  productsSummaryMeta: document.getElementById('productsSummaryMeta'),
  highlightedProducts: document.getElementById('highlightedProducts'),
  cheapestProducts: document.getElementById('cheapestProducts'),
  productsInsightBox: document.getElementById('productsInsightBox'),
  sellerWorkspaceSection: document.getElementById('sellerWorkspaceSection'),
  sellerFocusSubtitle: document.getElementById('sellerFocusSubtitle'),
  sellerScoreBox: document.getElementById('sellerScoreBox'),
  refreshCatalogButton: document.getElementById('refreshCatalogButton'),
  catalogProductList: document.getElementById('catalogProductList'),
  catalogProductForm: document.getElementById('catalogProductForm'),
  catalogProductName: document.getElementById('catalogProductName'),
  catalogProductPrice: document.getElementById('catalogProductPrice'),
  catalogProductOriginal: document.getElementById('catalogProductOriginal'),
  catalogProductCategory: document.getElementById('catalogProductCategory'),
  catalogProductRoom: document.getElementById('catalogProductRoom'),
  catalogProductStatus: document.getElementById('catalogProductStatus'),
  catalogProductPhotoStatus: document.getElementById('catalogProductPhotoStatus'),
  catalogProductAiTool: document.getElementById('catalogProductAiTool'),
  catalogProductImage: document.getElementById('catalogProductImage'),
  catalogProductPhotoPrompt: document.getElementById('catalogProductPhotoPrompt'),
  catalogProductDescription: document.getElementById('catalogProductDescription'),
  catalogProductSalesNote: document.getElementById('catalogProductSalesNote'),
  catalogProductLeadAngle: document.getElementById('catalogProductLeadAngle'),
  catalogProductHint: document.getElementById('catalogProductHint'),
  catalogProductResetButton: document.getElementById('catalogProductResetButton'),
  catalogProductStatusMessage: document.getElementById('catalogProductStatusMessage'),
  refreshPhotoJobsButton: document.getElementById('refreshPhotoJobsButton'),
  photoStudioHelper: document.getElementById('photoStudioHelper'),
  photoJobList: document.getElementById('photoJobList'),
  photoJobStatusMessage: document.getElementById('photoJobStatusMessage'),
  usersSection: document.getElementById('usersSection'),
  refreshUsersButton: document.getElementById('refreshUsersButton'),
  userList: document.getElementById('userList'),
  editorTitle: document.getElementById('editorTitle'),
  newUserButton: document.getElementById('newUserButton'),
  userForm: document.getElementById('userForm'),
  userName: document.getElementById('userName'),
  userEmail: document.getElementById('userEmail'),
  userRole: document.getElementById('userRole'),
  userStatus: document.getElementById('userStatus'),
  userAccessMode: document.getElementById('userAccessMode'),
  userPassword: document.getElementById('userPassword'),
  passwordLabel: document.getElementById('passwordLabel'),
  userInviteHint: document.getElementById('userInviteHint'),
  userStatusMessage: document.getElementById('userStatusMessage'),
  tenantSecuritySection: document.getElementById('tenantSecuritySection'),
  tenantIdentitySection: document.getElementById('tenantIdentitySection'),
  tenantForm: document.getElementById('tenantForm'),
  tenantName: document.getElementById('tenantName'),
  tenantSlug: document.getElementById('tenantSlug'),
  tenantStatus: document.getElementById('tenantStatus'),
  tenantId: document.getElementById('tenantId'),
  googleEnabled: document.getElementById('googleEnabled'),
  googleHostedDomain: document.getElementById('googleHostedDomain'),
  googleClientId: document.getElementById('googleClientId'),
  googleClientSecret: document.getElementById('googleClientSecret'),
  googleRedirectUri: document.getElementById('googleRedirectUri'),
  googleAllowedDomains: document.getElementById('googleAllowedDomains'),
  googleButtonLabel: document.getElementById('googleButtonLabel'),
  googleClientSecretStatus: document.getElementById('googleClientSecretStatus'),
  saveTenantButton: document.getElementById('saveTenantButton'),
  tenantStatusMessage: document.getElementById('tenantStatusMessage'),
  apiKeysSection: document.getElementById('apiKeysSection'),
  refreshApiKeysButton: document.getElementById('refreshApiKeysButton'),
  apiKeyForm: document.getElementById('apiKeyForm'),
  apiKeyName: document.getElementById('apiKeyName'),
  apiKeyScopes: document.getElementById('apiKeyScopes'),
  apiKeyStatusMessage: document.getElementById('apiKeyStatusMessage'),
  apiKeySecretBox: document.getElementById('apiKeySecretBox'),
  googleProvisioningPreview: document.getElementById('googleProvisioningPreview'),
  apiKeyList: document.getElementById('apiKeyList')
};

function setStatus(element, message, tone) {
  element.textContent = message || '';
  element.className = 'status';
  if (tone) {
    element.classList.add(`status--${tone}`);
  }
}

async function request(url, options = {}) {
  const method = String(options.method || 'GET').toUpperCase();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (state.accessToken) {
    headers.Authorization = `Bearer ${state.accessToken}`;
  }

  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) && state.csrfToken) {
    headers['x-csrf-token'] = state.csrfToken;
  }

  const response = await fetch(url, {
    headers,
    ...options
  });

  const isJson = response.headers.get('content-type')?.includes('application/json');
  if (!isJson) {
    throw new Error('La API del panel no esta disponible. Inicia el servidor con npm start y abre /app desde ese servidor.');
  }

  const payload = await response.json();
  if (payload?.csrfToken) {
    state.csrfToken = payload.csrfToken;
  }
  if (payload?.accessToken) {
    state.accessToken = payload.accessToken;
    window.localStorage.setItem(ACCESS_TOKEN_KEY, payload.accessToken);
  }
  if (!response.ok) {
    throw new Error(payload?.error || 'No se pudo completar la operacion.');
  }
  return payload;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function formatDate(isoDate) {
  if (!isoDate) {
    return 'Sin actividad aun';
  }
  return new Intl.DateTimeFormat('es-UY', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(isoDate));
}

function formatMoney(value) {
  return new Intl.NumberFormat('es-UY', {
    style: 'currency',
    currency: 'UYU',
    maximumFractionDigits: 0
  }).format(Number(value || 0));
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function parseCommaList(value) {
  return String(value || '')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function roleLabel(role) {
  return state.overview?.roles?.[role]?.label || role || '-';
}

function authProviderSummary(user) {
  const providers = [];
  if (user?.authProviders?.password?.enabled) {
    providers.push('password');
  }
  if (user?.authProviders?.google?.linked) {
    providers.push('google');
  } else if (user?.authProviders?.google?.invitationPending) {
    providers.push('google invite');
  }
  return providers.length ? providers.join(' + ') : 'sin provider';
}

function productStatusLabel(status) {
  const labels = {
    draft: 'draft',
    ready: 'ready',
    active: 'activo',
    sold: 'vendido',
    archived: 'archivado'
  };
  return labels[status] || status || '-';
}

function photoStatusLabel(status) {
  const labels = {
    needs_capture: 'falta foto',
    original: 'foto original',
    needs_ai: 'pide IA',
    ai_requested: 'IA pedida',
    ai_ready: 'IA lista'
  };
  return labels[status] || status || '-';
}

function deriveUserAccessMode(user) {
  return user?.accessMode || 'password';
}

function buildGoogleInviteUrl() {
  const tenantSlug = state.currentTenant?.slug || refs.loginTenantSlug.value.trim();
  if (!tenantSlug) {
    return '';
  }
  return `${window.location.origin}/app?tenantSlug=${encodeURIComponent(tenantSlug)}`;
}

function updateUserFormModeHints() {
  const accessMode = refs.userAccessMode.value;
  const requiresPassword = accessMode === 'password' || accessMode === 'hybrid';
  const usesGoogleInvite = accessMode === 'google' || accessMode === 'hybrid';

  refs.userPassword.disabled = !requiresPassword;
  refs.userPassword.placeholder = requiresPassword ? '' : 'Sin password: acceso por Google';
  refs.passwordLabel.textContent = state.editingUserId ? 'Nueva contrasena opcional' : 'Contrasena inicial';

  if (accessMode === 'google' && !state.editingUserId) {
    refs.userStatus.value = 'invited';
  } else if ((accessMode === 'hybrid' || accessMode === 'password') && !state.editingUserId && refs.userStatus.value === 'invited') {
    refs.userStatus.value = 'active';
  }

  if (accessMode === 'google') {
    refs.passwordLabel.textContent = 'Sin contrasena para invitacion Google';
  } else if (accessMode === 'hybrid') {
    refs.passwordLabel.textContent = state.editingUserId ? 'Nueva contrasena opcional para modo mixto' : 'Contrasena inicial para modo mixto';
  }

  const inviteUrl = buildGoogleInviteUrl();
  if (!usesGoogleInvite || !inviteUrl) {
    refs.userInviteHint.hidden = true;
    refs.userInviteHint.textContent = '';
    return;
  }

  const loginCapability = state.publicConfig?.googleAuth?.enabled
    ? 'Google login activo.'
    : 'Google login aun no esta habilitado en el tenant.';
  refs.userInviteHint.hidden = false;
  refs.userInviteHint.innerHTML = `
    <strong>Acceso del invitado</strong><br />
    ${loginCapability}<br />
    URL directa: <code>${escapeHtml(inviteUrl)}</code><br />
    El primer login con Gmail activa el usuario y conserva el rol asignado.
  `;
}

function buildPublicConfigUrl(tenantSlug) {
  const query = String(tenantSlug || '').trim();
  return query ? `/api/public-config?tenantSlug=${encodeURIComponent(query)}` : '/api/public-config';
}

function renderMetrics() {
  const overview = state.overview;
  refs.metricUsers.textContent = state.capabilities.manageUsers ? String(state.users.length) : roleLabel(state.sessionUser?.role);
  refs.metricProducts.textContent = String(overview.products.available);
  refs.metricSold.textContent = String(overview.products.sold);
  refs.metricWorkflow.textContent = String(overview.workflow.nodeCount || 0);
}

function renderLoginOptions() {
  const googleAuth = state.publicConfig?.googleAuth;
  const configuredTenantSlug = state.publicConfig?.tenant?.slug || '';

  if (!refs.loginTenantSlug.value && configuredTenantSlug) {
    refs.loginTenantSlug.value = configuredTenantSlug;
  }

  const canUseGoogle = Boolean(googleAuth?.enabled);
  refs.googleLoginButton.hidden = !canUseGoogle;
  refs.googleLoginHelper.hidden = !canUseGoogle;
  if (canUseGoogle) {
    refs.googleLoginButton.textContent = googleAuth.buttonLabel || 'Continuar con Google';
  }
}

function renderSectionVisibility() {
  const isOwner = state.sessionUser?.role === 'owner';
  const canSeeWorkflow = Boolean(state.capabilities.viewWorkflow || state.capabilities.manageWorkflow);
  const canSeeProducts = Boolean(state.capabilities.viewProducts || state.capabilities.publishCatalog);

  refs.domainSection.hidden = !isOwner;
  refs.visionSection.hidden = !isOwner;
  refs.checklistSection.hidden = !isOwner;
  refs.timelineSection.hidden = !isOwner;
  refs.workflowSection.hidden = !canSeeWorkflow;
  refs.productsSection.hidden = !canSeeProducts;
  refs.tenantSecuritySection.hidden = !(state.capabilities.viewTenant || state.capabilities.manageTenant || state.capabilities.manageApiKeys);

  const visibleStoryCards = [refs.timelineSection, refs.productsSection].filter((element) => element && !element.hidden);
  refs.storySection.hidden = visibleStoryCards.length === 0;
}

function renderRoles() {
  const roles = state.overview.roles || {};
  refs.currentRolePill.dataset.role = state.sessionUser.role;
  refs.currentRolePill.textContent = roleLabel(state.sessionUser.role);
  refs.rolesGrid.innerHTML = Object.entries(roles).map(([key, role]) => `
    <article class="role-card">
      <div class="role-card__top">
        <strong>${escapeHtml(role.label)}</strong>
        <span class="pill" data-role="${escapeHtml(key)}">${escapeHtml(role.label)}</span>
      </div>
      <span>${escapeHtml(role.summary)}</span>
      <div class="chip-row">
        ${safeArray(role.permissions).map((permission) => `<span class="pill">${escapeHtml(permission.replaceAll('_', ' '))}</span>`).join('')}
      </div>
    </article>
  `).join('');
}

function renderSessionSummary() {
  const user = state.sessionUser;
  const capabilities = Object.entries(state.capabilities)
    .filter(([, enabled]) => enabled)
    .map(([key]) => key)
    .join(', ');

  refs.currentSessionBox.innerHTML = `
    <strong>Sesion actual</strong><br />
    ${escapeHtml(user.name)} (${escapeHtml(user.email)})<br />
    Rol: ${escapeHtml(roleLabel(user.role))}<br />
    Tenant: ${escapeHtml(state.currentTenant?.name || state.currentTenant?.slug || '-')}<br />
    Ultimo acceso: ${escapeHtml(formatDate(user.lastLoginAt))}<br />
    Capacidades: ${escapeHtml(capabilities || 'solo lectura')}
  `;
}

function renderWorkspaceForm() {
  const workspace = state.overview.workspace;
  refs.domainCustomDomain.value = workspace.domain.customDomain || '';
  refs.domainPublicUrl.value = workspace.domain.publicUrl || '';
  refs.domainDeployBranch.value = workspace.domain.deployBranch || '';
  refs.domainPublicationStatus.value = workspace.domain.publicationStatus || 'iterando';
  refs.domainDnsStatus.value = workspace.domain.dnsStatus || 'pendiente';
  refs.domainSslStatus.value = workspace.domain.sslStatus || 'pendiente';
  refs.publishingFocus.value = workspace.publishing.focus || '';
  refs.visionThesis.value = workspace.vision.thesis || '';
  refs.visionExperiment.value = workspace.vision.nextExperiment || '';

  refs.domainStatusPill.dataset.state = workspace.domain.publicationStatus || 'iterando';
  refs.domainStatusPill.textContent = workspace.domain.publicationStatus || 'iterando';

  const disabled = !state.capabilities.manageWorkspace;
  const domainDisabled = !state.capabilities.manageDomain;
  [
    refs.publishingFocus,
    refs.visionThesis,
    refs.visionExperiment
  ].forEach((element) => {
    element.disabled = disabled;
  });
  [
    refs.domainCustomDomain,
    refs.domainPublicUrl,
    refs.domainDeployBranch,
    refs.domainPublicationStatus,
    refs.domainDnsStatus,
    refs.domainSslStatus
  ].forEach((element) => {
    element.disabled = disabled || domainDisabled;
  });
  document.getElementById('saveWorkspaceButton').hidden = disabled;
}

function renderWorkflow() {
  const workflow = state.overview.workflow;
  refs.workflowActivePill.dataset.state = workflow.active ? 'ok' : 'pendiente';
  refs.workflowActivePill.textContent = workflow.active ? 'activo' : 'inactivo';
  refs.workflowName.textContent = workflow.name || 'Workflow';
  refs.workflowMeta.textContent = workflow.exists
    ? `${workflow.nodeCount} nodos · webhook /${workflow.webhookPath || '-'} · archivo ${workflow.file}`
    : 'No se encontro workflow en n8n';

  refs.workflowNodes.innerHTML = safeArray(workflow.nodes).slice(0, 6).map((node) => `
    <li>
      <span>${escapeHtml(node.name)}</span>
      <span>${escapeHtml(node.type.replace('n8n-nodes-base.', ''))}</span>
    </li>
  `).join('');

  refs.workflowInsightBox.textContent = workflow.exists
    ? `El flujo actual convierte la página en una venta conversacional ligera: webhook de entrada, bloque de respuesta y devolución JSON al frontend.`
    : 'Falta definir o exportar el workflow actual.';
}

function renderChecklist() {
  const checklist = safeArray(state.overview.workspace.publishing.launchChecklist);
  refs.launchChecklist.innerHTML = checklist.map((item) => `
    <li>
      <span>${escapeHtml(item.label)}</span>
      <span class="pill" data-state="${item.done ? 'ok' : 'pendiente'}">${item.done ? 'hecho' : 'pendiente'}</span>
    </li>
  `).join('');
}

function renderTimeline() {
  const phases = safeArray(state.overview.timeline.phases);
  refs.timelineList.innerHTML = phases.map((phase) => `
    <article class="timeline-item">
      <div class="timeline-item__top">
        <strong>${escapeHtml(phase.title)}</strong>
        <span>${escapeHtml(phase.firstDate || '-')} → ${escapeHtml(phase.lastDate || '-')}</span>
      </div>
      <p style="margin-top:8px;color:var(--muted)">${escapeHtml(phase.insight)}</p>
      <ul class="compact-list" style="margin-top:10px">
        ${safeArray(phase.highlights).map((commit) => `
          <li>
            <span>${escapeHtml(commit.subject)}</span>
            <span>${escapeHtml(commit.hash)}</span>
          </li>
        `).join('')}
      </ul>
    </article>
  `).join('');

  const timeline = state.overview.timeline;
  const productCount = state.overview.products.total;
  refs.innovationSummary.textContent =
    `Desde ${timeline.totalCommits} commits, el proyecto pasó de una base simple a un catálogo vivo con ${productCount} productos históricos, ventas registradas, automatización por n8n y mejoras públicas de performance. La innovación es tratar ese recorrido como inteligencia operativa del dominio.`;
}

function renderProducts() {
  const products = state.overview.products;
  refs.productsSummaryTitle.textContent = `${products.available} activos · ${products.sold} vendidos`;
  refs.productsSummaryMeta.textContent = `${products.categories.length} categorias · ${products.rooms.length} ambientes · valor activo ${formatMoney(products.availableValue)}`;

  refs.highlightedProducts.innerHTML = safeArray(products.highlighted).map((product) => `
    <li>
      <span>${escapeHtml(product.name)} ${product.sold ? '(vendido)' : ''}</span>
      <span>${escapeHtml(product.category)} · ${escapeHtml(product.room)}</span>
    </li>
  `).join('');

  refs.cheapestProducts.innerHTML = safeArray(products.cheapest).map((product) => `
    <li>
      <span>${escapeHtml(product.name)}</span>
      <span>${formatMoney(product.price)}</span>
    </li>
  `).join('');

  refs.productsInsightBox.textContent =
    `El catálogo ya funciona como una publicación dinámica: mezcla stock vigente, memoria de vendidos y categorías suficientes para alimentar filtros, contenido y asistente comercial.`;
}

function resetCatalogProductForm() {
  state.editingCatalogProductId = null;
  refs.catalogProductForm.reset();
  refs.catalogProductStatus.value = 'draft';
  refs.catalogProductPhotoStatus.value = 'original';
  refs.catalogProductAiTool.value = 'nano-banana';
  refs.catalogProductHint.textContent = 'Carga simple para vendedores: nombre, precio, foto y argumento de venta.';
  setStatus(refs.catalogProductStatusMessage, '', '');
}

function loadCatalogProductIntoForm(product) {
  state.editingCatalogProductId = product.id;
  refs.catalogProductName.value = product.name || '';
  refs.catalogProductPrice.value = String(product.price || 0);
  refs.catalogProductOriginal.value = String(product.original || 0);
  refs.catalogProductCategory.value = product.category || '';
  refs.catalogProductRoom.value = product.room || '';
  refs.catalogProductStatus.value = product.status || 'draft';
  refs.catalogProductPhotoStatus.value = product.photoStatus || 'original';
  refs.catalogProductAiTool.value = product.aiToolPreference || 'nano-banana';
  refs.catalogProductImage.value = product.image || '';
  refs.catalogProductPhotoPrompt.value = product.photoPrompt || '';
  refs.catalogProductDescription.value = product.description || '';
  refs.catalogProductSalesNote.value = product.salesNote || '';
  refs.catalogProductLeadAngle.value = product.leadAngle || '';
  refs.catalogProductHint.textContent = `Editando ${product.name}. Puedes ajustar precio, foto y argumento comercial.`;
  setStatus(refs.catalogProductStatusMessage, `Editando ${product.name}`, 'ok');
}

function renderCatalogProducts() {
  if (!state.catalogProducts.length) {
    refs.catalogProductList.innerHTML = '<div class="muted-box">Todavia no hay productos cargados en el dashboard.</div>';
    return;
  }

  refs.catalogProductList.innerHTML = state.catalogProducts.map((product) => `
    <article class="user-card">
      <div class="user-card__top">
        <div class="user-card__name">
          <strong>${escapeHtml(product.name)}</strong>
          <span>${formatMoney(product.price)} · ${escapeHtml(product.category)} · ${escapeHtml(product.room)}</span>
        </div>
        <div class="user-card__actions">
          <span class="pill" data-status="${escapeHtml(product.status)}">${escapeHtml(productStatusLabel(product.status))}</span>
          <span class="pill">${escapeHtml(photoStatusLabel(product.photoStatus))}</span>
        </div>
      </div>
      <div class="user-card__meta">
        <span class="meta-chip">Fuente: ${escapeHtml(product.source)}</span>
        <span class="meta-chip">Actualizado: ${escapeHtml(formatDate(product.updatedAt))}</span>
      </div>
      <div class="user-card__actions">
        <span class="meta-chip">${escapeHtml(product.salesNote || product.leadAngle || 'Sin argumento comercial cargado')}</span>
      </div>
      <div class="user-card__actions">
        <button class="link-button" type="button" data-edit-product="${escapeHtml(product.id)}">Editar</button>
        ${state.capabilities.publishCatalog ? `<button class="link-button" type="button" data-request-photo-job="${escapeHtml(product.id)}">Pedir mejora IA</button>` : ''}
      </div>
    </article>
  `).join('');

  document.querySelectorAll('[data-edit-product]').forEach((button) => {
    button.addEventListener('click', () => {
      const product = state.catalogProducts.find((entry) => entry.id === button.dataset.editProduct);
      if (product) {
        loadCatalogProductIntoForm(product);
      }
    });
  });

  document.querySelectorAll('[data-request-photo-job]').forEach((button) => {
    button.addEventListener('click', async () => {
      const product = state.catalogProducts.find((entry) => entry.id === button.dataset.requestPhotoJob);
      if (!product) {
        return;
      }
      const prompt = window.prompt(
        `Describe como debe mejorar la foto de "${product.name}" con Nano Banana.`,
        product.photoPrompt || 'Limpiar fondo, mejorar luz natural, foco total en el producto y look marketplace premium.'
      );
      if (!prompt) {
        return;
      }
      setStatus(refs.photoJobStatusMessage, 'Creando pedido de mejora IA...', '');
      try {
        await request(`/api/catalog/products/${product.id}/photo-jobs`, {
          method: 'POST',
          body: JSON.stringify({
            requestedTool: product.aiToolPreference || 'nano-banana',
            prompt
          })
        });
        await loadOverview();
        await loadCatalogProducts();
        await loadPhotoJobs();
        renderSellerProducts();
        setStatus(refs.photoJobStatusMessage, `Pedido IA creado para ${product.name}.`, 'ok');
      } catch (error) {
        setStatus(refs.photoJobStatusMessage, error.message, 'error');
      }
    });
  });
}

function renderPhotoJobs() {
  const canManageJobs = Boolean(state.capabilities.manageWorkflow);
  refs.photoStudioHelper.textContent = canManageJobs
    ? 'El automatizador toma pedidos, ejecuta Nano Banana y devuelve imagen final al vendedor.'
    : 'Pide mejora visual al automatizador. Cuando termine, aqui aparece la imagen lista.';

  if (!state.photoJobs.length) {
    refs.photoJobList.innerHTML = '<div class="muted-box">No hay pedidos de mejora visual pendientes.</div>';
    bindPhotoJobActionButtons();
    return;
  }

  refs.photoJobList.innerHTML = state.photoJobs.map((job) => `
    <article class="user-card">
      <div class="user-card__top">
        <div class="user-card__name">
          <strong>${escapeHtml(job.productName)}</strong>
          <span>${escapeHtml(job.requestedTool)} · ${escapeHtml(formatDate(job.requestedAt))}</span>
        </div>
        <div class="user-card__actions">
          <span class="pill" data-status="${escapeHtml(job.status)}">${escapeHtml(job.status)}</span>
        </div>
      </div>
      <div class="user-card__actions">
        <span class="meta-chip">${escapeHtml(job.prompt)}</span>
      </div>
      <div class="user-card__actions">
        ${job.resultImage ? `<a class="ghost-link" href="${escapeHtml(job.resultImage)}" target="_blank" rel="noopener">Ver imagen IA</a>` : '<span class="meta-chip">Sin imagen final aun</span>'}
        ${canManageJobs && job.status !== 'done' ? `<button class="link-button" type="button" data-start-photo-job="${escapeHtml(job.id)}">Tomar pedido</button>` : ''}
        ${canManageJobs ? `<button class="link-button" type="button" data-finish-photo-job="${escapeHtml(job.id)}">Marcar listo</button>` : ''}
      </div>
    </article>
  `).join('');

  bindPhotoJobActionButtons();
}

function bindPhotoJobActionButtons() {
  document.querySelectorAll('[data-start-photo-job]').forEach((button) => {
    if (button.dataset.boundClick === 'true') {
      return;
    }
    button.dataset.boundClick = 'true';
    button.addEventListener('click', async () => {
      setStatus(refs.photoJobStatusMessage, 'Marcando pedido en proceso...', '');
      setStatus(refs.workflowActionStatus, 'Marcando pedido en proceso...', '');
      try {
        await request(`/api/catalog/photo-jobs/${button.dataset.startPhotoJob}`, {
          method: 'PATCH',
          body: JSON.stringify({ status: 'in_progress' })
        });
        await loadOverview();
        await loadCatalogProducts();
        await loadPhotoJobs();
        renderSellerProducts();
        setStatus(refs.photoJobStatusMessage, 'Pedido tomado por el automatizador.', 'ok');
        setStatus(refs.workflowActionStatus, 'Pedido tomado por el automatizador.', 'ok');
      } catch (error) {
        setStatus(refs.photoJobStatusMessage, error.message, 'error');
        setStatus(refs.workflowActionStatus, error.message, 'error');
      }
    });
  });

  document.querySelectorAll('[data-finish-photo-job]').forEach((button) => {
    if (button.dataset.boundClick === 'true') {
      return;
    }
    button.dataset.boundClick = 'true';
    button.addEventListener('click', async () => {
      const resultImage = window.prompt('URL o path de la imagen final mejorada con Nano Banana:');
      if (resultImage === null) {
        return;
      }
      const resultNotes = window.prompt('Notas del automatizador para el vendedor:', 'Foto mejorada con fondo limpio y luz corregida.') || '';
      setStatus(refs.photoJobStatusMessage, 'Guardando resultado IA...', '');
      setStatus(refs.workflowActionStatus, 'Guardando resultado IA...', '');
      try {
        await request(`/api/catalog/photo-jobs/${button.dataset.finishPhotoJob}`, {
          method: 'PATCH',
          body: JSON.stringify({
            status: 'done',
            resultImage: resultImage.trim(),
            resultNotes
          })
        });
        await loadOverview();
        await loadCatalogProducts();
        await loadPhotoJobs();
        renderSellerProducts();
        setStatus(refs.photoJobStatusMessage, 'Resultado IA guardado.', 'ok');
        setStatus(refs.workflowActionStatus, 'Resultado IA guardado.', 'ok');
      } catch (error) {
        setStatus(refs.photoJobStatusMessage, error.message, 'error');
        setStatus(refs.workflowActionStatus, error.message, 'error');
      }
    });
  });
}

function renderWorkflowStudio() {
  const isAutomator = Boolean(state.capabilities.manageWorkflow);
  refs.workflowStudioSection.hidden = !isAutomator;
  if (!isAutomator) {
    return;
  }

  const workflow = state.overview.workflow;
  const photoStudio = state.overview.photoStudio || {};
  const googleEnabled = Boolean(state.currentTenant?.identity?.google?.enabled);
  refs.workflowOpsTitle.textContent = 'Workflow de venta + operaciones IA';
  refs.workflowOpsMeta.textContent = `${workflow.exists ? 'Workflow importado' : 'Workflow pendiente'} · ${photoStudio.pending || 0} pedido(s) esperando automatizador · herramienta foco Nano Banana`;

  const signals = [
    { label: 'Webhook comercial', value: workflow.webhookPath ? `/${workflow.webhookPath}` : 'Sin webhook' },
    { label: 'Estado del flujo', value: workflow.active ? 'Activo' : 'Inactivo' },
    { label: 'Google identity', value: googleEnabled ? 'Habilitado' : 'Pendiente' },
    { label: 'Cola foto IA', value: `${photoStudio.pending || 0} pendientes · ${photoStudio.inProgress || 0} en progreso · ${photoStudio.done || 0} resueltos` },
    { label: 'Intervencion sugerida', value: photoStudio.pending ? 'Atender pedidos IA y devolver imagen mejorada al vendedor.' : 'Refinar nodos, mensajes y automatizaciones de cierre.' }
  ];

  refs.workflowSignalsList.innerHTML = signals.map((signal) => `
    <li>
      <span>${escapeHtml(signal.label)}</span>
      <span>${escapeHtml(signal.value)}</span>
    </li>
  `).join('');

  const queuedJobs = state.photoJobs.filter((job) => job.status !== 'done').slice(0, 4);
  refs.workflowPhotoQueue.innerHTML = queuedJobs.length
    ? queuedJobs.map((job) => `
      <article class="user-card">
        <div class="user-card__top">
          <div class="user-card__name">
            <strong>${escapeHtml(job.productName)}</strong>
            <span>${escapeHtml(job.requestedTool)} · ${escapeHtml(job.status)}</span>
          </div>
          <div class="user-card__actions">
            <button class="link-button" type="button" data-start-photo-job="${escapeHtml(job.id)}">Tomar</button>
            <button class="link-button" type="button" data-finish-photo-job="${escapeHtml(job.id)}">Cerrar</button>
          </div>
        </div>
        <div class="user-card__actions">
          <span class="meta-chip">${escapeHtml(job.prompt)}</span>
        </div>
      </article>
    `).join('')
    : '<div class="muted-box">No hay incidentes de automatizacion abiertos. Buen momento para iterar el workflow.</div>';

  bindPhotoJobActionButtons();
}

function renderSellerProducts() {
  const products = state.overview.products;
  refs.productsSummaryTitle.textContent = `${products.available} activos · ${products.sold} vendidos · ${products.draft || 0} draft`;
  refs.productsSummaryMeta.textContent = `${products.categories.length} categorias · ${products.rooms.length} ambientes · valor activo ${formatMoney(products.availableValue)} · IA en cola ${products.aiQueued || 0}`;

  refs.highlightedProducts.innerHTML = safeArray(products.highlighted).map((product) => `
    <li>
      <span>${escapeHtml(product.name)} ${product.sold ? '(vendido)' : ''}</span>
      <span>${escapeHtml(product.category)} · ${escapeHtml(product.room)} · ${escapeHtml(photoStatusLabel(product.photoStatus))}</span>
    </li>
  `).join('');

  refs.cheapestProducts.innerHTML = safeArray(products.cheapest).map((product) => `
    <li>
      <span>${escapeHtml(product.name)}</span>
      <span>${formatMoney(product.price)}</span>
    </li>
  `).join('');

  refs.productsInsightBox.textContent =
    `El vendedor opera ahora sobre un pipeline real: ${products.readyToPublish || 0} listo(s) para publicar, ${products.needsPhoto || 0} con deuda visual y ${products.aiQueued || 0} pedido(s) de mejora con IA.`;

  const sellerFocus = products.sellerFocus || {};
  refs.sellerWorkspaceSection.hidden = false;
  refs.sellerFocusSubtitle.textContent = sellerFocus.pitch || 'Sube producto, mejora foto y cierra ventas.';
  refs.sellerScoreBox.innerHTML = `
    <strong>Score comercial</strong><br />
    ${escapeHtml(String(sellerFocus.salesScore || 0))} puntos · ${escapeHtml(sellerFocus.nextAction || 'Sin sugerencias')}
  `;

  const formDisabled = !state.capabilities.publishCatalog;
  [
    refs.catalogProductName,
    refs.catalogProductPrice,
    refs.catalogProductOriginal,
    refs.catalogProductCategory,
    refs.catalogProductRoom,
    refs.catalogProductStatus,
    refs.catalogProductPhotoStatus,
    refs.catalogProductAiTool,
    refs.catalogProductImage,
    refs.catalogProductPhotoPrompt,
    refs.catalogProductDescription,
    refs.catalogProductSalesNote,
    refs.catalogProductLeadAngle
  ].forEach((element) => {
    element.disabled = formDisabled;
  });
  refs.catalogProductForm.hidden = formDisabled;
  refs.catalogProductStatusMessage.hidden = formDisabled;
  refs.catalogProductHint.hidden = formDisabled;
  refs.catalogProductResetButton.hidden = formDisabled;
  refs.catalogProductForm.querySelector('[type="submit"]').hidden = formDisabled;

  renderCatalogProducts();
  renderPhotoJobs();
  renderWorkflowStudio();
}

function renderUsers() {
  if (!state.capabilities.manageUsers) {
    refs.usersSection.hidden = true;
    return;
  }

  refs.usersSection.hidden = false;

  if (!state.users.length) {
    refs.userList.innerHTML = '<div class="muted-box">Todavia no hay usuarios cargados.</div>';
    return;
  }

  refs.userList.innerHTML = state.users.map((user) => {
    const canEdit = state.sessionUser.role === 'owner' || user.role !== 'owner';
    const canCopyGoogleInvite = Boolean(user.authProviders?.google?.invitationPending && state.currentTenant?.slug);
    return `
      <article class="user-card">
        <div class="user-card__top">
          <div class="user-card__name">
            <strong>${escapeHtml(user.name)}</strong>
            <span>${escapeHtml(user.email)}</span>
          </div>
          <div class="user-card__actions">
            <span class="pill" data-role="${escapeHtml(user.role)}">${escapeHtml(roleLabel(user.role))}</span>
            <span class="pill" data-status="${escapeHtml(user.status)}">${escapeHtml(user.status)}</span>
          </div>
        </div>
        <div class="user-card__meta">
          <span class="meta-chip">Creado: ${escapeHtml(formatDate(user.createdAt))}</span>
          <span class="meta-chip">Ultimo acceso: ${escapeHtml(formatDate(user.lastLoginAt))}</span>
        </div>
        <div class="user-card__actions">
          <span class="meta-chip">Acceso: ${escapeHtml(authProviderSummary(user))}</span>
          <span class="meta-chip">Actualizado: ${escapeHtml(formatDate(user.updatedAt))}</span>
          ${canCopyGoogleInvite ? `<button class="link-button" type="button" data-copy-google-link="${escapeHtml(user.id)}">Copiar acceso Google</button>` : ''}
          ${canEdit ? `<button class="link-button" type="button" data-edit-user="${escapeHtml(user.id)}">Editar</button>` : '<span class="meta-chip">Protegido por rol</span>'}
        </div>
      </article>
    `;
  }).join('');

  document.querySelectorAll('[data-edit-user]').forEach((button) => {
    button.addEventListener('click', () => {
      const user = state.users.find((entry) => entry.id === button.dataset.editUser);
      if (user) {
        loadUserIntoForm(user);
      }
    });
  });

  document.querySelectorAll('[data-copy-google-link]').forEach((button) => {
    button.addEventListener('click', async () => {
      const user = state.users.find((entry) => entry.id === button.dataset.copyGoogleLink);
      const inviteUrl = buildGoogleInviteUrl();
      if (!user || !inviteUrl || !navigator.clipboard?.writeText) {
        setStatus(refs.userStatusMessage, 'No se pudo copiar el acceso Google desde este navegador.', 'error');
        return;
      }
      try {
        await navigator.clipboard.writeText(`Accede con tu Gmail a ${inviteUrl} usando ${user.email}.`);
        setStatus(refs.userStatusMessage, `Acceso Google copiado para ${user.email}.`, 'ok');
      } catch (_error) {
        setStatus(refs.userStatusMessage, 'No se pudo copiar al portapapeles.', 'error');
      }
    });
  });
}

function renderTenantForm() {
  const tenant = state.currentTenant;
  if (!tenant) {
    refs.tenantId.value = '';
    refs.tenantName.value = '';
    refs.tenantSlug.value = '';
    refs.tenantStatus.value = 'active';
    refs.googleEnabled.value = 'false';
    refs.googleHostedDomain.value = '';
    refs.googleClientId.value = '';
    refs.googleClientSecret.value = '';
    refs.googleRedirectUri.value = '';
    refs.googleAllowedDomains.value = '';
    refs.googleButtonLabel.value = '';
    refs.googleClientSecretStatus.textContent = 'Client secret pendiente.';
    refs.saveTenantButton.hidden = true;
    return;
  }

  const google = tenant.identity?.google || {};
  refs.tenantId.value = tenant.id || '';
  refs.tenantName.value = tenant.name || '';
  refs.tenantSlug.value = tenant.slug || '';
  refs.tenantStatus.value = tenant.status || 'active';
  refs.googleEnabled.value = String(Boolean(google.enabled));
  refs.googleHostedDomain.value = google.hostedDomain || '';
  refs.googleClientId.value = google.clientId || '';
  refs.googleClientSecret.value = '';
  refs.googleRedirectUri.value = google.redirectUri || '';
  refs.googleAllowedDomains.value = safeArray(google.allowedDomains).join(', ');
  refs.googleButtonLabel.value = google.buttonLabel || 'Continuar con Google';
  refs.googleClientSecretStatus.textContent = google.clientSecretConfigured
    ? 'Client secret configurado. Deja el campo vacio para conservarlo.'
    : 'Client secret pendiente.';

  const disabled = !state.capabilities.manageTenant;
  [
    refs.tenantName,
    refs.tenantSlug,
    refs.tenantStatus,
    refs.googleEnabled,
    refs.googleHostedDomain,
    refs.googleClientId,
    refs.googleClientSecret,
    refs.googleRedirectUri,
    refs.googleAllowedDomains,
    refs.googleButtonLabel
  ].forEach((element) => {
    element.disabled = disabled;
  });
  refs.saveTenantButton.hidden = disabled;
}

function renderApiKeys() {
  const tenant = state.currentTenant || {};
  const google = tenant.identity?.google || {};

  const examplePayload = {
    tenantSlug: tenant.slug || 'tu-tenant',
    role: 'agent',
    status: 'active',
    profile: {
      email: 'vendedor@empresa.com',
      sub: 'google-oauth-sub',
      emailVerified: true,
      name: 'Nombre Apellido',
      givenName: 'Nombre',
      familyName: 'Apellido',
      picture: 'https://lh3.googleusercontent.com/...',
      locale: 'es-419'
    }
  };

  refs.googleProvisioningPreview.textContent =
    `POST /api/m2m/google/register\n` +
    `Scope requerida: identity:google-provision\n` +
    `Client ID: ${google.clientId || '(pendiente)'}\n` +
    `Redirect URI: ${google.redirectUri || '(pendiente)'}\n` +
    `Hosted domain: ${google.hostedDomain || '(sin restriccion)'}\n` +
    `Allowed domains: ${safeArray(google.allowedDomains).join(', ') || '(sin restriccion)'}\n\n` +
    JSON.stringify(examplePayload, null, 2);

  refs.apiKeySecretBox.innerHTML = state.latestApiKey
    ? `<strong>Raw key generada</strong><br /><code>${escapeHtml(state.latestApiKey.rawKey)}</code><br />Guardala fuera del panel. No vuelve a mostrarse desde la API.`
    : 'Todavia no generaste una API key M2M.';

  if (!state.apiKeys.length) {
    refs.apiKeyList.innerHTML = '<div class="muted-box">No hay API keys activas para este tenant.</div>';
    return;
  }

  refs.apiKeyList.innerHTML = state.apiKeys.map((apiKey) => `
    <article class="user-card">
      <div class="user-card__top">
        <div class="user-card__name">
          <strong>${escapeHtml(apiKey.name)}</strong>
          <span>${escapeHtml(apiKey.keyPrefix)}...</span>
        </div>
        <div class="user-card__actions">
          <span class="pill" data-status="${escapeHtml(apiKey.status)}">${escapeHtml(apiKey.status)}</span>
        </div>
      </div>
      <div class="user-card__meta">
        <span class="meta-chip">Scopes: ${escapeHtml(safeArray(apiKey.scopes).join(', ') || '-')}</span>
        <span class="meta-chip">Ultimo uso: ${escapeHtml(formatDate(apiKey.lastUsedAt))}</span>
      </div>
      <div class="user-card__actions">
        <span class="meta-chip">Creada: ${escapeHtml(formatDate(apiKey.createdAt))}</span>
        ${apiKey.status === 'active'
          ? `<button class="link-button" type="button" data-revoke-api-key="${escapeHtml(apiKey.id)}">Revocar</button>`
          : '<span class="meta-chip">Clave revocada</span>'}
      </div>
    </article>
  `).join('');

  document.querySelectorAll('[data-revoke-api-key]').forEach((button) => {
    button.addEventListener('click', async () => {
      setStatus(refs.apiKeyStatusMessage, 'Revocando API key...', '');
      try {
        await request(`/api/m2m/keys/${button.dataset.revokeApiKey}/revoke`, {
          method: 'POST',
          body: JSON.stringify({})
        });
        await loadApiKeys();
        renderApiKeys();
        setStatus(refs.apiKeyStatusMessage, 'API key revocada.', 'ok');
      } catch (error) {
        setStatus(refs.apiKeyStatusMessage, error.message, 'error');
      }
    });
  });
}

function renderTenantSecurity() {
  const canSeeTenantSecurity = Boolean(state.capabilities.viewTenant || state.capabilities.manageTenant || state.capabilities.manageApiKeys);
  refs.tenantSecuritySection.hidden = !canSeeTenantSecurity;
  if (!canSeeTenantSecurity) {
    return;
  }

  refs.tenantIdentitySection.hidden = !(state.capabilities.viewTenant || state.capabilities.manageTenant);
  refs.apiKeysSection.hidden = !state.capabilities.manageApiKeys;

  if (!refs.tenantIdentitySection.hidden) {
    renderTenantForm();
  }
  if (!refs.apiKeysSection.hidden) {
    renderApiKeys();
  }
}

function renderApp() {
  const authenticated = Boolean(state.sessionUser);
  refs.dashboardView.hidden = !authenticated;
  refs.logoutButton.hidden = !authenticated;
  refs.loginPanel.hidden = authenticated;

  if (!authenticated) {
    renderLoginOptions();
  }

  if (!authenticated || !state.overview) {
    return;
  }

  renderSectionVisibility();
  renderMetrics();
  renderRoles();
  renderSessionSummary();
  if (!refs.domainSection.hidden) {
    renderWorkspaceForm();
    renderChecklist();
  }
  if (!refs.workflowSection.hidden) {
    renderWorkflow();
  }
  if (!refs.timelineSection.hidden) {
    renderTimeline();
  }
  if (!refs.productsSection.hidden) {
    renderSellerProducts();
  }
  renderUsers();
  renderTenantSecurity();
}

function resetUserForm() {
  state.editingUserId = null;
  refs.editorTitle.textContent = 'Nuevo usuario';
  refs.passwordLabel.textContent = 'Contrasena inicial';
  refs.userForm.reset();
  refs.userRole.value = 'agent';
  refs.userStatus.value = 'active';
  refs.userAccessMode.value = 'password';
  updateUserFormModeHints();
  setStatus(refs.userStatusMessage, '', '');
}

function loadUserIntoForm(user) {
  state.editingUserId = user.id;
  refs.editorTitle.textContent = `Editando a ${user.name}`;
  refs.passwordLabel.textContent = 'Nueva contrasena opcional';
  refs.userName.value = user.name;
  refs.userEmail.value = user.email;
  refs.userRole.value = user.role;
  refs.userStatus.value = user.status;
  refs.userAccessMode.value = deriveUserAccessMode(user);
  refs.userPassword.value = '';
  updateUserFormModeHints();
  setStatus(refs.userStatusMessage, `Editando ${user.email}`, 'ok');
}

async function loadSession() {
  const payload = await request('/api/auth/session', { method: 'GET' });
  if (!payload || typeof payload !== 'object') {
    throw new Error('Respuesta invalida de sesion.');
  }
  state.sessionUser = payload.user;
  state.capabilities = payload.capabilities || {};
  state.csrfToken = payload.csrfToken || null;
  state.currentTenant = payload.tenant || null;
}

async function loadOverview() {
  const payload = await request('/api/workspace/overview', { method: 'GET' });
  if (!payload || typeof payload !== 'object' || !payload.currentUser) {
    throw new Error('Respuesta invalida del overview del panel.');
  }
  state.overview = payload;
  state.sessionUser = payload.currentUser;
  state.capabilities = payload.capabilities || {};
  state.csrfToken = payload.csrfToken || state.csrfToken;
  state.currentTenant = payload.currentTenant || state.currentTenant;
}

async function loadUsers() {
  if (!state.capabilities.manageUsers) {
    state.users = [];
    return;
  }
  const payload = await request('/api/users', { method: 'GET' });
  state.users = payload.users;
}

async function loadCatalogProducts() {
  if (!state.capabilities.viewProducts) {
    state.catalogProducts = [];
    return;
  }
  const payload = await request('/api/catalog/products', { method: 'GET' });
  state.catalogProducts = payload.products || [];
}

async function loadPhotoJobs() {
  if (!(state.capabilities.publishCatalog || state.capabilities.manageWorkflow)) {
    state.photoJobs = [];
    return;
  }
  const payload = await request('/api/catalog/photo-jobs', { method: 'GET' });
  state.photoJobs = payload.jobs || [];
}

async function loadPublicConfig(tenantSlug) {
  const response = await fetch(buildPublicConfigUrl(tenantSlug), {
    headers: {
      Accept: 'application/json'
    }
  });
  if (!response.ok) {
    throw new Error('No se pudo cargar la configuracion publica del login.');
  }
  state.publicConfig = await response.json();
}

async function loadTenantCurrent() {
  if (!(state.capabilities.viewTenant || state.capabilities.manageTenant)) {
    state.currentTenant = null;
    return;
  }
  const payload = await request('/api/tenant/current', { method: 'GET' });
  state.currentTenant = payload.tenant || null;
}

async function loadApiKeys() {
  if (!state.capabilities.manageApiKeys) {
    state.apiKeys = [];
    return;
  }
  const payload = await request('/api/m2m/keys', { method: 'GET' });
  state.apiKeys = payload.apiKeys || [];
}

refs.loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  setStatus(refs.loginStatus, 'Ingresando...', '');

  try {
    const payload = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: refs.loginEmail.value,
        tenantSlug: refs.loginTenantSlug.value.trim(),
        password: refs.loginPassword.value
      })
    });

    state.sessionUser = payload.user;
    state.capabilities = payload.capabilities || {};
    state.csrfToken = payload.csrfToken || null;
    state.currentTenant = payload.tenant || null;
    await loadOverview();
    await loadUsers();
    await loadCatalogProducts();
    await loadTenantCurrent();
    await loadApiKeys();
    await loadPhotoJobs();
    resetUserForm();
    resetCatalogProductForm();
    setStatus(refs.loginStatus, '', '');
    renderApp();
  } catch (error) {
    setStatus(refs.loginStatus, error.message, 'error');
  }
});

refs.logoutButton.addEventListener('click', async () => {
  const payload = await request('/api/auth/logout', {
    method: 'POST',
    body: JSON.stringify({
      tenantSlug: state.currentTenant?.slug || refs.loginTenantSlug.value.trim()
    })
  });
  state.sessionUser = null;
  state.overview = null;
  state.publicConfig = null;
  state.users = [];
  state.capabilities = {};
  state.csrfToken = null;
  state.accessToken = null;
  state.currentTenant = null;
  state.apiKeys = [];
  state.latestApiKey = null;
  state.catalogProducts = [];
  state.photoJobs = [];
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  resetUserForm();
  resetCatalogProductForm();
  window.location.assign(payload.redirectTo || '/app?logged_out=1');
});

refs.loginTenantSlug.addEventListener('change', async () => {
  try {
    await loadPublicConfig(refs.loginTenantSlug.value.trim());
    renderLoginOptions();
  } catch (_error) {
    refs.googleLoginButton.hidden = true;
    refs.googleLoginHelper.hidden = true;
  }
});

refs.googleLoginButton.addEventListener('click', () => {
  const tenantSlug = refs.loginTenantSlug.value.trim();
  const suffix = tenantSlug ? `?tenantSlug=${encodeURIComponent(tenantSlug)}` : '';
  window.location.assign(`/api/auth/google/start${suffix}`);
});

refs.workspaceForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  setStatus(refs.workspaceStatus, 'Guardando workspace...', '');

  try {
    await request('/api/workspace', {
      method: 'PATCH',
      body: JSON.stringify({
        domain: {
          customDomain: refs.domainCustomDomain.value.trim(),
          publicUrl: refs.domainPublicUrl.value.trim(),
          deployBranch: refs.domainDeployBranch.value.trim(),
          publicationStatus: refs.domainPublicationStatus.value,
          dnsStatus: refs.domainDnsStatus.value,
          sslStatus: refs.domainSslStatus.value
        },
        publishing: {
          focus: refs.publishingFocus.value.trim()
        },
        vision: {
          thesis: refs.visionThesis.value.trim(),
          nextExperiment: refs.visionExperiment.value.trim()
        }
      })
    });

    await loadOverview();
    renderApp();
    setStatus(refs.workspaceStatus, 'Workspace actualizado.', 'ok');
  } catch (error) {
    setStatus(refs.workspaceStatus, error.message, 'error');
  }
});

refs.refreshOverviewButton.addEventListener('click', async () => {
  setStatus(refs.workspaceStatus, 'Actualizando panel...', '');
  try {
    await loadOverview();
    await loadUsers();
    await loadCatalogProducts();
    await loadTenantCurrent();
    await loadApiKeys();
    await loadPhotoJobs();
    renderApp();
    setStatus(refs.workspaceStatus, 'Panel actualizado.', 'ok');
  } catch (error) {
    setStatus(refs.workspaceStatus, error.message, 'error');
  }
});

refs.refreshUsersButton.addEventListener('click', async () => {
  setStatus(refs.userStatusMessage, 'Actualizando usuarios...', '');
  try {
    await loadUsers();
    renderUsers();
    setStatus(refs.userStatusMessage, 'Usuarios actualizados.', 'ok');
  } catch (error) {
    setStatus(refs.userStatusMessage, error.message, 'error');
  }
});

refs.refreshCatalogButton.addEventListener('click', async () => {
  setStatus(refs.catalogProductStatusMessage, 'Actualizando catalogo...', '');
  try {
    await loadOverview();
    await loadCatalogProducts();
    await loadPhotoJobs();
    renderSellerProducts();
    setStatus(refs.catalogProductStatusMessage, 'Catalogo actualizado.', 'ok');
  } catch (error) {
    setStatus(refs.catalogProductStatusMessage, error.message, 'error');
  }
});

refs.refreshPhotoJobsButton.addEventListener('click', async () => {
  setStatus(refs.photoJobStatusMessage, 'Actualizando cola IA...', '');
  try {
    await loadOverview();
    await loadPhotoJobs();
    renderSellerProducts();
    setStatus(refs.photoJobStatusMessage, 'Cola IA actualizada.', 'ok');
  } catch (error) {
    setStatus(refs.photoJobStatusMessage, error.message, 'error');
  }
});

refs.catalogProductResetButton.addEventListener('click', () => {
  resetCatalogProductForm();
});

refs.catalogProductForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  setStatus(refs.catalogProductStatusMessage, 'Guardando producto...', '');

  const body = {
    name: refs.catalogProductName.value.trim(),
    price: Number(refs.catalogProductPrice.value || 0),
    original: Number(refs.catalogProductOriginal.value || 0),
    category: refs.catalogProductCategory.value.trim(),
    room: refs.catalogProductRoom.value.trim(),
    status: refs.catalogProductStatus.value,
    photoStatus: refs.catalogProductPhotoStatus.value,
    aiToolPreference: refs.catalogProductAiTool.value,
    image: refs.catalogProductImage.value.trim(),
    photoPrompt: refs.catalogProductPhotoPrompt.value.trim(),
    description: refs.catalogProductDescription.value.trim(),
    salesNote: refs.catalogProductSalesNote.value.trim(),
    leadAngle: refs.catalogProductLeadAngle.value.trim()
  };

  try {
    const url = state.editingCatalogProductId ? `/api/catalog/products/${state.editingCatalogProductId}` : '/api/catalog/products';
    const method = state.editingCatalogProductId ? 'PATCH' : 'POST';
    await request(url, {
      method,
      body: JSON.stringify(body)
    });
    await loadOverview();
    await loadCatalogProducts();
    resetCatalogProductForm();
    renderSellerProducts();
    setStatus(refs.catalogProductStatusMessage, 'Producto guardado.', 'ok');
  } catch (error) {
    setStatus(refs.catalogProductStatusMessage, error.message, 'error');
  }
});

refs.tenantForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  setStatus(refs.tenantStatusMessage, 'Guardando tenant e identidad...', '');

  try {
    const payload = await request('/api/tenant', {
      method: 'PATCH',
      body: JSON.stringify({
        name: refs.tenantName.value.trim(),
        slug: refs.tenantSlug.value.trim(),
        status: refs.tenantStatus.value,
        identity: {
          google: {
            enabled: refs.googleEnabled.value === 'true',
            clientId: refs.googleClientId.value.trim(),
            ...(refs.googleClientSecret.value.trim() ? { clientSecret: refs.googleClientSecret.value.trim() } : {}),
            redirectUri: refs.googleRedirectUri.value.trim(),
            hostedDomain: refs.googleHostedDomain.value.trim().toLowerCase(),
            allowedDomains: parseCommaList(refs.googleAllowedDomains.value.toLowerCase()),
            buttonLabel: refs.googleButtonLabel.value.trim()
          }
        }
      })
    });

    state.currentTenant = payload.tenant || state.currentTenant;
    refs.loginTenantSlug.value = state.currentTenant?.slug || refs.loginTenantSlug.value;
    state.publicConfig = null;
    await loadPublicConfig(state.currentTenant?.slug || refs.loginTenantSlug.value.trim());
    renderTenantSecurity();
    renderSessionSummary();
    setStatus(refs.tenantStatusMessage, 'Tenant actualizado.', 'ok');
  } catch (error) {
    setStatus(refs.tenantStatusMessage, error.message, 'error');
  }
});

refs.refreshApiKeysButton.addEventListener('click', async () => {
  setStatus(refs.apiKeyStatusMessage, 'Actualizando API keys...', '');
  try {
    await loadApiKeys();
    renderApiKeys();
    setStatus(refs.apiKeyStatusMessage, 'API keys actualizadas.', 'ok');
  } catch (error) {
    setStatus(refs.apiKeyStatusMessage, error.message, 'error');
  }
});

refs.apiKeyForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  setStatus(refs.apiKeyStatusMessage, 'Generando API key...', '');

  try {
    const scopes = parseCommaList(refs.apiKeyScopes.value);
    if (!refs.apiKeyName.value.trim()) {
      throw new Error('Define un nombre interno para la API key.');
    }
    if (!scopes.length) {
      throw new Error('Define al menos un scope para la API key.');
    }

    const payload = await request('/api/m2m/keys', {
      method: 'POST',
      body: JSON.stringify({
        name: refs.apiKeyName.value.trim(),
        scopes
      })
    });

    state.latestApiKey = {
      name: payload.apiKey?.name || refs.apiKeyName.value.trim(),
      rawKey: payload.rawKey || ''
    };
    refs.apiKeyForm.reset();
    refs.apiKeyScopes.value = 'identity:google-provision';
    await loadApiKeys();
    renderApiKeys();
    setStatus(refs.apiKeyStatusMessage, 'API key creada. Guarda la raw key fuera del panel.', 'ok');
  } catch (error) {
    setStatus(refs.apiKeyStatusMessage, error.message, 'error');
  }
});

refs.newUserButton.addEventListener('click', () => {
  resetUserForm();
});

refs.userAccessMode.addEventListener('change', () => {
  updateUserFormModeHints();
});

refs.userForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  setStatus(refs.userStatusMessage, 'Guardando usuario...', '');

  const accessMode = refs.userAccessMode.value;
  const body = {
    name: refs.userName.value.trim(),
    email: refs.userEmail.value.trim(),
    role: refs.userRole.value,
    status: refs.userStatus.value,
    accessMode,
    password: refs.userPassword.value
  };

  try {
    if (!state.editingUserId && (accessMode === 'password' || accessMode === 'hybrid') && !body.password) {
      throw new Error('Define una contrasena inicial para el usuario.');
    }

    const url = state.editingUserId ? `/api/users/${state.editingUserId}` : '/api/users';
    const method = state.editingUserId ? 'PATCH' : 'POST';

    await request(url, {
      method,
      body: JSON.stringify(body)
    });

    await loadOverview();
    await loadUsers();
    resetUserForm();
    renderApp();
    setStatus(refs.userStatusMessage, accessMode === 'google' ? 'Usuario invitado para login con Google.' : 'Usuario guardado correctamente.', 'ok');
  } catch (error) {
    setStatus(refs.userStatusMessage, error.message, 'error');
  }
});

async function boot() {
  const params = new URLSearchParams(window.location.search);
  const loggedOut = params.get('logged_out') === '1';
  const tenantSlugFromUrl = params.get('tenantSlug') || '';
  const authError = params.get('auth_error');
  const authProvider = params.get('auth');
  const signupAction = params.get('signup');

  try {
    if (tenantSlugFromUrl) {
      refs.loginTenantSlug.value = tenantSlugFromUrl;
    }
    if (loggedOut) {
      window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    }
    await loadPublicConfig(refs.loginTenantSlug.value.trim());
    state.accessToken = window.localStorage.getItem(ACCESS_TOKEN_KEY);
    await loadSession();
    if (state.sessionUser) {
      await loadOverview();
      await loadUsers();
      await loadCatalogProducts();
      await loadTenantCurrent();
      await loadApiKeys();
      await loadPhotoJobs();
      resetUserForm();
      resetCatalogProductForm();
    }
  } catch (_error) {
    state.sessionUser = null;
    state.overview = null;
    state.publicConfig = null;
    state.users = [];
    state.capabilities = {};
    state.csrfToken = null;
    state.accessToken = null;
    state.currentTenant = null;
    state.apiKeys = [];
    state.latestApiKey = null;
    state.catalogProducts = [];
    state.photoJobs = [];
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    setStatus(refs.loginStatus, 'La API del panel no responde. Ejecuta npm start y abre /app desde ese servidor.', 'error');
  }

  if (loggedOut) {
    setStatus(refs.loginStatus, 'Sesion cerrada.', 'ok');
  } else if (authError) {
    setStatus(refs.loginStatus, authError, 'error');
  } else if (authProvider === 'google' && !state.sessionUser) {
    setStatus(refs.loginStatus, 'Google devolvio la autenticacion, pero no se pudo abrir la sesion.', 'error');
  } else if (authProvider === 'google' && state.sessionUser) {
    const suffix = signupAction === 'created' ? ' y se creo el usuario automaticamente.' : '.';
    setStatus(refs.loginStatus, `Sesion iniciada con Google${suffix}`, 'ok');
  }

  if (params.has('logged_out') || params.has('auth') || params.has('auth_error') || params.has('signup')) {
    params.delete('logged_out');
    params.delete('auth');
    params.delete('auth_error');
    params.delete('signup');
    const nextSearch = params.toString();
    const nextUrl = `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ''}`;
    window.history.replaceState({}, '', nextUrl);
  }

  renderApp();
}

boot();
