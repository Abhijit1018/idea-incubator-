import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Wrench, Send, Loader2 } from 'lucide-react';

export default function IdeaInput({ onSubmit, isSubmitting }) {
    const [idea, setIdea] = useState("");
    const [inputType, setInputType] = useState("idea");

    const handleSubmit = (e) => {
        e.preventDefault();
        if (idea.trim() && !isSubmitting) {
            onSubmit({ raw_input: idea, input_type: inputType });
            setIdea("");
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full max-w-3xl mx-auto mb-16"
        >
            <div className="card-neo relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-2 h-full bg-neo-accent"></div>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex justify-between items-center mb-2">
                        <label className="flex items-center gap-2 text-xl font-display font-medium uppercase tracking-tight text-white">
                            {inputType === 'idea' ? <Lightbulb className="text-neo-accent" size={24} /> : <Wrench className="text-neo-accent" size={24} />}
                            {inputType === 'idea' ? 'Incubate New Idea' : 'Discover Tool'}
                        </label>
                        <div className="flex bg-black/40 p-1 border border-neo-border">
                            <button
                                type="button"
                                onClick={() => setInputType('idea')}
                                className={`px-4 py-1 text-sm font-display uppercase tracking-wider transition-colors ${inputType === 'idea' ? 'bg-neo-accent text-black font-bold' : 'text-neo-muted hover:text-white'}`}
                            >Idea</button>
                            <button
                                type="button"
                                onClick={() => setInputType('tool')}
                                className={`px-4 py-1 text-sm font-display uppercase tracking-wider transition-colors ${inputType === 'tool' ? 'bg-neo-accent text-black font-bold' : 'text-neo-muted hover:text-white'}`}
                            >Tool</button>
                        </div>
                    </div>

                    <textarea
                        className="input-neo min-h-[120px] text-lg bg-black/20 text-white"
                        placeholder={inputType === 'idea' ? "Dump your raw idea or concept here..." : "Enter the tool name you want to research..."}
                        value={idea}
                        onChange={(e) => setIdea(e.target.value)}
                        disabled={isSubmitting}
                    />
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={isSubmitting || !idea.trim()}
                            className="btn-neo-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    {inputType === 'idea' ? 'Incubating...' : 'Researching...'}
                                </>
                            ) : (
                                <>
                                    <Send size={20} />
                                    {inputType === 'idea' ? 'Submit Idea' : 'Submit Tool'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </motion.div>
    );
}
