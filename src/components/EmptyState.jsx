import React from 'react';
import { motion } from 'framer-motion';

export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center p-8 text-center"
    >
      <div className="w-16 h-16 rounded-full bg-mi-surface-hover flex items-center justify-center mb-4 relative">
        <div className="absolute inset-0 rounded-full bg-mi-accent/10 blur-xl"></div>
        {Icon && <Icon size={32} className="text-mi-text-muted relative z-10" />}
      </div>
      <h3 className="font-heading tracking-wide text-white text-lg mb-2">{title}</h3>
      <p className="font-body text-sm text-mi-text-muted max-w-sm mb-6">
        {description}
      </p>
      {action && (
        <div className="mt-2">
          {action}
        </div>
      )}
    </motion.div>
  );
}
