import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  staggerContainer, fadeInUp, scaleIn,
} from '../animations/motionConfig';
import Button from '../components/ui/Button';
import CountUp from 'react-countup';

// ── Feature section data ─────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: '◎',
    title: 'Competency Gap Analysis',
    desc: 'AI maps your current competency profile against role requirements — identifying precise gaps across 8 domain areas of the iGOT framework.',
  },
  {
    icon: '◈',
    title: 'Personalised Learning Paths',
    desc: 'Every course recommendation is explained: you know exactly why it was suggested and what gap it addresses.',
  },
  {
    icon: '⊞',
    title: 'AI Quiz Generator',
    desc: 'Upload any learning material — the platform generates MCQs aligned to Bloom\'s taxonomy levels. Review and edit before publishing.',
  },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Complete Your Profile', desc: 'Set your role, department, and current competency self-assessment.' },
  { step: '02', title: 'AI Analyses Your Gaps', desc: 'Our model compares your profile against role benchmarks from the iGOT competency framework.' },
  { step: '03', title: 'Learn & Improve', desc: 'Follow your personalised course plan and track gap closure over time.' },
];

const STATS = [
  { value: 1200, suffix: '+', label: 'Government Officers' },
  { value: 8,    suffix: '',  label: 'Competency Domains' },
  { value: 94,   suffix: '%', label: 'Learner Satisfaction' },
  { value: 340,  suffix: '+', label: 'Courses Mapped' },
];

// ── Section wrapper with scroll-trigger ─────────────────────────────────────
function ScrollSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      variants={staggerContainer}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface-light dark:bg-surface-dark overflow-x-hidden">
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section
        className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 bg-hero-gradient overflow-hidden"
        aria-label="Hero section"
      >
        {/* Grid background */}
        <div
          className="absolute inset-0 bg-grid-pattern bg-grid-md opacity-30 pointer-events-none"
          aria-hidden="true"
        />
        {/* Radial glow */}
        <div className="absolute inset-0 radial-glow pointer-events-none" aria-hidden="true" />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="relative z-10 max-w-4xl mx-auto"
        >
          {/* Kicker */}
          <motion.div variants={fadeInUp} className="mb-6">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-accent-300 text-body-sm font-medium">
              <span aria-hidden="true">✦</span>
              iGOT Karmayogi Platform · Powered by AI
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeInUp}
            className="text-display-1 font-bold text-white mb-6 leading-tight"
          >
            Close Your{' '}
            <span className="text-gradient">Competency Gaps.</span>
            <br />
            Accelerate Your Growth.
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="text-body-lg text-slate-300 max-w-2xl mx-auto mb-10"
          >
            An AI-powered platform that identifies your skill gaps against iGOT role requirements
            and delivers a personalised learning roadmap — precisely targeted to your next level.
          </motion.p>

          <motion.div variants={fadeInUp} className="flex flex-wrap gap-4 justify-center">
            <Link to="/dashboard">
              <Button variant="secondary" size="lg">
                View Dashboard
              </Button>
            </Link>
            <Link to="/gap-analysis">
              <Button
                size="lg"
                className="bg-white/10 hover:bg-white/20 text-white border border-white/30 hover:border-white/50"
              >
                See Gap Analysis
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll cue */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-slate-500"
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.6, repeat: Infinity }}
          aria-hidden="true"
        >
          ↓
        </motion.div>
      </section>

      {/* ── Stats bar ──────────────────────────────────────────────────────── */}
      <section className="bg-primary-600 py-10" aria-label="Platform statistics">
        <ScrollSection className="page-container grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {STATS.map((stat, i) => {
            const ref    = useRef(null);
            const inView = useInView(ref, { once: true });
            return (
              <motion.div key={i} variants={fadeInUp} ref={ref}>
                <div className="text-display-2 font-bold text-white">
                  {inView ? <CountUp end={stat.value} suffix={stat.suffix} duration={1.5} /> : '0'}
                </div>
                <p className="text-primary-200 text-body-sm mt-1">{stat.label}</p>
              </motion.div>
            );
          })}
        </ScrollSection>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section className="section-pad page-container" aria-labelledby="features-heading">
        <ScrollSection>
          <motion.div variants={fadeInUp} className="text-center mb-12">
            <h2 id="features-heading" className="text-display-2 font-bold text-slate-800 dark:text-slate-100 mb-4">
              Everything you need to grow
            </h2>
            <p className="text-body-lg text-slate-500 max-w-xl mx-auto">
              Built for Government of India civil servants. Aligned to the iGOT Karmayogi framework.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <motion.div
                key={i}
                variants={scaleIn}
                className="bg-white dark:bg-surface-dark-card rounded-2xl p-7 shadow-card-sm border border-surface-border dark:border-surface-dark-border hover:shadow-card-lg transition-shadow duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-900/40 flex items-center justify-center text-2xl text-primary-600 dark:text-primary-300 mb-5 group-hover:scale-110 transition-transform duration-200">
                  {f.icon}
                </div>
                <h3 className="text-heading-2 text-slate-800 dark:text-slate-100 mb-3">{f.title}</h3>
                <p className="text-body text-slate-600 dark:text-slate-400">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </ScrollSection>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section className="section-pad bg-slate-50 dark:bg-slate-900" aria-labelledby="how-heading">
        <ScrollSection className="page-container">
          <motion.div variants={fadeInUp} className="text-center mb-12">
            <h2 id="how-heading" className="text-display-2 font-bold text-slate-800 dark:text-slate-100 mb-4">
              How it works
            </h2>
          </motion.div>

          <div className="relative grid md:grid-cols-3 gap-8">
            {/* Connecting line (desktop only) */}
            <div className="hidden md:block absolute top-9 left-[16.67%] right-[16.67%] h-0.5 bg-primary-100 dark:bg-primary-900" aria-hidden="true" />

            {HOW_IT_WORKS.map((step, i) => (
              <motion.div key={i} variants={fadeInUp} className="relative text-center">
                <div className="w-16 h-16 rounded-full bg-primary-600 text-white font-bold text-heading-3 flex items-center justify-center mx-auto mb-4 shadow-card-md relative z-10">
                  {step.step}
                </div>
                <h3 className="text-heading-3 text-slate-800 dark:text-slate-100 mb-2">{step.title}</h3>
                <p className="text-body text-slate-500 dark:text-slate-400">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </ScrollSection>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="section-pad page-container text-center" aria-label="Call to action">
        <ScrollSection>
          <motion.div
            variants={scaleIn}
            className="bg-hero-gradient rounded-3xl px-8 py-16 text-white"
          >
            <h2 className="text-display-2 font-bold mb-4">Ready to close your gaps?</h2>
            <p className="text-body-lg text-slate-300 max-w-lg mx-auto mb-8">
              Join thousands of government officers already accelerating their growth with personalised AI-driven learning.
            </p>
            <Link to="/dashboard">
              <Button variant="secondary" size="lg">
                Get Started →
              </Button>
            </Link>
          </motion.div>
        </ScrollSection>
      </section>

      {/* Footer */}
      <footer className="border-t border-surface-border dark:border-surface-dark-border py-8 text-center text-caption text-slate-400">
        <p>iGOT Karmayogi AI Platform · Government of India · Ministry of Personnel</p>
      </footer>
    </div>
  );
}
