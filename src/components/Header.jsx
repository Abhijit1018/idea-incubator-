import React from 'react';
import { Sparkles } from 'lucide-react';

export default function Header() {
    return (
        <header className="mb-16 mt-8 flex flex-col md:flex-row items-center justify-between gap-6 border-b-4 border-white pb-6">
            <div className="flex items-center gap-4">
                <div className="bg-neo-accent text-black p-3 shadow-neo-card transform -rotate-3 hover:rotate-0 transition-transform cursor-pointer">
                    <Sparkles size={32} />
                </div>
                <div>
                    <h1 className="text-5xl md:text-6xl font-display font-black uppercase tracking-tighter leading-none text-white drop-shadow-[4px_4px_0px_rgba(204,255,0,0.5)]">
                        Idea <br className="hidden md:block" /> Incubator
                    </h1>
                </div>
            </div>

            <div className="flex gap-4">
                <div className="text-right flex flex-col justify-end">
                    <p className="font-sans text-sm text-neo-muted uppercase tracking-widest font-bold">Status</p>
                    <p className="font-display text-xl text-neo-accent flex items-center gap-2">
                        <span className="w-3 h-3 bg-neo-accent rounded-full animate-pulse shadow-[0_0_10px_2px_rgba(204,255,0,0.5)]"></span>
                        SYSTEM ONLINE
                    </p>
                </div>
            </div>
        </header>
    );
}
