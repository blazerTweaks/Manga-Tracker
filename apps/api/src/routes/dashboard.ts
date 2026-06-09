import { FastifyInstance } from 'fastify';
import { prisma } from '@mangatracker/database';

export async function dashboardRoutes(app: FastifyInstance) {
  app.get('/promotions', async () => {
    const links = await prisma.productLink.findMany({
      where: { active: true },
      include: {
        store: true,
        volume: { include: { manga: true } },
        priceRecords: { orderBy: { scrapedAt: 'desc' }, take: 2 },
      },
    });

    const promotions = links
      .map((link) => {
        const [latest, previous] = link.priceRecords;
        if (!latest || !previous) return null;

        const currentPrice = Number(latest.price);
        const previousPrice = Number(previous.price);
        const dropPercent = previousPrice > 0
          ? Math.round(((previousPrice - currentPrice) / previousPrice) * 100)
          : 0;

        if (dropPercent <= 0) return null;

        return {
          volumeId: link.volumeId,
          mangaName: link.volume.manga.name,
          volumeNumber: link.volume.number,
          storeName: link.store.name,
          storeSlug: link.store.slug,
          currentPrice,
          previousPrice,
          dropPercent,
        };
      })
      .filter((p): p is NonNullable<typeof p> => p !== null)
      .sort((a, b) => b.dropPercent - a.dropPercent)
      .slice(0, 20);

    return { data: promotions };
  });

  app.get('/biggest-drops', async () => {
    const links = await prisma.productLink.findMany({
      where: { active: true },
      include: {
        store: true,
        volume: { include: { manga: true } },
        priceRecords: { orderBy: { scrapedAt: 'desc' }, take: 2 },
      },
    });

    const drops = links
      .map((link) => {
        const [latest, previous] = link.priceRecords;
        if (!latest || !previous) return null;

        const current = Number(latest.price);
        const previousPrice = Number(previous.price);
        const dropPercent = previousPrice > 0
          ? Math.round(((previousPrice - current) / previousPrice) * 100)
          : 0;

        if (dropPercent <= 5) return null;

        return {
          volumeId: link.volumeId,
          mangaName: link.volume.manga.name,
          volumeNumber: link.volume.number,
          storeName: link.store.name,
          storeSlug: link.store.slug,
          currentPrice: current,
          previousPrice,
          dropPercent,
        };
      })
      .filter((p): p is NonNullable<typeof p> => p !== null)
      .sort((a, b) => b.dropPercent - a.dropPercent)
      .slice(0, 20);

    return { data: drops };
  });

  app.get('/stats', async () => {
    const [mangaCount, volumeCount, priceCount, storeCount] = await Promise.all([
      prisma.manga.count(),
      prisma.volume.count(),
      prisma.priceRecord.count(),
      prisma.store.count(),
    ]);

    return {
      data: {
        mangaCount,
        volumeCount,
        priceCount,
        storeCount,
      },
    };
  });
}
