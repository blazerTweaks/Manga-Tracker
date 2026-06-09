import { FastifyInstance } from 'fastify';
import { runScrapers, scrapeSingle } from '@mangatracker/scraper';
import { authenticate } from '../lib/auth-middleware.js';

export async function scraperRoutes(app: FastifyInstance) {
  app.post('/run', { preHandler: [authenticate] }, async (request) => {
    const results = await runScrapers({ headless: true });
    const success = results.filter((r) => r.price !== null).length;
    const failed = results.filter((r) => r.error || r.price === null).length;
    return {
      data: {
        total: results.length,
        success,
        failed,
        results,
      },
    };
  });

  app.post('/links/:id', { preHandler: [authenticate] }, async (request) => {
    const { id } = request.params as any;
    const result = await scrapeSingle(id);
    return { data: result };
  });
}
