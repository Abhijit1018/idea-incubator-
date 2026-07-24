import React, { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, UserPlus, UserCheck, Handshake, ArrowUpRight, Inbox } from 'lucide-react';
import { authFetch } from '../lib/api';
import { useAuth } from '../lib/AuthContext';
import EmptyState from '../components/EmptyState';

function UserRow({ u, onToggleFollow, busy }) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-2xl bg-mi-surface border border-mi-border hover:border-mi-border-light transition-colors">
      <Link to={`/profile/${u.id}`} className="w-11 h-11 rounded-full bg-mi-surface-2 overflow-hidden flex items-center justify-center text-white shrink-0">
        {u.avatar_url ? <img src={u.avatar_url} alt="" className="w-full h-full object-cover" /> : (u.name?.[0] || '?').toUpperCase()}
      </Link>
      <div className="min-w-0 flex-1">
        <Link to={`/profile/${u.id}`} className="font-body font-medium text-white hover:text-mi-accent transition-colors truncate block">{u.name}</Link>
        {u.bio && <p className="text-xs text-mi-text-muted truncate">{u.bio}</p>}
      </div>
      {!u.is_self && (
        <button
          onClick={() => onToggleFollow(u)}
          disabled={busy}
          className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-60 ${
            u.is_following ? 'bg-white/5 border border-mi-border text-mi-text-secondary hover:text-white' : 'bg-mi-accent text-white hover:opacity-90'
          }`}
        >
          {u.is_following ? <><UserCheck size={14} /> Following</> : <><UserPlus size={14} /> Follow</>}
        </button>
      )}
    </div>
  );
}

export default function NetworkPage() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const viewingId = params.get('user') || user?.id;
  const isSelf = viewingId === user?.id;
  const tab = params.get('tab') || 'following';

  const [people, setPeople] = useState(null);
  const [collabs, setCollabs] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const setTab = (t) => { const p = new URLSearchParams(params); p.set('tab', t); setParams(p); };

  const loadPeople = useCallback(async () => {
    if (tab !== 'following' && tab !== 'followers') return;
    setPeople(null);
    try {
      const res = await authFetch(`/api/users/${viewingId}/${tab}`);
      setPeople(res.ok ? await res.json() : []);
    } catch { setPeople([]); }
  }, [tab, viewingId]);

  const loadCollabs = useCallback(async () => {
    setCollabs(null);
    try {
      const res = await authFetch('/api/collaborations');
      setCollabs(res.ok ? await res.json() : { collaborating_on: [], my_projects: [] });
    } catch { setCollabs({ collaborating_on: [], my_projects: [] }); }
  }, []);

  useEffect(() => { loadPeople(); }, [loadPeople]);
  useEffect(() => { if (tab === 'collabs') loadCollabs(); }, [tab, loadCollabs]);

  const toggleFollow = async (u) => {
    setBusyId(u.id);
    setPeople((prev) => prev.map((p) => p.id === u.id ? { ...p, is_following: !p.is_following } : p));
    try {
      const res = await authFetch(`/api/users/${u.id}/follow`, { method: 'POST' });
      if (res.ok) { const d = await res.json(); setPeople((prev) => prev.map((p) => p.id === u.id ? { ...p, is_following: d.following } : p)); }
    } catch { loadPeople(); }
    finally { setBusyId(null); }
  };

  const TABS = [
    { key: 'following', label: 'Following', icon: UserCheck },
    { key: 'followers', label: 'Followers', icon: Users },
    ...(isSelf ? [{ key: 'collabs', label: 'Collaborations', icon: Handshake }] : []),
  ];

  return (
    <div className="pt-24 pb-16 min-h-screen max-w-3xl mx-auto px-5">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-mi-accent/10 flex items-center justify-center"><Users size={20} className="text-mi-accent" /></div>
        <div>
          <h1 className="font-heading text-2xl text-white tracking-wide">{isSelf ? 'Your network' : 'Network'}</h1>
          <p className="text-sm text-mi-text-muted">People you follow, followers, and your collaborations.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-mi-surface border border-mi-border rounded-xl p-1 w-fit">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-body transition-colors ${
              tab === t.key ? 'bg-mi-accent/10 text-mi-accent' : 'text-mi-text-muted hover:text-white'
            }`}
          >
            <t.icon size={14} /> {t.label}
          </button>
        ))}
        {isSelf && (
          <Link to="/dashboard?tab=requests" className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-body text-mi-text-muted hover:text-white transition-colors">
            <Inbox size={14} /> Requests
          </Link>
        )}
      </div>

      {/* People tabs */}
      {(tab === 'following' || tab === 'followers') && (
        people === null ? (
          <div className="flex justify-center py-16"><span className="w-6 h-6 rounded-full border-[3px] border-mi-accent/25 border-t-mi-accent animate-spin" /></div>
        ) : people.length === 0 ? (
          <EmptyState icon={Users} title={tab === 'following' ? 'Not following anyone yet' : 'No followers yet'}
            description={tab === 'following' ? 'Follow builders from their profiles to see them here.' : 'Share great ideas — followers will come.'}
            action={<Link to="/community" className="px-5 py-2.5 rounded-xl bg-mi-accent text-white font-medium hover:opacity-90 transition">Explore community</Link>} />
        ) : (
          <div className="space-y-2">
            {people.map((u) => <UserRow key={u.id} u={u} onToggleFollow={toggleFollow} busy={busyId === u.id} />)}
          </div>
        )
      )}

      {/* Collaborations */}
      {tab === 'collabs' && (
        collabs === null ? (
          <div className="flex justify-center py-16"><span className="w-6 h-6 rounded-full border-[3px] border-mi-accent/25 border-t-mi-accent animate-spin" /></div>
        ) : (collabs.collaborating_on.length === 0 && collabs.my_projects.length === 0) ? (
          <EmptyState icon={Handshake} title="No collaborations yet"
            description="Send a Connect request on a community idea, or accept one on yours, to start collaborating."
            action={<Link to="/community" className="px-5 py-2.5 rounded-xl bg-mi-accent text-white font-medium hover:opacity-90 transition">Find ideas to join</Link>} />
        ) : (
          <div className="space-y-6">
            {collabs.collaborating_on.length > 0 && (
              <section>
                <h2 className="text-xs uppercase tracking-wide text-mi-text-muted mb-2">You're collaborating on</h2>
                <div className="space-y-2">
                  {collabs.collaborating_on.map((p) => (
                    <ProjectRow key={p.id} p={p} subtitle={p.owner ? `by ${p.owner.name} · you're ${(p.role || 'collaborator').replace('_', ' ')}` : ''} />
                  ))}
                </div>
              </section>
            )}
            {collabs.my_projects.length > 0 && (
              <section>
                <h2 className="text-xs uppercase tracking-wide text-mi-text-muted mb-2">Your projects with collaborators</h2>
                <div className="space-y-2">
                  {collabs.my_projects.map((p) => (
                    <ProjectRow key={p.id} p={p} members={p.members} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )
      )}
    </div>
  );
}

function ProjectRow({ p, subtitle, members }) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-2xl bg-mi-surface border border-mi-border hover:border-mi-border-light transition-colors group">
      {p.image_url && <img src={p.image_url} alt="" className="w-11 h-11 rounded-lg object-cover shrink-0 border border-mi-border" onError={(e) => { e.currentTarget.style.display = 'none'; }} />}
      <div className="min-w-0 flex-1">
        <Link to={`/idea/${p.id}`} className="font-body font-medium text-white hover:text-mi-accent transition-colors truncate inline-flex items-center gap-1">
          {p.raw_input} <ArrowUpRight size={13} className="opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>
        {subtitle && <p className="text-xs text-mi-text-muted truncate">{subtitle}</p>}
        {members && (
          <div className="flex -space-x-2 mt-1.5">
            {members.slice(0, 6).map((m) => (
              <div key={m.id} className="w-6 h-6 rounded-full border border-mi-surface bg-mi-surface-2 overflow-hidden flex items-center justify-center text-[10px] text-white" title={`${m.name} · ${(m.role || '').replace('_', ' ')}`}>
                {m.avatar_url ? <img src={m.avatar_url} alt="" className="w-full h-full object-cover" /> : (m.name?.[0] || '?').toUpperCase()}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
