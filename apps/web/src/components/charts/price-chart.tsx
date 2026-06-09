import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
interface PriceHistoryPoint {
  price: number;
  storeSlug: string;
  storeName: string;
  scrapedAt: string | Date;
}

interface Props {
  data: PriceHistoryPoint[];
}

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

export function VolumePriceChart({ data }: Props) {
  const storeSlugs = [...new Set(data.map((d) => d.storeSlug))];

  const colors = ['#2b8a3e', '#1971c2', '#e67700', '#cc5de8'];

  const grouped = data.reduce(
    (acc, point) => {
      const key = point.scrapedAt.toString();
      if (!acc[key]) acc[key] = { date: key };
      acc[key][point.storeSlug] = point.price;
      return acc;
    },
    {} as Record<string, any>,
  );

  const chartData = Object.values(grouped).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  return (
    <div
      style={{
        border: '1px solid var(--color-base-200)',
        borderRadius: '8px',
        padding: '1rem',
      }}
    >
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-base-300)" />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            tick={{ fontSize: 11, fill: 'var(--color-base-500)' }}
            stroke="var(--color-base-400)"
          />
          <YAxis
            tick={{ fontSize: 11, fill: 'var(--color-base-500)' }}
            stroke="var(--color-base-400)"
            tickFormatter={(v: number) => `R$${v.toFixed(0)}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-base-300)',
              borderRadius: '6px',
              fontSize: '0.8125rem',
            }}
          />
          {storeSlugs.map((slug, i) => (
            <Line
              key={slug}
              type="monotone"
              dataKey={slug}
              stroke={colors[i % colors.length]}
              strokeWidth={1.5}
              dot={false}
              name={slug === 'amazon' ? 'Amazon' : slug === 'mercado-livre' ? 'Mercado Livre' : slug}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
