import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock } from 'lucide-react';

export default function InactivityWarning({ visible, secondsLeft, onStay, onLeave }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-mi-surface border border-mi-border rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-yellow-400/10 flex items-center justify-center">
                <Clock size={20} className="text-yellow-400" />
              </div>
              <h3 className="font-heading text-xl tracking-wide text-white">Still there?</h3>
            </div>
            <p className="font-body text-mi-text-secondary text-sm mb-2">
              You've been inactive. You'll be logged out in:
            </p>
            <div className="font-heading text-5xl text-mi-accent text-center my-4">
              {secondsLeft}s
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={onStay} className="flex-1 btn-primary justify-center">
                Stay Logged In
              </button>
              <button onClick={onLeave} className="flex-1 btn-secondary justify-center">
                Log Out
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
