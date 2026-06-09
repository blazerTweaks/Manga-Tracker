import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function makeSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/'/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function createPriceHistory(productLinkId: string, basePrice: number) {
  for (let daysAgo = 30; daysAgo >= 0; daysAgo -= 3) {
    const trend = 1 + 0.08 * Math.sin((daysAgo / 30) * Math.PI);
    const historicalPrice = Math.round(basePrice * trend * 100) / 100;
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    date.setHours(12, 0, 0, 0);

    await prisma.priceRecord.create({
      data: { productLinkId, price: historicalPrice, available: true, scrapedAt: date },
    });
  }
}

async function main() {
  console.log('Limpando dados existentes...');
  await prisma.priceRecord.deleteMany();
  await prisma.productLink.deleteMany();
  await prisma.collection.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.alert.deleteMany();
  await prisma.volume.deleteMany();
  await prisma.manga.deleteMany();
  await prisma.store.deleteMany();

  console.log('Criando lojas...');
  const panini = await prisma.store.create({
    data: { name: 'Panini', slug: 'panini', url: 'https://panini.com.br' },
  });
  const amazon = await prisma.store.create({
    data: { name: 'Amazon', slug: 'amazon', url: 'https://amazon.com.br' },
  });

  interface MangaSeed {
    name: string;
    altName: string | null;
    publisher: string;
    status: 'ONGOING' | 'FINISHED' | 'CANCELLED' | 'HIATUS';
    synopsis: string;
    totalVolumes: number;
    volumes: number[];
  }

  const mangas: MangaSeed[] = [
    {
      name: 'Attack on Titan',
      altName: 'Shingeki no Kyojin',
      publisher: 'Panini',
      status: 'FINISHED',
      synopsis: 'Em um mundo onde a humanidade vive dentro de cidades cercadas por enormes muralhas para se proteger de criaturas gigantescas chamadas Titãs, o jovem Eren Yeager jura eliminar todos os Titãs após um ataque devastador.',
      totalVolumes: 34,
      volumes: Array.from({ length: 34 }, (_, i) => i + 1),
    },
    {
      name: 'Jujutsu Kaisen',
      altName: null,
      publisher: 'Panini',
      status: 'ONGOING',
      synopsis: 'Yuji Itadori é um estudante do ensino médio que se envolve no mundo da feitiçaria após engolir um objeto amaldiçoado — o dedo do Rei das Maldições.',
      totalVolumes: 28,
      volumes: Array.from({ length: 28 }, (_, i) => i + 1),
    },
    {
      name: 'Demon Slayer',
      altName: 'Kimetsu no Yaiba',
      publisher: 'Panini',
      status: 'FINISHED',
      synopsis: 'Tanjiro Kamado vive nas montanhas com sua família. Após um ataque demoníaco devastador, ele se torna um caçador de demônios para encontrar uma cura para sua irmã Nezuko, que foi transformada em demônio.',
      totalVolumes: 23,
      volumes: Array.from({ length: 23 }, (_, i) => i + 1),
    },
    {
      name: 'One Piece',
      altName: null,
      publisher: 'Panini',
      status: 'ONGOING',
      synopsis: 'Monkey D. Luffy, um jovem que ganha poderes de borracha ao comer uma Fruta do Diabo, parte em uma jornada para encontrar o lendário tesouro One Piece e se tornar o Rei dos Piratas.',
      totalVolumes: 108,
      volumes: Array.from({ length: 20 }, (_, i) => i + 1),
    },
    {
      name: 'Berserk',
      altName: null,
      publisher: 'Panini',
      status: 'ONGOING',
      synopsis: 'Guts, um mercenário solitário marcado por um destino trágico, empunha uma enorme espada e busca vingança contra seu antigo amigo Griffith, que sacrificou tudo para se tornar um ser demoníaco.',
      totalVolumes: 42,
      volumes: Array.from({ length: 42 }, (_, i) => i + 1),
    },
    {
      name: 'Vagabond',
      altName: null,
      publisher: 'Panini',
      status: 'HIATUS',
      synopsis: 'Baseado na vida do lendário espadachim Miyamoto Musashi, Vagabond acompanha sua jornada em busca da perfeição através da espada e do autoconhecimento.',
      totalVolumes: 37,
      volumes: Array.from({ length: 37 }, (_, i) => i + 1),
    },
    {
      name: "Hell's Paradise",
      altName: 'Jigokuraku',
      publisher: 'Panini',
      status: 'FINISHED',
      synopsis: 'Gabimaru, um ninja condenado à morte, recebe uma chance de redenção: viajar para uma ilha misteriosa em busca do elixir da imortalidade. Mas a ilha esconde segredos mortais.',
      totalVolumes: 13,
      volumes: Array.from({ length: 13 }, (_, i) => i + 1),
    },
    {
      name: 'Chainsaw Man',
      altName: null,
      publisher: 'Panini',
      status: 'ONGOING',
      synopsis: 'Denji é um jovem endividado que se funde com seu cão-demônio Pochita, ganhando a habilidade de transformar partes do corpo em motosserras. Ele é recrutado por uma organização governamental para caçar demônios.',
      totalVolumes: 17,
      volumes: Array.from({ length: 17 }, (_, i) => i + 1),
    },
    {
      name: 'Monster',
      altName: null,
      publisher: 'Panini',
      status: 'FINISHED',
      synopsis: 'Dr. Kenzo Tenma, um brilhante neurocirurgião, salva a vida de um menino em vez de um político influente. Anos depois, descobre que o menino se tornou um assassino em série — e que sua escolha pode ter desencadeado uma tragédia.',
      totalVolumes: 18,
      volumes: Array.from({ length: 18 }, (_, i) => i + 1),
    },
    {
      name: 'Goodbye, Eri',
      altName: 'Sayonara Eri',
      publisher: 'Panini',
      status: 'FINISHED',
      synopsis: 'Um menino que ama cinema recebe uma câmera de sua mãe doente e começa a gravar tudo. Após a morte dela, ele conhece uma garota misteriosa que muda sua perspectiva sobre a vida e o cinema.',
      totalVolumes: 1,
      volumes: [1],
    },
  ];

  for (const mangaData of mangas) {
    console.log(`Criando: ${mangaData.name}...`);

    const manga = await prisma.manga.create({
      data: {
        name: mangaData.name,
        slug: makeSlug(mangaData.name),
        altName: mangaData.altName,
        publisher: mangaData.publisher,
        status: mangaData.status,
        synopsis: mangaData.synopsis,
        totalVolumes: mangaData.totalVolumes,
      },
    });

    for (const volNum of mangaData.volumes) {
      const volume = await prisma.volume.create({
        data: { mangaId: manga.id, number: volNum, title: `Volume ${volNum}` },
      });

      const basePrice = getBasePrice(mangaData.name, volNum);

      const paniniUri = `https://panini.com.br${paniniSlug(mangaData.name)}-vol-${volNum}`;
      const paniniLink = await prisma.productLink.create({
        data: { volumeId: volume.id, storeId: panini.id, url: paniniUri, lastScraped: new Date() },
      });
      await createPriceHistory(paniniLink.id, basePrice);

      const amazonUri = `https://www.amazon.com.br/s?k=${amazonQuery(mangaData.name, volNum)}`;
      const amazonLink = await prisma.productLink.create({
        data: { volumeId: volume.id, storeId: amazon.id, url: amazonUri, lastScraped: new Date() },
      });
      await createPriceHistory(amazonLink.id, basePrice);
    }
  }

  console.log('Seed concluído!');
}

function getBasePrice(mangaName: string, volume: number): number {
  const prices: Record<string, number> = {
    'Attack on Titan': 43.9,
    'Jujutsu Kaisen': 43.9,
    'Demon Slayer': 43.9,
    'One Piece': 41.9,
    'Berserk': 40.9,
    'Vagabond': 43.9,
    "Hell's Paradise": 43.9,
    'Chainsaw Man': 34.9,
    'Monster': 40.9,
    'Goodbye, Eri': 42.9,
  };

  const base = prices[mangaName] || 43.9;

  if (volume > 20) return base - 1;
  if (volume < 5) return base + 1;
  return base;
}

function paniniSlug(name: string): string {
  const slugs: Record<string, string> = {
    'Attack on Titan': '/ataque-dos-titas',
    'Jujutsu Kaisen': '/jujutsu-kaisen',
    'Demon Slayer': '/demon-slayer-kimetsu-no-yaiba',
    'One Piece': '/one-piece',
    'Berserk': '/berserk',
    'Vagabond': '/vagabond',
    "Hell's Paradise": '/jigokuraku',
    'Chainsaw Man': '/chainsaw-man',
    'Monster': '/monster',
    'Goodbye, Eri': '/goodbye-eri',
  };
  return slugs[name] || `/planet-manga/${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
}

const AMAZON_PT: Record<string, string> = {
  'Attack on Titan': 'Ataque dos Titãs',
  'Demon Slayer': 'Demon Slayer',
  "Hell's Paradise": 'Hell\'s Paradise',
  'Goodbye, Eri': 'Adeus Eri',
  'Jujutsu Kaisen': 'Jujutsu Kaisen',
};

function amazonQuery(name: string, volume: number): string {
  const pt = AMAZON_PT[name] || name;
  return encodeURIComponent(`${pt} volume ${volume}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
