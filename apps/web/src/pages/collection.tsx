import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Link, Navigate } from 'react-router-dom';
import { isAuthenticated } from '../lib/auth';
import type { Collection, CollectionStats } from '@mangatracker/shared';
import { useState } from 'react';

export function CollectionPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<string>('ALL');

  const { data: items, isLoading } = useQuery({
    queryKey: ['collection'],
    queryFn: () => api.get<(Collection & { volume: { manga: { name: string }; number: number } })[]>('/collection'),
    enabled: isAuthenticated(),
  });

  const stats = useQuery({
    queryKey: ['collection-stats'],
    queryFn: () => api.get<CollectionStats>('/collection/stats'),
    enabled: isAuthenticated(),
  });

  const updateStatus = useMutation({
    mutationFn: (body: { volumeId: string; status: string }) =>
      api.post('/collection', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collection'] });
      queryClient.invalidateQueries({ queryKey: ['collection-stats'] });
    },
  });

  const removeItem = useMutation({
    mutationFn: (volumeId: string) => api.delete(`/collection/${volumeId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collection'] });
      queryClient.invalidateQueries({ queryKey: ['collection-stats'] });
    },
  });

  if (!isAuthenticated()) return <Navigate to="/login" />;

  const statusLabels: Record<string, string> = {
    OWNED: 'Tenho',
    MISSING: 'Faltando',
    DESIRED: 'Desejado',
  };

  const statusVariants: Record<string, 'accent' | 'danger' | 'default'> = {
    OWNED: 'accent',
    MISSING: 'danger',
    DESIRED: 'default',
  };

  const filtered = filter === 'ALL' ? items : items?.filter((i) => i.status === filter);

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>
        Minha Coleção
      </h1>

      {stats.data && (
        <div
          style={{
            display: 'flex',
            gap: '1.5rem',
            marginBottom: '1.5rem',
            padding: '1rem',
            borderRadius: '8px',
          }}
        >
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-base-600)' }}>Progresso</span>
            <div style={{ marginTop: '0.5rem', fontSize: '1.25rem', fontWeight: 700 }}>
              {stats.data.completionPercent}%
            </div>
            <div
              style={{
                width: '200px',
                height: '4px',
                backgroundColor: 'var(--color-base-300)',
                borderRadius: '2px',
                marginTop: '0.25rem',
              }}
            >
              <div
                style={{
                  width: `${stats.data.completionPercent}%`,
                  height: '100%',
                  backgroundColor: 'var(--color-accent)',
                  borderRadius: '2px',
                }}
              />
            </div>
          </div>
          <div style={{ fontSize: '0.875rem' }}>
            <div><strong>{stats.data.ownedVolumes}</strong> <span style={{ color: 'var(--color-base-600)' }}>possuídos</span></div>
            <div><strong>{stats.data.missingVolumes}</strong> <span style={{ color: 'var(--color-base-600)' }}>faltando</span></div>
            <div><strong>{stats.data.desiredVolumes}</strong> <span style={{ color: 'var(--color-base-600)' }}>desejados</span></div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        {['ALL', 'OWNED', 'MISSING', 'DESIRED'].map((f) => (
          <Button
            key={f}
            variant={filter === f ? 'primary' : 'secondary'}
            onClick={() => setFilter(f)}
          >
            {f === 'ALL' ? 'Todos' : statusLabels[f]}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <p style={{ color: 'var(--color-base-500)' }}>Carregando...</p>
      ) : filtered?.length ? (
        <table>
          <thead>
            <tr>
              <th>Mangá</th>
              <th>Volume</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered!.map((item) => (
              <tr key={item.id}>
                <td>
                  <Link to={`/volume/${item.volumeId}`} style={{ fontWeight: 500 }}>
                    {item.volume.manga.name}
                  </Link>
                </td>
                <td>Vol. {item.volume.number}</td>
                <td>
                  <Badge variant={statusVariants[item.status]}>
                    {statusLabels[item.status]}
                  </Badge>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'flex-end' }}>
                    {['OWNED', 'MISSING', 'DESIRED'].map((s) => (
                      <Button
                        key={s}
                        variant="ghost"
                        onClick={() =>
                          updateStatus.mutate({ volumeId: item.volumeId, status: s })
                        }
                      >
                        {statusLabels[s][0]}
                      </Button>
                    ))}
                    <Button variant="ghost" onClick={() => removeItem.mutate(item.volumeId)}>
                      ×
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p style={{ color: 'var(--color-base-500)', fontSize: '0.875rem' }}>
          Nenhum volume na coleção ainda. Explore e adicione volumes.
        </p>
      )}
    </div>
  );
}
