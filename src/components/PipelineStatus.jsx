import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Zap } from 'lucide-react';

const STAGES = [
  'Queuing idea',
  'AI researching',
  'Generating diagram',
  'Creating image',
  'Finalising catalog',
];

function PipelineCard({ entry }) {
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    if (entry.status !== 'pending') return;
    const interval = setInterval(() => {
      setStageIndex(prev => (prev < STAGES.length - 1 ? prev + 1 : prev));
    }, 18000);
    return () => clearInterval(interval);
  }, [entry.status]);

  if (entry.status === 'completed' || entry.status === 'failed') return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="flex items-center gap-4 p-4 rounded-xl bg-mi-surface border border-mi-accent/20"
    >
      <div className="w-9 h-9 rounded-lg bg-mi-accent/10 flex items-center justify-center shrink-0">
        <Loader2 size={18} className="text-mi-accent animate-spin" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-body text-sm text-white truncate">{entry.raw_input}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="w-1.5 h-1.5 rounded-full bg-mi-accent animate-pulse" />
          <span className="font-body text-xs text-mi-accent">{STAGES[stageIndex]}</span>
        </div>
        <div className="flex gap-1 mt-2">
          {STAGES.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-500 ${
                i <= stageIndex ? 'bg-mi-accent' : 'bg-mi-border'
              }`}
              style={{ width: i <= stageIndex ? '16px' : '8px' }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function PipelineStatus({ entries }) {
  const pending = entries.filter(e => e.status === 'pending');
  if (pending.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Zap size={14} className="text-mi-accent" />
        <span className="font-heading text-sm tracking-wider text-mi-text-muted uppercase">
          Processing ({pending.length})
        </span>
      </div>
      <AnimatePresence>
        <div className="space-y-2">
          {pending.map(e => <PipelineCard key={e.id} entry={e} />)}
        </div>
      </AnimatePresence>
    </div>
  );
}
