import { FastifyInstance } from 'fastify';
import { prisma } from '@mangatracker/database';
import { authenticate } from '../lib/auth-middleware.js';

export async function wishlistRoutes(app: FastifyInstance) {
  app.get('/', { preHandler: [authenticate] }, async (request: any) => {
    const { id: userId } = request.user;

    const items = await prisma.wishlist.findMany({
      where: { userId },
      include: {
        volume: {
          include: { manga: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return { data: items };
  });

  app.post('/', { preHandler: [authenticate] }, async (request: any) => {
    const { id: userId } = request.user;
    const { volumeId } = request.body as any;

    const item = await prisma.wishlist.upsert({
      where: { userId_volumeId: { userId, volumeId } },
      update: {},
      create: { userId, volumeId },
    });

    return { data: item };
  });

  app.delete('/:volumeId', { preHandler: [authenticate] }, async (request: any) => {
    const { id: userId } = request.user;
    const { volumeId } = request.params as any;

    await prisma.wishlist.deleteMany({ where: { userId, volumeId } });
    return { data: { deleted: true } };
  });
}
