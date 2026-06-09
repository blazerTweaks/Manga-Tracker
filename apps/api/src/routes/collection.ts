import { FastifyInstance } from 'fastify';
import { prisma } from '@mangatracker/database';
import { authenticate } from '../lib/auth-middleware.js';

export async function collectionRoutes(app: FastifyInstance) {
  app.get('/', { preHandler: [authenticate] }, async (request: any) => {
    const { id: userId } = request.user;

    const items = await prisma.collection.findMany({
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

  app.get('/stats', { preHandler: [authenticate] }, async (request: any) => {
    const { id: userId } = request.user;

    const total = await prisma.collection.count({ where: { userId } });
    const owned = await prisma.collection.count({ where: { userId, status: 'OWNED' } });
    const missing = await prisma.collection.count({ where: { userId, status: 'MISSING' } });
    const desired = await prisma.collection.count({ where: { userId, status: 'DESIRED' } });

    const totalVolumeCount = await prisma.volume.count();

    return {
      data: {
        totalVolumes: totalVolumeCount,
        trackedVolumes: total,
        ownedVolumes: owned,
        missingVolumes: missing,
        desiredVolumes: desired,
        completionPercent: totalVolumeCount > 0 ? Math.round((owned / totalVolumeCount) * 100) : 0,
      },
    };
  });

  app.post('/', { preHandler: [authenticate] }, async (request: any) => {
    const { id: userId } = request.user;
    const { volumeId, status } = request.body as any;

    const item = await prisma.collection.upsert({
      where: { userId_volumeId: { userId, volumeId } },
      update: { status },
      create: { userId, volumeId, status },
    });

    return { data: item };
  });

  app.delete('/:volumeId', { preHandler: [authenticate] }, async (request: any) => {
    const { id: userId } = request.user;
    const { volumeId } = request.params as any;

    await prisma.collection.deleteMany({ where: { userId, volumeId } });
    return { data: { deleted: true } };
  });
}
