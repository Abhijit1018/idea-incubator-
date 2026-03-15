import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import mermaid from 'mermaid';
import { Layers, Zap, AlertTriangle, GitBranch, ArrowRight, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';

mermaid.initialize({
    startOnLoad: true,
    theme: 'dark',
    securityLevel: 'loose',
    fontFamily: '"Space Grotesk", sans-serif',
});

function MermaidDiagram({ chart }) {
    const ref = useRef(null);

    useEffect(() => {
        if (chart && ref.current) {
            ref.current.id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
            try {
                // Render the diagram
                mermaid.render(ref.current.id, chart).then((result) => {
                    if (ref.current) {
                        ref.current.innerHTML = result.svg;
                    }
                });
            } catch (e) {
                console.error("Mermaid parsing error", e);
            }
        }
    }, [chart]);

    return <div ref={ref} className="overflow-x-auto p-4 bg-black/40 border border-neo-border rounded flex justify-center" />;
}

export default function CatalogCard({ entry, index, onSelect }) {
    const {
        raw_input, status, summary, created_at
    } = entry;

    const isPending = status === 'pending';

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className={`card-neo flex flex-col gap-6 ${isPending ? 'border-dashed border-neo-muted opacity-70' : ''}`}
        >
            <div className="flex justify-between items-start border-b-2 border-neo-border pb-4">
                <div>
                    <h2 className="text-2xl font-display font-bold uppercase tracking-tight text-white mb-1">
                        {raw_input.length > 50 ? raw_input.substring(0, 50) + '...' : raw_input}
                    </h2>
                    <span className="text-sm font-sans text-neo-muted">
                        {new Date(created_at).toLocaleString()}
                    </span>
                </div>
                <div className={`px-3 py-1 font-display font-bold text-sm uppercase tracking-wider border-2 ${isPending ? 'bg-yellow-500/10 border-yellow-500 text-yellow-500' : 'bg-neo-accent/10 border-neo-accent text-neo-accent'}`}>
                    {entry.input_type === 'tool' ? 'TOOL' : 'IDEA'} • {status}
                </div>
            </div>

            {isPending ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 bg-black/20">
                    <div className="w-16 h-16 border-4 border-neo-border border-t-neo-accent rounded-full animate-spin mb-4"></div>
                    <p className="font-display text-lg text-neo-muted tracking-widest uppercase">Incubating via n8n...</p>
                </div>
            ) : (
                <div className="flex-1 flex flex-col gap-6">

                    {/* Compact View Summary */}
                    <div className="flex-1 flex flex-col justify-center">
                        <p className="font-sans text-neo-text leading-relaxed text-lg bg-black/30 p-4 border-l-4 border-neo-accent">
                            {summary && summary.length > 150 ? summary.substring(0, 150) + '...' : (summary || "No summary provided.")}
                        </p>
                    </div>

                    {/* Navigation Button */}
                    <button
                        onClick={onSelect}
                        className="w-full flex items-center justify-between px-6 py-4 bg-neo-accent border-2 border-black text-black font-display uppercase font-bold tracking-wider hover:bg-white hover:-translate-y-1 transition-all"
                    >
                        ACCESS TERMINAL RECORDS
                        <ArrowRight size={20} />
                    </button>
                </div>
            )}
        </motion.div>
    );
}
