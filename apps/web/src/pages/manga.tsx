import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { isAuthenticated } from '../lib/auth';

interface StoreInfo {
  id: string;
  name: string;
  slug: string;
  active: boolean;
}

interface PriceRecordInfo {
  id: string;
  price: number;
  available: boolean;
  scrapedAt: string;
}

interface ProductLinkInfo {
  id: string;
  storeId: string;
  store: StoreInfo;
  priceRecords: PriceRecordInfo[];
  active: boolean;
  url: string;
}

interface VolumeInfo {
  id: string;
  number: number;
  title: string | null;
  productLinks: ProductLinkInfo[];
}

interface MangaDetail {
  id: string;
  name: string;
  altName: string | null;
  publisher: string;
  status: string;
  synopsis: string | null;
  coverUrl: string | null;
  totalVolumes: number;
  slug: string;
  volumes: VolumeInfo[];
}

export function MangaPage() {
  const { slug } = useParams();
  const queryClient = useQueryClient();
  const authenticated = isAuthenticated();

  const { data, isLoading } = useQuery({
    queryKey: ['manga', slug],
    queryFn: () => api.get<MangaDetail>(`/mangas/${slug}`),
  });

  const addWishlist = useMutation({
    mutationFn: (volumeId: string) => api.post('/wishlist', { volumeId }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wishlist'] }),
  });

  const addCollection = useMutation({
    mutationFn: ({ volumeId, status }: { volumeId: string; status: string }) =>
      api.post('/collection', { volumeId, status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['collection'] }),
  });

  const statusLabels: Record<string, string> = {
    ONGOING: 'Em andamento',
    FINISHED: 'Concluído',
    CANCELLED: 'Cancelado',
    HIATUS: 'Hiato',
  };

  if (isLoading) {
    return (
      <div>
        <div style={{ height: 24, width: '60%', background: 'var(--color-base-100)', borderRadius: 4, marginBottom: 16 }} />
        <div style={{ height: 16, width: '40%', background: 'var(--color-base-100)', borderRadius: 4, marginBottom: 32 }} />
        <div style={{ height: 400, background: 'var(--color-base-100)', borderRadius: 8 }} />
      </div>
    );
  }

  if (!data) return <p>Mangá não encontrado</p>;

  const stores = data.volumes[0]?.productLinks?.map((pl) => pl.store).filter(Boolean) || [];

  const allPrices = data.volumes
    .flatMap((v) => v.productLinks)
    .filter((pl) => pl.priceRecords[0]?.available)
    .map((pl) => Number(pl.priceRecords[0].price));

  const globalLowest = allPrices.length ? Math.min(...allPrices) : null;

  function getPriceCellClass(price: number | null): React.CSSProperties {
    if (price === null) return {};
    if (globalLowest !== null && price === globalLowest) {
      return { fontWeight: 700, color: 'var(--color-accent)' };
    }
    return {};
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
        <div style={{ width: 160, flexShrink: 0 }}>
          <div
            style={{
              width: 160,
              height: 224,
              background: 'var(--color-base-100)',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              color: 'var(--color-base-300)',
            }}
          >
            {data.name[0]}
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>
            {data.name}
          </h1>
          {data.altName && (
            <p style={{ color: 'var(--color-base-500)', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
              {data.altName}
            </p>
          )}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <Badge>{data.publisher}</Badge>
            <Badge variant={data.status === 'FINISHED' ? 'muted' : 'default'}>
              {statusLabels[data.status]}
            </Badge>
            <Badge variant="muted">{data.totalVolumes} volumes</Badge>
          </div>
          {data.synopsis && (
            <p style={{ fontSize: '0.875rem', lineHeight: 1.6, color: 'var(--color-base-600)', maxWidth: '600px' }}>
              {data.synopsis}
            </p>
          )}
        </div>
      </div>

      <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 600 }}>Volumes</h2>
        <span style={{ fontSize: '0.8125rem', color: 'var(--color-base-500)' }}>
          {data.volumes.length} de {data.totalVolumes}
        </span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th style={{ width: '48px' }}>Nº</th>
              <th>Volume</th>
              {stores.map((store) => (
                <th key={store.id} style={{ textAlign: 'right', minWidth: 110 }}>
                  {store.name}
                </th>
              ))}
              <th style={{ textAlign: 'right', minWidth: 110 }}>Menor Preço</th>
              {authenticated && <th style={{ textAlign: 'right', width: 120 }}>Ações</th>}
            </tr>
          </thead>
          <tbody>
            {data.volumes.map((vol) => {
              const prices = vol.productLinks
                .filter((pl) => pl.priceRecords[0]?.available)
                .map((pl) => Number(pl.priceRecords[0].price));

              const lowestPrice = prices.length ? Math.min(...prices) : null;

              return (
                <tr key={vol.id}>
                  <td style={{ color: 'var(--color-base-500)', fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>
                    {String(vol.number).padStart(2, '0')}
                  </td>
                  <td>
                    <Link
                      to={`/volume/${vol.id}`}
                      style={{ fontWeight: 500, fontSize: '0.875rem' }}
                    >
                      {vol.title || `Volume ${vol.number}`}
                    </Link>
                  </td>
                  {stores.map((store) => {
                    const match = vol.productLinks?.find(
                      (vpl) => (vpl.store?.id || vpl.storeId) === store.id,
                    );
                    const record = match?.priceRecords?.[0];
                    const price = record?.available ? Number(record.price) : null;
                    return (
                      <td
                        key={store.id}
                        style={{
                          textAlign: 'right',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.8125rem',
                          ...getPriceCellClass(price),
                        }}
                      >
                        {match?.url ? (
                          <a
                            href={match.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              color: 'inherit',
                              textDecoration: 'none',
                              ...getPriceCellClass(price),
                            }}
                            title={`Ir para ${store.name}`}
                          >
                            {price !== null ? `R$ ${price.toFixed(2)}` : '-'}
                          </a>
                        ) : (
                          price !== null ? `R$ ${price.toFixed(2)}` : '-'
                        )}
                      </td>
                    );
                  })}
                  <td
                    style={{
                      textAlign: 'right',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      color: 'var(--color-accent)',
                      fontSize: '0.875rem',
                    }}
                  >
                    {lowestPrice ? `R$ ${lowestPrice.toFixed(2)}` : '-'}
                  </td>
                  {authenticated && (
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'flex-end' }}>
                        <Button
                          variant="ghost"
                          onClick={() => addWishlist.mutate(vol.id)}
                          title="Adicionar à wishlist"
                        >
                          ★
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() =>
                            addCollection.mutate({ volumeId: vol.id, status: 'OWNED' })
                          }
                          title="Tenho este volume"
                        >
                          ✓
                        </Button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
