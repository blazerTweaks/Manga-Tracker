import { FastifyInstance } from 'fastify';
import { prisma } from '@mangatracker/database';

export async function linkRoutes(app: FastifyInstance) {
  app.get('/volume/:volumeId', async (request) => {
    const { volumeId } = request.params as any;
    const links = await prisma.productLink.findMany({
      where: { volumeId },
      include: { store: true },
    });
    return { data: links };
  });

  app.post('/volume/:volumeId', async (request) => {
    const { volumeId } = request.params as any;
    const body = request.body as any;

    const link = await prisma.productLink.create({
      data: {
        volumeId,
        storeId: body.storeId,
        url: body.url,
      },
      include: { store: true },
    });

    return { data: link };
  });

  app.delete('/:id', async (request) => {
    const { id } = request.params as any;
    await prisma.productLink.delete({ where: { id } });
    return { data: { deleted: true } };
  });

  app.post('/:id/refresh', async (request) => {
    const { id } = request.params as any;
    return { data: { message: 'Scraping iniciado', linkId: id } };
  });
}
