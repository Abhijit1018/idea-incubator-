import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, TrendingUp, Clock, Sparkles, MessageSquare,
  Heart, Share2, ArrowUpRight, Lightbulb, Wrench,
  Users, Bookmark, MoreHorizontal, Send, X, ChevronDown, Flame, Handshake, Check
} from 'lucide-react';
import { authFetch } from '../lib/api';
import { useAuth } from '../lib/AuthContext';
import ConnectModal from '../components/ConnectModal';

const REACTION_CONFIG = [
  { type: 'brilliant', emoji: '💡', label: 'Brilliant' },
  { type: 'interested', emoji: '👀', label: 'Interested' },
  { type: 'sellable', emoji: '💰', label: 'Sellable' },
  { type: 'build_worthy', emoji: '🔨', label: 'Build-worthy' },
  { type: 'needs_work', emoji: '🔧', label: 'Needs work' },
];

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

/* ─── Post Card (Twitter-like) ─── */
function PostCard({ entry, index, onLike, onBookmark, onReact, onOpenConnect }) {
  const { isAuthenticated, user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [showUpdates, setShowUpdates] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [copied, setCopied] = useState(false);

  const isOwner = user?.id === entry.user_id;

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

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="relative bg-mi-surface border border-mi-border rounded-2xl overflow-hidden hover:border-mi-border-light transition-all duration-300 group"
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
              {entry.tags?.length > 0 && entry.tags.slice(0, 2).map((tag, i) => (
                <span key={i} className="text-xs text-mi-text-muted font-body">#{tag}</span>
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
        <h3 className="font-heading text-xl tracking-wide text-white mb-2 leading-tight">
          {entry.raw_input}
        </h3>
        {entry.summary && (
          <div className="mb-3">
            <p className={`font-body text-sm text-mi-text-secondary leading-relaxed ${!expanded && 'line-clamp-3'}`}>
              {entry.summary}
            </p>
            {entry.summary.length > 200 && (
              <button onClick={() => setExpanded(!expanded)} className="font-body text-xs text-mi-accent hover:underline mt-1">
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
            <img src={entry.image_url} alt={entry.raw_input} className="w-full h-48 object-cover hover:scale-105 transition-transform duration-500" loading="lazy" />
          </div>
        )}
      </div>

      {/* Reaction Bar */}
      {(totalReactions > 0 || showReactions) && (
        <div className="px-5 pb-2 flex flex-wrap gap-1.5">
          {REACTION_CONFIG.map((r) => {
            const count = entry.reactions?.[r.type] || 0;
            const isActive = entry.user_reactions?.includes(r.type);
            if (count === 0 && !showReactions) return null;
            return (
              <button
                key={r.type}
                onClick={() => isAuthenticated && onReact(entry.id, r.type)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-body transition-all duration-200 border ${
                  isActive
                    ? 'bg-mi-accent/10 border-mi-accent/30 text-white'
                    : 'bg-white/3 border-mi-border hover:border-mi-border-light text-mi-text-muted hover:text-white'
                }`}
                title={r.label}
              >
                <span>{r.emoji}</span>
                {count > 0 && <span>{count}</span>}
              </button>
            );
          })}
        </div>
      )}

      {/* Actions bar */}
      <div className="px-5 py-3 border-t border-mi-border/50 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowComments(!showComments)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all font-body text-xs ${
              showComments ? 'text-blue-400 bg-blue-400/5' : 'text-mi-text-muted hover:text-blue-400 hover:bg-blue-400/5'
            }`}
          >
            <MessageSquare size={15} />
            <span>{entry.comment_count || 0}</span>
          </button>
          <button
            onClick={() => setShowUpdates(!showUpdates)}
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
            <Heart size={15} fill={entry.liked_by_user ? 'currentColor' : 'none'} />
            <span>{entry.like_count || 0}</span>
          </button>
          <button
            onClick={() => setShowReactions(!showReactions)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all font-body text-xs ${
              showReactions ? 'text-yellow-400 bg-yellow-400/5' : 'text-mi-text-muted hover:text-yellow-400 hover:bg-yellow-400/5'
            }`}
            title="React"
          >
            <Sparkles size={15} />
            <span>{totalReactions}</span>
          </button>
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
              navigator.clipboard.writeText(window.location.origin + '/community?post=' + entry.id);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="p-1.5 rounded-lg text-mi-text-muted hover:text-white transition-colors" title="Copy link"
          >
            {copied ? <Check size={15} className="text-green-400" /> : <Share2 size={15} />}
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
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [filterType, setFilterType] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [connectModal, setConnectModal] = useState({ open: false, entryId: null, ideaTitle: '' });

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

  useEffect(() => { fetchFeed(); }, [fetchFeed]);
  useEffect(() => { setPage(1); }, [searchQuery, sortBy, filterType]);

  const handleLike = async (entryId) => {
    if (!isAuthenticated) return;
    try {
      const res = await authFetch(`/api/community/${entryId}/like`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setEntries(prev => prev.map(e => e.id === entryId ? { ...e, liked_by_user: data.liked, like_count: data.like_count } : e));
      }
    } catch (e) { console.error(e); }
  };

  const handleBookmark = async (entryId) => {
    if (!isAuthenticated) return;
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

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">

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
              <Link to="/publish" className="btn-primary shrink-0">
                <Sparkles size={16} />
                Publish Your Idea
              </Link>
            ) : (
              <Link to="/login?mode=register" className="btn-primary shrink-0">
                <ArrowUpRight size={16} />
                Join Community
              </Link>
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

        {/* ── Feed ── */}
        <div className="max-w-2xl mx-auto">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-2 border-mi-border border-t-mi-accent rounded-full animate-spin" />
            </div>
          ) : entries.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <Users size={40} className="mx-auto text-mi-text-muted mb-4" />
              <p className="font-heading text-2xl text-mi-text-muted tracking-wide mb-2">
                {searchQuery ? 'NO RESULTS FOUND' : 'NO IDEAS YET'}
              </p>
              <p className="font-body text-sm text-mi-text-muted mb-6">
                {searchQuery
                  ? 'Try a different search term.'
                  : 'Be the first to share your idea with the community!'}
              </p>
              {isAuthenticated ? (
                <Link to="/publish" className="btn-primary">
                  <Sparkles size={16} />
                  Publish an Idea
                </Link>
              ) : (
                <Link to="/login?mode=register" className="btn-primary">
                  <ArrowUpRight size={16} />
                  Get Started
                </Link>
              )}
            </motion.div>
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
      </div>

      {/* Connect Modal */}
      <ConnectModal
        isOpen={connectModal.open}
        onClose={() => { setConnectModal({ open: false, entryId: null, ideaTitle: '' }); fetchFeed(); }}
        entryId={connectModal.entryId}
        ideaTitle={connectModal.ideaTitle}
      />
    </div>
  );
}
