import { useLayoutEffect, useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Draggable } from "gsap/Draggable";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { annotate } from "rough-notation";
import VanillaTilt from "vanilla-tilt";
import "./Journey.css";

import matahari from "../assets/img/matahari.png";
import sawit2 from "../assets/img/sawit2.png";
import pesawat from "../assets/img/pesawat.png";
import sumatera from "../assets/img/sumatera.png";
import arrow from "../assets/img/arrow.png";
import point from "../assets/img/point.png";

gsap.registerPlugin(ScrollTrigger, Draggable);

function Journey() {
  const canvasRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const timelineRef = useRef(null);
  
  // ============================================
  // ENHANCED STATE MANAGEMENT
  // ============================================
  const [zoomedPhoto, setZoomedPhoto] = useState(null);
  const tiltInstancesRef = useRef([]);
  const annotationsRef = useRef([]);

  // ============================================
  // HELPER: TRIGGER CONFETTI
  // ============================================
  const triggerConfetti = (options = {}) => {
    const defaults = {
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ffeda8', '#d4af37', '#8b4c39', '#7a8c5e'],
      ...options
    };
    confetti(defaults);
  };

  // ============================================
  // HELPER: ZOOM PHOTO MODAL
  // ============================================
  const handlePhotoClick = (photoSrc) => {
    setZoomedPhoto(photoSrc);
  };

  const closeZoom = () => {
    setZoomedPhoto(null);
  };

  // ============================================
  // PRELOAD IMAGES
  // ============================================
  useEffect(() => {
    const imagesToPreload = [
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200",
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1000",
      "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=800",
      "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=900",
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=900",
      "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800",
      "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=700",
      "https://images.unsplash.com/photo-1551836022-4c4c79ecde51?w=800",
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=700",
    ];

    let loadedCount = 0;
    const totalImages = imagesToPreload.length;

    const handleImageLoad = () => {
      loadedCount++;
      const progress = Math.round((loadedCount / totalImages) * 100);
      setLoadProgress(progress);

      if (loadedCount === totalImages) {
        setTimeout(() => {
          setIsReady(true);
          // 🎊 Confetti when loading complete!
          setTimeout(() => triggerConfetti({ particleCount: 150, spread: 100 }), 500);
        }, 300);
      }
    };

    imagesToPreload.forEach((src) => {
      const img = new Image();
      img.onload = handleImageLoad;
      img.onerror = handleImageLoad;
      img.src = src;
    });
  }, []);

  // ============================================
  // VANILLA TILT INITIALIZATION
  // ============================================
  useEffect(() => {
    if (!isReady) return;

    // Wait for DOM to be ready
    setTimeout(() => {
      const tiltElements = [
        ...document.querySelectorAll('.posko-card'),
        ...document.querySelectorAll('.boarding-pass-ticket'),
        ...document.querySelectorAll('.cork-item'),
        ...document.querySelectorAll('.flatlay-item'),
        ...document.querySelectorAll('.journey-photo'),
        ...document.querySelectorAll('.polaroid-card'),
      ];

      tiltElements.forEach(el => {
        if (el && !el.vanillaTilt) {
          VanillaTilt.init(el, {
            max: 8,
            speed: 400,
            glare: true,
            'max-glare': 0.2,
            scale: 1.02,
          });
          tiltInstancesRef.current.push(el);
        }
      });
    }, 500);

    return () => {
      // Cleanup tilt instances
      tiltInstancesRef.current.forEach(el => {
        if (el && el.vanillaTilt) {
          el.vanillaTilt.destroy();
        }
      });
      tiltInstancesRef.current = [];
    };
  }, [isReady]);

  // ============================================
  // ROUGH NOTATION ANNOTATIONS
  // ============================================
  useEffect(() => {
    if (!isReady) return;

    setTimeout(() => {
      // Annotate region names in Beat 2
      const regionLabels = document.querySelectorAll('.alloc-region');
      regionLabels.forEach((el, index) => {
        const annotation = annotate(el, {
          type: 'underline',
          color: '#d4af37',
          strokeWidth: 2,
          animate: true,
          animationDuration: 800,
        });
        
        // Trigger annotation on scroll
        ScrollTrigger.create({
          trigger: el,
          start: 'top 80%',
          onEnter: () => annotation.show(),
          once: true,
        });
        
        annotationsRef.current.push(annotation);
      });

      // Annotate important numbers/metrics
      const metrics = document.querySelectorAll('.metric-value, .posko-team');
      metrics.forEach((el, index) => {
        const annotation = annotate(el, {
          type: 'circle',
          color: '#7a8c5e',
          strokeWidth: 2,
          animate: true,
          animationDuration: 1000,
          padding: 8,
        });
        
        ScrollTrigger.create({
          trigger: el,
          start: 'top 75%',
          onEnter: () => {
            setTimeout(() => annotation.show(), index * 100);
          },
          once: true,
        });
        
        annotationsRef.current.push(annotation);
      });
    }, 1000);

    return () => {
      // Cleanup annotations
      annotationsRef.current.forEach(ann => {
        if (ann && ann.remove) ann.remove();
      });
      annotationsRef.current = [];
    };
  }, [isReady]);

  // ============================================
  // PARALLAX SCROLL EFFECT
  // ============================================
  useEffect(() => {
    if (!isReady) return;

    const handleParallax = () => {
      const scrolled = window.pageYOffset;
      
      // Parallax for different layers
      document.querySelectorAll('.parallax-slow').forEach(el => {
        el.style.transform = `translateY(${scrolled * 0.3}px)`;
      });
      
      document.querySelectorAll('.parallax-medium').forEach(el => {
        el.style.transform = `translateY(${scrolled * 0.5}px)`;
      });
      
      document.querySelectorAll('.parallax-fast').forEach(el => {
        el.style.transform = `translateY(${scrolled * 0.8}px)`;
      });
    };

    // Throttle parallax for performance
    let ticking = false;
    const throttledParallax = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleParallax();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledParallax, { passive: true });

    return () => {
      window.removeEventListener('scroll', throttledParallax);
    };
  }, [isReady]);

  // ============================================
  // WATER LEVEL GAUGE (Flood Progress Indicator)
  // ============================================
  useEffect(() => {
    if (!isReady) return;

    const fillEl = document.getElementById('water-gauge-fill');
    const valueEl = document.getElementById('water-gauge-value');
    if (!fillEl || !valueEl) return;

    const handleScroll = () => {
      const scrollPercent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
      const pct = Math.min(Math.floor(scrollPercent * 100), 100);
      const meters = (scrollPercent * 3.5).toFixed(1);
      fillEl.style.height = `${pct}%`;
      valueEl.textContent = `${meters}m`;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isReady]);

  // ============================================
  // MASTER TIMELINE - ONE CONTINUOUS CANVAS
  // ============================================
  useLayoutEffect(() => {
    if (!isReady || !canvasRef.current) return;

    const ctx = gsap.context(() => {
      const masterTL = gsap.timeline({
        scrollTrigger: {
          trigger: canvasRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
          pin: false,
        },
      });

      timelineRef.current = masterTL;

      // ============================================
      // BEAT 1: COVER - TYPEWRITER TITLE
      // ============================================
      gsap.fromTo(
        ".beat-1-title-char",
        {
          opacity: 0,
          y: -8,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.05,
          ease: "steps(1)",
          stagger: 0.08,
          scrollTrigger: {
            trigger: ".beat-1",
            start: "top 70%",
            toggleActions: "play none none none",
          },
        },
      );

      gsap.fromTo(
        ".beat-1-hero-img",
        {
          scale: 0.88,
          opacity: 0,
          y: 30,
        },
        {
          scale: 1,
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: "steps(6)",
          scrollTrigger: {
            trigger: ".beat-1",
            start: "top 50%",
          },
        },
      );

      gsap.to(".beat-1-hero-img", {
        y: "random(-6, 6)",
        x: "random(-4, 4)",
        rotation: "random(-0.4, 0.4)",
        duration: "random(5, 6.5)",
        ease: "steps(18)",
        repeat: -1,
        yoyo: true,
      });

      gsap.to(".beat-1-palm-left", {
        rotation: 2,
        duration: 2,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        transformOrigin: "bottom center",
      });

      gsap.to(".beat-1-palm-right-img", {
        rotation: 2 /* Made positive to match left, assuming wrapper handles flip */,
        duration: 2,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        transformOrigin: "bottom center",
        /* Removed delay to sync */
      });

      gsap.to(".beat-1-sun", {
        rotation: 360,
        duration: 20,
        ease: "none",
        repeat: -1,
      });

      gsap.to(".beat-1-sun", {
        scale: 1.1,
        duration: 2,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });

      gsap.fromTo(
        ".date-text",
        {
          opacity: 0,
        },
        {
          opacity: 1,
          duration: 1,
          delay: 1,
          ease: "power2.out",
        },
      );

      // ============================================
      // BRIDGE 1: PAGE DIVIDER (TEAR EFFECT)
      // ============================================
      gsap.fromTo(
        ".bridge-page-divider-1",
        {
          clipPath: "inset(0 100% 0 0)" /* Start fully clipped from right */,
          opacity: 1,
        },
        {
          clipPath: "inset(0 0% 0 0)" /* Reveal to full width */,
          duration: 1.5,
          ease: "power4.inOut" /* Strong, clearer movement */,
          scrollTrigger: {
            trigger: ".bridge-page-divider-1",
            start: "top 80%",
            end: "bottom 50%",
            scrub: 1 /* Link to scroll for manual tearing feel */,
          },
        },
      );

      // ============================================
      // BEAT 2: ALOKASI PETUGAS - STOPMOTION SEQUENCE
      // ============================================

      // Set initial states for all beat-2 elements
      gsap.set(".map-sumatera", {
        clipPath: "inset(0 0 0 100%)", // Hidden from left (will reveal from right)
        opacity: 1
      });
      gsap.set(".plane-aceh", { x: -200, y: -100, opacity: 0, rotation: -30 });
      gsap.set(".plane-sumut", { x: 200, y: -100, opacity: 0, rotation: 30, scaleX: -1 });
      gsap.set(".plane-sumbar", { x: 200, y: 100, opacity: 0, rotation: 45 });
      gsap.set(".flight-path", { scaleX: 0, opacity: 0, transformOrigin: "left center" });
      gsap.set(".loc-pin", { scale: 0, opacity: 0, y: -20 });
      gsap.set(".allocation-label", { scale: 0.5, opacity: 0 });

      // ========== ENTRANCE ANIMATION ==========
      const beat2EntranceTL = gsap.timeline({
        scrollTrigger: {
          trigger: ".beat-2",
          start: "top 80%",
          end: "top 30%",
          scrub: 1,
        },
      });

      // 1. Map masuk dari KANAN dengan clipPath (stop-motion)
      beat2EntranceTL
        .to(".map-sumatera", { clipPath: "inset(0 0 0 75%)", duration: 1, ease: "steps(1)" })
        .to(".map-sumatera", { clipPath: "inset(0 0 0 50%)", duration: 1, ease: "steps(1)" })
        .to(".map-sumatera", { clipPath: "inset(0 0 0 25%)", duration: 1, ease: "steps(1)" })
        .to(".map-sumatera", { clipPath: "inset(0 0 0 0%)", duration: 1, ease: "steps(1)" })

        // 2. Pesawat masuk dari arah masing-masing
        .to(".plane-aceh", { x: 0, y: 0, opacity: 1, rotation: -35, duration: 1, ease: "steps(4)" }, "-=0.1")
        .to(".plane-sumut", { x: 0, y: 0, opacity: 1, rotation: 20, scaleX: -1, duration: 1, ease: "steps(4)" }, "-=0.15")
        .to(".plane-sumbar", { x: 0, y: 0, opacity: 1, rotation: -35, duration: 1, ease: "steps(4)" }, "-=0.15")

        // 3. Panah muncul setelah pesawat berhenti
        .to(".path-aceh", { scaleX: 1, opacity: 1, duration: 1, ease: "steps(3)" })
        .to(".path-sumut", { scaleX: 1, opacity: 1, duration: 1, ease: "steps(3)" }, "-=0.1")
        .to(".path-sumbar", { scaleX: 1, opacity: 1, duration: 1, ease: "steps(3)" }, "-=0.1")

        // 4. Pin muncul setelah panah
        .to(".loc-pin", { scale: 1, opacity: 1, y: 0, duration: 1, ease: "steps(3)", stagger: 0.05 })

        // 5. Labels muncul terakhir
        .to(".allocation-label", { scale: 1, opacity: 1, duration: 0.15, ease: "steps(3)", stagger: 0.05 });

      // ========== EXIT ANIMATION (ke Beat-3) ==========
      const beat2ExitTL = gsap.timeline({
        scrollTrigger: {
          trigger: ".beat-2",
          start: "bottom 60%",
          end: "bottom 20%",
          scrub: 1,
        },
      });

      beat2ExitTL
        // 1. Labels hilang duluan
        .to(".allocation-label", { scale: 0.5, opacity: 0, duration: 1, ease: "steps(2)", stagger: 0.02 })
        // 2. Panah hilang sambil pesawat bergerak
        .to(".flight-path", { scaleX: 0, opacity: 0, duration: 1, ease: "steps(3)", stagger: 0.03 })
        // 3. Pesawat bergerak menuju pin lalu hilang
        .to(".plane-aceh", { x: 80, y: 50, scale: 0, opacity: 0, duration: 1, ease: "steps(4)" }, "-=0.1")
        .to(".plane-sumut", { x: -30, y: 40, scale: 0, opacity: 0, duration: 1, ease: "steps(4)" }, "-=0.15")
        .to(".plane-sumbar", { x: -60, y: -30, scale: 0, opacity: 0, duration: 1, ease: "steps(4)" }, "-=0.15")
        // 4. Pin hilang
        .to(".loc-pin", { scale: 0, opacity: 0, y: -10, duration: 1, ease: "steps(2)", stagger: 0.03 })
        // 5. Map keluar dengan clipPath (kebalikan dari masuk)
        .to(".map-sumatera", { clipPath: "inset(0 0 0 25%)", duration: 1, ease: "steps(1)" })
        .to(".map-sumatera", { clipPath: "inset(0 0 0 50%)", duration: 1, ease: "steps(1)" })
        .to(".map-sumatera", { clipPath: "inset(0 0 0 75%)", duration: 1, ease: "steps(1)" })
        .to(".map-sumatera", { clipPath: "inset(0 0 0 100%)", duration: 1, ease: "steps(1)" });

      // ============================================
      // BRIDGE 2: FOOTPRINTS
      // ============================================
      gsap.fromTo(
        ".footprint",
        {
          scale: 0,
          opacity: 0,
          y: 15,
        },
        {
          scale: 1,
          opacity: 1,
          y: 0,
          duration: 0.4,
          ease: "steps(4)",
          stagger: 0.18,
          scrollTrigger: {
            trigger: ".bridge-footprints",
            start: "top 70%",
            end: "bottom 50%",
            scrub: 0.5,
          },
        },
      );

      // ============================================
      // BEAT 3: KEBERANGKATAN - BOARDING PASS + PLANE
      // ============================================
      gsap.fromTo(
        ".beat-3",
        {
          opacity: 0,
          y: 50,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "steps(7)",
          scrollTrigger: {
            trigger: ".beat-3",
            start: "top 75%",
            end: "top 50%",
            scrub: 1,
          },
        },
      );

      gsap.fromTo(
        ".boarding-pass",
        {
          x: -180,
          rotation: -12,
          opacity: 0,
        },
        {
          x: 0,
          rotation: 0,
          opacity: 1,
          duration: 0.8,
          ease: "steps(7)",
          scrollTrigger: {
            trigger: ".beat-3",
            start: "top 60%",
          },
        },
      );

      gsap.fromTo(
        ".airplane-visual",
        {
          x: "-30vw",
          y: 80,
          rotation: 10,
          opacity: 0.85,
        },
        {
          x: "130vw",
          y: -180,
          rotation: 6,
          opacity: 1,
          duration: 3.5,
          ease: "steps(45)",
          scrollTrigger: {
            trigger: ".beat-3",
            start: "top 50%",
            end: "bottom 20%",
            scrub: 1.2,
          },
        },
      );

      gsap.fromTo(
        ".luggage-item",
        {
          scale: 0.75,
          opacity: 0,
          y: 20,
        },
        {
          scale: 1,
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: "steps(5)",
          stagger: 0.1,
          scrollTrigger: {
            trigger: ".luggage-items",
            start: "top 65%",
          },
        },
      );

      gsap.to(".luggage-item", {
        y: "random(-3, 3)",
        rotation: "random(-1, 1)",
        duration: "random(4, 5)",
        ease: "steps(12)",
        repeat: -1,
        yoyo: true,
      });

      gsap.fromTo(
        ".beat-3",
        {
          opacity: 1,
        },
        {
          opacity: 0,
          y: -40,
          duration: 0.6,
          ease: "steps(6)",
          scrollTrigger: {
            trigger: ".beat-3",
            start: "bottom 35%",
            end: "bottom 15%",
            scrub: 1,
          },
        },
      );

      // ============================================
      // BRIDGE 3: RAFIA WEAVE
      // ============================================
      gsap.fromTo(
        ".bridge-rafia",
        {
          scaleX: 0,
          transformOrigin: "left",
        },
        {
          scaleX: 1,
          duration: 1,
          ease: "steps(12)",
          scrollTrigger: {
            trigger: ".bridge-rafia",
            start: "top 75%",
            end: "bottom 55%",
            scrub: 0.8,
          },
        },
      );

      // ============================================
      // BEAT 4: PETA POSKO - ENHANCED INTERACTIVITY
      // ============================================
      gsap.fromTo(
        ".beat-4",
        {
          opacity: 0,
          y: 60,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "steps(8)",
          scrollTrigger: {
            trigger: ".beat-4",
            start: "top 75%",
            end: "top 45%",
            scrub: 1,
          },
        },
      );

      // Cards drop with bounce and rotation
      gsap.fromTo(
        ".posko-card",
        {
          scale: 0.6,
          opacity: 0,
          y: -100,
          rotation: "random(-25, 25)",
        },
        {
          scale: 1,
          opacity: 1,
          y: 0,
          rotation: "random(-3, 3)",
          duration: 0.8,
          ease: "steps(8)",
          stagger: {
            each: 0.18,
            from: "random",
          },
          scrollTrigger: {
            trigger: ".beat-4-posko-grid",
            start: "top 65%",
          },
        },
      );

      // Pin stab animation - delayed after card appears
      gsap.fromTo(
        ".posko-pin",
        {
          scale: 2,
          y: -40,
          opacity: 0,
        },
        {
          scale: 1,
          y: 0,
          opacity: 1,
          duration: 0.4,
          ease: "steps(4)",
          stagger: 0.18,
          scrollTrigger: {
            trigger: ".beat-4-posko-grid",
            start: "top 60%",
          },
        },
      );

      // Continuous subtle floating animation
      gsap.to(".posko-card", {
        y: "random(-3, 3)",
        rotation: "random(-1, 1)",
        duration: "random(4, 6)",
        ease: "steps(12)",
        repeat: -1,
        yoyo: true,
        stagger: {
          each: 0.5,
          from: "random",
        },
      });

      // Interactive hover effects with GSAP
      document.querySelectorAll(".posko-card").forEach((card) => {
        card.addEventListener("mouseenter", () => {
          gsap.to(card, {
            scale: 1.08,
            rotation: 0,
            y: -10,
            duration: 0.3,
            ease: "steps(3)",
            boxShadow: "0 15px 35px rgba(0,0,0,0.3)",
            zIndex: 10,
          });
          gsap.to(card.querySelector(".posko-pin"), {
            scale: 1.3,
            rotation: "random(-10, 10)",
            duration: 0.2,
            ease: "steps(2)",
          });
        });

        card.addEventListener("mouseleave", () => {
          gsap.to(card, {
            scale: 1,
            y: 0,
            duration: 0.4,
            ease: "steps(4)",
            boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
            zIndex: 1,
          });
          gsap.to(card.querySelector(".posko-pin"), {
            scale: 1,
            rotation: 0,
            duration: 0.3,
            ease: "steps(3)",
          });
        });

        // Click effect with ripple and pulse
        card.addEventListener("click", function (e) {
          // Create ripple effect
          const ripple = document.createElement("span");
          ripple.classList.add("posko-ripple");
          const rect = this.getBoundingClientRect();
          const size = Math.max(rect.width, rect.height);
          ripple.style.width = ripple.style.height = size + "px";
          ripple.style.left = e.clientX - rect.left - size / 2 + "px";
          ripple.style.top = e.clientY - rect.top - size / 2 + "px";
          this.appendChild(ripple);

          // Animate card click
          gsap.to(this, {
            scale: 0.95,
            duration: 0.1,
            ease: "steps(1)",
            yoyo: true,
            repeat: 1,
          });

          // Pulse all info elements
          gsap.to(this.querySelectorAll(".posko-name, .posko-location, .posko-team"), {
            scale: 1.1,
            duration: 0.2,
            ease: "steps(2)",
            yoyo: true,
            repeat: 1,
            stagger: 0.05,
          });

          // Remove ripple after animation
          setTimeout(() => {
            ripple.remove();
          }, 600);
        });
      });

      gsap.fromTo(
        ".beat-4",
        {
          opacity: 1,
        },
        {
          opacity: 0,
          y: -40,
          duration: 0.6,
          ease: "steps(6)",
          scrollTrigger: {
            trigger: ".beat-4",
            start: "bottom 40%",
            end: "bottom 20%",
            scrub: 1,
          },
        },
      );

      // ============================================
      // BEAT 5: CORKBOARD - ENHANCED PIN NOTES
      // ============================================
      gsap.fromTo(
        ".beat-5",
        {
          opacity: 0,
          y: 60,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "steps(8)",
          scrollTrigger: {
            trigger: ".beat-5",
            start: "top 75%",
            end: "top 45%",
            scrub: 1,
          },
        },
      );

      // Cork items appear with throw & stick effect
      gsap.fromTo(
        ".cork-item",
        {
          scale: 0.8,
          rotation: "random(-15, 15)",
          opacity: 0,
          y: -50, /* Reduced from -150 to stay closer to final position */
          x: "random(-20, 20)", /* Reduced from -100, 100 to prevent crossing columns */
        },
        {
          scale: 1,
          rotation: "random(-5, 5)",
          opacity: 1,
          y: 0,
          x: 0,
          duration: 0.7,
          ease: "back.out(1.7)", /* Added back ease for "stick" effect */
          stagger: {
            each: 0.1,
            from: "start", /* predictable order */
          },
          scrollTrigger: {
            trigger: ".corkboard",
            start: "top 70%",
          },
        },
      );

      // Pin stab animation - appears after cork item settles
      gsap.fromTo(
        ".pin",
        {
          scale: 3,
          y: -60,
          rotation: "random(-180, 180)",
          opacity: 0,
        },
        {
          scale: 1,
          y: 0,
          rotation: "random(-15, 15)",
          opacity: 1,
          duration: 0.4,
          ease: "steps(4)",
          stagger: 0.12,
          scrollTrigger: {
            trigger: ".corkboard",
            start: "top 55%",
          },
        },
      );

      // Polaroid shake for photo notes
      gsap.to(".photo-note", {
        rotation: "random(-2, 2)",
        duration: "random(0.8, 1.2)",
        ease: "steps(4)",
        repeat: -1,
        yoyo: true,
        stagger: 0.3,
      });

      // Sticky notes gentle sway
      gsap.to(".sticky-note", {
        rotation: "random(-1.5, 1.5)",
        y: "random(-3, 3)",
        duration: "random(3, 5)",
        ease: "steps(10)",
        repeat: -1,
        yoyo: true,
        stagger: 0.4,
      });

      // Continuous subtle movement for all cork items
      gsap.to(".cork-item", {
        y: "random(-2, 2)",
        x: "random(-1.5, 1.5)",
        duration: "random(5, 7)",
        ease: "steps(16)",
        repeat: -1,
        yoyo: true,
        stagger: {
          each: 0.6,
          from: "random",
        },
      });

      // Interactive hover effects for cork items
      document.querySelectorAll(".cork-item").forEach((item) => {
        item.addEventListener("mouseenter", function () {
          gsap.to(this, {
            scale: 1.08,
            rotation: 0,
            zIndex: 100,
            duration: 0.3,
            ease: "steps(3)",
            boxShadow: "0 20px 50px rgba(0,0,0,0.4)",
          });
          gsap.to(this.querySelector(".pin"), {
            scale: 1.2,
            rotation: "random(-25, 25)",
            duration: 0.2,
            ease: "steps(2)",
          });
        });

        item.addEventListener("mouseleave", function () {
          const originalRotation = this.getAttribute("data-rotation") || 0;
          gsap.to(this, {
            scale: 1,
            rotation: originalRotation,
            zIndex: 1,
            duration: 0.4,
            ease: "steps(4)",
            boxShadow: "0 8px 25px rgba(0,0,0,0.25)",
          });
          gsap.to(this.querySelector(".pin"), {
            scale: 1,
            duration: 0.3,
            ease: "steps(3)",
          });
        });

        // Click to focus/enlarge
        item.addEventListener("click", function () {
          const isEnlarged = this.classList.contains("cork-enlarged");

          if (!isEnlarged) {
            // Enlarge this item
            this.classList.add("cork-enlarged");
            gsap.to(this, {
              scale: 1.25,
              rotation: 0,
              x: 0,
              y: 0,
              zIndex: 200,
              duration: 0.4,
              ease: "steps(4)",
            });
            // Dim other items
            gsap.to(".cork-item:not(.cork-enlarged)", {
              opacity: 0.3,
              filter: "blur(3px)",
              duration: 0.3,
              ease: "steps(3)",
            });
          } else {
            // Restore
            this.classList.remove("cork-enlarged");
            const originalRotation = this.getAttribute("data-rotation") || 0;
            gsap.to(this, {
              scale: 1,
              rotation: originalRotation,
              zIndex: 1,
              duration: 0.4,
              ease: "steps(4)",
            });
            gsap.to(".cork-item", {
              opacity: 1,
              filter: "blur(0px)",
              duration: 0.3,
              ease: "steps(3)",
            });
          }
        });
      });

      // Exit animation for beat-5
      gsap.fromTo(
        ".beat-5",
        {
          opacity: 1,
        },
        {
          opacity: 0,
          y: -40,
          duration: 0.6,
          ease: "steps(6)",
          scrollTrigger: {
            trigger: ".beat-5",
            start: "bottom 40%",
            end: "bottom 20%",
            scrub: 1,
          },
        },
      );

      // ============================================
      // BEAT 6: FLATLAY TABLE - ENHANCED DESK SCENE
      // ============================================
      gsap.fromTo(
        ".beat-6",
        {
          opacity: 0,
          y: 60,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "steps(8)",
          scrollTrigger: {
            trigger: ".beat-6",
            start: "top 75%",
            end: "top 45%",
            scrub: 1,
          },
        },
      );

      // Items drop onto table with varied timing
      gsap.fromTo(
        ".flatlay-item",
        {
          scale: 0.5,
          opacity: 0,
          y: -120,
          rotation: "random(-30, 30)",
        },
        {
          scale: 1,
          opacity: 1,
          y: 0,
          rotation: "random(-6, 6)",
          duration: 0.8,
          ease: "steps(8)",
          stagger: {
            each: 0.15,
            from: "random",
          },
          scrollTrigger: {
            trigger: ".flatlay-table",
            start: "top 60%",
          },
        },
      );

      // Coffee steam animation
      gsap.to(".item-coffee", {
        y: -3,
        scale: 1.02,
        duration: "random(1.5, 2)",
        ease: "steps(6)",
        repeat: -1,
        yoyo: true,
      });

      // Clock tick subtle animation
      gsap.to(".item-clock", {
        scale: "random(0.98, 1.02)",
        duration: 1,
        ease: "steps(2)",
        repeat: -1,
        yoyo: true,
      });

      // Tablet screen pulse/glow
      gsap.to(".tablet-screen", {
        boxShadow: [
          "0 0 10px rgba(66, 135, 245, 0.3)",
          "0 0 20px rgba(66, 135, 245, 0.6)",
          "0 0 10px rgba(66, 135, 245, 0.3)",
        ],
        duration: 2,
        ease: "steps(8)",
        repeat: -1,
      });

      // Continuous subtle float for items
      gsap.to(".flatlay-item", {
        y: "random(-2, 2)",
        rotation: "random(-0.8, 0.8)",
        duration: "random(5, 7)",
        ease: "steps(16)",
        repeat: -1,
        yoyo: true,
        stagger: {
          each: 0.5,
          from: "random",
        },
      });

      // Interactive hover effects for flatlay items
      document.querySelectorAll(".flatlay-item").forEach((item) => {
        item.addEventListener("mouseenter", function() {
          gsap.to(this, {
            scale: 1.12,
            rotation: 0,
            y: -8,
            zIndex: 100,
            duration: 0.3,
            ease: "steps(3)",
            boxShadow: "0 20px 50px rgba(0,0,0,0.35)",
          });
        });

        item.addEventListener("mouseleave", function() {
          gsap.to(this, {
            scale: 1,
            y: 0,
            zIndex: 1,
            duration: 0.4,
            ease: "steps(4)",
            boxShadow: "0 8px 25px rgba(0,0,0,0.2)",
          });
        });

        // Click for focus effect
        item.addEventListener("click", function() {
          const isEnlarged = this.classList.contains("flatlay-enlarged");
          
          if (!isEnlarged) {
            this.classList.add("flatlay-enlarged");
            gsap.to(this, {
              scale: 1.4,
              rotation: 0,
              x: 0,
              y: 0,
              zIndex: 200,
              duration: 0.4,
              ease: "steps(4)",
            });
            gsap.to(".flatlay-item:not(.flatlay-enlarged)", {
              opacity: 0.25,
              filter: "blur(4px)",
              duration: 0.3,
              ease: "steps(3)",
            });
          } else {
            this.classList.remove("flatlay-enlarged");
            gsap.to(this, {
              scale: 1,
              zIndex: 1,
              duration: 0.4,
              ease: "steps(4)",
            });
            gsap.to(".flatlay-item", {
              opacity: 1,
              filter: "blur(0px)",
              duration: 0.3,
              ease: "steps(3)",
            });
          }
        });
      });

      // Exit animation for beat-6
      gsap.fromTo(
        ".beat-6",
        {
          opacity: 1,
        },
        {
          opacity: 0,
          y: -40,
          duration: 0.6,
          ease: "steps(6)",
          scrollTrigger: {
            trigger: ".beat-6",
            start: "bottom 40%",
            end: "bottom 20%",
            scrub: 1,
          },
        },
      );

      // ============================================
      // BRIDGE 4: MUD SPLASHES
      // ============================================
      gsap.fromTo(
        ".mud-splash",
        {
          scale: 0,
          opacity: 0,
        },
        {
          scale: 1,
          opacity: 1,
          duration: 0.4,
          ease: "steps(4)",
          stagger: 0.15,
          scrollTrigger: {
            trigger: ".bridge-mud",
            start: "top 70%",
            end: "bottom 50%",
            scrub: 0.5,
          },
        },
      );

      // ============================================
      // BEAT 7: JOURNEY COLLAGE
      // ============================================
      gsap.fromTo(
        ".beat-7",
        {
          opacity: 0,
          y: 60,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "steps(8)",
          scrollTrigger: {
            trigger: ".beat-7",
            start: "top 75%",
            end: "top 45%",
            scrub: 1,
          },
        },
      );

      // Wind scatter reveal - photos blown in from different directions
      gsap.fromTo(
        ".journey-photo",
        {
          scale: 0.3,
          opacity: 0,
          x: "random(-200, 200)",
          y: "random(-180, -80)",
          rotation: "random(-45, 45)",
        },
        {
          scale: 1,
          opacity: 1,
          x: 0,
          y: 0,
          rotation: function (index, target) {
            return target.style.rotate || "0deg";
          },
          duration: 1,
          ease: "steps(10)",
          stagger: {
            each: 0.12,
            from: "random",
          },
          scrollTrigger: {
            trigger: ".journey-collage",
            start: "top 60%",
          },
        },
      );

      // Pin stab effect for journey photos (like polaroids being pinned)
      gsap.fromTo(
        ".journey-photo::before",
        {
          scale: 2.5,
          opacity: 0,
          y: -50,
        },
        {
          scale: 1,
          opacity: 1,
          y: 0,
          duration: 0.35,
          ease: "steps(4)",
          stagger: 0.12,
          scrollTrigger: {
            trigger: ".journey-collage",
            start: "top 58%",
          },
        },
      );

      // Continuous gentle sway - more dramatic than before
      gsap.to(".journey-photo", {
        y: "random(-5, 5)",
        rotation: function (index, target) {
          const currentRot = parseFloat(target.style.rotate) || 0;
          const variation = gsap.utils.random(-1.5, 1.5);
          return currentRot + variation + "deg";
        },
        duration: "random(4, 6)",
        ease: "steps(12)",
        repeat: -1,
        yoyo: true,
        stagger: {
          each: 0.3,
          from: "random",
        },
      });

      // Interactive hover and click for journey photos
      document.querySelectorAll(".journey-photo").forEach((photo) => {
        const originalRotation =
          parseFloat(photo.style.rotate || photo.getAttribute("data-rotation")) ||
          0;

        photo.addEventListener("mouseenter", function () {
          gsap.to(this, {
            scale: 1.1,
            rotation: 0,
            y: -12,
            zIndex: 100,
            boxShadow: "0 30px 80px rgba(0,0,0,0.4)",
            duration: 0.35,
            ease: "steps(4)",
          });
        });

        photo.addEventListener("mouseleave", function () {
          if (!this.classList.contains("journey-enlarged")) {
            gsap.to(this, {
              scale: 1,
              rotation: originalRotation,
              y: 0,
              zIndex: 1,
              boxShadow: "0 12px 40px rgba(0,0,0,0.25)",
              duration: 0.35,
              ease: "steps(4)",
            });
          }
        });

        photo.addEventListener("click", function () {
          const isEnlarged = this.classList.contains("journey-enlarged");

          if (isEnlarged) {
            // Shrink back
            this.classList.remove("journey-enlarged");
            gsap.to(this, {
              scale: 1,
              rotation: originalRotation,
              y: 0,
              zIndex: 1,
              duration: 0.4,
              ease: "steps(5)",
            });
            gsap.to(".journey-collage", {
              opacity: 1,
              duration: 0.3,
            });
          } else {
            // Enlarge with rotation straighten
            document.querySelectorAll(".journey-photo").forEach((p) => {
              p.classList.remove("journey-enlarged");
            });
            this.classList.add("journey-enlarged");

            // Dim other photos
            gsap.to(".journey-collage", {
              opacity: 0.3,
              duration: 0.3,
            });
            gsap.to(this, {
              scale: 1.45,
              rotation: 0,
              y: 0,
              zIndex: 200,
              duration: 0.4,
              ease: "steps(5)",
            });
          }
        });
      });

      gsap.fromTo(
        ".beat-7",
        {
          opacity: 1,
        },
        {
          opacity: 0,
          y: -40,
          duration: 0.6,
          ease: "steps(6)",
          scrollTrigger: {
            trigger: ".beat-7",
            start: "bottom 40%",
            end: "bottom 20%",
            scrub: 1,
          },
        },
      );

      // ============================================
      // BEAT 8: DRAGGABLE CHALLENGES
      // ============================================
      gsap.fromTo(
        ".beat-8",
        {
          opacity: 0,
          y: 60,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "steps(8)",
          scrollTrigger: {
            trigger: ".beat-8",
            start: "top 75%",
            end: "top 45%",
            scrub: 1,
          },
        },
      );

      gsap.fromTo(
        ".drag-photo",
        {
          scale: 0.88,
          opacity: 0,
          y: 30,
        },
        {
          scale: 1,
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "steps(6)",
          stagger: 0.11,
          scrollTrigger: {
            trigger: ".beat-8-drag-area",
            start: "top 60%",
          },
        },
      );

      // Draggable moved to separate effect to avoid context scope issues

      gsap.fromTo(
        ".beat-8",
        {
          opacity: 1,
        },
        {
          opacity: 0,
          y: -40,
          duration: 0.6,
          ease: "steps(6)",
          scrollTrigger: {
            trigger: ".beat-8",
            start: "bottom 40%",
            end: "bottom 20%",
            scrub: 1,
          },
        },
      );

      // ============================================
      // BRIDGE 5: TORN PAPER
      // ============================================
      gsap.fromTo(
        ".torn-piece",
        {
          y: -50,
          rotation: "random(-15, 15)",
          opacity: 0,
        },
        {
          y: 0,
          rotation: "random(-5, 5)",
          opacity: 1,
          duration: 0.5,
          ease: "steps(5)",
          stagger: 0.12,
          scrollTrigger: {
            trigger: ".bridge-torn",
            start: "top 70%",
            end: "bottom 50%",
            scrub: 0.5,
          },
        },
      );

      // ============================================
      // BEAT 9: STICKY NOTES - VOICES
      // ============================================
      gsap.fromTo(
        ".beat-9",
        {
          opacity: 0,
          y: 60,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "steps(8)",
          scrollTrigger: {
            trigger: ".beat-9",
            start: "top 75%",
            end: "top 45%",
            scrub: 1,
          },
        },
      );

      // Sticky notes fly in and stick to wall
      gsap.fromTo(
        ".voice-sticky",
        {
          scale: 0.2,
          opacity: 0,
          x: "random(-250, 250)",
          y: "random(-200, -100)",
          rotation: "random(-60, 60)",
        },
        {
          scale: 1,
          opacity: 1,
          x: 0,
          y: 0,
          rotation: function (index, target) {
            return target.style.rotate || "0deg";
          },
          duration: 0.8,
          ease: "steps(8)",
          stagger: {
            each: 0.08,
            from: "random",
          },
          scrollTrigger: {
            trigger: ".sticky-wall",
            start: "top 60%",
          },
        },
      );

      // Pin stab effect for sticky notes
      gsap.fromTo(
        ".voice-sticky::before",
        {
          scale: 3,
          opacity: 0,
          y: -60,
        },
        {
          scale: 1,
          opacity: 1,
          y: 0,
          duration: 0.3,
          ease: "steps(3)",
          stagger: 0.08,
          scrollTrigger: {
            trigger: ".sticky-wall",
            start: "top 58%",
          },
        },
      );

      // Continuous flutter effect - sticky notes gently move
      gsap.to(".voice-sticky", {
        y: "random(-4, 4)",
        rotation: function (index, target) {
          const currentRot = parseFloat(target.style.rotate) || 0;
          const variation = gsap.utils.random(-1, 1);
          return currentRot + variation + "deg";
        },
        duration: "random(4.5, 6)",
        ease: "steps(14)",
        repeat: -1,
        yoyo: true,
        stagger: {
          each: 0.2,
          from: "random",
        },
      });

      // Interactive hover and click for sticky notes
      document.querySelectorAll(".voice-sticky").forEach((sticky) => {
        const originalRotation =
          parseFloat(sticky.style.rotate || sticky.getAttribute("data-rotation")) ||
          0;

        sticky.addEventListener("mouseenter", function () {
          gsap.to(this, {
            scale: 1.15,
            rotation: 0,
            y: -10,
            zIndex: 100,
            boxShadow: "0 25px 70px rgba(0,0,0,0.35)",
            duration: 0.3,
            ease: "steps(3)",
          });
        });

        sticky.addEventListener("mouseleave", function () {
          if (!this.classList.contains("sticky-enlarged")) {
            gsap.to(this, {
              scale: 1,
              rotation: originalRotation,
              y: 0,
              zIndex: 1,
              boxShadow: "0 8px 25px rgba(0,0,0,0.22)",
              duration: 0.3,
              ease: "steps(3)",
            });
          }
        });

        sticky.addEventListener("click", function () {
          const isEnlarged = this.classList.contains("sticky-enlarged");

          if (isEnlarged) {
            // Shrink back
            this.classList.remove("sticky-enlarged");
            gsap.to(this, {
              scale: 1,
              rotation: originalRotation,
              y: 0,
              zIndex: 1,
              duration: 0.35,
              ease: "steps(4)",
            });
            gsap.to(".sticky-wall", {
              opacity: 1,
              duration: 0.25,
            });
          } else {
            // Enlarge to read better
            document.querySelectorAll(".voice-sticky").forEach((s) => {
              s.classList.remove("sticky-enlarged");
            });
            this.classList.add("sticky-enlarged");

            // Dim other stickies
            gsap.to(".sticky-wall", {
              opacity: 0.25,
              duration: 0.25,
            });
            gsap.to(this, {
              scale: 1.4,
              rotation: 0,
              y: 0,
              zIndex: 200,
              duration: 0.35,
              ease: "steps(4)",
            });
          }
        });
      });

      gsap.fromTo(
        ".beat-9",
        {
          opacity: 1,
        },
        {
          opacity: 0,
          y: -40,
          duration: 0.6,
          ease: "steps(6)",
          scrollTrigger: {
            trigger: ".beat-9",
            start: "bottom 40%",
            end: "bottom 20%",
            scrub: 1,
          },
        },
      );

      // ============================================
      // BEAT 10: PHONE DEVICE - CHAT LOGS
      // ============================================
      gsap.fromTo(
        ".beat-10",
        {
          opacity: 0,
          y: 60,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "steps(8)",
          scrollTrigger: {
            trigger: ".beat-10",
            start: "top 75%",
            end: "top 45%",
            scrub: 1,
          },
        },
      );

      gsap.fromTo(
        ".phone-device",
        {
          scale: 0.9,
          opacity: 0,
          y: 40,
        },
        {
          scale: 1,
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: "steps(7)",
          scrollTrigger: {
            trigger: ".beat-10",
            start: "top 60%",
          },
        },
      );

      gsap.to(".phone-device", {
        y: "random(-5, 5)",
        rotation: "random(-0.5, 0.5)",
        duration: "random(5.5, 7)",
        ease: "steps(18)",
        repeat: -1,
        yoyo: true,
      });

      gsap.fromTo(
        ".chat-bubble",
        {
          x: -20,
          opacity: 0,
        },
        {
          x: 0,
          opacity: 1,
          duration: 0.4,
          ease: "steps(4)",
          stagger: 0.12,
          scrollTrigger: {
            trigger: ".chat-screen",
            start: "top 55%",
          },
        },
      );

      gsap.fromTo(
        ".beat-10",
        {
          opacity: 1,
        },
        {
          opacity: 0,
          y: -40,
          duration: 0.6,
          ease: "steps(6)",
          scrollTrigger: {
            trigger: ".beat-10",
            start: "bottom 40%",
            end: "bottom 20%",
            scrub: 1,
          },
        },
      );

      // ============================================
      // BEAT 11: FASIH SCREEN - PROGRESS
      // ============================================
      gsap.fromTo(
        ".beat-11",
        {
          opacity: 0,
          y: 60,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "steps(8)",
          scrollTrigger: {
            trigger: ".beat-11",
            start: "top 75%",
            end: "top 45%",
            scrub: 1,
          },
        },
      );

      gsap.fromTo(
        ".fasih-device",
        {
          scale: 0.9,
          opacity: 0,
          y: 40,
        },
        {
          scale: 1,
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: "steps(7)",
          scrollTrigger: {
            trigger: ".beat-11",
            start: "top 60%",
          },
        },
      );

      gsap.to(".fasih-device", {
        y: "random(-4, 4)",
        rotation: "random(-0.4, 0.4)",
        duration: "random(5.5, 7)",
        ease: "steps(18)",
        repeat: -1,
        yoyo: true,
      });

      gsap.fromTo(
        ".metric-row",
        {
          x: -30,
          opacity: 0,
        },
        {
          x: 0,
          opacity: 1,
          duration: 0.5,
          ease: "steps(5)",
          stagger: 0.1,
          scrollTrigger: {
            trigger: ".beat-11-metrics",
            start: "top 60%",
          },
        },
      );

      gsap.fromTo(
        ".progress-bar-fill",
        {
          scaleX: 0,
          transformOrigin: "left",
        },
        {
          scaleX: 1,
          duration: 0.8,
          ease: "steps(10)",
          stagger: 0.12,
          scrollTrigger: {
            trigger: ".beat-11-metrics",
            start: "top 55%",
          },
        },
      );

      gsap.fromTo(
        ".beat-11",
        {
          opacity: 1,
        },
        {
          opacity: 0,
          y: -40,
          duration: 0.6,
          ease: "steps(6)",
          scrollTrigger: {
            trigger: ".beat-11",
            start: "bottom 40%",
            end: "bottom 20%",
            scrub: 1,
          },
        },
      );

      // ============================================
      // BEAT 12: HEALTH SECTION
      // ============================================
      gsap.fromTo(
        ".beat-12",
        {
          opacity: 0,
          y: 60,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "steps(8)",
          scrollTrigger: {
            trigger: ".beat-12",
            start: "top 75%",
            end: "top 45%",
            scrub: 1,
          },
        },
      );

      gsap.fromTo(
        ".medicine-box",
        {
          scale: 0.85,
          opacity: 0,
          y: 25,
        },
        {
          scale: 1,
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "steps(6)",
          stagger: 0.1,
          scrollTrigger: {
            trigger: ".medicine-row",
            start: "top 65%",
          },
        },
      );

      gsap.to(".medicine-box", {
        y: "random(-3, 3)",
        rotation: "random(-1, 1)",
        duration: "random(4.5, 6)",
        ease: "steps(14)",
        repeat: -1,
        yoyo: true,
      });

      gsap.fromTo(
        ".health-bar",
        {
          scaleY: 0,
          transformOrigin: "bottom",
        },
        {
          scaleY: 1,
          duration: 0.7,
          ease: "steps(8)",
          stagger: 0.12,
          scrollTrigger: {
            trigger: ".beat-12-chart",
            start: "top 60%",
          },
        },
      );

      gsap.fromTo(
        ".beat-12",
        {
          opacity: 1,
        },
        {
          opacity: 0,
          y: -40,
          duration: 0.6,
          ease: "steps(6)",
          scrollTrigger: {
            trigger: ".beat-12",
            start: "bottom 40%",
            end: "bottom 20%",
            scrub: 1,
          },
        },
      );

      // ============================================
      // BRIDGE 6: MARKER LINE
      // ============================================
      gsap.fromTo(
        ".marker-line",
        {
          scaleX: 0,
          transformOrigin: "center",
        },
        {
          scaleX: 1,
          duration: 0.8,
          ease: "steps(10)",
          scrollTrigger: {
            trigger: ".bridge-marker",
            start: "top 70%",
            end: "bottom 50%",
            scrub: 0.8,
          },
        },
      );

      // ============================================
      // BEAT 13: POLAROID PILE
      // ============================================
      gsap.fromTo(
        ".beat-13",
        {
          opacity: 0,
          y: 60,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "steps(8)",
          scrollTrigger: {
            trigger: ".beat-13",
            start: "top 75%",
            end: "top 45%",
            scrub: 1,
          },
        },
      );

      gsap.fromTo(
        ".polaroid-card",
        {
          scale: 0,
          rotation: "random(-90, 90)",
          opacity: 0,
        },
        {
          scale: 1,
          rotation: "attr(data-rotation)",
          opacity: 1,
          duration: 0.6,
          ease: "steps(6)",
          stagger: 0.1,
          scrollTrigger: {
            trigger: ".polaroid-pile",
            start: "top 60%",
          },
        },
      );

      gsap.to(".polaroid-card", {
        y: "random(-4, 4)",
        x: "random(-3, 3)",
        rotation: "random(-2, 2)",
        duration: "random(5, 6.5)",
        ease: "steps(16)",
        repeat: -1,
        yoyo: true,
      });

      gsap.fromTo(
        ".beat-13",
        {
          opacity: 1,
        },
        {
          opacity: 0,
          y: -40,
          duration: 0.6,
          ease: "steps(6)",
          scrollTrigger: {
            trigger: ".beat-13",
            start: "bottom 40%",
            end: "bottom 20%",
            scrub: 1,
          },
        },
      );

      // ============================================
      // BEAT 14: ENVELOPE & LETTER
      // ============================================
      gsap.fromTo(
        ".beat-14",
        {
          opacity: 0,
          y: 60,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "steps(8)",
          scrollTrigger: {
            trigger: ".beat-14",
            start: "top 75%",
            end: "top 45%",
            scrub: 1,
          },
        },
      );

      gsap.fromTo(
        ".envelope",
        {
          scale: 0.9,
          opacity: 0,
          y: 40,
        },
        {
          scale: 1,
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: "steps(7)",
          scrollTrigger: {
            trigger: ".beat-14",
            start: "top 60%",
          },
        },
      );

      gsap.fromTo(
        ".envelope-flap",
        {
          rotateX: 0,
        },
        {
          rotateX: -180,
          duration: 1.2,
          ease: "steps(12)",
          scrollTrigger: {
            trigger: ".envelope-wrapper",
            start: "top 40%",
            end: "top 20%",
            scrub: 1,
          },
        },
      );

      gsap.fromTo(
        ".letter-paper",
        {
          y: 200,
          opacity: 0,
        },
        {
          y: 90,
          opacity: 1,
          duration: 1,
          ease: "steps(10)",
          scrollTrigger: {
            trigger: ".envelope-wrapper",
            start: "top 35%",
            end: "top 15%",
            scrub: 1,
          },
        },
      );

      gsap.fromTo(
        ".wax-seal",
        {
          scale: 0,
          rotation: -360,
          opacity: 0,
        },
        {
          scale: 1,
          rotation: 0,
          opacity: 1,
          duration: 0.7,
          ease: "steps(8)",
          scrollTrigger: {
            trigger: ".envelope-wrapper",
            start: "top 30%",
          },
        },
      );

      gsap.to(".wax-seal", {
        rotation: "random(-2, 2)",
        duration: "random(5, 6.5)",
        ease: "steps(16)",
        repeat: -1,
        yoyo: true,
      });

      gsap.fromTo(
        ".beat-14",
        {
          opacity: 1,
        },
        {
          opacity: 0,
          y: -40,
          duration: 0.6,
          ease: "steps(6)",
          scrollTrigger: {
            trigger: ".beat-14",
            start: "bottom 40%",
            end: "bottom 20%",
            scrub: 1,
          },
        },
      );

      // ============================================
      // BEAT 15: CLOSING
      // ============================================
      gsap.fromTo(
        ".beat-15",
        {
          opacity: 0,
          y: 60,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "steps(8)",
          scrollTrigger: {
            trigger: ".beat-15",
            start: "top 75%",
            end: "top 45%",
            scrub: 1,
          },
        },
      );

      gsap.fromTo(
        ".final-quote",
        {
          scale: 0.95,
          opacity: 0,
          y: 30,
        },
        {
          scale: 1,
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "steps(8)",
          scrollTrigger: {
            trigger: ".beat-15",
            start: "top 55%",
          },
        },
      );

      gsap.fromTo(
        ".final-credit",
        {
          opacity: 0,
          y: 20,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "steps(6)",
          delay: 0.3,
          scrollTrigger: {
            trigger: ".beat-15",
            start: "top 45%",
          },
        },
      );

      gsap.fromTo(
        ".beat-caption.final",
        {
          scale: 0.9,
          opacity: 0,
        },
        {
          scale: 1,
          opacity: 1,
          duration: 0.7,
          ease: "steps(7)",
          delay: 0.5,
          scrollTrigger: {
            trigger: ".beat-15",
            start: "top 40%",
          },
        },
      );

      // ============================================
      // FLOOD & HUMANITARIAN ENHANCEMENTS
      // ============================================

      // Emergency stamp slam animation on scroll
      document.querySelectorAll('.emergency-stamp').forEach(stamp => {
        gsap.fromTo(stamp,
          { scale: 2.2, opacity: 0 },
          {
            scale: 1,
            opacity: 0.6,
            duration: 0.5,
            ease: 'steps(5)',
            scrollTrigger: {
              trigger: stamp,
              start: 'top 80%',
            },
          }
        );
      });

      // Lightning flash on dramatic beats
      ['.beat-1', '.beat-7', '.beat-13'].forEach((sel) => {
        ScrollTrigger.create({
          trigger: sel,
          start: 'top 75%',
          onEnter: () => {
            const flash = document.getElementById('lightning-flash');
            if (flash) {
              flash.classList.add('flash-active');
              setTimeout(() => flash.classList.remove('flash-active'), 700);
            }
          },
          once: true,
        });
      });

      // Waterline dividers flow in
      gsap.fromTo('.waterline-divider',
        { scaleX: 0, transformOrigin: 'center' },
        {
          scaleX: 1,
          duration: 1.2,
          ease: 'power2.inOut',
          stagger: 0.15,
          scrollTrigger: {
            trigger: '.waterline-divider',
            start: 'top 85%',
          },
        }
      );

      // Water stains bleed in on scroll
      document.querySelectorAll('.water-stain').forEach(stain => {
        gsap.fromTo(stain,
          { opacity: 0, scale: 0.5 },
          {
            opacity: 1,
            scale: 1,
            duration: 1.5,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: stain,
              start: 'top 90%',
            },
          }
        );
      });

      // Caution tape stretch in
      document.querySelectorAll('.caution-tape').forEach(tape => {
        gsap.fromTo(tape,
          { scaleX: 0, opacity: 0, transformOrigin: 'left center' },
          {
            scaleX: 1,
            opacity: 0.55,
            duration: 0.5,
            ease: 'steps(5)',
            scrollTrigger: {
              trigger: tape,
              start: 'top 85%',
            },
          }
        );
      });

      // Safety pins drop in
      document.querySelectorAll('.safety-pin').forEach((pin, idx) => {
        gsap.fromTo(pin,
          { y: -25, opacity: 0, rotation: -15 },
          {
            y: 0,
            opacity: 1,
            rotation: 0,
            duration: 0.35,
            ease: 'steps(3)',
            delay: idx * 0.08,
            scrollTrigger: {
              trigger: pin,
              start: 'top 85%',
            },
          }
        );
      });

      // Mud splatters appear
      document.querySelectorAll('.mud-splatter').forEach(mud => {
        gsap.fromTo(mud,
          { opacity: 0, scale: 0.4 },
          {
            opacity: 0.12,
            scale: 1,
            duration: 0.6,
            ease: 'steps(4)',
            scrollTrigger: {
              trigger: mud,
              start: 'top 85%',
            },
          }
        );
      });

      // Newspaper clippings slide in
      document.querySelectorAll('.newspaper-clip').forEach(clip => {
        gsap.fromTo(clip,
          { x: -30, opacity: 0, rotation: -5 },
          {
            x: 0,
            opacity: 1,
            rotation: 0,
            duration: 0.6,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: clip,
              start: 'top 80%',
            },
          }
        );
      });

      // Aid badges pulse in
      gsap.fromTo('.aid-badge',
        { scale: 0, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.5,
          ease: 'back.out(1.7)',
          stagger: 0.2,
          scrollTrigger: {
            trigger: '.beat-15',
            start: 'top 60%',
          },
        }
      );

      // Relief icons fade in
      document.querySelectorAll('.relief-icon').forEach(icon => {
        gsap.fromTo(icon,
          { opacity: 0, y: 10 },
          {
            opacity: 0.3,
            y: 0,
            duration: 0.6,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: icon,
              start: 'top 85%',
            },
          }
        );
      });

      // Candle glows appear
      document.querySelectorAll('.candle-glow').forEach(glow => {
        gsap.fromTo(glow,
          { opacity: 0 },
          {
            opacity: 0.5,
            duration: 2,
            ease: 'power1.inOut',
            scrollTrigger: {
              trigger: glow,
              start: 'top 85%',
            },
          }
        );
      });

      // Page numbers fade in
      document.querySelectorAll('.page-number').forEach(num => {
        gsap.fromTo(num,
          { opacity: 0 },
          {
            opacity: 0.25,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: num,
              start: 'top 85%',
            },
          }
        );
      });

      // Dynamic rain drops
      const rainOverlay = document.getElementById('rain-overlay');
      if (rainOverlay) {
        for (let i = 0; i < 40; i++) {
          const drop = document.createElement('div');
          drop.className = 'rain-drop';
          drop.style.left = `${Math.random() * 100}%`;
          drop.style.height = `${15 + Math.random() * 25}px`;
          drop.style.animationDuration = `${1 + Math.random() * 1.5}s`;
          drop.style.animationDelay = `${Math.random() * 3}s`;
          rainOverlay.appendChild(drop);
        }
      }

    }, canvasRef);

    return () => ctx.revert();
  }, [isReady]);

  // Draggable setup in separate effect to avoid context scope issues
  useLayoutEffect(() => {
    if (!isReady) return;

    const draggables = Draggable.create(".drag-photo", {
      bounds: ".beat-8-drag-area",
      inertia: true,
      onDragStart: function () {
        gsap.to(this.target, {
          scale: 1.05,
          duration: 0.2,
          ease: "steps(3)",
        });
      },
      onDragEnd: function () {
        gsap.to(this.target, {
          scale: 1,
          duration: 0.3,
          ease: "steps(4)",
        });
      },
    });

    return () => {
      if (draggables && draggables.length) {
        draggables.forEach(draggable => draggable.kill());
      }
    };
  }, [isReady]);

  if (!isReady) {
    return (
      <div className="loading-screen">
        {/* Flood/Rescue themed loading */}
        <div className="loading-flood-elements">
          <div className="loading-rain-drop loading-rain-1"></div>
          <div className="loading-rain-drop loading-rain-2"></div>
          <div className="loading-rain-drop loading-rain-3"></div>
          <div className="loading-rain-drop loading-rain-4"></div>
          <div className="loading-rain-drop loading-rain-5"></div>
          <div className="loading-rain-drop loading-rain-6"></div>
          <div className="loading-flood-icon loading-icon-1">🌊</div>
          <div className="loading-flood-icon loading-icon-2">⛑️</div>
          <div className="loading-flood-icon loading-icon-3">🤝</div>
          <div className="loading-flood-icon loading-icon-4">🏥</div>
          <div className="loading-wave"></div>
        </div>

        <div className="loading-content">
          <div className="loading-text">🌧️ Mempersiapkan Catatan Lapangan...</div>
          <div className="loading-bar">
            <div
              className="loading-fill"
              style={{ width: `${loadProgress}%` }}
            ></div>
          </div>
          <div className="loading-percentage">{loadProgress}%</div>
        </div>
      </div>
    );
  }

  return (
    <div ref={canvasRef} className="story-canvas">
      {/* ============================================
          ENHANCED OVERLAYS
          ============================================ */}
      
      {/* Film Grain & Vignette */}
      <div className="film-grain-overlay"></div>
      <div className="vignette-overlay"></div>

      {/* Rain Streaks (Side Rails) */}
      <div className="rain-streaks rain-streaks-left"></div>
      <div className="rain-streaks rain-streaks-right"></div>

      {/* Rain Overlay */}
      <div className="rain-overlay" id="rain-overlay"></div>

      {/* Water Level Gauge */}
      <div className="water-level-gauge">
        <span className="water-gauge-label">LEVEL</span>
        <div className="water-gauge-bar">
          <div className="water-gauge-fill" id="water-gauge-fill" style={{height: '0%'}}></div>
        </div>
        <span className="water-gauge-value" id="water-gauge-value">0m</span>
        <span className="water-gauge-unit">BANJIR</span>
      </div>

      {/* Rescue Frame Corners */}
      <div className="rescue-frame">
        <div className="rescue-corner rescue-corner-tl"></div>
        <div className="rescue-corner rescue-corner-tr"></div>
        <div className="rescue-corner rescue-corner-bl"></div>
        <div className="rescue-corner rescue-corner-br"></div>
      </div>

      {/* Lightning Flash */}
      <div className="lightning-flash" id="lightning-flash"></div>

      {/* Photo Zoom Modal */}
      {zoomedPhoto && (
        <div className="zoom-modal" onClick={closeZoom}>
          <div className="zoom-content" onClick={(e) => e.stopPropagation()}>
            <button className="zoom-close" onClick={closeZoom}>✕</button>
            <img src={zoomedPhoto} alt="Zoomed" />
          </div>
        </div>
      )}

      {/* ============================================
          BEAT 1: COVER
          ============================================ */}
      <div className="beat beat-1">
        <div className="grain-overlay"></div>
        
        {/* Decorative Elements */}
        <div className="doodle-star doodle-star-1">✦</div>
        <div className="doodle-star doodle-star-2">✧</div>
        
        {/* Flood/Humanitarian Elements */}
        <div className="water-stain" style={{width:'120px',height:'120px',top:'6%',right:'4%'}}></div>
        <div className="caution-tape" style={{width:'130px',top:'-2px',left:'18%',transform:'rotate(-2deg)'}}></div>
        <div className="relief-icon" style={{top:'14px',right:'18px'}}>🌧️</div>
        <div className="candle-glow" style={{bottom:'-50px',left:'-50px'}}></div>
        <span className="page-number page-number-right">— 01 —</span>

        <img src={sawit2} className="beat-1-palm-left" alt="Pohon Sawit Kiri" />
        <div className="beat-1-palm-right-wrapper">
          <img
            src={sawit2}
            className="beat-1-palm-right-img"
            alt="Pohon Sawit Kanan"
          />
        </div>

        <h1 className="beat-1-title">
          {"Pendataan R3P".split("").map((char, i) => (
            <span key={i} className="beat-1-title-char">
              {char}
            </span>
          ))}
        </h1>

        <div className="beat-1-hero-container">
          <div className="beat-1-hero-img">
            <div className="frame-content"></div>
            <img src={matahari} className="beat-1-sun" alt="Matahari" />
            <div className="polaroid-caption">
              <span className="date-text">
                14 Januari 2026 - 3 Februari 2026
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* BRIDGE 1: WASHI TAPE DIVIDER */}
      <div className="bridge-page-divider-1">
        <div className="washi-tape"></div>
      </div>

      {/* ============================================
          BEAT 2: ALOKASI PETUGAS
          ============================================ */}
      <div className="beat beat-2">
        {/* Decorative Elements */}
        <div className="push-pin push-pin-map-1"></div>
        <div className="push-pin push-pin-map-2"></div>
        <div className="doodle-arrow arrow-aceh">➜</div>
        <div className="doodle-arrow arrow-sumut">➜</div>
        <div className="highlighter-mark highlight-title"></div>
        
        {/* Flood/Humanitarian Elements */}
        <div className="emergency-stamp stamp-darurat" style={{top:'8%',right:'8%',transform:'rotate(-12deg)'}}>DARURAT</div>
        <div className="caution-tape" style={{width:'110px',bottom:'5%',left:'10%',transform:'rotate(3deg)'}}></div>
        <div className="water-stain" style={{width:'90px',height:'90px',bottom:'12%',right:'6%'}}></div>
        <span className="page-number page-number-right">— 02 —</span>

        <h2 className="beat-title">Alokasi Petugas</h2>

        <div className="beat-2-map-viz">
          {/* Peta Sumatera di tengah */}
          <img src={sumatera} className="map-sumatera" alt="Peta Sumatera" />

          {/* Lokasi Aceh - Kiri Atas */}
          <div className="map-location loc-aceh">
            <img src={point} className="loc-pin" alt="Pin Aceh" />
            <div className="plane-group plane-group-aceh">
              <img
                src={pesawat}
                className="loc-plane plane-aceh"
                alt="Pesawat Aceh"
              />
              <img
                src={arrow}
                className="flight-path path-aceh"
                alt="Arrow Aceh"
              />
            </div>
          </div>

          {/* Lokasi Sumatera Utara - Kanan Atas */}
          <div className="map-location loc-sumut">
            <img src={point} className="loc-pin" alt="Pin Sumatera Utara" />
            <div className="plane-group plane-group-sumut">
              <img
                src={pesawat}
                className="loc-plane plane-sumut"
                alt="Pesawat Sumut"
              />
              <img
                src={arrow}
                className="flight-path path-sumut"
                alt="Arrow Sumut"
              />
            </div>
          </div>

          {/* Lokasi Sumatera Barat - Kanan Bawah */}
          <div className="map-location loc-sumbar">
            <img src={point} className="loc-pin" alt="Pin Sumatera Barat" />
            <div className="plane-group plane-group-sumbar">
              <img
                src={pesawat}
                className="loc-plane plane-sumbar"
                alt="Pesawat Sumbar"
              />
              <img
                src={arrow}
                className="flight-path path-sumbar"
                alt="Arrow Sumbar"
              />
            </div>
          </div>
        </div>

        {/* Label Info - Outside map, absolute positioned */}
        <div className="allocation-label label-aceh">
          <div className="highlighter-mark highlight-aceh"></div>
          <h3 className="alloc-region">Aceh</h3>
          <p className="alloc-detail">270 Mahasiswa</p>
          <p className="alloc-detail">29 PML</p>
        </div>

        <div className="allocation-label label-sumut">
          <div className="highlighter-mark highlight-sumut"></div>
          <h3 className="alloc-region">Sumatera Utara</h3>
          <p className="alloc-detail">210 Mahasiswa</p>
          <p className="alloc-detail">21 PML</p>
        </div>

        <div className="allocation-label label-sumbar">
          <div className="highlighter-mark highlight-sumbar"></div>
          <h3 className="alloc-region">Sumatera Barat</h3>
          <p className="alloc-detail">30 Mahasiswa</p>
          <p className="alloc-detail">2 PML</p>
        </div>
      </div>

      {/* BRIDGE 2: FOOTPRINTS */}
      <div className="bridge-footprints">
        <span className="footprint" style={{ left: "10%", top: "20%" }}>
          👣
        </span>
        <span className="footprint" style={{ left: "30%", top: "45%" }}>
          👣
        </span>
        <span className="footprint" style={{ left: "50%", top: "25%" }}>
          👣
        </span>
        <span className="footprint" style={{ left: "70%", top: "50%" }}>
          👣
        </span>
        <span className="footprint" style={{ left: "85%", top: "30%" }}>
          👣
        </span>
      </div>

      {/* Waterline Transition */}
      <div className="waterline-divider">
        <span className="waterline-label">bab 03</span>
      </div>

      {/* ============================================
          BEAT 3: KEBERANGKATAN - BOARDING PASS
          ============================================ */}
      <div className="beat beat-3">
        {/* Decorative Elements */}
        <div className="staple staple-ticket-1"></div>
        <div className="staple staple-ticket-2"></div>
        <div className="washi-tape washi-striped washi-bg-1"></div>
        <div className="doodle-underline underline-boarding"></div>
        
        {/* Flood/Humanitarian Elements */}
        <div className="water-stain" style={{width:'95px',height:'95px',bottom:'5%',left:'3%'}}></div>
        <div className="caution-tape" style={{width:'100px',top:'-2px',right:'15px',transform:'rotate(2deg)'}}></div>
        <div className="relief-icon" style={{bottom:'12px',right:'14px'}}>✈️</div>
        <span className="page-number page-number-right">— 03 —</span>

        <div className="boarding-pass-ticket" onClick={() => {
          triggerConfetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });
        }}>
          {/* Main Ticket Section */}
          <div className="ticket-main">
            {/* Header */}
            <div className="ticket-header">
              <div className="header-left">
                <span className="header-dots">• • • •</span>
                <img src={pesawat} className="header-plane" alt="Pesawat" />
              </div>
              <h2 className="header-title">BOARDING PASS</h2>
            </div>

            {/* Body */}
            <div className="ticket-body">
              <div className="ticket-row">
                <div className="ticket-field">
                  <span className="field-label">From</span>
                  <span className="field-value">JAKARTA</span>
                </div>
                <div className="ticket-field">
                  <span className="field-label">To</span>
                  <span className="field-value">51 POSKO</span>
                </div>
              </div>

              <div className="ticket-row">
                <div className="ticket-field full-width">
                  <span className="field-label">Passenger</span>
                  <span className="field-value large">POLITEKNIK STATISTIKA STIS & BPS</span>
                </div>
              </div>

              <div className="ticket-row">
                <div className="ticket-field">
                  <span className="field-label">Tanggal</span>
                  <span className="field-value highlight">14 Januari 2026</span>
                </div>
              </div>
            </div>
          </div>

          {/* Barcode Divider - Torn Edge Effect */}
          <div className="ticket-barcode-divider torn-edge-divider">
            <div className="barcode-vertical">
              <span className="barcode-text">PKL 65 - R3P</span>
              <div className="barcode-lines"></div>
            </div>
          </div>

          {/* Stub Section */}
          <div className="ticket-stub">
            <div className="stub-header">
              <span className="stub-title">PKL 65 - R3P</span>
            </div>
            <div className="stub-body">
              <div className="stub-field">
                <span className="stub-label">From</span>
                <span className="stub-value">JAKARTA</span>
              </div>
              <div className="stub-field">
                <span className="stub-label">To</span>
                <span className="stub-value">51 POSKO</span>
              </div>
              <div className="stub-field">
                <span className="stub-label">Tanggal</span>
                <span className="stub-value">14 Januari 2026</span>
              </div>
            </div>
            <div className="stub-footer">
              <div className="stub-barcode"></div>
              <span className="stub-code">PKL 65 - R3P</span>
            </div>
          </div>
        </div>
      </div>

      {/* BRIDGE 3: RAFIA WEAVE */}
      <div className="bridge-rafia"></div>

      {/* Waterline Transition */}
      <div className="waterline-divider">
        <span className="waterline-label">bab 04</span>
      </div>

      {/* ============================================
          BEAT 4: PETA POSKO
          ============================================ */}
      <div className="beat beat-4">
        {/* Decorative Elements */}
        <div className="highlighter-mark highlight-posko"></div>
        <div className="pen-scribble scribble-1"></div>
        
        {/* Flood/Humanitarian Elements */}
        <div className="caution-tape" style={{width:'140px',top:'-4px',right:'12%',transform:'rotate(-2deg)'}}></div>
        <div className="water-stain" style={{width:'100px',height:'100px',top:'10%',left:'3%'}}></div>
        <div className="relief-icon" style={{bottom:'15px',left:'12px'}}>🏥</div>
        <div className="mud-splatter" style={{width:'70px',height:'70px',bottom:'8%',right:'5%'}}></div>
        <span className="page-number page-number-right">— 04 —</span>

        <h2 className="beat-title handwritten ink-bleed">Peta Posko Kami</h2>

        <div className="beat-4-posko-grid">
          <div className="posko-card" onClick={(e) => {
            e.currentTarget.classList.add('card-flash');
            setTimeout(() => e.currentTarget.classList.remove('card-flash'), 600);
          }}>
            <div className="posko-pin">📍</div>
            <div className="posko-name">Posko A1</div>
            <div className="posko-location">Aceh Besar</div>
            <div className="posko-team">10 mahasiswa</div>
          </div>

          <div className="posko-card">
            <div className="posko-pin">📍</div>
            <div className="posko-name">Posko B2</div>
            <div className="posko-location">Pidie Jaya</div>
            <div className="posko-team">11 mahasiswa</div>
          </div>

          <div className="posko-card">
            <div className="posko-pin">📍</div>
            <div className="posko-name">Posko C3</div>
            <div className="posko-location">Bireuen</div>
            <div className="posko-team">9 mahasiswa</div>
          </div>

          <div className="posko-card">
            <div className="posko-pin">📍</div>
            <div className="posko-name">Posko D4</div>
            <div className="posko-location">Aceh Utara</div>
            <div className="posko-team">12 mahasiswa</div>
          </div>
        </div>

        <p className="beat-caption handwritten">
          51 titik harapan di seluruh wilayah bencana.
        </p>
      </div>

      {/* ============================================
          BEAT 5: CORKBOARD - CATATAN HARIAN
          ============================================ */}
      <div className="beat beat-5">
        {/* Decorative Cork Texture */}
        <div className="cork-texture-overlay"></div>
        <div className="washi-tape washi-dots washi-corkboard-top"></div>
        
        {/* Flood/Humanitarian Elements */}
        <div className="safety-pin" style={{top:'-10px',left:'20px',transform:'rotate(-6deg)'}}></div>
        <div className="safety-pin safety-pin-gold" style={{top:'-8px',right:'25px',transform:'rotate(10deg)'}}></div>
        <div className="water-stain" style={{width:'110px',height:'110px',bottom:'10%',left:'5%'}}></div>
        <div className="newspaper-clip" style={{bottom:'8%',right:'4%',transform:'rotate(2deg)'}}><div className="newspaper-clip-headline">BANJIR MELANDA</div>Warga korban banjir masih mengungsi...</div>
        <span className="page-number page-number-right">— 05 —</span>

        <h2 className="beat-title handwritten ink-bleed">Catatan dari Lapangan</h2>

        <div className="corkboard">
          <div
            className="cork-item photo-note"
            data-rotation="0"
            onClick={(e) => {
              const img = e.currentTarget.querySelector('img');
              if (img) handlePhotoClick(img.src);
            }}
          >
            <img
              src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=400&q=80"
              alt="Pagi hari"
            />
            <p className="photo-caption">Hari 1: Pagi yang berat</p>
            <div className="pin push-pin-3d">📌</div>
          </div>

          <div
            className="cork-item sticky-note yellow"
            style={{ rotate: "3deg" }}
            data-rotation="3"
          >
            <p>
              "Rumah pertama yang kami kunjungi... ibu-ibu menangis saat
              cerita."
            </p>
            <div className="pin">📌</div>
          </div>

          <div
            className="cork-item photo-note"
            data-rotation="0"
          >
            <img
              src="https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=400&q=80"
              alt="Survey"
            />
            <p className="photo-caption">Door to door survey</p>
            <div className="pin">📌</div>
          </div>

          <div
            className="cork-item sticky-note pink"
            style={{ rotate: "-5deg" }}
            data-rotation="-5"
          >
            <p>"Target hari ini: 40 KK. Baru 18 KK, tapi kaki sudah pegal."</p>
            <div className="pin">📌</div>
          </div>

          <div
            className="cork-item photo-note"
            data-rotation="0"
          >
            <img
              src="https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&q=80"
              alt="Istirahat"
            />
            <p className="photo-caption">Istirahat sejenak</p>
            <div className="pin">📌</div>
          </div>

          <div
            className="cork-item sticky-note green"
            style={{ rotate: "4deg" }}
            data-rotation="4"
          >
            <p>"Akhirnya bisa submit 50 form hari ini! Capek tapi puas."</p>
            <div className="pin">📌</div>
          </div>
        </div>

        <p className="beat-caption handwritten">Setiap pin menyimpan cerita.</p>
      </div>

      {/* ============================================
          BEAT 6: FLATLAY - DESK SCENE
          ============================================ */}
      <div className="beat beat-6">
        {/* Flood/Humanitarian Elements */}
        <div className="water-stain" style={{width:'105px',height:'105px',bottom:'8%',right:'5%'}}></div>
        <div className="caution-tape" style={{width:'120px',top:'-4px',right:'18%',transform:'rotate(-1deg)'}}></div>
        <div className="relief-icon" style={{top:'14px',left:'15px'}}>🔯</div>
        <div className="candle-glow" style={{top:'20%',right:'-60px'}}></div>
        <span className="page-number page-number-right">— 06 —</span>

        <h2 className="beat-title handwritten ink-bleed">Meja Kerja Malam</h2>

        <div className="flatlay-table">
          <div
            className="flatlay-item"
            style={{ left: "10%", top: "15%", rotate: "-6deg" }}
            data-rotation="-6"
          >
            <div className="item-paper">
              <div className="paper-title">Laporan Harian</div>
              <div className="paper-lines">
                ━━━━━━━━━━━━
                <br />
                ━━━━━━━━━━
                <br />
                ━━━━━━━━━━━━
              </div>
            </div>
          </div>

          <div
            className="flatlay-item"
            style={{ left: "45%", top: "12%", rotate: "2deg" }}
            data-rotation="2"
          >
            <div className="item-tablet">
              <div className="tablet-screen">
                <div className="app-icon">📊</div>
                <div className="app-name">FASIH</div>
                <div className="app-status">Sync: 47/50</div>
              </div>
            </div>
          </div>

          <div
            className="flatlay-item"
            style={{ left: "72%", top: "18%", rotate: "-3deg" }}
            data-rotation="-3"
          >
            <div className="item-photo">
              <img
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=200&h=200&fit=crop"
                alt="Tim malam"
              />
            </div>
          </div>

          <div
            className="flatlay-item"
            style={{ left: "18%", top: "58%", rotate: "5deg" }}
            data-rotation="5"
          >
            <div className="item-coffee">☕</div>
            <p className="item-label">Kopi ke-4</p>
          </div>

          <div
            className="flatlay-item"
            style={{ left: "52%", top: "62%", rotate: "-4deg" }}
            data-rotation="-4"
          >
            <div className="item-notes">
              <div className="notes-title">To-Do Besok:</div>
              <div className="notes-list">
                ☐ Verifikasi data
                <br />
                ☐ Follow-up KK reject
                <br />☐ Submit laporan
              </div>
            </div>
          </div>

          <div
            className="flatlay-item"
            style={{ left: "78%", top: "65%", rotate: "3deg" }}
            data-rotation="3"
          >
            <div className="item-clock">🕐 02:47</div>
          </div>
        </div>

        <p className="beat-caption handwritten">
          Malam adalah waktu kami merekap harapan.
        </p>
      </div>

      {/* BRIDGE 4: MUD SPLASHES */}

      {/* Waterline Transition */}
      <div className="waterline-divider">
        <span className="waterline-label">bab 07</span>
      </div>

      <div className="bridge-mud">
        <div
          className="mud-splash"
          style={{ width: "80px", height: "80px", left: "15%", top: "25%" }}
        ></div>
        <div
          className="mud-splash"
          style={{ width: "110px", height: "110px", left: "45%", top: "40%" }}
        ></div>
        <div
          className="mud-splash"
          style={{ width: "95px", height: "95px", left: "72%", top: "30%" }}
        ></div>
        <div
          className="mud-splash"
          style={{ width: "65px", height: "65px", left: "28%", top: "65%" }}
        ></div>
        <div
          className="mud-splash"
          style={{ width: "88px", height: "88px", left: "60%", top: "70%" }}
        ></div>
      </div>

      {/* ============================================
          BEAT 7: JOURNEY COLLAGE
          ============================================ */}
      <div className="beat beat-7">
        {/* Decorative Elements */}
        <div className="washi-tape washi-geometric washi-collage-1"></div>
        <div className="doodle-star doodle-star-3">✦</div>
        
        {/* Flood/Humanitarian Elements */}
        <div className="water-stain" style={{width:'130px',height:'130px',top:'5%',right:'4%'}}></div>
        <div className="caution-tape" style={{width:'110px',bottom:'6%',left:'8%',transform:'rotate(2deg)'}}></div>
        <div className="safety-pin safety-pin-gold" style={{top:'-10px',left:'35%',transform:'rotate(-5deg)'}}></div>
        <div className="water-ripple" style={{width:'80px',height:'80px',bottom:'15%',right:'10%'}}></div>
        <span className="page-number page-number-right">— 07 —</span>

        <h2 className="beat-title handwritten ink-bleed">Perjalanan Visual</h2>

        <div className="journey-collage">
          <div
            className="journey-photo"
            style={{ left: "8%", top: "10%", rotate: "-7deg", width: "280px" }}
            data-rotation="-7"
            onClick={(e) => {
              const img = e.currentTarget.querySelector('img');
              if (img) handlePhotoClick(img.src);
            }}
          >
            <img
              src="https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=280&h=320&fit=crop"
              alt="Jalan becek"
            />
            <p className="journey-caption">Jalan becek pagi hari</p>
          </div>

          <div
            className="journey-photo"
            style={{ left: "38%", top: "8%", rotate: "4deg", width: "300px" }}
            data-rotation="4"
          >
            <img
              src="https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=300&h=340&fit=crop"
              alt="Wawancara"
            />
            <p className="journey-caption">Wawancara dengan warga</p>
          </div>

          <div
            className="journey-photo"
            style={{ left: "70%", top: "12%", rotate: "-3deg", width: "260px" }}
            data-rotation="-3"
          >
            <img
              src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=260&h=300&fit=crop"
              alt="Tim"
            />
            <p className="journey-caption">Tim yang solid</p>
          </div>

          <div
            className="journey-photo"
            style={{ left: "12%", top: "52%", rotate: "6deg", width: "270px" }}
            data-rotation="6"
          >
            <img
              src="https://images.unsplash.com/photo-1557804506-669a67965ba0?w=270&h=310&fit=crop"
              alt="Diskusi"
            />
            <p className="journey-caption">Diskusi strategi</p>
          </div>

          <div
            className="journey-photo"
            style={{ left: "42%", top: "55%", rotate: "-5deg", width: "290px" }}
            data-rotation="-5"
          >
            <img
              src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=290&h=330&fit=crop"
              alt="Istirahat"
            />
            <p className="journey-caption">Istirahat sejenak</p>
          </div>

          <div
            className="journey-photo"
            style={{ left: "72%", top: "58%", rotate: "3deg", width: "265px" }}
            data-rotation="3"
          >
            <img
              src="https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=265&h=305&fit=crop"
              alt="Semangat"
            />
            <p className="journey-caption">Semangat pantang menyerah</p>
          </div>
        </div>

        <p className="beat-caption handwritten">
          Setiap foto adalah saksi perjalanan kami.
        </p>
      </div>

      {/* ============================================
          BEAT 8: DRAGGABLE CHALLENGES
          ============================================ */}
      <div className="beat beat-8">
        <h2 className="beat-title handwritten pencil-underline">Tantangan yang Kami Hadapi</h2>
        <p className="beat-intro">(Geser foto untuk melihat lebih dekat)</p>
        
        {/* Flood/Humanitarian Elements */}
        <div className="safety-pin" style={{top:'-10px',right:'20%',transform:'rotate(12deg)'}}></div>
        <div className="caution-tape" style={{width:'110px',bottom:'4%',right:'8%',transform:'rotate(2deg)'}}></div>
        <div className="mud-splatter" style={{width:'65px',height:'65px',top:'8%',left:'5%'}}></div>
        <span className="page-number page-number-right">— 08 —</span>

        <div className="beat-8-drag-area">
          <div
            className="drag-photo"
            style={{ left: "10%", top: "12%", rotate: "-6deg" }}
          >
            <img
              src="https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=240&h=280&fit=crop"
              alt="Jalan rusak"
            />
            <p className="drag-caption">Jalan rusak & becek</p>
          </div>

          <div
            className="drag-photo"
            style={{ left: "42%", top: "15%", rotate: "4deg" }}
          >
            <img
              src="https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=240&h=280&fit=crop"
              alt="Cuaca ekstrem"
            />
            <p className="drag-caption">Cuaca tak menentu</p>
          </div>

          <div
            className="drag-photo"
            style={{ left: "72%", top: "10%", rotate: "-3deg" }}
          >
            <img
              src="https://images.unsplash.com/photo-1551836022-4c4c79ecde51?w=240&h=280&fit=crop"
              alt="Rumah rusak"
            />
            <p className="drag-caption">Kondisi rumah parah</p>
          </div>

          <div
            className="drag-photo"
            style={{ left: "18%", top: "58%", rotate: "5deg" }}
          >
            <img
              src="https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=240&h=280&fit=crop"
              alt="Sinyal lemah"
            />
            <p className="drag-caption">Sinyal hilang-muncul</p>
          </div>

          <div
            className="drag-photo"
            style={{ left: "52%", top: "62%", rotate: "-4deg" }}
          >
            <img
              src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=240&h=280&fit=crop"
              alt="Lelah"
            />
            <p className="drag-caption">Kelelahan fisik</p>
          </div>

          <div
            className="drag-photo"
            style={{ left: "78%", top: "60%", rotate: "3deg" }}
          >
            <img
              src="https://images.unsplash.com/photo-1557804506-669a67965ba0?w=240&h=280&fit=crop"
              alt="Emosional"
            />
            <p className="drag-caption">Beban emosional</p>
          </div>
        </div>

        <p className="beat-caption handwritten">Tapi kami tetap maju.</p>
      </div>

      {/* BRIDGE 5: TORN PAPER */}
      <div className="bridge-torn">
        <div
          className="torn-piece"
          style={{
            width: "180px",
            height: "140px",
            left: "12%",
            top: "15%",
            rotate: "-8deg",
          }}
        ></div>
        <div
          className="torn-piece"
          style={{
            width: "200px",
            height: "120px",
            left: "45%",
            top: "25%",
            rotate: "5deg",
          }}
        ></div>
        <div
          className="torn-piece"
          style={{
            width: "170px",
            height: "150px",
            left: "72%",
            top: "20%",
            rotate: "-4deg",
          }}
        ></div>
        <div
          className="torn-piece"
          style={{
            width: "160px",
            height: "130px",
            left: "28%",
            top: "60%",
            rotate: "6deg",
          }}
        ></div>
      </div>

      {/* ============================================
          BEAT 9: STICKY NOTES - VOICES
          ============================================ */}
      <div className="beat beat-9">
        {/* Flood/Humanitarian Elements */}
        <div className="notebook-lines"></div>
        <div className="caution-tape" style={{width:'130px',top:'-5px',left:'28%',transform:'rotate(-2deg)'}}></div>
        <div className="relief-icon" style={{top:'15px',right:'20px'}}>📢</div>
        <div className="water-stain" style={{width:'85px',height:'85px',bottom:'6%',left:'4%'}}></div>
        <span className="page-number page-number-right">— 09 —</span>

        <h2 className="beat-title handwritten ink-bleed">Suara dari Lapangan</h2>

        <div className="sticky-wall">
          <div
            className="voice-sticky yellow"
            style={{ left: "8%", top: "10%", rotate: "-6deg" }}
            data-rotation="-6"
          >
            <p>
              "Kami dengar cerita mereka. Kami rasakan kesedihannya. Tapi kami
              harus tetap profesional."
            </p>
            <span className="sticky-author">— Tim Wawancara</span>
          </div>

          <div
            className="voice-sticky pink"
            style={{ left: "40%", top: "8%", rotate: "4deg" }}
            data-rotation="4"
          >
            <p>
              "Ada ibu yang bilang: 'Kalian datang membawa harapan.' Itu yang
              bikin kami kuat."
            </p>
            <span className="sticky-author">— Enumerator Posko B3</span>
          </div>

          <div
            className="voice-sticky green"
            style={{ left: "72%", top: "12%", rotate: "-3deg" }}
            data-rotation="-3"
          >
            <p>
              "Setiap form yang kami isi = 1 keluarga lebih dekat ke bantuan."
            </p>
            <span className="sticky-author">— Koordinator Lapangan</span>
          </div>

          <div
            className="voice-sticky blue"
            style={{ left: "12%", top: "42%", rotate: "5deg" }}
            data-rotation="5"
          >
            <p>
              "Pernah nangis diam-diam di toilet posko. Tapi besoknya tetap
              turun lagi."
            </p>
            <span className="sticky-author">— Mahasiswa PKL</span>
          </div>

          <div
            className="voice-sticky orange"
            style={{ left: "45%", top: "45%", rotate: "-4deg" }}
            data-rotation="-4"
          >
            <p>
              "Target bukan cuma angka. Target adalah kehidupan yang harus
              dipulihkan."
            </p>
            <span className="sticky-author">— Supervisor</span>
          </div>

          <div
            className="voice-sticky yellow"
            style={{ left: "75%", top: "48%", rotate: "3deg" }}
            data-rotation="3"
          >
            <p>
              "Kami bukan pahlawan. Kami cuma mahasiswa yang diberi amanah."
            </p>
            <span className="sticky-author">— Ketua Tim</span>
          </div>

          <div
            className="voice-sticky pink"
            style={{ left: "18%", top: "75%", rotate: "-5deg" }}
            data-rotation="-5"
          >
            <p>
              "Kadang capek bukan dari jalan kaki. Tapi dari liat orang yang
              kehilangan segalanya tetap tersenyum."
            </p>
            <span className="sticky-author">— Field Officer</span>
          </div>

          <div
            className="voice-sticky green"
            style={{ left: "52%", top: "78%", rotate: "6deg" }}
            data-rotation="6"
          >
            <p>"3 minggu ini mengubah cara saya lihat data. Data itu nyawa."</p>
            <span className="sticky-author">— Data Entry</span>
          </div>
        </div>

        <p className="beat-caption handwritten big">
          Ini bukan hanya pengalaman kerja. Ini pelajaran hidup.
        </p>
      </div>

      {/* ============================================
          BEAT 10: PHONE DEVICE - GROUP CHAT
          ============================================ */}
      <div className="beat beat-10">
        {/* Decorative Elements */}
        <div className="pen-scribble scribble-phone"></div>
        <div className="highlighter-mark highlight-chat"></div>
        
        {/* Flood/Humanitarian Elements */}
        <div className="safety-pin safety-pin-gold" style={{top:'-12px',left:'30%',transform:'rotate(-8deg)'}}></div>
        <div className="water-stain" style={{width:'80px',height:'80px',top:'10%',right:'6%'}}></div>
        <div className="relief-icon" style={{bottom:'10px',left:'10px'}}>📱</div>
        <span className="page-number page-number-right">— 10 —</span>

        <h2 className="beat-title handwritten ink-bleed">Grup Chat Posko</h2>

        <div className="phone-device glitch">
          <div className="phone-notch"></div>

          <div className="chat-header">
            <div className="chat-title">💬 Posko A1 - Tim Solid</div>
            <div className="chat-members">10 anggota</div>
          </div>

          <div className="chat-screen">
            <div className="chat-bubble left">
              <p className="chat-text">
                Guys, hari ini berat banget. Baru 12 KK 😭
              </p>
              <span className="chat-time">08:47</span>
            </div>

            <div className="chat-bubble right">
              <p className="chat-text">
                Sama, jalanan becek parah. Tapi semangat!
              </p>
              <span className="chat-time">08:50</span>
            </div>

            <div className="chat-bubble left">
              <p className="chat-text">
                Tablet ku error lagi, ada yang bisa bantu? 🥲
              </p>
              <span className="chat-time">09:15</span>
            </div>

            <div className="chat-bubble right">
              <p className="chat-text">
                Udah coba restart? Nanti aku bantu pas istirahat
              </p>
              <span className="chat-time">09:18</span>
            </div>

            <div className="chat-bubble left">
              <p className="chat-text">
                Tadi ketemu ibu2 yg cerita sambil nangis 💔
              </p>
              <span className="chat-time">11:32</span>
            </div>

            <div className="chat-bubble right">
              <p className="chat-text">
                Sama... kadang ga tau harus bilang apa
              </p>
              <span className="chat-time">11:35</span>
            </div>

            <div className="chat-bubble system">
              <p className="chat-text">📊 Update Progress: 38/50 KK hari ini</p>
              <span className="chat-time">14:20</span>
            </div>

            <div className="chat-bubble left">
              <p className="chat-text">
                SEMANGAT TEMAN-TEMAN! Kita pasti bisa! 💪
              </p>
              <span className="chat-time">14:22</span>
            </div>

            <div className="chat-bubble right">
              <p className="chat-text">GASPOL! Target 50 KK kita kejar! 🔥</p>
              <span className="chat-time">14:23</span>
            </div>
          </div>

          <div className="chat-input">
            <span className="input-placeholder">Ketik pesan...</span>
          </div>
        </div>

        <p className="beat-caption handwritten">
          Grup chat = tempat kami saling menguatkan.
        </p>
      </div>

      {/* ============================================
          BEAT 11: FASIH SCREEN - PROGRESS TRACKING
          ============================================ */}
      <div className="beat beat-11">
        <div className="caution-tape" style={{width:'110px',top:'18px',right:'30px',transform:'rotate(-6deg)'}} />
        <div className="safety-pin safety-pin-gold" style={{top:'-12px',left:'55px',transform:'rotate(18deg)'}} />
        <div className="water-stain" style={{width:'90px',height:'90px',bottom:'30px',right:'25px'}} />
        <div className="page-number page-number-right">— 11 —</div>
        <h2 className="beat-title handwritten ink-bleed">Monitoring Real-Time</h2>

        <div className="fasih-device">
          <div className="fasih-screen">
            <div className="fasih-header">
              <span className="fasih-logo">📱 FASIH</span>
              <span className="fasih-battery">📶 45%</span>
            </div>

            <h3 className="fasih-title">Progress Pendataan</h3>

            <div className="beat-11-metrics">
              <div className="metric-row">
                <div className="metric-label">KK Dibuka</div>
                <div className="progress-bar-container">
                  <div
                    className="progress-bar-fill green"
                    style={{ width: "91.6%" }}
                  ></div>
                </div>
                <div className="metric-value">3847 / 4200</div>
              </div>

              <div className="metric-row">
                <div className="metric-label">Tersubmit</div>
                <div className="progress-bar-container">
                  <div
                    className="progress-bar-fill blue"
                    style={{ width: "86.2%" }}
                  ></div>
                </div>
                <div className="metric-value">3621 / 4200</div>
              </div>

              <div className="metric-row">
                <div className="metric-label">Ditolak</div>
                <div className="progress-bar-container">
                  <div
                    className="progress-bar-fill red"
                    style={{ width: "4.3%" }}
                  ></div>
                </div>
                <div className="metric-value">182</div>
              </div>

              <div className="metric-row">
                <div className="metric-label">Approved</div>
                <div className="progress-bar-container">
                  <div
                    className="progress-bar-fill yellow"
                    style={{ width: "81.9%" }}
                  ></div>
                </div>
                <div className="metric-value">3439 / 4200</div>
              </div>
            </div>

            <div className="fasih-summary">
              Target 82% tercapai
              <br />
              <small>Per 15 Januari 2026</small>
            </div>
          </div>
        </div>

        <p className="beat-caption handwritten">
          Real-time monitoring.
          <br />
          Transparan. Akurat. Terukur.
        </p>
      </div>

      {/* ============================================
          BEAT 12: KESEHATAN TIM
          ============================================ */}
      <div className="beat beat-12">
        <div className="caution-tape" style={{width:'100px',top:'15px',left:'40px',transform:'rotate(4deg)'}} />
        <div className="water-stain" style={{width:'105px',height:'105px',bottom:'20px',left:'18px'}} />
        <div className="safety-pin" style={{top:'-10px',right:'60px',transform:'rotate(-15deg)'}} />
        <div className="relief-icon" style={{bottom:'12px',right:'12px'}}>🩺</div>
        <div className="page-number page-number-left">— 12 —</div>
        <h2 className="beat-title handwritten ink-bleed">Kondisi Tim</h2>

        <div className="health-section">
          <div className="medicine-row">
            <div className="medicine-box" style={{ rotate: "-5deg" }}>
              <div className="box-label">TOLAK ANGIN</div>
              <div className="box-stock">47 sachet</div>
            </div>

            <div className="medicine-box" style={{ rotate: "3deg" }}>
              <div className="box-label">VITAMIN C</div>
              <div className="box-stock">32 tablet</div>
            </div>

            <div className="medicine-box" style={{ rotate: "-2deg" }}>
              <div className="box-label">PLESTER</div>
              <div className="box-stock">5 rol</div>
            </div>

            <div className="medicine-box alert" style={{ rotate: "4deg" }}>
              <div className="box-label">OBAT MAAG</div>
              <div className="box-stock">HABIS ⚠️</div>
            </div>
          </div>

          <div className="beat-12-chart">
            <h3 className="chart-title">Keluhan Kesehatan Tim</h3>
            <div className="health-bars">
              <div className="health-bar-group">
                <div className="health-bar" style={{ height: "75%" }}></div>
                <div className="bar-label">
                  Demam
                  <br />
                  23 org
                </div>
              </div>
              <div className="health-bar-group">
                <div className="health-bar" style={{ height: "55%" }}></div>
                <div className="bar-label">
                  Diare
                  <br />
                  17 org
                </div>
              </div>
              <div className="health-bar-group">
                <div className="health-bar" style={{ height: "40%" }}></div>
                <div className="bar-label">
                  Lelah
                  <br />
                  12 org
                </div>
              </div>
              <div className="health-bar-group">
                <div className="health-bar" style={{ height: "100%" }}></div>
                <div className="bar-label">
                  Luka
                  <br />
                  31 org
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="beat-caption handwritten">
          "Mayoritas sehat, tapi butuh istirahat lebih."
          <br />— Tim Kesehatan Posko
        </p>
      </div>

      {/* BRIDGE 6: MARKER LINE */}
      <div className="bridge-marker">
        <div className="marker-line"></div>
      </div>

      {/* ============================================
          BEAT 13: REKAP AKHIR - POLAROID PILE
          ============================================ */}
      <div className="beat beat-13">
        {/* Flood/Humanitarian Elements */}
        <div className="caution-tape" style={{width:'120px',top:'-5px',left:'25%',transform:'rotate(-3deg)'}}></div>
        <div className="water-stain" style={{width:'105px',height:'105px',bottom:'10%',left:'4%'}}></div>
        <div className="emergency-stamp stamp-sos" style={{bottom:'12%',right:'6%',transform:'rotate(8deg)'}}>TERVERIFIKASI</div>
        <div className="mud-splatter" style={{width:'60px',height:'60px',top:'5%',right:'10%'}}></div>
        <span className="page-number page-number-right">— 13 —</span>

        <h2 className="beat-title handwritten ink-bleed">3 Minggu yang Bermakna</h2>

        <div className="polaroid-pile">
          <div
            className="polaroid-card"
            style={{
              left: "50%",
              top: "45%",
              transform: "translate(-50%, -50%) rotate(-8deg)",
              zIndex: 1,
            }}
            data-rotation="-8"
          >
            <img
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=350&h=400&fit=crop"
              alt="Tim kompak"
            />
            <p className="polaroid-caption">Tim kompak</p>
          </div>

          <div
            className="polaroid-card"
            style={{
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%) rotate(5deg)",
              zIndex: 2,
            }}
            data-rotation="5"
          >
            <img
              src="https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=350&h=400&fit=crop"
              alt="Senyum lelah"
            />
            <p className="polaroid-caption">Senyum di tengah lelah</p>
          </div>

          <div
            className="polaroid-card"
            style={{
              left: "50%",
              top: "48%",
              transform: "translate(-50%, -50%) rotate(-3deg)",
              zIndex: 3,
            }}
            data-rotation="-3"
          >
            <img
              src="https://images.unsplash.com/photo-1551836022-4c4c79ecde51?w=350&h=400&fit=crop"
              alt="Dokumentasi"
            />
            <p className="polaroid-caption">Dokumentasi bersama</p>
          </div>

          <div
            className="polaroid-card"
            style={{
              left: "50%",
              top: "52%",
              transform: "translate(-50%, -50%) rotate(7deg)",
              zIndex: 4,
            }}
            data-rotation="7"
          >
            <img
              src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=350&h=400&fit=crop"
              alt="Kerja sama"
            />
            <p className="polaroid-caption">Kerja sama solid</p>
          </div>

          <div
            className="polaroid-card"
            style={{
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%) rotate(-2deg)",
              zIndex: 5,
            }}
            data-rotation="-2"
          >
            <img
              src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=350&h=400&fit=crop"
              alt="Momen haru"
            />
            <p className="polaroid-caption">Momen haru</p>
          </div>
        </div>

        <p className="beat-caption handwritten big">
          Tawa, tangis, dan harapan.
          <br />
          Terima kasih untuk semuanya.
        </p>
      </div>

      {/* ============================================
          BEAT 14: CLOSING EMOSIONAL - ENVELOPE
          ============================================ */}
      <div className="beat beat-14">
        {/* Flood/Humanitarian Elements */}
        <div className="emergency-stamp stamp-evakuasi" style={{top:'10%',right:'5%',transform:'rotate(-8deg)'}}>SELESAI</div>
        <div className="water-damage-edge" style={{width:'100px',height:'100px',top:0,right:0}}></div>
        <div className="caution-tape" style={{width:'100px',top:'-5px',left:'40%',transform:'rotate(1deg)'}}></div>
        <div className="candle-glow" style={{bottom:'-30px',right:'-30px'}}></div>
        <span className="page-number page-number-right">— 14 —</span>

        <h2 className="beat-title handwritten ink-bleed">Misi Selesai</h2>

        <div className="envelope-wrapper">
          <div className="envelope">
            <div className="envelope-flap"></div>
          </div>

          <div className="letter-paper">
            <h3 className="letter-heading">Untuk Indonesia,</h3>
            <p className="letter-content">
              Sebuah kehormatan bagi kami, 510 mahasiswa Politeknik Statistika
              STIS, dapat berkontribusi dalam pemulihan negeri ini. Kami telah
              menyaksikan penderitaan, mendengar tangisan, dan merasakan
              kekuatan luar biasa dari mereka yang kehilangan segalanya namun
              tetap bertahan.
            </p>
            <p className="letter-content">
              Data yang kami kumpulkan bukan sekadar angka. Ini adalah suara
              ribuan jiwa yang berharap pada kebijakan yang adil dan pemulihan
              yang nyata.
            </p>
            <div className="letter-signature">
              Salam Hormat,
              <br />
              PKL Angkatan 65
            </div>
          </div>

          <div className="wax-seal">
            <span className="seal-number">65</span>
          </div>
        </div>
      </div>

      {/* ============================================
          BEAT 15: PESAN PENUTUP
          ============================================ */}
      <div className="beat beat-15" ref={(el) => {
        if (el && !el.dataset.confettiTriggered) {
          const observer = new IntersectionObserver(
            (entries) => {
              entries.forEach((entry) => {
                if (entry.isIntersecting && !el.dataset.confettiTriggered) {
                  el.dataset.confettiTriggered = 'true';
                  setTimeout(() => {
                    triggerConfetti({ 
                      particleCount: 200, 
                      spread: 120, 
                      origin: { y: 0.6 },
                      startVelocity: 45,
                    });
                  }, 500);
                }
              });
            },
            { threshold: 0.5 }
          );
          observer.observe(el);
        }
      }}>
        {/* Flood/Humanitarian Elements */}
        <div className="aid-badge" style={{top:'8%',right:'10%'}}>
          <div className="aid-badge-content">❤️</div>
          <div className="aid-badge-text">PKL 65</div>
        </div>
        <div className="aid-badge" style={{top:'12%',left:'8%'}}>
          <div className="aid-badge-content">⛑️</div>
          <div className="aid-badge-text">RELAWAN</div>
        </div>
        <div className="relief-icon" style={{bottom:'20px',right:'20px'}}>🌈</div>
        <span className="page-number page-number-right">— 15 —</span>
        
        {/* Decorative Elements */}
        <div className="doodle-star doodle-star-4">⭐</div>
        <div className="doodle-star doodle-star-5">✨</div>
        
        <div className="closing-text">
          <p className="final-quote">
            "Data bukan hanya angka.
            <br />
            Data adalah harapan.
            <br />
            Dan kami beruntung bisa menjadi bagiannya."
          </p>
          <p className="final-credit">
            — Perjalanan Pendataan R3P
            <br />
            28 Desember 2025 - 17 Januari 2026
          </p>
        </div>

        <p className="beat-caption handwritten final">
          Terima kasih atas pengorbanan kalian.
        </p>
      </div>

      {/* NAVIGATION */}
      <div className="story-navigation">
        <Link to="/" className="nav-btn nav-btn-prev">
          <span className="nav-arrow">←</span>
          <span className="nav-text">Sebelumnya</span>
        </Link>
        <Link to="/findings" className="nav-btn nav-btn-next">
          <span className="nav-text">Berikutnya</span>
          <span className="nav-arrow">→</span>
        </Link>
      </div>
    </div>
  );
}

export default Journey;
