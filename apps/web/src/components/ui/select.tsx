import { type SelectHTMLAttributes, useId } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode;
  label?: string;
}

const arrowSvg =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23495057' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E";

export function Select({ children, style, label, value, ...props }: SelectProps) {
  const uid = useId();

  return (
    <div>
      {label && (
        <label
          htmlFor={uid}
          style={{
            display: 'block',
            fontSize: '0.6875rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--color-base-500)',
            marginBottom: '0.25rem',
          }}
        >
          {label}
        </label>
      )}
      <div
        style={{
          position: 'relative',
          border: '1.5px solid var(--color-base-400)',
          borderRadius: '6px',
            background: 'var(--color-surface)',
          overflow: 'hidden',
          transition: 'border-color 0.15s',
          ...style,
        }}
      >
        <select
          id={uid}
          value={value}
          {...props}
          style={{
            border: 'none',
            borderRadius: '6px',
            width: '100%',
            padding: '0.5rem 2rem 0.5rem 0.75rem',
            fontFamily: 'inherit',
            fontSize: '0.875rem',
          background: 'var(--color-surface)',
            color: value ? 'var(--color-base-900)' : 'var(--color-base-500)',
            outline: 'none',
            appearance: 'none',
            cursor: 'pointer',
          }}
        >
          {children}
        </select>
        <div
          style={{
            position: 'absolute',
            right: '0.625rem',
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
            width: '1rem',
            height: '1rem',
            backgroundImage: `url("${arrowSvg}")`,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
          }}
        />
      </div>
    </div>
  );
}
