import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import { Badge } from '../components/ui/badge';
import { Select } from '../components/ui/select';

interface MangaItem {
  id: string;
  name: string;
  slug: string;
  altName: string | null;
  publisher: string;
  status: string;
  totalVolumes: number;
}

interface ExploreResponse {
  data: MangaItem[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

const statusLabels: Record<string, string> = {
  ONGOING: 'Em andamento',
  FINISHED: 'Concluído',
  CANCELLED: 'Cancelado',
  HIATUS: 'Hiato',
};

const publishers = ['Panini', 'JBC', 'NewPOP'];

export function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get('search') || '';
  const publisher = searchParams.get('publisher') || '';
  const status = searchParams.get('status') || '';
  const page = parseInt(searchParams.get('page') || '1');

  const { data, isLoading } = useQuery({
    queryKey: ['mangas', search, publisher, status, page],
    queryFn: () => {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (publisher) params.set('publisher', publisher);
      if (status) params.set('status', status);
      params.set('page', String(page));
      params.set('limit', '20');
      return api.getFull<ExploreResponse>(`/mangas?${params}`);
    },
  });

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page');
    setSearchParams(next);
  }

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: search ? '0.5rem' : '0' }}>
          Explorar Mangás
        </h1>
        {search && (
          <p style={{ color: 'var(--color-base-500)', fontSize: '0.875rem' }}>
            Resultados para "<strong>{search}</strong>"
            {' '}
            <button
              onClick={() => setParam('search', '')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-base-400)',
                cursor: 'pointer',
                fontSize: '0.8125rem',
                fontFamily: 'inherit',
                textDecoration: 'underline',
              }}
            >
              limpar
            </button>
          </p>
        )}
      </div>

      <div
        style={{
          display: 'flex',
          gap: '0.75rem',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
        }}
      >
        <Select
          value={publisher || ''}
          onChange={(e) => setParam('publisher', e.target.value)}
        >
          <option value="">Todas editoras</option>
          {publishers.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </Select>
        <Select
          value={status || ''}
          onChange={(e) => setParam('status', e.target.value)}
        >
          <option value="">Todos status</option>
          {Object.entries(statusLabels).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </Select>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} style={{ height: 72, background: 'var(--color-base-100)', borderRadius: '8px' }} />
          ))}
        </div>
      ) : data?.data.length ? (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {data.data.map((manga) => (
              <Link
                key={manga.id}
                to={`/manga/${manga.slug}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '0.75rem',
                  borderRadius: '8px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-base-50)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 50,
                    background: 'var(--color-base-100)',
                    borderRadius: 4,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'var(--color-base-500)',
                    flexShrink: 0,
                  }}
                >
                  {manga.name[0]}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{manga.name}</div>
                  <div style={{ color: 'var(--color-base-500)', fontSize: '0.8125rem', marginTop: 2 }}>
                    {manga.publisher} · {manga.totalVolumes} volumes
                    {manga.altName && ` · ${manga.altName}`}
                  </div>
                </div>
                <Badge variant={manga.status === 'FINISHED' ? 'muted' : 'default'}>
                  {statusLabels[manga.status] || manga.status}
                </Badge>
              </Link>
            ))}
          </div>

          {data.meta.totalPages > 1 && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '0.5rem',
                marginTop: '1.5rem',
              }}
            >
              {Array.from({ length: Math.min(data.meta.totalPages, 10) }, (_, i) => i + 1).map(
                (p) => (
                  <button
                    key={p}
                    onClick={() => setParam('page', String(p))}
                    style={{
                      padding: '0.375rem 0.75rem',
                      border: `1px solid ${p === page ? 'var(--color-btn-primary-bg)' : 'var(--color-base-200)'}`,
                      borderRadius: '4px',
                      background: p === page ? 'var(--color-btn-primary-bg)' : 'transparent',
                      color: p === page ? 'var(--color-btn-primary-text)' : 'var(--color-base-600)',
                      fontSize: '0.8125rem',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    {p}
                  </button>
                ),
              )}
            </div>
          )}
        </>
      ) : (
        <p style={{ color: 'var(--color-base-400)', fontSize: '0.875rem' }}>
          Nenhum mangá encontrado.
        </p>
      )}
    </div>
  );
}
