import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Globe, Lock, Eye, Send, Loader2, CheckCircle2,
  Tag, X, Sparkles, ArrowUpRight
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { authFetch } from '../lib/api';

/* ─── Tag Input ─── */
function TagInput({ tags, setTags }) {
  const [input, setInput] = useState('');

  const addTag = () => {
    const val = input.trim().toLowerCase();
    if (val && !tags.includes(val) && tags.length < 8) {
      setTags([...tags, val]);
      setInput('');
    }
  };

  return (
    <div>
      <label className="block text-xs font-body font-medium text-mi-text-muted mb-1.5 tracking-wide uppercase">
        Tags (optional)
      </label>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-mi-accent/10 text-mi-accent border border-mi-accent/20 rounded-lg text-xs font-body"
          >
            #{tag}
            <button
              onClick={() => setTags(tags.filter(t => t !== tag))}
              className="hover:text-white transition-colors"
            >
              <X size={12} />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
          placeholder="Add a tag..."
          className="input-editorial flex-1"
          maxLength={30}
        />
        <button
          type="button"
          onClick={addTag}
          disabled={!input.trim() || tags.length >= 8}
          className="btn-secondary px-4 py-2 disabled:opacity-30"
        >
          <Tag size={14} />
        </button>
      </div>
      <p className="text-xs text-mi-text-muted font-body mt-1">{tags.length}/8 tags</p>
    </div>
  );
}

/* ─── Publish Card ─── */
function PublishCard({ entry, onPublish, onUnpublish, publishing }) {
  const isPublished = entry.visibility === 'public';
  const isPending = entry.status === 'pending';
  const isFailed = entry.status === 'failed';

  const techArray = Array.isArray(entry.tech_stack) ? entry.tech_stack :
    (typeof entry.tech_stack === 'string' ? (() => { try { return JSON.parse(entry.tech_stack); } catch { return []; } })() : []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-5 rounded-2xl border transition-all duration-300 ${
        isPublished
          ? 'bg-mi-accent/5 border-mi-accent/30'
          : 'bg-mi-surface border-mi-border hover:border-mi-border-light'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-0.5 rounded-md text-xs font-body font-medium ${
              entry.input_type === 'tool'
                ? 'bg-blue-500/10 text-blue-400'
                : 'bg-mi-accent/10 text-mi-accent'
            }`}>
              {entry.input_type}
            </span>
            <span className={`px-2 py-0.5 rounded-md text-xs font-body font-medium ${
              entry.status === 'completed' ? 'bg-green-500/10 text-green-400' :
              isPending ? 'bg-yellow-500/10 text-yellow-400' :
              'bg-red-500/10 text-red-400'
            }`}>
              {entry.status}
            </span>
            {isPublished && (
              <span className="px-2 py-0.5 rounded-md text-xs font-body font-medium bg-mi-accent/10 text-mi-accent flex items-center gap-1">
                <Globe size={10} />
                Public
              </span>
            )}
          </div>
          <h3 className="font-heading text-lg tracking-wide text-white truncate">{entry.raw_input}</h3>
          {entry.summary && (
            <p className="font-body text-xs text-mi-text-muted mt-1 line-clamp-2">{entry.summary}</p>
          )}
          {techArray.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {techArray.slice(0, 4).map((t, i) => (
                <span key={i} className="px-2 py-0.5 bg-white/5 text-mi-text-muted text-xs rounded-md font-body">{t}</span>
              ))}
              {techArray.length > 4 && <span className="text-xs text-mi-text-muted">+{techArray.length - 4}</span>}
            </div>
          )}
        </div>

        <div className="shrink-0">
          {entry.status === 'completed' && (
            isPublished ? (
              <button
                onClick={() => onUnpublish(entry.id)}
                disabled={publishing === entry.id}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-mi-border text-mi-text-muted font-body text-xs hover:border-red-400/50 hover:text-red-400 transition-all disabled:opacity-50"
              >
                {publishing === entry.id ? <Loader2 size={13} className="animate-spin" /> : <Lock size={13} />}
                Unpublish
              </button>
            ) : (
              <button
                onClick={() => onPublish(entry.id)}
                disabled={publishing === entry.id}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-mi-accent text-white font-body text-xs hover:bg-mi-accent-hover transition-all disabled:opacity-50"
              >
                {publishing === entry.id ? <Loader2 size={13} className="animate-spin" /> : <Globe size={13} />}
                Publish
              </button>
            )
          )}
          {isPending && (
            <span className="flex items-center gap-1.5 px-4 py-2 text-yellow-400/60 text-xs font-body">
              <Loader2 size={13} className="animate-spin" />
              Processing...
            </span>
          )}
          {isFailed && (
            <span className="flex items-center gap-1.5 px-4 py-2 text-red-400/60 text-xs font-body">
              Failed
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}


export default function PublishPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [tags, setTags] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all'); // all | published | draft

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const res = await authFetch('/api/catalogs/');
      if (res.ok) {
        const data = await res.json();
        setEntries(data);
      }
    } catch (e) {
      console.error('Failed to fetch entries', e);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (entryId) => {
    setPublishing(entryId);
    setSuccessMsg('');
    try {
      const res = await authFetch(`/api/catalogs/${entryId}/publish`, {
        method: 'POST',
        body: JSON.stringify({ tags: tags.length > 0 ? tags : null }),
      });
      if (res.ok) {
        setSuccessMsg('Idea published to the community! 🎉');
        setTags([]);
        fetchEntries();
      }
    } catch (e) {
      console.error('Failed to publish', e);
    } finally {
      setPublishing(null);
    }
  };

  const handleUnpublish = async (entryId) => {
    setPublishing(entryId);
    try {
      const res = await authFetch(`/api/catalogs/${entryId}/unpublish`, {
        method: 'POST',
      });
      if (res.ok) {
        setSuccessMsg('Idea set back to private.');
        fetchEntries();
      }
    } catch (e) {
      console.error('Failed to unpublish', e);
    } finally {
      setPublishing(null);
    }
  };

  // Filter entries
  const filteredEntries = entries.filter(e => {
    if (filterStatus === 'published') return e.visibility === 'public';
    if (filterStatus === 'draft') return e.visibility !== 'public';
    return true;
  });

  const publishedCount = entries.filter(e => e.visibility === 'public').length;
  const completedCount = entries.filter(e => e.status === 'completed').length;

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-6 lg:px-10">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-mi-text-muted font-body text-sm hover:text-white transition-colors mb-4"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>

          <h1 className="font-heading text-[clamp(2rem,4vw,3.5rem)] tracking-wide text-white leading-none mb-2">
            PUBLISH <span className="text-mi-accent">/</span> IDEAS.
          </h1>
          <p className="font-body text-mi-text-secondary text-sm max-w-lg">
            Share your completed ideas with the community. Published ideas appear in the public feed
            where others can comment, like, and collaborate.
          </p>
        </motion.div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="p-4 rounded-xl bg-mi-surface border border-mi-border text-center">
            <div className="font-heading text-2xl text-white">{entries.length}</div>
            <div className="font-body text-xs text-mi-text-muted">Total</div>
          </div>
          <div className="p-4 rounded-xl bg-mi-surface border border-mi-border text-center">
            <div className="font-heading text-2xl text-green-400">{completedCount}</div>
            <div className="font-body text-xs text-mi-text-muted">Ready to Publish</div>
          </div>
          <div className="p-4 rounded-xl bg-mi-accent/5 border border-mi-accent/20 text-center">
            <div className="font-heading text-2xl text-mi-accent">{publishedCount}</div>
            <div className="font-body text-xs text-mi-text-muted">Published</div>
          </div>
        </div>

        {/* ── Success Message ── */}
        <AnimatePresence>
          {successMsg && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-6"
            >
              <div className="flex items-center gap-2 p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-sm font-body">
                <CheckCircle2 size={16} />
                {successMsg}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Tag Input (applies to next publish) ── */}
        <div className="mb-8 p-6 rounded-2xl bg-mi-surface border border-mi-border">
          <h2 className="font-heading text-lg tracking-wide text-white mb-4">ADD TAGS BEFORE PUBLISHING</h2>
          <TagInput tags={tags} setTags={setTags} />
        </div>

        {/* ── Filter ── */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex bg-mi-surface border border-mi-border rounded-xl overflow-hidden">
            {[
              { value: 'all', label: 'All Ideas' },
              { value: 'draft', label: 'Drafts' },
              { value: 'published', label: 'Published' },
            ].map(f => (
              <button
                key={f.value}
                onClick={() => setFilterStatus(f.value)}
                className={`px-4 py-2.5 font-body text-xs transition-colors ${
                  filterStatus === f.value ? 'bg-mi-accent/10 text-mi-accent' : 'text-mi-text-muted hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <span className="font-body text-xs text-mi-text-muted">
            {filteredEntries.length} {filteredEntries.length === 1 ? 'entry' : 'entries'}
          </span>
        </div>

        {/* ── Entry List ── */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-2 border-mi-border border-t-mi-accent rounded-full animate-spin" />
          </div>
        ) : filteredEntries.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 rounded-2xl border border-dashed border-mi-border bg-mi-surface/50"
          >
            <Sparkles size={40} className="mx-auto text-mi-text-muted mb-4" />
            <p className="font-heading text-2xl text-mi-text-muted tracking-wide mb-2">
              {filterStatus === 'published' ? 'NO PUBLISHED IDEAS' : 'NO IDEAS YET'}
            </p>
            <p className="font-body text-sm text-mi-text-muted mb-6">
              {filterStatus === 'published'
                ? 'Publish your completed ideas to share them with the community.'
                : 'Create ideas from your dashboard first.'}
            </p>
            <button onClick={() => navigate('/dashboard')} className="btn-primary">
              Go to Dashboard
              <ArrowUpRight size={16} />
            </button>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {filteredEntries.map((entry) => (
              <PublishCard
                key={entry.id}
                entry={entry}
                onPublish={handlePublish}
                onUnpublish={handleUnpublish}
                publishing={publishing}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
