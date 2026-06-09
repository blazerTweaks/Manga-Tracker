import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'accent' | 'danger' | 'muted';
  style?: React.CSSProperties;
}

const variants: Record<string, React.CSSProperties> = {
  default: {
    backgroundColor: 'var(--color-base-100)',
    color: 'var(--color-base-700)',
  },
  accent: {
    backgroundColor: 'var(--color-accent-muted)',
    color: 'var(--color-accent)',
  },
  danger: {
    backgroundColor: 'var(--color-danger-muted)',
    color: 'var(--color-danger)',
  },
  muted: {
    backgroundColor: 'var(--color-surface-secondary)',
    color: 'var(--color-base-500)',
  },
};

export function Badge({ children, variant = 'default' }: BadgeProps) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '0.125rem 0.5rem',
        borderRadius: '4px',
        fontSize: '0.75rem',
        fontWeight: 500,
        lineHeight: '1.25rem',
        ...variants[variant],
      }}
    >
      {children}
    </span>
  );
}
