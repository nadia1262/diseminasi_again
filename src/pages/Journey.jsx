/**
 * DRAFT AWAL
 * Journey.jsx
 * PKL 65 STIS Webstory 1: "Langkah di Balik Data"
 *
 * Filosofi: Dokumenter digital minimalis semi-formal · Living Journal
 *
 * Identitas Visual:
 * - Colors: Deep Navy #15173D · Cream #E5D9B6 · Orange #E67E22 · Green #628141
 * - Tipografi: Playfair Display (italic, judul) · Lato Light (isi, weight 300)
 *
 * Stack Teknis & Filosofi ReactBits:
 * - Framer Motion: Fisika pegas (stiffness: 100, damping: 30) & AnimatePresence
 * - Audio: Howler.js untuk latar suara suasana desa & pemutaran wawancara interaktif
 * - 3D: Titik fokus @splinetool/react-spline & interaksi foto kedalaman semu (fake-depth)
 * - Elemen: Custom Cursor (state-aware), Text Scramble (statistik), Tombol Navigasi Magnetik
 *
 * Arsitektur Tampilan (View Architecture):
 * - View 0: Grand Cover (Judul utama reaktif terhadap kursor - VariableProximity)
 * - View 1: Scrollytelling Timeline (Jalur SVG interaktif dengan titik yang menyala)
 * - View 2: Pinned Gallery (Pelatihan Teknis — Scroll horizontal lambat + geser manual)
 * - View 3: Briefing Pimpinan (Narasi word-fade sinematik & efek riak tombol)
 * - View 4: Deployment Map (Peta Sumatra SVG dengan animasi jalur terbang)
 * - View 5: Inti Lapangan (Papan Scrapbook + Wawancara Polaroid + Narasi scrollytelling)
 * - View 6: Amunisi Tempur (Kartu 3D Tilted dengan efek Spotlight & Laser Scan)
 * - View 7: Melawan Medan (3-Layer Deep Parallax — 0.2x bg / mist / 1.5x fg foto)
 * - View 8: Sehat & Solid (High-end Circular Carousel — Rotasi halus 15 kabupaten/kota)
 * - View 9: Visual Penutup (Particle Morphing Sand Dissolve + Judul Text Scramble)
 */

import { useRef, useState, useEffect, useCallback, useMemo, memo } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useSpring, useMotionValue, useInView, AnimatePresence, useAnimationFrame } from "framer-motion";
import { Volume2, VolumeX, Mic, Camera, MapPin, Play, Pause, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";
import { Howl } from "howler";
import "./Journey.css";

// ─── SPRING PHYSICS PRESETS (stiffness:100, damping:30 as spec'd) ────────────
const SPRING = { type: "spring", stiffness: 100, damping: 30 };
const SPRING_SNAP = { type: "spring", stiffness: 200, damping: 28 };
const EASE_SILK = [0.16, 1, 0.3, 1];

// ─── ANIMATION VARIANTS ───────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 52, filter: "blur(8px)" },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { delay: i * 0.14, duration: 0.9, ease: EASE_SILK },
  }),
};
const fadeIn = {
  hidden: { opacity: 0 },
  visible: (i = 0) => ({
    opacity: 1,
    transition: { delay: i * 0.1, duration: 0.7 },
  }),
};

// ─── TEXT SCRAMBLE HOOK (Abjad Morphing / ciridae.com philosophy) ────────────
function useTextScramble(finalText, trigger = true) {
  const [displayText, setDisplayText] = useState(finalText);
  const chars = "アイウエオカキクケコサシスセソタチツテトナニヌネノ!@#$%^&*░▒▓";

  useEffect(() => {
    if (!trigger) return;
    let frame = 0;
    const totalFrames = 22;
    const interval = setInterval(() => {
      frame++;
      if (frame >= totalFrames) {
        setDisplayText(finalText);
        clearInterval(interval);
        return;
      }
      const progress = frame / totalFrames;
      const result = finalText
        .split("")
        .map((char, i) => {
          if (char === " " || char === "\n" || char === ",") return char;
          if (i / finalText.length < progress) return char;
          return chars[Math.floor(Math.random() * chars.length)];
        })
        .join("");
      setDisplayText(result);
    }, 38);
    return () => clearInterval(interval);
  }, [finalText, trigger]);

  return displayText;
}

// ─── MAGNETIC BUTTON HOOK ────────────────────────────────────────────────────
function useMagnetic(strength = 0.35) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, SPRING);
  const sy = useSpring(y, SPRING);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const move = (e) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      x.set((e.clientX - cx) * strength);
      y.set((e.clientY - cy) * strength);
    };
    const reset = () => {
      x.set(0);
      y.set(0);
    };
    el.addEventListener("mousemove", move);
    el.addEventListener("mouseleave", reset);
    return () => {
      el.removeEventListener("mousemove", move);
      el.removeEventListener("mouseleave", reset);
    };
  }, [x, y, strength]);

  return { ref, style: { x: sx, y: sy } };
}

// ─── CUSTOM CURSOR ────────────────────────────────────────────────────────────
function CustomCursor() {
  const cx = useMotionValue(-100);
  const cy = useMotionValue(-100);
  const [state, setState] = useState("default");

  useEffect(() => {
    const move = (e) => {
      cx.set(e.clientX);
      cy.set(e.clientY);
    };
    window.addEventListener("mousemove", move);

    const attach = () => {
      document.querySelectorAll("[data-cursor='hover']").forEach((el) => {
        el.addEventListener("mouseenter", () => setState("hover"));
        el.addEventListener("mouseleave", () => setState("default"));
      });
      document.querySelectorAll("[data-cursor='drag']").forEach((el) => {
        el.addEventListener("mouseenter", () => setState("drag"));
        el.addEventListener("mouseleave", () => setState("default"));
      });
    };
    attach();
    const obs = new MutationObserver(attach);
    obs.observe(document.body, { childList: true, subtree: true });
    return () => {
      window.removeEventListener("mousemove", move);
      obs.disconnect();
    };
  }, []);

  const size = state === "hover" ? 44 : state === "drag" ? 56 : 18;
  const border = state === "hover" ? "#E67E22" : state === "drag" ? "#628141" : "#E5D9B6";
  const bg = state === "hover" ? "rgba(230,126,34,0.1)" : "transparent";

  return <motion.div className="j-cursor" style={{ x: cx, y: cy, translateX: "-50%", translateY: "-50%" }} animate={{ width: size, height: size, borderColor: border, background: bg }} transition={SPRING} />;
}

// ─── SCROLL PROGRESS BAR ──────────────────────────────────────────────────────
function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, SPRING);
  return <motion.div className="j-progress-bar" style={{ scaleX }} />;
}

// ─── GRAIN OVERLAY (film feel) ────────────────────────────────────────────────
const GrainOverlay = memo(() => <div className="j-grain" aria-hidden="true" />);

// ═══════════════════════════════════════════════════════════════════════════════
// LOADING SCREEN — Cream background, journalistic type reveal
// ═══════════════════════════════════════════════════════════════════════════════
function LoadingScreen({ progress }) {
  return (
    <motion.div className="j-loading" exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.8, ease: EASE_SILK }}>
      <GrainOverlay />
      <motion.div className="j-loading-inner" initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ ...SPRING, delay: 0.1 }}>
        <motion.div className="j-loading-badge" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2.2, repeat: Infinity }}>
          R3P
        </motion.div>
        <p className="j-loading-kicker">Memuat Cerita Perjalanan…</p>
        <div className="j-loading-bar-track">
          <motion.div className="j-loading-bar-fill" style={{ scaleX: progress / 100, transformOrigin: "left" }} transition={{ duration: 0.25 }} />
        </div>
        <span className="j-loading-pct">{progress}%</span>
      </motion.div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VIEW 0 — GRAND COVER
// ═══════════════════════════════════════════════════════════════════════════════
function GrandCoverView() {
  const ref = useRef(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smX = useSpring(mouseX, { stiffness: 55, damping: 20 });
  const smY = useSpring(mouseY, { stiffness: 55, damping: 20 });

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.65], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "28%"]);

  useEffect(() => {
    const fn = (e) => {
      mouseX.set((e.clientX / window.innerWidth - 0.5) * 2);
      mouseY.set((e.clientY / window.innerHeight - 0.5) * 2);
    };
    window.addEventListener("mousemove", fn);
    return () => window.removeEventListener("mousemove", fn);
  }, [mouseX, mouseY]);

  const titleX = useTransform(smX, (v) => v * -20);
  const titleY = useTransform(smY, (v) => v * -14);
  const subX = useTransform(smX, (v) => v * -9);
  const subY = useTransform(smY, (v) => v * -6);
  const photoX = useTransform(smX, (v) => v * 12);
  const photoY = useTransform(smY, (v) => v * 8);

  const [scrambleTrigger, setScrambleTrigger] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setScrambleTrigger(true), 900);
    return () => clearTimeout(t);
  }, []);
  const headline1 = useTextScramble("Misi R3P", scrambleTrigger);
  const headline2 = useTextScramble("2026", scrambleTrigger);

  const meta = [
    { n: "510", l: "Mahasiswa" },
    { n: "3", l: "Provinsi" },
    { n: "21", l: "Hari Lapangan" },
    { n: "57", l: "PML" },
  ];

  const pathLength = useSpring(useTransform(scrollYProgress, [0, 0.9], [0, 1]), { stiffness: 70, damping: 22 });

  return (
    <section className="j-view j-view-0" ref={ref} id="cover">
      <motion.div className="j-cover-photo" style={{ x: photoX, y: photoY, scale: heroScale }}>
        <img src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1800&fit=crop&crop=faces" alt="Tim R3P 2026" />
      </motion.div>

      <div className="j-cover-overlay-grad" />
      <div className="j-cover-overlay-vig" />
      <GrainOverlay />

      <motion.div className="j-cover-content" style={{ y: contentY, opacity: heroOpacity }}>
        <motion.div className="j-cover-badge-row" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.9, ease: EASE_SILK }}>
          <span className="j-badge">PKL POLSTAT STIS</span>
          <span className="j-badge-sep">·</span>
          <span className="j-badge">Angkatan 65</span>
        </motion.div>

        <motion.div style={{ x: titleX, y: titleY }}>
          <motion.h1 className="j-cover-headline" initial={{ opacity: 0, y: 56 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 1.1, ease: EASE_SILK }}>
            {headline1}
            <br />
            <span className="j-cover-hl-accent">{headline2}</span>
          </motion.h1>
        </motion.div>

        <motion.div style={{ x: subX, y: subY }}>
          <motion.p className="j-cover-subline" initial={{ opacity: 0, y: 36 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1, duration: 1, ease: EASE_SILK }}>
            Sebuah Perjalanan
          </motion.p>
          <motion.p className="j-cover-descriptor" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5, duration: 0.8 }}>
            Pendataan Regsosek · Rehabilitasi · Rekonstruksi Pasca Bencana
          </motion.p>
        </motion.div>

        <motion.div className="j-cover-meta" initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.09, delayChildren: 1.8 } } }}>
          {meta.map((m, i) => (
            <motion.div key={i} className="j-cover-chip" variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.65, ease: EASE_SILK }}>
              <span className="j-chip-num">{m.n}</span>
              <span className="j-chip-label">{m.l}</span>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Benang merah animated thread */}
      <div className="j-benang-wrap" aria-hidden="true">
        <svg viewBox="0 0 24 120" className="j-benang-svg" overflow="visible">
          <defs>
            <filter id="bGlow">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <path d="M12,0 C12,30 4,45 8,65 C12,85 20,95 12,120" stroke="rgba(230,126,34,0.2)" strokeWidth="1.5" fill="none" />
          <motion.path d="M12,0 C12,30 4,45 8,65 C12,85 20,95 12,120" stroke="#E67E22" strokeWidth="2" fill="none" strokeLinecap="round" style={{ pathLength, filter: "url(#bGlow)" }} />
          <motion.circle r="4" fill="#E67E22" filter="url(#bGlow)">
            <animateMotion dur="2.5s" repeatCount="indefinite" path="M12,0 C12,30 4,45 8,65 C12,85 20,95 12,120" />
          </motion.circle>
        </svg>
      </div>

      <RotatingScrollCue />

      <motion.div className="j-cover-caption" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5, duration: 1.2 }} style={{ opacity: heroOpacity }}>
        Angkatan 65 · 14 Jan – 2 Feb 2026 · Sumatera
      </motion.div>
    </section>
  );
}

function RotatingScrollCue() {
  const text = "SCROLL TO EXPLORE · SCROLL TO EXPLORE · ";
  const r = 38;
  return (
    <motion.div className="j-scroll-cue" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.3, duration: 0.9, ease: EASE_SILK }}>
      <motion.svg viewBox="0 0 100 100" className="j-scroll-cue-ring" animate={{ rotate: 360 }} transition={{ duration: 16, repeat: Infinity, ease: "linear" }}>
        <defs>
          <path id="cueCircle" d={`M50,50 m-${r},0 a${r},${r} 0 1,1 ${r * 2},0 a${r},${r} 0 1,1 -${r * 2},0`} />
        </defs>
        <text fontSize="8.5" fill="rgba(229,217,182,0.55)" letterSpacing="3" fontFamily="'Lato', sans-serif" fontWeight="300">
          <textPath href="#cueCircle">{text}</textPath>
        </text>
      </motion.svg>
      <div className="j-scroll-mouse">
        <motion.div className="j-scroll-wheel" animate={{ y: [0, 6, 0], opacity: [1, 0.3, 1] }} transition={{ duration: 1.7, repeat: Infinity, ease: "easeInOut" }} />
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VIEW 1 — SCROLLYTELLING TIMELINE
// ═══════════════════════════════════════════════════════════════════════════════
const TIMELINE_EVENTS = [
  { date: "14 Jan", label: "Pembukaan & Pengarahan Umum", info: "Seluruh 510 mahasiswa berkumpul di Aula STIS untuk pembukaan resmi program R3P 2026.", icon: "🎓", color: "#E67E22", side: "right" },
  { date: "15–17 Jan", label: "Pelatihan Teknis Intensif", info: "3 hari pelatihan intensif: metodologi R3P, sistem CAPI, teknik wawancara, dan kuesioner.", icon: "📊", color: "#628141", side: "left" },
  { date: "18 Jan", label: "Briefing Kepala BPS RI", info: "Arahan langsung dari Kepala BPS RI tentang pentingnya misi dan standar integritas data.", icon: "🏛️", color: "#628141", side: "right" },
  { date: "19 Jan", label: "Deployment ke 3 Provinsi", info: "510 mahasiswa diterbangkan ke Aceh, Sumatera Utara, dan Sumatera Barat.", icon: "✈️", color: "#15173D", side: "left" },
  { date: "20 Jan – 1 Feb", label: "Pendataan Lapangan R3P", info: "21 hari di lapangan: wawancara KK terdampak, verifikasi lokasi, dan rekap harian.", icon: "🗺️", color: "#E67E22", side: "right" },
  { date: "2 Feb", label: "Penarikan & Laporan Akhir", info: "Mahasiswa kembali ke Jakarta. Laporan akhir diserahkan kepada BPS RI dalam 7 hari.", icon: "📋", color: "#628141", side: "left" },
];

function TLNode({ ev, i, activeIdx }) {
  const ref = useRef(null);
  const isActive = activeIdx === i;
  const mag = useMagnetic(0.28);

  const card = (
    <motion.div
      className="j-tl-card"
      initial={{ opacity: 0, x: ev.side === "left" ? -48 : 48, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
      transition={{ ...SPRING, delay: 0.06 }}
      viewport={{ once: true, margin: "-15% 0px" }}
      style={{ "--accent": ev.color }}
    >
      <span className="j-tl-date">{ev.date}</span>
      <h3 className="j-tl-label">{ev.label}</h3>
      <p className="j-tl-info">{ev.info}</p>
      <div className="j-tl-accent-bar" style={{ background: ev.color }} />
    </motion.div>
  );

  return (
    <div
      className="j-tl-row"
      ref={(el) => {
        if (el) ref.current = el;
      }}
    >
      <div className="j-tl-slot j-tl-left">{ev.side === "left" && card}</div>
      <div className="j-tl-center-col">
        <motion.div
          className="j-tl-node"
          ref={mag.ref}
          style={{ ...mag.style, background: ev.color }}
          animate={{ scale: isActive ? 1.25 : 1, boxShadow: isActive ? `0 0 0 6px ${ev.color}28, 0 0 24px ${ev.color}40` : "none" }}
          transition={SPRING}
          whileHover={{ scale: 1.2 }}
        >
          <span className="j-tl-icon">{ev.icon}</span>
        </motion.div>
      </div>
      <div className="j-tl-slot j-tl-right">{ev.side === "right" && card}</div>
    </div>
  );
}

function ScrollyTimeline() {
  const ref = useRef(null);
  const nodeRefs = useRef([]);
  const [activeIdx, setActiveIdx] = useState(-1);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.9", "end 0.1"] });
  const pathLength = useSpring(scrollYProgress, { stiffness: 65, damping: 22 });

  useEffect(() => {
    const observers = TIMELINE_EVENTS.map((_, i) => {
      const el = nodeRefs.current[i];
      if (!el) return null;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveIdx(i);
        },
        { rootMargin: "-40% 0px -40% 0px" },
      );
      obs.observe(el);
      return obs;
    });
    return () => observers.forEach((o) => o?.disconnect());
  }, []);

  return (
    <section className="j-view j-view-1" ref={ref} id="timeline">
      <div className="j-view-inner">
        <div className="j-section-header center">
          <motion.span className="j-kicker" variants={fadeIn} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            Linimasa Kegiatan
          </motion.span>
          <motion.h2 className="j-headline" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            Sebuah <em>Perjalanan</em>
          </motion.h2>
          <motion.p className="j-sub" variants={fadeUp} custom={1} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            510 mahasiswa · 3 provinsi · 21 hari di lapangan
          </motion.p>
        </div>

        <div className="j-tl-body">
          <div className="j-tl-path-col" aria-hidden="true">
            <svg className="j-tl-path-svg" viewBox="0 0 20 600" preserveAspectRatio="none">
              <defs>
                <filter id="tlGlow">
                  <feGaussianBlur stdDeviation="2.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <linearGradient id="tlGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#E67E22" />
                  <stop offset="50%" stopColor="#628141" />
                  <stop offset="100%" stopColor="#15173D" />
                </linearGradient>
              </defs>
              <line x1="10" y1="0" x2="10" y2="600" stroke="rgba(21,23,61,0.12)" strokeWidth="1.5" />
              <motion.line x1="10" y1="0" x2="10" y2="600" stroke="url(#tlGrad)" strokeWidth="2" filter="url(#tlGlow)" style={{ scaleY: pathLength, transformOrigin: "10px 0px" }} />
            </svg>
          </div>

          <div className="j-tl-events">
            {TIMELINE_EVENTS.map((ev, i) => (
              <div key={i} ref={(el) => (nodeRefs.current[i] = el)}>
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
// VIEW 2 — PINNED PHOTO GALLERY
// ═══════════════════════════════════════════════════════════════════════════════
const TRAINING_PHOTOS = [
  { src: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=700&fit=crop", caption: "Orientasi Awal & Pengantar Metodologi R3P", day: "Hari 1" },
  { src: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=600&h=700&fit=crop", caption: "Workshop CAPI & Pengisian Kuesioner Digital", day: "Hari 1" },
  { src: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=600&h=700&fit=crop", caption: "Simulasi Wawancara & Role-play Enumerator", day: "Hari 2" },
  { src: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&h=700&fit=crop", caption: "Diskusi Teknis dengan Supervisor BPS Daerah", day: "Hari 2" },
  { src: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=700&fit=crop", caption: "Evaluasi & Persiapan Akhir Keberangkatan", day: "Hari 3" },
];

function Photo3D({ photo, i, containerRef }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotX = useSpring(useTransform(mouseY, [-1, 1], [12, -12]), SPRING);
  const rotY = useSpring(useTransform(mouseX, [-1, 1], [-12, 12]), SPRING);
  const z = useSpring(useMotionValue(0), SPRING);
  const [flipped, setFlipped] = useState(false);
  const [hovered, setHovered] = useState(false);

  const drag = {
    x: useMotionValue(0),
    y: useMotionValue(0),
    rotate: useMotionValue(((i % 3) - 1) * 5),
  };

  const handleMouseMove = useCallback(
    (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      mouseX.set(((e.clientX - rect.left) / rect.width) * 2 - 1);
      mouseY.set(((e.clientY - rect.top) / rect.height) * 2 - 1);
    },
    [mouseX, mouseY],
  );

  return (
    <motion.div
      className="j-photo-wrapper"
      drag
      dragConstraints={containerRef}
      dragElastic={0.1}
      dragMomentum
      style={{ x: drag.x, y: drag.y, perspective: 800 }}
      whileDrag={{ scale: 1.05, zIndex: 20 }}
      onMouseMove={handleMouseMove}
      onHoverStart={() => {
        setHovered(true);
        z.set(30);
      }}
      onHoverEnd={() => {
        setHovered(false);
        z.set(0);
        mouseX.set(0);
        mouseY.set(0);
      }}
      data-cursor="drag"
    >
      <motion.div
        className="j-photo-card"
        animate={{ rotateY: flipped ? 180 : 0 }}
        style={{ rotateX: hovered ? rotX : 0, rotateY: flipped ? 180 : hovered ? rotY : 0, z, rotate: drag.rotate, transformStyle: "preserve-3d" }}
        transition={flipped ? SPRING : undefined}
        onClick={() => setFlipped((f) => !f)}
      >
        <div className="j-photo-face j-photo-front">
          <span className="j-photo-num">{String(i + 1).padStart(2, "0")}</span>
          <span className="j-photo-day">{photo.day}</span>
          <img src={photo.src} alt={photo.caption} loading="lazy" />
          <div className="j-photo-hint">Klik untuk caption · Drag untuk pindah</div>
          <div className="j-photo-depth-shadow" />
        </div>
        <div className="j-photo-face j-photo-back">
          <span className="j-photo-day-back">{photo.day}</span>
          <p className="j-photo-caption">{photo.caption}</p>
          <div className="j-photo-back-deco" aria-hidden="true" />
        </div>
      </motion.div>
    </motion.div>
  );
}

function PinnedGallery() {
  const sectionRef = useRef(null);
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], ["0%", `-${(TRAINING_PHOTOS.length - 1) * 22}%`]);
  const xSpring = useSpring(x, { stiffness: 75, damping: 24 });
  const progress = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section className="j-view j-view-2" ref={sectionRef} id="gallery">
      <div className="j-view-2-sticky">
        <div className="j-view-2-header">
          <motion.span className="j-kicker" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            Tahap 1 · Pelatihan Teknis
          </motion.span>
          <motion.h2 className="j-headline" initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} transition={SPRING} viewport={{ once: true }}>
            Ditempa Sebelum <em>Diterjunkan</em>
          </motion.h2>
          <p className="j-sub">Scroll untuk jelajahi · Drag foto untuk lempar · Klik untuk balik</p>
        </div>

        <div className="j-gallery-overflow" ref={containerRef}>
          <motion.div className="j-gallery-track" style={{ x: xSpring }}>
            {TRAINING_PHOTOS.map((p, i) => (
              <Photo3D key={i} photo={p} i={i} containerRef={containerRef} />
            ))}
          </motion.div>
        </div>

        <div className="j-gallery-progress-track">
          <motion.div className="j-gallery-progress-fill" style={{ width: progress }} />
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VIEW 3 — BRIEFING PIMPINAN
// ═══════════════════════════════════════════════════════════════════════════════
const QUOTE_WORDS = ["Kalian", "bukan", "sekadar", "mahasiswa", "yang", "PKL.", "Kalian", "adalah", "perpanjangan", "tangan", "negara", "dalam", "memastikan", "data", "yang", "akurat", "untuk", "pemulihan", "yang", "nyata."];

const PILLARS = [
  { n: "01", title: "Akurasi Data", desc: "Standar pengumpulan tertinggi — zero tolerance terhadap kesalahan entry maupun interpretasi.", color: "#E67E22" },
  { n: "02", title: "Kepercayaan Publik", desc: "BPS sebagai institusi terpercaya bangsa. Setiap data menjadi dasar kebijakan pemulihan.", color: "#628141" },
  { n: "03", title: "Integritas Penuh", desc: "Tidak ada kompromi di lapangan. Kejujuran adalah satu-satunya standar yang berlaku.", color: "#E5D9B6" },
];

function WordFade({ words }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-12% 0px" });

  return (
    <p ref={ref} className="j-word-fade" aria-label={words.join(" ")}>
      {words.map((w, i) => (
        <motion.span key={i} className="j-word-unit" initial={{ opacity: 0, y: 20, filter: "blur(5px)" }} animate={isInView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}} transition={{ delay: i * 0.05, duration: 0.65, ease: EASE_SILK }}>
          {w}&nbsp;
        </motion.span>
      ))}
    </p>
  );
}

function BriefingView() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const imgY = useSpring(useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]), SPRING);
  const particleY = useTransform(scrollYProgress, [0, 1], ["0%", "-18%"]);

  return (
    <section className="j-view j-view-3" ref={ref} id="briefing">
      <GrainOverlay />

      <motion.div className="j-v3-particles" style={{ y: particleY }} aria-hidden="true">
        {Array.from({ length: 18 }).map((_, i) => (
          <motion.div
            key={i}
            className="j-v3-particle"
            style={{ left: `${(i * 5.5 + (i % 7) * 8) % 100}%`, top: `${(i * 12 + (i % 5) * 14) % 100}%`, width: `${1 + (i % 3)}px`, height: `${1 + (i % 3)}px`, opacity: 0.08 + (i % 5) * 0.05 }}
            animate={{ y: [0, -(18 + (i % 6) * 9), 0], opacity: [0.08 + (i % 5) * 0.05, 0.3 + (i % 4) * 0.08, 0.08 + (i % 5) * 0.05] }}
            transition={{ duration: 4 + (i % 6) * 1.2, repeat: Infinity, delay: (i % 8) * 0.6, ease: "easeInOut" }}
          />
        ))}
      </motion.div>

      <div className="j-view-inner j-v3-inner">
        <motion.div className="j-section-header center" variants={{ visible: { transition: { staggerChildren: 0.12 } } }} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <motion.span className="j-kicker j-kicker-light" variants={fadeIn}>
            Tahap 2 · Briefing Pimpinan
          </motion.span>
          <motion.h2 className="j-headline j-headline-light" variants={fadeUp}>
            Amanat dari <em>Kepala BPS RI</em>
          </motion.h2>
        </motion.div>

        <motion.div className="j-v3-video" initial={{ opacity: 0, y: 48, scale: 0.96 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} transition={{ ...SPRING, delay: 0.2 }} viewport={{ once: true }}>
          <div className="j-v3-video-mask">
            <motion.div className="j-v3-video-img-wrap" style={{ y: imgY }}>
              <img src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200&h=680&fit=crop" alt="Briefing Kepala BPS RI" />
              <div className="j-v3-scanlines" aria-hidden="true" />
            </motion.div>
            <div className="j-v3-vignette" />
            <div className="j-v3-play-center">
              <motion.div className="j-play-btn" whileHover={{ scale: 1.1 }} transition={SPRING} data-cursor="hover">
                {[0, 1, 2].map((i) => (
                  <motion.div key={i} className="j-play-ripple" animate={{ scale: [1, 2.6], opacity: [0.3, 0] }} transition={{ duration: 2.4, delay: i * 0.8, repeat: Infinity, ease: "easeOut" }} />
                ))}
                <div className="j-play-core">
                  <Play size={22} fill="white" color="white" />
                </div>
              </motion.div>
            </div>
            <div className="j-v3-badge">● SEGERA HADIR</div>
          </div>
          <div className="j-v3-meta">
            <span className="j-v3-meta-dot" />
            <span className="j-v3-meta-text">18 Januari 2026 · Aula STIS Jakarta · Kepala BPS RI</span>
          </div>
        </motion.div>

        <div className="j-v3-quote-wrap">
          <div className="j-v3-quote-mark">"</div>
          <WordFade words={QUOTE_WORDS} />
          <p className="j-v3-attribution">— Kepala BPS RI, Arahan R3P 2026</p>
        </div>

        <div className="j-pillar-grid">
          {PILLARS.map((p, i) => (
            <motion.div
              key={i}
              className="j-pillar-card"
              initial={{ opacity: 0, y: 36 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ ...SPRING, delay: i * 0.13 }}
              viewport={{ once: true }}
              whileHover={{ y: -6, scale: 1.02 }}
              style={{ "--p-color": p.color }}
              data-cursor="hover"
            >
              <span className="j-pillar-num">{p.n}</span>
              <h3 className="j-pillar-title">{p.title}</h3>
              <p className="j-pillar-desc">{p.desc}</p>
              <div className="j-pillar-bar" style={{ background: p.color }} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VIEW 4 — DEPLOYMENT MAP
// ═══════════════════════════════════════════════════════════════════════════════
const SUMATRA_PATH = `
  M185,18 C190,20 198,22 205,28 C215,36 222,42 230,48 C238,54 245,58 248,65
  C251,72 249,80 245,88 C241,96 235,102 232,110 C229,118 228,126 230,134
  C232,142 238,148 242,156 C246,164 248,172 245,180 C242,188 235,194 228,200
  C221,206 213,210 206,216 C199,222 193,230 188,238 C183,246 179,254 176,262
  C173,270 171,278 170,286 C169,294 169,302 170,310 C171,318 173,326 176,332
  C179,338 184,342 188,348 C192,354 195,362 195,370 C195,378 192,386 188,392
  C184,398 178,402 173,408 C168,414 164,422 162,430 C160,438 161,446 163,452
  C165,458 170,462 173,468 C176,474 178,480 178,488 C178,496 176,504 172,510
  C168,516 162,520 156,524 C150,528 143,530 136,532 C129,534 122,534 116,530
  C110,526 105,518 100,512 C95,506 90,500 84,496 C78,492 71,490 65,488
  C59,486 53,486 48,482 C43,478 39,472 36,466 C33,460 31,453 30,446
  C29,439 29,432 30,426 C31,420 33,414 36,408 C39,402 43,397 46,390
  C49,383 51,376 52,368 C53,360 53,352 52,344 C51,336 48,328 46,321
  C44,314 43,307 43,300 C43,293 44,286 46,280 C48,274 51,268 54,262
  C57,256 60,250 62,244 C64,238 65,231 65,224 C65,217 64,210 62,204
  C60,198 57,192 55,186 C53,180 52,173 52,166 C52,159 53,152 55,146
  C57,140 60,134 63,128 C66,122 70,116 74,112 C78,108 83,105 88,102
  C93,99 98,97 104,94 C110,91 117,88 123,84 C129,80 135,75 140,70
  C145,65 149,59 153,54 C157,49 160,43 163,38 C166,33 169,28 172,24
  C175,20 179,17 185,18 Z
`;

const PROVINCES = [
  {
    id: "aceh",
    name: "Aceh",
    color: "#628141",
    path: "M178,22 C185,20 194,24 200,30 C208,38 212,48 210,58 C208,68 200,75 192,80 C184,85 175,87 168,84 C161,81 156,74 154,66 C152,58 154,49 158,42 C162,35 170,24 178,22 Z",
    cx: 182,
    cy: 52,
    mahasiswa: 185,
    pml: 20,
    kab: "7",
    detail: "Koordinator: Kanwil BPS Aceh · 7 kabupaten terdampak",
  },
  {
    id: "sumut",
    name: "Sumatera Utara",
    color: "#E67E22",
    path: "M185,88 C195,84 208,86 218,92 C228,98 235,108 232,120 C229,132 218,140 206,144 C194,148 181,146 172,138 C163,130 160,117 164,106 C168,95 175,92 185,88 Z",
    cx: 196,
    cy: 116,
    mahasiswa: 195,
    pml: 22,
    kab: "8",
    detail: "Koordinator: Kanwil BPS Sumut · 8 kabupaten terdampak",
  },
  {
    id: "sumbar",
    name: "Sumatera Barat",
    color: "#15173D",
    path: "M155,168 C165,162 178,162 188,168 C198,174 204,186 202,198 C200,210 190,219 178,222 C166,225 153,220 147,210 C141,200 142,186 148,178 C151,174 153,170 155,168 Z",
    cx: 175,
    cy: 193,
    mahasiswa: 130,
    pml: 15,
    kab: "6",
    detail: "Koordinator: Kanwil BPS Sumbar · 6 kabupaten terdampak",
  },
];

const AMUNISI = [
  { id: 1, title: "CAPI (Smartphone)", desc: "Senjata utama untuk input data Regsosek secara real-time dan akurat.", icon: "📱", color: "#E67E22" },
  { id: 2, title: "Sepatu Boots", desc: "Pelindung setia saat menerjang lumpur dan medan terjal di pedalaman.", icon: "🥾", color: "#628141" },
  { id: 3, title: "Buku Catatan", desc: "Tempat merekam detail penting yang tak tertangkap oleh kuesioner digital.", icon: "📓", color: "#15173D" },
  { id: 4, title: "Tas Lapangan", desc: "Menyimpan seluruh amunisi agar tetap aman dari hujan dan cuaca ekstrem.", icon: "🎒", color: "#E67E22" },
];

const ORIGIN = { x: 310, y: 420 };

function FlightArc({ from, to, color, delay, inView }) {
  const mid = { x: (from.x + to.x) / 2 - 30, y: (from.y + to.y) / 2 - 40 };
  const d = `M${from.x},${from.y} Q${mid.x},${mid.y} ${to.x},${to.y}`;
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!inView) return;
    const t = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(t);
  }, [inView, delay]);

  return (
    <g>
      <path d={d} stroke={`${color}30`} strokeWidth="1.5" fill="none" strokeDasharray="4 4" />
      {started && <motion.path d={d} stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" initial={{ pathLength: 0, opacity: 0.9 }} animate={{ pathLength: 1, opacity: 0.9 }} transition={{ duration: 1.4, ease: EASE_SILK }} />}
      {started && (
        <motion.circle r="4" fill={color} filter="url(#mapGlow)" initial={{ offsetDistance: "0%" }} animate={{ offsetDistance: "100%" }} transition={{ duration: 1.4, ease: EASE_SILK, delay: 0.05 }} style={{ offsetPath: `path('${d}')` }} />
      )}
    </g>
  );
}

function SumatraMap() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-10% 0px" });
  const [active, setActive] = useState(null);
  const [mapKey, setMapKey] = useState(0);

  useEffect(() => {
    if (isInView) setMapKey((k) => k + 1);
  }, [isInView]);

  return (
    <div className="j-map-wrap" ref={ref}>
      <svg className="j-map-svg" viewBox="0 0 420 550" aria-label="Peta deployment Sumatera">
        <defs>
          <filter id="mapGlow">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="oceanGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c8dcea" />
            <stop offset="100%" stopColor="#b0c8da" />
          </linearGradient>
        </defs>
        <rect width="420" height="550" fill="url(#oceanGrad)" rx="12" />
        <path d={SUMATRA_PATH} fill="#c8d8c0" stroke="white" strokeWidth="1" />

        {PROVINCES.map((p) => {
          const isAct = active === p.id;
          return (
            <motion.g key={p.id}>
              <motion.path
                d={p.path}
                fill={p.color}
                stroke="white"
                strokeWidth={isAct ? 2.5 : 1.5}
                style={{ cursor: "pointer", transformOrigin: `${p.cx}px ${p.cy}px` }}
                animate={{ fillOpacity: isAct ? 1 : 0.82, scale: isAct ? 1.04 : 1 }}
                transition={SPRING}
                onClick={() => setActive((a) => (a === p.id ? null : p.id))}
                onHoverStart={() => setActive(p.id)}
                onHoverEnd={() => setActive(null)}
                data-cursor="hover"
              />
            </motion.g>
          );
        })}

        {PROVINCES.map((p) => (
          <text key={`lbl-${p.id}`} x={p.cx} y={p.cy + 4} textAnchor="middle" fill="white" fontSize="7" fontFamily="'Lato', sans-serif" fontWeight="700" letterSpacing="0.5" pointerEvents="none">
            {p.name.toUpperCase()}
          </text>
        ))}

        <g>
          <motion.circle cx={ORIGIN.x} cy={ORIGIN.y} r={7} fill="#E67E22" stroke="white" strokeWidth="2" animate={{ r: [7, 10, 7] }} transition={{ duration: 2, repeat: Infinity }} filter="url(#mapGlow)" />
          <text x={ORIGIN.x} y={ORIGIN.y + 18} textAnchor="middle" fill="#E67E22" fontSize="6.5" fontFamily="'Lato', sans-serif" fontWeight="700">
            JAKARTA (STIS)
          </text>
        </g>

        {PROVINCES.map((p, i) => (
          <FlightArc key={`${mapKey}-${p.id}`} from={ORIGIN} to={{ x: p.cx, y: p.cy }} color={p.color} delay={i * 400} inView={isInView} />
        ))}

        {PROVINCES.map(
          (p, i) =>
            isInView && (
              <motion.circle
                key={`pulse-${mapKey}-${p.id}`}
                cx={p.cx}
                cy={p.cy}
                fill="none"
                stroke={p.color}
                strokeWidth="1.5"
                initial={{ r: 8, opacity: 0.8 }}
                animate={{ r: [8, 28, 8], opacity: [0.8, 0, 0.8] }}
                transition={{ delay: 1.8 + i * 0.5, duration: 2.8, repeat: Infinity, repeatDelay: 3, ease: "easeOut" }}
              />
            ),
        )}
      </svg>

      <AnimatePresence>
        {active &&
          (() => {
            const p = PROVINCES.find((pp) => pp.id === active);
            return (
              <motion.div className="j-map-panel" key={active} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={SPRING}>
                <div className="j-panel-bar" style={{ background: p.color }} />
                <div className="j-panel-body">
                  <h3 className="j-panel-name">{p.name}</h3>
                  <p className="j-panel-detail">{p.detail}</p>
                  <div className="j-panel-stats">
                    <div className="j-pstat">
                      <span className="j-pstat-n">{p.mahasiswa}</span>
                      <span className="j-pstat-l">Mahasiswa</span>
                    </div>
                    <div className="j-pstat">
                      <span className="j-pstat-n">{p.pml}</span>
                      <span className="j-pstat-l">PML</span>
                    </div>
                    <div className="j-pstat">
                      <span className="j-pstat-n">{p.kab}</span>
                      <span className="j-pstat-l">Kab/Kota</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })()}
      </AnimatePresence>
    </div>
  );
}

function DeploymentView() {
  return (
    <section className="j-view j-view-4" id="deployment">
      <div className="j-view-inner j-v4-inner">
        <div className="j-v4-header">
          <motion.span className="j-kicker" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            Tahap 3 · Deployment
          </motion.span>
          <motion.h2 className="j-headline" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            Tiga Provinsi, <em>Satu Semangat</em>
          </motion.h2>
          <motion.p className="j-sub" variants={fadeUp} custom={1} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            Klik provinsi untuk detail lengkap. Jalur animasi = rute penerbangan dari Jakarta.
          </motion.p>
        </div>

        <div className="j-v4-grid">
          <SumatraMap />
          <div className="j-v4-stats">
            {[
              { n: "510", l: "Mahasiswa STIS" },
              { n: "57", l: "Pengawas Lapangan" },
              { n: "21", l: "Hari di Lapangan" },
            ].map((s, i) => (
              <motion.div key={i} className="j-mega-stat" initial={{ opacity: 0, y: 36 }} whileInView={{ opacity: 1, y: 0 }} transition={{ ...SPRING, delay: i * 0.12 }} viewport={{ once: true }}>
                <span className="j-mega-num">{s.n}</span>
                <span className="j-mega-label">{s.l}</span>
              </motion.div>
            ))}

            <div className="j-v4-legend">
              {PROVINCES.map((p, i) => (
                <motion.div key={p.id} className="j-legend-row" initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ ...SPRING, delay: i * 0.1 }} viewport={{ once: true }}>
                  <div className="j-legend-dot" style={{ background: p.color }} />
                  <span className="j-legend-name">{p.name}</span>
                  <span className="j-legend-count">
                    {p.mahasiswa} mhs · {p.pml} PML
                  </span>
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
// VIEW 5 — INTI LAPANGAN
// ═══════════════════════════════════════════════════════════════════════════════
let SplineComponent = null;
async function loadSpline() {
  if (!SplineComponent) {
    try {
      const mod = await import("@splinetool/react-spline");
      SplineComponent = mod.default;
    } catch {
      SplineComponent = null;
    }
  }
  return SplineComponent;
}

function Spline3DFocal({ splineUrl }) {
  const [Spline, setSpline] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const mag = useMagnetic(0.15);

  useEffect(() => {
    loadSpline()
      .then((S) => setSpline(() => S))
      .catch(() => setError(true));
  }, []);

  if (error || !splineUrl) {
    return (
      <motion.div className="j-spline-placeholder" ref={mag.ref} style={mag.style} whileHover={{ rotateY: 8, rotateX: -4 }} transition={SPRING}>
        <div className="j-spline-inner">
          <div className="j-spline-notebook">
            <div className="j-nb-cover">
              <span className="j-nb-title">Field Journal</span>
              <span className="j-nb-sub">PKL 65 · R3P 2026</span>
              <div className="j-nb-lines">
                {Array.from({ length: 7 }).map((_, i) => (
                  <motion.div key={i} className="j-nb-line" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.3 + i * 0.07, duration: 0.5, ease: EASE_SILK }} />
                ))}
              </div>
              <div className="j-nb-stamp">PKL</div>
            </div>
            <div className="j-nb-spine" />
          </div>
          <p className="j-spline-hint">3D Scene · Spline URL akan dikonfigurasi</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div className="j-spline-wrap" ref={mag.ref} style={mag.style}>
      <AnimatePresence>
        {!loaded && (
          <motion.div className="j-spline-loading" exit={{ opacity: 0 }}>
            <motion.div className="j-spline-loader" animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }} />
          </motion.div>
        )}
      </AnimatePresence>
      {Spline && <Spline scene={splineUrl} onLoad={() => setLoaded(true)} />}
    </motion.div>
  );
}

const createAmbient = () => new Howl({ src: ["https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"], loop: true, volume: 0, html5: true });
const createInterview = () => new Howl({ src: ["https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"], volume: 0.7, html5: true });

const SCRAPBOOK = [
  {
    id: "enum",
    src: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&h=480&fit=crop",
    caption: "Tiba di rumah warga — data menanti",
    label: "📋 Enumerasi",
    rotate: -4.5,
    tape: "top-left",
    hasInterview: true,
    quote: '"Kami mengetuk pintu, bukan sekadar untuk mengisi formulir — tapi untuk mendengar cerita yang tersembunyi di balik angka."',
  },
  { id: "wrg", src: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=480&fit=crop", caption: "Suara warga yang menanti pemulihan", label: "🎙 Wawancara", rotate: 3.2, tape: "top-right", hasInterview: false, quote: "" },
  { id: "data", src: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=480&fit=crop", caption: "Realitas direkam dengan presisi", label: "📊 Data", rotate: -2.1, tape: "top-left", hasInterview: false, quote: "" },
  {
    id: "gang",
    src: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&h=480&fit=crop",
    caption: "Menyusuri tiap gang & lorong kampung",
    label: "🏘 Lapangan",
    rotate: 5.8,
    tape: "top-center",
    hasInterview: false,
    quote: "",
  },
];

const TAPE_COLORS = ["#F5D08A", "#f4bfc9", "#a8d4f0", "#b4e0b4"];

const NARRATION_BEATS = [
  { id: "b1", text: "Data dimulai dari lapangan.", sub: "Di sini, di depan pintu-pintu yang belum pernah diketuk sebelumnya." },
  { id: "b2", text: "Bukan sekadar angka, tapi suara warga yang menanti pemulihan.", sub: "Setiap jawaban adalah harapan yang dicatat, diukur, diperjuangkan." },
  { id: "b3", text: "510 Mahasiswa menyusuri tiap gang, merekam realitas dengan presisi.", sub: "Selama 21 hari, kami adalah jembatan antara desa dan kebijakan." },
];

function WashiTape({ pos, color }) {
  const styles = {
    "top-left": { top: -12, left: 10, transform: "rotate(-8deg)" },
    "top-right": { top: -12, right: 10, transform: "rotate(8deg)" },
    "top-center": { top: -12, left: "50%", transform: "translateX(-50%) rotate(-3deg)" },
  };
  return <div className="j-washi" style={{ background: color, ...styles[pos] }} aria-hidden="true" />;
}

function ScrapPolaroid({ p, idx, onInterview, isPlaying }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-10% 0px" });
  const [hovered, setHovered] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotX = useSpring(useTransform(mouseY, [-1, 1], [8, -8]), SPRING);
  const rotY = useSpring(useTransform(mouseX, [-1, 1], [-8, 8]), SPRING);

  const handleMove = useCallback(
    (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      mouseX.set(((e.clientX - rect.left) / rect.width) * 2 - 1);
      mouseY.set(((e.clientY - rect.top) / rect.height) * 2 - 1);
    },
    [mouseX, mouseY],
  );

  return (
    <motion.div
      ref={ref}
      className="j-scrap-polaroid"
      style={{ "--rot": `${p.rotate}deg`, perspective: 600 }}
      initial={{ opacity: 0, y: 60, rotate: p.rotate * 2 }}
      animate={isInView ? { opacity: 1, y: 0, rotate: p.rotate } : {}}
      transition={{ ...SPRING, delay: idx * 0.14 }}
      whileHover={{ scale: 1.05, rotate: 0, zIndex: 20 }}
      onMouseMove={handleMove}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => {
        setHovered(false);
        mouseX.set(0);
        mouseY.set(0);
      }}
      data-cursor="hover"
    >
      <WashiTape pos={p.tape} color={TAPE_COLORS[idx % TAPE_COLORS.length]} />
      <motion.div className="j-scrap-frame" style={{ rotateX: hovered ? rotX : 0, rotateY: hovered ? rotY : 0, transformStyle: "preserve-3d" }}>
        <div className="j-scrap-img-wrap">
          <img src={p.src} alt={p.caption} loading="lazy" />
          <div className="j-scrap-grain" aria-hidden="true" />
          <div className="j-scrap-vig" aria-hidden="true" />
          {p.hasInterview && (
            <motion.button className="j-interview-btn" onClick={() => onInterview(p.id)} animate={isPlaying ? { scale: [1, 1.12, 1] } : { scale: 1 }} transition={isPlaying ? { duration: 1, repeat: Infinity } : {}} data-cursor="hover">
              {isPlaying ? <Pause size={12} /> : <Mic size={12} />}
              <span>{isPlaying ? "Sedang Diputar…" : "Dengarkan"}</span>
              {isPlaying && (
                <div className="j-interview-wave">
                  {[0, 1, 2, 3].map((i) => (
                    <motion.span key={i} animate={{ scaleY: [1, 2.4, 1] }} transition={{ duration: 0.55, repeat: Infinity, delay: i * 0.12 }} />
                  ))}
                </div>
              )}
            </motion.button>
          )}
        </div>
        <div className="j-scrap-footer">
          <span className="j-scrap-label">{p.label}</span>
          <p className="j-scrap-caption">{p.caption}</p>
        </div>
        <div className="j-scrap-depth" aria-hidden="true" />
      </motion.div>
      <AnimatePresence>
        {hovered && p.hasInterview && (
          <motion.div className="j-scrap-quote" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.28 }}>
            {p.quote}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function NarrationBeats({ scrollProgress }) {
  const b1O = useTransform(scrollProgress, [0.05, 0.2, 0.32, 0.45], [0, 1, 1, 0]);
  const b1Y = useTransform(scrollProgress, [0.05, 0.2], ["36px", "0px"]);
  const b2O = useTransform(scrollProgress, [0.38, 0.52, 0.64, 0.74], [0, 1, 1, 0]);
  const b2Y = useTransform(scrollProgress, [0.38, 0.52], ["36px", "0px"]);
  const b3O = useTransform(scrollProgress, [0.68, 0.8, 0.92, 1.0], [0, 1, 1, 0]);
  const b3Y = useTransform(scrollProgress, [0.68, 0.8], ["36px", "0px"]);

  const beats = [
    { opacity: b1O, y: b1Y, ...NARRATION_BEATS[0] },
    { opacity: b2O, y: b2Y, ...NARRATION_BEATS[1] },
    { opacity: b3O, y: b3Y, ...NARRATION_BEATS[2] },
  ];

  return (
    <div className="j-narration-wrap">
      {beats.map((b) => (
        <motion.div key={b.id} className="j-narration-beat" style={{ opacity: b.opacity, y: b.y }}>
          <div className="j-narration-rule" />
          <p className="j-narration-main">{b.text}</p>
          <p className="j-narration-sub">{b.sub}</p>
        </motion.div>
      ))}
    </div>
  );
}

function IntiLapanganView() {
  const SPLINE_URL = null;
  const sectionRef = useRef(null);
  const ambientRef = useRef(null);
  const interviewRef = useRef(null);
  const wasInView = useRef(false);
  const [soundOn, setSoundOn] = useState(false);
  const [interview, setInterview] = useState(null);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["-16%", "16%"]);
  const sectionAlpha = useTransform(scrollYProgress, [0, 0.06, 0.94, 1], [0, 1, 1, 0]);
  const pinProgress = useTransform(scrollYProgress, [0.05, 0.95], [0, 1]);

  useEffect(() => {
    ambientRef.current = createAmbient();
    interviewRef.current = createInterview();
    return () => {
      ambientRef.current?.unload();
      interviewRef.current?.unload();
    };
  }, []);

  useEffect(() => {
    return scrollYProgress.on("change", (v) => {
      const inView = v > 0.02 && v < 0.98;
      if (inView && !wasInView.current) {
        wasInView.current = true;
        if (soundOn) {
          ambientRef.current?.play();
          ambientRef.current?.fade(0, 0.38, 1200);
        }
      } else if (!inView && wasInView.current) {
        wasInView.current = false;
        ambientRef.current?.fade(ambientRef.current.volume?.() ?? 0.38, 0, 800);
        setTimeout(() => ambientRef.current?.stop(), 900);
        setInterview(null);
        interviewRef.current?.stop();
      }
    });
  }, [scrollYProgress, soundOn]);

  const toggleSound = useCallback(() => {
    setSoundOn((prev) => {
      const next = !prev;
      if (next) {
        if (wasInView.current) {
          ambientRef.current?.play();
          ambientRef.current?.fade(0, 0.38, 1000);
        }
      } else {
        ambientRef.current?.fade(ambientRef.current.volume?.() ?? 0.38, 0, 600);
        setTimeout(() => ambientRef.current?.stop(), 700);
      }
      return next;
    });
  }, []);

  const handleInterview = useCallback(
    (id) => {
      if (interview === id) {
        interviewRef.current?.stop();
        setInterview(null);
      } else {
        interviewRef.current?.stop();
        interviewRef.current?.play();
        setInterview(id);
        setTimeout(() => setInterview(null), 15000);
      }
    },
    [interview],
  );

  return (
    <section className="j-view j-view-5" ref={sectionRef} id="flatlay">
      <GrainOverlay />
      <div className="j-v5-vig" aria-hidden="true" />
      <motion.div className="j-v5-bg" style={{ y: bgY, backgroundImage: "url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1800&fit=crop')" }} />
      <div className="j-v5-overlay" />

      <motion.button
        className="j-sound-btn"
        onClick={toggleSound}
        initial={{ opacity: 0, x: 20 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ ...SPRING, delay: 0.5 }}
        viewport={{ once: true }}
        whileHover={{ scale: 1.07 }}
        data-cursor="hover"
        aria-label={soundOn ? "Matikan suara" : "Aktifkan suara"}
      >
        {soundOn ? <Volume2 size={14} /> : <VolumeX size={14} />}
        <span>{soundOn ? "Suara ON" : "Aktifkan Suara"}</span>
        {soundOn && (
          <div className="j-sound-wave">
            {[0, 1, 2].map((i) => (
              <motion.span key={i} animate={{ scaleY: [1, 2.2, 1] }} transition={{ duration: 0.65, repeat: Infinity, delay: i * 0.18 }} />
            ))}
          </div>
        )}
      </motion.button>

      <motion.div className="j-v5-inner" style={{ opacity: sectionAlpha }}>
        <motion.div className="j-v5-header" initial={{ opacity: 0, y: 36 }} whileInView={{ opacity: 1, y: 0 }} transition={SPRING} viewport={{ once: true }}>
          <span className="j-kicker j-kicker-cream">Tahap 5 · Inti Lapangan</span>
          <h2 className="j-headline j-headline-cream">
            Mengetuk Pintu,
            <br />
            <em className="j-accent-orange">Merekam Harapan</em>
          </h2>
          <div className="j-v5-meta-row">
            {[
              { icon: <MapPin size={12} />, t: "3 Provinsi, ratusan desa" },
              { icon: <Camera size={12} />, t: "510 enumerator di lapangan" },
              { icon: <Mic size={12} />, t: "Ribuan warga diwawancarai" },
            ].map((m, i) => (
              <motion.div key={i} className="j-v5-meta-chip" initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} transition={{ ...SPRING, delay: 0.1 + i * 0.1 }} viewport={{ once: true }}>
                {m.icon}
                <span>{m.t}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div className="j-v5-grid">
          <div className="j-scrap-board">
            <div className="j-scrap-lines" aria-hidden="true" />
            <div className="j-scrap-stamp" aria-hidden="true">
              <span>PKL 65</span>
              <span>STIS · 2026</span>
            </div>
            <div className="j-scrap-grid">
              {SCRAPBOOK.map((p, i) => (
                <ScrapPolaroid key={p.id} p={p} idx={i} onInterview={handleInterview} isPlaying={interview === p.id} />
              ))}
            </div>
            <motion.div className="j-handnote" initial={{ opacity: 0, rotate: -8, y: 18 }} whileInView={{ opacity: 1, rotate: -4, y: 0 }} transition={{ ...SPRING, delay: 0.5 }} viewport={{ once: true }}>
              <p className="j-handnote-text">
                "Setiap pintu yang diketuk
                <br />
                adalah satu harapan yang dicatat."
              </p>
              <span className="j-handnote-author">— Enumerator, Jan 2026</span>
            </motion.div>
          </div>

          <div className="j-v5-focal">
            <Spline3DFocal splineUrl={SPLINE_URL} />
            <NarrationBeats scrollProgress={pinProgress} />
          </div>
        </div>

        <motion.div className="j-v5-stats" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-8% 0px" }} variants={{ visible: { transition: { staggerChildren: 0.13 } } }}>
          {[
            { n: "510", l: "Mahasiswa turun ke lapangan", e: "👣" },
            { n: "21", l: "Hari pendataan intensif", e: "📅" },
            { n: "∞", l: "Cerita yang layak didengar", e: "🎙" },
          ].map((s, i) => (
            <motion.div
              key={i}
              className="j-v5-stat"
              variants={{ hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE_SILK } } }}
              whileHover={{ y: -4 }}
              transition={SPRING}
              data-cursor="hover"
            >
              <span className="j-v5-stat-emoji">{s.e}</span>
              <span className="j-v5-stat-num">{s.n}</span>
              <span className="j-v5-stat-label">{s.l}</span>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VIEW 6 — AMUNISI TEMPUR
// ═══════════════════════════════════════════════════════════════════════════════

function AmunisiCard({ item, i }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Efek 3D Tilt (Miring)
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [15, -15]), { stiffness: 100, damping: 30 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-15, 15]), { stiffness: 100, damping: 30 });

  function handleMouseMove(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  }

  return (
    <motion.div
      className="j-amunisi-card-v2"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        mouseX.set(0);
        mouseY.set(0);
      }}
      style={{ rotateX, rotateY, perspective: 1000 }}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.1, duration: 0.8 }}
      viewport={{ once: true }}
      data-cursor="hover"
    >
      {/* Efek Spotlight (Cahaya Senter) mengikuti mouse */}
      <motion.div
        className="j-card-spotlight"
        style={{
          background: useTransform([mouseX, mouseY], ([x, y]) => `radial-gradient(600px circle at ${(x + 0.5) * 100}% ${(y + 0.5) * 100}%, rgba(230, 126, 34, 0.15), transparent 40%)`),
        }}
      />

      <div className="j-card-inner">
        <div className="j-card-scanner" /> {/* Animasi garis laser scan */}
        <div className="j-amunisi-icon-v2" style={{ color: item.color }}>
          {item.icon}
        </div>
        <h3 className="j-amunisi-title-v2">{item.title}</h3>
        <p className="j-amunisi-desc-v2">{item.desc}</p>
        {/* Dekorasi Teknis ala Blueprint */}
        <div className="j-card-code">PKL65_EQUIP_0{item.id}</div>
        <div className="j-card-corner j-tl" />
        <div className="j-card-corner j-br" />
      </div>
    </motion.div>
  );
}

function AmunisiTempurView() {
  return (
    <section className="j-view j-view-amunisi" id="tools">
      <div className="j-view-inner">
        <div className="j-section-header center">
          <motion.span className="j-kicker j-kicker-light">Tahap 4 · Persiapan</motion.span>
          <h2 className="j-headline j-headline-light">
            Amunisi <em>Tempur</em>
          </h2>
          <p className="j-sub j-sub-light">Mengenal perlengkapan taktis mahasiswa PKL 65 dalam menaklukkan medan Sumatera.</p>
        </div>

        <div className="j-amunisi-spread">
          {AMUNISI.map((item, i) => (
            <AmunisiCard key={item.id} item={item} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VIEW 7 — "MELAWAN MEDAN"
// ═══════════════════════════════════════════════════════════════════════════════
const V6_BEATS = [
  {
    id: "v6b1",
    kicker: "Tantangan",
    heading: "Melawan",
    headingAccent: "Medan",
    body: "Hujan deras, jalan berlumpur, sinyal hilang — bukan halangan.\nKetika medan menguji, semangat menjawab.",
    quote: '"Kami bukan turis. Kami enumerator. Dan data ini penting."',
  },
  {
    id: "v6b2",
    kicker: "Lapangan",
    heading: "Setiap",
    headingAccent: "Langkah",
    body: "Motor menembus kabut pagi, catatan basah tapi data tetap akurat.\nIntegritas tidak menyerah pada medan.",
    quote: '"Tidak ada jarak yang terlalu jauh untuk satu formulir yang benar."',
  },
  {
    id: "v6b3",
    kicker: "Dedikasi",
    heading: "Tetap",
    headingAccent: "Bergerak",
    body: "21 hari, ratusan desa, ribuan wawancara.\nKami pulang membawa data yang layak diperjuangkan.",
    quote: '"Data ini bukan sekadar angka — ini suara mereka yang kami sampaikan."',
  },
];

function DeepParallaxView() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });

  const bgY = useTransform(scrollYProgress, [0, 1], ["-4%", "4%"]);
  const midY = useTransform(scrollYProgress, [0, 1], ["8%", "-8%"]);
  const fgY = useTransform(scrollYProgress, [0, 1], ["-45%", "45%"]);

  // Narrative beat opacities — sequential fade-in
  const beat1Alpha = useTransform(scrollYProgress, [0.05, 0.2, 0.35, 0.48], [0, 1, 1, 0]);
  const beat1Y = useTransform(scrollYProgress, [0.05, 0.2], ["40px", "0px"]);
  const beat2Alpha = useTransform(scrollYProgress, [0.42, 0.55, 0.68, 0.78], [0, 1, 1, 0]);
  const beat2Y = useTransform(scrollYProgress, [0.42, 0.55], ["40px", "0px"]);
  const beat3Alpha = useTransform(scrollYProgress, [0.72, 0.84, 0.95, 1.0], [0, 1, 1, 0]);
  const beat3Y = useTransform(scrollYProgress, [0.72, 0.84], ["40px", "0px"]);

  const beatData = [
    { alpha: beat1Alpha, y: beat1Y, ...V6_BEATS[0] },
    { alpha: beat2Alpha, y: beat2Y, ...V6_BEATS[1] },
    { alpha: beat3Alpha, y: beat3Y, ...V6_BEATS[2] },
  ];

  // FG photo parallax spring
  const fgYSpring = useSpring(fgY, SPRING);
  const bgYSpring = useSpring(bgY, SPRING);

  return (
    <section className="j-view j-view-6" ref={ref} id="field">
      {/* ── LAYER 1: Background panorama, blurred, 0.2× speed ── */}
      <motion.div
        className="j-px-layer j-px-bg"
        style={{
          y: bgYSpring,
          backgroundImage: "url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1800&fit=crop')",
        }}
      />

      {/* ── LAYER 2: Atmospheric rain + mist particles ── */}
      <motion.div className="j-px-layer j-px-mid" style={{ y: midY }}>
        {/* Rain streaks */}
        {Array.from({ length: 32 }).map((_, i) => (
          <motion.div
            key={`rain-${i}`}
            className="j-rain-drop"
            style={{
              left: `${(i * 3.15 + (i % 5) * 7) % 100}%`,
              top: `${(i * 6.8 + (i % 7) * 11) % 100}%`,
              height: `${14 + (i % 6) * 5}px`,
              opacity: 0.15 + (i % 5) * 0.06,
            }}
            animate={{ y: [0, 40 + (i % 5) * 15, 0] }}
            transition={{
              duration: 0.55 + (i % 7) * 0.09,
              repeat: Infinity,
              ease: "linear",
              delay: (i % 11) * 0.07,
            }}
          />
        ))}

        {/* Mist particles — larger, rounder */}
        {Array.from({ length: 10 }).map((_, i) => (
          <motion.div
            key={`mist-${i}`}
            className="j-mist-particle"
            style={{
              left: `${(i * 9.5 + 5) % 100}%`,
              top: `${(i * 17 + 10) % 100}%`,
              width: `${40 + (i % 4) * 30}px`,
              height: `${30 + (i % 3) * 20}px`,
              opacity: 0.04 + (i % 4) * 0.02,
            }}
            animate={{
              x: [0, i % 2 === 0 ? 20 : -20, 0],
              opacity: [0.04 + (i % 4) * 0.02, 0.1 + (i % 3) * 0.03, 0.04 + (i % 4) * 0.02],
            }}
            transition={{
              duration: 6 + i * 1.2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5,
            }}
          />
        ))}

        {/* Silhouette figures */}
        {["👨‍💼", "👩‍💼", "👨‍💼", "👩‍💼", "👨‍💼"].map((f, i) => (
          <motion.div key={`fig-${i}`} className="j-figure" animate={{ y: [0, -7, 0] }} transition={{ duration: 2.3 + i * 0.3, repeat: Infinity, delay: i * 0.45, ease: "easeInOut" }}>
            {f}
          </motion.div>
        ))}
      </motion.div>

      {/* ── LAYER 3: Foreground pop-out photo at 1.5× speed ── */}
      <motion.div className="j-px-layer j-px-fg" style={{ y: fgYSpring }}>
        <div className="j-px-fg-photo">
          <img src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&h=800&fit=crop&crop=face" alt="Enumerator di lapangan" />
        </div>
      </motion.div>

      {/* ── Cinematic overlay ── */}
      <div className="j-px-overlay" />

      {/* ── Narrative beats — sequential fade-in alongside parallax layers ── */}
      <div className="j-px-text" aria-live="polite">
        {beatData.map((b) => (
          <motion.div key={b.id} className="j-px-beat" style={{ opacity: b.alpha, y: b.y }}>
            <motion.span className="j-kicker j-kicker-light">{b.kicker}</motion.span>
            <h2 className="j-headline j-headline-light" style={{ marginTop: 10 }}>
              {b.heading} <em>{b.headingAccent}</em>
            </h2>
            <p className="j-px-body" style={{ whiteSpace: "pre-line", marginTop: 16 }}>
              {b.body}
            </p>
            <blockquote className="j-px-quote">{b.quote}</blockquote>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VIEW 8 — "SEHAT & SOLID"
// ═══════════════════════════════════════════════════════════════════════════════

// 15 kabupaten data array
const KABUPATEN_DATA = [
  { name: "Tapanuli Tengah", date: "18 Januari 2026", src: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=200&h=200&fit=crop" },
  { name: "Tapanuli Selatan", date: "19 Januari 2026", src: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=200&h=200&fit=crop" },
  { name: "Nias", date: "20 Januari 2026", src: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=200&h=200&fit=crop" },
  { name: "Mandailing Natal", date: "20 Januari 2026", src: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=200&h=200&fit=crop" },
  { name: "Sibolga", date: "21 Januari 2026", src: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=200&h=200&fit=crop" },
  { name: "Pidie", date: "21 Januari 2026", src: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=200&h=200&fit=crop" },
  { name: "Bireuen", date: "22 Januari 2026", src: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=200&h=200&fit=crop" },
  { name: "Aceh Utara", date: "22 Januari 2026", src: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=200&h=200&fit=crop" },
  { name: "Pasaman Barat", date: "23 Januari 2026", src: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=200&h=200&fit=crop&sat=-50" },
  { name: "Agam", date: "24 Januari 2026", src: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=200&h=200&fit=crop&sat=-50" },
  { name: "Padang Pariaman", date: "25 Januari 2026", src: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=200&h=200&fit=crop&sat=-50" },
  { name: "Padang", date: "26 Januari 2026", src: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=200&h=200&fit=crop&sat=-50" },
  { name: "Pesisir Selatan", date: "27 Januari 2026", src: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=200&h=200&fit=crop&sat=-50" },
  { name: "Aceh Besar", date: "28 Januari 2026", src: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=200&h=200&fit=crop&sat=-50" },
  { name: "Simeulue", date: "29 Januari 2026", src: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=200&h=200&fit=crop&sat=-50" },
];

const CIRC_RING_SIZES = [500, 420, 340, 260];

function CircularCarousel() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const rotAngle = useMotionValue(0);
  const smoothAngle = useSpring(rotAngle, SPRING);

  const totalItems = KABUPATEN_DATA.length;
  const angleStep = (2 * Math.PI) / totalItems;
  const orbitRadius = 0.42; // fraction of stage width

  // Auto-rotate
  useEffect(() => {
    if (!autoRotate) return;
    const interval = setInterval(() => {
      rotAngle.set(rotAngle.get() - 360 / totalItems);
      setActiveIdx((prev) => (prev + 1) % totalItems);
    }, 2200);
    return () => clearInterval(interval);
  }, [autoRotate, rotAngle, totalItems]);

  const rotateTo = useCallback(
    (idx) => {
      const currentDeg = rotAngle.get();
      const targetDeg = -idx * (360 / totalItems);
      // Find shortest path
      const diff = (((targetDeg - currentDeg) % 360) + 360) % 360;
      const delta = diff > 180 ? diff - 360 : diff;
      rotAngle.set(currentDeg + delta);
      setActiveIdx(idx);
    },
    [rotAngle, totalItems],
  );

  const prev = () => {
    const next = (activeIdx - 1 + totalItems) % totalItems;
    rotateTo(next);
  };
  const next = () => {
    const next = (activeIdx + 1) % totalItems;
    rotateTo(next);
  };

  const activItem = KABUPATEN_DATA[activeIdx];

  return (
    <section className="j-view j-view-7" id="solidarity">
      {/* Atmospheric background rings */}
      <div className="j-v7-bg-rings" aria-hidden="true">
        {CIRC_RING_SIZES.map((size, i) => (
          <div
            key={i}
            className="j-v7-ring"
            style={{
              width: `${size}px`,
              height: `${size}px`,
              animationDelay: `${i * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Section header */}
      <div className="j-v7-header">
        <motion.span className="j-kicker j-kicker-cream" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} transition={SPRING} viewport={{ once: true }}>
          Penutup · 15 Kabupaten / Kota
        </motion.span>
        <motion.h2 className="j-headline j-headline-light" initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} transition={{ ...SPRING, delay: 0.1 }} viewport={{ once: true }}>
          Sehat &amp; <em>Solid</em>
        </motion.h2>
        <motion.p
          style={{ fontFamily: "var(--font-b)", fontWeight: 300, fontSize: "0.88rem", color: "rgba(229,217,182,0.5)", letterSpacing: "0.04em", marginTop: 4 }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          viewport={{ once: true }}
        >
          Hover pada kabupaten untuk detail · Auto-rotate menjaga semangat berputar
        </motion.p>
      </div>

      {/* Circular carousel stage */}
      <motion.div className="j-circ-stage" initial={{ opacity: 0, scale: 0.88 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ ...SPRING, delay: 0.25 }} viewport={{ once: true }}>
        {/* Orbit ring decoration */}
        <div className="j-circ-orbit" aria-hidden="true" />

        {/* Rotating track */}
        <motion.div className="j-circ-track" style={{ rotate: smoothAngle }}>
          {KABUPATEN_DATA.map((kab, i) => {
            const angle = i * angleStep - Math.PI / 2;
            // Position will be computed as percentage from center
            const xPct = 50 + orbitRadius * Math.cos(angle) * 100;
            const yPct = 50 + orbitRadius * Math.sin(angle) * 100;
            const isActive = i === activeIdx;

            return (
              <motion.div
                key={kab.name}
                className={`j-circ-node ${isActive ? "is-active" : ""}`}
                style={{
                  left: `${xPct}%`,
                  top: `${yPct}%`,
                  transform: "translate(-50%, -50%)",
                  // Counter-rotate node so image stays upright
                  rotate: useTransform(smoothAngle, (v) => -v),
                }}
                onClick={() => {
                  rotateTo(i);
                  setAutoRotate(false);
                }}
                data-cursor="hover"
                animate={{ scale: isActive ? 1.22 : 1 }}
                transition={SPRING}
              >
                <div className="j-circ-node-inner">
                  <img src={kab.src} alt={kab.name} loading="lazy" />
                  <div className="j-circ-hover-overlay">
                    <span className="j-circ-hover-name">{kab.name}</span>
                    <span className="j-circ-hover-date">{kab.date}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Center focal info */}
        <AnimatePresence mode="wait">
          <motion.div key={activeIdx} className="j-circ-center" initial={{ opacity: 0, scale: 0.88 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.88 }} transition={SPRING}>
            <span className="j-circ-center-idx">{String(activeIdx + 1).padStart(2, "0")}</span>
            <span className="j-circ-center-name">{activItem.name}</span>
            <span className="j-circ-center-date">{activItem.date}</span>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Controls */}
      <div className="j-v7-controls">
        <motion.button className="j-v7-btn" onClick={prev} whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.9 }} data-cursor="hover">
          <ChevronLeft size={18} />
        </motion.button>

        <motion.button className={`j-v7-auto-toggle ${autoRotate ? "active" : ""}`} onClick={() => setAutoRotate((a) => !a)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} data-cursor="hover">
          <RotateCcw size={12} />
          {autoRotate ? "Auto ON" : "Auto OFF"}
        </motion.button>

        <motion.button className="j-v7-btn" onClick={next} whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.9 }} data-cursor="hover">
          <ChevronRight size={18} />
        </motion.button>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VIEW 9 — "R3P JOURNEY" — CLOSING VISUAL
// ═══════════════════════════════════════════════════════════════════════════════

// Particle system for sand dissolve effect
function useParticleMorph(canvasRef, inView) {
  const animFrameRef = useRef(null);
  const particlesRef = useRef([]);
  const progressRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Generate particles
    const N = 220;
    const particles = Array.from({ length: N }, (_, i) => ({
      x: Math.random() * canvas.width,
      y: canvas.height + Math.random() * 200, // start below viewport
      tx: Math.random() * canvas.width,
      ty: Math.random() * canvas.height,
      r: 1 + Math.random() * 3,
      speed: 0.004 + Math.random() * 0.006,
      // Orange sand tones: #E67E22, #f5a851, #d4580a, #e8924e
      color: [`rgba(230,126,34,${0.5 + Math.random() * 0.5})`, `rgba(245,168,81,${0.4 + Math.random() * 0.5})`, `rgba(212,88,10,${0.4 + Math.random() * 0.4})`, `rgba(229,217,182,${0.3 + Math.random() * 0.4})`][
        Math.floor(Math.random() * 4)
      ],
      phase: Math.random() * Math.PI * 2,
    }));
    particlesRef.current = particles;

    let startTime = null;
    const DURATION = 3200; // ms for full morph

    const draw = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const t = Math.min(elapsed / DURATION, 1);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        // Ease-in-out progress
        const progress = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

        // Current position: lerp from start to target
        const cx = p.x + (p.tx - p.x) * progress;
        const cy = p.y + (p.ty - p.y) * progress;

        // Oscillation during flight
        const wobble = Math.sin(timestamp * 0.002 + p.phase) * (1 - progress) * 8;

        ctx.beginPath();
        ctx.arc(cx + wobble, cy, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      });

      if (t < 1) {
        animFrameRef.current = requestAnimationFrame(draw);
      }
    };

    if (inView) {
      animFrameRef.current = requestAnimationFrame(draw);
    }

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [canvasRef, inView]);
}

// Sub-headline words for hover-shift effect
const V8_SUBHEAD_WORDS = "Pulang membawa data, pergi meninggalkan dedikasi".split(" ");

function R3PJourneyView() {
  const ref = useRef(null);
  const canvasRef = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-10% 0px" });

  // Particle morph
  useParticleMorph(canvasRef, isInView);

  // Text scramble for title
  const title1 = useTextScramble("R3P", isInView);
  const title2 = useTextScramble("Journey", isInView);

  // Scroll-driven particle reveal
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center center"] });
  const heroImgOpacity = useTransform(scrollYProgress, [0, 0.6, 1], [0, 0.35, 0.45]);

  return (
    <section className="j-view j-view-8" ref={ref} id="r3p-journey">
      {/* Hero image (appears as particles morph) */}
      <motion.div className="j-v8-hero-img" style={{ opacity: heroImgOpacity }}>
        <img src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1800&fit=crop&crop=faces" alt="Tim R3P sunset" />
      </motion.div>

      {/* Particle canvas — orange sand dissolve effect */}
      <canvas ref={canvasRef} className="j-v8-canvas" aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />

      {/* Atmospheric sunset gradient */}
      <div className="j-v8-sunset" aria-hidden="true" />

      {/* Horizon glow line */}
      <div className="j-v8-horizon" aria-hidden="true" />

      {/* Floating sand particles overlay */}
      <div className="j-v8-particle-field" aria-hidden="true">
        {Array.from({ length: 28 }).map((_, i) => (
          <motion.div
            key={i}
            className="j-v8-particle"
            style={{
              left: `${(i * 3.7) % 100}%`,
              bottom: `${(i * 5.3 + 5) % 60}%`,
              width: `${2 + (i % 4)}px`,
              height: `${2 + (i % 4)}px`,
              background: ["rgba(230,126,34,0.7)", "rgba(245,168,81,0.6)", "rgba(229,217,182,0.4)", "rgba(212,88,10,0.5)"][i % 4],
            }}
            animate={{
              y: [0, -(30 + (i % 6) * 12), 0],
              opacity: [0.3 + (i % 4) * 0.15, 0.7 + (i % 3) * 0.1, 0.3 + (i % 4) * 0.15],
              x: [0, i % 2 === 0 ? 8 : -8, 0],
            }}
            transition={{
              duration: 3 + (i % 5) * 0.8,
              repeat: Infinity,
              delay: (i % 9) * 0.35,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <motion.div className="j-v8-content" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ ...SPRING, delay: 0.3 }} viewport={{ once: true }}>
        <motion.span className="j-v8-credit" initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 0.5, duration: 0.8 }}>
          PKL Angkatan 65 · POLSTAT STIS · 2026
        </motion.span>

        {/* Abjad Morphing / Text Scramble title */}
        <motion.h1 className="j-v8-title" initial={{ opacity: 0, y: 32 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ ...SPRING, delay: 0.6 }}>
          {title1}
          <br />
          <span className="j-v8-title-accent">{title2}</span>
        </motion.h1>

        {/* Hover-shift subheadline */}
        <motion.p className="j-v8-subhead" initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 1.0, duration: 0.9 }}>
          {V8_SUBHEAD_WORDS.map((word, i) => (
            <span key={i} className="j-v8-word">
              {word}{" "}
            </span>
          ))}
        </motion.p>

        <hr className="j-v8-rule" />

        {/* Final meta stats */}
        <motion.div className="j-v8-meta" initial="hidden" animate={isInView ? "visible" : "hidden"} variants={{ visible: { transition: { staggerChildren: 0.1, delayChildren: 1.2 } } }}>
          {[
            { n: "510", l: "Mahasiswa" },
            { n: "3", l: "Provinsi" },
            { n: "21", l: "Hari" },
            { n: "57", l: "PML" },
            { n: "∞", l: "Cerita" },
          ].map((s, i) => (
            <motion.div key={i} className="j-v8-stat" variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE_SILK } } }}>
              <span className="j-v8-stat-num">{s.n}</span>
              <span className="j-v8-stat-label">{s.l}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Final blockquote */}
        <motion.blockquote
          style={{
            fontFamily: "var(--font-h)",
            fontStyle: "italic",
            fontWeight: 700,
            fontSize: "clamp(1rem, 1.8vw, 1.3rem)",
            color: "rgba(229,217,182,0.65)",
            borderLeft: "3px solid var(--orange)",
            paddingLeft: 20,
            textAlign: "left",
            maxWidth: 520,
            marginBottom: 40,
            quotes: "none",
          }}
          initial={{ opacity: 0, x: -20 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ ...SPRING, delay: 1.6 }}
        >
          "Data bukan hanya angka.
          <br />
          Data adalah harapan.
          <br />
          Dan kami beruntung bisa menjadi bagiannya."
        </motion.blockquote>

        <motion.p
          style={{ fontFamily: "var(--font-b)", fontWeight: 300, fontSize: "0.72rem", color: "rgba(229,217,182,0.3)", letterSpacing: "0.08em", marginBottom: 32 }}
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 1.9, duration: 0.7 }}
        >
          — PKL Angkatan 65 · Perjalanan R3P 2026
        </motion.p>
      </motion.div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROOT COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
function Journey() {
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const imgs = [
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600",
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=600",
      "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=600",
      "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600",
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600",
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800",
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=700",
      "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200",
    ];
    let n = 0;
    imgs.forEach((src) => {
      const img = new Image();
      img.onload = img.onerror = () => {
        n++;
        setProgress(Math.round((n / imgs.length) * 100));
        if (n === imgs.length) setTimeout(() => setReady(true), 400);
      };
      img.src = src;
    });
  }, []);

  const sections = ["cover", "timeline", "gallery", "briefing", "deployment", "flatlay", "field", "solidarity", "r3p-journey"];

  return (
    <>
      <AnimatePresence>{!ready && <LoadingScreen key="loader" progress={progress} />}</AnimatePresence>

      <AnimatePresence>
        {ready && (
          <motion.div key="content" className="j-root" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, ease: EASE_SILK }}>
            <CustomCursor />
            <ScrollProgressBar />

            {/* Section dot nav */}
            <nav className="j-section-nav" aria-label="Navigasi seksi">
              {sections.map((id) => (
                <motion.a key={id} href={`#${id}`} className="j-section-dot" title={id} whileHover={{ scale: 1.7 }} data-cursor="hover" />
              ))}
            </nav>

            {/* ─────────── All views in order ─────────── */}
            {/* View 0: Grand Cover */}
            <GrandCoverView />

            {/* View 1: Scrollytelling Timeline */}
            <ScrollyTimeline />

            {/* View 2: Pinned Photo Gallery */}
            <PinnedGallery />

            {/* View 3: Briefing Pimpinan */}
            <BriefingView />

            {/* View 4: Deployment Map */}
            <DeploymentView />

            {/* View 5: Inti Lapangan — Scrapbook + Spline 3D */}
            <IntiLapanganView />

            {/* View 6: Amunisi Tempur */}
            <AmunisiTempurView />

            {/* View 7: Melawan Medan — 3-Layer Deep Parallax (REFACTORED) */}
            <DeepParallaxView />

            {/* View 8: Sehat & Solid — High-end Circular Carousel 15 Kab (REFACTORED) */}
            <CircularCarousel />

            {/* View 9: R3P Journey — Particle Morphing + Text Scramble closing (NEW) */}
            <R3PJourneyView />

            {/* Bottom nav */}
            <nav className="j-story-nav">
              <Link to="/" className="j-nav-btn" data-cursor="hover">
                <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                  <path d="M11 4L6 9L11 14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Kembali
              </Link>
              <span className="j-nav-sep">·</span>
              <Link to="/findings" className="j-nav-btn" data-cursor="hover">
                Temuan Lapangan
                <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                  <path d="M7 4L12 9L7 14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Journey;
