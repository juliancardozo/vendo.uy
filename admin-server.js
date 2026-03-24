const express = require('express');
const path = require('path');

const app = express();
const port = Number(process.env.PORT) || 3000;
const rootDir = __dirname;

app.disable('x-powered-by');

app.use(express.static(rootDir, {
  extensions: ['html']
}));

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/admin', (_req, res) => {
  res.sendFile(path.join(rootDir, 'admin.html'));
});

app.get('*', (_req, res) => {
  res.sendFile(path.join(rootDir, 'index.html'));
});

app.listen(port, () => {
  console.log(`Casa Medanos server listening on http://localhost:${port}`);
});
