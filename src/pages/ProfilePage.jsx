import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Github, Twitter, ArrowLeft, Lightbulb, Flame, Calendar, ExternalLink, Eye, DollarSign, Hammer, Wrench } from 'lucide-react';
import { authFetch } from '../lib/api';
import { ProfileSkeleton } from '../components/SkeletonLoaders';

const REACTION_LABELS = {
  brilliant: { icon: Lightbulb, label: 'Brilliant', color: 'text-yellow-400' },
  interested: { icon: Eye, label: 'Interested', color: 'text-blue-400' },
  sellable: { icon: DollarSign, label: 'Sellable', color: 'text-green-400' },
  build_worthy: { icon: Hammer, label: 'Build-worthy', color: 'text-orange-400' },
  needs_work: { icon: Wrench, label: 'Needs Work', color: 'text-mi-text-muted' },
};

export default function ProfilePage() {
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await authFetch(`/api/profile/${userId}`);
        if (res.ok) setProfile(await res.json());
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchProfile();
  }, [userId]);

  if (loading) {
    return (
      <div className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-6 lg:px-10">
          <ProfileSkeleton />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="pt-32 text-center">
        <p className="font-heading text-2xl text-mi-text-muted">USER NOT FOUND</p>
        <Link to="/community" className="btn-primary mt-6 inline-flex"><ArrowLeft size={16} /> Back to Community</Link>
      </div>
    );
  }

  const totalReactionCount = profile.total_reactions
    ? Object.values(profile.total_reactions).reduce((a, b) => a + b, 0) : 0;

  const memberSince = new Date(profile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-6 lg:px-10">
        <Link to="/community" className="flex items-center gap-2 text-mi-text-muted font-body text-sm hover:text-white transition-colors mb-8">
          <ArrowLeft size={16} /> Back to Community
        </Link>

        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-mi-surface border border-mi-border rounded-2xl p-8 mb-8 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-mi-accent/5 to-transparent pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-mi-accent/60 to-orange-600/60 flex items-center justify-center shrink-0 overflow-hidden">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.name} className="w-full h-full object-cover" />
              ) : (
                <span className="font-heading text-3xl text-white">{(profile.name || '?')[0].toUpperCase()}</span>
              )}
            </div>

            <div className="flex-1">
              <h1 className="font-heading text-3xl tracking-wide text-white">{profile.name}</h1>
              {profile.bio && <p className="font-body text-sm text-mi-text-secondary mt-2 max-w-lg">{profile.bio}</p>}
              <div className="flex flex-wrap items-center gap-4 mt-3">
                <span className="flex items-center gap-1.5 text-xs text-mi-text-muted font-body">
                  <Calendar size={13} /> Member since {memberSince}
                </span>
                <span className="flex items-center gap-1.5 text-xs text-mi-text-muted font-body">
                  <Lightbulb size={13} /> {profile.published_count} ideas published
                </span>
                {totalReactionCount > 0 && (
                  <span className="flex items-center gap-1.5 text-xs text-yellow-400 font-body">
                    <Flame size={13} /> {totalReactionCount} reactions received
                  </span>
                )}
              </div>
              {/* Social links */}
              <div className="flex items-center gap-3 mt-4">
                {profile.github_url && (
                  <a href={profile.github_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-mi-border text-mi-text-secondary text-xs font-body hover:text-white hover:border-mi-border-light transition-all">
                    <Github size={14} /> GitHub
                  </a>
                )}
                {profile.twitter_url && (
                  <a href={profile.twitter_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-mi-border text-mi-text-secondary text-xs font-body hover:text-white hover:border-mi-border-light transition-all">
                    <Twitter size={14} /> Twitter
                  </a>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Skills */}
        {profile.skills?.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
            <h2 className="font-heading text-lg tracking-wide text-white mb-3">SKILLS</h2>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill, i) => (
                <span key={i} className="px-3 py-1.5 bg-mi-accent/10 border border-mi-accent/20 text-mi-accent text-xs font-body rounded-lg">{skill}</span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Reaction Stats */}
        {totalReactionCount > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mb-8">
            <h2 className="font-heading text-lg tracking-wide text-white mb-3">REACTION STATS</h2>
            <div className="grid grid-cols-5 gap-3">
              {Object.entries(REACTION_LABELS).map(([key, { icon: Icon, label, color }]) => (
                <div key={key} className="bg-mi-surface border border-mi-border rounded-xl p-4 text-center">
                  <div className="flex justify-center mb-1"><Icon size={22} className={color} /></div>
                  <div className="font-heading text-xl text-white">{profile.total_reactions?.[key] || 0}</div>
                  <div className="font-body text-xs text-mi-text-muted mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Published Ideas */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h2 className="font-heading text-lg tracking-wide text-white mb-4">PUBLISHED IDEAS</h2>
          {profile.ideas?.length === 0 ? (
            <p className="text-center py-12 text-mi-text-muted font-body text-sm">No published ideas yet.</p>
          ) : (
            <div className="space-y-3">
              {profile.ideas?.map((idea) => {
                const techArray = Array.isArray(idea.tech_stack) ? idea.tech_stack : [];
                return (
                  <div key={idea.id} className="bg-mi-surface border border-mi-border rounded-2xl p-5 hover:border-mi-border-light transition-all">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className={`px-2 py-0.5 rounded-md text-xs font-body font-medium ${idea.input_type === 'tool' ? 'bg-blue-500/10 text-blue-400' : 'bg-mi-accent/10 text-mi-accent'}`}>
                            {idea.input_type}
                          </span>
                          {idea.idea_score > 0 && (
                            <span className="flex items-center gap-1 text-xs text-yellow-400 font-body"><Flame size={11} />{idea.idea_score}</span>
                          )}
                          {idea.updates_count > 0 && (
                            <span className="text-xs text-mi-text-muted font-body">· {idea.updates_count} updates</span>
                          )}
                        </div>
                        <h3 className="font-heading text-lg tracking-wide text-white">{idea.raw_input}</h3>
                        {idea.summary && <p className="font-body text-xs text-mi-text-muted mt-1 line-clamp-2">{idea.summary}</p>}
                        {idea.latest_update?.content && (
                          <div className="mt-2 rounded-lg border border-mi-border/60 bg-mi-bg/40 p-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] uppercase tracking-wide text-mi-accent font-body">{idea.latest_update.update_type}</span>
                              <span className="text-[10px] text-mi-text-muted font-body">
                                {new Date(idea.latest_update.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-xs text-mi-text-secondary mt-1 line-clamp-2">
                              {idea.latest_update.content}
                            </p>
                          </div>
                        )}
                        {techArray.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {techArray.slice(0, 4).map((t, i) => (
                              <span key={i} className="px-2 py-0.5 bg-white/5 text-mi-text-muted text-xs rounded-md font-body">{t}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      {idea.image_url && (
                        <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-mi-border">
                          <img src={idea.image_url} alt="" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
