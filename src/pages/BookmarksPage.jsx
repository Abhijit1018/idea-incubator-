import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bookmark, ArrowUpRight } from 'lucide-react';
import { authFetch } from '../lib/api';
import { REACTION_CONFIG } from '../components/Reactions';
import EmptyState from '../components/EmptyState';

function topVerdict(reactions) {
  if (!reactions) return null;
  let best = null;
  for (const r of REACTION_CONFIG) {
    const c = reactions[r.type] || 0;
    if (c > 0 && (!best || c > best.count)) best = { ...r, count: c };
  }
  return best;
}

export default function BookmarksPage() {
  const [items, setItems] = useState(null);

  const load = async () => {
    try {
      const res = await authFetch('/api/bookmarks');
      setItems(res.ok ? await res.json() : []);
    } catch { setItems([]); }
  };

  useEffect(() => { load(); }, []);

  const removeBookmark = async (id) => {
    setItems((prev) => prev.filter((e) => e.id !== id)); // optimistic
    try { await authFetch(`/api/community/${id}/bookmark`, { method: 'POST' }); }
    catch { load(); }
  };

  return (
    <div className="pt-24 pb-16 min-h-screen max-w-4xl mx-auto px-5">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-mi-accent/10 flex items-center justify-center">
          <Bookmark size={20} className="text-mi-accent" />
        </div>
        <div>
          <h1 className="font-heading text-2xl text-white tracking-wide">Saved ideas</h1>
          <p className="text-sm text-mi-text-muted">Ideas you bookmarked from the community.</p>
        </div>
      </div>

      {items === null ? (
        <div className="flex justify-center py-16">
          <span className="w-6 h-6 rounded-full border-[3px] border-mi-accent/25 border-t-mi-accent animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="No saved ideas yet"
          description="Bookmark ideas in the community to keep them here."
          action={<Link to="/community" className="px-5 py-2.5 rounded-xl bg-mi-accent text-white font-medium hover:opacity-90 transition">Explore community</Link>}
        />
      ) : (
        <div className="space-y-3">
          {items.map((entry, i) => {
            const verdict = topVerdict(entry.reactions);
            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className="group rounded-2xl bg-mi-surface border border-mi-border p-5 hover:border-mi-border-light transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link to={`/idea/${entry.id}`} className="font-heading text-lg text-white hover:text-mi-accent transition-colors inline-flex items-center gap-1.5">
                      {entry.raw_input} <ArrowUpRight size={15} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                    {entry.summary && <p className="text-sm text-mi-text-secondary line-clamp-2 mt-1">{entry.summary}</p>}
                    <div className="flex items-center gap-3 mt-2 text-xs text-mi-text-muted">
                      {entry.author && <span>by {entry.author.name}</span>}
                      <span>· score {entry.idea_score ?? 0}</span>
                      {verdict && (
                        <span className="inline-flex items-center gap-1" style={{ color: verdict.hex }}>
                          <verdict.icon size={12} /> {verdict.label}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => removeBookmark(entry.id)}
                    className="shrink-0 p-2 rounded-lg text-mi-accent hover:bg-mi-accent/10 transition-colors"
                    title="Remove bookmark"
                  >
                    <Bookmark size={16} fill="currentColor" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
