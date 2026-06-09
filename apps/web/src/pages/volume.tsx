import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { VolumePriceChart } from '../components/charts/price-chart';
import { isAuthenticated } from '../lib/auth';

interface StoreInfo {
  id: string;
  name: string;
  slug: string;
  active: boolean;
}

interface MangaInfo {
  id: string;
  name: string;
  slug: string;
  publisher: string;
}

interface PriceInfo {
  store: StoreInfo;
  currentPrice: number | null;
  available: boolean;
  url: string;
  lastScraped: string | null;
}

interface VolumeInfo {
  id: string;
  number: number;
  title: string | null;
  manga: MangaInfo;
}

interface VolumePricesData {
  volume: VolumeInfo;
  prices: PriceInfo[];
  stats: {
    lowestPrice: number | null;
    highestPrice: number | null;
    averagePrice: number | null;
    currentPrice: number | null;
  };
}

interface PriceHistoryPoint {
  price: number;
  storeSlug: string;
  storeName: string;
  scrapedAt: string | Date;
}

export function VolumePage() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const authenticated = isAuthenticated();

  const { data: volumeData, isLoading } = useQuery({
    queryKey: ['volume', id],
    queryFn: () => api.get<VolumePricesData>(`/volumes/${id}`),
  });

  const { data: historyData } = useQuery({
    queryKey: ['volume-history', id],
    queryFn: () => api.get<PriceHistoryPoint[]>(`/volumes/${id}/history`),
  });

  const addWishlist = useMutation({
    mutationFn: () => api.post('/wishlist', { volumeId: id }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wishlist'] }),
  });

  const addCollection = useMutation({
    mutationFn: (status: string) => api.post('/collection', { volumeId: id, status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['collection'] }),
  });

  if (isLoading) {
    return (
      <div>
        <div style={{ height: 16, width: 200, background: 'var(--color-base-100)', borderRadius: 4, marginBottom: 8 }} />
        <div style={{ height: 28, width: 300, background: 'var(--color-base-100)', borderRadius: 4, marginBottom: 24 }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, height: 80, background: 'var(--color-base-300)', borderRadius: 8, overflow: 'hidden' }} />
      </div>
    );
  }

  if (!volumeData) return <p>Volume não encontrado</p>;

  const { volume: vol, prices, stats } = volumeData;

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link
          to={`/manga/${vol.manga.slug}`}
          style={{ color: 'var(--color-base-500)', fontSize: '0.8125rem', marginBottom: '0.25rem', display: 'block' }}
        >
          {vol.manga.name}
        </Link>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>
          {vol.title || `Volume ${vol.number}`}
        </h1>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1px',
          backgroundColor: 'var(--color-base-200)',
          border: '1px solid var(--color-base-200)',
          borderRadius: '8px',
          overflow: 'hidden',
          marginBottom: '2rem',
        }}
      >
        <StatBox
          label="Preço Atual"
          value={stats.currentPrice ? `R$ ${stats.currentPrice.toFixed(2)}` : 'Indisponível'}
        />
        <StatBox
          label="Menor Preço (histórico)"
          value={stats.lowestPrice ? `R$ ${stats.lowestPrice.toFixed(2)}` : '-'}
          accent
        />
        <StatBox label="Maior Preço" value={stats.highestPrice ? `R$ ${stats.highestPrice.toFixed(2)}` : '-'} />
        <StatBox label="Preço Médio" value={stats.averagePrice ? `R$ ${stats.averagePrice.toFixed(2)}` : '-'} />
      </div>

      {authenticated && (
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <Button variant="secondary" onClick={() => addWishlist.mutate()}>
            ★ Adicionar à Wishlist
          </Button>
          <Button variant="secondary" onClick={() => addCollection.mutate('OWNED')}>
            ✓ Marcar como Tenho
          </Button>
          <Button variant="secondary" onClick={() => addCollection.mutate('DESIRED')}>
            ○ Marcar como Desejado
          </Button>
        </div>
      )}

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>
          Lojas
        </h2>
        <table>
          <thead>
            <tr>
              <th>Loja</th>
              <th style={{ textAlign: 'right' }}>Preço</th>
              <th style={{ textAlign: 'right' }}>Disponibilidade</th>
              <th style={{ textAlign: 'right' }}>Última Atualização</th>
              <th style={{ textAlign: 'right' }}>Link</th>
            </tr>
          </thead>
          <tbody>
            {prices.map((p) => (
              <tr key={p.store.id}>
                <td style={{ fontWeight: 500 }}>{p.store.name}</td>
                <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: p.currentPrice === stats.lowestPrice ? 700 : 400 }}>
                  {p.currentPrice ? `R$ ${p.currentPrice.toFixed(2)}` : '-'}
                  {p.currentPrice === stats.lowestPrice && stats.lowestPrice !== null && (
                    <span style={{ color: 'var(--color-accent)', fontSize: '0.6875rem', marginLeft: 4 }}>
                      menor
                    </span>
                  )}
                </td>
                <td style={{ textAlign: 'right' }}>
                  <Badge variant={p.available ? 'accent' : 'danger'}>
                    {p.available ? 'Disponível' : 'Indisponível'}
                  </Badge>
                </td>
                <td style={{ textAlign: 'right', color: 'var(--color-base-500)', fontSize: '0.8125rem' }}>
                  {p.lastScraped
                    ? new Date(p.lastScraped).toLocaleDateString('pt-BR')
                    : '-'}
                </td>
                <td style={{ textAlign: 'right' }}>
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: '0.8125rem', color: 'var(--color-base-600)' }}
                  >
                    Visitar →
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {historyData && historyData.length > 0 && (
        <section>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>
            Histórico de Preços
          </h2>
          <VolumePriceChart data={historyData} />
        </section>
      )}
    </div>
  );
}

function StatBox({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div style={{ padding: '1rem', backgroundColor: 'var(--color-surface)' }}>
      <p
        style={{
          fontSize: '0.6875rem',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: 'var(--color-base-500)',
          marginBottom: '0.25rem',
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontSize: '1.25rem',
          fontWeight: 700,
          fontFamily: 'var(--font-mono)',
          color: accent ? 'var(--color-accent)' : 'var(--color-base-900)',
        }}
      >
        {value}
      </p>
    </div>
  );
}


