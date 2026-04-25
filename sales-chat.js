const products = [
  { name: 'Calefon', price: 4000, original: 5600, category: 'Electrodomestico', room: 'Bano', image: 'img/reales/thumbs/calefon-thumb.jpg', sold: true },
  { name: 'Lavarropa JAMES', price: 4000, original: 5600, category: 'Electrodomestico', room: 'Bano', image: 'img/reales/thumbs/lavarropas-thumb.jpg' },
  { name: 'Cocina', price: 4500, original: 6300, category: 'Electrodomestico', room: 'Cocina', image: 'img/reales/thumbs/cocina-thumb.jpg' },
  { name: 'Heladera', price: 10000, original: 14000, category: 'Electrodomestico', room: 'Cocina', image: 'img/reales/thumbs/heladera-thumb.jpg', sold: true },
  { name: 'Mesa de trabajo 1,80 nueva', price: 4000, original: 5600, category: 'Mueble', room: 'Cocina', image: 'img/reales/thumbs/mesaTrabajo-thumb.jpg', sold: true },
  { name: 'Microondas', price: 2040, original: 2400, category: 'Electrodomestico', room: 'Cocina', image: 'img/reales/thumbs/microondas-thumb.jpg' },
  { name: 'Jarra electrica y Tostadora', price: 1000, original: 1800, category: 'Electrodomestico', room: 'Cocina', image: 'img/reales/thumbs/jarra-thumb.jpg', sold: true },
  { name: 'Toca discos Bluetooth (incluye vinilo)', price: 1500, original: 2100, category: 'Electrodomestico', room: 'Living', image: 'img/reales/thumbs/tocaDisco-thumb.jpg', sold: true },
  { name: 'Cocina, garrafa y mueble', price: 6000, original: 8400, category: 'Electrodomestico', room: 'Cocina', image: 'img/reales/thumbs/cocina-thumb.jpg' },
  { name: 'Ropero grande 6 puertas y 2 cajones', price: 10000, original: 16800, category: 'Mueble', room: 'Dormitorio', image: 'img/reales/thumbs/roperoDormitorio-thumb.jpg' },
  { name: 'Sommier 2 plazas', price: 4000, original: 5600, category: 'Mueble', room: 'Dormitorio', image: 'img/reales/thumbs/sommier-thumb.jpg' },
  { name: 'Mesa de luz + lampara', price: 1000, original: 2500, category: 'Mueble', room: 'Dormitorio', image: 'img/reales/thumbs/mesaDeLuz-thumb.jpg' },
  { name: 'Silla de escritorio', price: 1500, original: 3800, category: 'Mueble', room: 'Escritorio', image: 'img/reales/thumbs/sillaDeEscritorio-thumb.jpg', sold: true },
  { name: 'Ropero mediano 4 puertas y 2 cajones', price: 3500, original: 4200, category: 'Mueble', room: 'Escritorio', image: 'img/reales/thumbs/roperos-thumb.jpg' , sold: true},
  { name: 'Ropero blanco mediano 2 puertas', price: 3500, original: 4200, category: 'Mueble', room: 'Escritorio', image: 'img/reales/thumbs/roperos-thumb.jpg' },
  { name: 'Modular horizontal 1x2 mts', price: 1600, original: 2100, category: 'Mueble', room: 'Escritorio' },
  { name: 'Monitor 24" Full HD', price: 3000, original: 4600, category: 'Electronica', room: 'Escritorio', image: 'img/reales/thumbs/monitor-thumb.jpg' },
  { name: 'OFERTA Silla de escritorio', price: 1000, original: 2500, category: 'Mueble', room: 'Escritorio', image: 'img/reales/thumbs/sillaEscritorio-thumb.jpg' },
  { name: 'TV amurado y soporte', price: 2000, original: 3500, category: 'Electrodomestico', room: 'Living', image: 'img/reales/thumbs/televisor-thumb.jpg', sold: true },
  { name: 'Artefactos de estufa', price: 1000, original: 1000, category: 'Calefaccion', room: 'Living', image: 'img/reales/thumbs/hierrosEstufa-thumb.jpg', sold: true },
  { name: 'Biblioteca madera y hierro', price: 4000, original: 5600, category: 'Mueble', room: 'Living', image: 'img/reales/thumbs/repisa-thumb.jpg', sold: true },
  { name: 'Mesa ratona', price: 2000, original: 2800, category: 'Mueble', room: 'Living', image: 'img/reales/thumbs/ratona-thumb.jpg', sold: true },
  { name: 'Silla artesanal', price: 1500, original: 2000, category: 'Mueble', room: 'Living', image: 'img/reales/thumbs/sillaArtesanal-thumb.jpg', sold: true },
  { name: 'Sillon (3 cuerpos)', price: 3000, original: 18300, category: 'Mueble', room: 'Living', image: 'img/reales/thumbs/sillon-thumb.jpg', sold: true },
  { name: 'Mesa para exterior 1,5 m x 1 m', price: 1700, original: 3200, category: 'Mueble', room: 'Living' },
  { name: 'Mesa de vidrio negra', price: 3000, original: 4200, category: 'Mueble', room: 'Living', image: 'img/reales/thumbs/mesaVidrioNegra-thumb.jpg' },
  { name: 'Mantel peruano', price: 1000, original: 1500, category: 'Decoracion', room: 'Comedor', image: 'img/reales/thumbs/mantel-thumb.jpg', sold: true },
];

const CHAT_CONFIG = {
  webhookUrl: 'http://localhost:5678/webhook/sales-chat',
  webhookEnabled: true,
  whatsappPhone: '59899576144',
  siteName: 'Casa Medanos'
};

const DEFAULT_PRODUCT_IMAGE = 'img/voluntad.svg';
const STOPWORDS = new Set([
  'que', 'tenes', 'tienes', 'para', 'por', 'con', 'del', 'las', 'los', 'una', 'uno',
  'quiero', 'busco', 'necesito', 'algo', 'ver', 'mostrar', 'mostrame', 'disponible',
  'disponibles', 'queda', 'quedan'
]);
const DEFAULT_CHAT_ACTIONS = [
  { label: 'Electrodomesticos', prompt: 'Que electrodomesticos tenes disponibles?' },
  { label: 'Muebles', prompt: 'Mostrame muebles para dormitorio' },
  { label: 'Retiro y flete', prompt: 'Como se coordina el retiro y el flete?' },
  { label: 'WhatsApp', type: 'url', url: '' }
];

const formatUYU = value => new Intl.NumberFormat('es-UY', {
  style: 'currency',
  currency: 'UYU',
  maximumFractionDigits: 0
}).format(value);
const normalizeText = value => (value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const tokenize = value => normalizeText(value).split(/[^a-z0-9]+/).filter(token => token.length > 2 && !STOPWORDS.has(token));
const encodeWhatsappText = text => encodeURIComponent((text || '').trim());
const availableProductsList = () => products.filter(product => !product.sold);
const categories = ['Todos', ...new Set(products.map(product => product.category))];
const rooms = ['Todos', ...new Set(products.map(product => product.room))];
const roomLookup = {
  living: rooms.find(room => normalizeText(room) === 'living') || 'Living',
  dormitorio: rooms.find(room => normalizeText(room) === 'dormitorio') || 'Dormitorio',
  cocina: rooms.find(room => normalizeText(room) === 'cocina') || 'Cocina',
  comedor: rooms.find(room => normalizeText(room) === 'comedor') || 'Comedor',
  escritorio: rooms.find(room => normalizeText(room) === 'escritorio') || 'Escritorio',
  bano: rooms.find(room => normalizeText(room).includes('bano') || normalizeText(room).includes('bao')) || 'Bano'
};
const productIntents = {
  categories: [
    { value: 'electro', terms: ['electro', 'electrodomestico', 'heladera', 'microondas', 'lavarropa', 'tostadora', 'jarra', 'monitor', 'tv', 'televisor'] },
    { value: 'mueble', terms: ['mueble', 'ropero', 'mesa', 'silla', 'biblioteca', 'sillon', 'modular'] },
    { value: 'libros', terms: ['libro', 'libros'] },
    { value: 'decoracion', terms: ['decoracion', 'mantel'] }
  ],
  rooms: [
    { value: roomLookup.living, terms: ['living'] },
    { value: roomLookup.dormitorio, terms: ['dormitorio'] },
    { value: roomLookup.cocina, terms: ['cocina'] },
    { value: roomLookup.comedor, terms: ['comedor'] },
    { value: roomLookup.escritorio, terms: ['escritorio'] },
    { value: roomLookup.bano, terms: ['bano'] }
  ]
};

let selectedCategory = 'Todos';
let selectedRoom = 'Todos';
let search = '';
let chatBooted = false;
let launcherMinimized = false;

const salesBot = document.querySelector('.sales-bot');
const productGrid = document.getElementById('productGrid');
const categoryFilters = document.getElementById('categoryFilters');
const roomFilters = document.getElementById('roomFilters');
const searchInput = document.getElementById('searchInput');
const chatLauncher = document.getElementById('chatLauncher');
const chatLauncherTitle = chatLauncher.querySelector('span');
const chatLauncherSubtitle = chatLauncher.querySelector('small');
const salesChat = document.getElementById('salesChat');
const chatClose = document.getElementById('chatClose');
const chatMessages = document.getElementById('chatMessages');
const chatQuickActions = document.getElementById('chatQuickActions');
const chatStatus = document.getElementById('chatStatus');
const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');
const openChatCta = document.getElementById('openChatCta');
const contactWhatsappLink = document.getElementById('contactWhatsappLink');

function buildWhatsappMessage(text) {
  return String(text || '').trim();
}

function buildWhatsappUrl(text) {
  return `https://wa.me/${CHAT_CONFIG.whatsappPhone}?text=${encodeWhatsappText(buildWhatsappMessage(text))}`;
}

function updateMainCtas() {
  if (contactWhatsappLink) {
    contactWhatsappLink.href = buildWhatsappUrl('Hola, vi tu catalogo y quiero consultar por un producto.');
  }
}

function renderStats() {
  const soldCount = products.filter(product => product.sold).length;
  const availableCount = products.length - soldCount;
  const availableTotal = products.filter(product => !product.sold).reduce((acc, product) => acc + product.price, 0);
  const comboPrice = Math.round(availableTotal * 0.75);
  const soldEl = document.getElementById('soldItems');
  const availableEl = document.getElementById('availableItems');
  const comboEl = document.getElementById('comboPrice');

  if (soldEl) soldEl.textContent = soldCount;
  if (availableEl) availableEl.textContent = availableCount;
  if (comboEl) comboEl.textContent = formatUYU(comboPrice);
}

function makeFilterButton(label, onClick, active) {
  const btn = document.createElement('button');
  btn.className = `filter${active ? ' active' : ''}`;
  btn.textContent = label;
  btn.onclick = onClick;
  return btn;
}

function renderFilters() {
  categoryFilters.innerHTML = '';
  roomFilters.innerHTML = '';

  categories.forEach(category => {
    categoryFilters.appendChild(makeFilterButton(category, () => {
      selectedCategory = category;
      renderFilters();
      renderProducts();
    }, selectedCategory === category));
  });

  rooms.forEach(room => {
    roomFilters.appendChild(makeFilterButton(room, () => {
      selectedRoom = room;
      renderFilters();
      renderProducts();
    }, selectedRoom === room));
  });
}

function renderProducts() {
  const filtered = products.filter(product => {
    const categoryOk = selectedCategory === 'Todos' || product.category === selectedCategory;
    const roomOk = selectedRoom === 'Todos' || product.room === selectedRoom;
    const text = `${product.name} ${product.category} ${product.room}`.toLowerCase();
    const searchOk = !search || text.includes(search.toLowerCase());
    return categoryOk && roomOk && searchOk;
  });

  if (!filtered.length) {
    productGrid.innerHTML = '<div class="empty">No encontre articulos con ese filtro. Proba limpiar la busqueda o cambiar categoria/ambiente.</div>';
    return;
  }

  productGrid.innerHTML = filtered.map(product => {
    const discount = Math.round((1 - product.price / product.original) * 100);
    const imgSrc = product.image || DEFAULT_PRODUCT_IMAGE;
    const soldClass = product.sold ? ' sold' : '';
    const featuredClass = product.category === 'Libros' ? ' card--featured' : '';
    const titleClass = `title${product.sold ? ' title--sold' : ''}`;
    const isBook = product.category === 'Libros';

    return `
      <article class="card${soldClass}${featuredClass}">
        <div class="product-media${soldClass}">
          <img src="${imgSrc}" alt="${product.name}" loading="lazy" decoding="async" />
          ${isBook ? '<span class="product-media__badge">Pack curado</span>' : ''}
          ${product.sold ? '<span class="product-media__badge">Vendido</span>' : ''}
        </div>
        <div class="topline">
          <h3 class="${titleClass}">
            ${product.name}
            ${isBook ? '<br><small style="font-size:13px;color:#475569;font-weight:400;">Incluye "Las venas abiertas de America Latina", "Deja de ser tu", "No me vengas con historias" y mas.</small>' : ''}
          </h3>
          <div class="price">${formatUYU(product.price)}</div>
        </div>
        <div class="meta">
          <span class="badge">${product.category}</span>
          <span class="badge">${product.room}</span>
          <span class="badge">Aprox. ${discount}% menos</span>
        </div>
        <div class="note">Valor de referencia: <strong>${formatUYU(product.original)}</strong></div>
        <div class="card-actions">
          ${product.sold
            ? '<button class="mini-cta" type="button" disabled>Ya fue vendido</button>'
            : `<button class="mini-cta mini-cta--primary" type="button" data-chat-product="${encodeURIComponent(product.name)}">Preguntar al bot</button><a class="mini-cta" href="${buildWhatsappUrl(`Hola, quiero consultar por ${product.name}.`)}" target="_blank" rel="noopener">WhatsApp</a>`}
        </div>
      </article>
    `;
  }).join('');
}

function renderLauncherState() {
  salesBot.classList.toggle('sales-bot--compact', launcherMinimized);
  salesBot.classList.toggle('sales-bot--open', !salesChat.hidden);
  chatLauncherTitle.textContent = launcherMinimized ? 'Chat' : 'Asistente de venta';
  chatLauncherSubtitle.textContent = 'Busca y segui por WhatsApp';
  updateMainCtas();
  renderProducts();
}

function addChatBubble(role, text) {
  const bubble = document.createElement('div');
  bubble.className = `chat-bubble chat-bubble--${role}`;
  bubble.textContent = text;
  chatMessages.appendChild(bubble);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function renderSuggestionCards(items) {
  if (!items || !items.length) return;

  const wrap = document.createElement('div');
  wrap.className = 'chat-suggestions';

  items.forEach(item => {
    const card = document.createElement('div');
    card.className = 'chat-suggestion';
    const priceLabel = Number.isFinite(item.price) ? formatUYU(item.price) : 'Precio a coordinar';

    card.innerHTML = `
      <strong>${item.name}</strong>
      <span>${priceLabel} | ${item.category || 'Catalogo'} | ${item.room || 'Sin ambiente'}</span>
      <div class="chat-suggestion__footer">
        <button class="mini-cta mini-cta--primary" type="button" data-chat-suggestion="${encodeURIComponent(item.name)}">Consultar</button>
        <a class="mini-cta" href="${buildWhatsappUrl(`Hola, quiero consultar por ${item.name}.`)}" target="_blank" rel="noopener">WhatsApp</a>
      </div>
    `;

    wrap.appendChild(card);
  });

  chatMessages.appendChild(wrap);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function setChatStatus(message) {
  chatStatus.textContent = message || '';
}

function buildSuccessStatus() {
  return CHAT_CONFIG.webhookEnabled
    ? 'Consulta lista. Si queres, segui por WhatsApp.'
    : 'Modo local activo.';
}

function bootChat() {
  chatBooted = true;
  addChatBubble('bot', 'Hola. Puedo ayudarte a encontrar productos, filtrar por ambiente y preparar la consulta para WhatsApp.');
  addChatBubble('bot', 'Proba con algo como "Que electrodomesticos quedan?" o "Busco un ropero para dormitorio".');
  renderQuickActions();
}

function openChat() {
  salesChat.hidden = false;
  chatLauncher.setAttribute('aria-expanded', 'true');

  if (!chatBooted) {
    bootChat();
  }

  renderLauncherState();
  window.setTimeout(() => {
    chatInput.focus();
  }, 80);
}

function closeChat() {
  salesChat.hidden = true;
  chatLauncher.setAttribute('aria-expanded', 'false');
  launcherMinimized = true;
  resetChatSession();
  renderLauncherState();
}

function resetChatSession() {
  chatBooted = false;
  chatMessages.innerHTML = '';
  chatQuickActions.innerHTML = '';
  chatStatus.textContent = '';
  chatInput.value = '';
  chatInput.placeholder = 'Ej: Busco un ropero para dormitorio';
}

function renderQuickActions(actions = DEFAULT_CHAT_ACTIONS) {
  chatQuickActions.innerHTML = '';

  const hydrated = actions.map(action => {
    if (action.label === 'WhatsApp') {
      return { ...action, url: buildWhatsappUrl('Hola, quiero seguir esta consulta por WhatsApp.') };
    }

    return action;
  });

  hydrated.slice(0, 4).forEach(action => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'quick-chip';
    button.textContent = action.label;

    button.addEventListener('click', () => {
      if (action.type === 'url' && action.url) {
        window.open(action.url, '_blank', 'noopener');
        return;
      }

      if (action.type === 'filter_room' && action.value) {
        selectedRoom = action.value;
        selectedCategory = 'Todos';
        renderFilters();
        renderProducts();
        addChatBubble('bot', `Te filtre el catalogo por ambiente: ${action.value}.`);
        return;
      }

      if (action.type === 'filter_category' && action.value) {
        selectedCategory = action.value;
        selectedRoom = 'Todos';
        renderFilters();
        renderProducts();
        addChatBubble('bot', `Te filtre el catalogo por categoria: ${action.value}.`);
        return;
      }

      queueChatPrompt(action.prompt || action.value || action.label);
    });

    chatQuickActions.appendChild(button);
  });
}

function detectIntent(input) {
  const normalized = normalizeText(input);

  return {
    normalized,
    tokens: tokenize(input),
    categories: productIntents.categories
      .filter(entry => entry.terms.some(term => normalized.includes(normalizeText(term))))
      .map(entry => entry.value),
    rooms: productIntents.rooms
      .filter(entry => entry.terms.some(term => normalized.includes(normalizeText(term))))
      .map(entry => entry.value),
    wantsAll: /todo|todos|catalogo|completo|disponible|disponibles/.test(normalized),
    wantsCheapest: /barato|economico|oferta|menos de/.test(normalized),
    asksShipping: /retiro|entrega|flete|medanos|solymar|direccion|ubicacion/.test(normalized)
  };
}

function categoryMatchesIntent(product, intent) {
  if (!intent.categories.length) return true;

  const category = normalizeText(product.category);
  const name = normalizeText(product.name);
  return intent.categories.some(match => category.includes(match) || name.includes(match));
}

function roomMatchesIntent(product, intent) {
  if (!intent.rooms.length) return true;
  return intent.rooms.some(match => normalizeText(product.room) === normalizeText(match));
}

function searchProducts(query, options = {}) {
  const limit = options.limit || 3;
  const includeSold = Boolean(options.includeSold);
  const source = includeSold ? products : availableProductsList();
  const intent = detectIntent(query);
  const exact = source.filter(product => intent.normalized.length >= 4 && normalizeText(product.name).includes(intent.normalized));

  if (exact.length) {
    return exact.slice(0, limit);
  }

  return source
    .filter(product => categoryMatchesIntent(product, intent) && roomMatchesIntent(product, intent))
    .map(product => {
      const normalizedName = normalizeText(product.name);
      const normalizedMeta = normalizeText(`${product.category} ${product.room}`);
      const nameHits = intent.tokens.filter(token => normalizedName.includes(token)).length;
      const metaHits = intent.tokens.filter(token => normalizedMeta.includes(token)).length;
      let score = nameHits * 5 + metaHits * 2;

      if (intent.categories.length) score += 3;
      if (intent.rooms.length) score += 2;
      if (intent.normalized && normalizedName.includes(intent.normalized)) score += 10;

      return { product, score, nameHits };
    })
    .filter(entry => {
      if (intent.wantsAll && (intent.categories.length || intent.rooms.length)) return true;
      if (intent.categories.length || intent.rooms.length) return entry.score >= 3;
      return entry.nameHits > 0 || entry.score >= 6;
    })
    .sort((left, right) => right.score - left.score || left.product.price - right.product.price)
    .slice(0, limit)
    .map(entry => entry.product);
}

function buildLocalBotReply(userText) {
  const intent = detectIntent(userText);
  const available = availableProductsList();
  const matches = searchProducts(userText, { limit: 3 });
  const soldMatches = searchProducts(userText, { includeSold: true, limit: 2 }).filter(product => product.sold);
  const cheapest = [...available].sort((left, right) => left.price - right.price).slice(0, 3);

  if (!intent.normalized) {
    return {
      text: 'Decime que producto, ambiente o categoria te interesa y te respondo con opciones concretas.',
      suggestions: [],
      actions: DEFAULT_CHAT_ACTIONS
    };
  }

  if (intent.asksShipping) {
    return {
      text: 'El retiro se coordina en Medanos de Solymar. Si preferis, segui por WhatsApp y el webhook deja registrada tu consulta.',
      suggestions: [],
      actions: [
        { label: 'Seguir por WhatsApp', type: 'url', url: buildWhatsappUrl('Hola, quiero coordinar retiro o flete por un articulo del catalogo.') },
        { label: 'Living', type: 'filter_room', value: roomLookup.living },
        { label: 'Cocina', type: 'filter_room', value: roomLookup.cocina },
        { label: 'Dormitorio', type: 'filter_room', value: roomLookup.dormitorio }
      ]
    };
  }

  if (intent.wantsCheapest) {
    return {
      text: 'Estas son las opciones mas accesibles que siguen disponibles ahora.',
      suggestions: cheapest,
      actions: [
        { label: 'Ver muebles', prompt: 'Mostrame muebles para dormitorio' },
        { label: 'Ver electro', prompt: 'Que electrodomesticos tenes disponibles?' },
        { label: 'WhatsApp', type: 'url', url: buildWhatsappUrl('Hola, quiero ver las opciones mas accesibles del catalogo.') }
      ]
    };
  }

  if (matches.length) {
    return {
      text: matches.length === 1
        ? 'Encontre una coincidencia clara con lo que buscas.'
        : 'Estas son las coincidencias mas relevantes para tu consulta.',
      suggestions: matches,
      actions: [
        { label: 'Seguir por WhatsApp', type: 'url', url: buildWhatsappUrl(`Hola, quiero seguir por WhatsApp la consulta sobre ${matches[0].name}.`) },
        { label: 'Retiro y flete', prompt: 'Como se coordina el retiro y el flete?' },
        { label: 'Lo mas barato', prompt: 'Cual es lo mas barato que queda?' }
      ]
    };
  }

  if (soldMatches.length) {
    const alternatives = available
      .filter(product => product.category === soldMatches[0].category || product.room === soldMatches[0].room)
      .slice(0, 3);

    return {
      text: 'Ese articulo ya aparece como vendido. Te dejo alternativas cercanas.',
      suggestions: alternatives,
      actions: [
        { label: 'WhatsApp', type: 'url', url: buildWhatsappUrl(`Hola, vi que ${soldMatches[0].name} ya se vendio. Quiero alternativas.`) },
        { label: 'Dormitorio', type: 'filter_room', value: roomLookup.dormitorio },
        { label: 'Living', type: 'filter_room', value: roomLookup.living }
      ]
    };
  }

  if (intent.wantsAll && (intent.categories.length || intent.rooms.length)) {
    const broad = available
      .filter(product => categoryMatchesIntent(product, intent) && roomMatchesIntent(product, intent))
      .slice(0, 3);

    return {
      text: broad.length
        ? 'Te muestro lo mas relevante de ese ambiente/categoria.'
        : 'No encontre articulos activos para ese filtro puntual.',
      suggestions: broad,
      actions: DEFAULT_CHAT_ACTIONS
    };
  }

  return {
    text: 'No encontre una coincidencia suficientemente clara. Proba con el nombre del producto, ambiente o categoria exacta, o segui por WhatsApp.',
    suggestions: [],
    actions: [
      { label: 'WhatsApp', type: 'url', url: buildWhatsappUrl(`Hola, quiero ayuda para encontrar un producto. Mi consulta fue: ${userText}`) },
      { label: 'Muebles', prompt: 'Mostrame muebles para dormitorio' },
      { label: 'Electrodomesticos', prompt: 'Que electrodomesticos tenes disponibles?' }
    ]
  };
}

function parseAutomationResponse(payload, fallbackPrompt) {
  if (payload?.requires_email) {
    return buildLocalBotReply(fallbackPrompt);
  }

  const suggestions = (Array.isArray(payload?.suggestions) ? payload.suggestions : [])
    .map(item => ({
      name: item.name || item.title || item.sku || 'Producto',
      price: Number(item.price ?? item.total ?? item.subtotal),
      category: item.category || item.type || '',
      room: item.room || item.location || ''
    }))
    .filter(item => item.name)
    .slice(0, 3);

  return {
    text: payload?.reply || payload?.message || payload?.answer || buildLocalBotReply(fallbackPrompt).text,
    suggestions,
    actions: Array.isArray(payload?.next_actions) && payload.next_actions.length
      ? payload.next_actions
      : DEFAULT_CHAT_ACTIONS
  };
}

async function getBotReply(userText) {
  if (!CHAT_CONFIG.webhookEnabled || !CHAT_CONFIG.webhookUrl) {
    return buildLocalBotReply(userText);
  }

  const response = await fetch(CHAT_CONFIG.webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: userText,
      source: 'website-chat',
      site: CHAT_CONFIG.siteName,
      whatsappUrl: buildWhatsappUrl(`Hola, quiero seguir esta consulta por WhatsApp: ${userText}`),
      catalog: availableProductsList().map(product => ({
        name: product.name,
        price: product.price,
        category: product.category,
        room: product.room
      }))
    })
  });

  if (!response.ok) {
    throw new Error(`Webhook devolvio ${response.status}`);
  }

  return parseAutomationResponse(await response.json(), userText);
}

async function queueChatPrompt(prompt) {
  const cleanPrompt = String(prompt || '').trim();
  if (!cleanPrompt) return;

  openChat();
  addChatBubble('user', cleanPrompt);
  setChatStatus(CHAT_CONFIG.webhookEnabled ? 'Consultando al webhook de n8n...' : 'Usando asistente local del sitio...');

  try {
    const reply = await getBotReply(cleanPrompt);
    addChatBubble('bot', reply.text);
    renderSuggestionCards(reply.suggestions);
    renderQuickActions(reply.actions);
    setChatStatus(buildSuccessStatus());
  } catch (error) {
    const fallback = buildLocalBotReply(cleanPrompt);
    addChatBubble('bot', `${fallback.text}\n\nNo pude llegar al webhook configurado, asi que respondo con el catalogo local.`);
    renderSuggestionCards(fallback.suggestions);
    renderQuickActions(fallback.actions);
    setChatStatus('Fallo el webhook. Quedo activo el fallback local.');
  }
}

searchInput.addEventListener('input', event => {
  search = event.target.value;
  renderProducts();
});

productGrid.addEventListener('click', event => {
  const trigger = event.target.closest('[data-chat-product]');
  if (!trigger) return;

  queueChatPrompt(`Quiero consultar por ${decodeURIComponent(trigger.getAttribute('data-chat-product'))}.`);
});

chatMessages.addEventListener('click', event => {
  const suggestion = event.target.closest('[data-chat-suggestion]');
  if (!suggestion) return;

  queueChatPrompt(`Quiero consultar por ${decodeURIComponent(suggestion.getAttribute('data-chat-suggestion'))}.`);
});

chatLauncher.addEventListener('click', () => {
  if (salesChat.hidden) {
    openChat();
  } else {
    closeChat();
  }
});

chatClose.addEventListener('click', event => {
  event.preventDefault();
  event.stopPropagation();
  closeChat();
});

chatClose.addEventListener('pointerup', event => {
  event.preventDefault();
  event.stopPropagation();
  closeChat();
});

if (openChatCta) {
  openChatCta.addEventListener('click', () => {
    launcherMinimized = false;
    openChat();
  });
}

chatForm.addEventListener('submit', event => {
  event.preventDefault();
  const prompt = chatInput.value.trim();
  if (!prompt) return;

  chatInput.value = '';
  queueChatPrompt(prompt);
});

renderStats();
renderFilters();
renderProducts();
renderLauncherState();
renderQuickActions();
