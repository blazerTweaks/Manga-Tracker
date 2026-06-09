import { Link, useNavigate } from 'react-router-dom';
import { isAuthenticated, getUser } from '../../lib/auth';
import { useTheme } from '../../lib/theme';
import { useState } from 'react';
import { Search, Sun, Moon } from 'lucide-react';

export function TopBar() {
  const navigate = useNavigate();
  const authenticated = isAuthenticated();
  const user = getUser();
  const { theme, toggleTheme } = useTheme();
  const [search, setSearch] = useState('');

  const handleSearch = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && search.trim()) {
      navigate(`/explorar?search=${encodeURIComponent(search.trim())}`);
    }
  };

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.75rem 2rem',
      }}
    >
      <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
        <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-base-400)', pointerEvents: 'none' }} />
        <input
          type="text"
          placeholder="Buscar mangá..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleSearch}
          style={{ width: '100%', paddingLeft: '2.25rem', border: 'none', backgroundColor: 'var(--color-base-100)' }}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={toggleTheme}
          title={theme === 'light' ? 'Modo escuro' : 'Modo claro'}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--color-base-500)',
            padding: '0.25rem',
          }}
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
        {authenticated ? (
          <span style={{ fontSize: '0.875rem', color: 'var(--color-base-600)' }}>
            {user?.name || user?.email}
          </span>
        ) : (
          <Link
            to="/login"
            style={{
              fontSize: '0.875rem',
              fontWeight: 500,
              color: 'var(--color-base-700)',
            }}
          >
            Entrar
          </Link>
        )}
      </div>
    </header>
  );
}
