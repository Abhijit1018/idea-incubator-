import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import mermaid from 'mermaid';
import { ArrowLeft, Layers, Zap, AlertTriangle, GitBranch, ArrowRight, CheckCircle2, MessageSquare, Search, Send } from 'lucide-react';
import { buildApiUrl } from '../lib/api';

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

                    // Auto-quote square bracket nodes containing parentheses or spaces
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

                    // Fix arrows with text that might have spaces but no quotes: A -->|Text Prompt| B
                    cleanMermaid = cleanMermaid.replace(/(-->\|)([^|]+)(\|)/g, (match, p1, p2, p3) => {
                        return `${p1}${p2.trim()}${p3}`;
                    });

                    // Forcefully fix hallucinated arrow heads after text nodes: -->|Text|> B
                    cleanMermaid = cleanMermaid.replace(/(-->\|[^|]+\|)>([\s]*)/g, '$1$2');
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
        raw_input, summary, tech_stack, input_type,
        pros_cons, similar_tools, mermaid_syntax, image_url, created_at, status,
        creator, link, installation, unique_features, market_trend
    } = entry;

    // State for chat functionality
    const [chatMessages, setChatMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [isChatLoading, setIsChatLoading] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState([]);

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

    // Fetch chat messages when component mounts or entry changes
    useEffect(() => {
        fetchChatMessages();
    }, [entry.id]);

    // Fetch chat messages for this catalog entry
        const fetchChatMessages = async () => {
            try {
                const response = await fetch(buildApiUrl(`/api/catalogs/${entry.id}/chat`));
            if (response.ok) {
                const messages = await response.json();
                setChatMessages(messages);
            }
        } catch (error) {
            console.error('Error fetching chat messages:', error);
        }
    };

    // Send a new chat message via n8n workflow
    const sendChatMessage = async (isUserMessage = true) => {
        if (!chatInput.trim() && isUserMessage) return;
        
        setIsChatLoading(true);
        try {
            // Send to n8n webhook for processing with full catalog context
            const response = await fetch(buildApiUrl('/api/webhooks/chat-message'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    entry_id: entry.id,
                    message: chatInput,
                    user_id: "current-user", // In a real app, this would come from auth
                    catalog_context: {
                        summary: entry.summary || "",
                        tech_stack: entry.tech_stack || [],
                        pros_cons: entry.pros_cons || { pros: [], cons: [] },
                        similar_tools: entry.similar_tools || [],
                        raw_input: entry.raw_input || ""
                    }
                })
            });
            
            if (response.ok) {
                // n8n will process and store the user message, then call back to store AI response
                // We'll refresh the chat messages to see both
                setChatInput('');
                await fetchChatMessages(); // Refresh to see stored messages
                
                // If this is a user message, we expect n8n to process and call back with AI response
                // We'll wait a bit then refresh again to see the AI response
                if (isUserMessage) {
                    setTimeout(async () => {
                        await fetchChatMessages(); // Refresh to see AI response
                    }, 3000); // Wait for n8n processing
                }
            }
        } catch (error) {
            console.error('Error sending chat message:', error);
        } finally {
            setIsChatLoading(false);
        }
    };

    // Search catalogs using vector similarity
    const searchCatalogs = async () => {
        if (!chatInput.trim()) return;
        
        setIsSearching(true);
        try {
            const response = await fetch(buildApiUrl('/api/catalogs/search'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: chatInput,
                    limit: 5
                })
            });
            
            if (response.ok) {
                const results = await response.json();
                setSearchResults(results);
            }
        } catch (error) {
            console.error('Error searching catalogs:', error);
        } finally {
            setIsSearching(false);
        }
    };

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
                    {input_type === 'tool' ? 'TOOL' : 'IDEA'} • {status}
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

                {input_type === 'tool' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="border border-neo-border bg-black/20 p-6 relative group hover:border-white transition-colors duration-200">
                            <h3 className="flex items-center gap-2 font-display text-white mb-4 uppercase tracking-wide font-bold">
                                <Zap size={20} className="text-yellow-400" />
                                Details & Links
                            </h3>
                            <div className="flex flex-col gap-3 font-sans text-neo-text">
                                <p><strong>Creator:</strong> {creator || <span className="text-neo-muted italic">Unknown</span>}</p>
                                <p><strong>Link:</strong> {link ? <a href={link} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline break-all">{link}</a> : <span className="text-neo-muted italic">N/A</span>}</p>
                                <p><strong>Installation:</strong> {installation || <span className="text-neo-muted italic">N/A</span>}</p>
                            </div>
                        </div>

                        <div className="border border-neo-border bg-black/20 p-6 relative hover:border-white transition-colors duration-200">
                            <h3 className="flex items-center gap-2 font-display text-white mb-4 uppercase tracking-wide font-bold">
                                <GitBranch size={20} className="text-blue-400" />
                                Unique Features & Trends
                            </h3>
                            <div className="space-y-4 font-sans max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                {unique_features && safeArray(unique_features).length > 0 ? (
                                    <ul className="list-disc pl-5 space-y-2 text-neo-text">
                                        {safeArray(unique_features).map((f, i) => <li key={i}>{f}</li>)}
                                    </ul>
                                ) : <p className="text-neo-muted italic">No features recorded.</p>}
                                {market_trend && (
                                    <div className="bg-black/40 p-4 border-l-2 border-neo-accent text-sm text-neo-text mt-4">
                                        <strong className="block mb-1 text-white">Market Trend:</strong> {market_trend}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
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
                )}

                {/* Pros / Cons Matrix - Only for Ideas */}
                {input_type === 'idea' && (
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
                )}

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
                 
                 {/* Chat Interface */}
                 <div className="border-t-2 border-neo-border pt-8 mt-4">
                     <h3 className="font-display text-white font-bold text-2xl mb-6 uppercase tracking-wide flex justify-between items-center">
                         {isSearching ? 'Search Catalogs' : 'Chat with Catalog'}
                         <div className="flex items-center gap-2">
                             <button
                                 onClick={() => {
                                  setIsSearching(!isSearching);
                                  setChatInput('');
                                  setSearchResults([]);
                              }}
                                 className={`p-2 border-2 border-black bg-[#ff5555] text-black hover:bg-white transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 ${isSearching ? 'bg-white text-black' : ''}`}
                             >
                                 {isSearching ? <MessageSquare size={20} /> : <Search size={20} />}
                             </button>
                         </div>
                     </h3>
                     
                     {/* Search Results */}
                     {isSearching && searchResults.length > 0 && (
                         <div className="bg-black/30 p-4 rounded-lg mb-4">
                             <h4 className="font-display text-white font-bold mb-2">Search Results</h4>
                             <ul className="space-y-2">
                                 {searchResults.map((result, index) => (
                                     <li key={index} className="flex items-center gap-3 p-3 bg-black/40 rounded">
                                         <ArrowRight size={16} className="text-neo-accent" />
                                         <div>
                                             <p className="font-sans text-neo-text">{result.raw_input}</p>
                                             {result.summary && (
                                                 <p className="text-xs text-neo-muted">{result.summary.substring(0, 100)}...</p>
                                             )}
                                         </div>
                                     </li>
                                 ))}
                             </ul>
                         </div>
                     )}
                     
                     {/* Chat Messages */}
                     <div className="h-96 overflow-y-auto mb-4 bg-black/30 rounded-lg p-4">
                         {chatMessages.length > 0 ? (
                             <div className="space-y-3">
                                 {chatMessages.map((message, index) => (
                                     <div key={index} className={`flex ${message.is_user ? 'justify-end' : 'justify-start'}`}>
                                         <div className={`max-w-[80%] px-4 py-2 rounded-lg ${message.is_user ? 'bg-neo-accent text-black' : 'bg-black/50 text-white'}`}>
                                             <p className="text-sm">{message.message}</p>
                                             <span className="text-xs text-neo-muted block">
                                                 {new Date(message.created_at).toLocaleTimeString()}
                                             </span>
                                         </div>
                                     </div>
                                 ))}
                             </div>
                         ) : (
                             <p className="text-neo-muted text-center py-8">No messages yet. Start the conversation!</p>
                         )}
                     </div>
                     
                     {/* Chat Input */}
                     <div className="flex gap-2">
                         <textarea
                             value={chatInput}
                             onChange={(e) => setChatInput(e.target.value)}
                             onKeyDown={(e) => {
                                  if (e.key === 'Enter' && !e.shiftKey) {
                                      e.preventDefault();
                                      isSearching ? searchCatalogs() : sendChatMessage();
                                  }
                              }}
                              placeholder={isSearching ? "Search other catalogs..." : "Ask questions about this catalog..."}
                             className="flex-1 min-h-[60px] px-3 py-2 bg-black/40 text-white border border-neo-border resize-none focus:outline-none focus:ring-2 focus:ring-neo-accent"
                             disabled={isChatLoading}
                         />
                         <button
                             onClick={() => isSearching ? searchCatalogs() : sendChatMessage()}
                             disabled={isChatLoading || !chatInput.trim()}
                             className={`px-4 py-2 bg-neo-accent text-black font-display font-bold uppercase tracking-wider transition-colors hover:bg-white hover:text-black disabled:opacity-50`}
                         >
                             {isChatLoading ? (isSearching ? 'Searching...' : 'Sending...') : (isSearching ? 'Search' : 'Send')}
                         </button>
                     </div>
                 </div>
             </div>
         </motion.div>
     );
 }
