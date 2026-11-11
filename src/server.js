import http from 'node:http';
import { calculateDiscount } from './rules.js';

const PORT = Number(process.env.PORT) || 8080;

function send(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
      if (data.length > 1e5) reject(new Error('payload too large'));
    });
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        reject(new Error('invalid JSON'));
      }
    });
  });
}

const server = http.createServer(async (req, res) => {
  const { pathname } = new URL(req.url, 'http://localhost');

  if (req.method === 'GET' && (pathname === '/' || pathname === '/health')) {
    return send(res, 200, { status: 'ok' });
  }

  if (pathname === '/discount') {
    if (req.method !== 'POST') return send(res, 405, { error: 'method not allowed' });
    try {
      const result = calculateDiscount(await readJson(req));
      return result.error ? send(res, 400, result) : send(res, 200, result);
    } catch (err) {
      return send(res, 400, { error: err.message });
    }
  }

  send(res, 404, { error: 'not found' });
});

server.listen(PORT, () => console.log(`listening on ${PORT}`));

process.on('SIGTERM', () => server.close(() => process.exit(0)));
