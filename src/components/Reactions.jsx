import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, Eye, DollarSign, Hammer, Wrench } from 'lucide-react';
import { authFetch } from '../lib/api';

export const REACTION_CONFIG = [
  { type: 'brilliant',    icon: Lightbulb,  label: 'Brilliant',    color: 'text-yellow-300', hex: '#facc15' },
  { type: 'interested',   icon: Eye,        label: 'Interested',   color: 'text-blue-300',   hex: '#60a5fa' },
  { type: 'sellable',     icon: DollarSign, label: 'Sellable',     color: 'text-green-300',  hex: '#4ade80' },
  { type: 'build_worthy', icon: Hammer,     label: 'Build-worthy', color: 'text-orange-300', hex: '#fb923c' },
  { type: 'needs_work',   icon: Wrench,     label: 'Needs work',   color: 'text-slate-300',  hex: '#94a3b8' },
];
export const REACTION_BY_TYPE = Object.fromEntries(REACTION_CONFIG.map((r) => [r.type, r]));

/* Particle burst emitted when a reaction is added — the signature micro-moment. */
export function ReactionBurst({ hex }) {
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
export function ReactionPill({ r, count, isActive, disabled, onReact }) {
  const [burstKey, setBurstKey] = useState(0);
  const handle = () => {
    if (disabled) return;
    if (!isActive) setBurstKey((k) => k + 1);
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

/* Always-visible row of all five reaction chips (used on the shareable idea page). */
export function ReactionRow({ reactions = {}, userReactions = [], onReact, disabled }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {REACTION_CONFIG.map((r) => (
        <ReactionPill
          key={r.type}
          r={r}
          count={reactions[r.type] || 0}
          isActive={(userReactions || []).includes(r.type)}
          disabled={disabled}
          onReact={onReact}
        />
      ))}
    </div>
  );
}

/* "Who reacted" — overlapping avatar stack, lazily fetched when `open` is true. */
export function Reactors({ entryId, open }) {
  const [people, setPeople] = useState(null);

  useEffect(() => {
    if (!open || people) return;
    let alive = true;
    (async () => {
      try {
        const res = await authFetch(`/api/community/${entryId}/reactions`);
        if (!alive) return;
        if (res.ok) {
          const grouped = await res.json();
          const seen = new Map();
          Object.values(grouped).flat().forEach((u) => { if (u && !seen.has(u.id)) seen.set(u.id, u); });
          setPeople([...seen.values()]);
        } else setPeople([]);
      } catch { if (alive) setPeople([]); }
    })();
    return () => { alive = false; };
  }, [open, entryId, people]);

  if (!open || !people || people.length === 0) return null;
  const shown = people.slice(0, 8);
  const extra = people.length - shown.length;

  return (
    <div className="flex items-center gap-2 mt-2" title={people.map((p) => p.name).join(', ')}>
      <div className="flex -space-x-2">
        {shown.map((p) => (
          <div key={p.id} className="w-6 h-6 rounded-full border border-mi-surface bg-mi-surface-2 overflow-hidden flex items-center justify-center text-[10px] text-white">
            {p.avatar_url ? <img src={p.avatar_url} alt="" className="w-full h-full object-cover" /> : (p.name?.[0] || '?').toUpperCase()}
          </div>
        ))}
      </div>
      <span className="text-[11px] text-mi-text-muted font-body">
        {people.length} {people.length === 1 ? 'builder' : 'builders'} reacted{extra > 0 ? ` · +${extra}` : ''}
      </span>
    </div>
  );
}
