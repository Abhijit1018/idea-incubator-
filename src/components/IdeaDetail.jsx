import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import mermaid from 'mermaid';
import { ArrowLeft, Layers, Zap, AlertTriangle, GitBranch, ArrowRight, CheckCircle2, MessageSquare, Search, Send, Check, X, Pencil, Bot, ChevronDown, ChevronUp, ArrowDown, Globe, Lock, Terminal, HelpCircle } from 'lucide-react';
import { authFetch } from '../lib/api';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../lib/AuthContext';

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

                    cleanMermaid = cleanMermaid.replace(/([A-Za-z0-9_-]+)\[([^\]]+)\]/g, (match, node, innerText) => {
                        if (innerText.startsWith('(') && innerText.endsWith(')')) {
                            return match;
                        }
                        if (/[()]/.test(innerText) && !innerText.includes('"')) {
                            return `${node}["${innerText}"]`;
                        }
                        return match;
                    });

                    cleanMermaid = cleanMermaid.replace(/(-->\|)([^|]+)(\|)/g, (match, p1, p2, p3) => {
                        return `${p1}${p2.trim()}${p3}`;
                    });

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

/**
 * Renders a card showing proposed changes from AI chat, with Accept/Reject buttons.
 */
function ProposedChangesCard({ proposedChanges, onAccept, onReject, isApplying }) {
    const FIELD_LABELS = {
        summary: 'Summary',
        tech_stack: 'Tech Stack',
        pros_cons: 'Pros & Cons',
        similar_tools: 'Similar Tools',
        creator: 'Creator',
        link: 'Link',
        installation: 'Installation',
        unique_features: 'Unique Features',
        market_trend: 'Market Trend',
        mermaid_syntax: 'Architecture Diagram',
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="border-2 border-neo-accent bg-neo-accent/5 p-4 my-3"
        >
            <div className="flex items-center gap-2 mb-3">
                <Pencil size={16} className="text-neo-accent" />
                <span className="font-display font-bold text-neo-accent uppercase tracking-wider text-sm">
                    Proposed Changes
                </span>
            </div>

            <div className="space-y-3 mb-4">
                {Object.entries(proposedChanges).map(([field, value]) => (
                    <div key={field} className="bg-black/30 p-3 border border-neo-border">
                        <p className="text-xs font-display uppercase tracking-wider text-neo-muted mb-1">
                            {FIELD_LABELS[field] || field}
                        </p>
                        <p className="text-sm font-sans text-white whitespace-pre-wrap">
                            {typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
                        </p>
                    </div>
                ))}
            </div>

            <div className="flex gap-3">
                <button
                    onClick={onAccept}
                    disabled={isApplying}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500 border-2 border-black text-black font-display font-bold uppercase tracking-wider text-sm transition-all hover:bg-green-400 hover:-translate-y-0.5 disabled:opacity-50 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                >
                    <Check size={16} />
                    {isApplying ? 'Applying...' : 'Accept'}
                </button>
                <button
                    onClick={onReject}
                    disabled={isApplying}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#ff5555] border-2 border-black text-black font-display font-bold uppercase tracking-wider text-sm transition-all hover:bg-red-400 hover:-translate-y-0.5 disabled:opacity-50 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                >
                    <X size={16} />
                    Reject
                </button>
            </div>
        </motion.div>
    );
}


export default function IdeaDetail({ entry, onBack, onEntryUpdate }) {
    const { user } = useAuth();
    const {
        raw_input, summary, tech_stack, input_type,
        pros_cons, similar_tools, mermaid_syntax, image_url, created_at, status,
        creator, link, installation, unique_features, market_trend
    } = entry;

    // State for chat functionality
    const [chatMessages, setChatMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [isChatLoading, setIsChatLoading] = useState(false);
    const [isSearchMode, setIsSearchMode] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [applyingChangeId, setApplyingChangeId] = useState(null);
    const [dismissedProposals, setDismissedProposals] = useState(new Set());
    const [isEditing, setIsEditing] = useState(false);
    const [isSavingEdit, setIsSavingEdit] = useState(false);
    const [entryDraft, setEntryDraft] = useState({
        raw_input: raw_input || '',
        summary: summary || '',
        market_trend: market_trend || '',
        creator: creator || '',
        link: link || '',
        installation: installation || '',
    });
    const [draftTechStack, setDraftTechStack] = useState('');
    const [draftSimilarTools, setDraftSimilarTools] = useState('');
    const [draftUniqueFeatures, setDraftUniqueFeatures] = useState('');
    const [draftPros, setDraftPros] = useState('');
    const [draftCons, setDraftCons] = useState('');
    const [draftMermaid, setDraftMermaid] = useState('');
    const [draftTags, setDraftTags] = useState('');
    const [updates, setUpdates] = useState([]);
    const [newUpdate, setNewUpdate] = useState('');
    const [newUpdateType, setNewUpdateType] = useState('progress');
    const [isPostingUpdate, setIsPostingUpdate] = useState(false);
    const chatEndRef = useRef(null);
    const chatContainerRef = useRef(null);
    const isOwner = user?.id === entry.user_id;
    const isCollaborator = entry.collaborators?.some(c => c.id === user?.id);
    const hasWriteAccess = isOwner || isCollaborator;
    const [showCommands, setShowCommands] = useState(false);
    const [expandedMessages, setExpandedMessages] = useState(new Set());
    const [showScrollBtn, setShowScrollBtn] = useState(false);

    // Slash command definitions
    const SLASH_COMMANDS = [
        { cmd: '/post', desc: 'Post a timeline update', example: '/post Added login page', icon: Terminal },
        { cmd: '/update', desc: 'Update a catalog field', example: '/update summary New text', icon: Pencil },
        { cmd: '/publish', desc: 'Publish idea to community', example: '/publish', icon: Globe },
        { cmd: '/unpublish', desc: 'Unpublish from community', example: '/unpublish', icon: Lock },
        { cmd: '/help', desc: 'Show available commands', example: '/help', icon: HelpCircle },
    ];

    const addSystemMessage = async (text, type = 'info', persist = false) => {
        const sysMsg = {
            id: `sys-${Date.now()}`,
            message: text,
            is_system: true,
            system_type: type,
            created_at: new Date().toISOString(),
        };
        setChatMessages(prev => [...prev, sysMsg]);

        if (persist) {
            try {
                await authFetch(`/api/catalogs/${entry.id}/chat`, {
                    method: 'POST',
                    body: JSON.stringify({
                        message: `SYSTEM_MESSAGE::${type}::${text}`,
                        is_user: false
                    })
                });
            } catch (e) {
                console.error("Failed to persist system message", e);
            }
        }
    };

    const handleSlashCommand = async (input) => {
        const parts = input.trim().split(/\s+/);
        const cmd = parts[0].toLowerCase();
        const rest = parts.slice(1).join(' ');

        if (cmd === '/help') {
            addSystemMessage('__HELP__', 'help');
            return true;
        }
        if (cmd === '/post') {
            if (!rest) { addSystemMessage('Usage: /post <message>', 'error'); return true; }
            try {
                const res = await authFetch(`/api/catalogs/${entry.id}/updates`, {
                    method: 'POST', body: JSON.stringify({ content: rest, update_type: 'progress' }),
                });
                if (res.ok) { addSystemMessage(`Update posted: "${rest}"`, 'success', true); await fetchUpdates(); }
                else { addSystemMessage('Failed to post update', 'error'); }
            } catch { addSystemMessage('Error posting update', 'error'); }
            return true;
        }
        if (cmd === '/update') {
            const field = parts[1];
            const value = parts.slice(2).join(' ');
            if (!field || !value) { addSystemMessage('Usage: /update <field> <value>\nFields: summary, tech_stack, pros_cons, similar_tools', 'error'); return true; }
            try {
                const res = await authFetch(`/api/catalogs/${entry.id}`, {
                    method: 'PUT', body: JSON.stringify({ [field]: value }),
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.entry && onEntryUpdate) onEntryUpdate(data.entry);
                    addSystemMessage(`Updated "${field}" successfully`, 'success', true);
                } else { addSystemMessage(`Failed to update "${field}"`, 'error'); }
            } catch { addSystemMessage('Error updating field', 'error'); }
            return true;
        }
        if (cmd === '/publish') {
            try {
                const res = await authFetch(`/api/catalogs/${entry.id}/publish`, { method: 'POST', body: JSON.stringify({}) });
                if (res.ok) {
                    const data = await res.json();
                    if (data.entry && onEntryUpdate) onEntryUpdate(data.entry);
                    addSystemMessage('Idea published to the community!', 'success');
                } else { addSystemMessage('Failed to publish. Ensure the idea is completed.', 'error'); }
            } catch { addSystemMessage('Error publishing idea', 'error'); }
            return true;
        }
        if (cmd === '/unpublish') {
            try {
                const res = await authFetch(`/api/catalogs/${entry.id}/unpublish`, { method: 'POST' });
                if (res.ok) {
                    addSystemMessage('Idea set back to private.', 'success');
                    if (onEntryUpdate) { const e2 = { ...entry, visibility: 'private', published_at: null }; onEntryUpdate(e2); }
                } else { addSystemMessage('Failed to unpublish', 'error'); }
            } catch { addSystemMessage('Error unpublishing idea', 'error'); }
            return true;
        }
        return false;
    };

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

    const arrayToLines = (arr) => (arr || []).join('\n');
    const linesToArray = (value) => value
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);

    const techArray = safeArray(tech_stack);
    const toolsArray = safeArray(similar_tools);
    const pcData = safeProsCons(pros_cons);

    const isPending = status === 'pending';

    // Scroll chat to bottom when messages change
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);

    // Fetch chat messages when component mounts or entry changes
    useEffect(() => {
        fetchChatMessages();
        fetchUpdates();
    }, [entry.id]);

    useEffect(() => {
        setEntryDraft({
            raw_input: entry.raw_input || '',
            summary: entry.summary || '',
            market_trend: entry.market_trend || '',
            creator: entry.creator || '',
            link: entry.link || '',
            installation: entry.installation || '',
        });
        setDraftTechStack(arrayToLines(safeArray(entry.tech_stack)));
        setDraftSimilarTools(arrayToLines(safeArray(entry.similar_tools)));
        setDraftUniqueFeatures(arrayToLines(safeArray(entry.unique_features)));
        setDraftPros(arrayToLines(safeProsCons(entry.pros_cons).pros));
        setDraftCons(arrayToLines(safeProsCons(entry.pros_cons).cons));
        setDraftMermaid(entry.mermaid_syntax || '');
        setDraftTags(arrayToLines(safeArray(entry.tags)));
    }, [entry]);

    const fetchChatMessages = async () => {
        try {
            const response = await authFetch(`/api/catalogs/${entry.id}/chat`);
            if (response.ok) {
                const messages = await response.json();
                setChatMessages(messages);
            }
        } catch (error) {
            console.error('Error fetching chat messages:', error);
        }
    };

    const fetchUpdates = async () => {
        try {
            const response = await authFetch(`/api/catalogs/${entry.id}/updates`);
            if (response.ok) {
                const data = await response.json();
                setUpdates(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error('Error fetching updates:', error);
        }
    };

    const sendChatMessage = async () => {
        if (!chatInput.trim()) return;
        setShowCommands(false);

        // Intercept slash commands
        if (chatInput.trim().startsWith('/')) {
            const handled = await handleSlashCommand(chatInput);
            if (handled) { setChatInput(''); return; }
        }
        
        setIsChatLoading(true);
        try {
            const response = await authFetch('/api/webhooks/chat-message', {
                method: 'POST',
                body: JSON.stringify({
                    entry_id: entry.id,
                    message: chatInput,
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
                setChatInput('');
                await fetchChatMessages();
                
                // Poll for AI response
                setTimeout(async () => {
                    await fetchChatMessages();
                }, 3000);
                setTimeout(async () => {
                    await fetchChatMessages();
                }, 8000);
            }
        } catch (error) {
            console.error('Error sending chat message:', error);
        } finally {
            setIsChatLoading(false);
        }
    };

    const searchCatalogs = async () => {
        if (!chatInput.trim()) return;
        
        setIsChatLoading(true);
        try {
            const response = await authFetch('/api/catalogs/search', {
                method: 'POST',
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
            setIsChatLoading(false);
        }
    };

    const handleAcceptChanges = async (messageId, proposedChanges) => {
        setApplyingChangeId(messageId);
        try {
            const response = await authFetch(`/api/catalogs/${entry.id}/apply-chat-edit`, {
                method: 'POST',
                body: JSON.stringify({ changes: proposedChanges })
            });

            if (response.ok) {
                const data = await response.json();
                // Update the entry in the parent component
                if (data.entry && onEntryUpdate) {
                    onEntryUpdate(data.entry);
                }
                setDismissedProposals(prev => new Set([...prev, messageId]));
            }
        } catch (error) {
            console.error('Error applying changes:', error);
        } finally {
            setApplyingChangeId(null);
        }
    };

    const handleRejectChanges = (messageId) => {
        setDismissedProposals(prev => new Set([...prev, messageId]));
    };

    const handleSaveEntryEdits = async () => {
        setIsSavingEdit(true);
        try {
            const payload = {
                ...entryDraft,
                tech_stack: linesToArray(draftTechStack),
                similar_tools: linesToArray(draftSimilarTools),
                unique_features: linesToArray(draftUniqueFeatures),
                pros_cons: {
                    pros: linesToArray(draftPros),
                    cons: linesToArray(draftCons),
                },
                mermaid_syntax: draftMermaid,
                tags: linesToArray(draftTags),
            };
            const response = await authFetch(`/api/catalogs/${entry.id}`, {
                method: 'PUT',
                body: JSON.stringify(payload),
            });
            if (response.ok) {
                const data = await response.json();
                if (data.entry && onEntryUpdate) {
                    onEntryUpdate(data.entry);
                }
                setIsEditing(false);
            }
        } catch (error) {
            console.error('Error saving entry edits:', error);
        } finally {
            setIsSavingEdit(false);
        }
    };

    const handlePostUpdate = async () => {
        if (!newUpdate.trim()) return;
        setIsPostingUpdate(true);
        try {
            const response = await authFetch(`/api/catalogs/${entry.id}/updates`, {
                method: 'POST',
                body: JSON.stringify({
                    content: newUpdate,
                    update_type: newUpdateType,
                }),
            });

            if (response.ok) {
                setNewUpdate('');
                await fetchUpdates();
            }
        } catch (error) {
            console.error('Error posting update:', error);
        } finally {
            setIsPostingUpdate(false);
        }
    };

    const handleRemoveCollaborator = async (collabId) => {
        if (!window.confirm("Are you sure you want to remove this collaborator?")) return;
        try {
            const res = await authFetch(`/api/catalogs/${entry.id}/collaborators/${collabId}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                const updatedEntry = {
                    ...entry,
                    collaborators: entry.collaborators.filter(c => c.id !== collabId)
                };
                onEntryUpdate(updatedEntry);
            } else {
                const err = await res.json();
                alert(err.error || "Failed to remove collaborator");
            }
        } catch (e) {
            console.error(e);
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
                        {isEditing ? (
                            <textarea
                                value={entryDraft.summary}
                                onChange={(e) => setEntryDraft(prev => ({ ...prev, summary: e.target.value }))}
                                className="font-sans text-neo-text leading-relaxed text-base bg-black/30 p-6 border-l-4 border-neo-accent min-h-[140px] resize-y"
                            />
                        ) : (
                            <p className="font-sans text-neo-text leading-relaxed text-lg bg-black/30 p-6 border-l-4 border-neo-accent">
                                {summary || "No summary provided."}
                            </p>
                        )}
                    </div>
                </div>

                {/* Builder Team */}
                {entry.collaborators?.length > 0 && (
                    <div className="border border-neo-border bg-black/20 p-6">
                        <h3 className="font-display text-white font-bold uppercase tracking-wide mb-6 flex items-center gap-2">
                            <Users size={18} className="text-mi-accent" />
                            Builder Team
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {/* Owner */}
                            <div className="flex items-center gap-3 p-4 bg-mi-surface/40 border border-mi-accent/30 rounded-2xl relative overflow-hidden group">
                                <div className="absolute inset-0 bg-mi-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="w-12 h-12 rounded-full bg-mi-accent flex items-center justify-center font-heading text-white relative z-10 text-xl border-2 border-mi-accent/20">
                                    {entry.author?.avatar_url ? <img src={entry.author.avatar_url} className="w-full h-full rounded-full object-cover" /> : (entry.author?.name || 'O')[0]}
                                </div>
                                <div className="relative z-10">
                                    <p className="text-sm font-body font-bold text-white truncate max-w-[120px]">{entry.author?.name || 'Owner'}</p>
                                    <p className="text-[10px] text-mi-accent font-heading tracking-widest uppercase mt-0.5">Founder</p>
                                </div>
                            </div>
                            {/* Collaborators */}
                            {entry.collaborators.map(collab => (
                                <div key={collab.id} className="flex items-center gap-3 p-4 bg-mi-surface/40 border border-mi-border rounded-2xl relative overflow-hidden group hover:border-mi-border-light transition-colors">
                                    <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="w-12 h-12 rounded-full bg-mi-surface-2 border-2 border-mi-border flex items-center justify-center font-heading text-white relative z-10 text-xl">
                                        {collab.avatar_url ? <img src={collab.avatar_url} className="w-full h-full rounded-full object-cover" /> : (collab.name || 'C')[0]}
                                    </div>
                                    <div className="relative z-10">
                                        <p className="text-sm font-body font-bold text-white truncate max-w-[120px]">{collab.name || 'Builder'}</p>
                                        <p className="text-[10px] text-mi-text-muted font-heading tracking-widest uppercase mt-0.5">{collab.role?.replace('_', ' ') || 'Contributor'}</p>
                                    </div>
                                    
                                    {isOwner && (
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRemoveCollaborator(collab.id);
                                            }}
                                            className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-500/10 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20 z-20"
                                            title="Remove collaborator"
                                        >
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {hasWriteAccess && (
                    <div className="border border-neo-border bg-black/20 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-display text-white font-bold uppercase tracking-wide">Edit Catalog</h3>
                            <button
                                onClick={() => setIsEditing(!isEditing)}
                                className="px-3 py-1.5 border border-neo-border text-sm text-neo-text hover:border-white transition-colors"
                            >
                                {isEditing ? 'Close Editor' : 'Edit Post'}
                            </button>
                        </div>
                        {isEditing && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <input
                                    value={entryDraft.raw_input}
                                    onChange={(e) => setEntryDraft(prev => ({ ...prev, raw_input: e.target.value }))}
                                    placeholder="Title"
                                    className="px-3 py-2 bg-black/40 border border-neo-border text-white"
                                />
                                <input
                                    value={entryDraft.creator}
                                    onChange={(e) => setEntryDraft(prev => ({ ...prev, creator: e.target.value }))}
                                    placeholder="Creator"
                                    className="px-3 py-2 bg-black/40 border border-neo-border text-white"
                                />
                                <input
                                    value={entryDraft.link}
                                    onChange={(e) => setEntryDraft(prev => ({ ...prev, link: e.target.value }))}
                                    placeholder="Link"
                                    className="px-3 py-2 bg-black/40 border border-neo-border text-white"
                                />
                                <input
                                    value={entryDraft.installation}
                                    onChange={(e) => setEntryDraft(prev => ({ ...prev, installation: e.target.value }))}
                                    placeholder="Installation"
                                    className="px-3 py-2 bg-black/40 border border-neo-border text-white"
                                />
                                <textarea
                                    value={draftTags}
                                    onChange={(e) => setDraftTags(e.target.value)}
                                    placeholder="Tags (one per line)"
                                    className="md:col-span-2 px-3 py-2 bg-black/40 border border-neo-border text-white min-h-[70px]"
                                />
                                <textarea
                                    value={draftTechStack}
                                    onChange={(e) => setDraftTechStack(e.target.value)}
                                    placeholder="Tech stack (one per line)"
                                    className="md:col-span-2 px-3 py-2 bg-black/40 border border-neo-border text-white min-h-[90px]"
                                />
                                <textarea
                                    value={draftSimilarTools}
                                    onChange={(e) => setDraftSimilarTools(e.target.value)}
                                    placeholder="Similar tools (one per line)"
                                    className="md:col-span-2 px-3 py-2 bg-black/40 border border-neo-border text-white min-h-[90px]"
                                />
                                <textarea
                                    value={draftUniqueFeatures}
                                    onChange={(e) => setDraftUniqueFeatures(e.target.value)}
                                    placeholder="Unique features (one per line)"
                                    className="md:col-span-2 px-3 py-2 bg-black/40 border border-neo-border text-white min-h-[90px]"
                                />
                                <textarea
                                    value={draftPros}
                                    onChange={(e) => setDraftPros(e.target.value)}
                                    placeholder="Pros (one per line)"
                                    className="px-3 py-2 bg-black/40 border border-neo-border text-white min-h-[90px]"
                                />
                                <textarea
                                    value={draftCons}
                                    onChange={(e) => setDraftCons(e.target.value)}
                                    placeholder="Cons (one per line)"
                                    className="px-3 py-2 bg-black/40 border border-neo-border text-white min-h-[90px]"
                                />
                                <textarea
                                    value={draftMermaid}
                                    onChange={(e) => setDraftMermaid(e.target.value)}
                                    placeholder="Mermaid diagram"
                                    className="md:col-span-2 px-3 py-2 bg-black/40 border border-neo-border text-white min-h-[120px]"
                                />
                                <textarea
                                    value={entryDraft.market_trend}
                                    onChange={(e) => setEntryDraft(prev => ({ ...prev, market_trend: e.target.value }))}
                                    placeholder="Market trend"
                                    className="md:col-span-2 px-3 py-2 bg-black/40 border border-neo-border text-white min-h-[90px]"
                                />
                                <div className="md:col-span-2 flex justify-end">
                                    <button
                                        onClick={handleSaveEntryEdits}
                                        disabled={isSavingEdit}
                                        className="px-4 py-2 bg-neo-accent text-black font-display font-bold uppercase tracking-wider disabled:opacity-50"
                                    >
                                        {isSavingEdit ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="border border-neo-border bg-black/20 p-6">
                    <h3 className="font-display text-white font-bold uppercase tracking-wide mb-4">Update Thread</h3>
                    {hasWriteAccess && (
                        <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-2">
                            <select
                                value={newUpdateType}
                                onChange={(e) => setNewUpdateType(e.target.value)}
                                className="px-3 py-2 bg-black/40 border border-neo-border text-white"
                            >
                                <option value="progress">Progress</option>
                                <option value="feedback">Feedback</option>
                                <option value="changelog">Changelog</option>
                                <option value="milestone">Milestone</option>
                            </select>
                            <textarea
                                value={newUpdate}
                                onChange={(e) => setNewUpdate(e.target.value)}
                                placeholder="Post a daily update or feedback change..."
                                className="md:col-span-3 px-3 py-2 bg-black/40 border border-neo-border text-white min-h-[80px]"
                            />
                            <div className="md:col-span-4 flex justify-end">
                                <button
                                    onClick={handlePostUpdate}
                                    disabled={isPostingUpdate || !newUpdate.trim()}
                                    className="px-4 py-2 bg-neo-accent text-black font-display font-bold uppercase tracking-wider disabled:opacity-50"
                                >
                                    {isPostingUpdate ? 'Posting...' : 'Post Update'}
                                </button>
                            </div>
                        </div>
                    )}
                    <div className="space-y-3 max-h-72 overflow-y-auto">
                        {updates.length === 0 ? (
                            <p className="text-neo-muted text-sm italic">No updates yet.</p>
                        ) : updates.map((u) => (
                            <div key={u.id} className="p-3 bg-black/30 border border-neo-border">
                                <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs uppercase tracking-wider text-neo-accent">{u.update_type}</span>
                                        {u.user_id !== entry.user_id && (
                                            <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded uppercase font-bold">Collaborator</span>
                                        )}
                                    </div>
                                    <span className="text-xs text-neo-muted">{new Date(u.created_at).toLocaleString()}</span>
                                </div>
                                <p className="text-sm text-white whitespace-pre-wrap">{u.content}</p>
                            </div>
                        ))}
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
                         {isSearchMode ? 'Search Catalogs' : 'Chat with Catalog'}
                         <div className="flex items-center gap-2">
                             <button
                                 onClick={() => {
                                  setIsSearchMode(!isSearchMode);
                                  setChatInput('');
                                  setSearchResults([]);
                              }}
                                 className={`p-2 border-2 border-black bg-[#ff5555] text-black hover:bg-white transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 ${isSearchMode ? 'bg-white text-black' : ''}`}
                             >
                                 {isSearchMode ? <MessageSquare size={20} /> : <Search size={20} />}
                             </button>
                         </div>
                     </h3>
                     
                     {/* Search Results */}
                     {isSearchMode && searchResults.length > 0 && (
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
                     <div ref={chatContainerRef} className="h-96 overflow-y-auto mb-4 bg-black/30 rounded-lg p-4 relative"
                         onScroll={(e) => {
                             const el = e.target;
                             setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 100);
                         }}
                     >
                         {chatMessages.length > 0 ? (
                             <div className="space-y-3">
                                 {chatMessages.map((message, index) => {
                                     let isSystem = message.is_system;
                                     let sysText = message.message;
                                     let sysType = message.system_type || 'info';

                                     // Parse backend persisted system messages
                                     if (!message.is_user && message.message?.startsWith('SYSTEM_MESSAGE::')) {
                                         isSystem = true;
                                         const parts = message.message.split('::');
                                         sysType = parts[1] || 'info';
                                         sysText = parts[2] || '';
                                     }

                                     if (isSystem) {
                                         if (sysText === '__HELP__') {
                                             return (
                                                 <div key={message.id || index} className="mx-auto max-w-sm bg-mi-surface-2 border border-mi-border rounded-xl p-4">
                                                     <div className="flex items-center gap-2 mb-3">
                                                         <HelpCircle size={14} className="text-mi-accent" />
                                                         <span className="font-heading text-sm tracking-wide text-white">COMMANDS</span>
                                                     </div>
                                                     <div className="space-y-2">
                                                         {SLASH_COMMANDS.filter(c => c.cmd !== '/help').map(c => (
                                                             <div key={c.cmd} className="flex items-start gap-2">
                                                                 <code className="text-xs text-mi-accent font-body bg-mi-accent/10 px-1.5 py-0.5 rounded shrink-0">{c.cmd}</code>
                                                                 <span className="text-xs text-mi-text-muted font-body">{c.desc}</span>
                                                             </div>
                                                         ))}
                                                     </div>
                                                 </div>
                                             );
                                         }
                                         return (
                                             <div key={message.id || index} className="flex justify-center">
                                                 <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-body ${
                                                     sysType === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                                                     sysType === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                                     'bg-white/5 text-mi-text-muted border border-mi-border'
                                                 }`}>
                                                     {sysType === 'success' ? <CheckCircle2 size={12} /> :
                                                      sysType === 'error' ? <AlertTriangle size={12} /> :
                                                      <Terminal size={12} />}
                                                     {sysText}
                                                 </div>
                                             </div>
                                         );
                                     }


                                     const isLong = !message.is_user && message.message && message.message.length > 300;
                                     const isExpanded = expandedMessages.has(message.id);

                                     return (
                                         <div key={message.id || index}>
                                             {message.is_user ? (
                                                 /* User message — compact right-aligned bubble */
                                                 <div className="flex justify-end">
                                                     <div className="max-w-[80%] px-4 py-2 rounded-xl bg-mi-accent text-white">
                                                         <p className="text-sm font-body">{message.message}</p>
                                                         <span className="text-[10px] text-white/50 block mt-1">
                                                             {new Date(message.created_at).toLocaleTimeString()}
                                                         </span>
                                                     </div>
                                                 </div>
                                             ) : (
                                                 /* AI message — structured card */
                                                 <div className="flex gap-2.5">
                                                     <div className="w-7 h-7 rounded-lg bg-mi-surface-2 border border-mi-border flex items-center justify-center shrink-0 mt-0.5">
                                                         <Bot size={14} className="text-mi-accent" />
                                                     </div>
                                                     <div className="flex-1 min-w-0 bg-mi-surface-2/60 border border-mi-border/60 rounded-xl px-4 py-3">
                                                         <div className="flex items-center gap-2 mb-2">
                                                             <span className="text-xs font-body font-semibold text-mi-text-secondary">AI Assistant</span>
                                                             <span className="text-[10px] text-mi-text-muted font-body">
                                                                 {new Date(message.created_at).toLocaleTimeString()}
                                                             </span>
                                                         </div>
                                                         <div className={`text-sm prose prose-invert prose-sm max-w-none font-body ${isLong && !isExpanded ? 'max-h-32 overflow-hidden relative' : ''}`}>
                                                             <ReactMarkdown>{message.message}</ReactMarkdown>
                                                             {isLong && !isExpanded && (
                                                                 <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-mi-surface-2/90 to-transparent" />
                                                             )}
                                                         </div>
                                                         {isLong && (
                                                             <button
                                                                 onClick={() => setExpandedMessages(prev => {
                                                                     const next = new Set(prev);
                                                                     isExpanded ? next.delete(message.id) : next.add(message.id);
                                                                     return next;
                                                                 })}
                                                                 className="flex items-center gap-1 text-xs text-mi-accent font-body mt-2 hover:underline"
                                                             >
                                                                 {isExpanded ? <><ChevronUp size={12} /> Show less</> : <><ChevronDown size={12} /> Show more</>}
                                                             </button>
                                                         )}
                                                     </div>
                                                 </div>
                                             )}
                                             
                                             {/* Proposed changes card */}
                                             {message.proposed_changes && !dismissedProposals.has(message.id) && (
                                                 <ProposedChangesCard
                                                     proposedChanges={message.proposed_changes}
                                                     onAccept={() => handleAcceptChanges(message.id, message.proposed_changes)}
                                                     onReject={() => handleRejectChanges(message.id)}
                                                     isApplying={applyingChangeId === message.id}
                                                 />
                                             )}
                                             {message.proposed_changes && dismissedProposals.has(message.id) && (
                                                 <div className="flex items-center gap-1 text-xs text-neo-muted italic ml-10 mt-1">
                                                     <CheckCircle2 size={12} /> Changes {applyingChangeId === null ? 'handled' : 'applied'}
                                                 </div>
                                             )}
                                         </div>
                                     );
                                 })}
                                 {/* Typing indicator */}
                                 {isChatLoading && (
                                     <div className="flex gap-2.5">
                                         <div className="w-7 h-7 rounded-lg bg-mi-surface-2 border border-mi-border flex items-center justify-center shrink-0">
                                             <Bot size={14} className="text-mi-accent" />
                                         </div>
                                         <div className="bg-mi-surface-2/60 border border-mi-border/60 rounded-xl px-4 py-3 flex items-center gap-1.5">
                                             <span className="w-1.5 h-1.5 rounded-full bg-mi-text-muted animate-bounce" style={{animationDelay: '0ms'}} />
                                             <span className="w-1.5 h-1.5 rounded-full bg-mi-text-muted animate-bounce" style={{animationDelay: '150ms'}} />
                                             <span className="w-1.5 h-1.5 rounded-full bg-mi-text-muted animate-bounce" style={{animationDelay: '300ms'}} />
                                         </div>
                                     </div>
                                 )}
                                 <div ref={chatEndRef} />
                             </div>
                         ) : (
                             <p className="text-neo-muted text-center py-8">No messages yet. Type / for commands or start chatting!</p>
                         )}
                         {/* Scroll to bottom button */}
                         {showScrollBtn && (
                             <button
                                 onClick={() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })}
                                 className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-mi-accent text-white flex items-center justify-center shadow-lg hover:bg-mi-accent-hover transition-colors"
                             >
                                 <ArrowDown size={14} />
                             </button>
                         )}
                     </div>
                     
                     {/* Slash Command Autocomplete */}
                     <AnimatePresence>
                         {showCommands && (
                             <motion.div
                                 initial={{ opacity: 0, y: 8 }}
                                 animate={{ opacity: 1, y: 0 }}
                                 exit={{ opacity: 0, y: 8 }}
                                 className="mb-2 bg-mi-surface border border-mi-border rounded-xl overflow-hidden shadow-editorial"
                             >
                                 {SLASH_COMMANDS.filter(c => c.cmd.startsWith(chatInput.trim().toLowerCase() || '/')).map(c => (
                                     <button
                                         key={c.cmd}
                                         onClick={() => { setChatInput(c.cmd + ' '); setShowCommands(false); }}
                                         className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-white/5 transition-colors group"
                                     >
                                         <c.icon size={14} className="text-mi-accent shrink-0" />
                                         <div className="flex-1 min-w-0">
                                             <code className="text-sm text-white font-body">{c.cmd}</code>
                                             <span className="text-xs text-mi-text-muted font-body ml-2">{c.desc}</span>
                                         </div>
                                         <span className="text-[10px] text-mi-text-muted font-body opacity-0 group-hover:opacity-100 transition-opacity">{c.example}</span>
                                     </button>
                                 ))}
                             </motion.div>
                         )}
                     </AnimatePresence>

                     {/* Chat Input */}
                     <div className="flex gap-2">
                         <textarea
                             value={chatInput}
                             onChange={(e) => {
                                 setChatInput(e.target.value);
                                 setShowCommands(e.target.value.startsWith('/') && !e.target.value.includes(' '));
                             }}
                             onKeyDown={(e) => {
                                  if (e.key === 'Enter' && !e.shiftKey) {
                                      e.preventDefault();
                                      isSearchMode ? searchCatalogs() : sendChatMessage();
                                  }
                              }}
                              placeholder={isSearchMode ? "Search other catalogs..." : "Message or type / for commands..."}
                             className="flex-1 min-h-[60px] px-3 py-2 bg-black/40 text-white border border-neo-border resize-none focus:outline-none focus:ring-2 focus:ring-neo-accent rounded-lg font-body text-sm"
                             disabled={isChatLoading}
                         />
                         <button
                             onClick={() => isSearchMode ? searchCatalogs() : sendChatMessage()}
                             disabled={isChatLoading || !chatInput.trim()}
                             className={`px-4 py-2 bg-mi-accent text-white font-body font-semibold text-sm rounded-lg transition-colors hover:bg-mi-accent-hover disabled:opacity-50`}
                         >
                             {isChatLoading ? (isSearchMode ? 'Searching...' : 'Sending...') : (isSearchMode ? 'Search' : 'Send')}
                         </button>
                     </div>
                 </div>
             </div>
         </motion.div>
     );
 }
