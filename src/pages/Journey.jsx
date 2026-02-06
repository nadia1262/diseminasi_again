import { useLayoutEffect, useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Draggable } from "gsap/Draggable";
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
      gsap.fromTo(".beat-1-title-char",
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
        }
      );

      gsap.fromTo(".beat-1-hero-img",
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
        }
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
        transformOrigin: "bottom center"
      });

      gsap.to(".beat-1-palm-right-img", {
        rotation: 2, /* Made positive to match left, assuming wrapper handles flip */
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
        repeat: -1
      });

      gsap.to(".beat-1-sun", {
        scale: 1.1,
        duration: 2,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1
      });

      gsap.fromTo(".date-text",
        {
          opacity: 0,
        },
        {
          opacity: 1,
          duration: 1,
          delay: 1,
          ease: "power2.out"
        }
      );

      // ============================================
      // BRIDGE 1: PAGE DIVIDER (TEAR EFFECT)
      // ============================================
      gsap.fromTo(".bridge-page-divider-1",
        {
          clipPath: "inset(0 100% 0 0)", /* Start fully clipped from right */
          opacity: 1,
        },
        {
          clipPath: "inset(0 0% 0 0)", /* Reveal to full width */
          duration: 1.5,
          ease: "power4.inOut", /* Strong, clearer movement */
          scrollTrigger: {
            trigger: ".bridge-page-divider-1",
            start: "top 80%",
            end: "bottom 50%",
            scrub: 1, /* Link to scroll for manual tearing feel */
          },
        }
      );

      // ============================================
      // BEAT 2: ALOKASI PETUGAS
      // ============================================
      gsap.fromTo(".beat-2",
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
            trigger: ".beat-2",
            start: "top 75%",
            end: "top 45%",
            scrub: 1,
          },
        }
      );

      gsap.fromTo(".map-sumatera",
        {
          scale: 0.85,
          opacity: 0,
        },
        {
          scale: 1,
          opacity: 1,
          duration: 0.9,
          ease: "steps(9)",
          scrollTrigger: {
            trigger: ".beat-2",
            start: "top 60%",
          },
        }
      );

      gsap.fromTo(".map-location",
        {
          scale: 0,
          opacity: 0,
        },
        {
          scale: 1,
          opacity: 1,
          duration: 0.6,
          ease: "steps(6)",
          stagger: 0.12,
          scrollTrigger: {
            trigger: ".beat-2",
            start: "top 55%",
          },
        }
      );

      gsap.fromTo(".allocation-label",
        {
          x: -30,
          opacity: 0,
        },
        {
          x: 0,
          opacity: 1,
          duration: 0.7,
          ease: "steps(7)",
          stagger: 0.15,
          scrollTrigger: {
            trigger: ".beat-2",
            start: "top 50%",
          },
        }
      );

      gsap.fromTo(".beat-2",
        {
          opacity: 1,
        },
        {
          opacity: 0,
          y: -40,
          duration: 0.6,
          ease: "steps(6)",
          scrollTrigger: {
            trigger: ".beat-2",
            start: "bottom 40%",
            end: "bottom 20%",
            scrub: 1,
          },
        }
      );

      // ============================================
      // BRIDGE 2: FOOTPRINTS
      // ============================================
      gsap.fromTo(".footprint",
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
        }
      );

      // ============================================
      // BEAT 3: KEBERANGKATAN - BOARDING PASS + PLANE
      // ============================================
      gsap.fromTo(".beat-3",
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
        }
      );

      gsap.fromTo(".boarding-pass",
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
        }
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
        }
      );

      gsap.fromTo(".luggage-item",
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
        }
      );

      gsap.to(".luggage-item", {
        y: "random(-3, 3)",
        rotation: "random(-1, 1)",
        duration: "random(4, 5)",
        ease: "steps(12)",
        repeat: -1,
        yoyo: true,
      });

      gsap.fromTo(".beat-3",
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
        }
      );

      // ============================================
      // BRIDGE 3: RAFIA WEAVE
      // ============================================
      gsap.fromTo(".bridge-rafia",
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
        }
      );

      // ============================================
      // BEAT 4: PETA POSKO
      // ============================================
      gsap.fromTo(".beat-4",
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
        }
      );

      gsap.fromTo(".posko-card",
        {
          scale: 0.9,
          opacity: 0,
          y: 25,
        },
        {
          scale: 1,
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "steps(6)",
          stagger: 0.15,
          scrollTrigger: {
            trigger: ".beat-4-posko-grid",
            start: "top 65%",
          },
        }
      );

      gsap.to(".posko-card", {
        y: "random(-4, 4)",
        rotation: "random(-0.5, 0.5)",
        duration: "random(5, 6.5)",
        ease: "steps(16)",
        repeat: -1,
        yoyo: true,
      });

      gsap.fromTo(".beat-4",
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
        }
      );

      // ============================================
      // BEAT 5: CORKBOARD - PIN NOTES
      // ============================================
      gsap.fromTo(".beat-5",
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
        }
      );

      gsap.fromTo(".cork-item",
        {
          scale: 0,
          rotation: "random(-25, 25)",
          opacity: 0,
        },
        {
          scale: 1,
          rotation: "random(-8, 8)",
          opacity: 1,
          duration: 0.5,
          ease: "steps(5)",
          stagger: 0.08,
          scrollTrigger: {
            trigger: ".corkboard",
            start: "top 60%",
          },
        }
      );

      gsap.to(".cork-item", {
        y: "random(-3, 3)",
        x: "random(-2, 2)",
        rotation: "random(-1, 1)",
        duration: "random(4.5, 6)",
        ease: "steps(14)",
        repeat: -1,
        yoyo: true,
      });

      gsap.fromTo(".beat-5",
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
        }
      );

      // ============================================
      // BEAT 6: FLATLAY - DESK SCENE
      // ============================================
      gsap.fromTo(".beat-6",
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
        }
      );

      gsap.fromTo(".flatlay-item",
        {
          scale: 0.85,
          opacity: 0,
          y: 30,
        },
        {
          scale: 1,
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "steps(6)",
          stagger: 0.12,
          scrollTrigger: {
            trigger: ".flatlay-table",
            start: "top 60%",
          },
        }
      );

      gsap.to(".flatlay-item", {
        y: "random(-2, 2)",
        rotation: "random(-0.8, 0.8)",
        duration: "random(5, 6.5)",
        ease: "steps(16)",
        repeat: -1,
        yoyo: true,
      });

      gsap.fromTo(".beat-6",
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
        }
      );

      // ============================================
      // BRIDGE 4: MUD SPLASHES
      // ============================================
      gsap.fromTo(".mud-splash",
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
        }
      );

      // ============================================
      // BEAT 7: JOURNEY COLLAGE
      // ============================================
      gsap.fromTo(".beat-7",
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
        }
      );

      gsap.fromTo(".journey-photo",
        {
          scale: 0.85,
          opacity: 0,
          y: 35,
        },
        {
          scale: 1,
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "steps(6)",
          stagger: 0.1,
          scrollTrigger: {
            trigger: ".journey-collage",
            start: "top 60%",
          },
        }
      );

      gsap.to(".journey-photo", {
        y: "random(-3, 3)",
        rotation: "random(-0.6, 0.6)",
        duration: "random(5, 6.5)",
        ease: "steps(16)",
        repeat: -1,
        yoyo: true,
      });

      gsap.fromTo(".beat-7",
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
        }
      );

      // ============================================
      // BEAT 8: DRAGGABLE CHALLENGES
      // ============================================
      gsap.fromTo(".beat-8",
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
        }
      );

      gsap.fromTo(".drag-photo",
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
        }
      );

      Draggable.create(".drag-photo", {
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

      gsap.fromTo(".beat-8",
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
        }
      );

      // ============================================
      // BRIDGE 5: TORN PAPER
      // ============================================
      gsap.fromTo(".torn-piece",
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
        }
      );

      // ============================================
      // BEAT 9: STICKY NOTES - VOICES
      // ============================================
      gsap.fromTo(".beat-9",
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
        }
      );

      gsap.fromTo(".voice-sticky",
        {
          scale: 0,
          rotation: "random(-30, 30)",
          opacity: 0,
        },
        {
          scale: 1,
          rotation: "random(-6, 6)",
          opacity: 1,
          duration: 0.5,
          ease: "steps(5)",
          stagger: 0.08,
          scrollTrigger: {
            trigger: ".sticky-wall",
            start: "top 60%",
          },
        }
      );

      gsap.to(".voice-sticky", {
        y: "random(-4, 4)",
        rotation: "random(-2, 2)",
        duration: "random(4.5, 6)",
        ease: "steps(14)",
        repeat: -1,
        yoyo: true,
      });

      gsap.fromTo(".beat-9",
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
        }
      );

      // ============================================
      // BEAT 10: PHONE DEVICE - CHAT LOGS
      // ============================================
      gsap.fromTo(".beat-10",
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
        }
      );

      gsap.fromTo(".phone-device",
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
        }
      );

      gsap.to(".phone-device", {
        y: "random(-5, 5)",
        rotation: "random(-0.5, 0.5)",
        duration: "random(5.5, 7)",
        ease: "steps(18)",
        repeat: -1,
        yoyo: true,
      });

      gsap.fromTo(".chat-bubble",
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
        }
      );

      gsap.fromTo(".beat-10",
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
        }
      );

      // ============================================
      // BEAT 11: FASIH SCREEN - PROGRESS
      // ============================================
      gsap.fromTo(".beat-11",
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
        }
      );

      gsap.fromTo(".fasih-device",
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
        }
      );

      gsap.to(".fasih-device", {
        y: "random(-4, 4)",
        rotation: "random(-0.4, 0.4)",
        duration: "random(5.5, 7)",
        ease: "steps(18)",
        repeat: -1,
        yoyo: true,
      });

      gsap.fromTo(".metric-row",
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
        }
      );

      gsap.fromTo(".progress-bar-fill",
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
        }
      );

      gsap.fromTo(".beat-11",
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
        }
      );

      // ============================================
      // BEAT 12: HEALTH SECTION
      // ============================================
      gsap.fromTo(".beat-12",
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
        }
      );

      gsap.fromTo(".medicine-box",
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
        }
      );

      gsap.to(".medicine-box", {
        y: "random(-3, 3)",
        rotation: "random(-1, 1)",
        duration: "random(4.5, 6)",
        ease: "steps(14)",
        repeat: -1,
        yoyo: true,
      });

      gsap.fromTo(".health-bar",
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
        }
      );

      gsap.fromTo(".beat-12",
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
        }
      );

      // ============================================
      // BRIDGE 6: MARKER LINE
      // ============================================
      gsap.fromTo(".marker-line",
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
        }
      );

      // ============================================
      // BEAT 13: POLAROID PILE
      // ============================================
      gsap.fromTo(".beat-13",
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
        }
      );

      gsap.fromTo(".polaroid-card",
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
        }
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

      gsap.fromTo(".beat-13",
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
        }
      );

      // ============================================
      // BEAT 14: ENVELOPE & LETTER
      // ============================================
      gsap.fromTo(".beat-14",
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
        }
      );

      gsap.fromTo(".envelope",
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
        }
      );

      gsap.fromTo(".envelope-flap",
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
        }
      );

      gsap.fromTo(".letter-paper",
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
        }
      );

      gsap.fromTo(".wax-seal",
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
        }
      );

      gsap.to(".wax-seal", {
        rotation: "random(-2, 2)",
        duration: "random(5, 6.5)",
        ease: "steps(16)",
        repeat: -1,
        yoyo: true,
      });

      gsap.fromTo(".beat-14",
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
        }
      );

      // ============================================
      // BEAT 15: CLOSING
      // ============================================
      gsap.fromTo(".beat-15",
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
        }
      );

      gsap.fromTo(".final-quote",
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
        }
      );

      gsap.fromTo(".final-credit",
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
        }
      );

      gsap.fromTo(".beat-caption.final",
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
        }
      );
    }, canvasRef);

    return () => ctx.revert();
  }, [isReady]);

  if (!isReady) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <div className="loading-text">Memuat Perjalanan...</div>
          <div className="loading-bar">
            <div className="loading-fill" style={{ width: `${loadProgress}%` }}></div>
          </div>
          <div className="loading-percentage">{loadProgress}%</div>
        </div>
      </div>
    );
  }

  return (
    <div ref={canvasRef} className="story-canvas">
      {/* ============================================
          BEAT 1: COVER
          ============================================ */}
      <div className="beat beat-1">
        <div className="grain-overlay"></div>
        <img src={sawit2} className="beat-1-palm-left" alt="Pohon Sawit Kiri" />
        <div className="beat-1-palm-right-wrapper">
          <img src={sawit2} className="beat-1-palm-right-img" alt="Pohon Sawit Kanan" />
        </div>

        <h1 className="beat-1-title">
          {"Pendataan R3P".split("").map((char, i) => (
            <span key={i} className="beat-1-title-char">{char}</span>
          ))}
        </h1>

        <div className="beat-1-hero-container">
          <div className="beat-1-hero-img">
            <div className="frame-content"></div>
            <img src={matahari} className="beat-1-sun" alt="Matahari" />
            <div className="polaroid-caption">
              <span className="date-text">14 Januari 2026 - 3 Februari 2026</span>
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
        <h2 className="beat-title">Alokasi Petugas</h2>

        <div className="beat-2-map-viz">
          {/* Peta Sumatera di tengah */}
          <img src={sumatera} className="map-sumatera" alt="Peta Sumatera" />

          {/* Lokasi Aceh - Kiri Atas */}
          <div className="map-location loc-aceh">
            <img src={point} className="loc-pin" alt="Pin Aceh" />
            <img src={pesawat} className="loc-plane plane-aceh" alt="Pesawat Aceh" />
            <img src={arrow} className="flight-path path-aceh" alt="Arrow Aceh" />
          </div>

          {/* Lokasi Sumatera Utara - Kanan Atas */}
          <div className="map-location loc-sumut">
            <img src={point} className="loc-pin" alt="Pin Sumatera Utara" />
            <img src={pesawat} className="loc-plane plane-sumut" alt="Pesawat Sumut" />
            <img src={arrow} className="flight-path path-sumut" alt="Arrow Sumut" />
          </div>

          {/* Lokasi Sumatera Barat - Kanan Bawah */}
          <div className="map-location loc-sumbar">
            <img src={point} className="loc-pin" alt="Pin Sumatera Barat" />
            <img src={pesawat} className="loc-plane plane-sumbar" alt="Pesawat Sumbar" />
            <img src={arrow} className="flight-path path-sumbar" alt="Arrow Sumbar" />
          </div>
        </div>

        {/* Label Info - Outside map, absolute positioned */}
        <div className="allocation-label label-aceh">
          <h3 className="alloc-region">Aceh</h3>
          <p className="alloc-detail">270 Mahasiswa</p>
          <p className="alloc-detail">29 PML</p>
        </div>

        <div className="allocation-label label-sumut">
          <h3 className="alloc-region">Sumatera Utara</h3>
          <p className="alloc-detail">210 Mahasiswa</p>
          <p className="alloc-detail">21 PML</p>
        </div>

        <div className="allocation-label label-sumbar">
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

      {/* ============================================
          BEAT 3: KEBERANGKATAN
          ============================================ */}
      <div className="beat beat-3">
        <h2 className="beat-title handwritten">Keberangkatan</h2>

        <div className="boarding-pass">
          <div className="pass-header">
            <span className="pass-airline">✈️ PENUGASAN R3P</span>
            <span className="pass-code">PKL65-R3P</span>
          </div>

          <div className="pass-body">
            <div className="pass-section">
              <div className="pass-label">Dari</div>
              <div className="pass-value">Jakarta</div>
            </div>

            <div className="pass-section">
              <div className="pass-label">Ke</div>
              <div className="pass-value">51 Posko</div>
            </div>

            <div className="pass-section">
              <div className="pass-label">Tanggal</div>
              <div className="pass-value">28 Des 2025</div>
            </div>

            <div className="pass-section">
              <div className="pass-label">Peserta</div>
              <div className="pass-value">510 Mahasiswa</div>
            </div>
          </div>

          <div className="pass-footer">
            <div className="pass-barcode">|||||| |||| ||||| |||| |||||</div>
          </div>
        </div>

        <div className="airplane-visual">✈️</div>

        <div className="luggage-items">
          <div className="luggage-item">🎒 Tas Lapangan</div>
          <div className="luggage-item">📋 Formulir Sensus</div>
          <div className="luggage-item">📱 Tablet FASIH</div>
          <div className="luggage-item">🔋 Power Bank</div>
          <div className="luggage-item">❤️ Semangat Tim</div>
        </div>
      </div>

      {/* BRIDGE 3: RAFIA WEAVE */}
      <div className="bridge-rafia"></div>

      {/* ============================================
          BEAT 4: PETA POSKO
          ============================================ */}
      <div className="beat beat-4">
        <h2 className="beat-title handwritten">Peta Posko Kami</h2>

        <div className="beat-4-posko-grid">
          <div className="posko-card">
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

        <p className="beat-caption handwritten">51 titik harapan di seluruh wilayah bencana.</p>
      </div>

      {/* ============================================
          BEAT 5: CORKBOARD - CATATAN HARIAN
          ============================================ */}
      <div className="beat beat-5">
        <h2 className="beat-title handwritten">Catatan dari Lapangan</h2>

        <div className="corkboard">
          <div className="cork-item photo-note" style={{ left: "8%", top: "12%" }}>
            <img src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=250&h=280&fit=crop" alt="Pagi hari" />
            <p className="photo-note">Hari 1: Pagi yang berat</p>
            <div className="pin">📌</div>
          </div>

          <div className="cork-item sticky-note yellow" style={{ left: "42%", top: "18%", rotate: "3deg" }}>
            <p>"Rumah pertama yang kami kunjungi... ibu-ibu menangis saat cerita."</p>
            <div className="pin">📌</div>
          </div>

          <div className="cork-item photo-note" style={{ left: "72%", top: "15%" }}>
            <img src="https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=250&h=280&fit=crop" alt="Survey" />
            <p className="photo-note">Door to door survey</p>
            <div className="pin">📌</div>
          </div>

          <div className="cork-item sticky-note pink" style={{ left: "15%", top: "55%", rotate: "-5deg" }}>
            <p>"Target hari ini: 40 KK. Baru 18 KK, tapi kaki sudah pegal."</p>
            <div className="pin">📌</div>
          </div>

          <div className="cork-item photo-note" style={{ left: "48%", top: "58%" }}>
            <img src="https://images.unsplash.com/photo-1557804506-669a67965ba0?w=250&h=280&fit=crop" alt="Istirahat" />
            <p className="photo-note">Istirahat sejenak</p>
            <div className="pin">📌</div>
          </div>

          <div className="cork-item sticky-note green" style={{ left: "78%", top: "62%", rotate: "4deg" }}>
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
        <h2 className="beat-title handwritten">Meja Kerja Malam</h2>

        <div className="flatlay-table">
          <div className="flatlay-item" style={{ left: "10%", top: "15%", rotate: "-6deg" }}>
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

          <div className="flatlay-item" style={{ left: "45%", top: "12%", rotate: "2deg" }}>
            <div className="item-tablet">
              <div className="tablet-screen">
                <div className="app-icon">📊</div>
                <div className="app-name">FASIH</div>
                <div className="app-status">Sync: 47/50</div>
              </div>
            </div>
          </div>

          <div className="flatlay-item" style={{ left: "72%", top: "18%", rotate: "-3deg" }}>
            <div className="item-photo">
              <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=200&h=200&fit=crop" alt="Tim malam" />
            </div>
          </div>

          <div className="flatlay-item" style={{ left: "18%", top: "58%", rotate: "5deg" }}>
            <div className="item-coffee">☕</div>
            <p className="item-label">Kopi ke-4</p>
          </div>

          <div className="flatlay-item" style={{ left: "52%", top: "62%", rotate: "-4deg" }}>
            <div className="item-notes">
              <div className="notes-title">To-Do Besok:</div>
              <div className="notes-list">
                ☐ Verifikasi data
                <br />
                ☐ Follow-up KK reject
                <br />
                ☐ Submit laporan
              </div>
            </div>
          </div>

          <div className="flatlay-item" style={{ left: "78%", top: "65%", rotate: "3deg" }}>
            <div className="item-clock">🕐 02:47</div>
          </div>
        </div>

        <p className="beat-caption handwritten">Malam adalah waktu kami merekap harapan.</p>
      </div>

      {/* BRIDGE 4: MUD SPLASHES */}
      <div className="bridge-mud">
        <div className="mud-splash" style={{ width: "80px", height: "80px", left: "15%", top: "25%" }}></div>
        <div className="mud-splash" style={{ width: "110px", height: "110px", left: "45%", top: "40%" }}></div>
        <div className="mud-splash" style={{ width: "95px", height: "95px", left: "72%", top: "30%" }}></div>
        <div className="mud-splash" style={{ width: "65px", height: "65px", left: "28%", top: "65%" }}></div>
        <div className="mud-splash" style={{ width: "88px", height: "88px", left: "60%", top: "70%" }}></div>
      </div>

      {/* ============================================
          BEAT 7: JOURNEY COLLAGE
          ============================================ */}
      <div className="beat beat-7">
        <h2 className="beat-title handwritten">Perjalanan Visual</h2>

        <div className="journey-collage">
          <div className="journey-photo" style={{ left: "8%", top: "10%", rotate: "-7deg", width: "280px" }}>
            <img src="https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=280&h=320&fit=crop" alt="Jalan becek" />
            <p className="journey-caption">Jalan becek pagi hari</p>
          </div>

          <div className="journey-photo" style={{ left: "38%", top: "8%", rotate: "4deg", width: "300px" }}>
            <img src="https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=300&h=340&fit=crop" alt="Wawancara" />
            <p className="journey-caption">Wawancara dengan warga</p>
          </div>

          <div className="journey-photo" style={{ left: "70%", top: "12%", rotate: "-3deg", width: "260px" }}>
            <img src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=260&h=300&fit=crop" alt="Tim" />
            <p className="journey-caption">Tim yang solid</p>
          </div>

          <div className="journey-photo" style={{ left: "12%", top: "52%", rotate: "6deg", width: "270px" }}>
            <img src="https://images.unsplash.com/photo-1557804506-669a67965ba0?w=270&h=310&fit=crop" alt="Diskusi" />
            <p className="journey-caption">Diskusi strategi</p>
          </div>

          <div className="journey-photo" style={{ left: "42%", top: "55%", rotate: "-5deg", width: "290px" }}>
            <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=290&h=330&fit=crop" alt="Istirahat" />
            <p className="journey-caption">Istirahat sejenak</p>
          </div>

          <div className="journey-photo" style={{ left: "72%", top: "58%", rotate: "3deg", width: "265px" }}>
            <img src="https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=265&h=305&fit=crop" alt="Semangat" />
            <p className="journey-caption">Semangat pantang menyerah</p>
          </div>
        </div>

        <p className="beat-caption handwritten">Setiap foto adalah saksi perjalanan kami.</p>
      </div>

      {/* ============================================
          BEAT 8: DRAGGABLE CHALLENGES
          ============================================ */}
      <div className="beat beat-8">
        <h2 className="beat-title handwritten">Tantangan yang Kami Hadapi</h2>
        <p className="beat-intro">(Geser foto untuk melihat lebih dekat)</p>

        <div className="beat-8-drag-area">
          <div className="drag-photo" style={{ left: "10%", top: "12%", rotate: "-6deg" }}>
            <img src="https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=240&h=280&fit=crop" alt="Jalan rusak" />
            <p className="drag-caption">Jalan rusak & becek</p>
          </div>

          <div className="drag-photo" style={{ left: "42%", top: "15%", rotate: "4deg" }}>
            <img src="https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=240&h=280&fit=crop" alt="Cuaca ekstrem" />
            <p className="drag-caption">Cuaca tak menentu</p>
          </div>

          <div className="drag-photo" style={{ left: "72%", top: "10%", rotate: "-3deg" }}>
            <img src="https://images.unsplash.com/photo-1551836022-4c4c79ecde51?w=240&h=280&fit=crop" alt="Rumah rusak" />
            <p className="drag-caption">Kondisi rumah parah</p>
          </div>

          <div className="drag-photo" style={{ left: "18%", top: "58%", rotate: "5deg" }}>
            <img src="https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=240&h=280&fit=crop" alt="Sinyal lemah" />
            <p className="drag-caption">Sinyal hilang-muncul</p>
          </div>

          <div className="drag-photo" style={{ left: "52%", top: "62%", rotate: "-4deg" }}>
            <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=240&h=280&fit=crop" alt="Lelah" />
            <p className="drag-caption">Kelelahan fisik</p>
          </div>

          <div className="drag-photo" style={{ left: "78%", top: "60%", rotate: "3deg" }}>
            <img src="https://images.unsplash.com/photo-1557804506-669a67965ba0?w=240&h=280&fit=crop" alt="Emosional" />
            <p className="drag-caption">Beban emosional</p>
          </div>
        </div>

        <p className="beat-caption handwritten">Tapi kami tetap maju.</p>
      </div>

      {/* BRIDGE 5: TORN PAPER */}
      <div className="bridge-torn">
        <div className="torn-piece" style={{ width: "180px", height: "140px", left: "12%", top: "15%", rotate: "-8deg" }}></div>
        <div className="torn-piece" style={{ width: "200px", height: "120px", left: "45%", top: "25%", rotate: "5deg" }}></div>
        <div className="torn-piece" style={{ width: "170px", height: "150px", left: "72%", top: "20%", rotate: "-4deg" }}></div>
        <div className="torn-piece" style={{ width: "160px", height: "130px", left: "28%", top: "60%", rotate: "6deg" }}></div>
      </div>

      {/* ============================================
          BEAT 9: STICKY NOTES - VOICES
          ============================================ */}
      <div className="beat beat-9">
        <h2 className="beat-title handwritten">Suara dari Lapangan</h2>

        <div className="sticky-wall">
          <div className="voice-sticky yellow" style={{ left: "8%", top: "10%", rotate: "-6deg" }}>
            <p>"Kami dengar cerita mereka. Kami rasakan kesedihannya. Tapi kami harus tetap profesional."</p>
            <span className="sticky-author">— Tim Wawancara</span>
          </div>

          <div className="voice-sticky pink" style={{ left: "40%", top: "8%", rotate: "4deg" }}>
            <p>"Ada ibu yang bilang: 'Kalian datang membawa harapan.' Itu yang bikin kami kuat."</p>
            <span className="sticky-author">— Enumerator Posko B3</span>
          </div>

          <div className="voice-sticky green" style={{ left: "72%", top: "12%", rotate: "-3deg" }}>
            <p>"Setiap form yang kami isi = 1 keluarga lebih dekat ke bantuan."</p>
            <span className="sticky-author">— Koordinator Lapangan</span>
          </div>

          <div className="voice-sticky blue" style={{ left: "12%", top: "42%", rotate: "5deg" }}>
            <p>"Pernah nangis diam-diam di toilet posko. Tapi besoknya tetap turun lagi."</p>
            <span className="sticky-author">— Mahasiswa PKL</span>
          </div>

          <div className="voice-sticky orange" style={{ left: "45%", top: "45%", rotate: "-4deg" }}>
            <p>"Target bukan cuma angka. Target adalah kehidupan yang harus dipulihkan."</p>
            <span className="sticky-author">— Supervisor</span>
          </div>

          <div className="voice-sticky yellow" style={{ left: "75%", top: "48%", rotate: "3deg" }}>
            <p>"Kami bukan pahlawan. Kami cuma mahasiswa yang diberi amanah."</p>
            <span className="sticky-author">— Ketua Tim</span>
          </div>

          <div className="voice-sticky pink" style={{ left: "18%", top: "75%", rotate: "-5deg" }}>
            <p>"Kadang capek bukan dari jalan kaki. Tapi dari liat orang yang kehilangan segalanya tetap tersenyum."</p>
            <span className="sticky-author">— Field Officer</span>
          </div>

          <div className="voice-sticky green" style={{ left: "52%", top: "78%", rotate: "6deg" }}>
            <p>"3 minggu ini mengubah cara saya lihat data. Data itu nyawa."</p>
            <span className="sticky-author">— Data Entry</span>
          </div>
        </div>

        <p className="beat-caption handwritten big">Ini bukan hanya pengalaman kerja. Ini pelajaran hidup.</p>
      </div>

      {/* ============================================
          BEAT 10: PHONE DEVICE - GROUP CHAT
          ============================================ */}
      <div className="beat beat-10">
        <h2 className="beat-title handwritten">Grup Chat Posko</h2>

        <div className="phone-device">
          <div className="phone-notch"></div>

          <div className="chat-header">
            <div className="chat-title">💬 Posko A1 - Tim Solid</div>
            <div className="chat-members">10 anggota</div>
          </div>

          <div className="chat-screen">
            <div className="chat-bubble left">
              <p className="chat-text">Guys, hari ini berat banget. Baru 12 KK 😭</p>
              <span className="chat-time">08:47</span>
            </div>

            <div className="chat-bubble right">
              <p className="chat-text">Sama, jalanan becek parah. Tapi semangat!</p>
              <span className="chat-time">08:50</span>
            </div>

            <div className="chat-bubble left">
              <p className="chat-text">Tablet ku error lagi, ada yang bisa bantu? 🥲</p>
              <span className="chat-time">09:15</span>
            </div>

            <div className="chat-bubble right">
              <p className="chat-text">Udah coba restart? Nanti aku bantu pas istirahat</p>
              <span className="chat-time">09:18</span>
            </div>

            <div className="chat-bubble left">
              <p className="chat-text">Tadi ketemu ibu2 yg cerita sambil nangis 💔</p>
              <span className="chat-time">11:32</span>
            </div>

            <div className="chat-bubble right">
              <p className="chat-text">Sama... kadang ga tau harus bilang apa</p>
              <span className="chat-time">11:35</span>
            </div>

            <div className="chat-bubble system">
              <p className="chat-text">📊 Update Progress: 38/50 KK hari ini</p>
              <span className="chat-time">14:20</span>
            </div>

            <div className="chat-bubble left">
              <p className="chat-text">SEMANGAT TEMAN-TEMAN! Kita pasti bisa! 💪</p>
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

        <p className="beat-caption handwritten">Grup chat = tempat kami saling menguatkan.</p>
      </div>

      {/* ============================================
          BEAT 11: FASIH SCREEN - PROGRESS TRACKING
          ============================================ */}
      <div className="beat beat-11">
        <h2 className="beat-title handwritten">Monitoring Real-Time</h2>

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
                  <div className="progress-bar-fill green" style={{ width: "91.6%" }}></div>
                </div>
                <div className="metric-value">3847 / 4200</div>
              </div>

              <div className="metric-row">
                <div className="metric-label">Tersubmit</div>
                <div className="progress-bar-container">
                  <div className="progress-bar-fill blue" style={{ width: "86.2%" }}></div>
                </div>
                <div className="metric-value">3621 / 4200</div>
              </div>

              <div className="metric-row">
                <div className="metric-label">Ditolak</div>
                <div className="progress-bar-container">
                  <div className="progress-bar-fill red" style={{ width: "4.3%" }}></div>
                </div>
                <div className="metric-value">182</div>
              </div>

              <div className="metric-row">
                <div className="metric-label">Approved</div>
                <div className="progress-bar-container">
                  <div className="progress-bar-fill yellow" style={{ width: "81.9%" }}></div>
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
        <h2 className="beat-title handwritten">Kondisi Tim</h2>

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
        <h2 className="beat-title handwritten">3 Minggu yang Bermakna</h2>

        <div className="polaroid-pile">
          <div className="polaroid-card" style={{ left: "50%", top: "45%", transform: "translate(-50%, -50%) rotate(-8deg)", zIndex: 1 }} data-rotation="-8">
            <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=350&h=400&fit=crop" alt="Tim kompak" />
            <p className="polaroid-caption">Tim kompak</p>
          </div>

          <div className="polaroid-card" style={{ left: "50%", top: "50%", transform: "translate(-50%, -50%) rotate(5deg)", zIndex: 2 }} data-rotation="5">
            <img src="https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=350&h=400&fit=crop" alt="Senyum lelah" />
            <p className="polaroid-caption">Senyum di tengah lelah</p>
          </div>

          <div className="polaroid-card" style={{ left: "50%", top: "48%", transform: "translate(-50%, -50%) rotate(-3deg)", zIndex: 3 }} data-rotation="-3">
            <img src="https://images.unsplash.com/photo-1551836022-4c4c79ecde51?w=350&h=400&fit=crop" alt="Dokumentasi" />
            <p className="polaroid-caption">Dokumentasi bersama</p>
          </div>

          <div className="polaroid-card" style={{ left: "50%", top: "52%", transform: "translate(-50%, -50%) rotate(7deg)", zIndex: 4 }} data-rotation="7">
            <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=350&h=400&fit=crop" alt="Kerja sama" />
            <p className="polaroid-caption">Kerja sama solid</p>
          </div>

          <div className="polaroid-card" style={{ left: "50%", top: "50%", transform: "translate(-50%, -50%) rotate(-2deg)", zIndex: 5 }} data-rotation="-2">
            <img src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=350&h=400&fit=crop" alt="Momen haru" />
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
        <h2 className="beat-title handwritten">Misi Selesai</h2>

        <div className="envelope-wrapper">
          <div className="envelope">
            <div className="envelope-flap"></div>
          </div>

          <div className="letter-paper">
            <h3 className="letter-heading">Untuk Indonesia,</h3>
            <p className="letter-content">
              Sebuah kehormatan bagi kami, 510 mahasiswa Politeknik Statistika STIS, dapat berkontribusi dalam pemulihan negeri ini. Kami telah menyaksikan penderitaan, mendengar tangisan, dan merasakan kekuatan luar biasa dari mereka yang
              kehilangan segalanya namun tetap bertahan.
            </p>
            <p className="letter-content">Data yang kami kumpulkan bukan sekadar angka. Ini adalah suara ribuan jiwa yang berharap pada kebijakan yang adil dan pemulihan yang nyata.</p>
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
      <div className="beat beat-15">
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

        <p className="beat-caption handwritten final">Terima kasih atas pengorbanan kalian.</p>
      </div>

      {/* NAVIGATION
      <div className="story-navigation">
        <Link to="/" className="nav-btn back">
          ← Kembali
        </Link>
      </div> */}
    </div>
  );
}

export default Journey;