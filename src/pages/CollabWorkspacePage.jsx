import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, ArrowLeft, Loader2, AlertTriangle, Handshake, Tag, Plus, Trash2, ChevronLeft, ChevronRight, Check, Wifi } from 'lucide-react';
import { authFetch } from '../lib/api';
import { supabase } from '../lib/supabase';

const COLUMNS = [
  { key: 'todo', label: 'To do' },
  { key: 'doing', label: 'In progress' },
  { key: 'done', label: 'Done' },
];

/* Live shared task board + notes. Supabase Realtime pushes instant updates when
   available; a 4s poll guarantees sync regardless of Realtime config. */
function CollabBoard({ entryId }) {
  const [tasks, setTasks] = useState([]);
  const [notes, setNotes] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [noteStatus, setNoteStatus] = useState('saved'); // saved | saving
  const [live, setLive] = useState(false);
  const notesFocused = useRef(false);
  const saveTimer = useRef(null);

  const fetchBoard = useCallback(async () => {
    try {
      const res = await authFetch(`/api/catalogs/${entryId}/workspace`);
      if (!res.ok) return;
      const data = await res.json();
      setTasks(data.tasks || []);
      // Don't overwrite the notes box while the user is actively editing it.
      if (!notesFocused.current) setNotes(data.notes?.content || '');
    } catch { /* ignore */ }
  }, [entryId]);

  useEffect(() => { fetchBoard(); }, [fetchBoard]);

  // Realtime + poll fallback.
  useEffect(() => {
    let channel;
    let cancelled = false;
    (async () => {
      // Realtime must carry the user's JWT so the scoped RLS policy authorizes
      // delivery of this project's workspace changes.
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) supabase.realtime.setAuth(session.access_token);
      if (cancelled) return;
      channel = supabase
        .channel(`ws:${entryId}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'workspace_tasks', filter: `catalog_entry_id=eq.${entryId}` }, fetchBoard)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'workspace_notes', filter: `catalog_entry_id=eq.${entryId}` }, fetchBoard)
        .subscribe((status) => setLive(status === 'SUBSCRIBED'));
    })();
    const poll = setInterval(fetchBoard, 4000);
    return () => { cancelled = true; if (channel) supabase.removeChannel(channel); clearInterval(poll); };
  }, [entryId, fetchBoard]);

  const addTask = async () => {
    const title = newTitle.trim();
    if (!title) return;
    setNewTitle('');
    await authFetch(`/api/catalogs/${entryId}/tasks`, { method: 'POST', body: JSON.stringify({ title }) });
    fetchBoard();
  };

  const moveTask = async (task, dir) => {
    const idx = COLUMNS.findIndex((c) => c.key === task.status);
    const next = COLUMNS[idx + dir];
    if (!next) return;
    setTasks((prev) => prev.map((t) => t.id === task.id ? { ...t, status: next.key } : t)); // optimistic
    await authFetch(`/api/catalogs/${entryId}/tasks/${task.id}`, { method: 'PUT', body: JSON.stringify({ status: next.key }) });
    fetchBoard();
  };

  const removeTask = async (task) => {
    setTasks((prev) => prev.filter((t) => t.id !== task.id));
    await authFetch(`/api/catalogs/${entryId}/tasks/${task.id}`, { method: 'DELETE' });
    fetchBoard();
  };

  const onNotesChange = (val) => {
    setNotes(val);
    setNoteStatus('saving');
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      await authFetch(`/api/catalogs/${entryId}/notes`, { method: 'PUT', body: JSON.stringify({ content: val }) });
      setNoteStatus('saved');
    }, 900);
  };

  return (
    <div className="space-y-6">
      {/* Task board */}
      <div className="p-6 rounded-xl bg-mi-surface border border-mi-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-lg tracking-wide text-white">Task board</h2>
          <span className={`inline-flex items-center gap-1.5 text-[11px] font-body ${live ? 'text-green-400' : 'text-mi-text-muted'}`} title={live ? 'Live sync on' : 'Syncing every few seconds'}>
            <Wifi size={12} /> {live ? 'Live' : 'Synced'}
          </span>
        </div>

        <div className="flex gap-2 mb-5">
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') addTask(); }}
            placeholder="Add a task and press Enter…"
            className="input-editorial flex-1 py-2.5 text-sm"
          />
          <button onClick={addTask} disabled={!newTitle.trim()} className="p-2.5 rounded-xl bg-mi-accent text-white hover:opacity-90 transition disabled:opacity-30">
            <Plus size={16} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {COLUMNS.map((col, ci) => {
            const colTasks = tasks.filter((t) => t.status === col.key);
            return (
              <div key={col.key} className="rounded-xl bg-mi-bg/40 border border-mi-border/60 p-3 min-h-[120px]">
                <div className="flex items-center justify-between mb-2 px-1">
                  <span className="text-[11px] uppercase tracking-wide text-mi-text-muted">{col.label}</span>
                  <span className="text-[11px] text-mi-text-muted">{colTasks.length}</span>
                </div>
                <div className="space-y-2">
                  <AnimatePresence initial={false}>
                    {colTasks.map((t) => (
                      <motion.div
                        key={t.id}
                        layout
                        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                        className={`group rounded-lg bg-mi-surface border border-mi-border p-2.5 ${col.key === 'done' ? 'opacity-70' : ''}`}
                      >
                        <p className={`text-sm text-white break-words ${col.key === 'done' ? 'line-through text-mi-text-muted' : ''}`}>{t.title}</p>
                        <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => moveTask(t, -1)} disabled={ci === 0} className="p-1 rounded text-mi-text-muted hover:text-white disabled:opacity-20" title="Move left"><ChevronLeft size={14} /></button>
                          <button onClick={() => moveTask(t, 1)} disabled={ci === COLUMNS.length - 1} className="p-1 rounded text-mi-text-muted hover:text-white disabled:opacity-20" title="Move right"><ChevronRight size={14} /></button>
                          <button onClick={() => removeTask(t)} className="p-1 rounded text-mi-text-muted hover:text-red-400 ml-auto" title="Delete"><Trash2 size={13} /></button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {colTasks.length === 0 && <p className="text-xs text-mi-text-muted/60 px-1 py-2">—</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Shared notes */}
      <div className="p-6 rounded-xl bg-mi-surface border border-mi-border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-heading text-lg tracking-wide text-white">Shared notes</h2>
          <span className="inline-flex items-center gap-1.5 text-[11px] text-mi-text-muted font-body">
            {noteStatus === 'saving' ? <><Loader2 size={12} className="animate-spin" /> Saving…</> : <><Check size={12} className="text-green-400" /> Saved</>}
          </span>
        </div>
        <textarea
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          onFocus={() => { notesFocused.current = true; }}
          onBlur={() => { notesFocused.current = false; }}
          placeholder="Shared scratchpad — decisions, links, next steps. Both of you see edits live."
          className="input-editorial w-full min-h-[160px] py-3 text-sm resize-y leading-relaxed"
        />
      </div>
    </div>
  );
}

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

        {/* Live shared workspace */}
        <div className="mb-8">
          <CollabBoard entryId={entry.id} />
        </div>

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
