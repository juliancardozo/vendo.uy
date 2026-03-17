#!/usr/bin/env node
// map-images.js
// Scan img/ folder and try to map filenames to products in index.html
// Usage:
//   node map-images.js         -> preview suggested mappings
//   node map-images.js --apply -> apply mappings to index.html (creates index.html.bak)

const fs = require('fs');
const path = require('path');

const INDEX = path.join(__dirname, 'index.html');
const IMG_DIR = path.join(__dirname, 'img');

function normalize(s) {
  if (!s) return '';
  // remove accents
  const accents = 'ÀÁÂÃÄÅàáâãäåÈÉÊËèéêëÌÍÎÏìíîïÒÓÔÕÖØòóôõöøÙÚÛÜùúûüÝýÿÑñÇç';
  const accentsOut = "AAAAAAaaaaaaEEEEeeeeIIIIiiiiOOOOOOooooooUUUUuuuuYyyNnCc";
  s = s.split('').map((c, i) => {
    const idx = accents.indexOf(c);
    return idx !== -1 ? accentsOut[idx] : c;
  }).join('');
  return s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function tokens(s) {
  return normalize(s).split(/\s+/).filter(Boolean);
}

function readIndex() {
  return fs.readFileSync(INDEX, 'utf8');
}

function extractProductsArray(html) {
  const startToken = 'const products =';
  const i = html.indexOf(startToken);
  if (i === -1) throw new Error('No "const products =" found in index.html');
  const start = html.indexOf('[', i);
  if (start === -1) throw new Error('No opening [ after products declaration');
  let depth = 0;
  let end = -1;
  for (let j = start; j < html.length; j++) {
    const ch = html[j];
    if (ch === '[') depth++;
    else if (ch === ']') {
      depth--;
      if (depth === 0) { end = j; break; }
    }
  }
  if (end === -1) throw new Error('Could not find matching closing ] for products array');
  const arrayText = html.slice(start, end + 1);
  return { arrayText, start, end };
}

function evalArray(text) {
  // turn JS-style array/object into valid JSON by evaluating in Node VM
  // Safer to use Function to evaluate in clean scope
  const src = 'return ' + text + ';';
  try {
    const fn = new Function(src);
    return fn();
  } catch (e) {
    throw new Error('Failed to evaluate products array: ' + e.message);
  }
}

function listImages() {
  if (!fs.existsSync(IMG_DIR)) return [];
  return fs.readdirSync(IMG_DIR).filter(f => f.match(/\.(jpg|jpeg|png|webp|svg|gif)$/i));
}

function scoreMatch(prodTokens, fileTokens) {
  let score = 0;
  prodTokens.forEach(t => { if (fileTokens.includes(t)) score++; });
  return score;
}

function suggestMappings(products, images) {
  const imgNames = images.map(f => ({ filename: f, name: path.basename(f, path.extname(f)), tokens: tokens(path.basename(f, path.extname(f))) }));
  const suggestions = products.map(p => {
    const pTokens = tokens(p.name + ' ' + (p.category||'') + ' ' + (p.room||''));
    let best = null; let bestScore = -1;
    imgNames.forEach(img => {
      const sc = scoreMatch(pTokens, img.tokens);
      if (sc > bestScore) { bestScore = sc; best = img; }
    });
    // also prefer exact token match or filename contains full words
    return { product: p, suggestion: best ? best.filename : null, score: bestScore };
  });
  return suggestions;
}

function applyMappings(html, products, suggestions) {
  const newProducts = products.map((p, idx) => {
    const s = suggestions[idx];
    if (s && s.suggestion) {
      return Object.assign({}, p, { image: path.posix.join('img', s.suggestion) });
    }
    return p;
  });
  // stringify with JSON so it's valid JS
  const newArrayText = JSON.stringify(newProducts, null, 2);
  // replace in html
  const { arrayText, start, end } = extractProductsArray(html);
  const before = html.slice(0, start);
  const after = html.slice(end + 1);
  const newHtml = before + newArrayText + after;
  return newHtml;
}

function printSuggestions(suggestions) {
  console.log('Sugerencias de mapeo (producto -> archivo)');
  console.log('-----------------------------------------');
  suggestions.forEach(s => {
    console.log(`${s.product.name}  ->  ${s.suggestion || '(ninguno)'}  (score: ${s.score})`);
  });
}

// main
(async function(){
  try {
    const args = process.argv.slice(2);
    const apply = args.includes('--apply');

    const html = readIndex();
    const { arrayText } = extractProductsArray(html);
    const products = evalArray(arrayText);

    const images = listImages();
    if (images.length === 0) { console.log('No hay archivos en img/. Coloca tus fotos en la carpeta img/ y vuelve a ejecutar.'); return; }

    const suggestions = suggestMappings(products, images);
    printSuggestions(suggestions);

    if (apply) {
      const backup = INDEX + '.bak';
      fs.copyFileSync(INDEX, backup);
      const newHtml = applyMappings(html, products, suggestions);
      fs.writeFileSync(INDEX, newHtml, 'utf8');
      console.log('\nMappings applied. Original file backed up at', backup);
    } else {
      console.log('\nEjecuta `node map-images.js --apply` para aplicar las sugerencias y actualizar index.html (se crea index.html.bak).');
    }
  } catch (e) {
    console.error('Error:', e && e.message ? e.message : e);
  }
})();
