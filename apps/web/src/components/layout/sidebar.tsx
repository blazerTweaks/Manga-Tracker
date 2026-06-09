import { Link, useLocation } from 'react-router-dom';
import { isAuthenticated } from '../../lib/auth';
import { Home, Search, LayoutDashboard, BookOpen, Heart, Settings } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Início', icon: Home },
  { href: '/explorar', label: 'Explorar', icon: Search },
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
];

const authItems = [
  { href: '/colecao', label: 'Coleção', icon: BookOpen },
  { href: '/wishlist', label: 'Wishlist', icon: Heart },
  { href: '/configuracoes', label: 'Configurações', icon: Settings },
];

export function Sidebar() {
  const location = useLocation();
  const authenticated = isAuthenticated();

  return (
    <aside
      style={{
        width: '220px',
        minWidth: '220px',
        borderRight: '1px solid var(--color-base-200)',
        padding: '0.75rem 1.5rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Link
        to="/"
        style={{
          fontWeight: 700,
          fontSize: '1.125rem',
          paddingTop: '0.5rem',
          marginBottom: '2rem',
          color: 'var(--color-base-900)',
        }}
      >
        MangaTracker
      </Link>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              style={{
                padding: '0.5rem 0.75rem',
                borderRadius: '6px',
                fontSize: '0.875rem',
                fontWeight: isActive ? 600 : 400,
                backgroundColor: isActive ? 'var(--color-base-100)' : 'transparent',
                color: isActive ? 'var(--color-base-900)' : 'var(--color-base-600)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
              onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = 'var(--color-base-100)'; }}
              onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              <item.icon size={16} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {authenticated && (
        <>
          <div
            style={{
              marginTop: '1.5rem',
              marginBottom: '0.5rem',
              fontSize: '0.6875rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--color-base-500)',
              padding: '0 0.75rem',
            }}
          >
            Biblioteca
          </div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {authItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
            <Link
              key={item.href}
              to={item.href}
              style={{
                padding: '0.5rem 0.75rem',
                borderRadius: '6px',
                fontSize: '0.875rem',
                fontWeight: isActive ? 600 : 400,
                backgroundColor: isActive ? 'var(--color-base-100)' : 'transparent',
                color: isActive ? 'var(--color-base-900)' : 'var(--color-base-600)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
              onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = 'var(--color-base-100)'; }}
              onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              <item.icon size={16} />
              {item.label}
            </Link>
              );
            })}
          </nav>
        </>
      )}
    </aside>
  );
}
