import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Lightbulb, Users, Heart, MessageSquare, Check, CheckCheck } from 'lucide-react';
import { authFetch } from '../lib/api';
import { useAuth } from '../lib/AuthContext';

const TYPE_CONFIG = {
  reaction: { icon: Heart, color: 'text-red-400', bg: 'bg-red-400/10' },
  connect_request: { icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
  connect_accepted: { icon: Check, color: 'text-green-400', bg: 'bg-green-400/10' },
  connect_declined: { icon: Users, color: 'text-mi-text-muted', bg: 'bg-white/5' },
  comment: { icon: MessageSquare, color: 'text-purple-400', bg: 'bg-purple-400/10' },
};

export default function NotificationBell() {
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef(null);
  const navigate = useNavigate();

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await authFetch('/api/notifications?limit=20');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unread_count || 0);
      }
    } catch (e) {
      console.error('Failed to fetch notifications', e);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchNotifications();
    // Poll every 30s for new notifications
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const markAllRead = async () => {
    try {
      await authFetch('/api/notifications/read', {
        method: 'POST',
        body: JSON.stringify({ all: true }),
      });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (e) {
      console.error(e);
    }
  };

  const handleNotifClick = (notif) => {
    if (notif.link) {
      navigate(notif.link);
      setOpen(false);
    }
  };

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'now';
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    const days = Math.floor(hrs / 24);
    return `${days}d`;
  };

  if (!isAuthenticated) return null;

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Button */}
      <button
        onClick={() => { setOpen(!open); if (!open) fetchNotifications(); }}
        className="relative p-2 rounded-xl text-mi-text-muted hover:text-white hover:bg-white/5 transition-colors"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-mi-accent rounded-full flex items-center justify-center text-[10px] font-body font-bold text-white"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-[380px] max-h-[480px] bg-mi-surface border border-mi-border rounded-2xl shadow-2xl overflow-hidden z-[80]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-mi-border">
              <h4 className="font-heading text-sm tracking-wider text-white">NOTIFICATIONS</h4>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1.5 text-xs text-mi-accent font-body hover:underline"
                >
                  <CheckCheck size={13} />
                  Mark all read
                </button>
              )}
            </div>

            {/* List */}
            <div className="overflow-y-auto max-h-[400px]">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell size={28} className="mx-auto text-mi-text-muted mb-3" />
                  <p className="font-body text-sm text-mi-text-muted">No notifications yet</p>
                </div>
              ) : (
                notifications.map((notif) => {
                  const config = TYPE_CONFIG[notif.type] || TYPE_CONFIG.reaction;
                  const Icon = config.icon;
                  return (
                    <button
                      key={notif.id}
                      onClick={() => handleNotifClick(notif)}
                      className={`w-full flex items-start gap-3 px-5 py-3.5 text-left transition-colors hover:bg-white/3 ${
                        !notif.is_read ? 'bg-mi-accent/[0.03]' : ''
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                        <Icon size={14} className={config.color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-body text-sm leading-snug ${!notif.is_read ? 'text-white' : 'text-mi-text-secondary'}`}>
                          {notif.title}
                        </p>
                        {notif.message && (
                          <p className="font-body text-xs text-mi-text-muted mt-0.5 truncate">{notif.message}</p>
                        )}
                        <span className="font-body text-[10px] text-mi-text-muted mt-1 block">{timeAgo(notif.created_at)}</span>
                      </div>
                      {!notif.is_read && (
                        <div className="w-2 h-2 rounded-full bg-mi-accent shrink-0 mt-2" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
