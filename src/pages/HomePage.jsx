import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  ArrowUpRight, Sparkles, Lightbulb, Users, Zap, Brain,
  MessageSquare, GitBranch, TrendingUp, ChevronRight
} from 'lucide-react';

/* ─── Marquee Band ─── */
function MarqueeBand() {
  const items = [
    'AI-Powered Research', 'Mermaid Diagrams', 'Tech Stack Analysis',
    'Community Collaboration', 'Idea Incubation', 'n8n Workflows',
    'Real-time Chat', 'Vector Search', 'Smart Catalogs', 'Build Together'
  ];
  const doubled = [...items, ...items];
  return (
    <div className="relative overflow-hidden py-4 bg-mi-accent">
      <div className="flex animate-marquee whitespace-nowrap">
        {doubled.map((item, i) => (
          <span key={i} className="mx-8 font-heading text-xl tracking-wider text-white/90 flex items-center gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-white/60" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── Feature card ─── */
function FeatureCard({ icon: Icon, title, desc, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative p-8 rounded-2xl border border-mi-border bg-mi-surface hover:border-mi-accent/40 transition-all duration-500"
    >
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-mi-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative z-10">
        <div className="w-12 h-12 rounded-xl bg-mi-accent/10 flex items-center justify-center mb-5 group-hover:bg-mi-accent/20 transition-colors duration-300">
          <Icon size={22} className="text-mi-accent" />
        </div>
        <h3 className="font-heading text-2xl tracking-wide text-white mb-3">{title}</h3>
        <p className="font-body text-mi-text-secondary text-sm leading-relaxed">{desc}</p>
      </div>
    </motion.div>
  );
}

/* ─── Stats counter ─── */
function StatCounter({ value, label }) {
  return (
    <div className="text-center">
      <div className="font-heading text-[clamp(2.5rem,5vw,4rem)] leading-none text-white">{value}</div>
      <div className="font-body text-sm text-mi-text-muted mt-1 tracking-wide">{label}</div>
    </div>
  );
}

/* ─── Home Page ─── */
export default function HomePage() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start']
  });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.8], [1, 1.05]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 100]);

  const [stats, setStats] = useState({ total_users: 0, total_ideas: 0, recent: [] });

  useEffect(() => {
    const base = (import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/$/, '') || 'http://localhost:5000';
    fetch(`${base}/api/stats`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setStats(d); })
      .catch(() => {});
  }, []);

  const features = [
    { icon: Lightbulb, title: 'IDEA INGESTION', desc: 'Drop any raw idea, tool name, or concept. Our AI pipeline researches, expands, and structures it into actionable intelligence.' },
    { icon: Brain, title: 'AI RESEARCH ENGINE', desc: 'Powered by n8n workflows and LLMs. Generates summaries, tech stacks, pros/cons, architecture diagrams, and concept imagery.' },
    { icon: GitBranch, title: 'SYSTEM DIAGRAMS', desc: 'Auto-generated Mermaid.js flowcharts mapping out architectures and workflows for every idea in your catalog.' },
    { icon: Users, title: 'COMMUNITY HUB', desc: 'Publish ideas to the community. Comment, collaborate, and find co-builders for projects you believe in.' },
    { icon: MessageSquare, title: 'SMART CHAT', desc: 'Chat with your catalog entries. Ask questions, request modifications, and have the AI propose changes you can accept or reject.' },
    { icon: TrendingUp, title: 'VECTOR SEARCH', desc: 'Semantic search across your entire catalog. Find related ideas and discover connections you didn\'t know existed.' },
  ];

  return (
    <div className="overflow-hidden relative" style={{ position: 'relative' }}>
      {/* ═══════════════════════════════════════════
          HERO SECTION
          ═══════════════════════════════════════════ */}
      <section ref={heroRef} className="relative min-h-screen flex items-end overflow-hidden" style={{ position: 'relative' }}>
        {/* Background video */}
        <motion.div
          style={{ scale: heroScale }}
          className="absolute inset-0 z-0"
        >
          <img
            src="/hero-bg.png"
            alt="Hero Background"
            className="absolute inset-0 w-full h-full object-cover"
          />
          
          {/* Subtle gradient to ensure text readability on the left */}
          <div className="absolute inset-0 bg-gradient-to-r from-mi-bg via-mi-bg/60 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,rgba(255,77,0,0.05),transparent)]" />

          {/* Decorative grid */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,77,0,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,77,0,0.4) 1px, transparent 1px)',
              backgroundSize: '80px 80px'
            }}
          />
        </motion.div>

        {/* Gradient overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-[30%] bg-gradient-to-t from-mi-bg to-transparent z-[1]" />

        {/* Hero Content */}
        <motion.div
          style={{ opacity: heroOpacity }}
          className="relative z-10 w-full max-w-[1400px] mx-auto px-6 lg:px-10 min-h-screen flex items-center"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full pt-16">
            {/* Left side: branding and description */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-3 mb-6"
              >
                <span className="w-2 h-2 rounded-full bg-mi-accent animate-pulse" />
                <span className="font-heading text-sm tracking-[0.2em] text-mi-accent uppercase">AI-Powered Incubator</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="font-editorial text-[clamp(4.5rem,8vw,7.5rem)] leading-[0.9] tracking-tight text-white mb-6"
              >
                <span className="italic">mind</span>
                <span className="text-mi-accent font-heading not-italic tracking-wide">INSPO.</span>
              </motion.h1>
              
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="font-heading text-2xl md:text-3xl text-white/90 tracking-wide mt-2 mb-8 max-w-lg leading-snug"
              >
                / TRANSFORM RAW IDEAS INTO STRUCTURED <span className="text-mi-accent">INTELLIGENCE.</span>
              </motion.h2>

              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="font-body text-white/70 text-lg md:text-xl leading-relaxed mb-10 max-w-lg"
              >
                Drop any concept, tool, or fleeting thought. Our AI pipeline researches, structures,
                and visualizes it — turning sparks into blueprints.
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-wrap gap-4 items-center"
              >
                <Link to="/login?mode=register" className="btn-primary py-3.5 px-8 text-base shadow-lg shadow-mi-accent/20">
                  Start Building
                  <ArrowUpRight size={18} />
                </Link>
                <Link to="/community" className="btn-secondary py-3.5 px-8 text-base">
                  Explore
                </Link>
              </motion.div>

              {/* Social proof */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-16 flex items-center gap-4"
              >
                <div className="flex -space-x-3">
                  {[
                    'bg-gradient-to-br from-orange-400 to-red-500',
                    'bg-gradient-to-br from-blue-400 to-purple-500',
                    'bg-gradient-to-br from-green-400 to-teal-500',
                    'bg-gradient-to-br from-yellow-400 to-orange-500',
                  ].map((bg, i) => (
                    <div key={i} className={`w-10 h-10 rounded-full ${bg} border-2 border-mi-bg shadow-sm`} />
                  ))}
                </div>
                <p className="font-body text-sm text-white/50">
                  <span className="text-white font-medium">{stats.total_users > 0 ? stats.total_users : 'builders'}</span> already incubating
                </p>
              </motion.div>
            </div>

            {/* Right side: Empty space to let the planet image show through */}
            <div className="hidden lg:block pointer-events-none">
            </div>
          </div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════
          MARQUEE BAND
          ═══════════════════════════════════════════ */}
      <MarqueeBand />

      {/* ═══════════════════════════════════════════
          WHAT WE DO — Editorial split section
          ═══════════════════════════════════════════ */}
      <section className="relative py-32 bg-mi-cream text-[#1a1a1a]">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
            {/* Left — editorial text */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="section-label mb-6 before:!bg-mi-accent"
              >
                <span className="text-[#666]">How it works</span>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="font-editorial text-[clamp(2.5rem,5vw,4.5rem)] leading-[1] text-[#1a1a1a] mb-8"
              >
                dive into the <span className="text-mi-accent italic">/</span> future with past ideas —
              </motion.h2>

              <div className="space-y-4 font-body text-[#555] text-base leading-relaxed max-w-lg">
                <p>
                  MindInspo isn't just another note-taking app. It's an <strong className="text-[#1a1a1a]">AI-powered research engine</strong> that
                  takes your raw, unstructured thoughts and transforms them into comprehensive technical catalogs.
                </p>
                <p>
                  Every idea gets a full breakdown: recommended tech stack, pros & cons analysis,
                  competitive landscape, architecture diagrams, and even a generated concept image.
                </p>
              </div>

              {/* Process steps */}
              <div className="mt-12 space-y-0 border-l-2 border-mi-accent/30 ml-1">
                {[
                  { step: '/01', title: 'Drop Your Idea', text: 'Type any raw concept, tool, or thought' },
                  { step: '/02', title: 'AI Researches', text: 'n8n + LLMs analyze and structure your input' },
                  { step: '/03', title: 'Get Your Catalog', text: 'Tech stack, diagrams, analysis — all automated' },
                  { step: '/04', title: 'Share & Collaborate', text: 'Publish to community, find co-builders' },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="pl-6 py-4 group"
                  >
                    <span className="font-heading text-mi-accent text-sm tracking-wider">{item.step}</span>
                    <h3 className="font-heading text-xl tracking-wide text-[#1a1a1a] mt-1">{item.title}</h3>
                    <p className="font-body text-sm text-[#777] mt-0.5">{item.text}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Right — image/card showcase */}
            <div className="relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="relative"
              >
                {/* Card mockup */}
                <div className="bg-[#1a1a1e] rounded-2xl overflow-hidden shadow-2xl">
                  <div className="p-6 border-b border-white/10">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="px-3 py-1 bg-mi-accent/20 text-mi-accent text-xs font-body font-semibold rounded-full">IDEA • COMPLETED</span>
                        <h4 className="font-heading text-2xl tracking-wide text-white mt-3">AI-POWERED CODE REVIEW</h4>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <p className="text-white/70 font-body text-sm leading-relaxed">
                      An automated code review tool that uses LLMs to analyze pull requests, detect bugs,
                      suggest improvements, and enforce team coding standards in real-time.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {['Python', 'GPT-4', 'GitHub API', 'AST Parser', 'Docker'].map(tech => (
                        <span key={tech} className="px-3 py-1 bg-white/5 border border-white/10 text-white/60 text-xs font-body rounded-lg">
                          {tech}
                        </span>
                      ))}
                    </div>
                    {/* Mini mermaid mockup */}
                    <div className="bg-black/40 rounded-xl p-4 border border-white/5">
                      <div className="flex items-center gap-2 mb-3">
                        <GitBranch size={14} className="text-mi-accent" />
                        <span className="text-xs text-white/40 font-body">Architecture Diagram</span>
                      </div>
                      <div className="space-y-2">
                        {['PR Submitted → Webhook Trigger', 'Code Parse → AST Analysis', 'LLM Review → Report Generation', 'Slack Notification → Dashboard Update'].map((line, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <div className="w-1 h-1 rounded-full bg-mi-accent/60" />
                            <span className="text-xs text-white/50 font-body">{line}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating tag */}
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -top-4 -right-4 bg-mi-accent text-white px-4 py-2 rounded-full font-heading text-sm tracking-wider shadow-lg"
                >
                  AI GENERATED
                </motion.div>
              </motion.div>

              {/* Price-like tag from reference */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="mt-8 flex justify-end"
              >
                <div className="text-right">
                  <span className="font-heading text-5xl text-[#1a1a1a]">FREE</span>
                  <p className="font-body text-sm text-[#999] mt-1">Open-source & AI-powered</p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FEATURES GRID — Dark section
          ═══════════════════════════════════════════ */}
      <section className="relative py-32 bg-mi-bg noise-overlay">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 relative z-10">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-16">
            <div>
              <div className="section-label mb-4">Platform Features</div>
              <h2 className="font-heading text-[clamp(2.5rem,5vw,4.5rem)] leading-[0.95] tracking-wide text-white">
                FEATURED <span className="text-mi-accent">/</span>
                <br />
                CAPABILITIES.
              </h2>
            </div>
            <div className="font-heading text-[clamp(3rem,6vw,5rem)] text-mi-text-muted/20 leading-none">
              ({String(features.length).padStart(2, '0')}+)
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, i) => (
              <FeatureCard key={i} {...feature} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          STATS BAR
          ═══════════════════════════════════════════ */}
      <section className="py-16 border-y border-mi-border">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatCounter value={stats.total_users > 0 ? `${stats.total_users}+` : '∞'} label="Active Builders" />
            <StatCounter value={stats.total_ideas > 0 ? `${stats.total_ideas}+` : '6+'} label="Ideas Incubated" />
            <StatCounter value="<30s" label="Processing Time" />
            <StatCounter value="100%" label="Open Source" />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          LATEST / CTA SECTION
          ═══════════════════════════════════════════ */}
      <section className="relative py-32 bg-mi-bg">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="section-label mb-4">Get Started Today</div>
              <h2 className="font-heading text-[clamp(2.5rem,5vw,4rem)] leading-[0.95] tracking-wide text-white mb-6">
                / LATEST
                <br />
                <span className="text-mi-text-muted">IDEAS.</span>
              </h2>
              <p className="font-body text-mi-text-secondary text-base leading-relaxed max-w-md mb-8">
                Join the community of builders, thinkers, and creators. Share your ideas,
                get AI-powered analysis, and find collaborators to bring them to life.
              </p>
              <Link to="/community" className="btn-primary">
                Browse Community
                <ArrowUpRight size={16} />
              </Link>
            </div>

            {/* Stacked cards preview */}
            <div className="relative">
              {(stats.recent.length > 0
                ? stats.recent
                : [
                    { raw_input: 'Smart Home Automation', tags: ['IoT'], summary: 'AI-analyzed • community idea' },
                    { raw_input: 'Decentralized Voting', tags: ['Web3'], summary: 'AI-analyzed • community idea' },
                    { raw_input: 'AI Content Pipeline', tags: ['AI/ML'], summary: 'AI-analyzed • community idea' },
                  ]
              ).map((card, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20, rotate: 0 }}
                  whileInView={{ opacity: 1, y: 0, rotate: i === 0 ? -2 : i === 2 ? 2 : 0 }}
                  whileHover={{ y: -15, rotate: 0, scale: 1.02, zIndex: 40 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15, duration: 0.3, ease: 'easeOut' }}
                  className={`${i > 0 ? '-mt-16' : ''} relative bg-mi-surface border border-mi-border rounded-2xl p-4 sm:p-6 shadow-editorial cursor-pointer hover:border-mi-accent/40 group transition-colors duration-300`}
                  style={{ zIndex: 30 - i * 10 }}
                >
                  <Link to="/community" className="absolute inset-0 z-20 rounded-2xl" />
                  <div className="relative z-10 flex items-center justify-between pointer-events-none">
                    <div>
                      {(card.tags || []).slice(0, 1).map(tag => (
                        <span key={tag} className="px-2 py-0.5 bg-mi-accent/20 text-mi-accent text-xs font-body font-semibold rounded-md">{tag}</span>
                      ))}
                      <h4 className="font-heading text-xl tracking-wide text-white mt-2 group-hover:text-mi-accent transition-colors duration-300 line-clamp-1">
                        {card.raw_input}
                      </h4>
                      <p className="font-body text-xs text-mi-text-muted mt-1 line-clamp-2">{card.summary || 'AI-analyzed • community idea'}</p>
                    </div>
                    <ChevronRight size={20} className="text-mi-text-muted group-hover:text-mi-accent group-hover:translate-x-1 transition-all duration-300 shrink-0 ml-3" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
