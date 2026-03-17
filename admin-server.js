/* admin-server.js
Simple backoffice server to upload images and map them to products.
Usage:
  set ADMIN_PASSWORD=tuclave (Windows PowerShell)
  npm install
  node admin-server.js
Then open http://localhost:3000/admin

Security: This is a minimal example for local/private use. Do not expose this to the open internet without extra protections.
*/

const express = require('express');
const session = require('express-session');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const APP_ROOT = path.resolve(__dirname);
const IMG_DIR = path.join(APP_ROOT, 'img');
const INDEX_HTML = path.join(APP_ROOT, 'index.html');

if (!fs.existsSync(IMG_DIR)) fs.mkdirSync(IMG_DIR, { recursive: true });

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const PORT = process.env.PORT || 3000;

const upload = multer({ dest: IMG_DIR });
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'vendo-secret-please-change',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

// serve the site statically
app.use('/', express.static(APP_ROOT));

function requireAuth(req, res, next) {
  if (req.session && req.session.authenticated) return next();
  res.status(401).json({ error: 'not authenticated' });
}

app.post('/admin/login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    req.session.authenticated = true;
    res.json({ ok: true });
  } else {
    res.status(401).json({ ok: false, error: 'invalid password' });
  }
});

app.post('/admin/logout', requireAuth, (req, res) => {
  req.session.destroy(err => { res.json({ ok: true }); });
});

app.get('/admin/auth-status', (req, res) => {
  res.json({ authenticated: !!(req.session && req.session.authenticated) });
});

app.post('/admin/upload', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'no file' });
  // multer saved to IMG_DIR with random name; rename to original filename
  const orig = req.file.originalname;
  const dest = path.join(IMG_DIR, orig);
  try {
    fs.renameSync(req.file.path, dest);
    res.json({ ok: true, filename: orig });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/admin/images', requireAuth, (req, res) => {
  try {
    const imgs = fs.readdirSync(IMG_DIR).filter(f => f.match(/\.(jpg|jpeg|png|webp|svg|gif)$/i));
    res.json({ images: imgs });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// mapping logic (similar to map-images.js)
function normalize(s) {
  if (!s) return '';
  const accents = 'ÀÁÂÃÄÅàáâãäåÈÉÊËèéêëÌÍÎÏìíîïÒÓÔÕÖØòóôõöøÙÚÛÜùúûüÝýÿÑñÇç';
  const accentsOut = "AAAAAAaaaaaaEEEEeeeeIIIIiiiiOOOOOOooooooUUUUuuuuYyyNnCc";
  s = s.split('').map((c, i) => {
    const idx = accents.indexOf(c);
    return idx !== -1 ? accentsOut[idx] : c;
  }).join('');
  return s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}
function tokens(s) { return normalize(s).split(/\s+/).filter(Boolean); }
function scoreMatch(prodTokens, fileTokens) { let score = 0; prodTokens.forEach(t => { if (fileTokens.includes(t)) score++; }); return score; }

function extractProductsArray(html) {
  const startToken = 'const products =';
  const i = html.indexOf(startToken);
  if (i === -1) throw new Error('No "const products =" found in index.html');
  const start = html.indexOf('[', i);
  if (start === -1) throw new Error('No opening [ after products declaration');
  let depth = 0; let end = -1;
  for (let j = start; j < html.length; j++) {
    const ch = html[j];
    if (ch === '[') depth++; else if (ch === ']') { depth--; if (depth === 0) { end = j; break; } }
  }
  if (end === -1) throw new Error('Could not find matching closing ] for products array');
  const arrayText = html.slice(start, end + 1);
  return { arrayText, start, end };
}

app.get('/admin/suggestions', requireAuth, (req, res) => {
  try {
    const html = fs.readFileSync(INDEX_HTML, 'utf8');
    const { arrayText } = extractProductsArray(html);
    const products = (new Function('return ' + arrayText))();
    const images = fs.readdirSync(IMG_DIR).filter(f => f.match(/\.(jpg|jpeg|png|webp|svg|gif)$/i));
    const imgNames = images.map(f => ({ filename: f, tokens: tokens(path.basename(f, path.extname(f))) }));
    const suggestions = products.map((p, idx) => {
      const pTokens = tokens(p.name + ' ' + (p.category||'') + ' ' + (p.room||''));
      let best = null; let bestScore = -1;
      imgNames.forEach(img => { const sc = scoreMatch(pTokens, img.tokens); if (sc > bestScore) { bestScore = sc; best = img; } });
      return { index: idx, productName: p.name, suggestion: best ? best.filename : null, score: bestScore };
    });
    // also return product list and available images for interactive UI
    res.json({ suggestions, products: products.map((p, idx) => ({ index: idx, name: p.name, category: p.category, room: p.room })), images });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// apply a custom mapping provided by the client
app.post('/admin/apply-mapping-custom', requireAuth, (req, res) => {
  try {
    const mappings = req.body && req.body.mappings; // array of filenames or null
    if (!Array.isArray(mappings)) return res.status(400).json({ error: 'mappings must be an array' });
    const html = fs.readFileSync(INDEX_HTML, 'utf8');
    const { arrayText, start, end } = extractProductsArray(html);
    const products = (new Function('return ' + arrayText))();
    if (mappings.length !== products.length) return res.status(400).json({ error: 'mappings length mismatch' });
    const newProducts = products.map((p, idx) => {
      const fname = mappings[idx];
      if (fname) return Object.assign({}, p, { image: path.posix.join('img', fname) });
      // remove image property if exists
      const copy = Object.assign({}, p);
      delete copy.image;
      return copy;
    });
    const newArrayText = JSON.stringify(newProducts, null, 2);
    const backup = INDEX_HTML + '.bak';
    fs.copyFileSync(INDEX_HTML, backup);
    const newHtml = html.slice(0, start) + newArrayText + html.slice(end + 1);
    fs.writeFileSync(INDEX_HTML, newHtml, 'utf8');
    res.json({ ok: true, backup });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/admin/apply-mapping', requireAuth, (req, res) => {
  try {
    const html = fs.readFileSync(INDEX_HTML, 'utf8');
    const { arrayText, start, end } = extractProductsArray(html);
    const products = (new Function('return ' + arrayText))();
    const images = fs.readdirSync(IMG_DIR).filter(f => f.match(/\.(jpg|jpeg|png|webp|svg|gif)$/i));
    const imgNames = images.map(f => ({ filename: f, tokens: tokens(path.basename(f, path.extname(f))) }));
    const suggestions = products.map(p => {
      const pTokens = tokens(p.name + ' ' + (p.category||'') + ' ' + (p.room||''));
      let best = null; let bestScore = -1;
      imgNames.forEach(img => { const sc = scoreMatch(pTokens, img.tokens); if (sc > bestScore) { bestScore = sc; best = img; } });
      return best ? best.filename : null;
    });
    const newProducts = products.map((p, idx) => {
      const s = suggestions[idx];
      if (s) return Object.assign({}, p, { image: path.posix.join('img', s) });
      return p;
    });
    const newArrayText = JSON.stringify(newProducts, null, 2);
    const backup = INDEX_HTML + '.bak';
    fs.copyFileSync(INDEX_HTML, backup);
    const newHtml = html.slice(0, start) + newArrayText + html.slice(end + 1);
    fs.writeFileSync(INDEX_HTML, newHtml, 'utf8');
    res.json({ ok: true, backup });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.listen(PORT, () => console.log(`Admin server running at http://localhost:${PORT}/admin`));
