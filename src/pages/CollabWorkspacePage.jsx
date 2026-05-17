import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, ArrowLeft, Loader2, AlertTriangle, Handshake, Tag } from 'lucide-react';
import { authFetch } from '../lib/api';

export default function CollabWorkspacePage() {
  const { requestId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    authFetch(`/api/connect/workspace/${requestId}`)
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(setData)
      .catch(() => setError('Workspace not found or access denied.'))
      .finally(() => setLoading(false));
  }, [requestId]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 size={32} className="animate-spin text-mi-accent" />
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-3">
        <AlertTriangle size={32} className="text-red-400 mx-auto" />
        <p className="font-body text-mi-text-secondary">{error}</p>
        <Link to="/dashboard" className="btn-secondary inline-flex">Back to Dashboard</Link>
      </div>
    </div>
  );

  const { partner, entry, role } = data;
  const ROLE_LABELS = { co_founder: 'Co-Founder', developer: 'Developer', designer: 'Designer', advisor: 'Advisor', investor: 'Investor' };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/dashboard" className="p-2 rounded-xl hover:bg-mi-surface transition-colors">
            <ArrowLeft size={20} className="text-mi-text-muted" />
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Handshake size={16} className="text-mi-accent" />
              <span className="font-heading text-sm tracking-wider text-mi-accent uppercase">Collaboration Workspace</span>
            </div>
            <h1 className="font-heading text-2xl text-white tracking-wide">{entry.raw_input}</h1>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 p-4 rounded-xl bg-mi-surface border border-mi-border mb-6"
        >
          <div className="w-10 h-10 rounded-full bg-mi-accent/20 flex items-center justify-center shrink-0">
            {partner.avatar_url
              ? <img src={partner.avatar_url} alt={partner.name} className="w-10 h-10 rounded-full object-cover" />
              : <Users size={18} className="text-mi-accent" />
            }
          </div>
          <div>
            <p className="font-body text-sm text-white">{partner.name}</p>
            <p className="font-body text-xs text-mi-text-muted">{partner.email}</p>
          </div>
          <span className="ml-auto px-3 py-1 rounded-full bg-mi-accent/10 text-mi-accent text-xs font-body font-semibold">
            {ROLE_LABELS[role] || role}
          </span>
        </motion.div>

        {(entry.tags || []).length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {entry.tags.map(tag => (
              <span key={tag} className="flex items-center gap-1 px-3 py-1 bg-mi-surface border border-mi-border rounded-full text-xs font-body text-mi-text-muted">
                <Tag size={10} /> {tag}
              </span>
            ))}
          </div>
        )}

        {entry.summary && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-xl bg-mi-surface border border-mi-border mb-4"
          >
            <h2 className="font-heading text-lg tracking-wide text-white mb-3">Summary</h2>
            <p className="font-body text-sm text-mi-text-secondary leading-relaxed">{entry.summary}</p>
          </motion.div>
        )}

        {entry.tech_stack && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="p-6 rounded-xl bg-mi-surface border border-mi-border mb-4"
          >
            <h2 className="font-heading text-lg tracking-wide text-white mb-3">Tech Stack</h2>
            <div className="flex flex-wrap gap-2">
              {(Array.isArray(entry.tech_stack) ? entry.tech_stack : Object.values(entry.tech_stack || {})).map((t, i) => (
                <span key={i} className="px-3 py-1 bg-white/5 border border-white/10 text-white/70 text-xs font-body rounded-lg">
                  {typeof t === 'string' ? t : JSON.stringify(t)}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {entry.image_url && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl overflow-hidden border border-mi-border mb-4"
          >
            <img src={entry.image_url} alt={entry.raw_input} className="w-full object-cover max-h-64" />
          </motion.div>
        )}

        <div className="mt-8 text-center">
          <Link to="/dashboard" className="btn-secondary">
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
