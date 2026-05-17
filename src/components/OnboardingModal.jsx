import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, Brain, GitBranch, Users, ArrowRight, Sparkles } from 'lucide-react';

const STEPS = [
  {
    icon: Lightbulb,
    title: 'Drop any raw idea',
    body: 'Type any concept, tool name, or fleeting thought. Even a half-baked idea is enough to start.',
    accent: 'from-yellow-400/20 to-orange-400/10',
  },
  {
    icon: Brain,
    title: 'AI does the research',
    body: 'Our n8n + LLM pipeline generates a full breakdown: summary, tech stack, pros & cons, and competitive landscape.',
    accent: 'from-blue-400/20 to-purple-400/10',
  },
  {
    icon: GitBranch,
    title: 'Get your blueprint',
    body: 'Every idea gets an auto-generated architecture diagram and concept image — ready to share or build from.',
    accent: 'from-green-400/20 to-teal-400/10',
  },
  {
    icon: Users,
    title: 'Collaborate & publish',
    body: 'Publish ideas to the community, collect reactions, and find co-builders who want to build with you.',
    accent: 'from-mi-accent/20 to-red-400/10',
  },
];

export default function OnboardingModal({ onClose, onSubmitDemo }) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const Icon = current.icon;
  const isLast = step === STEPS.length - 1;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-mi-surface border border-mi-border rounded-2xl p-8 max-w-md w-full shadow-2xl"
        >
          <div className="flex items-center gap-2 mb-6">
            <Sparkles size={16} className="text-mi-accent" />
            <span className="font-heading text-sm tracking-wider text-mi-accent uppercase">
              Welcome to MindInspo
            </span>
          </div>

          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`rounded-xl bg-gradient-to-br ${current.accent} border border-mi-border p-6 mb-6`}
          >
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-4">
              <Icon size={24} className="text-white" />
            </div>
            <h3 className="font-heading text-2xl tracking-wide text-white mb-2">{current.title}</h3>
            <p className="font-body text-sm text-mi-text-secondary leading-relaxed">{current.body}</p>
          </motion.div>

          <div className="flex gap-2 justify-center mb-6">
            {STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === step ? 'w-6 h-2 bg-mi-accent' : 'w-2 h-2 bg-mi-border'
                }`}
              />
            ))}
          </div>

          <div className="flex gap-3">
            {isLast ? (
              <button
                onClick={() => { onSubmitDemo(); onClose(); }}
                className="flex-1 btn-primary justify-center"
              >
                <Lightbulb size={16} />
                Try My First Idea
              </button>
            ) : (
              <button
                onClick={() => setStep(s => s + 1)}
                className="flex-1 btn-primary justify-center"
              >
                Next
                <ArrowRight size={16} />
              </button>
            )}
            <button onClick={onClose} className="btn-secondary px-4">
              Skip
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
