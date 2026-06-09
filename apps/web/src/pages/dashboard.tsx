import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Link } from 'react-router-dom';
import { Badge } from '../components/ui/badge';

export function DashboardPage() {
  const stats = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () =>
      api.get<{
        mangaCount: number;
        volumeCount: number;
        priceCount: number;
        storeCount: number;
      }>('/dashboard/stats'),
  });

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>
        Dashboard
      </h1>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <StatCard label="Mangás" value={stats.data?.mangaCount ?? '-'} />
        <StatCard label="Volumes" value={stats.data?.volumeCount ?? '-'} />
        <StatCard label="Registros de Preço" value={stats.data?.priceCount ?? '-'} />
        <StatCard label="Lojas" value={stats.data?.storeCount ?? '-'} />
      </div>

      <p style={{ color: 'var(--color-base-500)', fontSize: '0.875rem' }}>
        Explore os mangás na página <Link to="/explorar" style={{ fontWeight: 500, color: 'var(--color-base-700)', textDecoration: 'underline' }}>Explorar</Link>.
      </p>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div
      style={{
        padding: '1rem',
        borderRadius: '8px',
        transition: 'background-color 0.15s',
      }}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-base-50)'}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
    >
      <p style={{ fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-base-500)', marginBottom: '0.25rem' }}>
        {label}
      </p>
      <p style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
        {value}
      </p>
    </div>
  );
}
