import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Code, Palette, GraduationCap, DollarSign, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { authFetch } from '../lib/api';

const ROLES = [
  { value: 'co_founder', label: 'Co-Founder', icon: Users, desc: 'Build this from the ground up together', color: 'from-orange-500 to-red-500' },
  { value: 'developer', label: 'Developer', icon: Code, desc: 'Help build the technical side', color: 'from-blue-500 to-cyan-500' },
  { value: 'designer', label: 'Designer', icon: Palette, desc: 'Help with UX/UI and visuals', color: 'from-purple-500 to-pink-500' },
  { value: 'advisor', label: 'Advisor', icon: GraduationCap, desc: 'Offer domain expertise & guidance', color: 'from-green-500 to-teal-500' },
  { value: 'investor', label: 'Investor', icon: DollarSign, desc: 'Interested in funding this idea', color: 'from-yellow-500 to-orange-500' },
];

export default function ConnectModal({ isOpen, onClose, entryId, ideaTitle }) {
  const [selectedRole, setSelectedRole] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async () => {
    if (!selectedRole || sending) return;
    setSending(true);
    setError('');
    try {
      const res = await authFetch(`/api/community/${entryId}/connect`, {
        method: 'POST',
        body: JSON.stringify({ role: selectedRole, message }),
      });
      if (res.ok) {
        setSent(true);
        setTimeout(() => { onClose(); setSent(false); setSelectedRole(''); setMessage(''); }, 2000);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to send request');
      }
    } catch (e) {
      setError('Network error. Please try again.');
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg bg-mi-surface border border-mi-border rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 pb-4 border-b border-mi-border">
              <div>
                <h3 className="font-heading text-xl tracking-wide text-white">COLLABORATE</h3>
                <p className="font-body text-xs text-mi-text-muted mt-1 truncate max-w-[300px]">
                  On: {ideaTitle}
                </p>
              </div>
              <button onClick={onClose} className="p-2 rounded-xl text-mi-text-muted hover:text-white hover:bg-white/5 transition-colors">
                <X size={18} />
              </button>
            </div>

            {sent ? (
              <div className="p-10 text-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
                  <CheckCircle2 size={48} className="mx-auto text-green-400 mb-4" />
                </motion.div>
                <h4 className="font-heading text-lg text-white tracking-wide">REQUEST SENT!</h4>
                <p className="font-body text-sm text-mi-text-muted mt-2">The idea owner will be notified.</p>
              </div>
            ) : (
              <>
                {/* Role Selection */}
                <div className="p-6 space-y-3">
                  <label className="block text-xs font-body font-medium text-mi-text-muted tracking-wide uppercase mb-2">
                    Choose your role
                  </label>
                  <div className="space-y-2">
                    {ROLES.map((role) => {
                      const Icon = role.icon;
                      const isSelected = selectedRole === role.value;
                      return (
                        <button
                          key={role.value}
                          onClick={() => setSelectedRole(role.value)}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 text-left group ${
                            isSelected
                              ? 'border-mi-accent bg-mi-accent/5'
                              : 'border-mi-border hover:border-mi-border-light bg-mi-bg/50'
                          }`}
                        >
                          <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${role.color} flex items-center justify-center shrink-0 ${
                            isSelected ? 'opacity-100' : 'opacity-50 group-hover:opacity-80'
                          } transition-opacity`}>
                            <Icon size={16} className="text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className={`font-body text-sm font-medium ${isSelected ? 'text-white' : 'text-mi-text-secondary'}`}>
                              {role.label}
                            </span>
                            <p className="font-body text-xs text-mi-text-muted truncate">{role.desc}</p>
                          </div>
                          <div className={`w-4 h-4 rounded-full border-2 transition-colors shrink-0 ${
                            isSelected ? 'border-mi-accent bg-mi-accent' : 'border-mi-border'
                          }`}>
                            {isSelected && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-full h-full rounded-full bg-mi-accent flex items-center justify-center"
                              >
                                <div className="w-1.5 h-1.5 rounded-full bg-white" />
                              </motion.div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Message */}
                <div className="px-6 pb-4">
                  <label className="block text-xs font-body font-medium text-mi-text-muted tracking-wide uppercase mb-2">
                    Message (optional)
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Introduce yourself and why you're interested..."
                    rows={3}
                    className="input-editorial resize-none"
                    maxLength={500}
                  />
                </div>

                {/* Error */}
                {error && (
                  <div className="px-6 pb-3">
                    <p className="font-body text-xs text-red-400">{error}</p>
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 pt-4 border-t border-mi-border">
                  <button onClick={onClose} className="btn-secondary px-5 py-2.5 text-sm">
                    Cancel
                  </button>
                  <button
                    onClick={handleSend}
                    disabled={!selectedRole || sending}
                    className="btn-primary px-5 py-2.5 text-sm disabled:opacity-40"
                  >
                    {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                    Send Request
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
