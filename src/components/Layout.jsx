import React, { useState, useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowUpRight, LogOut, User, Settings, ShieldCheck, ChevronDown } from 'lucide-react';
import NotificationBell from './NotificationBell';
import { authFetch } from '../lib/api';

function Navbar() {
  const { user, isAuthenticated, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setUserDropdownOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (isAuthenticated) {
      authFetch('/api/profile')
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data) setIsAdmin(data.is_admin);
        })
        .catch(e => console.error('Failed to fetch admin status', e));
    } else {
      setIsAdmin(false);
    }
  }, [isAuthenticated]);

  const displayName = user?.user_metadata?.name || user?.email?.split('@')[0] || '';

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/community', label: 'Community' },
    ...(isAuthenticated ? [
      { to: '/dashboard', label: 'Dashboard' },
      { to: '/publish', label: 'Publish' },
    ] : []),
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? 'glass border-b border-mi-border/50' : 'bg-transparent'
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <img src="/mindinspo-logo.svg" alt="MindInspo" className="w-8 h-8 rounded-lg transition-transform duration-300 group-hover:rotate-12" />
              <span className="font-heading text-2xl tracking-wide text-white">
                MINDINSPO
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    `nav-link py-1 ${isActive ? 'text-white !after:w-full' : ''}`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </div>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-3">
              {isAuthenticated ? (
                <div className="flex items-center gap-3">
                  <NotificationBell />
                  
                  <div className="relative">
                    <button
                      onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                      className="flex items-center gap-2 px-4 py-2 rounded-full bg-mi-surface border border-mi-border hover:border-mi-border-light transition-all duration-200"
                    >
                      <div className="w-6 h-6 rounded-full bg-mi-accent/20 flex items-center justify-center">
                        <User size={12} className="text-mi-accent" />
                      </div>
                      <span className="text-sm font-body text-mi-text-secondary">
                        {displayName}
                      </span>
                      <ChevronDown size={14} className={`text-mi-text-muted transition-transform duration-200 ${userDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {userDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute right-0 mt-3 w-56 p-2 rounded-2xl glass border border-mi-border/50 shadow-2xl z-50 origin-top-right"
                        >
                          <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-colors text-sm font-body text-mi-text-secondary hover:text-white">
                            <User size={16} /> Dashboard
                          </Link>
                          <Link to="/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-colors text-sm font-body text-mi-text-secondary hover:text-white">
                            <Settings size={16} /> Settings
                          </Link>
                          {(isAdmin || user?.email === 'abhi@gmail.com') && (
                            <Link to="/admin" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-mi-accent/10 transition-colors text-sm font-body text-mi-accent">
                              <ShieldCheck size={16} /> Admin Console
                            </Link>
                          )}
                          <div className="h-[1px] bg-mi-border/50 my-1 mx-2" />
                          <button
                            onClick={signOut}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-400/10 transition-colors text-sm font-body text-red-400"
                          >
                            <LogOut size={16} /> Sign Out
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              ) : (
                <>
                  <Link to="/login" className="btn-ghost">
                    Log in
                  </Link>
                  <Link to="/login?mode=register" className="btn-primary">
                    Get Started
                    <ArrowUpRight size={16} />
                  </Link>
                </>
              )}
            </div>

            {/* Mobile toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 text-mi-text-secondary hover:text-white transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed inset-0 z-40 bg-mi-bg/98 backdrop-blur-xl lg:hidden pt-20"
          >
            <div className="flex flex-col px-6 py-8 gap-2">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    `py-4 border-b border-mi-border font-body text-lg ${
                      isActive ? 'text-mi-accent' : 'text-mi-text-secondary'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}

              <div className="mt-8 flex flex-col gap-3">
                {isAuthenticated ? (
                  <button
                    onClick={signOut}
                    className="btn-secondary justify-center"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                ) : (
                  <>
                    <Link to="/login" className="btn-secondary justify-center">
                      Log in
                    </Link>
                    <Link to="/login?mode=register" className="btn-primary justify-center">
                      Get Started
                      <ArrowUpRight size={16} />
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function Footer() {
  return (
    <footer className="border-t border-mi-border bg-mi-bg">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-16">
        {/* Big CTA */}
        <div className="mb-16">
          <h2 className="font-heading text-[clamp(3rem,8vw,7rem)] leading-[0.9] tracking-tight text-white">
            LET'S BUILD
            <br />
            <span className="text-gradient-accent">SOMETHING.</span>
          </h2>
          <div className="mt-6 flex flex-wrap gap-4">
            <Link to="/login?mode=register" className="btn-primary">
              Start Incubating
              <ArrowUpRight size={16} />
            </Link>
            <Link to="/community" className="btn-secondary">
              Explore Community
            </Link>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pt-8 border-t border-mi-border">
          <div className="flex items-center gap-2.5">
            <img src="/mindinspo-logo.svg" alt="MindInspo" className="w-6 h-6 rounded-md" />
            <span className="font-heading text-lg tracking-wide text-white">MINDINSPO</span>
          </div>
          <div className="flex flex-wrap gap-6 text-sm text-mi-text-muted font-body">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <Link to="/community" className="hover:text-white transition-colors">Community</Link>
            <Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
          </div>
          <p className="text-xs text-mi-text-muted font-body">
            © {new Date().getFullYear()} MindInspo. AI-Powered Idea Incubation.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function Layout() {
  const location = useLocation();
  // Don't show footer on auth page
  const hideFooter = location.pathname === '/login';

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
}
