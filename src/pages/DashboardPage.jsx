import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lightbulb, Wrench, Clock, CheckCircle2, AlertTriangle, Search,
  ArrowUpRight, Plus, TrendingUp, Sparkles, Zap, ArrowRight,
  BarChart3, Activity, Eye, Filter, LayoutGrid, List, Handshake, Check, X as X2, Loader2, Inbox
} from 'lucide-react';
import { CatalogCardSkeleton, StatCardSkeleton } from '../components/SkeletonLoaders';
import { useAuth } from '../lib/AuthContext';
import { authFetch } from '../lib/api';
import CatalogCard from '../components/CatalogCard';
import IdeaDetail from '../components/IdeaDetail';
import IdeaInput from '../components/IdeaInput';
import EmptyState from '../components/EmptyState';
import PipelineStatus from '../components/PipelineStatus';

/* ─── Stat Card ─── */
function StatCard({ icon: Icon, label, value, accent, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="relative group p-6 rounded-2xl bg-mi-surface border border-mi-border hover:border-mi-border-light transition-all duration-300 overflow-hidden"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
            <Icon size={18} className="text-mi-text-muted" />
          </div>
        </div>
        <div className="font-heading text-4xl tracking-wide text-white">{value}</div>
        <div className="font-body text-sm text-mi-text-muted mt-1">{label}</div>
      </div>
    </motion.div>
  );
}

/* ─── Activity Item ─── */
function ActivityItem({ entry, index }) {
  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-center gap-4 py-3 border-b border-mi-border/50 last:border-0"
    >
      <div className={`w-2 h-2 rounded-full shrink-0 ${
        entry.status === 'completed' ? 'bg-green-400' :
        entry.status === 'pending' ? 'bg-yellow-400 animate-pulse' :
        'bg-red-400'
      }`} />
      <div className="flex-1 min-w-0">
        <p className="font-body text-sm text-white truncate">{entry.raw_input}</p>
        <p className="font-body text-xs text-mi-text-muted">
          {entry.input_type === 'tool' ? 'Tool' : 'Idea'} • {entry.status}
        </p>
      </div>
      <span className="font-body text-xs text-mi-text-muted shrink-0">
        {timeAgo(entry.created_at)}
      </span>
    </motion.div>
  );
}


export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [filterStatus, setFilterStatus] = useState('all');
  const [showInput, setShowInput] = useState(false);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [requestTab, setRequestTab] = useState('incoming');
  const [respondingTo, setRespondingTo] = useState(null);

  const displayName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Builder';

  useEffect(() => {
    fetchCatalogs();
    fetchRequests();
    const interval = setInterval(() => {
      fetchCatalogs();
      fetchRequests();
    }, 10000); // 10s polling
    return () => clearInterval(interval);
  }, [searchQuery]);

  const fetchRequests = async () => {
    try {
      const [incRes, sentRes] = await Promise.all([
        authFetch('/api/connect/requests'),
        authFetch('/api/connect/sent')
      ]);
      if (incRes.ok) setIncomingRequests(await incRes.json());
      if (sentRes.ok) setSentRequests(await sentRes.json());
    } catch (e) { console.error(e); }
  };

  const handleRespond = async (requestId, action) => {
    setRespondingTo(requestId);
    try {
      const res = await authFetch(`/api/connect/requests/${requestId}/respond`, {
        method: 'POST', body: JSON.stringify({ action }),
      });
      if (res.ok) fetchRequests();
    } catch (e) { console.error(e); }
    finally { setRespondingTo(null); }
  };

  const ROLE_LABELS = { co_founder: 'Co-Founder', developer: 'Developer', designer: 'Designer', advisor: 'Advisor', investor: 'Investor' };
  const ROLE_COLORS = { co_founder: 'text-orange-400 bg-orange-400/10', developer: 'text-blue-400 bg-blue-400/10', designer: 'text-purple-400 bg-purple-400/10', advisor: 'text-green-400 bg-green-400/10', investor: 'text-yellow-400 bg-yellow-400/10' };

  const fetchCatalogs = async () => {
    try {
      let res;
      if (searchQuery.trim()) {
        setIsSearching(true);
        res = await authFetch('/api/catalogs/search', {
          method: 'POST',
          body: JSON.stringify({ query: searchQuery, limit: 50 })
        });
      } else {
        res = await authFetch('/api/catalogs/');
      }

      if (res.ok) {
        const data = await res.json();
        setEntries(data);
      }
    } catch (e) {
      console.error('Failed to fetch catalogs', e);
    } finally {
      setIsSearching(false);
      if (loading) setLoading(false);
    }
  };

  const handleIdeaSubmit = async ({ raw_input, input_type }) => {
    setIsSubmitting(true);
    try {
      const res = await authFetch('/api/ideas/submit', {
        method: 'POST',
        body: JSON.stringify({ raw_input, input_type })
      });
      if (res.ok) {
        setShowInput(false);
        fetchCatalogs();
      }
    } catch (e) {
      console.error('Failed to submit idea', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Computed stats
  const stats = useMemo(() => {
    const total = entries.length;
    const completed = entries.filter(e => e.status === 'completed').length;
    const pending = entries.filter(e => e.status === 'pending').length;
    const ideas = entries.filter(e => e.input_type === 'idea').length;
    const tools = entries.filter(e => e.input_type === 'tool').length;
    const published = entries.filter(e => e.visibility === 'public').length;
    return { total, completed, pending, ideas, tools, published };
  }, [entries]);

  // Filtered entries
  const filteredEntries = useMemo(() => {
    if (filterStatus === 'all') return entries;
    return entries.filter(e => e.status === filterStatus);
  }, [entries, filterStatus]);

  // Recent activity (last 5)
  const recentActivity = useMemo(() => {
    return [...entries].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5);
  }, [entries]);

  // If showing detail view
  if (selectedEntry) {
    return (
      <div className="pt-24 pb-16 px-6 lg:px-10 max-w-[1400px] mx-auto">
        <IdeaDetail
          entry={selectedEntry}
          onBack={() => setSelectedEntry(null)}
          onEntryUpdate={(updatedEntry) => {
            setSelectedEntry(updatedEntry);
            setEntries(prev => prev.map(e => e.id === updatedEntry.id ? updatedEntry : e));
          }}
        />
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16 relative overflow-hidden min-h-screen">
      {/* Ambient Background Orbs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-mi-accent/5 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animationDuration: '6s' }} />
      <div className="absolute top-40 left-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" style={{ animation: 'pulse 5s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />

      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 relative z-10">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10"
        >
          <div>
            <p className="font-body text-sm text-mi-text-muted mb-1">
              Welcome back,
            </p>
            <h1 className="font-heading text-[clamp(2rem,4vw,3.5rem)] tracking-wide text-white leading-none">
              {displayName.toUpperCase()}
            </h1>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowInput(!showInput)}
            className="btn-primary"
          >
            <Plus size={18} />
            New Idea
          </motion.button>
        </motion.div>

        {/* ── Idea Input Overlay ── */}
        <AnimatePresence>
          {showInput && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-10"
            >
              <div className="bg-mi-surface border border-mi-border rounded-2xl p-6">
                <IdeaInput onSubmit={handleIdeaSubmit} isSubmitting={isSubmitting} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Stats Grid ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatCard icon={Sparkles} label="Total Ideas" value={stats.total} accent="from-mi-accent/5 to-transparent" delay={0} />
          <StatCard icon={CheckCircle2} label="Completed" value={stats.completed} accent="from-green-500/5 to-transparent" delay={0.05} />
          <StatCard icon={Clock} label="Processing" value={stats.pending} accent="from-yellow-500/5 to-transparent" delay={0.1} />
          <StatCard icon={Wrench} label="Tools Analyzed" value={stats.tools} accent="from-blue-500/5 to-transparent" delay={0.15} />
        </div>

        {/* ── Main Content Area ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Left: Catalog List (2/3) ── */}
          <div className="lg:col-span-2">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-mi-text-muted" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search your catalogs..."
                  className="input-editorial pl-11 py-3"
                />
              </div>

              <div className="flex items-center gap-2">
                {/* Filter */}
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-mi-surface border border-mi-border text-mi-text-secondary px-3 py-2.5 rounded-xl text-sm font-body focus:outline-none focus:border-mi-accent transition-colors cursor-pointer"
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>

                {/* View toggle */}
                <div className="flex bg-mi-surface border border-mi-border rounded-xl overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2.5 transition-colors ${viewMode === 'grid' ? 'bg-mi-accent/10 text-mi-accent' : 'text-mi-text-muted hover:text-white'}`}
                  >
                    <LayoutGrid size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2.5 transition-colors ${viewMode === 'list' ? 'bg-mi-accent/10 text-mi-accent' : 'text-mi-text-muted hover:text-white'}`}
                  >
                    <List size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Entries count */}
            <div className="flex items-center gap-2 mb-4">
              <span className="font-body text-xs text-mi-text-muted">
                {filteredEntries.length} {filteredEntries.length === 1 ? 'entry' : 'entries'}
                {filterStatus !== 'all' && ` (${filterStatus})`}
                {isSearching && ' • Searching...'}
              </span>
            </div>

            {/* Pipeline Status */}
            <PipelineStatus entries={entries} />

            {/* Entries Grid/List */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => <CatalogCardSkeleton key={i} />)}
              </div>
            ) : filteredEntries.length === 0 ? (
              <div className="py-10 rounded-2xl border border-dashed border-mi-border bg-mi-surface/50">
                <EmptyState 
                  icon={Lightbulb}
                  title="NO IDEAS YET"
                  description={filterStatus !== 'all' ? `No ${filterStatus} ideas found.` : 'Start by dropping your first idea above.'}
                  action={filterStatus === 'all' && (
                    <button onClick={() => setShowInput(true)} className="btn-primary mt-4">
                      <Plus size={16} />
                      Drop Your First Idea
                    </button>
                  )}
                />
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                {filteredEntries.map((entry, index) => (
                  <CatalogCard
                    key={entry.id}
                    entry={entry}
                    index={index}
                    onSelect={() => setSelectedEntry(entry)}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredEntries.map((entry, index) => (
                  <motion.button
                    key={entry.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => setSelectedEntry(entry)}
                    className="w-full flex items-center gap-4 p-4 bg-mi-surface border border-mi-border rounded-xl hover:border-mi-border-light transition-all duration-200 text-left group"
                  >
                    <div className={`w-2 h-2 rounded-full shrink-0 ${
                      entry.status === 'completed' ? 'bg-green-400' :
                      entry.status === 'pending' ? 'bg-yellow-400 animate-pulse' :
                      'bg-red-400'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-body text-sm text-white truncate group-hover:text-mi-accent transition-colors">
                        {entry.raw_input}
                      </p>
                    </div>
                    <span className="px-2 py-0.5 bg-mi-accent/10 text-mi-accent text-xs font-body rounded-md shrink-0">
                      {entry.input_type}
                    </span>
                    <ArrowRight size={14} className="text-mi-text-muted group-hover:text-mi-accent transition-colors shrink-0" />
                  </motion.button>
                ))}
              </div>
            )}
          </div>

          {/* ── Right: Sidebar (1/3) ── */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="p-6 rounded-2xl bg-mi-surface border border-mi-border">
              <div className="flex items-center gap-2 mb-5">
                <BarChart3 size={16} className="text-mi-accent" />
                <h3 className="font-heading text-lg tracking-wide text-white">BREAKDOWN</h3>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Ideas', value: stats.ideas, total: stats.total, color: 'bg-mi-accent' },
                  { label: 'Tools', value: stats.tools, total: stats.total, color: 'bg-blue-400' },
                  { label: 'Completed', value: stats.completed, total: stats.total, color: 'bg-green-400' },
                  { label: 'Published', value: stats.published, total: stats.total, color: 'bg-mi-accent' },
                  { label: 'Processing', value: stats.pending, total: stats.total, color: 'bg-yellow-400' },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-body text-xs text-mi-text-muted">{item.label}</span>
                      <span className="font-body text-xs text-white">{item.value}</span>
                    </div>
                    <div className="h-1.5 bg-mi-border rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: item.total > 0 ? `${(item.value / item.total) * 100}%` : '0%' }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className={`h-full rounded-full ${item.color}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="p-6 rounded-2xl bg-mi-surface border border-mi-border">
              <div className="flex items-center gap-2 mb-5">
                <Activity size={16} className="text-mi-accent" />
                <h3 className="font-heading text-lg tracking-wide text-white">RECENT</h3>
              </div>
              {recentActivity.length > 0 ? (
                <div>
                  {recentActivity.map((entry, i) => (
                    <ActivityItem key={entry.id} entry={entry} index={i} />
                  ))}
                </div>
              ) : (
                <EmptyState 
                  icon={Activity} 
                  title="Quiet here..." 
                  description="No recent activity to show." 
                />
              )}
            </div>

            {/* Collaboration Requests */}
            <div className="p-6 rounded-2xl bg-mi-surface border border-mi-border">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Handshake size={16} className="text-mi-accent" />
                  <h3 className="font-heading text-lg tracking-wide text-white">PARTNERSHIPS</h3>
                </div>
                <div className="flex bg-mi-bg/50 rounded-lg p-0.5 border border-mi-border">
                  <button 
                    onClick={() => setRequestTab('incoming')}
                    className={`px-3 py-1 text-[10px] font-heading tracking-wider rounded-md transition-all ${requestTab === 'incoming' ? 'bg-mi-accent text-white shadow-lg' : 'text-mi-text-muted hover:text-white'}`}
                  >
                    INCOMING
                  </button>
                  <button 
                    onClick={() => setRequestTab('sent')}
                    className={`px-3 py-1 text-[10px] font-heading tracking-wider rounded-md transition-all ${requestTab === 'sent' ? 'bg-mi-accent text-white shadow-lg' : 'text-mi-text-muted hover:text-white'}`}
                  >
                    SENT
                  </button>
                </div>
              </div>

              {requestTab === 'incoming' ? (
                incomingRequests.length === 0 ? (
                  <EmptyState icon={Inbox} title="Zero requests" description="You don't have any pending requests." />
                ) : (
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                    {incomingRequests.map((req) => (
                      <div key={req.id} className={`p-3 rounded-xl border transition-all ${
                        req.status === 'pending' ? 'border-mi-accent/20 bg-mi-accent/[0.03]' : 'border-mi-border bg-mi-bg/50'
                      }`}>
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-mi-accent/40 to-orange-600/40 flex items-center justify-center shrink-0">
                            <span className="text-[10px] text-white font-heading">{(req.requester?.name || '?')[0].toUpperCase()}</span>
                          </div>
                          <span className="font-body text-xs text-white font-medium truncate">{req.requester?.name || 'Unknown'}</span>
                          <span className={`ml-auto px-1.5 py-0.5 rounded-md text-[10px] font-body font-medium ${ROLE_COLORS[req.role] || 'text-mi-text-muted bg-white/5'}`}>
                            {ROLE_LABELS[req.role] || req.role}
                          </span>
                        </div>
                        <p className="font-body text-xs text-mi-text-muted truncate mb-1">{req.idea_title}</p>
                        {req.message && <p className="font-body text-xs text-mi-text-secondary italic mb-2 line-clamp-2">"{req.message}"</p>}
                        {req.status === 'pending' ? (
                          <div className="flex gap-2">
                            <button onClick={() => handleRespond(req.id, 'accept')} disabled={respondingTo === req.id}
                              className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-green-500/10 text-green-400 text-xs font-body hover:bg-green-500/20 transition-colors disabled:opacity-50">
                              {respondingTo === req.id ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />} Accept
                            </button>
                            <button onClick={() => handleRespond(req.id, 'decline')} disabled={respondingTo === req.id}
                              className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-xs font-body hover:bg-red-500/20 transition-colors disabled:opacity-50">
                              <X2 size={12} /> Decline
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className={`flex items-center gap-1 text-xs font-body ${req.status === 'accepted' ? 'text-green-400' : 'text-mi-text-muted'}`}>
                              {req.status === 'accepted' ? <><Check size={12} /> Accepted</> : <><X2 size={12} /> Declined</>}
                            </span>
                            {req.status === 'accepted' && req.requester?.email && (
                              <span className="text-[10px] font-body text-mi-accent truncate">{req.requester.email}</span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )
              ) : (
                sentRequests.length === 0 ? (
                  <EmptyState icon={Send} title="No sent requests" description="Explore community to find partners." />
                ) : (
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                    {sentRequests.map((req) => (
                      <div key={req.id} className="p-3 rounded-xl border border-mi-border bg-mi-bg/50">
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-mi-border">
                            <span className="text-[10px] text-mi-text-muted font-heading">{(req.owner?.name || '?')[0].toUpperCase()}</span>
                          </div>
                          <span className="font-body text-xs text-mi-text-muted font-medium truncate">To: {req.owner?.name || 'Owner'}</span>
                          <span className={`ml-auto px-1.5 py-0.5 rounded-md text-[10px] font-body font-medium ${ROLE_COLORS[req.role] || 'text-mi-text-muted bg-white/5'}`}>
                            {ROLE_LABELS[req.role] || req.role}
                          </span>
                        </div>
                        <p className="font-body text-xs text-white truncate mb-1">{req.idea_title}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-heading tracking-wider uppercase ${
                            req.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400' : 
                            req.status === 'accepted' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                          }`}>
                            {req.status}
                          </span>
                          {req.status === 'accepted' && req.owner?.email && (
                            <span className="text-[10px] font-body text-mi-accent truncate">{req.owner.email}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>

            {/* Quick Actions */}
            <div className="p-6 rounded-2xl bg-mi-surface border border-mi-border">
              <div className="flex items-center gap-2 mb-5">
                <Zap size={16} className="text-mi-accent" />
                <h3 className="font-heading text-lg tracking-wide text-white">QUICK ACTIONS</h3>
              </div>
              <div className="space-y-2">
                <button onClick={() => setShowInput(true)} className="w-full flex items-center gap-3 p-3 rounded-xl bg-mi-accent/5 border border-mi-accent/20 text-mi-accent font-body text-sm hover:bg-mi-accent/10 transition-colors">
                  <Plus size={16} /> New Idea
                </button>
                <Link to="/community" className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/3 border border-mi-border text-mi-text-secondary font-body text-sm hover:bg-white/5 hover:border-mi-border-light transition-colors">
                  <Eye size={16} /> Browse Community
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
