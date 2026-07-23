import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, TrendingUp, Clock, Sparkles, MessageSquare, Heart, Share2, ArrowUpRight, Lightbulb, Wrench,
  Users, Bookmark, MoreHorizontal, Send, X, ChevronDown, Flame, Handshake, Check,
  Eye, DollarSign, Hammer, Trophy, Download, Camera, Layout, Loader2, GitFork
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { authFetch, API_BASE_URL } from '../lib/api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../lib/AuthContext';
import ConnectModal from '../components/ConnectModal';
import { PostCardSkeleton } from '../components/SkeletonLoaders';
import EmptyState from '../components/EmptyState';

const REACTION_CONFIG = [
  { type: 'brilliant',    icon: Lightbulb,  label: 'Brilliant',    color: 'text-yellow-300', hex: '#facc15' },
  { type: 'interested',   icon: Eye,        label: 'Interested',   color: 'text-blue-300',   hex: '#60a5fa' },
  { type: 'sellable',     icon: DollarSign, label: 'Sellable',     color: 'text-green-300',  hex: '#4ade80' },
  { type: 'build_worthy', icon: Hammer,     label: 'Build-worthy', color: 'text-orange-300', hex: '#fb923c' },
  { type: 'needs_work',   icon: Wrench,     label: 'Needs work',   color: 'text-slate-300',  hex: '#94a3b8' },
];
const REACTION_BY_TYPE = Object.fromEntries(REACTION_CONFIG.map((r) => [r.type, r]));

/* Particle burst emitted when a reaction is added — the signature micro-moment. */
function ReactionBurst({ hex }) {
  const bits = [0, 1, 2, 3, 4, 5];
  return (
    <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
      {bits.map((i) => {
        const angle = (i / bits.length) * Math.PI * 2;
        return (
          <motion.span
            key={i}
            initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            animate={{ opacity: 0, x: Math.cos(angle) * 22, y: Math.sin(angle) * 22, scale: 0.2 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            style={{ position: 'absolute', width: 5, height: 5, borderRadius: 9999, background: hex }}
          />
        );
      })}
    </span>
  );
}

/* A single reaction chip: pops on tap, glows when active, bursts when added. */
function ReactionPill({ r, count, isActive, disabled, onReact }) {
  const [burstKey, setBurstKey] = useState(0);
  const handle = () => {
    if (disabled) return;
    if (!isActive) setBurstKey((k) => k + 1); // burst only on add, not un-react
    onReact(r.type);
  };
  return (
    <motion.button
      type="button"
      layout
      onClick={handle}
      whileTap={{ scale: 0.82 }}
      disabled={disabled}
      className={`relative flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-body border transition-colors ${
        isActive ? 'bg-white/[0.07] border-transparent text-white' : 'bg-white/[0.03] border-mi-border hover:border-mi-border-light text-mi-text-muted hover:text-white'
      } ${disabled ? 'cursor-default' : ''}`}
      style={isActive ? { boxShadow: `0 0 0 1px ${r.hex}66, 0 0 14px -2px ${r.hex}55` } : undefined}
      title={r.label}
    >
      <motion.span animate={isActive ? { scale: [1, 1.35, 1] } : { scale: 1 }} transition={{ duration: 0.3 }} className="flex">
        <r.icon size={13} style={isActive ? { color: r.hex } : undefined} />
      </motion.span>
      <AnimatePresence mode="popLayout" initial={false}>
        {count > 0 && (
          <motion.span
            key={count}
            initial={{ y: 6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -6, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="tabular-nums"
          >
            {count}
          </motion.span>
        )}
      </AnimatePresence>
      <AnimatePresence>{burstKey > 0 && <ReactionBurst key={burstKey} hex={r.hex} />}</AnimatePresence>
    </motion.button>
  );
}

/* ─── Comment Thread ─── */
function CommentSection({ entryId, isOpen, onClose }) {
  const { isAuthenticated } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    if (isOpen) fetchComments();
  }, [isOpen, entryId]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const res = await authFetch(`/api/community/${entryId}/comments`);
      if (res.ok) setComments(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const postComment = async () => {
    if (!newComment.trim() || posting) return;
    setPosting(true);
    try {
      const res = await authFetch(`/api/community/${entryId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content: newComment }),
      });
      if (res.ok) {
        const c = await res.json();
        setComments(prev => [...prev, c]);
        setNewComment('');
      }
    } catch (e) { console.error(e); }
    finally { setPosting(false); }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden border-t border-mi-border/50"
    >
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-heading text-sm tracking-wider text-white">COMMENTS</h4>
          <button onClick={onClose} className="text-mi-text-muted hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-6">
            <div className="w-6 h-6 border-2 border-mi-border border-t-mi-accent rounded-full animate-spin" />
          </div>
        ) : comments.length === 0 ? (
          <p className="text-center py-6 text-mi-text-muted font-body text-sm">No comments yet. Be the first!</p>
        ) : (
          <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
            {comments.map((c) => (
              <div key={c.id} className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-mi-accent/40 to-orange-600/40 flex items-center justify-center shrink-0">
                  <span className="text-xs text-white font-heading">
                    {(c.author?.name || 'U')[0].toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-body font-semibold text-xs text-white">{c.author?.name || 'Unknown'}</span>
                    <span className="text-mi-text-muted text-xs font-body">
                      {new Date(c.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="font-body text-sm text-mi-text-secondary mt-0.5">{c.content}</p>
                  {/* Replies */}
                  {c.replies?.length > 0 && (
                    <div className="ml-4 mt-2 space-y-2 border-l border-mi-border/30 pl-3">
                      {c.replies.map((r) => (
                        <div key={r.id} className="flex gap-2">
                          <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                            <span className="text-[10px] text-white">{(r.author?.name || 'U')[0]}</span>
                          </div>
                          <div>
                            <span className="font-body font-medium text-xs text-white">{r.author?.name}</span>
                            <p className="font-body text-xs text-mi-text-secondary">{r.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Comment input */}
        {isAuthenticated ? (
          <div className="flex gap-2">
            <input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') postComment(); }}
              placeholder="Write a comment..."
              className="input-editorial flex-1 py-2.5 text-xs"
            />
            <button
              onClick={postComment}
              disabled={!newComment.trim() || posting}
              className="p-2.5 rounded-xl bg-mi-accent text-white hover:bg-mi-accent-hover transition-colors disabled:opacity-30"
            >
              <Send size={14} />
            </button>
          </div>
        ) : (
          <Link to="/login" className="block text-center py-3 text-sm text-mi-accent font-body hover:underline">
            Sign in to comment
          </Link>
        )}
      </div>
    </motion.div>
  );
}

/* ─── Updates Thread (Read-only) ─── */
function UpdatesSection({ entryId, isOpen, onClose }) {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) fetchUpdates();
  }, [isOpen, entryId]);

  const fetchUpdates = async () => {
    setLoading(true);
    try {
      const res = await authFetch(`/api/catalogs/${entryId}/updates`);
      if (res.ok) setUpdates(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden border-t border-mi-border/50"
    >
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-heading text-sm tracking-wider text-white">UPDATES</h4>
          <button onClick={onClose} className="text-mi-text-muted hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-6">
            <div className="w-6 h-6 border-2 border-mi-border border-t-mi-accent rounded-full animate-spin" />
          </div>
        ) : updates.length === 0 ? (
          <p className="text-center py-6 text-mi-text-muted font-body text-sm">No updates yet.</p>
        ) : (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {updates.map((u) => (
              <div key={u.id} className="p-3 rounded-xl bg-mi-bg/50 border border-mi-border/60">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-mi-accent font-body uppercase tracking-wide">{u.update_type}</span>
                  <span className="text-xs text-mi-text-muted font-body">
                    {new Date(u.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="font-body text-sm text-mi-text-secondary mt-2 whitespace-pre-wrap">{u.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ─── Social Share Modal ─── */
function SocialShareModal({ entry, isOpen, onClose }) {
  const cardRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#0a0a0b',
        scale: 2,
        logging: false,
        useCORS: true
      });
      const link = document.createElement('a');
      link.download = `mindinspo-${entry.id.substring(0, 8)}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (e) {
      console.error('Download failed', e);
    } finally {
      setDownloading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative z-10 w-full max-w-lg bg-mi-surface border border-mi-border rounded-3xl overflow-hidden shadow-2xl"
      >
        <div className="p-6 border-b border-mi-border flex items-center justify-between">
          <h3 className="font-heading text-sm tracking-widest text-white uppercase">Export to Image</h3>
          <button onClick={onClose} className="text-mi-text-muted hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 flex flex-col items-center">
          {/* The Shareable Card */}
          <div 
            ref={cardRef}
            className="w-full aspect-[4/5] bg-mi-bg p-8 rounded-2xl border border-mi-border relative overflow-hidden flex flex-col"
          >
            {/* Design elements for the shared image */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-mi-accent/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl" />
            
            <div className="relative z-10 flex-1">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-mi-accent flex items-center justify-center">
                  <Flame size={16} className="text-white" />
                </div>
                <span className="font-heading text-lg tracking-widest text-white uppercase">MindInspo</span>
              </div>

              <div className="section-label mb-2">New {entry.input_type} concept</div>
              <h2 className="font-heading text-3xl text-white leading-tight mb-4">{entry.raw_input}</h2>
              <p className="font-body text-mi-text-secondary text-sm leading-relaxed line-clamp-6 mb-6">
                {entry.summary || "A new vision for the future of building."}
              </p>

              {entry.tech_stack?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {entry.tech_stack.slice(0, 4).map((t, i) => (
                    <span key={i} className="px-3 py-1 bg-white/5 border border-mi-border rounded-full text-[10px] font-body text-mi-text-muted">
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-auto pt-6 border-t border-mi-border/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-mi-accent/20 flex items-center justify-center text-[8px] text-mi-accent font-heading">
                  {(entry.author?.name || 'U')[0].toUpperCase()}
                </div>
                <span className="text-[10px] text-mi-text-muted font-body">by {entry.author?.name || 'Builder'}</span>
              </div>
              <span className="text-[10px] text-mi-accent font-body tracking-wider uppercase">mindinspo.com</span>
            </div>
          </div>

          <button 
            onClick={handleDownload}
            disabled={downloading}
            className="w-full mt-8 btn-primary justify-center py-4 text-base"
          >
            {downloading ? <Loader2 size={20} className="animate-spin" /> : <Download size={20} />}
            {downloading ? 'Generating Image...' : 'Download Image'}
          </button>
          <p className="mt-4 text-xs text-mi-text-muted font-body text-center">
            Perfect for sharing on X (Twitter), LinkedIn, or Instagram.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Trending Sidebar ─── */
function TrendingSidebar({ entries, leaderboard, loading }) {
  const trendingIdeas = [...entries]
    .sort((a, b) => (b.idea_score || 0) - (a.idea_score || 0))
    .slice(0, 5);

  const colors = ['bg-blue-500', 'bg-mi-accent', 'bg-purple-500', 'bg-green-500', 'bg-orange-500'];

  return (
    <div className="space-y-8">
      {/* Trending Ideas */}
      <div className="bg-mi-surface/30 border border-mi-border rounded-2xl p-5 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-4">
          <Flame size={16} className="text-mi-accent" />
          <h4 className="font-heading text-xs tracking-[0.2em] text-white uppercase">Trending Ideas</h4>
        </div>
        <div className="space-y-4">
          {trendingIdeas.map((idea, i) => (
            <Link 
              key={idea.id} 
              to={`/community?post=${idea.id}`}
              className="block group"
            >
              <div className="flex items-start gap-3">
                <span className="font-heading text-lg text-mi-text-muted group-hover:text-mi-accent transition-colors">0{i+1}</span>
                <div className="min-w-0">
                  <p className="font-body text-sm text-white font-medium truncate group-hover:text-mi-accent transition-colors">{idea.raw_input}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-mi-text-muted font-body uppercase tracking-wider">{idea.input_type}</span>
                    <span className="text-[10px] text-mi-text-muted">·</span>
                    <span className="flex items-center gap-1 text-[10px] text-yellow-500 font-body">
                      <Flame size={10} />
                      {idea.idea_score}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Leaderboard */}
      <div className="bg-mi-surface/30 border border-mi-border rounded-2xl p-5 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-4">
          <Trophy size={16} className="text-yellow-500" />
          <h4 className="font-heading text-xs tracking-[0.2em] text-white uppercase">Top Builders</h4>
        </div>
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-4">
              <div className="w-5 h-5 border-2 border-mi-border border-t-mi-accent rounded-full animate-spin" />
            </div>
          ) : leaderboard.length === 0 ? (
            <p className="text-[10px] text-mi-text-muted font-body text-center py-2">No builders yet.</p>
          ) : (
            leaderboard.slice(0, 5).map((builder, i) => (
              <Link key={builder.id} to={`/profile/${builder.id}`} className="flex items-center gap-3 group">
                <div className={`w-8 h-8 rounded-full ${colors[i % colors.length]} flex items-center justify-center text-[10px] font-heading text-white shrink-0 overflow-hidden`}>
                  {builder.avatar_url ? (
                    <img src={builder.avatar_url} className="w-full h-full object-cover" />
                  ) : (
                    builder.name[0].toUpperCase()
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-body text-xs text-white font-medium truncate group-hover:text-mi-accent transition-colors">{builder.name}</p>
                  <p className="font-body text-[10px] text-mi-text-muted">{builder.published_count} projects · {builder.score} pts</p>
                </div>
              </Link>
            ))
          )}
        </div>
        <Link to="/community" className="block w-full mt-4 py-2 text-[10px] font-heading tracking-widest text-mi-accent border border-mi-accent/20 rounded-lg hover:bg-mi-accent/10 transition-all uppercase text-center">
          Community Stats
        </Link>
      </div>
    </div>
  );
}

/* ─── Post Card (Twitter-like) ─── */
function PostCard({ entry, index, onLike, onBookmark, onReact, onOpenConnect, onShare, onRemix }) {
  const { isAuthenticated, user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [showUpdates, setShowUpdates] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [copied, setCopied] = useState(false);
  const viewedRef = useRef(false);

  const isOwner = user?.id === entry.user_id;

  // Count a view once per card, on first genuine interaction (expand / open
  // comments / open updates). Best-effort, fire-and-forget.
  const markViewed = () => {
    if (viewedRef.current) return;
    viewedRef.current = true;
    authFetch(`/api/community/${entry.id}/view`, { method: 'POST', noRetry: true }).catch(() => {});
  };

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days}d`;
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const techArray = Array.isArray(entry.tech_stack) ? entry.tech_stack :
    (typeof entry.tech_stack === 'string' ? (() => { try { return JSON.parse(entry.tech_stack); } catch { return []; } })() : []);

  const authorName = entry.author?.name || entry.creator || 'Anonymous Builder';
  const authorInitial = authorName[0].toUpperCase();
  const totalReactions = entry.reactions ? Object.values(entry.reactions).reduce((a, b) => a + b, 0) : 0;

  // The idea's dominant community verdict (top reaction), surfaced at a glance.
  const topReaction = (() => {
    if (!entry.reactions) return null;
    let best = null;
    for (const r of REACTION_CONFIG) {
      const c = entry.reactions[r.type] || 0;
      if (c > 0 && (!best || c > best.count)) best = { ...r, count: c };
    }
    return best;
  })();

  const [showShare, setShowShare] = useState(false);

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, border: '1px solid rgba(139, 92, 246, 0.3)', boxShadow: '0 20px 40px -20px rgba(0,0,0,0.5)' }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="relative bg-mi-surface border border-mi-border rounded-2xl overflow-hidden transition-all duration-300 group"
    >
      {/* Card header */}
      <div className="p-5 pb-0">
        <div className="flex items-start gap-3">
          <Link to={`/profile/${entry.user_id}`} className="w-10 h-10 rounded-full bg-gradient-to-br from-mi-accent/60 to-orange-600/60 flex items-center justify-center shrink-0 overflow-hidden hover:ring-2 hover:ring-mi-accent/40 transition-all">
            {entry.author?.avatar_url ? (
              <img src={entry.author.avatar_url} alt={authorName} className="w-full h-full object-cover" />
            ) : (
              <span className="font-heading text-sm text-white">{authorInitial}</span>
            )}
          </Link>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Link to={`/profile/${entry.user_id}`} className="font-body font-semibold text-sm text-white truncate hover:text-mi-accent transition-colors">{authorName}</Link>
              <span className="text-mi-text-muted font-body text-xs">·</span>
              <span className="font-body text-xs text-mi-text-muted">{timeAgo(entry.published_at || entry.created_at)}</span>
              {entry.idea_score > 0 && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-yellow-500/10 text-yellow-400 text-xs font-body font-medium" title="Idea Score">
                  <Flame size={11} />
                  {entry.idea_score}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`px-2 py-0.5 rounded-md text-xs font-body font-medium ${
                entry.input_type === 'tool'
                  ? 'bg-blue-500/10 text-blue-400'
                  : 'bg-mi-accent/10 text-mi-accent'
              }`}>
                {entry.input_type === 'tool' ? 'Tool' : 'Idea'}
              </span>
              {entry.tags?.length > 0 && entry.tags.slice(0, 3).map((tag, i) => (
                <button 
                  key={i} 
                  onClick={(e) => { e.stopPropagation(); setSearchQuery(tag); }}
                  className="text-xs text-mi-accent hover:underline font-body"
                >
                  #{tag}
                </button>
              ))}
              {entry.updates_count > 0 && (
                <span className="text-xs text-mi-text-muted font-body">· {entry.updates_count} updates</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 py-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="font-heading text-xl tracking-wide text-white leading-tight">
            {entry.raw_input}
          </h3>
          {topReaction && (
            <span
              className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-body whitespace-nowrap"
              style={{ color: topReaction.hex, background: `${topReaction.hex}1a`, boxShadow: `inset 0 0 0 1px ${topReaction.hex}33` }}
              title={`Community verdict: ${topReaction.label}`}
            >
              <topReaction.icon size={12} /> {topReaction.label}
            </span>
          )}
        </div>
        {entry.summary && (
          <div className="mb-3">
            <p className={`font-body text-sm text-mi-text-secondary leading-relaxed ${!expanded && 'line-clamp-3'}`}>
              {entry.summary}
            </p>
            {entry.summary.length > 200 && (
              <button onClick={() => { if (!expanded) markViewed(); setExpanded(!expanded); }} className="font-body text-xs text-mi-accent hover:underline mt-1">
                {expanded ? 'Show less' : 'Read more'}
              </button>
            )}
          </div>
        )}
        {techArray.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {techArray.slice(0, 5).map((tech, i) => (
              <span key={i} className="px-2.5 py-1 bg-white/5 border border-mi-border rounded-lg text-xs font-body text-mi-text-muted">{tech}</span>
            ))}
            {techArray.length > 5 && <span className="px-2.5 py-1 text-xs font-body text-mi-text-muted">+{techArray.length - 5}</span>}
          </div>
        )}
        {entry.image_url && (
          <div className="mt-3 rounded-xl overflow-hidden border border-mi-border">
            <img src={entry.image_url} alt={entry.raw_input} className="w-full h-40 sm:h-48 object-cover hover:scale-105 transition-transform duration-500" loading="lazy" />
          </div>
        )}
      </div>

      {/* Reaction Bar — animated tray */}
      <AnimatePresence initial={false}>
        {(totalReactions > 0 || showReactions) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="px-5 pb-2 overflow-hidden"
          >
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {REACTION_CONFIG.map((r, i) => {
                const count = entry.reactions?.[r.type] || 0;
                const isActive = entry.user_reactions?.includes(r.type);
                if (count === 0 && !showReactions) return null;
                return (
                  <motion.div
                    key={r.type}
                    initial={showReactions ? { opacity: 0, y: 8, scale: 0.9 } : false}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: showReactions ? i * 0.035 : 0, type: 'spring', stiffness: 500, damping: 28 }}
                  >
                    <ReactionPill
                      r={r}
                      count={count}
                      isActive={isActive}
                      disabled={!isAuthenticated}
                      onReact={(type) => onReact(entry.id, type)}
                    />
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions bar */}
      <div className="px-5 py-3 border-t border-mi-border/50 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            onClick={() => { if (!showComments) markViewed(); setShowComments(!showComments); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all font-body text-xs ${
              showComments ? 'text-blue-400 bg-blue-400/5' : 'text-mi-text-muted hover:text-blue-400 hover:bg-blue-400/5'
            }`}
          >
            <MessageSquare size={15} />
            <span>{entry.comment_count || 0}</span>
          </button>
          <button
            onClick={() => { if (!showUpdates) markViewed(); setShowUpdates(!showUpdates); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all font-body text-xs ${
              showUpdates ? 'text-mi-accent bg-mi-accent/5' : 'text-mi-text-muted hover:text-mi-accent hover:bg-mi-accent/5'
            }`}
          >
            <Clock size={15} />
            <span>{entry.updates_count || 0}</span>
          </button>
          <button
            onClick={() => onLike(entry.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all font-body text-xs ${
              entry.liked_by_user ? 'text-red-400 bg-red-400/5' : 'text-mi-text-muted hover:text-red-400 hover:bg-red-400/5'
            }`}
            title="Like"
          >
            <motion.span animate={entry.liked_by_user ? { scale: [1, 1.4, 1] } : { scale: 1 }} transition={{ duration: 0.3 }} className="flex">
              <Heart size={15} fill={entry.liked_by_user ? 'currentColor' : 'none'} />
            </motion.span>
            <span>{entry.like_count || 0}</span>
          </button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowReactions(!showReactions)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all font-body text-xs ${
              showReactions ? 'text-yellow-400 bg-yellow-400/5' : 'text-mi-text-muted hover:text-yellow-400 hover:bg-yellow-400/5'
            }`}
            title="React"
          >
            <motion.span animate={showReactions ? { rotate: [0, -12, 12, 0] } : {}} transition={{ duration: 0.4 }} className="flex">
              <Flame size={15} />
            </motion.span>
            <span>{totalReactions}</span>
          </motion.button>
          {isAuthenticated && !isOwner && (
            <button
              onClick={() => onOpenConnect(entry)}
              disabled={entry.connect_sent}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all font-body text-xs ${
                entry.connect_sent
                  ? 'text-green-400 bg-green-400/5 cursor-default'
                  : 'text-mi-text-muted hover:text-purple-400 hover:bg-purple-400/5'
              }`}
              title={entry.connect_sent ? 'Request sent' : 'Collaborate'}
            >
              <Handshake size={15} />
              <span>{entry.connect_sent ? 'Sent' : 'Connect'}</span>
            </button>
          )}
          {isAuthenticated && !isOwner && (
            <button
              onClick={() => onRemix(entry)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all font-body text-xs text-mi-text-muted hover:text-mi-accent hover:bg-mi-accent/5"
              title="Remix this idea into your catalog"
            >
              <GitFork size={15} />
              <span>Remix</span>
            </button>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onBookmark(entry.id)}
            className={`p-1.5 rounded-lg transition-all ${entry.bookmarked_by_user ? 'text-mi-accent' : 'text-mi-text-muted hover:text-mi-accent'}`}
            title="Bookmark"
          >
            <Bookmark size={15} fill={entry.bookmarked_by_user ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={() => {
              // Backend /i/<id> serves OG tags so the link unfurls on social platforms.
              const shareUrl = `${API_BASE_URL || window.location.origin}/i/${entry.id}`;
              navigator.clipboard.writeText(shareUrl);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="p-1.5 rounded-lg text-mi-text-muted hover:text-white transition-colors" title="Copy share link"
          >
            {copied ? <Check size={15} className="text-green-400" /> : <Share2 size={15} />}
          </button>
          <button
            onClick={() => onShare(entry)}
            className="p-1.5 rounded-lg text-mi-text-muted hover:text-mi-accent transition-colors" title="Export as image"
          >
            <Camera size={15} />
          </button>
        </div>
      </div>

      {/* Comments section */}
      <AnimatePresence>
        <CommentSection entryId={entry.id} isOpen={showComments} onClose={() => setShowComments(false)} />
      </AnimatePresence>

      {/* Updates section */}
      <AnimatePresence>
        <UpdatesSection entryId={entry.id} isOpen={showUpdates} onClose={() => setShowUpdates(false)} />
      </AnimatePresence>
    </motion.article>
  );
}


export default function CommunityPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [filterType, setFilterType] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [connectModal, setConnectModal] = useState({ open: false, entryId: null, ideaTitle: '' });
  const [leaderboard, setLeaderboard] = useState([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const [shareEntry, setShareEntry] = useState(null);

  const fetchFeed = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), per_page: '20', sort: sortBy, type: filterType });
      if (searchQuery.trim()) params.set('q', searchQuery);
      const res = await authFetch(`/api/community/feed?${params}`);
      if (res.ok) {
        const data = await res.json();
        setEntries(data.entries || []);
        setTotalPages(data.pages || 1);
        setTotal(data.total || 0);
      }
    } catch (e) { console.error('Failed to fetch feed', e); }
    finally { setLoading(false); }
  }, [page, sortBy, filterType, searchQuery]);

  const fetchLeaderboard = useCallback(async () => {
    setLoadingLeaderboard(true);
    try {
      const res = await authFetch('/api/community/leaderboard');
      if (res.ok) setLeaderboard(await res.json());
    } catch (e) { console.error('Failed to fetch leaderboard', e); }
    finally { setLoadingLeaderboard(false); }
  }, []);

  useEffect(() => { fetchFeed(); }, [fetchFeed]);
  useEffect(() => { fetchLeaderboard(); }, [fetchLeaderboard]);
  useEffect(() => { setPage(1); }, [searchQuery, sortBy, filterType]);

  const handleLike = async (entryId) => {
    if (!isAuthenticated) return;
    
    // Optimistic UI Update
    setEntries(prev => prev.map(e => {
      if (e.id === entryId) {
        return {
          ...e,
          liked_by_user: !e.liked_by_user,
          like_count: e.liked_by_user ? Math.max(0, (e.like_count || 0) - 1) : (e.like_count || 0) + 1
        };
      }
      return e;
    }));

    try {
      const res = await authFetch(`/api/community/${entryId}/like`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        // Sync with exact server count if needed
        setEntries(prev => prev.map(e => e.id === entryId ? { ...e, liked_by_user: data.liked, like_count: data.like_count } : e));
      }
    } catch (e) { console.error(e); }
  };

  const handleBookmark = async (entryId) => {
    if (!isAuthenticated) return;

    // Optimistic UI Update
    setEntries(prev => prev.map(e => e.id === entryId ? { ...e, bookmarked_by_user: !e.bookmarked_by_user } : e));

    try {
      const res = await authFetch(`/api/community/${entryId}/bookmark`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setEntries(prev => prev.map(e => e.id === entryId ? { ...e, bookmarked_by_user: data.bookmarked } : e));
      }
    } catch (e) { console.error(e); }
  };

  const handleReact = async (entryId, reactionType) => {
    if (!isAuthenticated) return;
    
    // Optimistic UI Update
    setEntries(prev => prev.map(e => {
      if (e.id === entryId) {
        const hasReacted = (e.user_reactions || []).includes(reactionType);
        const newUserReactions = hasReacted 
          ? (e.user_reactions || []).filter(r => r !== reactionType)
          : [...(e.user_reactions || []), reactionType];
          
        const currentCount = e.reactions?.[reactionType] || 0;
        const newReactions = {
          ...(e.reactions || {}),
          [reactionType]: hasReacted ? Math.max(0, currentCount - 1) : currentCount + 1
        };
        
        return { ...e, user_reactions: newUserReactions, reactions: newReactions };
      }
      return e;
    }));

    try {
      const res = await authFetch(`/api/community/${entryId}/react`, {
        method: 'POST',
        body: JSON.stringify({ reaction_type: reactionType }),
      });
      if (res.ok) {
        const data = await res.json();
        setEntries(prev => prev.map(e =>
          e.id === entryId ? { ...e, reactions: data.reactions, user_reactions: data.user_reactions } : e
        ));
      }
    } catch (e) { console.error(e); }
  };

  const handleRemix = async (entry) => {
    if (!isAuthenticated) return;
    const t = toast.loading('Remixing idea…');
    try {
      const res = await authFetch(`/api/catalogs/${entry.id}/remix`, { method: 'POST' });
      if (res.ok) {
        toast.success('Remixed into your catalog as a draft', { id: t });
        navigate('/dashboard');
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || 'Could not remix', { id: t });
      }
    } catch (e) {
      toast.error('Could not remix', { id: t });
    }
  };

  return (
    <div className="pt-24 pb-16 relative overflow-hidden min-h-screen">
      {/* Ambient Background Orbs */}
      <div className="absolute -top-20 left-1/4 w-[500px] h-[500px] bg-mi-accent/10 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animationDuration: '4s' }} />
      <div className="absolute top-40 right-1/4 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" style={{ animation: 'pulse 5s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />

      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 relative z-10">
        {/* ── Hero Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
            <div>
              <div className="section-label mb-3">Community Hub</div>
              <h1 className="font-heading text-[clamp(2.5rem,5vw,4rem)] tracking-wide text-white leading-none">
                EXPLORE <span className="text-mi-accent">/</span> IDEAS.
              </h1>
              <p className="font-body text-mi-text-secondary mt-3 max-w-lg text-sm">
                Discover what others are building. Comment, collaborate, and find your next project partner.
                {total > 0 && <span className="text-white font-medium"> {total} ideas published.</span>}
              </p>
            </div>
            {isAuthenticated ? (
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link to="/publish" className="btn-primary shrink-0">
                  <Flame size={16} />
                  Publish Your Idea
                </Link>
              </motion.div>
            ) : (
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link to="/login?mode=register" className="btn-primary shrink-0">
                  <ArrowUpRight size={16} />
                  Join Community
                </Link>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* ── Toolbar ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8 pb-6 border-b border-mi-border"
        >
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-mi-text-muted" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ideas, tools, concepts..."
              className="input-editorial pl-11 py-3"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex bg-mi-surface border border-mi-border rounded-xl overflow-hidden">
              <button
                onClick={() => setSortBy('recent')}
                className={`flex items-center gap-1.5 px-4 py-2.5 font-body text-xs transition-colors ${
                  sortBy === 'recent' ? 'bg-mi-accent/10 text-mi-accent' : 'text-mi-text-muted hover:text-white'
                }`}
              >
                <Clock size={14} />
                Recent
              </button>
              <button
                onClick={() => setSortBy('popular')}
                className={`flex items-center gap-1.5 px-4 py-2.5 font-body text-xs transition-colors ${
                  sortBy === 'popular' ? 'bg-mi-accent/10 text-mi-accent' : 'text-mi-text-muted hover:text-white'
                }`}
              >
                <TrendingUp size={14} />
                Popular
              </button>
              <button
                onClick={() => setSortBy('trending')}
                className={`flex items-center gap-1.5 px-4 py-2.5 font-body text-xs transition-colors ${
                  sortBy === 'trending' ? 'bg-mi-accent/10 text-mi-accent' : 'text-mi-text-muted hover:text-white'
                }`}
              >
                <Flame size={14} />
                Trending
              </button>
            </div>

            <div className="flex bg-mi-surface border border-mi-border rounded-xl overflow-hidden">
              {[
                { value: 'all', label: 'All' },
                { value: 'idea', label: 'Ideas', icon: Lightbulb },
                { value: 'tool', label: 'Tools', icon: Wrench },
              ].map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFilterType(f.value)}
                  className={`flex items-center gap-1.5 px-3 py-2.5 font-body text-xs transition-colors ${
                    filterType === f.value ? 'bg-mi-accent/10 text-mi-accent' : 'text-mi-text-muted hover:text-white'
                  }`}
                >
                  {f.icon && <f.icon size={13} />}
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── Feed & Sidebar ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr,320px] gap-10 items-start">
          {/* Main Feed */}
          <div>
            {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => <PostCardSkeleton key={i} />)}
            </div>
          ) : entries.length === 0 ? (
            <div className="py-10 border border-dashed border-mi-border bg-mi-surface/50 rounded-2xl">
              <EmptyState 
                icon={Users}
                title={searchQuery ? 'NO RESULTS FOUND' : 'NO IDEAS YET'}
                description={searchQuery
                  ? 'Try a different search term.'
                  : 'Be the first to share your idea with the community!'}
                action={isAuthenticated ? (
                  <Link to="/publish" className="btn-primary mt-4">
                    <Flame size={16} />
                    Publish an Idea
                  </Link>
                ) : (
                  <Link to="/login?mode=register" className="btn-primary mt-4">
                    <ArrowUpRight size={16} />
                    Get Started
                  </Link>
                )}
              />
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {entries.map((entry, index) => (
                  <PostCard
                    key={entry.id}
                    entry={entry}
                    index={index}
                    onLike={handleLike}
                    onBookmark={handleBookmark}
                    onReact={handleReact}
                    onOpenConnect={(e) => setConnectModal({ open: true, entryId: e.id, ideaTitle: e.raw_input })}
                    onShare={(e) => setShareEntry(e)}
                    onRemix={handleRemix}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-10">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-10 h-10 rounded-xl font-body text-sm transition-all ${
                        p === page
                          ? 'bg-mi-accent text-white'
                          : 'bg-mi-surface border border-mi-border text-mi-text-muted hover:border-mi-border-light hover:text-white'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
          </div>

          {/* Sidebar */}
          <aside className="hidden lg:block sticky top-24 space-y-8">
            <TrendingSidebar entries={entries} leaderboard={leaderboard} loading={loadingLeaderboard} />
          </aside>
        </div>
      </div>

      {/* Connect Modal */}
      <ConnectModal
        isOpen={connectModal.open}
        onClose={() => { setConnectModal({ open: false, entryId: null, ideaTitle: '' }); fetchFeed(); }}
        entryId={connectModal.entryId}
        ideaTitle={connectModal.ideaTitle}
      />

      <AnimatePresence>
        {shareEntry && (
          <SocialShareModal 
            entry={shareEntry} 
            isOpen={!!shareEntry} 
            onClose={() => setShareEntry(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
