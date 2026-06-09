import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Navigate, useNavigate } from 'react-router-dom';
import { isAuthenticated, clearAuth } from '../lib/auth';
import { useState } from 'react';
import { LogOut } from 'lucide-react';
import type { Alert } from '@mangatracker/shared';

interface Store {
  id: string;
  name: string;
  slug: string;
  url: string;
  active: boolean;
}

export function SettingsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [volumeId, setVolumeId] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [direction, setDirection] = useState('BELOW');

  const { data: alerts, isLoading: alertsLoading } = useQuery({
    queryKey: ['alerts'],
    queryFn: () =>
      api.get<(Alert & { volume: { manga: { name: string }; number: number } })[]>('/alerts'),
    enabled: isAuthenticated(),
  });

  const { data: stores } = useQuery({
    queryKey: ['stores'],
    queryFn: () => api.get<Store[]>('/stores'),
  });

  const createAlert = useMutation({
    mutationFn: (body: { volumeId: string; targetPrice: number; direction: string }) =>
      api.post('/alerts', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      setShowForm(false);
      setVolumeId('');
      setTargetPrice('');
    },
  });

  const deleteAlert = useMutation({
    mutationFn: (id: string) => api.delete(`/alerts/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['alerts'] }),
  });

  const toggleStore = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      api.patch(`/stores/${id}`, { active }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['stores'] }),
  });

  if (!isAuthenticated()) return <Navigate to="/login" />;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!volumeId || !targetPrice) return;
    createAlert.mutate({ volumeId, targetPrice: parseFloat(targetPrice), direction });
  };

  const handleLogout = () => {
    if (confirm('Tem certeza que deseja sair?')) {
      clearAuth();
      navigate('/login');
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
        Configurações
      </h1>
      <p style={{ color: 'var(--color-base-500)', fontSize: '0.875rem', marginBottom: '2rem' }}>
        Gerencie suas preferências
      </p>

      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>
          Lojas Ativas
        </h2>
        <p style={{ color: 'var(--color-base-500)', fontSize: '0.8125rem', marginBottom: '0.75rem' }}>
          Desative lojas para ignorá-las no scraping e na exibição de preços.
        </p>
        {stores ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {stores.map((store) => (
              <div
                key={store.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem',
                  borderRadius: '8px',
                }}
              >
                <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>{store.name}</span>
                <button
                  onClick={() => toggleStore.mutate({ id: store.id, active: !store.active })}
                  style={{
                    width: 44,
                    height: 24,
                    borderRadius: 12,
                    border: 'none',
                    cursor: 'pointer',
                    position: 'relative',
                    backgroundColor: store.active ? 'var(--color-accent)' : 'var(--color-base-300)',
                    transition: 'background-color 0.2s',
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      top: 2,
                      left: store.active ? 22 : 2,
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      backgroundColor: '#fff',
                      transition: 'left 0.2s',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                    }}
                  />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--color-base-400)', fontSize: '0.8125rem' }}>Carregando...</p>
        )}
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid var(--color-base-200)', margin: '2rem 0' }} />

      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600 }}>Alertas de Preço</h2>
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancelar' : 'Novo Alerta'}
          </Button>
        </div>

        {showForm && (
          <form
            onSubmit={handleSubmit}
            style={{
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1rem',
              display: 'flex',
              gap: '0.75rem',
              flexWrap: 'wrap',
              alignItems: 'flex-end',
            }}
          >
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-base-500)', marginBottom: '0.25rem' }}>
                ID do Volume
              </label>
              <input
                type="text"
                value={volumeId}
                onChange={(e) => setVolumeId(e.target.value)}
                placeholder="volume-id"
                style={{
                  padding: '0.5rem',
                  border: '1.5px solid var(--color-base-400)',
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                  fontFamily: 'inherit',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-base-500)', marginBottom: '0.25rem' }}>
                Preço Alvo (R$)
              </label>
              <input
                type="number"
                step="0.01"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                placeholder="29.90"
                style={{
                  padding: '0.5rem',
                  border: '1.5px solid var(--color-base-400)',
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                  fontFamily: 'inherit',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-base-500)', marginBottom: '0.25rem' }}>
                Direção
              </label>
              <select
                value={direction}
                onChange={(e) => setDirection(e.target.value)}
                style={{
                  padding: '0.5rem',
                  border: '1.5px solid var(--color-base-400)',
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                  fontFamily: 'inherit',
                }}
              >
                <option value="BELOW">Abaixo de</option>
                <option value="ABOVE">Acima de</option>
              </select>
            </div>
            <Button type="submit" disabled={createAlert.isPending}>
              {createAlert.isPending ? 'Criando...' : 'Criar Alerta'}
            </Button>
          </form>
        )}

        {alertsLoading ? (
          <p style={{ color: 'var(--color-base-400)' }}>Carregando...</p>
        ) : alerts?.length ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {alerts.map((alert) => (
              <div
                key={alert.id}
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
                  <span style={{ fontWeight: 500 }}>
                    {alert.volume.manga.name} Vol. {alert.volume.number}
                  </span>
                  <span style={{ marginLeft: '0.75rem', fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}>
                    {alert.direction === 'BELOW' ? '<' : '>'} R$ {Number(alert.targetPrice).toFixed(2)}
                  </span>
                  <Badge variant={alert.active ? 'accent' : 'muted'} style={{ marginLeft: '0.5rem' }}>
                    {alert.active ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
                <Button variant="ghost" onClick={() => deleteAlert.mutate(alert.id)}>
                  Remover
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--color-base-400)', fontSize: '0.875rem' }}>
            Nenhum alerta cadastrado.
          </p>
        )}
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid var(--color-base-200)', margin: '2rem 0' }} />

      <div style={{ borderRadius: '8px', padding: '1rem', backgroundColor: 'var(--color-danger-muted)' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--color-danger)' }}>Sair da Conta</h2>
        <p style={{ color: 'var(--color-danger)', fontSize: '0.875rem', marginBottom: '0.75rem', opacity: 0.8 }}>
          Você será desconectado e redirecionado para a página de login.
        </p>
        <Button variant="danger" onClick={handleLogout}>
          <LogOut size={16} />
          Sair
        </Button>
      </div>
    </div>
  );
}
