import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Mail, Github, Twitter, Save, Loader2, Camera, ShieldCheck, 
  Settings as SettingsIcon, Bell, Lock, Trash2, LogOut
} from 'lucide-react';
import { authFetch } from '../lib/api';
import { useAuth } from '../lib/AuthContext';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    bio: '',
    avatar_url: '',
    github_url: '',
    twitter_url: '',
    skills: [],
    is_admin: false
  });
  const [newSkill, setNewSkill] = useState('');

  const [activeTab, setActiveTab] = useState('profile');
  const [deletingAccount, setDeletingAccount] = useState(false);

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you sure? This will permanently delete your account and ALL your ideas, comments, and data. This cannot be undone.'
    );
    if (!confirmed) return;

    const doubleConfirmed = window.confirm(
      'Last chance — permanently delete everything?'
    );
    if (!doubleConfirmed) return;

    setDeletingAccount(true);
    try {
      const res = await authFetch('/api/account/delete', { method: 'DELETE' });
      if (res.ok) {
        toast.success('Account deleted');
        await signOut();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to delete account');
      }
    } catch {
      toast.error('Network error — try again');
    } finally {
      setDeletingAccount(false);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await authFetch('/api/profile');
        if (res.ok) {
          const data = await res.json();
          setProfile({
            ...data,
            skills: Array.isArray(data.skills) ? data.skills : []
          });
        }
      } catch (e) {
        console.error(e);
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await authFetch('/api/profile', {
        method: 'POST',
        body: JSON.stringify(profile)
      });
      if (res.ok) {
        toast.success("Profile updated successfully");
      } else {
        toast.error("Failed to update profile");
      }
    } catch (e) {
      console.error(e);
      toast.error("An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const addSkill = (e) => {
    e.preventDefault();
    if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
      setProfile(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skillToRemove)
    }));
  };

  if (loading) {
    return (
      <div className="pt-32 flex justify-center">
        <Loader2 className="w-8 h-8 text-mi-accent animate-spin" />
      </div>
    );
  }

  const sections = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Lock },
  ];

  return (
    <div className="pt-24 pb-16 min-h-screen bg-mi-bg">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* Sidebar */}
          <div className="lg:w-64 shrink-0">
            <h1 className="font-heading text-3xl tracking-wide text-white mb-8 flex items-center gap-3">
              <SettingsIcon size={24} className="text-mi-accent" />
              SETTINGS
            </h1>
            <nav className="space-y-1">
              {sections.map(s => (
                <button
                  key={s.id}
                  onClick={() => setActiveTab(s.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-body text-sm transition-all ${
                    activeTab === s.id 
                    ? 'bg-mi-accent/10 text-mi-accent border border-mi-accent/20' 
                    : 'text-mi-text-muted hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <s.icon size={18} />
                  {s.label}
                </button>
              ))}
            </nav>

            <div className="mt-10 pt-6 border-t border-mi-border">
              <button 
                onClick={signOut}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-body text-sm text-red-400 hover:bg-red-400/10 transition-all"
              >
                <LogOut size={18} />
                Sign Out
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 max-w-2xl">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* Account Badge */}
              <div className="bg-mi-surface border border-mi-border rounded-2xl p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-mi-accent to-orange-600 flex items-center justify-center font-heading text-2xl text-white overflow-hidden shrink-0">
                    {profile.avatar_url ? (
                      <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      (profile.name || user?.email || '?')[0].toUpperCase()
                    )}
                  </div>
                  <div>
                    <h2 className="font-heading text-xl text-white">{profile.name || 'Anonymous User'}</h2>
                    <p className="font-body text-sm text-mi-text-muted">{user?.email}</p>
                  </div>
                </div>
                {profile.is_admin && (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-mi-accent/10 border border-mi-accent/20 text-mi-accent text-[10px] font-heading tracking-widest uppercase">
                    <ShieldCheck size={12} /> Admin
                  </div>
                )}
              </div>

              {activeTab === 'profile' && (
                <div className="bg-mi-surface border border-mi-border rounded-2xl p-8 space-y-6">
                  <div className="grid grid-cols-1 gap-6">
                    {/* Name */}
                    <div className="space-y-2">
                      <label className="section-label !bg-transparent !p-0">Display Name</label>
                      <div className="relative">
                        <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-mi-text-muted" />
                        <input
                          type="text"
                          value={profile.name}
                          onChange={e => setProfile({...profile, name: e.target.value})}
                          placeholder="Your full name"
                          className="input-editorial pl-12"
                        />
                      </div>
                    </div>

                    {/* Bio */}
                    <div className="space-y-2">
                      <label className="section-label !bg-transparent !p-0">Bio</label>
                      <textarea
                        value={profile.bio}
                        onChange={e => setProfile({...profile, bio: e.target.value})}
                        placeholder="Tell us about yourself..."
                        rows={4}
                        className="input-editorial resize-none h-32"
                      />
                    </div>

                    {/* Avatar URL */}
                    <div className="space-y-2">
                      <label className="section-label !bg-transparent !p-0">Avatar URL</label>
                      <div className="relative">
                        <Camera size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-mi-text-muted" />
                        <input
                          type="text"
                          value={profile.avatar_url}
                          onChange={e => setProfile({...profile, avatar_url: e.target.value})}
                          placeholder="https://..."
                          className="input-editorial pl-12"
                        />
                      </div>
                    </div>

                    {/* Social Links */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="section-label !bg-transparent !p-0">GitHub</label>
                        <div className="relative">
                          <Github size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-mi-text-muted" />
                          <input
                            type="text"
                            value={profile.github_url}
                            onChange={e => setProfile({...profile, github_url: e.target.value})}
                            placeholder="Username"
                            className="input-editorial pl-12"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="section-label !bg-transparent !p-0">Twitter</label>
                        <div className="relative">
                          <Twitter size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-mi-text-muted" />
                          <input
                            type="text"
                            value={profile.twitter_url}
                            onChange={e => setProfile({...profile, twitter_url: e.target.value})}
                            placeholder="@username"
                            className="input-editorial pl-12"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Skills */}
                    <div className="space-y-2">
                      <label className="section-label !bg-transparent !p-0">Skills & Expertise</label>
                      <form onSubmit={addSkill} className="flex gap-2">
                        <input
                          type="text"
                          value={newSkill}
                          onChange={e => setNewSkill(e.target.value)}
                          placeholder="Add a skill (e.g. React, UI Design)"
                          className="input-editorial"
                        />
                        <button type="submit" className="px-6 py-2 bg-white/5 border border-mi-border text-white font-body text-sm rounded-xl hover:bg-white/10 transition-all shrink-0">
                          Add
                        </button>
                      </form>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {profile.skills.map(skill => (
                          <span 
                            key={skill} 
                            className="flex items-center gap-2 px-3 py-1.5 bg-mi-accent/10 border border-mi-accent/20 text-mi-accent text-xs font-body rounded-lg group"
                          >
                            {skill}
                            <button onClick={() => removeSkill(skill)} className="hover:text-white">
                              <Trash2 size={12} />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-mi-border flex justify-end">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="btn-primary min-w-[140px] justify-center"
                    >
                      {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                      Save Changes
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="bg-mi-surface border border-mi-border rounded-2xl p-8 space-y-8">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-heading text-lg text-white">Email Notifications</h4>
                        <p className="font-body text-xs text-mi-text-muted">Receive updates about your projects via email.</p>
                      </div>
                      <div className="w-12 h-6 bg-mi-accent rounded-full p-1 cursor-pointer">
                        <div className="w-4 h-4 bg-white rounded-full ml-auto" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-heading text-lg text-white">Collaboration Requests</h4>
                        <p className="font-body text-xs text-mi-text-muted">Notify me when someone wants to join my team.</p>
                      </div>
                      <div className="w-12 h-6 bg-mi-accent rounded-full p-1 cursor-pointer">
                        <div className="w-4 h-4 bg-white rounded-full ml-auto" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-heading text-lg text-white">Platform News</h4>
                        <p className="font-body text-xs text-mi-text-muted">Get the latest updates on MindInspo features.</p>
                      </div>
                      <div className="w-12 h-6 bg-mi-border rounded-full p-1 cursor-pointer">
                        <div className="w-4 h-4 bg-mi-text-muted rounded-full" />
                      </div>
                    </div>
                  </div>
                  <div className="pt-6 border-t border-mi-border flex justify-end">
                    <button className="btn-primary min-w-[140px] justify-center" onClick={() => toast.success("Preferences saved")}>
                      Save Preferences
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="bg-mi-surface border border-mi-border rounded-2xl p-8 space-y-8">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="section-label !bg-transparent !p-0">Current Password</label>
                      <input type="password" placeholder="••••••••" className="input-editorial" />
                    </div>
                    <div className="space-y-2">
                      <label className="section-label !bg-transparent !p-0">New Password</label>
                      <input type="password" placeholder="New password" className="input-editorial" />
                    </div>
                    <div className="space-y-2">
                      <label className="section-label !bg-transparent !p-0">Confirm New Password</label>
                      <input type="password" placeholder="Confirm password" className="input-editorial" />
                    </div>
                  </div>
                  <div className="pt-6 border-t border-mi-border flex justify-end">
                    <button className="btn-primary min-w-[140px] justify-center" onClick={() => toast.success("Password updated")}>
                      Update Password
                    </button>
                  </div>
                  
                  <div className="pt-8 border-t border-red-900/30">
                    <h4 className="font-heading text-lg text-red-400 mb-2">Danger Zone</h4>
                    <p className="font-body text-xs text-mi-text-muted mb-4">Permanently delete your account and all associated data.</p>
                    <button
                      onClick={handleDeleteAccount}
                      disabled={deletingAccount}
                      className="flex items-center gap-2 px-6 py-2 border border-red-900/50 text-red-400 font-body text-sm rounded-xl hover:bg-red-400/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {deletingAccount ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                      {deletingAccount ? 'Deleting…' : 'Delete Account'}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
