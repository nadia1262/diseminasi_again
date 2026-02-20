/**
 * Journey.jsx — THE IMMERSIVE JOURNEY (Story 1) — ENHANCED
 * Misi R3P 2026: Sebuah Perjalanan
 * 7-View Interactive Experience | Framer Motion | BPS Design System
 * 
 * ENHANCEMENTS:
 * - View 1: Dynamic SVG path that draws as user scrolls + interactive tooltip dots
 * - View 2: Section pinning + throwable/draggable photos with physics
 * - View 3: Parallax masking + text scramble animation
 * - View 4: Full Sumatra SVG map, animated flight paths, clickable province zoom
 * - View 5: Draggable flat-lay gear items with physics + dragConstraints
 * - View 6: 3-layer deep parallax (bg/mid/fg)
 * - Custom cursor (navy circle, morphs on hover/drag)
 * - Spring physics: stiffness 100, damping 30
 * - Fully responsive
 */

import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  useInView,
  AnimatePresence,
  useDragControls,
  useAnimationFrame,
} from "framer-motion";
import "./Journey.css";

// ─── SPRING PHYSICS PRESETS ───────────────────────────────────────────────────
const SPRING_SOFT   = { type: "spring", stiffness: 100, damping: 30 };
const SPRING_MEDIUM = { type: "spring", stiffness: 160, damping: 22 };
const SPRING_SNAPPY = { type: "spring", stiffness: 280, damping: 28 };
const EASE_OUT      = [0.22, 1, 0.36, 1];

// ─── ANIMATION VARIANTS ───────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 48 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.13, duration: 0.75, ease: EASE_OUT },
  }),
};
const fadeIn = {
  hidden: { opacity: 0 },
  visible: (i = 0) => ({
    opacity: 1,
    transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" },
  }),
};

// ─── CUSTOM CURSOR ────────────────────────────────────────────────────────────
function CustomCursor() {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const [cursorState, setCursorState] = useState("default");

  useEffect(() => {
    const move = (e) => {
      cursorX.set(e.clientX - 12);
      cursorY.set(e.clientY - 12);
    };
    window.addEventListener("mousemove", move);

    const handleEnterDrag = () => setCursorState("drag");
    const handleEnterHover = () => setCursorState("hover");
    const handleLeave = () => setCursorState("default");

    const attachListeners = () => {
      document.querySelectorAll("[data-cursor='drag']").forEach(el => {
        el.addEventListener("mouseenter", handleEnterDrag);
        el.addEventListener("mouseleave", handleLeave);
      });
      document.querySelectorAll("[data-cursor='hover']").forEach(el => {
        el.addEventListener("mouseenter", handleEnterHover);
        el.addEventListener("mouseleave", handleLeave);
      });
    };

    attachListeners();
    const obs = new MutationObserver(attachListeners);
    obs.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener("mousemove", move);
      obs.disconnect();
    };
  }, [cursorX, cursorY]);

  const size = cursorState === "drag" ? 52 : cursorState === "hover" ? 36 : 24;
  const bg   = cursorState === "drag" ? "rgba(255,140,0,0.18)" : cursorState === "hover" ? "rgba(0,33,71,0.1)" : "transparent";
  const borderColor = cursorState === "drag" ? "#FF8C00" : "#002147";

  return (
    <motion.div
      className="custom-cursor"
      style={{ x: cursorX, y: cursorY }}
      animate={{ width: size, height: size, background: bg, borderColor }}
      transition={SPRING_SOFT}
    />
  );
}

// ─── SCROLL PROGRESS BAR ──────────────────────────────────────────────────────
function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  return <motion.div className="scroll-progress-bar" style={{ scaleX }} />;
}

// ═══════════════════════════════════════════════════════════════════════════════
// VIEW 0 — GRAND COVER (HERO INTRO)
// Full-screen hero photo + mouse-parallax title + glowing benang merah SVG
// + rotating scroll cue
// ═══════════════════════════════════════════════════════════════════════════════

/** Rotating circular text "Scroll to Explore" around a minimalist mouse icon */
function RotatingScrollCue() {
  const text = "SCROLL TO EXPLORE · SCROLL TO EXPLORE · ";
  const radius = 38;
  const circumference = 2 * Math.PI * radius;

  return (
    <motion.div
      className="scroll-cue-wrap"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 2.2, duration: 1, ease: EASE_OUT }}
    >
      {/* Rotating text ring */}
      <motion.svg
        className="scroll-cue-ring"
        viewBox="0 0 100 100"
        animate={{ rotate: 360 }}
        transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
      >
        <defs>
          <path
            id="circlePath"
            d={`M 50,50 m -${radius},0 a ${radius},${radius} 0 1,1 ${radius * 2},0 a ${radius},${radius} 0 1,1 -${radius * 2},0`}
          />
        </defs>
        <text className="scroll-cue-text" fontSize="9.2" fill="rgba(245,245,245,0.7)" letterSpacing="2.8" fontFamily="JetBrains Mono, monospace" fontWeight="700">
          <textPath href="#circlePath">{text}</textPath>
        </text>
      </motion.svg>

      {/* Minimalist mouse icon in center */}
      <div className="scroll-cue-mouse">
        <motion.div
          className="scroll-cue-wheel"
          animate={{ y: [0, 6, 0], opacity: [1, 0.3, 1] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    </motion.div>
  );
}

/** Glowing animated SVG "benang merah" thread that extends from hero to the next section */
function BenangMerah({ scrollYProgress }) {
  // Glow intensity driven by scroll
  const glowOpacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.3, 1, 1, 0.5]);
  const pathLength  = useSpring(useTransform(scrollYProgress, [0, 0.85], [0, 1]), { stiffness: 80, damping: 28 });
  const strokeColor = useTransform(scrollYProgress, [0, 0.5, 1], ["#FF8C00", "#FFD47A", "#2D5A27"]);

  return (
    <motion.div className="benang-merah-wrap" style={{ opacity: glowOpacity }}>
      <svg
        className="benang-merah-svg"
        viewBox="0 0 60 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <filter id="benangGlow" x="-80%" y="-10%" width="260%" height="120%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* Track (always visible faint line) */}
        <path
          d="M30,0 C30,25 15,35 20,50 C25,65 40,72 30,100"
          stroke="rgba(255,140,0,0.15)"
          strokeWidth="2"
          fill="none"
        />
        {/* Glowing animated fill */}
        <motion.path
          d="M30,0 C30,25 15,35 20,50 C25,65 40,72 30,100"
          stroke={strokeColor}
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          style={{ pathLength, filter: "url(#benangGlow)" }}
        />
        {/* Animated travelling dot along the path */}
        <motion.circle r="4" fill="#FF8C00" filter="url(#benangGlow)">
          <animateMotion
            dur="3s"
            repeatCount="indefinite"
            path="M30,0 C30,25 15,35 20,50 C25,65 40,72 30,100"
          />
        </motion.circle>
      </svg>
    </motion.div>
  );
}

function GrandCoverView() {
  const sectionRef = useRef(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth spring for parallax
  const smoothX = useSpring(mouseX, { stiffness: 60, damping: 20 });
  const smoothY = useSpring(mouseY, { stiffness: 60, damping: 20 });

  // Title parallax: move opposite to cursor at gentle rate
  const titleX = useTransform(smoothX, v => v * -18);
  const titleY = useTransform(smoothY, v => v * -12);

  // Sub-text moves slightly less for depth layering
  const subX = useTransform(smoothX, v => v * -8);
  const subY = useTransform(smoothY, v => v * -5);

  // Photo itself shifts slightly in cursor direction (subtle)
  const photoX = useTransform(smoothX, v => v * 10);
  const photoY = useTransform(smoothY, v => v * 7);

  // Scroll-driven effects
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const heroScale   = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const contentY    = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      // Normalize to -0.5 → +0.5
      mouseX.set((e.clientX / window.innerWidth) - 0.5);
      mouseY.set((e.clientY / window.innerHeight) - 0.5);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  // Stagger entrance for metadata chips
  const meta = [
    { n: "510", label: "Mahasiswa" },
    { n: "3",   label: "Provinsi" },
    { n: "21",  label: "Hari Lapangan" },
    { n: "57",  label: "PML" },
  ];

  return (
    <section className="view view-0" ref={sectionRef} id="cover">
      {/* ── Hero Background Photo (parallax-shifted) ── */}
      <motion.div
        className="cover-photo-layer"
        style={{ x: photoX, y: photoY, scale: heroScale }}
      >
        <img
          src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1600&h=900&fit=crop&crop=faces"
          alt="Tim mahasiswa R3P 2026"
          className="cover-photo-img"
        />
      </motion.div>

      {/* ── Gradient Overlays (navy-to-transparent) ── */}
      <div className="cover-overlay-gradient" />
      <div className="cover-overlay-vignette" />

      {/* ── Noise grain texture for film feel ── */}
      <div className="cover-grain" aria-hidden="true" />

      {/* ── Main Content (parallax on mouse) ── */}
      <motion.div className="cover-content" style={{ y: contentY, opacity: heroOpacity }}>

        {/* Badge row */}
        <motion.div
          className="cover-badge-row"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.9, ease: EASE_OUT }}
        >
          <span className="cover-badge mono">PKL POLSTAT STIS</span>
          <span className="cover-badge-sep" aria-hidden="true">·</span>
          <span className="cover-badge mono">2026</span>
        </motion.div>

        {/* Main headline — deepest parallax layer */}
        <motion.div style={{ x: titleX, y: titleY }}>
          <motion.h1
            className="cover-headline"
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85, duration: 1.1, ease: EASE_OUT }}
          >
            Misi <span className="cover-accent">R3P</span><br />
            <span className="cover-headline-sub">2026</span>
          </motion.h1>
        </motion.div>

        {/* Sub-title — medium parallax layer */}
        <motion.div style={{ x: subX, y: subY }}>
          <motion.p
            className="cover-subline"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.15, duration: 1, ease: EASE_OUT }}
          >
            Sebuah Perjalanan
          </motion.p>
          <motion.p
            className="cover-descriptor"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.9 }}
          >
            Pendataan Regsosek · Rehabilitasi · Rekonstruksi Pasca Bencana
          </motion.p>
        </motion.div>

        {/* Metadata chips */}
        <motion.div
          className="cover-meta-row"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.1, delayChildren: 1.7 } } }}
        >
          {meta.map((m, i) => (
            <motion.div
              key={i}
              className="cover-meta-chip"
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.6, ease: EASE_OUT }}
            >
              <span className="cover-meta-num mono">{m.n}</span>
              <span className="cover-meta-label">{m.label}</span>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* ── Benang Merah (glowing thread into next section) ── */}
      <BenangMerah scrollYProgress={scrollYProgress} />

      {/* ── Rotating Scroll Cue ── */}
      <RotatingScrollCue />

      {/* ── Bottom documentary caption ── */}
      <motion.div
        className="cover-doc-caption"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5, duration: 1.2 }}
        style={{ opacity: heroOpacity }}
      >
        <span className="cover-doc-line mono">Angkatan 65 · 14 Jan – 2 Feb 2026 · Sumatra</span>
      </motion.div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VIEW 1 — DYNAMIC SCROLLYTELLING TIMELINE
// Center-guided benang merah · Alternating layout · Clean typography reveal
// Contextual background · Spring-pop nodes · Glow at leading edge
// ═══════════════════════════════════════════════════════════════════════════════

const TIMELINE_EVENTS = [
  {
    date: "14 Jan",
    label: "Pembukaan & Pengarahan Umum",
    info: "Seluruh 510 mahasiswa berkumpul di Aula STIS untuk pembukaan resmi program R3P 2026.",
    icon: "🎓", color: "#FF8C00",
    phase: "pembukaan",   // phase drives bg gradient
    side: "right",
  },
  {
    date: "15–17 Jan",
    label: "Pelatihan Teknis Intensif",
    info: "3 hari pelatihan intensif: metodologi R3P, sistem CAPI, teknik wawancara, dan pengenalan kuesioner.",
    icon: "📊", color: "#2D5A27",
    phase: "pelatihan",
    side: "left",
  },
  {
    date: "18 Jan",
    label: "Briefing Kepala BPS RI",
    info: "Arahan langsung dari Kepala BPS RI tentang pentingnya misi dan standar integritas data.",
    icon: "🏛️", color: "#2D5A27",
    phase: "pelatihan",
    side: "right",
  },
  {
    date: "19 Jan",
    label: "Deployment ke 3 Provinsi",
    info: "510 mahasiswa diterbangkan ke Aceh, Sumatera Utara, dan Sumatera Barat.",
    icon: "✈️", color: "#002147",
    phase: "deployment",
    side: "left",
  },
  {
    date: "20 Jan – 1 Feb",
    label: "Pendataan Lapangan R3P",
    info: "21 hari di lapangan: wawancara KK terdampak, verifikasi lokasi, dan rekap harian.",
    icon: "📋", color: "#002147",
    phase: "deployment",
    side: "right",
  },
  {
    date: "2 Feb",
    label: "Penutupan & Penarikan",
    info: "Seluruh mahasiswa kembali dengan total data yang telah dikumpulkan dan divalidasi.",
    icon: "🏁", color: "#FF8C00",
    phase: "penutupan",
    side: "left",
  },
];

// Maps phase → background gradient stops
const PHASE_BG = {
  pembukaan: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(255,140,0,0.07) 0%, transparent 70%)",
  pelatihan: "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(45,90,39,0.09) 0%, transparent 70%)",
  deployment: "radial-gradient(ellipse 80% 60% at 50% 60%, rgba(0,33,71,0.12) 0%, transparent 70%)",
  penutupan: "radial-gradient(ellipse 80% 60% at 50% 100%, rgba(255,140,0,0.06) 0%, transparent 70%)",
};

// ── Individual timeline node (alternating layout, no card box) ──────────────
function TLNode({ ev, i, activeIdx }) {
  const nodeRef = useRef(null);
  const isActive = activeIdx === i;
  const isPast   = activeIdx > i;
  const isLeft   = ev.side === "left";

  // Scroll-triggered: fires when this node enters center viewport
  const inView = useInView(nodeRef, { once: false, margin: "-35% 0px -35% 0px" });

  // Spring-pop scale for the icon node
  const nodeScale = useSpring(isActive ? 1.45 : isPast ? 1.05 : 0.7, { stiffness: 200, damping: 18 });
  const nodeOpacity = isActive || isPast ? 1 : 0.35;

  // Date number scale — springs bigger when active
  const dateScale = useSpring(isActive ? 1.18 : 1, { stiffness: 140, damping: 20 });

  return (
    <div
      ref={nodeRef}
      className={`tl2-row ${isLeft ? "tl2-left" : "tl2-right"}`}
      style={{ "--ev-color": ev.color }}
    >
      {/* ── Left side slot ── */}
      <div className="tl2-slot tl2-slot-left">
        {isLeft && (
          <TLContent ev={ev} isActive={isActive} isPast={isPast} dateScale={dateScale} align="right" />
        )}
      </div>

      {/* ── Center node ── */}
      <div className="tl2-center-col">
        <motion.div
          className="tl2-node"
          style={{ scale: nodeScale, opacity: nodeOpacity }}
          animate={{
            boxShadow: isActive
              ? `0 0 0 6px ${ev.color}22, 0 0 32px ${ev.color}55`
              : isPast
              ? `0 0 0 3px ${ev.color}18`
              : "none",
            background: isActive || isPast ? ev.color : "rgba(0,33,71,0.12)",
          }}
          transition={SPRING_SNAPPY}
        >
          <motion.span
            className="tl2-icon"
            animate={{ scale: isActive ? 1 : 0.8, opacity: isActive || isPast ? 1 : 0.5 }}
            transition={{ ...SPRING_SNAPPY, delay: 0.05 }}
          >
            {ev.icon}
          </motion.span>
        </motion.div>
      </div>

      {/* ── Right side slot ── */}
      <div className="tl2-slot tl2-slot-right">
        {!isLeft && (
          <TLContent ev={ev} isActive={isActive} isPast={isPast} dateScale={dateScale} align="left" />
        )}
      </div>
    </div>
  );
}

function TLContent({ ev, isActive, isPast, dateScale, align }) {
  const revealed = isActive || isPast;
  return (
    <motion.div
      className={`tl2-content tl2-content-${align}`}
      animate={{ opacity: revealed ? 1 : 0.22, x: revealed ? 0 : (align === "left" ? 24 : -24) }}
      transition={SPRING_SOFT}
    >
      {/* Date — JetBrains Mono, springs big when active */}
      <motion.div
        className="tl2-date mono"
        style={{ scale: dateScale, color: isActive ? ev.color : "var(--text-light)", transformOrigin: align === "left" ? "left center" : "right center" }}
        animate={{ color: isActive ? ev.color : isPast ? "var(--text-mid)" : "var(--text-light)" }}
        transition={{ duration: 0.4 }}
      >
        {ev.date}
      </motion.div>

      {/* Label */}
      <motion.h3
        className="tl2-label"
        animate={{ color: isActive ? "var(--navy)" : isPast ? "var(--text)" : "var(--text-light)" }}
        transition={{ duration: 0.4 }}
      >
        {ev.label}
      </motion.h3>

      {/* Info — only fully visible when active */}
      <AnimatePresence>
        {isActive && (
          <motion.p
            className="tl2-info"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.38, ease: EASE_OUT }}
          >
            {ev.info}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Phase tag */}
      <motion.span
        className="tl2-phase-tag mono"
        animate={{ opacity: isActive ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        style={{ color: ev.color }}
      >
        ● {ev.phase}
      </motion.span>
    </motion.div>
  );
}

// ── The glowing center SVG path ──────────────────────────────────────────────
function CenterPath({ pathLength, glowProgress }) {
  // compute cy at top-level so hooks rules are satisfied
  const cy = useTransform(glowProgress, [0, 1], [0, 100]);

  return (
    <svg
      className="tl2-center-svg"
      viewBox="0 0 20 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <filter id="tl2Glow" x="-200%" y="-5%" width="500%" height="110%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="tl2Grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#FF8C00" />
          <stop offset="42%"  stopColor="#2D5A27" />
          <stop offset="72%"  stopColor="#002147" />
          <stop offset="100%" stopColor="#FF8C00" />
        </linearGradient>
      </defs>

      {/* Static track */}
      <line x1="10" y1="0" x2="10" y2="100"
        stroke="rgba(0,33,71,0.08)" strokeWidth="2" />

      {/* Animated fill — scales vertically from top as user scrolls */}
      <motion.line
        x1="10" y1="0" x2="10" y2="100"
        stroke="url(#tl2Grad)"
        strokeWidth="2.5"
        strokeLinecap="round"
        style={{ scaleY: pathLength, transformOrigin: "10px 0px", filter: "url(#tl2Glow)" }}
      />

      {/* Leading glow orb — travels from top to bottom as user scrolls */}
      <motion.circle
        cx="10"
        r="5"
        fill="#FF8C00"
        filter="url(#tl2Glow)"
        style={{ cy }}
        animate={{ opacity: [0.55, 1, 0.55] }}
        transition={{ duration: 1.3, repeat: Infinity, ease: "easeInOut" }}
      />
    </svg>
  );
}

// ── Main ScrollyTimeline ─────────────────────────────────────────────────────
function ScrollyTimeline() {
  const sectionRef  = useRef(null);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [bgPhase, setBgPhase]   = useState("pembukaan");

  // Scroll progress drives the drawing line + glow orb
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 0.85", "end 0.15"],
  });
  const pathLength    = useSpring(scrollYProgress, { stiffness: 70, damping: 22 });
  const glowProgress  = useSpring(scrollYProgress, { stiffness: 60, damping: 20 });

  // Watch which node is in center of viewport
  const nodeRefs = useRef([]);

  useEffect(() => {
    const observers = TIMELINE_EVENTS.map((ev, i) => {
      const el = nodeRefs.current[i];
      if (!el) return null;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveIdx(i);
            setBgPhase(TIMELINE_EVENTS[i].phase);
          }
        },
        { rootMargin: "-38% 0px -38% 0px", threshold: 0 }
      );
      obs.observe(el);
      return obs;
    });
    return () => observers.forEach(o => o?.disconnect());
  }, []);

  const bgGradient = PHASE_BG[bgPhase] || PHASE_BG.pembukaan;

  return (
    <section className="view view-1" ref={sectionRef} id="timeline">
      {/* Contextual background gradient — transitions by phase */}
      <motion.div
        className="tl2-bg-gradient"
        animate={{ background: bgGradient }}
        transition={{ duration: 1.2, ease: "easeInOut" }}
        aria-hidden="true"
      />

      <div className="view-1-inner tl2-inner">
        {/* Section header */}
        <div className="tl2-header">
          <motion.span className="tag" variants={fadeIn} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            Linimasa Kegiatan
          </motion.span>
          <motion.h2 className="hero-headline" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            Sebuah<br /><span className="headline-accent">Perjalanan</span>
          </motion.h2>
          <motion.p className="hero-sub" variants={fadeUp} custom={1} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            510 mahasiswa · 3 provinsi · 21 hari di lapangan
          </motion.p>
        </div>

        {/* Timeline body: center SVG + alternating rows */}
        <div className="tl2-body">
          {/* The glowing center path */}
          <div className="tl2-path-col">
            <CenterPath pathLength={pathLength} glowProgress={glowProgress} />
          </div>

          {/* Event rows */}
          <div className="tl2-events">
            {TIMELINE_EVENTS.map((ev, i) => (
              <div key={i} ref={el => (nodeRefs.current[i] = el)}>
                <TLNode ev={ev} i={i} activeIdx={activeIdx} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VIEW 2 — HORIZONTAL PINNED GALLERY WITH THROWABLE PHYSICS
// ═══════════════════════════════════════════════════════════════════════════════
const TRAINING_PHOTOS = [
  { src: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=700&fit=crop", caption: "Orientasi Awal & Pengantar Metodologi R3P", day: "Hari 1" },
  { src: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=600&h=700&fit=crop", caption: "Workshop CAPI & Pengisian Kuesioner Digital", day: "Hari 1" },
  { src: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=600&h=700&fit=crop", caption: "Simulasi Wawancara — Peran Enumerator & Responden", day: "Hari 2" },
  { src: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&h=700&fit=crop", caption: "Diskusi Teknis dengan Supervisor BPS Daerah", day: "Hari 2" },
  { src: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=700&fit=crop", caption: "Evaluasi & Persiapan Akhir Keberangkatan", day: "Hari 3" },
];

function ThrowablePhoto({ photo, i, containerRef }) {
  const [flipped, setFlipped] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useMotionValue((i % 3 - 1) * 4);

  return (
    <motion.div
      className="gallery-card-wrapper"
      drag
      dragConstraints={containerRef}
      dragElastic={0.12}
      dragMomentum={true}
      style={{ x, y }}
      whileDrag={{
        scale: 1.06,
        rotate: 0,
        zIndex: 20,
        cursor: "grabbing",
        boxShadow: "0 30px 80px rgba(0,33,71,0.28)",
      }}
      data-cursor="drag"
    >
      <motion.div
        className="gallery-card"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ ...SPRING_SOFT, duration: 0.65 }}
        onClick={() => setFlipped(!flipped)}
        style={{ transformStyle: "preserve-3d", rotate }}
        whileHover={{ y: -10, scale: 1.02 }}
      >
        {/* Front */}
        <div className="card-face card-front">
          <div className="card-num mono">{String(i + 1).padStart(2, "0")}</div>
          <div className="card-day-badge">{photo.day}</div>
          <img src={photo.src} alt={photo.caption} loading="lazy" />
          <div className="card-hint">🖱 Klik untuk buka · Drag untuk lempar</div>
        </div>
        {/* Back */}
        <div className="card-face card-back">
          <div className="card-back-content">
            <span className="card-back-num mono">{photo.day}</span>
            <p className="card-back-caption">{photo.caption}</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function PinnedGallery() {
  const sectionRef = useRef(null);
  const trackRef   = useRef(null);
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], ["0%", `-${(TRAINING_PHOTOS.length - 1) * 22}%`]);
  const xSpring = useSpring(x, { stiffness: 80, damping: 25 });
  const progressWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section className="view view-2" ref={sectionRef} id="gallery">
      <div className="view-2-sticky">
        <div className="view-2-header">
          <motion.span className="tag" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            Tahap 1 · Pelatihan Teknis
          </motion.span>
          <motion.h2 className="view-headline" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={SPRING_MEDIUM} viewport={{ once: true }}>
            Ditempa Sebelum Diterjunkan
          </motion.h2>
          <p className="view-sub">Scroll untuk jelajahi gallery · Drag foto untuk lempar.</p>
        </div>

        <div className="gallery-overflow" ref={trackRef}>
          <motion.div className="gallery-track" style={{ x: xSpring }} ref={containerRef}>
            {TRAINING_PHOTOS.map((photo, i) => (
              <ThrowablePhoto key={i} photo={photo} i={i} containerRef={containerRef} />
            ))}
          </motion.div>
        </div>

        {/* Animated scroll progress bar */}
        <div className="gallery-progress-track">
          <motion.div className="gallery-progress-fill" style={{ width: progressWidth }} />
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VIEW 3 — BRIEFING PIMPINAN  ·  CENTER CINEMATIC FOCUS
// Navy background · Premium video placeholder · WordFade quote · Pillar cards
// ═══════════════════════════════════════════════════════════════════════════════

const BRIEFING_QUOTE_WORDS = [
  "Kalian", "bukan", "sekadar", "mahasiswa", "yang", "PKL.", "Kalian", "adalah",
  "perpanjangan", "tangan", "negara", "dalam", "memastikan", "data", "yang",
  "akurat", "untuk", "pemulihan", "yang", "nyata.",
];

const INTEGRITY_PILLARS = [
  {
    number: "01",
    title: "Akurasi Data",
    desc: "Standar pengumpulan tertinggi — zero tolerance terhadap kesalahan entry maupun interpretasi data lapangan.",
    accent: "#FF8C00",
  },
  {
    number: "02",
    title: "Kepercayaan Publik",
    desc: "BPS sebagai institusi terpercaya bangsa. Setiap data yang dikumpulkan menjadi dasar kebijakan pemulihan.",
    accent: "#4A9F6F",
  },
  {
    number: "03",
    title: "Integritas Penuh",
    desc: "Tidak ada kompromi di lapangan. Kejujuran adalah satu-satunya standar yang berlaku tanpa pengecualian.",
    accent: "#6B9FD4",
  },
];

// Word-by-word fade reveal — elegant, large-scale
function WordFade({ words, className = "" }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-15% 0px" });

  return (
    <p ref={ref} className={`word-fade-block ${className}`} aria-label={words.join(" ")}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          className="word-fade-unit"
          initial={{ opacity: 0, y: 22, filter: "blur(4px)" }}
          animate={isInView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
          transition={{
            delay: i * 0.055,
            duration: 0.65,
            ease: EASE_OUT,
          }}
        >
          {word}&nbsp;
        </motion.span>
      ))}
    </p>
  );
}

// Pulsing play button for the video placeholder
function PlayPulse() {
  return (
    <div className="play-pulse-wrap" aria-label="Video akan segera tersedia">
      {/* Ripple rings */}
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          className="play-ripple"
          animate={{ scale: [1, 2.4], opacity: [0.35, 0] }}
          transition={{
            duration: 2.2,
            delay: i * 0.72,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
      ))}
      {/* Core play button */}
      <motion.div
        className="play-core"
        whileHover={{ scale: 1.08 }}
        transition={SPRING_SOFT}
        data-cursor="hover"
      >
        <svg
          className="play-icon-svg"
          viewBox="0 0 52 60"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M4 4L48 30L4 56V4Z"
            fill="white"
            stroke="white"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      </motion.div>
    </div>
  );
}

// Premium video placeholder with parallax image + outer glow
function VideoPlaceholder({ scrollYProgress }) {
  const [isHovered, setIsHovered] = useState(false);
  const imgY = useSpring(
    useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]),
    { stiffness: 100, damping: 30 }
  );

  return (
    <motion.div
      className="v3-video-container"
      initial={{ opacity: 0, y: 48, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ ...SPRING_SOFT, delay: 0.25 }}
      viewport={{ once: true }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Outer glow — navy-bright halo */}
      <motion.div
        className="v3-video-glow"
        animate={{ opacity: isHovered ? 1 : 0.62, scale: isHovered ? 1.04 : 1 }}
        transition={SPRING_SOFT}
      />

      {/* Parallax hero image */}
      <div className="v3-video-mask">
        <motion.div className="v3-video-img-wrap" style={{ y: imgY }}>
          <img
            src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200&h=720&fit=crop&crop=center"
            alt="Briefing Kepala BPS RI — dokumentasi sedang diproses"
            className="v3-video-img"
            draggable={false}
          />
          {/* Cinematic scan-line overlay */}
          <div className="v3-scanlines" aria-hidden="true" />
        </motion.div>

        {/* Dark gradient vignette so play button pops */}
        <div className="v3-video-vignette" />

        {/* Center play button */}
        <div className="v3-play-center">
          <PlayPulse />
        </div>

        {/* Coming-soon label */}
        <div className="v3-coming-soon mono">
          <motion.span
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
          >
            ● DOKUMENTASI DALAM PROSES — PUBDOK R3P 2026
          </motion.span>
        </div>
      </div>

      {/* Duration / meta bar below video */}
      <div className="v3-video-meta">
        <span className="v3-meta-dot" />
        <span className="v3-meta-text mono">18 Januari 2026 · Aula STIS Jakarta · Kepala BPS RI</span>
        <span className="v3-meta-badge mono">SEGERA HADIR</span>
      </div>
    </motion.div>
  );
}

function BriefingView() {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // Subtle content parallax
  const contentY = useSpring(
    useTransform(scrollYProgress, [0, 1], ["5%", "-5%"]),
    { stiffness: 100, damping: 30 }
  );

  // Background particle drift
  const particleY = useTransform(scrollYProgress, [0, 1], ["0%", "-18%"]);

  return (
    <section className="view view-3" ref={sectionRef} id="briefing">

      {/* ── Deep navy atmosphere ── */}
      <div className="v3-bg-base" />

      {/* Drifting light particles */}
      <motion.div className="v3-particles" style={{ y: particleY }} aria-hidden="true">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="v3-particle"
            style={{
              left: `${(i * 5.3 + (i % 7) * 8.1) % 100}%`,
              top:  `${(i * 11.7 + (i % 5) * 14) % 100}%`,
              width:  `${1 + (i % 3)}px`,
              height: `${1 + (i % 3)}px`,
              opacity: 0.12 + (i % 5) * 0.06,
            }}
            animate={{
              y: [0, -(16 + (i % 6) * 8), 0],
              opacity: [0.12 + (i % 5) * 0.06, 0.4 + (i % 4) * 0.1, 0.12 + (i % 5) * 0.06],
            }}
            transition={{
              duration: 4 + (i % 6) * 1.2,
              repeat: Infinity,
              delay: (i % 8) * 0.6,
              ease: "easeInOut",
            }}
          />
        ))}
      </motion.div>

      {/* ── Main content — centered column ── */}
      <motion.div className="v3-inner" style={{ y: contentY }}>

        {/* Eyebrow tag */}
        <motion.div
          className="v3-eyebrow-row"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING_MEDIUM, delay: 0.05 }}
          viewport={{ once: true }}
        >
          <span className="v3-eyebrow mono">TAHAP 02 · BRIEFING PIMPINAN · 18 JAN 2026</span>
        </motion.div>

        {/* Main headline — Montserrat 900 */}
        <motion.h2
          className="v3-headline"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING_MEDIUM, delay: 0.14 }}
          viewport={{ once: true }}
        >
          Mandat dari<br />
          <span className="v3-headline-accent">Kepala BPS RI</span>
        </motion.h2>

        {/* ── Premium video placeholder ── */}
        <VideoPlaceholder scrollYProgress={scrollYProgress} />

        {/* ── Cinematic Quote ── */}
        <div className="v3-quote-section">
          {/* Top decorative rule */}
          <motion.div
            className="v3-quote-rule"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            transition={{ duration: 0.9, ease: EASE_OUT, delay: 0.1 }}
            viewport={{ once: true }}
          />

          <div className="v3-quote-body">
            <span className="v3-open-quote" aria-hidden="true">"</span>
            <WordFade words={BRIEFING_QUOTE_WORDS} className="v3-quote-text" />
            <span className="v3-close-quote" aria-hidden="true">"</span>
          </div>

          <motion.cite
            className="v3-cite mono"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, duration: 0.7, ease: EASE_OUT }}
            viewport={{ once: true }}
          >
            — Kepala BPS RI · Aula STIS Jakarta · 18 Januari 2026
          </motion.cite>

          {/* Bottom decorative rule */}
          <motion.div
            className="v3-quote-rule"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            transition={{ duration: 0.9, ease: EASE_OUT, delay: 0.3 }}
            viewport={{ once: true }}
          />
        </div>

        {/* ── Integrity Pillars — staggered fade-in ── */}
        <motion.div
          className="v3-pillars"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-10% 0px" }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.16, delayChildren: 0.1 } },
          }}
        >
          {INTEGRITY_PILLARS.map((p, i) => (
            <motion.div
              key={i}
              className="v3-pillar"
              variants={{
                hidden: { opacity: 0, y: 36, filter: "blur(6px)" },
                visible: {
                  opacity: 1, y: 0, filter: "blur(0px)",
                  transition: { duration: 0.7, ease: EASE_OUT },
                },
              }}
              whileHover={{ y: -4, borderColor: p.accent }}
              transition={SPRING_SOFT}
              data-cursor="hover"
            >
              <div className="v3-pillar-top">
                <span className="v3-pillar-num mono" style={{ color: p.accent }}>{p.number}</span>
                <motion.div
                  className="v3-pillar-line"
                  style={{ background: p.accent }}
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  transition={{ delay: i * 0.16 + 0.4, duration: 0.6, ease: EASE_OUT }}
                  viewport={{ once: true }}
                />
              </div>
              <h3 className="v3-pillar-title">{p.title}</h3>
              <p className="v3-pillar-desc">{p.desc}</p>
            </motion.div>
          ))}
        </motion.div>

      </motion.div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VIEW 4 — SUMATRA DEPLOYMENT MAP (FULL SVG + FLIGHT PATHS + ZOOM)
// ═══════════════════════════════════════════════════════════════════════════════
const PROVINCES = [
  {
    id: "aceh", name: "Aceh",
    mahasiswa: 170, pml: 19, kab: 12,
    // More accurate Aceh province shape (northern Sumatra)
    path: "M174,28 L190,22 L210,20 L232,26 L252,38 L264,55 L268,74 L262,94 L248,112 L230,124 L210,130 L190,126 L172,114 L160,98 L158,78 L162,58 Z",
    cx: 213, cy: 76, color: "#FF8C00",
    detail: "Kab. Aceh Besar, Pidie, Bireuen, Lhokseumawe & sekitarnya",
    flagEmoji: "🟠",
  },
  {
    id: "sumut", name: "Sumatera Utara",
    mahasiswa: 200, pml: 22, kab: 14,
    path: "M158,78 L172,114 L190,126 L210,130 L248,112 L268,74 L276,90 L290,112 L298,138 L294,164 L278,186 L256,200 L232,208 L206,204 L182,192 L164,174 L155,152 L152,130 Z",
    cx: 225, cy: 152, color: "#2D5A27",
    detail: "Medan, Deli Serdang, Simalungun, Toba & sekitarnya",
    flagEmoji: "🟢",
  },
  {
    id: "sumbar", name: "Sumatera Barat",
    mahasiswa: 140, pml: 16, kab: 10,
    path: "M152,130 L155,152 L164,174 L182,192 L206,204 L232,208 L238,228 L230,252 L218,272 L200,284 L180,290 L160,280 L144,262 L136,240 L138,216 L144,194 L148,168 Z",
    cx: 188, cy: 218, color: "#002147",
    detail: "Padang, Bukittinggi, Agam, Tanah Datar & sekitarnya",
    flagEmoji: "🔵",
  },
];

// The rest of Sumatra island silhouette (greyed out)
const SUMATRA_SILHOUETTE = "M174,28 L210,20 L252,38 L268,74 L298,138 L294,164 L278,186 L256,200 L232,208 L238,228 L230,252 L218,272 L200,284 L180,290 L160,280 L144,262 L136,240 L138,216 L148,168 L152,130 L155,152 L164,174 L182,192 L206,204 L232,208 L256,200 L278,186 L294,164 L298,138 L268,74 L252,38 L210,20 Z";

// STIS/Jakarta origin (below the island)
const ORIGIN = { x: 220, y: 430 };

function FlightPath({ targetX, targetY, delay, color, inView, dotsKey }) {
  const [phase, setPhase] = useState("idle");

  useEffect(() => {
    if (!inView) { setPhase("idle"); return; }
    setPhase("idle");
    const t1 = setTimeout(() => setPhase("moving"), delay);
    const t2 = setTimeout(() => setPhase("done"), delay + 1800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [inView, delay, dotsKey]);

  const midX = (ORIGIN.x + targetX) / 2 + (Math.random() - 0.5) * 60;
  const midY = (ORIGIN.y + targetY) / 2 - 60;
  const pathD = `M${ORIGIN.x},${ORIGIN.y} Q${midX},${midY} ${targetX},${targetY}`;

  if (phase === "idle") return null;

  return (
    <g>
      {/* Dashed flight trail */}
      <motion.path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth="1"
        strokeDasharray="4 3"
        opacity={0.3}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: phase === "moving" || phase === "done" ? 1 : 0 }}
        transition={{ duration: 1.6, ease: "easeInOut" }}
      />
      {/* Moving dot */}
      {phase === "moving" && (
        <motion.circle
          r={3.5}
          fill={color}
          filter="url(#glow)"
          initial={{ offsetDistance: "0%", opacity: 1 }}
          style={{ offsetPath: `path('${pathD}')` }}
        >
          <animateMotion dur="1.6s" path={pathD} fill="freeze" />
        </motion.circle>
      )}
      {/* Landing pulse */}
      {phase === "done" && (
        <motion.circle
          cx={targetX} cy={targetY}
          fill={color}
          initial={{ r: 2, opacity: 0.8 }}
          animate={{ r: [2, 10, 2], opacity: [0.8, 0, 0.8] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
        />
      )}
    </g>
  );
}

function SumatraMap() {
  const [active, setActive] = useState(null);
  const [zoomed, setZoomed] = useState(null);
  const [dotsKey, setDotsKey] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: "-10% 0px" });

  useEffect(() => {
    if (isInView) setDotsKey(k => k + 1);
  }, [isInView]);

  const flightDots = useMemo(() => {
    const result = [];
    PROVINCES.forEach(prov => {
      const count = Math.round((prov.mahasiswa / 510) * 12);
      for (let i = 0; i < count; i++) {
        result.push({
          targetX: prov.cx + (Math.random() - 0.5) * 24,
          targetY: prov.cy + (Math.random() - 0.5) * 24,
          color: prov.color,
          delay: 300 + Math.random() * 1800,
        });
      }
    });
    return result;
  }, []);

  const handleProvinceClick = (provId) => {
    setZoomed(prev => prev === provId ? null : provId);
    setActive(provId);
  };

  const zoomedProv = PROVINCES.find(p => p.id === zoomed);
  const viewBox = zoomedProv
    ? `${zoomedProv.cx - 70} ${zoomedProv.cy - 70} 140 140`
    : "110 10 230 300";

  return (
    <div ref={ref} className="map-stage">
      <motion.svg
        viewBox={viewBox}
        className="sumatra-svg"
        animate={{ viewBox }}
        transition={SPRING_SOFT}
      >
        <defs>
          <radialGradient id="oceanGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#c8dff0" />
            <stop offset="100%" stopColor="#a8c8e8" />
          </radialGradient>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="3" stdDeviation="6" floodColor="rgba(0,33,71,0.25)" />
          </filter>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <pattern id="hatch" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="4" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
          </pattern>
        </defs>

        {/* Ocean background */}
        <rect width="440" height="480" fill="url(#oceanGrad)" />

        {/* Sumatra full silhouette (greyed) */}
        <path
          d={SUMATRA_SILHOUETTE}
          fill="#b8cfe0"
          stroke="white"
          strokeWidth="1.5"
        />

        {/* Province highlights */}
        {PROVINCES.map((prov) => {
          const isActive = active === prov.id || zoomed === prov.id;
          return (
            <motion.g key={prov.id}>
              <motion.path
                d={prov.path}
                fill={prov.color}
                stroke="white"
                strokeWidth={isActive ? 2.5 : 1.5}
                filter={isActive ? "url(#shadow)" : "none"}
                style={{ cursor: "pointer", transformOrigin: `${prov.cx}px ${prov.cy}px` }}
                animate={{
                  fillOpacity: isActive ? 1 : 0.75,
                  scale: isActive ? 1.03 : 1,
                }}
                transition={SPRING_SNAPPY}
                onClick={() => handleProvinceClick(prov.id)}
                onHoverStart={() => !zoomed && setActive(prov.id)}
                onHoverEnd={() => !zoomed && setActive(null)}
                data-cursor="hover"
              />
              {/* Hatch texture on active province */}
              {isActive && (
                <motion.path
                  d={prov.path}
                  fill="url(#hatch)"
                  pointerEvents="none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              )}
            </motion.g>
          );
        })}

        {/* Province labels */}
        {PROVINCES.map((prov) => (
          <motion.text
            key={`label-${prov.id}`}
            x={prov.cx}
            y={prov.cy + 4}
            textAnchor="middle"
            fill="white"
            fontSize="7.5"
            fontFamily="Montserrat, sans-serif"
            fontWeight="900"
            letterSpacing="0.8"
            pointerEvents="none"
            animate={{ opacity: 1 }}
          >
            {prov.name.toUpperCase()}
          </motion.text>
        ))}

        {/* STIS/Jakarta origin star */}
        <g>
          <motion.circle
            cx={ORIGIN.x} cy={ORIGIN.y} r={7}
            fill="#FF8C00" stroke="white" strokeWidth="2"
            animate={{ r: [7, 9, 7] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          <text x={ORIGIN.x} y={ORIGIN.y + 18} textAnchor="middle" fill="#FF8C00"
            fontSize="7" fontFamily="JetBrains Mono, monospace" fontWeight="700">
            STIS · JKT
          </text>
        </g>

        {/* Flight paths — animated dots from Jakarta */}
        {isInView && flightDots.map((d, i) => (
          <FlightPath key={`${dotsKey}-${i}`} {...d} inView={isInView} dotsKey={dotsKey} />
        ))}

        {/* Pulse rings */}
        {PROVINCES.map((prov, i) => (
          isInView && (
            <motion.circle
              key={`pulse-${dotsKey}-${prov.id}`}
              cx={prov.cx} cy={prov.cy}
              fill="none" stroke={prov.color} strokeWidth="1.5"
              initial={{ r: 6, opacity: 0.8 }}
              animate={{ r: [6, 26, 6], opacity: [0.8, 0, 0.8] }}
              transition={{ delay: 2 + i * 0.5, duration: 2.5, repeat: Infinity, repeatDelay: 2.5, ease: "easeOut" }}
            />
          )
        ))}
      </motion.svg>

      {/* Province detail panel */}
      <AnimatePresence>
        {active && (() => {
          const p = PROVINCES.find(p => p.id === active);
          return (
            <motion.div
              className="map-detail-panel"
              key={active}
              initial={{ opacity: 0, x: 20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              transition={SPRING_SNAPPY}
            >
              <div className="panel-color-bar" style={{ background: p.color }} />
              <div className="panel-body">
                <h3 className="panel-name">{p.name}</h3>
                <p className="panel-detail">{p.detail}</p>
                <div className="panel-stats">
                  <div className="pstat">
                    <span className="pstat-num mono">{p.mahasiswa}</span>
                    <span className="pstat-label">Mahasiswa</span>
                  </div>
                  <div className="pstat">
                    <span className="pstat-num mono">{p.pml}</span>
                    <span className="pstat-label">PML</span>
                  </div>
                  <div className="pstat">
                    <span className="pstat-num mono">{p.kab}</span>
                    <span className="pstat-label">Kab/Kota</span>
                  </div>
                </div>
                {zoomed === p.id ? (
                  <button className="zoom-btn" onClick={() => { setZoomed(null); setActive(null); }}>
                    ✕ Tutup Zoom
                  </button>
                ) : (
                  <button className="zoom-btn" onClick={() => setZoomed(p.id)} data-cursor="hover">
                    🔍 Zoom Provinsi
                  </button>
                )}
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {zoomed && (
        <motion.button
          className="zoom-reset-btn"
          onClick={() => { setZoomed(null); setActive(null); }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          data-cursor="hover"
        >
          ← Kembali ke Sumatra
        </motion.button>
      )}
    </div>
  );
}

function DeploymentView() {
  return (
    <section className="view view-4" id="deployment">
      <div className="view-4-inner">
        <div className="view-4-header">
          <motion.span className="tag" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            Tahap 3 · Deployment
          </motion.span>
          <motion.h2 className="view-headline" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            Tiga Provinsi,<br />Satu Semangat
          </motion.h2>
          <motion.p className="view-sub dark" variants={fadeUp} custom={1} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            Klik provinsi di peta untuk zoom &amp; detail. Titik bergerak = pergerakan mahasiswa dari Jakarta.
          </motion.p>
        </div>

        <div className="view-4-grid">
          <SumatraMap />

          <div className="deploy-stats-col">
            <motion.div className="mega-stat" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={SPRING_MEDIUM} viewport={{ once: true }}>
              <span className="mega-num mono">510</span>
              <span className="mega-label">Mahasiswa STIS</span>
            </motion.div>
            <motion.div className="mega-stat" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ ...SPRING_MEDIUM, delay: 0.12 }} viewport={{ once: true }}>
              <span className="mega-num mono">57</span>
              <span className="mega-label">Pengawas Lapangan</span>
            </motion.div>
            <motion.div className="mega-stat" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ ...SPRING_MEDIUM, delay: 0.24 }} viewport={{ once: true }}>
              <span className="mega-num mono">21</span>
              <span className="mega-label">Hari di Lapangan</span>
            </motion.div>

            <div className="prov-legend">
              {PROVINCES.map(p => (
                <motion.div key={p.id} className="legend-row" initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} transition={SPRING_SOFT} viewport={{ once: true }}>
                  <div className="legend-dot" style={{ background: p.color }} />
                  <span className="legend-name">{p.name}</span>
                  <span className="legend-count mono">{p.mahasiswa} mhs · {p.pml} PML</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VIEW 5 — DRAGGABLE FLATLAY "AMUNISI TEMPUR"
// ═══════════════════════════════════════════════════════════════════════════════
const GEAR_ITEMS = [
  { id: "hp",    emoji: "📱", label: "CAPI Device",      desc: "Entry data real-time via aplikasi CAPI BPS",      x: "10%",  y: "12%", rotate: -14 },
  { id: "boots", emoji: "🥾", label: "Sepatu Boots",     desc: "Menembus lumpur & jalan setapak tak beraspal",    x: "58%",  y: "8%",  rotate: 8   },
  { id: "rain",  emoji: "🧥", label: "Jas Hujan",        desc: "Setia menemani hujan deras & angin kencang",      x: "18%",  y: "52%", rotate: -6  },
  { id: "id",    emoji: "🪪", label: "ID Card BPS",      desc: "Legitimasi resmi sebagai enumerator negara",      x: "63%",  y: "48%", rotate: 11  },
  { id: "map",   emoji: "🗺️",  label: "Peta Blok Sensus",desc: "Navigasi area tugas & batas wilayah pendataan",   x: "38%",  y: "28%", rotate: -3  },
];

function DraggableGear({ item, containerRef }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      className="gear-item"
      style={{ left: item.x, top: item.y }}
      drag
      dragConstraints={containerRef}
      dragElastic={0.1}
      dragMomentum={true}
      initial={{ rotate: item.rotate, scale: 0, opacity: 0 }}
      whileInView={{ scale: 1, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ ...SPRING_SNAPPY, delay: Math.random() * 0.5 }}
      whileDrag={{ scale: 1.14, rotate: 0, zIndex: 20, cursor: "grabbing" }}
      whileHover={{ scale: 1.07, rotate: 0 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      data-cursor="drag"
    >
      <div className="gear-emoji-big">{item.emoji}</div>
      <div className="gear-name">{item.label}</div>
      <AnimatePresence>
        {hovered && (
          <motion.div
            className="gear-tooltip"
            initial={{ opacity: 0, y: 8, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.92 }}
            transition={SPRING_SNAPPY}
          >
            {item.desc}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function FlatLayView() {
  const containerRef = useRef(null);

  return (
    <section className="view view-5" id="flatlay">
      <div className="view-5-header">
        <motion.span className="tag" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          Tahap 4 · Perlengkapan
        </motion.span>
        <motion.h2 className="view-headline" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          Amunisi Tempur
        </motion.h2>
        <motion.p className="view-sub" variants={fadeUp} custom={1} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          Drag item untuk pindahkan. Hover untuk baca deskripsi.
        </motion.p>
      </div>

      <div className="flatlay-stage" ref={containerRef}>
        <div className="flatlay-bg-text">STIS R3P 2026</div>
        <div className="flatlay-grid-lines" aria-hidden="true" />
        {GEAR_ITEMS.map(item => (
          <DraggableGear key={item.id} item={item} containerRef={containerRef} />
        ))}
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VIEW 6 — DEEP PARALLAX "MELAWAN MEDAN"
// ═══════════════════════════════════════════════════════════════════════════════
function DeepParallaxView() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });

  // 3 layers with distinct velocities for deep parallax
  const bgY   = useTransform(scrollYProgress, [0, 1], ["-22%", "22%"]); // slowest — terrain
  const midY  = useTransform(scrollYProgress, [0, 1], ["12%", "-12%"]); // medium — figures
  const fgY   = useTransform(scrollYProgress, [0, 1], ["28%", "-28%"]); // fastest — rain
  const textY = useTransform(scrollYProgress, [0, 1], ["14%", "-14%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.25, 0.75, 1], [0, 1, 1, 0]);

  return (
    <section className="view view-6" ref={ref} id="field">
      {/* Layer 1: Background — muddy terrain (SLOWEST) */}
      <motion.div
        className="parallax-layer layer-bg"
        style={{
          y: bgY,
          backgroundImage: "url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1600&fit=crop')",
        }}
      />

      {/* Layer 2: Midground — student silhouettes (MEDIUM) */}
      <motion.div className="parallax-layer layer-mid" style={{ y: midY }}>
        <div className="mid-figures">
          {["👨‍💼", "👩‍💼", "👨‍💼", "👩‍💼", "👨‍💼"].map((f, i) => (
            <motion.div
              key={i}
              className="figure"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 2.2 + i * 0.3, repeat: Infinity, delay: i * 0.45, ease: "easeInOut" }}
            >
              {f}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Layer 3: Foreground — rain drops (FASTEST) */}
      <motion.div className="parallax-layer layer-fg" style={{ y: fgY }}>
        {Array.from({ length: 28 }).map((_, i) => (
          <motion.div
            key={i}
            className="rain-drop"
            style={{
              left: `${(i * 3.7) % 100}%`,
              top: `${(i * 7.3) % 100}%`,
              opacity: 0.25 + (i % 5) * 0.1,
              height: `${12 + (i % 4) * 5}px`,
            }}
            animate={{ y: [0, 32 + (i % 4) * 12] }}
            transition={{
              duration: 0.7 + (i % 6) * 0.12,
              repeat: Infinity,
              ease: "linear",
              delay: (i % 8) * 0.1,
            }}
          />
        ))}
        {/* Falling leaves */}
        {["🍃", "🌿", "🍂"].map((leaf, i) => (
          <motion.div
            key={`leaf-${i}`}
            className="leaf"
            style={{ left: `${20 + i * 28}%`, top: "-5%" }}
            animate={{ y: ["0%", "110%"], rotate: [0, 360], x: [0, (i % 2 === 0 ? 40 : -40)] }}
            transition={{ duration: 5 + i * 2, repeat: Infinity, ease: "easeInOut", delay: i * 1.5 }}
          >
            {leaf}
          </motion.div>
        ))}
      </motion.div>

      {/* Dark cinematic overlay */}
      <div className="parallax-overlay" />

      {/* Text — slight parallax */}
      <motion.div className="parallax-text-wrap" style={{ y: textY, opacity }}>
        <span className="tag light">Tahap 5 · Lapangan</span>
        <h2 className="view-headline light">Melawan Medan</h2>
        <p className="parallax-body">
          Hujan deras, jalan berlumpur, sinyal hilang — bukan halangan.<br />
          Hanya bagian dari cerita yang harus diselesaikan.
        </p>

        <div className="challenge-chips">
          {["🌧 Hujan Deras", "🏔 Akses Terjal", "📡 Sinyal Lemah", "☀️ Terik Matahari"].map((c, i) => (
            <motion.div
              key={i}
              className="chip"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.12, ...SPRING_MEDIUM }}
              viewport={{ once: true }}
            >
              {c}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VIEW 7 — SOLIDARITY POLAROID CAROUSEL
// ═══════════════════════════════════════════════════════════════════════════════
const POLAROIDS = [
  { src: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=500&fit=crop",  caption: "Makan siang bersama di posko",     label: "🍛 Posko", rotate: -6  },
  { src: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=400&h=500&fit=crop",  caption: "Tawa di balik penat lapangan",     label: "😄 Candid", rotate: 4  },
  { src: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=500&fit=crop",  caption: "Tim solid, hasil luar biasa",      label: "🤝 Tim",    rotate: -3  },
  { src: "https://images.unsplash.com/photo-1551836022-4c4c79ecde51?w=400&h=500&fit=crop",     caption: "Foto tim besar akhir tugas",       label: "📸 Grup",   rotate: 7  },
  { src: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=500&fit=crop",     caption: "Diskusi malam sebelum laporan",    label: "🌙 Malam",  rotate: -5  },
];

function PolaroidCarousel() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const dragX = useMotionValue(0);

  const goTo = (idx, dir) => { setDirection(dir); setCurrent(idx); };
  const prev = () => goTo((current - 1 + POLAROIDS.length) % POLAROIDS.length, -1);
  const next = () => goTo((current + 1) % POLAROIDS.length, 1);

  const handleDragEnd = (_, info) => {
    if (info.offset.x < -60) next();
    else if (info.offset.x > 60) prev();
  };

  const stackVariants = {
    enter: (dir) => ({ x: dir > 0 ? 320 : -320, rotate: dir > 0 ? 14 : -14, opacity: 0, scale: 0.84 }),
    center: { x: 0, rotate: 0, opacity: 1, scale: 1 },
    exit:  (dir) => ({ x: dir > 0 ? -320 : 320, rotate: dir > 0 ? -14 : 14, opacity: 0, scale: 0.84 }),
  };

  return (
    <section className="view view-7" id="solidarity">
      <motion.span className="tag" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
        Epilog · 3 Minggu yang Berbekas
      </motion.span>
      <motion.h2 className="view-headline center" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
        Solidaritas yang Tercipta
      </motion.h2>
      <motion.p className="view-sub center" variants={fadeUp} custom={1} initial="hidden" whileInView="visible" viewport={{ once: true }}>
        Swipe atau klik panah untuk lihat momen candid dari lapangan.
      </motion.p>

      <div className="carousel-stage">
        {[1, 2].map(offset => {
          const idx = (current + offset) % POLAROIDS.length;
          return (
            <div
              key={idx}
              className="polaroid-back-card"
              style={{ transform: `rotate(${offset * 5 - 2}deg) translateY(${offset * 8}px) scale(${1 - offset * 0.04})`, zIndex: 10 - offset }}
            />
          );
        })}

        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={current}
            className="polaroid-card"
            custom={direction}
            variants={stackVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ ...SPRING_MEDIUM, duration: 0.45 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            style={{ x: dragX, zIndex: 15, rotate: POLAROIDS[current].rotate }}
            onDragEnd={handleDragEnd}
            data-cursor="drag"
          >
            <div className="polaroid-frame">
              <img src={POLAROIDS[current].src} alt={POLAROIDS[current].caption} />
              <div className="polaroid-label-strip">
                <span className="polaroid-tag-sm">{POLAROIDS[current].label}</span>
              </div>
            </div>
            <p className="polaroid-caption-text">{POLAROIDS[current].caption}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="carousel-controls">
        <motion.button className="carousel-btn" onClick={prev} whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.92 }} data-cursor="hover">←</motion.button>
        <div className="carousel-dots">
          {POLAROIDS.map((_, i) => (
            <motion.div
              key={i}
              className="c-dot"
              animate={{ scaleX: i === current ? 2.5 : 1, background: i === current ? "#FF8C00" : "#002147" }}
              transition={SPRING_SNAPPY}
              onClick={() => goTo(i, i > current ? 1 : -1)}
              data-cursor="hover"
            />
          ))}
        </div>
        <motion.button className="carousel-btn" onClick={next} whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.92 }} data-cursor="hover">→</motion.button>
      </div>

      <motion.div
        className="closing-final"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING_MEDIUM, delay: 0.3 }}
        viewport={{ once: true }}
      >
        <blockquote className="final-quote">
          "Data bukan hanya angka.<br />Data adalah harapan.<br />
          Dan kami beruntung bisa menjadi bagiannya."
        </blockquote>
        <p className="final-credit mono">— PKL Angkatan 65 · Perjalanan R3P 2026</p>

        <div className="final-meta">
          {[{ n: "510", l: "Mahasiswa" }, { n: "57", l: "PML" }, { n: "21", l: "Hari" }, { n: "3", l: "Provinsi" }].map((m, i) => (
            <motion.div key={i} className="fmeta" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ ...SPRING_MEDIUM, delay: i * 0.1 }} viewport={{ once: true }}>
              <span className="fmeta-num mono">{m.n}</span>
              <span className="fmeta-label">{m.l}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOADING SCREEN
// ═══════════════════════════════════════════════════════════════════════════════
function LoadingScreen({ progress }) {
  return (
    <motion.div
      className="r3p-loading"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.7, ease: EASE_OUT }}
    >
      <motion.div
        className="loading-inner"
        initial={{ opacity: 0, scale: 0.88 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={SPRING_MEDIUM}
      >
        <motion.div
          className="loading-badge"
          animate={{ borderColor: ["#002147", "#FF8C00", "#2D5A27", "#002147"] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          R3P
        </motion.div>
        <p className="loading-sub mono">Memuat Cerita Perjalanan…</p>
        <div className="loading-bar-track">
          <motion.div
            className="loading-bar-fill"
            animate={{ scaleX: progress / 100 }}
            style={{ transformOrigin: "left" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </div>
        <span className="loading-pct mono">{progress}%</span>
        <motion.div
          className="loading-dots"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.4, repeat: Infinity }}
        >
          ● ● ●
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROOT COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
function Journey() {
  const [isReady, setIsReady] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);

  useEffect(() => {
    const images = [
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600",
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=600",
      "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=600",
      "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600",
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600",
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800",
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=700",
      "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200",
      "https://images.unsplash.com/photo-1551836022-4c4c79ecde51?w=500",
    ];
    let loaded = 0;
    images.forEach(src => {
      const img = new Image();
      img.onload = img.onerror = () => {
        loaded++;
        setLoadProgress(Math.round((loaded / images.length) * 100));
        if (loaded === images.length) setTimeout(() => setIsReady(true), 400);
      };
      img.src = src;
    });
  }, []);

  const sections = ["cover", "timeline", "gallery", "briefing", "deployment", "flatlay", "field", "solidarity"];

  return (
    <>
      <AnimatePresence>
        {!isReady && <LoadingScreen key="loading" progress={loadProgress} />}
      </AnimatePresence>

      {isReady && (
        <div className="journey-root">
          <CustomCursor />
          <ScrollProgressBar />

          {/* Section Nav Dots */}
          <nav className="section-dots-nav" aria-label="Section navigation">
            {sections.map((id, i) => (
              <motion.a
                key={id}
                href={`#${id}`}
                className="section-dot"
                title={id.charAt(0).toUpperCase() + id.slice(1)}
                whileHover={{ scale: 1.6 }}
                data-cursor="hover"
              />
            ))}
          </nav>

          <GrandCoverView />
          <ScrollyTimeline />
          <PinnedGallery />
          <BriefingView />
          <DeploymentView />
          <FlatLayView />
          <DeepParallaxView />
          <PolaroidCarousel />

          {/* Bottom Navigation */}
          <nav className="story-nav">
            <Link to="/" className="nav-btn prev" data-cursor="hover">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M11 4L6 9L11 14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Sebelumnya
            </Link>
            <span className="nav-sep">·</span>
            <Link to="/findings" className="nav-btn next" data-cursor="hover">
              Temuan Lapangan
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M7 4L12 9L7 14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </nav>
        </div>
      )}
    </>
  );
}

export default Journey;