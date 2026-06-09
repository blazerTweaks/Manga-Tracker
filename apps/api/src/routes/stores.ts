import { FastifyInstance } from 'fastify';
import { prisma } from '@mangatracker/database';
import { authenticate } from '../lib/auth-middleware.js';

export async function storeRoutes(app: FastifyInstance) {
  app.get('/', async () => {
    const stores = await prisma.store.findMany({ orderBy: { name: 'asc' } });
    return { data: stores };
  });

  app.post('/', async (request) => {
    const body = request.body as any;
    const store = await prisma.store.create({ data: body });
    return { data: store };
  });

  app.patch('/:id', { preHandler: [authenticate] }, async (request) => {
    const { id } = request.params as any;
    const body = request.body as any;
    const store = await prisma.store.update({
      where: { id },
      data: { active: body.active },
    });
    return { data: store };
  });
}
