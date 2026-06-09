import { type ReactNode, useRef } from 'react';

interface ButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
  style?: React.CSSProperties;
  title?: string;
}

const variants: Record<string, React.CSSProperties> = {
  primary: {
    backgroundColor: 'var(--color-btn-primary-bg)',
    color: 'var(--color-btn-primary-text)',
    border: 'none',
  },
  secondary: {
    backgroundColor: 'var(--color-base-100)',
    color: 'var(--color-base-700)',
  },
  ghost: {
    backgroundColor: 'transparent',
    color: 'var(--color-base-600)',
    border: 'none',
  },
  danger: {
    backgroundColor: 'var(--color-danger)',
    color: 'var(--color-btn-danger-text)',
    border: 'none',
  },
};

export function Button({
  children,
  variant = 'primary',
  onClick,
  type = 'button',
  disabled,
  style,
}: ButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);

  const handleFocus = () => {
    if (variant === 'ghost' || variant === 'secondary') {
      ref.current!.style.backgroundColor = 'var(--color-base-50)';
    }
  };

  const handleBlur = () => {
    if (variant === 'ghost') {
      ref.current!.style.backgroundColor = 'transparent';
    } else if (variant === 'secondary') {
      ref.current!.style.backgroundColor = 'var(--color-base-100)';
    }
  };

  return (
    <button
      ref={ref}
      type={type}
      onClick={onClick}
      disabled={disabled}
      onFocus={handleFocus}
      onBlur={handleBlur}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.375rem',
        padding: '0.5rem 1rem',
        borderRadius: '6px',
        fontSize: '0.8125rem',
        fontWeight: 500,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        outline: 'none',
        fontFamily: 'inherit',
        ...variants[variant],
        ...style,
      }}
    >
      {children}
    </button>
  );
}
