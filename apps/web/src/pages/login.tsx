import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { api } from '../lib/api';
import { setAuth, isAuthenticated } from '../lib/auth';
import { Button } from '../components/ui/button';

export function LoginPage() {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated()) return <Navigate to="/" />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isRegister ? '/auth/register' : '/auth/login';
      const body: any = { email, password };
      if (isRegister) body.name = name;

      const result = await api.post<{ token: string; user: { id: string; email: string; name: string | null } }>(
        endpoint,
        body,
      );
      setAuth(result.token, result.user);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Erro ao autenticar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', paddingTop: '4rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
        {isRegister ? 'Criar Conta' : 'Entrar'}
      </h1>
      <p style={{ color: 'var(--color-base-500)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
        {isRegister ? 'Crie sua conta para acompanhar sua coleção' : 'Acesse sua conta para continuar'}
      </p>

      {error && (
        <p style={{ color: 'var(--color-danger)', fontSize: '0.8125rem', marginBottom: '1rem' }}>
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {isRegister && (
          <input
            type="text"
            placeholder="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              padding: '0.625rem 0.75rem',
              border: '1.5px solid var(--color-base-400)',
              borderRadius: '6px',
              fontSize: '0.875rem',
              fontFamily: 'inherit',
            }}
          />
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{
            padding: '0.625rem 0.75rem',
            border: '1.5px solid var(--color-base-400)',
            borderRadius: '6px',
            fontSize: '0.875rem',
            fontFamily: 'inherit',
          }}
        />
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          style={{
            padding: '0.625rem 0.75rem',
            border: '1.5px solid var(--color-base-400)',
            borderRadius: '6px',
            fontSize: '0.875rem',
            fontFamily: 'inherit',
          }}
        />
        <Button type="submit" disabled={loading}>
          {loading ? 'Aguarde...' : isRegister ? 'Criar Conta' : 'Entrar'}
        </Button>
      </form>

      <p style={{ marginTop: '1rem', fontSize: '0.8125rem', color: 'var(--color-base-500)', textAlign: 'center' }}>
        {isRegister ? 'Já tem conta?' : 'Não tem conta?'}{' '}
        <button
          onClick={() => setIsRegister(!isRegister)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-base-700)',
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontSize: 'inherit',
          }}
        >
          {isRegister ? 'Entrar' : 'Cadastrar'}
        </button>
      </p>
    </div>
  );
}
