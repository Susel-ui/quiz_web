/**
 * IntroAnimation.tsx — GSAP-driven splash sequence.
 *
 * Sequence (2s total):
 *   0.0–0.4s : 8 competency domain nodes fade + scale in (staggered)
 *   0.4–1.0s : SVG edge paths draw via stroke-dashoffset
 *   1.0–1.4s : nodes converge toward center + pulse
 *   1.4–1.8s : wordmark reveals via clip-path
 *   1.8–2.0s : whole overlay fades out → landing page crossfades in
 *
 * Skip logic:
 *   - sessionStorage flag 'igot_intro_played' → skip on same-session reload
 *   - click/tap anywhere → tl.progress(1) to jump to end
 *   - prefers-reduced-motion → bypass entirely, call onComplete immediately
 */

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { INTRO_CONFIG, EASE } from './motionConfig';

interface IntroAnimationProps {
  onComplete: () => void;
}

// Competency domain labels for node tooltips (accessibility)
const COMPETENCY_DOMAINS = [
  'Leadership', 'Policy', 'Digital', 'Ethics',
  'Communication', 'Finance', 'Analytics', 'Governance',
];

// Pre-computed node positions on a circle (r=120, centred at 200,200)
const NODE_POSITIONS = Array.from({ length: INTRO_CONFIG.nodeCount }, (_, i) => {
  const angle = (i / INTRO_CONFIG.nodeCount) * Math.PI * 2 - Math.PI / 2;
  return {
    x: 200 + 120 * Math.cos(angle),
    y: 200 + 120 * Math.sin(angle),
    label: COMPETENCY_DOMAINS[i],
  };
});

// Edge pairs — connects each node to its two nearest neighbours
const EDGES: [number, number][] = NODE_POSITIONS.flatMap((_, i) => [
  [i, (i + 1) % INTRO_CONFIG.nodeCount] as [number, number],
  [i, (i + 3) % INTRO_CONFIG.nodeCount] as [number, number], // cross-connect for richer graph look
]).filter(([a, b]) => a < b);

function IntroAnimation({ onComplete }: IntroAnimationProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const tlRef      = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    // ── Reduced motion: skip entirely ────────────────────────────────────────
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      onComplete();
      return;
    }

    // ── Session flag: skip if already played this session ────────────────────
    if (sessionStorage.getItem('igot_intro_played')) {
      onComplete();
      return;
    }

    const overlay = overlayRef.current;
    if (!overlay) return;

    const nodes  = overlay.querySelectorAll<SVGCircleElement>('.intro-node');
    const edges  = overlay.querySelectorAll<SVGPathElement>('.intro-edge');
    const wordmark = overlay.querySelector<HTMLDivElement>('.intro-wordmark');
    const tagline  = overlay.querySelector<HTMLDivElement>('.intro-tagline');

    // Initialise hidden states
    gsap.set(nodes,    { opacity: 0, scale: 0, transformOrigin: 'center center' });
    gsap.set(edges,    { strokeDashoffset: 300, opacity: 0 });
    gsap.set(wordmark, { opacity: 0, clipPath: 'inset(0 100% 0 0)' });
    gsap.set(tagline,  { opacity: 0, y: 10 });

    const tl = gsap.timeline({
      onComplete: () => {
        sessionStorage.setItem('igot_intro_played', '1');
        onComplete();
      },
    });
    tlRef.current = tl;

    // Phase 1: nodes appear (staggered)
    tl.to(nodes, {
      opacity: 1, scale: 1,
      duration: 0.35,
      stagger:  0.05,
      ease:     EASE.gsap.bounce,
    }, 0);

    // Phase 2: edges draw
    tl.to(edges, {
      strokeDashoffset: 0, opacity: 0.6,
      duration: 0.55,
      stagger:  0.04,
      ease:     EASE.gsap.out,
    }, 0.35);

    // Phase 3: nodes converge to centre — scale down slightly, move inward 30%
    tl.to(nodes, {
      x: (i) => (200 - NODE_POSITIONS[i].x) * 0.3,
      y: (i) => (200 - NODE_POSITIONS[i].y) * 0.3,
      duration: 0.4,
      ease:     EASE.gsap.inOut,
    }, 1.0);

    // Phase 4: wordmark clip-path reveal
    tl.to(wordmark, {
      opacity: 1,
      clipPath: 'inset(0 0% 0 0)',
      duration: 0.4,
      ease:     EASE.gsap.out,
    }, 1.3);

    tl.to(tagline, {
      opacity: 1, y: 0,
      duration: 0.3,
      ease:     EASE.gsap.out,
    }, 1.55);

    // Phase 5: fade out overlay
    tl.to(overlay, {
      opacity: 0,
      duration: 0.35,
      ease:     'power1.inOut',
    }, 1.8);

    // Click/tap to skip
    const skip = () => { tl.progress(1); };
    overlay.addEventListener('click', skip);

    return () => {
      overlay.removeEventListener('click', skip);
      tl.kill();
    };
  }, [onComplete]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-hero-gradient cursor-pointer select-none"
      role="status"
      aria-label="Application loading — click to skip"
    >
      {/* Network graph SVG */}
      <svg
        width="400" height="400"
        viewBox="0 0 400 400"
        className="absolute opacity-80"
        aria-hidden="true"
      >
        {/* Edges */}
        {EDGES.map(([a, b], i) => {
          const pa = NODE_POSITIONS[a];
          const pb = NODE_POSITIONS[b];
          const len = Math.hypot(pb.x - pa.x, pb.y - pa.y);
          return (
            <path
              key={i}
              className="intro-edge"
              d={`M ${pa.x} ${pa.y} L ${pb.x} ${pb.y}`}
              stroke={INTRO_CONFIG.edgeColor}
              strokeWidth="1.5"
              fill="none"
              strokeDasharray={len}
              strokeDashoffset={len}
            />
          );
        })}

        {/* Nodes */}
        {NODE_POSITIONS.map((pos, i) => (
          <g key={i} className="intro-node">
            <circle
              cx={pos.x} cy={pos.y} r="10"
              fill={INTRO_CONFIG.nodeColor}
              stroke={INTRO_CONFIG.edgeColor}
              strokeWidth="2"
            />
            <circle
              cx={pos.x} cy={pos.y} r="4"
              fill={INTRO_CONFIG.edgeColor}
            />
            <title>{pos.label}</title>
          </g>
        ))}

        {/* Centre node */}
        <circle cx="200" cy="200" r="14" fill={INTRO_CONFIG.nodeColor} stroke={INTRO_CONFIG.edgeColor} strokeWidth="2.5" />
        <circle cx="200" cy="200" r="6"  fill={INTRO_CONFIG.edgeColor} />
      </svg>

      {/* Wordmark */}
      <div className="relative z-10 text-center mt-56 pointer-events-none">
        <div
          className="intro-wordmark text-white font-bold tracking-tight"
          style={{ fontSize: '2.25rem', lineHeight: 1.15 }}
        >
          <span className="text-gradient">iGOT</span> Karmayogi
        </div>
        <div
          className="intro-tagline text-slate-400 text-body-sm mt-2 tracking-wide"
        >
          AI-Powered Competency Intelligence
        </div>
      </div>

      {/* Skip hint */}
      <p className="absolute bottom-8 text-slate-500 text-caption animate-pulse-soft">
        Click anywhere to skip
      </p>
    </div>
  );
}

export default IntroAnimation;
