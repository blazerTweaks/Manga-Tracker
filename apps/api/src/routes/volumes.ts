import { FastifyInstance } from 'fastify';
import { prisma } from '@mangatracker/database';

export async function volumeRoutes(app: FastifyInstance) {
  app.get('/:id', async (request) => {
    const { id } = request.params as any;

    const volume = await prisma.volume.findUnique({
      where: { id },
      include: {
        manga: true,
        productLinks: {
          where: { active: true },
          include: {
            store: true,
            priceRecords: { orderBy: { scrapedAt: 'desc' }, take: 1 },
          },
        },
      },
    });

    if (!volume) {
      return { error: { code: 'NOT_FOUND', message: 'Volume não encontrado' } };
    }

    const prices = volume.productLinks.map((link) => ({
      store: link.store,
      currentPrice: link.priceRecords[0]?.price ?? null,
      available: link.priceRecords[0]?.available ?? false,
      url: link.url,
      lastScraped: link.lastScraped,
    }));

    const validPrices = prices
      .filter((p) => p.currentPrice !== null)
      .map((p) => Number(p.currentPrice));

    const stats = {
      lowestPrice: validPrices.length ? Math.min(...validPrices) : null,
      highestPrice: validPrices.length ? Math.max(...validPrices) : null,
      averagePrice: validPrices.length
        ? validPrices.reduce((a, b) => a + b, 0) / validPrices.length
        : null,
      currentPrice: validPrices.length ? Math.min(...validPrices) : null,
    };

    return { data: { volume, prices, stats } };
  });

  app.get('/:id/history', async (request) => {
    const { id } = request.params as any;
    const { storeId, from, to } = request.query as any;

    const where: any = {
      productLink: { volumeId: id, active: true },
    };
    if (storeId) where.productLink.storeId = storeId;
    if (from || to) {
      where.scrapedAt = {};
      if (from) where.scrapedAt.gte = new Date(from);
      if (to) where.scrapedAt.lte = new Date(to);
    }

    const records = await prisma.priceRecord.findMany({
      where,
      include: { productLink: { include: { store: true } } },
      orderBy: { scrapedAt: 'asc' },
    });

    const history = records.map((r) => ({
      price: Number(r.price),
      storeSlug: r.productLink.store.slug,
      storeName: r.productLink.store.name,
      scrapedAt: r.scrapedAt,
    }));

    return { data: history };
  });

  app.get('/:id/history/summary', async (request) => {
    const { id } = request.params as any;

    const result = await prisma.priceRecord.aggregate({
      where: { productLinkId: id },
      _min: { price: true },
      _max: { price: true },
      _avg: { price: true },
      _count: true,
    });

    return {
      data: {
        minPrice: result._min.price,
        maxPrice: result._max.price,
        avgPrice: result._avg.price,
        count: result._count,
      },
    };
  });

  app.get('/:id/prices', async (request) => {
    const { id } = request.params as any;

    const productLinks = await prisma.productLink.findMany({
      where: { volumeId: id, active: true },
      include: {
        store: true,
        priceRecords: { orderBy: { scrapedAt: 'desc' }, take: 1 },
      },
    });

    const prices = productLinks.map((link) => {
      const latest = link.priceRecords[0];
      return {
        store: link.store,
        currentPrice: latest ? Number(latest.price) : null,
        available: latest?.available ?? false,
        url: link.url,
        lastScraped: link.lastScraped,
      };
    });

    return { data: prices };
  });

  app.post('/', async (request) => {
    const body = request.body as any;
    const volume = await prisma.volume.create({
      data: {
        mangaId: body.mangaId,
        number: body.number,
        title: body.title,
        coverUrl: body.coverUrl,
        releaseDate: body.releaseDate ? new Date(body.releaseDate) : undefined,
      },
    });
    return { data: volume };
  });

  app.put('/:id', async (request) => {
    const { id } = request.params as any;
    const body = request.body as any;
    const volume = await prisma.volume.update({ where: { id }, data: body });
    return { data: volume };
  });

  app.delete('/:id', async (request) => {
    const { id } = request.params as any;
    await prisma.volume.delete({ where: { id } });
    return { data: { deleted: true } };
  });
}
