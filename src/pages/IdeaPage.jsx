import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, GitFork, Sparkles, Layers, ThumbsUp, ThumbsDown, Tag, ExternalLink } from 'lucide-react';
import { authFetch } from '../lib/api';
import { useAuth } from '../lib/AuthContext';
import { ReactionRow, Reactors } from '../components/Reactions';
import toast from 'react-hot-toast';

function asArray(v) {
  if (Array.isArray(v)) return v;
  if (typeof v === 'string') { try { const p = JSON.parse(v); return Array.isArray(p) ? p : []; } catch { return []; } }
  return [];
}

export default function IdeaPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [entry, setEntry] = useState(null);
  const [state, setState] = useState('loading'); // loading | ready | notfound

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await authFetch(`/api/community/entry/${id}`);
        if (!alive) return;
        if (res.ok) { setEntry(await res.json()); setState('ready'); }
        else setState('notfound');
      } catch { if (alive) setState('notfound'); }
    })();
    return () => { alive = false; };
  }, [id]);

  const promptLogin = (verb = 'do that') => {
    toast((t) => (
      <span className="flex items-center gap-3">
        <span className="text-sm">Sign in to {verb}.</span>
        <button onClick={() => { toast.dismiss(t.id); navigate('/login'); }} className="px-2.5 py-1 rounded-md bg-mi-accent text-white text-xs font-medium hover:opacity-90">Sign in</button>
      </span>
    ), { id: 'auth-prompt', duration: 4000 });
  };

  const react = async (type) => {
    if (!isAuthenticated) { promptLogin('react to ideas'); return; }
    try {
      const res = await authFetch(`/api/community/${id}/react`, {
        method: 'POST', body: JSON.stringify({ reaction_type: type }),
      });
      if (res.ok) {
        const data = await res.json();
        setEntry((e) => ({ ...e, reactions: data.reactions, user_reactions: data.user_reactions }));
      }
    } catch (e) { console.error('react', e); }
  };

  const remix = async () => {
    if (!isAuthenticated) { promptLogin('remix ideas'); return; }
    const t = toast.loading('Remixing…');
    try {
      const res = await authFetch(`/api/catalogs/${id}/remix`, { method: 'POST' });
      if (res.ok) { toast.success('Remixed into your catalog', { id: t }); navigate('/dashboard'); }
      else { const e = await res.json().catch(() => ({})); toast.error(e.error || 'Could not remix', { id: t }); }
    } catch { toast.error('Could not remix', { id: t }); }
  };

  if (state === 'loading') {
    return (
      <div className="pt-28 min-h-screen flex justify-center">
        <span className="w-7 h-7 rounded-full border-[3px] border-mi-accent/25 border-t-mi-accent animate-spin" />
      </div>
    );
  }

  if (state === 'notfound') {
    return (
      <div className="pt-28 pb-16 min-h-screen text-center px-6">
        <h1 className="font-display text-2xl text-white mb-3">Idea not found</h1>
        <p className="text-mi-text-muted mb-6">This idea may be private or no longer published.</p>
        <Link to="/community" className="text-mi-accent hover:underline">Browse the community →</Link>
      </div>
    );
  }

  const tech = asArray(entry.tech_stack);
  const pros = asArray(entry.pros_cons?.pros);
  const cons = asArray(entry.pros_cons?.cons);
  const features = asArray(entry.unique_features);
  const tags = asArray(entry.tags);
  const isOwner = false; // read-only share view

  return (
    <div className="pt-24 pb-20 min-h-screen relative overflow-hidden">
      <div className="absolute -top-20 left-1/4 w-[500px] h-[500px] bg-mi-accent/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="max-w-3xl mx-auto px-5 relative">
        <Link to="/community" className="inline-flex items-center gap-2 text-mi-text-muted hover:text-white text-sm mb-6">
          <ArrowLeft size={16} /> Community
        </Link>

        <motion.article
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-mi-surface border border-mi-border p-6 sm:p-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-mi-accent/10 text-mi-accent uppercase tracking-wide">
              {entry.input_type === 'tool' ? 'Tool' : 'Idea'}
            </span>
            {entry.remixed_from && (
              <span className="px-2.5 py-1 rounded-full text-[11px] bg-white/5 text-mi-text-muted inline-flex items-center gap-1">
                <GitFork size={11} /> Remix
              </span>
            )}
            {entry.author && (
              <Link to={`/profile/${entry.author.id}`} className="ml-auto text-sm text-mi-text-secondary hover:text-white">
                by {entry.author.name}
              </Link>
            )}
          </div>

          <h1 className="font-display text-2xl sm:text-3xl text-white leading-tight mb-4">{entry.raw_input}</h1>

          {entry.image_url && (
            <img src={entry.image_url} alt="" className="w-full rounded-xl border border-mi-border mb-5 max-h-80 object-cover" />
          )}

          {entry.summary && (
            <p className="font-body text-mi-text-secondary leading-relaxed mb-6 whitespace-pre-line">{entry.summary}</p>
          )}

          {tech.length > 0 && (
            <Section icon={<Layers size={15} />} title="Tech stack">
              <div className="flex flex-wrap gap-1.5">
                {tech.map((t, i) => <span key={i} className="px-2.5 py-1 rounded-lg text-xs bg-white/5 text-mi-text-secondary">{t}</span>)}
              </div>
            </Section>
          )}

          {(pros.length > 0 || cons.length > 0) && (
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              {pros.length > 0 && (
                <div className="rounded-xl bg-green-500/5 border border-green-500/15 p-4">
                  <p className="flex items-center gap-2 text-green-400 text-xs font-semibold uppercase tracking-wide mb-2"><ThumbsUp size={14} /> Pros</p>
                  <ul className="space-y-1.5 text-sm text-mi-text-secondary list-disc list-inside">{pros.map((p, i) => <li key={i}>{p}</li>)}</ul>
                </div>
              )}
              {cons.length > 0 && (
                <div className="rounded-xl bg-red-500/5 border border-red-500/15 p-4">
                  <p className="flex items-center gap-2 text-red-400 text-xs font-semibold uppercase tracking-wide mb-2"><ThumbsDown size={14} /> Cons</p>
                  <ul className="space-y-1.5 text-sm text-mi-text-secondary list-disc list-inside">{cons.map((c, i) => <li key={i}>{c}</li>)}</ul>
                </div>
              )}
            </div>
          )}

          {features.length > 0 && (
            <Section icon={<Sparkles size={15} />} title="Unique features">
              <ul className="space-y-1.5 text-sm text-mi-text-secondary list-disc list-inside">{features.map((f, i) => <li key={i}>{f}</li>)}</ul>
            </Section>
          )}

          {entry.link && (
            <a href={entry.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm text-mi-accent hover:underline mb-6">
              <ExternalLink size={14} /> {entry.link}
            </a>
          )}

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {tags.map((t, i) => <span key={i} className="inline-flex items-center gap-1 text-xs text-mi-text-muted"><Tag size={11} />{t}</span>)}
            </div>
          )}

          {/* Reactions */}
          <div className="pt-4 border-t border-mi-border/60">
            <p className="text-[11px] uppercase tracking-wide text-mi-text-muted mb-2">
              {isAuthenticated ? 'How do you rate this idea?' : 'Community verdict'}
            </p>
            <ReactionRow
              reactions={entry.reactions}
              userReactions={entry.user_reactions}
              onReact={react}
              canReact={isAuthenticated}
            />
            <Reactors entryId={entry.id} open={true} />
          </div>
        </motion.article>

        {/* CTA */}
        <div className="mt-6 flex flex-wrap gap-3">
          {!isOwner && (
            <button onClick={remix} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-mi-accent text-white font-medium hover:opacity-90 transition">
              <GitFork size={16} /> Remix this idea
            </button>
          )}
          <Link to="/community" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-mi-border text-mi-text-secondary hover:text-white transition">
            Explore more ideas
          </Link>
          {!isAuthenticated && (
            <Link to="/login" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-mi-accent/40 text-mi-accent hover:bg-mi-accent/5 transition">
              Build your own →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ icon, title, children }) {
  return (
    <div className="mb-6">
      <p className="flex items-center gap-2 text-mi-text-muted text-xs font-semibold uppercase tracking-wide mb-2">{icon} {title}</p>
      {children}
    </div>
  );
}
