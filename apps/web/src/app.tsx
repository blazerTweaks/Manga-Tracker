import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/layout';

const HomePage = lazy(() => import('./pages/home').then((m) => ({ default: m.HomePage })));
const ExplorePage = lazy(() => import('./pages/explore').then((m) => ({ default: m.ExplorePage })));
const MangaPage = lazy(() => import('./pages/manga').then((m) => ({ default: m.MangaPage })));
const VolumePage = lazy(() => import('./pages/volume').then((m) => ({ default: m.VolumePage })));
const DashboardPage = lazy(() => import('./pages/dashboard').then((m) => ({ default: m.DashboardPage })));
const CollectionPage = lazy(() => import('./pages/collection').then((m) => ({ default: m.CollectionPage })));
const WishlistPage = lazy(() => import('./pages/wishlist').then((m) => ({ default: m.WishlistPage })));
const SettingsPage = lazy(() => import('./pages/settings').then((m) => ({ default: m.SettingsPage })));
const LoginPage = lazy(() => import('./pages/login').then((m) => ({ default: m.LoginPage })));

function PageFallback() {
  return (
    <div style={{ padding: '2rem 0' }}>
      <div style={{ height: 24, width: '60%', background: 'var(--color-base-100)', borderRadius: 4, marginBottom: 16 }} />
      <div style={{ height: 16, width: '40%', background: 'var(--color-base-100)', borderRadius: 4, marginBottom: 32 }} />
      <div style={{ height: 400, background: 'var(--color-base-100)', borderRadius: 8 }} />
    </div>
  );
}

export function App() {
  return (
    <Layout>
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/explorar" element={<ExplorePage />} />
          <Route path="/manga/:slug" element={<MangaPage />} />
          <Route path="/volume/:id" element={<VolumePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/colecao" element={<CollectionPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/configuracoes" element={<SettingsPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </Suspense>
    </Layout>
  );
}
