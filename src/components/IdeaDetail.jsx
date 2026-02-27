import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import mermaid from 'mermaid';
import { ArrowLeft, Layers, Zap, AlertTriangle, GitBranch, ArrowRight, CheckCircle2 } from 'lucide-react';

mermaid.initialize({
    startOnLoad: true,
    theme: 'dark',
    securityLevel: 'loose',
    fontFamily: '"Space Grotesk", sans-serif',
});

function MermaidDiagram({ chart }) {
    const ref = useRef(null);
    const [error, setError] = useState(null);
    const [rawChart, setRawChart] = useState("");

    useEffect(() => {
        if (chart && ref.current) {
            setError(null);
            const id = `mermaid-scifi-${Math.random().toString(36).substr(2, 9)}`;
            try {
                let cleanMermaid = chart;
                if (typeof cleanMermaid === 'string') {
                    try {
                        const parsed = JSON.parse(cleanMermaid);
                        if (typeof parsed === 'string') cleanMermaid = parsed;
                    } catch (e) { }

                    cleanMermaid = cleanMermaid
                        .replace(/```mermaid\n?/i, '')
                        .replace(/```\n?/g, '')
                        .replace(/\\n/g, '\n')
                        .trim();

                    // Auto-quote square bracket nodes containing parentheses
                    // Example: G[API Gateway (Node.js)] -> G["API Gateway (Node.js)"]
                    // But ignore cylinder nodes: R[(Database)]
                    cleanMermaid = cleanMermaid.replace(/([A-Za-z0-9_-]+)\[([^\]]+)\]/g, (match, node, innerText) => {
                        if (innerText.startsWith('(') && innerText.endsWith(')')) {
                            return match; // Cylinder node
                        }
                        if (/[()]/.test(innerText) && !innerText.includes('"')) {
                            return `${node}["${innerText}"]`;
                        }
                        return match;
                    });
                }

                setRawChart(cleanMermaid);

                if (cleanMermaid.length > 5 && (cleanMermaid.includes('graph') || cleanMermaid.includes('flowchart') || cleanMermaid.includes('sequenceDiagram'))) {
                    mermaid.render(id, cleanMermaid).then((result) => {
                        if (ref.current) {
                            ref.current.innerHTML = result.svg;
                        }
                    }).catch(e => {
                        console.error("Mermaid specific render error", e);
                        setError(e.message || "Failed to render diagram.");
                    });
                } else {
                    setError("Not a valid Mermaid diagram syntax.");
                }
            } catch (e) {
                console.error("Mermaid parsing error", e);
                setError(e.message || "Failed to process diagram.");
            }
        }
    }, [chart]);

    if (error) {
        return (
            <div className="w-full overflow-x-auto flex flex-col p-6 text-red-500 bg-red-500/10 border border-red-500/50">
                <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle size={24} />
                    <p className="font-bold uppercase tracking-wider">Diagram Rendering Failed</p>
                </div>
                <div className="text-sm opacity-80 mb-4">{error}</div>
                <div className="text-xs bg-black/50 p-4 border border-red-500/30 w-full whitespace-pre-wrap font-mono text-left">
                    <div className="text-white/50 mb-2">RAW SYNTAX:</div>
                    {rawChart || chart}
                </div>
            </div>
        );
    }

    return <div ref={ref} className="overflow-x-auto p-4 bg-black/40 border border-neo-border flex justify-center w-full min-h-[100px]" />;
}

export default function IdeaDetail({ entry, onBack }) {
    const {
        raw_input, summary, tech_stack,
        pros_cons, similar_tools, mermaid_syntax, image_url, created_at, status
    } = entry;

    // Parsers
    const safeArray = (data) => {
        if (!data) return [];
        if (Array.isArray(data)) return data;
        if (typeof data === 'string') {
            try {
                const parsed = JSON.parse(data);
                return Array.isArray(parsed) ? parsed : [];
            } catch (e) { return []; }
        }
        return [];
    };

    const safeProsCons = (data) => {
        if (!data) return { pros: [], cons: [] };
        if (typeof data === 'string') {
            try { data = JSON.parse(data); } catch (e) { return { pros: [], cons: [] }; }
        }
        return { pros: safeArray(data?.pros), cons: safeArray(data?.cons) };
    };

    const techArray = safeArray(tech_stack);
    const toolsArray = safeArray(similar_tools);
    const pcData = safeProsCons(pros_cons);

    const isPending = status === 'pending';

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="w-full flex flex-col gap-8 pb-16"
        >
            {/* Header section */}
            <div className="flex justify-between items-center bg-neo-surface border-2 border-neo-border p-6 shadow-neo-card">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2 border-2 border-black bg-[#ff5555] text-black hover:bg-white transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1"
                        aria-label="Go back"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-display font-bold uppercase tracking-tighter text-white">
                            {raw_input}
                        </h1>
                        <span className="text-sm font-sans text-neo-muted">
                            {new Date(created_at).toLocaleString()}
                        </span>
                    </div>
                </div>
                <div className={`px-4 py-2 font-display font-bold text-sm uppercase tracking-wider border-2 ${isPending ? 'bg-yellow-500/10 border-yellow-500 text-yellow-500' : 'bg-neo-accent/10 border-neo-accent text-neo-accent'}`}>
                    {status}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="card-neo flex flex-col gap-8">
                {/* Summary & Image Container */}
                <div className="flex flex-col lg:flex-row gap-8">
                    {image_url && (
                        <div className="lg:w-1/3 shrink-0">
                            <div className="w-full aspect-square bg-neo-border border-2 border-black shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] overflow-hidden">
                                <img src={image_url} alt="Concept visualization" className="w-full h-full object-cover filter grayscale-[20%] hover:grayscale-0 transition-all duration-500" />
                            </div>
                        </div>
                    )}

                    <div className="flex-1 flex flex-col justify-center">
                        <h3 className="flex items-center gap-2 font-display text-neo-accent text-xl font-bold mb-4 uppercase tracking-wide">
                            <Layers size={24} />
                            Concept Summary
                        </h3>
                        <p className="font-sans text-neo-text leading-relaxed text-lg bg-black/30 p-6 border-l-4 border-neo-accent">
                            {summary || "No summary provided."}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Tech Stack */}
                    <div className="border border-neo-border bg-black/20 p-6 relative group hover:border-white transition-colors duration-200">
                        <h3 className="flex items-center gap-2 font-display text-white mb-4 uppercase tracking-wide font-bold">
                            <Zap size={20} className="text-yellow-400" />
                            Recommended Stack
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {techArray.length > 0 ? techArray.map((tech, i) => (
                                <span key={i} className="px-3 py-1.5 bg-neo-surface border border-neo-border text-sm font-display uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)]">
                                    {tech}
                                </span>
                            )) : <span className="text-neo-muted italic">Awaiting data...</span>}
                        </div>
                    </div>

                    {/* Similar Tools */}
                    <div className="border border-neo-border bg-black/20 p-6 relative hover:border-white transition-colors duration-200">
                        <h3 className="flex items-center gap-2 font-display text-white mb-4 uppercase tracking-wide font-bold">
                            <GitBranch size={20} className="text-blue-400" />
                            Market Intersections
                        </h3>
                        <ul className="space-y-3 p-4 bg-black/30 border-l-2 border-neo-border">
                            {toolsArray.length > 0 ? toolsArray.map((tool, i) => (
                                <li key={i} className="flex items-center gap-3 text-base font-sans">
                                    <ArrowRight size={16} className="text-neo-accent" />
                                    {tool}
                                </li>
                            )) : <li className="text-neo-muted italic">Awaiting data...</li>}
                        </ul>
                    </div>
                </div>

                {/* Pros / Cons Matrix */}
                <div className="border border-neo-border bg-black/20 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h4 className="flex items-center gap-2 font-display text-green-400 mb-4 uppercase tracking-wide font-bold">
                                <CheckCircle2 size={20} /> Key Advantages
                            </h4>
                            <ul className="space-y-2">
                                {pcData.pros.length > 0 ? pcData.pros.map((p, i) => <li key={i} className="text-base font-sans text-gray-300">• {p}</li>) : <li className="text-neo-muted italic text-sm">None recorded.</li>}
                            </ul>
                        </div>
                        <div>
                            <h4 className="flex items-center gap-2 font-display text-rose-400 mb-4 uppercase tracking-wide font-bold">
                                <AlertTriangle size={20} /> Limitations & Risks
                            </h4>
                            <ul className="space-y-2">
                                {pcData.cons.length > 0 ? pcData.cons.map((c, i) => <li key={i} className="text-base font-sans text-gray-300">• {c}</li>) : <li className="text-neo-muted italic text-sm">None recorded.</li>}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Architecture Diagram */}
                {mermaid_syntax && (
                    <div className="border-t-2 border-neo-border pt-8 mt-4">
                        <h3 className="font-display text-white font-bold text-2xl mb-6 uppercase tracking-wide flex justify-between items-center">
                            Architecture / Workflow
                        </h3>
                        <div className="bg-[#050505] border border-neo-border p-2">
                            <MermaidDiagram chart={mermaid_syntax} />
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
