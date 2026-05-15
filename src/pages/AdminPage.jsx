import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, Users, Lightbulb, TrendingUp, BarChart3, 
  Search, Filter, ExternalLink, Trash2, CheckCircle2, 
  AlertTriangle, Loader2, ArrowUpRight, Inbox, Eye
} from 'lucide-react';
import { authFetch } from '../lib/api';
import { useAuth } from '../lib/AuthContext';
import { StatCardSkeleton } from '../components/SkeletonLoaders';
import toast from 'react-hot-toast';
import { Link, Navigate } from 'react-router-dom';

function AdminStatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="bg-mi-surface border border-mi-border rounded-2xl p-6 relative overflow-hidden group">
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-5 group-hover:opacity-10 transition-opacity`} />
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
            <Icon size={18} className="text-mi-text-muted" />
          </div>
        </div>
        <div className="font-heading text-4xl text-white">{value}</div>
        <div className="font-body text-xs text-mi-text-muted uppercase tracking-widest mt-1">{label}</div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [entries, setEntries] = useState([]);
  const [tab, setTab] = useState('overview'); // overview | users | content
  const [isAuthorized, setIsAuthorized] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const statsRes = await authFetch('/api/admin/stats');
        if (statsRes.status === 403) {
          setIsAuthorized(false);
          setLoading(false);
          return;
        }
        
        if (statsRes.ok) {
          setStats(await statsRes.json());
          
          const usersRes = await authFetch('/api/admin/users');
          if (usersRes.ok) setUsers(await usersRes.json());
          
          const entriesRes = await authFetch('/api/admin/entries');
          if (entriesRes.ok) setEntries(await entriesRes.json());
        }
      } catch (e) {
        console.error(e);
        toast.error("Failed to load admin data");
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  if (!isAuthorized) {
    return <Navigate to="/dashboard" />;
  }

  if (loading) {
    return (
      <div className="pt-32 px-10 max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16 min-h-screen bg-mi-bg">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck size={16} className="text-mi-accent" />
              <span className="text-[10px] font-heading tracking-[0.3em] uppercase text-mi-accent">Admin Console</span>
            </div>
            <h1 className="font-heading text-4xl tracking-wide text-white">COMMAND CENTER</h1>
          </div>
          
          <div className="flex bg-mi-surface border border-mi-border rounded-xl overflow-hidden p-1">
            {['overview', 'users', 'content'].map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-6 py-2 rounded-lg font-body text-xs uppercase tracking-widest transition-all ${
                  tab === t ? 'bg-mi-accent text-white' : 'text-mi-text-muted hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {tab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-10"
          >
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <AdminStatCard label="Total Users" value={stats?.users || 0} icon={Users} color="from-blue-500" />
              <AdminStatCard label="Total Content" value={stats?.entries || 0} icon={Lightbulb} color="from-mi-accent" />
              <AdminStatCard label="Public Feed" value={stats?.public_entries || 0} icon={Eye} color="from-mi-lime" />
              <AdminStatCard label="Engagement" value={stats?.comments || 0} icon={Inbox} color="from-purple-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Users List */}
              <div className="bg-mi-surface border border-mi-border rounded-2xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-heading text-xl text-white flex items-center gap-2">
                    <Users size={18} className="text-mi-text-muted" />
                    RECENT USERS
                  </h3>
                  <button onClick={() => setTab('users')} className="text-xs font-body text-mi-accent hover:underline flex items-center gap-1">
                    View all <ArrowUpRight size={12} />
                  </button>
                </div>
                <div className="space-y-4">
                  {users.slice(0, 5).map(u => (
                    <div key={u.id} className="flex items-center justify-between p-4 bg-mi-bg/40 border border-mi-border rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center font-heading text-white">
                          {(u.name || u.email)[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-body text-sm text-white font-medium">{u.name || 'Anonymous'}</p>
                          <p className="font-body text-xs text-mi-text-muted">{u.email}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-body text-mi-text-muted">
                        Joined {new Date(u.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Content List */}
              <div className="bg-mi-surface border border-mi-border rounded-2xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-heading text-xl text-white flex items-center gap-2">
                    <Lightbulb size={18} className="text-mi-text-muted" />
                    RECENT CONTENT
                  </h3>
                  <button onClick={() => setTab('content')} className="text-xs font-body text-mi-accent hover:underline flex items-center gap-1">
                    View all <ArrowUpRight size={12} />
                  </button>
                </div>
                <div className="space-y-4">
                  {entries.slice(0, 5).map(e => (
                    <div key={e.id} className="flex items-center justify-between p-4 bg-mi-bg/40 border border-mi-border rounded-xl">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-heading tracking-widest uppercase ${
                            e.input_type === 'tool' ? 'bg-blue-500/10 text-blue-400' : 'bg-mi-accent/10 text-mi-accent'
                          }`}>
                            {e.input_type}
                          </span>
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-heading tracking-widest uppercase ${
                            e.visibility === 'public' ? 'bg-mi-lime/10 text-mi-lime' : 'bg-white/5 text-mi-text-muted'
                          }`}>
                            {e.visibility}
                          </span>
                        </div>
                        <p className="font-body text-sm text-white truncate pr-4">{e.raw_input}</p>
                      </div>
                      <div className="shrink-0 flex items-center gap-3">
                        <span className={`w-2 h-2 rounded-full ${
                          e.status === 'completed' ? 'bg-mi-lime' : 'bg-yellow-400'
                        }`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {tab === 'users' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-mi-surface border border-mi-border rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-mi-border bg-white/5">
                    <th className="px-6 py-4 font-heading text-xs tracking-widest text-mi-text-muted">USER</th>
                    <th className="px-6 py-4 font-heading text-xs tracking-widest text-mi-text-muted">ID</th>
                    <th className="px-6 py-4 font-heading text-xs tracking-widest text-mi-text-muted">JOINED</th>
                    <th className="px-6 py-4 font-heading text-xs tracking-widest text-mi-text-muted text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-mi-border">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center font-heading text-white text-xs">
                            {(u.name || u.email)[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-body text-sm text-white font-medium">{u.name || 'Anonymous'}</p>
                            <p className="font-body text-xs text-mi-text-muted">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-[10px] text-mi-text-muted uppercase tracking-tighter">
                        {u.id}
                      </td>
                      <td className="px-6 py-4 font-body text-xs text-mi-text-muted">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link to={`/profile/${u.id}`} className="p-2 text-mi-text-muted hover:text-white transition-colors">
                          <ExternalLink size={16} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {tab === 'content' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-mi-surface border border-mi-border rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-mi-border bg-white/5">
                    <th className="px-6 py-4 font-heading text-xs tracking-widest text-mi-text-muted">CONTENT</th>
                    <th className="px-6 py-4 font-heading text-xs tracking-widest text-mi-text-muted">TYPE</th>
                    <th className="px-6 py-4 font-heading text-xs tracking-widest text-mi-text-muted">STATUS</th>
                    <th className="px-6 py-4 font-heading text-xs tracking-widest text-mi-text-muted">VISIBILITY</th>
                    <th className="px-6 py-4 font-heading text-xs tracking-widest text-mi-text-muted">CREATED</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-mi-border">
                  {entries.map(e => (
                    <tr key={e.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 max-w-md">
                        <p className="font-body text-sm text-white truncate">{e.raw_input}</p>
                        <p className="text-[10px] text-mi-text-muted font-mono uppercase tracking-tighter mt-1">{e.id}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-heading tracking-widest uppercase ${
                          e.input_type === 'tool' ? 'bg-blue-500/10 text-blue-400' : 'bg-mi-accent/10 text-mi-accent'
                        }`}>
                          {e.input_type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${
                            e.status === 'completed' ? 'bg-mi-lime' : 
                            e.status === 'pending' ? 'bg-yellow-400 animate-pulse' : 'bg-red-400'
                          }`} />
                          <span className="font-body text-xs text-white capitalize">{e.status}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-heading tracking-widest uppercase ${
                          e.visibility === 'public' ? 'bg-mi-lime/10 text-mi-lime' : 'bg-white/5 text-mi-text-muted'
                        }`}>
                          {e.visibility}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-body text-xs text-mi-text-muted">
                        {e.created_at ? new Date(e.created_at).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}
