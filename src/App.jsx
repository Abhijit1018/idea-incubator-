import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './lib/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';
import WarmingBanner from './components/WarmingBanner';
import { Toaster } from 'react-hot-toast';

// Lazy-load pages so the initial load (landing/login) doesn't pull in heavy
// deps like mermaid (via Dashboard/Community). Each route becomes its own chunk.
const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const CommunityPage = lazy(() => import('./pages/CommunityPage'));
const PublishPage = lazy(() => import('./pages/PublishPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const CollabWorkspacePage = lazy(() => import('./pages/CollabWorkspacePage'));

function PageFallback() {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span
        style={{
          width: 28, height: 28,
          border: '3px solid rgba(255,77,0,0.25)', borderTopColor: '#ff4d00',
          borderRadius: '50%', animation: 'mi-page-spin 0.7s linear infinite',
        }}
      />
      <style>{`@keyframes mi-page-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <WarmingBanner />
      <Toaster 
        position="bottom-right" 
        toastOptions={{
          className: 'mi-toast',
          style: {
            background: 'rgba(28, 28, 31, 0.95)',
            color: '#fff',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            fontSize: '14px',
            padding: '12px 24px',
            boxShadow: '0 10px 30px -5px rgba(0,0,0,0.5)',
          },
          success: {
            iconTheme: {
              primary: '#ff4d00',
              secondary: '#fff',
            },
          },
        }} 
      />
      <BrowserRouter>
        <ScrollToTop />
        <Suspense fallback={<PageFallback />}>
        <Routes>
          {/* Login page — standalone layout (no navbar/footer) */}
          <Route path="/login" element={<LoginPage />} />

          {/* All other pages share the Layout (navbar + footer) */}
          <Route element={<Layout />}>
            {/* Public routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/profile/:userId" element={<ProfilePage />} />

            {/* Protected routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/publish"
              element={
                <ProtectedRoute>
                  <PublishPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/collab/:requestId"
              element={
                <ProtectedRoute>
                  <CollabWorkspacePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminPage />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
