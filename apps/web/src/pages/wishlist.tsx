import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Button } from '../components/ui/button';
import { Link, Navigate } from 'react-router-dom';
import { isAuthenticated } from '../lib/auth';

export function WishlistPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: () =>
      api.get<
        { id: string; volumeId: string; volume: { manga: { name: string }; number: number; title: string | null } }[]
      >('/wishlist'),
    enabled: isAuthenticated(),
  });

  const remove = useMutation({
    mutationFn: (volumeId: string) => api.delete(`/wishlist/${volumeId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wishlist'] }),
  });

  if (!isAuthenticated()) return <Navigate to="/login" />;

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>
        Wishlist
      </h1>

      {isLoading ? (
        <p style={{ color: 'var(--color-base-400)' }}>Carregando...</p>
      ) : data?.length ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {data.map((item) => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem',
                borderRadius: '8px',
                transition: 'background-color 0.15s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-base-50)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <div>
                <Link to={`/volume/${item.volumeId}`} style={{ fontWeight: 500 }}>
                  {item.volume.manga.name} —{' '}
                  {item.volume.title || `Volume ${item.volume.number}`}
                </Link>
              </div>
              <Button variant="ghost" onClick={() => remove.mutate(item.volumeId)}>
                Remover
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ color: 'var(--color-base-400)', fontSize: '0.875rem' }}>
          Wishlist vazia. Adicione volumes durante a navegação.
        </p>
      )}
    </div>
  );
}
