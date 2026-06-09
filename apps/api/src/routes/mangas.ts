import { FastifyInstance } from 'fastify';
import { prisma } from '@mangatracker/database';
import { slugify } from '@mangatracker/shared';

export async function mangaRoutes(app: FastifyInstance) {
  app.get('/', async (request) => {
    const { search, publisher, status, page = '1', limit = '20' } = request.query as any;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = Math.min(parseInt(limit), 100);

    const where: any = {};
    if (search) where.name = { contains: search };
    if (publisher) where.publisher = publisher;
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      prisma.manga.findMany({
        where,
        skip,
        take,
        orderBy: { name: 'asc' },
      }),
      prisma.manga.count({ where }),
    ]);

    return {
      data,
      meta: {
        page: parseInt(page),
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
      },
    };
  });

  app.get('/:slug', async (request) => {
    const { slug } = request.params as any;
    const manga = await prisma.manga.findUnique({
      where: { slug },
      include: {
        volumes: {
          include: {
            productLinks: {
              include: { store: true, priceRecords: { orderBy: { scrapedAt: 'desc' }, take: 1 } },
            },
          },
          orderBy: { number: 'asc' },
        },
      },
    });

    if (!manga) {
      return { error: { code: 'NOT_FOUND', message: 'Mangá não encontrado' } };
    }

    return { data: manga };
  });

  app.post('/', async (request) => {
    const body = request.body as any;
    const slug = slugify(body.name);

    const manga = await prisma.manga.create({
      data: {
        name: body.name,
        slug,
        altName: body.altName,
        publisher: body.publisher,
        status: body.status || 'ONGOING',
        synopsis: body.synopsis,
        coverUrl: body.coverUrl,
        totalVolumes: body.totalVolumes,
      },
    });

    return { data: manga };
  });

  app.put('/:id', async (request) => {
    const { id } = request.params as any;
    const body = request.body as any;

    const data: any = { ...body };
    if (body.name) data.slug = slugify(body.name);

    const manga = await prisma.manga.update({ where: { id }, data });
    return { data: manga };
  });

  app.delete('/:id', async (request) => {
    const { id } = request.params as any;
    await prisma.manga.delete({ where: { id } });
    return { data: { deleted: true } };
  });
}
