import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Send, Loader2 } from 'lucide-react';

export default function IdeaInput({ onSubmit, isSubmitting }) {
    const [idea, setIdea] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        if (idea.trim() && !isSubmitting) {
            onSubmit(idea);
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
                    <label className="flex items-center gap-2 text-xl font-display font-medium mb-2 uppercase tracking-tight">
                        <Lightbulb className="text-neo-accent" size={24} />
                        Incubate New Idea
                    </label>
                    <textarea
                        className="input-neo min-h-[120px] text-lg bg-black/20"
                        placeholder="Dump your raw idea, concept, or tool name here..."
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
                                    Incubating...
                                </>
                            ) : (
                                <>
                                    <Send size={20} />
                                    Submit Idea
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </motion.div>
    );
}
