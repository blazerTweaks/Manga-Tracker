import { FastifyInstance } from 'fastify';
import { prisma } from '@mangatracker/database';
import { authenticate } from '../lib/auth-middleware.js';

export async function alertRoutes(app: FastifyInstance) {
  app.get('/', { preHandler: [authenticate] }, async (request: any) => {
    const { id: userId } = request.user;

    const alerts = await prisma.alert.findMany({
      where: { userId },
      include: { volume: { include: { manga: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return { data: alerts };
  });

  app.post('/', { preHandler: [authenticate] }, async (request: any) => {
    const { id: userId } = request.user;
    const { volumeId, targetPrice, direction } = request.body as any;

    const alert = await prisma.alert.create({
      data: { userId, volumeId, targetPrice, direction },
    });

    return { data: alert };
  });

  app.put('/:id', { preHandler: [authenticate] }, async (request: any) => {
    const { id } = request.params as any;
    const { targetPrice, direction, active } = request.body as any;

    const alert = await prisma.alert.update({
      where: { id },
      data: { targetPrice, direction, active },
    });

    return { data: alert };
  });

  app.delete('/:id', { preHandler: [authenticate] }, async (request: any) => {
    const { id } = request.params as any;
    await prisma.alert.delete({ where: { id } });
    return { data: { deleted: true } };
  });
}
