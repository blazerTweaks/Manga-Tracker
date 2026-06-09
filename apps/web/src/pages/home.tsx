import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Link } from 'react-router-dom';
import { Badge } from '../components/ui/badge';
interface PromotionData {
  volumeId: string;
  mangaName: string;
  volumeNumber: number;
  storeName: string;
  currentPrice: number;
  previousPrice: number;
  dropPercent: number;
  storeSlug: string;
}

interface DropData {
  volumeId: string;
  mangaName: string;
  volumeNumber: number;
  previousPrice: number;
  currentPrice: number;
  dropPercent: number;
  storeName: string;
  storeSlug: string;
}

export function HomePage() {
  const promotions = useQuery({
    queryKey: ['dashboard', 'promotions'],
    queryFn: () => api.get<PromotionData[]>('/dashboard/promotions'),
  });

  const drops = useQuery({
    queryKey: ['dashboard', 'drops'],
    queryFn: () => api.get<DropData[]>('/dashboard/biggest-drops'),
  });

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
        Início
      </h1>
      <p style={{ color: 'var(--color-base-500)', fontSize: '0.875rem', marginBottom: '2rem' }}>
        Promoções e destaques do dia
      </p>

      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>
          Promoções do Dia
        </h2>
        {promotions.isLoading ? (
          <p style={{ color: 'var(--color-base-400)', fontSize: '0.875rem' }}>Carregando...</p>
        ) : promotions.data?.length ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {promotions.data.map((p, i) => (
              <Link
                key={i}
                to={`/volume/${p.volumeId}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-base-50)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <Badge variant="accent">-{(p as any).dropPercent}%</Badge>
                <span style={{ fontWeight: 500, flex: 1 }}>
                  {p.mangaName} Vol. {p.volumeNumber}
                </span>
                <span style={{ color: 'var(--color-base-500)', fontSize: '0.8125rem' }}>
                  {p.storeName}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                  R$ {p.currentPrice.toFixed(2)}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--color-base-400)', fontSize: '0.875rem' }}>
            Nenhuma promoção no momento
          </p>
        )}
      </section>

      <section>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>
          Maiores Quedas de Preço
        </h2>
        {drops.isLoading ? (
          <p style={{ color: 'var(--color-base-400)', fontSize: '0.875rem' }}>Carregando...</p>
        ) : drops.data?.length ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {drops.data.map((d, i) => (
              <Link
                key={i}
                to={`/volume/${d.volumeId}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-base-50)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <Badge variant="accent">-{(d as any).dropPercent}%</Badge>
                <span style={{ fontWeight: 500, flex: 1 }}>
                  {d.mangaName} Vol. {d.volumeNumber}
                </span>
                <span style={{ color: 'var(--color-base-500)', fontSize: '0.8125rem' }}>
                  {d.storeName}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>
                  R$ {d.previousPrice.toFixed(2)} →{' '}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                  R$ {d.currentPrice.toFixed(2)}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--color-base-400)', fontSize: '0.875rem' }}>
            Nenhuma queda significativa hoje
          </p>
        )}
      </section>
    </div>
  );
}
