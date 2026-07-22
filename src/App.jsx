import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './lib/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CommunityPage from './pages/CommunityPage';
import PublishPage from './pages/PublishPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import AdminPage from './pages/AdminPage';
import CollabWorkspacePage from './pages/CollabWorkspacePage';
import WarmingBanner from './components/WarmingBanner';
import { Toaster } from 'react-hot-toast';

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
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
