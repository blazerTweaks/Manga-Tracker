import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';

import { mangaRoutes } from './routes/mangas.js';
import { volumeRoutes } from './routes/volumes.js';
import { storeRoutes } from './routes/stores.js';
import { authRoutes } from './routes/auth.js';
import { collectionRoutes } from './routes/collection.js';
import { wishlistRoutes } from './routes/wishlist.js';
import { alertRoutes } from './routes/alerts.js';
import { dashboardRoutes } from './routes/dashboard.js';
import { linkRoutes } from './routes/links.js';
import { scraperRoutes } from './routes/scraper.js';
import { startScheduler } from './scheduler.js';

const app = Fastify({ logger: true });

await app.register(cors, { origin: true });

await app.register(jwt, { secret: process.env.JWT_SECRET || 'dev-secret' });

await app.register(authRoutes, { prefix: '/api/auth' });
await app.register(mangaRoutes, { prefix: '/api/mangas' });
await app.register(volumeRoutes, { prefix: '/api/volumes' });
await app.register(storeRoutes, { prefix: '/api/stores' });
await app.register(linkRoutes, { prefix: '/api/links' });
await app.register(scraperRoutes, { prefix: '/api/scraper' });
await app.register(collectionRoutes, { prefix: '/api/collection' });
await app.register(wishlistRoutes, { prefix: '/api/wishlist' });
await app.register(alertRoutes, { prefix: '/api/alerts' });
await app.register(dashboardRoutes, { prefix: '/api/dashboard' });

app.get('/health', async () => ({ status: 'ok' }));

if (process.env.SCHEDULER !== 'false') {
  startScheduler();
}

const port = parseInt(process.env.PORT || '3001');
const host = process.env.HOST || '0.0.0.0';

try {
  await app.listen({ port, host });
  console.log(`API rodando em http://${host}:${port}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
