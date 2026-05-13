import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Loader2, AlertTriangle, Mail, Lock, User, Eye, EyeOff, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [mode, setMode] = useState(searchParams.get('mode') === 'register' ? 'register' : 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Update mode from URL params
  useEffect(() => {
    const urlMode = searchParams.get('mode');
    if (urlMode === 'register') setMode('register');
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (mode === 'register') {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name } }
        });
        if (signUpError) throw signUpError;
        if (data.user && !data.session) {
          setSuccess('Check your email to confirm your account, then log in.');
        } else if (data.session) {
          navigate('/dashboard', { replace: true });
        }
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        if (data.session) {
          navigate('/dashboard', { replace: true });
        }
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider) => {
    setError('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) throw error;
    } catch (err) {
      setError(err.message || `Failed to sign in with ${provider}`);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left Panel — Branding ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-mi-bg items-center justify-center">
        {/* Background effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_30%_50%,rgba(255,77,0,0.12),transparent)]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,77,0,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,77,0,0.5) 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }}
        />

        <div className="relative z-10 px-16 max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
          >
            <div className="flex items-center gap-3 mb-10">
              <div className="w-10 h-10 bg-mi-accent rounded-xl flex items-center justify-center">
                <Sparkles size={20} className="text-white" />
              </div>
              <span className="font-heading text-3xl tracking-wide text-white">MINDINSPO</span>
            </div>

            <h2 className="font-editorial text-[clamp(3rem,5vw,4.5rem)] leading-[0.95] text-white mb-6">
              Where ideas
              <br />
              <span className="italic text-mi-accent">take shape.</span>
            </h2>

            <p className="font-body text-mi-text-secondary text-base leading-relaxed">
              Transform fleeting thoughts into structured intelligence.
              AI-powered research, community collaboration, and smart catalogs — all in one place.
            </p>

            {/* Decorative dots */}
            <div className="mt-12 flex gap-2">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 2, delay: i * 0.3, repeat: Infinity }}
                  className="w-2 h-2 rounded-full bg-mi-accent"
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Right Panel — Auth Form ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-20 bg-mi-surface relative">
        {/* Subtle texture */}
        <div className="absolute inset-0 noise-overlay opacity-30" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          className="w-full max-w-md relative z-10"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-mi-accent rounded-lg flex items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </div>
            <span className="font-heading text-2xl tracking-wide text-white">MINDINSPO</span>
          </div>

          {/* Mode header */}
          <div className="mb-8">
            <h1 className="font-heading text-4xl tracking-wide text-white">
              {mode === 'register' ? 'CREATE ACCOUNT' : 'WELCOME BACK'}
            </h1>
            <p className="font-body text-sm text-mi-text-muted mt-2">
              {mode === 'register'
                ? 'Start your idea incubation journey.'
                : 'Pick up where you left off.'}
            </p>
          </div>

          {/* OAuth Buttons */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={() => handleOAuth('google')}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white/5 border border-mi-border rounded-xl font-body text-sm text-mi-text-secondary hover:bg-white/10 hover:border-mi-border-light transition-all duration-200"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Google
            </button>
            <button
              onClick={() => handleOAuth('github')}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white/5 border border-mi-border rounded-xl font-body text-sm text-mi-text-secondary hover:bg-white/10 hover:border-mi-border-light transition-all duration-200"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              GitHub
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-mi-border" />
            <span className="text-xs text-mi-text-muted font-body">or continue with email</span>
            <div className="flex-1 h-px bg-mi-border" />
          </div>

          {/* Error / Success */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 overflow-hidden"
              >
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm font-body">
                  <AlertTriangle size={16} className="shrink-0" />
                  {error}
                </div>
              </motion.div>
            )}
            {success && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 overflow-hidden"
              >
                <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-sm font-body">
                  {success}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Name (register only) */}
            <AnimatePresence>
              {mode === 'register' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <label className="block text-xs font-body font-medium text-mi-text-muted mb-1.5 tracking-wide uppercase">
                    Display Name
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-mi-text-muted" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      className="input-editorial pl-11"
                      required={mode === 'register'}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email */}
            <div>
              <label className="block text-xs font-body font-medium text-mi-text-muted mb-1.5 tracking-wide uppercase">
                Email
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-mi-text-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input-editorial pl-11"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-body font-medium text-mi-text-muted mb-1.5 tracking-wide uppercase">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-mi-text-muted" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-editorial pl-11 pr-11"
                  required
                  minLength={6}
                  autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-mi-text-muted hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary justify-center mt-2 disabled:opacity-50 disabled:cursor-not-allowed w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  {mode === 'register' ? 'Creating Account...' : 'Signing In...'}
                </>
              ) : (
                <>
                  <ArrowRight size={18} />
                  {mode === 'register' ? 'Create Account' : 'Sign In'}
                </>
              )}
            </button>
          </form>

          {/* Toggle mode */}
          <p className="text-center text-sm text-mi-text-muted font-body mt-6">
            {mode === 'login' ? (
              <>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('register'); setError(''); setSuccess(''); }}
                  className="text-mi-accent hover:underline font-medium"
                >
                  Create one
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
                  className="text-mi-accent hover:underline font-medium"
                >
                  Sign in
                </button>
              </>
            )}
          </p>

          {/* Back to home */}
          <div className="mt-8 text-center">
            <Link to="/" className="text-xs text-mi-text-muted font-body hover:text-white transition-colors">
              ← Back to MindInspo
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
