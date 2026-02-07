import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Heart,
  TrendingUp,
  Lightbulb,
  CheckCircle,
  Eye,
  Sparkles,
  BookOpen,
  BarChart3,
  Layers,
  MapPin,
  Users,
  Home,
  Droplet,
  Stethoscope,
  Paperclip,
  Image,
  Camera,
  Bookmark,
  StickyNote,
  Star,
  Compass,
} from "lucide-react";
import "./Findings.css";
import locationPinImage from "../assets/web-story-2/location.png";
import bencana1 from "../assets/web-story-2/bencana1.jpg";
import bencana2 from "../assets/web-story-2/bencana2.jpg";
import bencana3 from "../assets/web-story-2/bencana3.jpg";
import bencana4 from "../assets/web-story-2/bencana4.jpg";
import pengungsian from "../assets/web-story-2/pengungsian.jpg";
import relawan from "../assets/web-story-2/relawan.jpg";
import warga1 from "../assets/web-story-2/warga1.jpg";
import warga2 from "../assets/web-story-2/warga2.jpg";
import warga3 from "../assets/web-story-2/warga3.jpg";
import warga4 from "../assets/web-story-2/warga4.jpg";
import warga5 from "../assets/web-story-2/warga5.jpg";
import wawancara from "../assets/web-story-2/wawancara.jpg";

// Helper function to load district GeoJSON from R3P-Kab-Geojeson.geojson
const loadDistrictsData = async () => {
  try {
    const url = new URL(
      "../assets/web-story-2/R3P-Kab-GeoJSON.geojson",
      import.meta.url,
    ).href;
    const response = await fetch(url);

    if (!response.ok) {
      console.warn(`Failed to load R3P-Kab-GeoJSON: ${response.statusText}`);
      return { type: "FeatureCollection", features: [] };
    }

    const geojson = await response.json();

    // Filter for target provinces: Aceh, Sumatera Utara, Sumatera Barat
    const targetProvinces = ["ACEH", "SUMATERA UTARA", "SUMATERA BARAT"];
    const filteredFeatures = geojson.features.filter((f) =>
      targetProvinces.includes(f.properties.nmprov),
    );

    // Map properties to match expected format
    const allFeatures = filteredFeatures.map((f) => ({
      ...f,
      properties: {
        ...f.properties,
        province: f.properties.nmprov,
        districtName: f.properties.nmkab || f.properties.name,
      },
    }));

    console.log(
      `Districts loading complete: ${allFeatures.length} features loaded from R3P-Kab-GeoJSON`,
    );

    return {
      type: "FeatureCollection",
      features: allFeatures,
    };
  } catch (err) {
    console.error("Error loading districts data:", err);
    return { type: "FeatureCollection", features: [] };
  }
};

gsap.registerPlugin(ScrollTrigger);

// Helper function to calculate bounds of features
const calculateBounds = (features) => {
  if (!features || features.length === 0) return null;

  let minLng = Infinity,
    minLat = Infinity,
    maxLng = -Infinity,
    maxLat = -Infinity;

  features.forEach((feature) => {
    const coords = feature.geometry.coordinates;
    const processCoords = (coords) => {
      if (typeof coords[0] === "number") {
        // [lng, lat]
        const [lng, lat] = coords;
        minLng = Math.min(minLng, lng);
        maxLng = Math.max(maxLng, lng);
        minLat = Math.min(minLat, lat);
        maxLat = Math.max(maxLat, lat);
      } else {
        // nested array
        coords.forEach(processCoords);
      }
    };

    if (feature.geometry.type === "Polygon") {
      feature.geometry.coordinates.forEach((ring) => processCoords(ring));
    } else if (feature.geometry.type === "MultiPolygon") {
      feature.geometry.coordinates.forEach((polygon) => {
        polygon.forEach((ring) => processCoords(ring));
      });
    }
  });

  return [
    [minLng, minLat],
    [maxLng, maxLat],
  ];
};

function Findings() {
  const skalaMapRef = useRef(null);
  const impactMapContainer = useRef(null);
  const impactMap = useRef(null);

  const mainContainer = useRef(null);
  const heroSection = useRef(null);
  const skalaSection = useRef(null);
  const impactSection = useRef(null);
  const evacuationSection = useRef(null);
  const insightSection = useRef(null);
  const interviewSection = useRef(null);
  const titleRef = useRef(null);
  const heroSubtitleRef = useRef(null);
  const heroPhotoRef = useRef(null);
  const decorElements = useRef({});
  const disasterCards = useRef([]);
  const temuanSection = useRef(null);
  const temuanTrack = useRef(null);
  const [skalaStep, setSkalaStep] = useState(0);
  const [activeDisaster, setActiveDisaster] = useState(0);
  const [districtsData, setDistrictsData] = useState(null);
  const [r3pKabData, setR3pKabData] = useState(null);
  const skalaMarkersRef = useRef([]);

  // Disaster/Impact data - Continuous flow of disaster impact
  const disasterData = [
    {
      id: 1,
      title: "Banjir Bandang",
      image: bencana1,
      description: "Kerusakan Hunian",
      story:
        "Banjir bandang menyapu area permukiman dengan kecepatan tinggi, menyebabkan kerusakan berat pada infrastruktur hunian. Rumah-rumah tergerus arus deras, struktur bangunan roboh, dan tiang penyangga hancur total.",
      stats: [
        {
          label: "Rumah Rusak Berat",
          value: "2,450",
          suffix: "unit",
          color: "#FF6B6B",
        },
        {
          label: "Rumah Rusak Sedang",
          value: "1,820",
          suffix: "unit",
          color: "#FFA500",
        },
        {
          label: "Rumah Rusak Ringan",
          value: "3,580",
          suffix: "unit",
          color: "#FFD166",
        },
      ],
      impact: "Lebih dari 8,000 keluarga kehilangan tempat tinggal.",
    },
    {
      id: 2,
      title: "Gempa Bumi",
      image: bencana2,
      description: "Banyak Rumah Butuh Perbaikan",
      story:
        "Gempa berkekuatan tinggi menggetarkan wilayah dengan intensitas yang merusak. Dinding retak, atap jebol, dan banyak rumah mengalami kerusakan struktural yang memerlukan perbaikan intensif.",
      stats: [
        {
          label: "Rumah Rusak Berat",
          value: "1,950",
          suffix: "unit",
          color: "#FF6B6B",
        },
        {
          label: "Rumah Rusak Sedang",
          value: "2,340",
          suffix: "unit",
          color: "#FFA500",
        },
        {
          label: "Rumah Butuh Renovasi",
          value: "4,200",
          suffix: "unit",
          color: "#FFD166",
        },
      ],
      impact:
        "Proses pemulihan memerlukan materi konstruksi dan tenaga kerja besar.",
    },
    {
      id: 3,
      title: "Longsor Lahan",
      image: bencana3,
      description: "Dampak Hunian Permanen",
      story:
        "Longsor menghancurkan area hunian di lereng bukit dengan daya rusak yang sangat besar. Memporak-porandakan rumah dan membuat lahan tidak layak untuk permukiman.",
      stats: [
        {
          label: "Rumah Hilang Total",
          value: "1,200",
          suffix: "unit",
          color: "#FF6B6B",
        },
        {
          label: "Lahan Tak Layak Pakai",
          value: "125",
          suffix: "hektar",
          color: "#FFA500",
        },
        {
          label: "Keluarga Relokasi",
          value: "3,650",
          suffix: "keluarga",
          color: "#FFD166",
        },
      ],
      impact: "Diperlukan relokasi dan pembangunan hunian baru di lokasi aman.",
    },
  ];

  // Evacuation/Emergency Condition Data
  const evacuationData = [
    {
      id: 1,
      title: "Titik Evakuasi Utama",
      image: pengungsian,
      stats: [
        {
          label: "Lokasi Evakuasi",
          value: "24",
          suffix: "titik",
          icon: MapPin,
          color: "#FF6B6B",
        },
        {
          label: "Pengungsi",
          value: "12,450",
          suffix: "orang",
          icon: Users,
          color: "#FFA500",
        },
        {
          label: "Keluarga Terdampak",
          value: "3,580",
          suffix: "keluarga",
          icon: Home,
          color: "#FFD166",
        },
      ],
    },
    {
      id: 2,
      title: "Hunian Darurat",
      image: relawan,
      stats: [
        {
          label: "Huntara Berdiri",
          value: "18",
          suffix: "unit",
          icon: Home,
          color: "#FF6B6B",
        },
        {
          label: "Kapasitas Penampung",
          value: "8,900",
          suffix: "orang",
          icon: Users,
          color: "#FFA500",
        },
        {
          label: "Ketersediaan Tempat",
          value: "65%",
          suffix: "terisi",
          icon: BarChart3,
          color: "#FFD166",
        },
      ],
    },
  ];

  // Interview / Wawancara data
  const interviewSlides = [
    {
      image: wawancara,
      caption: "Proses wawancara langsung dengan warga terdampak bencana",
      quote:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod.",
    },
    {
      image: warga1,
      caption: "Warga menceritakan pengalaman saat bencana melanda",
      quote:
        "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium.",
    },
    {
      image: warga2,
      caption: "Pendataan kondisi keluarga di lokasi pengungsian",
      quote:
        "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.",
    },
  ];

  // Kebutuhan Warga Insight data
  const needsData = [
    {
      id: 1,
      title: "Air Bersih",
      icon: Droplet,
      color: "#FFEA8A",
      colorLight: "rgba(255, 234, 138, 0.18)",
      description:
        "Akses air bersih adalah prioritas utama untuk kesehatan dan kebersihan harian warga terdampak.",
      stats: "8,450",
      statsLabel: "keluarga membutuhkan",
      percentage: 78,
      detail:
        "Sumber air tercemar akibat banjir dan longsor di 3 provinsi terdampak.",
    },
    {
      id: 2,
      title: "Tempat Tinggal",
      icon: Home,
      color: "#FFEA8A",
      colorLight: "rgba(255, 209, 102, 0.18)",
      description:
        "Rumah yang aman dan layak huni menjadi fondasi pemulihan berkelanjutan untuk masa depan yang lebih baik.",
      stats: "6,200",
      statsLabel: "unit hunian diperlukan",
      percentage: 64,
      detail: "Mayoritas rumah rusak berat dan tidak layak huni pasca bencana.",
    },
    {
      id: 3,
      title: "Kesehatan",
      icon: Stethoscope,
      color: "#FFEA8A",
      colorLight: "rgba(255, 165, 0, 0.18)",
      description:
        "Layanan kesehatan yang terjangkau dan berkualitas memastikan pemulihan fisik dan mental masyarakat.",
      stats: "3,580",
      statsLabel: "orang perlu bantuan medis",
      percentage: 52,
      detail:
        "Puskesmas dan fasilitas kesehatan turut rusak terdampak bencana.",
    },
  ];

  // Regional data with coordinates for card positioning
  const regionsData = [
    {
      id: 0,
      name: "Aceh",
      coordinates: [95.2, 4.7],
      cardPosition: { top: "5%", right: "30px" },
      icon: Eye,
      buildings: 2145,
      people: 8932,
      cities: ["Banda Aceh", "Lhokseumawe"],
      stats: [
        { label: "PCL", value: "300 unit" },
        { label: "PML", value: "30 unit" },
        { label: "Infrastruktur Rusak", value: "23 km jalan" },
      ],
      damage: [
        { type: "Berat", count: 1200 },
        { type: "Sedang", count: 650 },
        { type: "Ringan", count: 295 },
      ],
      damageDetails: [
        { icon: "🏠", label: "Hunian Rusak Total", value: "1,200" },
        { icon: "🏢", label: "Bangunan Publik", value: "45" },
        { icon: "🛣️", label: "Jalan Rusak", value: "23 km" },
        { icon: "💧", label: "Sumber Air Tercemar", value: "8" },
      ],
      photo: bencana1,
      photoCaption:
        "Kondisi banjir bandang di Aceh - dampak bencana alam yang signifikan",
      facilities: ["Sekolah", "Rumah Sakit", "Puskesmas"],
      stories:
        "Komunitas Aceh telah menunjukkan ketangguhan luar biasa dalam pemulihan.",
      needs: ["Shelter", "Makanan", "Obat-obatan", "Air Bersih"],
      progress: 65,
    },
    {
      id: 1,
      name: "Sumatera Utara",
      coordinates: [100.0, 1.5],
      cardPosition: { top: "50%", left: "30px" },
      icon: BarChart3,
      buildings: 3421,
      people: 15678,
      cities: ["Medan", "Binjai", "Pematangsiantar"],
      stats: [
        { label: "PCL", value: "180 unit" },
        { label: "PML", value: "18 unit" },
        { label: "Infrastruktur Rusak", value: "42 km jalan" },
      ],
      damage: [
        { type: "Berat", count: 1950 },
        { type: "Sedang", count: 980 },
        { type: "Ringan", count: 491 },
      ],
      damageDetails: [
        { icon: "🏠", label: "Hunian Rusak Total", value: "1,950" },
        { icon: "🏢", label: "Bangunan Publik", value: "62" },
        { icon: "🛣️", label: "Jalan Rusak", value: "42 km" },
        { icon: "🌊", label: "Luas Banjir", value: "156 hektar" },
      ],
      photo: bencana2,
      photoCaption:
        "Dampak gempa bumi di Sumatera Utara - kerusakan struktur bangunan",
      facilities: ["Sekolah", "Rumah Sakit", "Pasar", "Kantor Pemerintah"],
      stories:
        "Sumatera Utara memperlihatkan semangat gotong royong yang kuat.",
      needs: ["Shelter", "Logistik", "Alat Berat", "Dukungan Psikologis"],
      progress: 58,
    },
    {
      id: 2,
      name: "Sumatera Barat",
      coordinates: [101.0, 0.5],
      cardPosition: { bottom: "40px", right: "30px" },
      icon: Layers,
      buildings: 2876,
      people: 12456,
      cities: ["Padang", "Bukittinggi", "Payakumbuh"],
      stats: [
        { label: "PCL", value: "30 unit" },
        { label: "PML", value: "3 unit" },
        { label: "Infrastruktur Rusak", value: "35 km jalan" },
      ],
      damage: [
        { type: "Berat", count: 1650 },
        { type: "Sedang", count: 820 },
        { type: "Ringan", count: 406 },
      ],
      damageDetails: [
        { icon: "🏠", label: "Hunian Rusak Total", value: "1,650" },
        { icon: "🏢", label: "Bangunan Publik", value: "38" },
        { icon: "🛣️", label: "Jalan Rusak", value: "35 km" },
        { icon: "⛰️", label: "Area Longsor", value: "78 hektar" },
      ],
      photo: bencana3,
      photoCaption:
        "Bencana longsor lahan di Sumatera Barat - ancaman bagi pemukiman",
      facilities: ["Sekolah", "Klinik", "Balai Kesehatan"],
      stories: "Masyarakat Sumatera Barat terus berjuang untuk bangkit.",
      needs: ["Shelter", "Makanan", "Tenaga Medis", "Peralatan"],
      progress: 72,
    },
  ];

  // ============ MAIN GSAP SCRAPBOOK ANIMATIONS ============
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      // --- HERO SECTION: Scrapbook slide-in together, from opposite sides ---
      if (titleRef.current && heroSubtitleRef.current) {
        // Title slides from LEFT, Subtitle slides from RIGHT — both arrive at center simultaneously
        // For visual drama: Title travels farther distance faster, Subtitle travels less distance slower
        // This creates a "rush together" effect

        const titleTl = gsap.timeline({ delay: 0.3 });
        titleTl
          .set(titleRef.current, { opacity: 0, x: -300, rotation: -7 })
          // Slide in — arrives center at 1.15s total
          .to(titleRef.current, {
            opacity: 1,
            x: 15,
            rotation: 1.5,
            duration: 0.85,
            ease: "power2.out",
          })
          // Overshoot bounce
          .to(titleRef.current, {
            x: -8,
            rotation: -0.9,
            duration: 0.35,
            ease: "power1.inOut",
          })
          // Settle
          .to(titleRef.current, {
            x: 3,
            rotation: 0.4,
            duration: 0.25,
            ease: "power1.inOut",
          })
          .to(titleRef.current, {
            x: 0,
            rotation: 0,
            duration: 0.2,
            ease: "power1.out",
          })
          // Micro-shake
          .to(titleRef.current, {
            x: 1.5,
            rotation: 0.4,
            duration: 0.08,
            ease: "none",
          })
          .to(titleRef.current, {
            x: -1,
            rotation: -0.3,
            duration: 0.08,
            ease: "none",
          })
          .to(titleRef.current, {
            x: 0.5,
            rotation: 0.15,
            duration: 0.06,
            ease: "none",
          })
          .to(titleRef.current, {
            x: 0,
            rotation: 0,
            duration: 0.06,
            ease: "none",
          });

        const subTl = gsap.timeline({ delay: 0.5 });
        subTl
          .set(heroSubtitleRef.current, { opacity: 0, x: 200, rotation: 4 })
          // Slide in — also arrives center at ~1.15s total (0.5 + 0.65 = 1.15)
          .to(heroSubtitleRef.current, {
            opacity: 1,
            x: -12,
            rotation: -1,
            duration: 0.65,
            ease: "power2.out",
          })
          // Overshoot bounce
          .to(heroSubtitleRef.current, {
            x: 6,
            rotation: 0.7,
            duration: 0.3,
            ease: "power1.inOut",
          })
          // Settle
          .to(heroSubtitleRef.current, {
            x: -2,
            rotation: -0.25,
            duration: 0.22,
            ease: "power1.inOut",
          })
          .to(heroSubtitleRef.current, {
            x: 0,
            rotation: 0,
            duration: 0.18,
            ease: "power1.out",
          })
          // Micro-shake (slightly different pattern for variety)
          .to(heroSubtitleRef.current, {
            x: -1.2,
            rotation: -0.3,
            duration: 0.08,
            ease: "none",
          })
          .to(heroSubtitleRef.current, {
            x: 0.8,
            rotation: 0.2,
            duration: 0.08,
            ease: "none",
          })
          .to(heroSubtitleRef.current, {
            x: -0.4,
            rotation: -0.1,
            duration: 0.06,
            ease: "none",
          })
          .to(heroSubtitleRef.current, {
            x: 0,
            rotation: 0,
            duration: 0.06,
            ease: "none",
          });
      }

      // --- Hero photo overlay fades in ---
      if (heroPhotoRef.current) {
        gsap.fromTo(
          heroPhotoRef.current,
          { opacity: 0 },
          {
            opacity: 0.3,
            duration: 3,
            ease: "power1.inOut",
            delay: 0.8,
          },
        );
      }

      // --- Scrapbook elements staggered entrance ---
      const scrapbookEls = gsap.utils.toArray(".scrapbook-el");
      scrapbookEls.forEach((el, i) => {
        gsap.fromTo(
          el,
          { opacity: 0, scale: 0, rotation: () => Math.random() * 360 },
          {
            opacity: 1,
            scale: 1,
            rotation: el.style.transform
              ? parseFloat(
                  el.style.transform.match(/rotate\((.+)deg\)/)?.[1] || 0,
                )
              : 0,
            duration: 0.8,
            ease: "back.out(2)",
            delay: 1.2 + i * 0.1,
          },
        );

        // Gentle floating animation
        gsap.to(el, {
          y: () => (i % 2 === 0 ? -8 : 8),
          x: () => (i % 3 === 0 ? 5 : -5),
          rotation: `+=${i % 2 === 0 ? 3 : -3}`,
          duration: 3 + i * 0.3,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          delay: 1.2 + i * 0.1,
        });
      });

      // --- SKALA SECTION: Blur to sharp on map ---
      if (skalaSection.current) {
        const skalaTitle = skalaSection.current.querySelector(".skala-title");
        const skalaText = skalaSection.current.querySelector(".skala-text");
        const skalaMapWrap = skalaSection.current.querySelector(
          ".skala-map-container",
        );

        if (skalaMapWrap) {
          gsap.fromTo(
            skalaMapWrap,
            { filter: "blur(8px)" },
            {
              filter: "blur(0px)",
              duration: 1,
              ease: "power2.out",
              scrollTrigger: {
                trigger: skalaSection.current,
                start: "top 80%",
                end: "top 20%",
                scrub: 0.5,
              },
            },
          );
        }

        if (skalaTitle) {
          gsap.fromTo(
            skalaTitle,
            { opacity: 0, y: 40 },
            {
              opacity: 1,
              y: 0,
              duration: 1,
              ease: "power2.out",
              scrollTrigger: {
                trigger: skalaSection.current,
                start: "top 70%",
                end: "top 30%",
                scrub: 0.5,
              },
            },
          );
        }

        if (skalaText) {
          gsap.fromTo(
            skalaText,
            { opacity: 0, y: 30 },
            {
              opacity: 1,
              y: 0,
              duration: 1,
              ease: "power2.out",
              scrollTrigger: {
                trigger: skalaSection.current,
                start: "top 60%",
                end: "top 20%",
                scrub: 0.5,
              },
            },
          );
        }
      }

      // --- SKALA SECTION: Pin and drive scroll steps ---
      // Steps: 0=intro/boundaries, 1=PML/PCL markers, 2=Aceh detail, 3=Sumut detail, 4=Sumbar detail
      const totalSkalaSteps = 5;
      ScrollTrigger.create({
        trigger: skalaSection.current,
        start: "top top",
        end: () => `+=${totalSkalaSteps * window.innerHeight}`,
        pin: true,
        scrub: 0.3,
        snap: {
          snapTo: 1 / totalSkalaSteps,
          duration: { min: 0.2, max: 0.6 },
          ease: "power1.inOut",
        },
        onUpdate: (self) => {
          const step = Math.min(
            totalSkalaSteps - 1,
            Math.floor(self.progress * totalSkalaSteps),
          );
          setSkalaStep((prev) => (prev !== step ? step : prev));
        },
        invalidateOnRefresh: true,
      });

      // --- TEMUAN FISIK SECTION: Horizontal scroll carousel ---
      if (temuanSection.current && temuanTrack.current) {
        const track = temuanTrack.current;
        const photos = gsap.utils.toArray(".temuan-photo-card");
        const chartBars = gsap.utils.toArray(".temuan-bar");
        const temuanTitle =
          temuanSection.current.querySelector(".temuan-title");
        const temuanQuote =
          temuanSection.current.querySelector(".temuan-quote");
        const temuanChart = temuanSection.current.querySelector(
          ".temuan-chart-container",
        );

        // Title & quote entrance
        if (temuanTitle) {
          gsap.fromTo(
            temuanTitle,
            { opacity: 0, y: 50 },
            {
              opacity: 1,
              y: 0,
              duration: 1,
              ease: "power3.out",
              scrollTrigger: {
                trigger: temuanSection.current,
                start: "top 80%",
                end: "top 40%",
                scrub: 0.5,
              },
            },
          );
        }
        if (temuanQuote) {
          gsap.fromTo(
            temuanQuote,
            { opacity: 0, y: 30 },
            {
              opacity: 1,
              y: 0,
              duration: 1,
              ease: "power2.out",
              scrollTrigger: {
                trigger: temuanSection.current,
                start: "top 70%",
                end: "top 30%",
                scrub: 0.5,
              },
            },
          );
        }

        // Photos: slide in with slight rotate like taped polaroids
        photos.forEach((photo, i) => {
          gsap.set(photo, {
            x: 200,
            opacity: 0,
            rotation: (Math.random() - 0.5) * 12,
          });
        });

        // Horizontal scroll: pin the section and scroll the track sideways
        const totalScrollWidth = track.scrollWidth - track.offsetWidth;

        const horizontalTl = gsap.timeline({
          scrollTrigger: {
            trigger: temuanSection.current,
            start: "top top",
            end: () => `+=${totalScrollWidth + window.innerWidth}`,
            pin: true,
            scrub: 0.8,
            invalidateOnRefresh: true,
            anticipatePin: 1,
          },
        });

        // Animate the track to scroll left
        horizontalTl.to(track, {
          x: -totalScrollWidth,
          ease: "none",
          duration: 1,
        });

        // Photos slide in with rotation as they enter viewport
        photos.forEach((photo, i) => {
          gsap.to(photo, {
            x: 0,
            opacity: 1,
            rotation: (Math.random() - 0.5) * 4,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: photo,
              containerAnimation: horizontalTl,
              start: "left 90%",
              end: "left 50%",
              scrub: 0.5,
            },
          });
        });

        // Bar chart grows up from bottom
        if (temuanChart) {
          gsap.fromTo(
            temuanChart,
            { opacity: 0, y: 80 },
            {
              opacity: 1,
              y: 0,
              duration: 1,
              ease: "power3.out",
              scrollTrigger: {
                trigger: temuanChart,
                containerAnimation: horizontalTl,
                start: "left 85%",
                end: "left 50%",
                scrub: 0.5,
              },
            },
          );

          chartBars.forEach((bar, i) => {
            const targetHeight = bar.getAttribute("data-height");
            gsap.fromTo(
              bar,
              { height: 0 },
              {
                height: targetHeight,
                duration: 0.8,
                ease: "power2.out",
                scrollTrigger: {
                  trigger: temuanChart,
                  containerAnimation: horizontalTl,
                  start: "left 80%",
                  end: "left 40%",
                  scrub: 0.5,
                },
              },
            );
          });
        }
      }

      // --- IMPACT / DISASTER SECTION: Pinned infographic with slide transitions ---
      const infogSlides = gsap.utils.toArray(".infog-slide");
      const totalSlides = infogSlides.length;

      if (totalSlides > 0) {
        // First slide visible, rest off-screen right
        gsap.set(infogSlides[0], { xPercent: 0, opacity: 1 });
        infogSlides
          .slice(1)
          .forEach((slide) => gsap.set(slide, { xPercent: 110, opacity: 0 }));

        // Animate inner elements of first visible slide
        const firstItems = infogSlides[0].querySelectorAll(
          ".infog-stat, .infog-callout, .infog-slide-title, .infog-story",
        );
        gsap.fromTo(
          firstItems,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            stagger: 0.08,
            duration: 0.5,
            ease: "power2.out",
            delay: 0.2,
          },
        );

        const impactTl = gsap.timeline({
          scrollTrigger: {
            trigger: impactSection.current,
            start: "top top",
            end: () => `+=${totalSlides * window.innerHeight}`,
            pin: true,
            scrub: 0.6,
            onUpdate: (self) => {
              const idx = Math.min(
                totalSlides - 1,
                Math.round(self.progress * (totalSlides - 1)),
              );
              setActiveDisaster((prev) => (prev !== idx ? idx : prev));
            },
          },
        });

        for (let i = 0; i < totalSlides - 1; i++) {
          impactTl.to({}, { duration: 0.35 });
          impactTl
            .to(infogSlides[i], {
              xPercent: -110,
              opacity: 0,
              scale: 0.85,
              rotation: -3,
              duration: 1,
              ease: "power3.inOut",
            })
            .fromTo(
              infogSlides[i + 1],
              { xPercent: 110, opacity: 0, scale: 0.85, rotation: 3 },
              {
                xPercent: 0,
                opacity: 1,
                scale: 1,
                rotation: 0,
                duration: 1,
                ease: "power3.inOut",
              },
              "<0.15",
            );
          impactTl.to({}, { duration: 0.35 });
        }
      }

      // --- EVACUATION SECTION: Parallax hero tent photo ---
      const evacHeroImg = document.querySelector(".evac-hero-img");
      if (evacHeroImg) {
        gsap.fromTo(
          evacHeroImg,
          { yPercent: -15, scale: 1.15 },
          {
            yPercent: 15,
            scale: 1.05,
            ease: "none",
            scrollTrigger: {
              trigger: ".evacuation-section",
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          },
        );
      }

      // --- EVACUATION: Stop-motion photo frames ---
      const evacPhotos = gsap.utils.toArray(".evac-photo-frame");
      evacPhotos.forEach((frame, i) => {
        const startX = i % 2 === 0 ? -200 : 200;
        const startRot = i % 2 === 0 ? -18 : 15;

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: frame,
            start: "top 90%",
            end: "top 35%",
            scrub: 0.5,
          },
        });

        // Stop-motion frames: sepia → develop → flicker → snap → settle
        tl.fromTo(
          frame,
          {
            opacity: 0,
            x: startX,
            y: 100,
            rotation: startRot,
            scale: 0.4,
            filter: "sepia(1) brightness(1.5) blur(5px)",
          },
          {
            opacity: 0.3,
            x: startX * 0.6,
            y: 65,
            rotation: startRot * 0.6,
            scale: 0.55,
            filter: "sepia(0.8) brightness(1.3) blur(3px)",
            duration: 0.1,
            ease: "steps(1)",
          },
        )
          .to(frame, {
            opacity: 0.55,
            x: startX * 0.25,
            y: 35,
            rotation: startRot * 0.2,
            scale: 0.75,
            filter: "sepia(0.4) brightness(1.1) blur(1.5px)",
            duration: 0.1,
            ease: "steps(1)",
          })
          .to(frame, {
            opacity: 0.3,
            y: 30,
            scale: 0.77,
            filter: "sepia(0.3) brightness(0.85) blur(1px)",
            duration: 0.05,
            ease: "steps(1)",
          })
          .to(frame, {
            opacity: 0.8,
            x: 0,
            y: 8,
            rotation: 0,
            scale: 0.95,
            filter: "sepia(0.1) brightness(1.05) blur(0px)",
            duration: 0.12,
            ease: "steps(1)",
          })
          .to(frame, {
            opacity: 1,
            y: -6,
            scale: 1.03,
            filter: "sepia(0) brightness(1) blur(0px)",
            duration: 0.1,
            ease: "steps(1)",
          })
          .to(frame, {
            y: 0,
            scale: 1,
            rotation: (Math.random() - 0.5) * 3,
            duration: 0.08,
            ease: "steps(1)",
          });

        // Idle jitter
        const jitter = gsap.timeline({
          repeat: -1,
          yoyo: true,
          delay: 1 + i * 0.5,
        });
        jitter
          .to(frame, {
            y: -2,
            rotation: `+=${(Math.random() - 0.5) * 2.5}`,
            duration: 2.2,
            ease: "steps(3)",
          })
          .to(frame, {
            y: 1.5,
            rotation: `+=${(Math.random() - 0.5) * 2}`,
            duration: 1.8,
            ease: "steps(2)",
          });
      });

      // --- EVACUATION: Stat cards stagger in ---
      const evacStatCards = gsap.utils.toArray(".evac-stat-card");
      evacStatCards.forEach((card, i) => {
        gsap.fromTo(
          card,
          { opacity: 0, y: 40, scale: 0.85 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            ease: "power2.out",
            scrollTrigger: {
              trigger: card,
              start: "top 88%",
              end: "top 60%",
              scrub: 0.5,
            },
            delay: i * 0.08,
          },
        );
      });

      // --- INSIGHT SECTION: Immersive web-story kebutuhan warga ---
      if (insightSection.current) {
        const sec = insightSection.current;

        // Background orbs parallax movement
        const orbs = gsap.utils.toArray(".insight-bg-orb");
        orbs.forEach((orb, i) => {
          gsap.to(orb, {
            y: () => (i % 2 === 0 ? -120 : 80),
            x: () => (i % 2 === 0 ? 60 : -40),
            scale: 1.3,
            ease: "none",
            scrollTrigger: {
              trigger: sec,
              start: "top bottom",
              end: "bottom top",
              scrub: 1.2,
            },
          });
        });

        // Title underline draw-in
        const underline = sec.querySelector(".insight-title-underline");
        if (underline) {
          gsap.fromTo(
            underline,
            { scaleX: 0, transformOrigin: "center center" },
            {
              scaleX: 1,
              duration: 1,
              ease: "power3.inOut",
              scrollTrigger: {
                trigger: sec,
                start: "top 65%",
                end: "top 35%",
                scrub: 0.5,
              },
            },
          );
        }

        // Tag entrance
        const tag = sec.querySelector(".insight-tag");
        if (tag) {
          gsap.fromTo(
            tag,
            { opacity: 0, y: 20, scale: 0.8 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.6,
              ease: "back.out(1.7)",
              scrollTrigger: {
                trigger: sec,
                start: "top 80%",
                toggleActions: "play none none reverse",
              },
            },
          );
        }

        // Title: word-reveal effect
        const titleEl = sec.querySelector(".insight-title");
        if (titleEl) {
          gsap.fromTo(
            titleEl,
            { opacity: 0, y: 60, clipPath: "inset(100% 0% 0% 0%)" },
            {
              opacity: 1,
              y: 0,
              clipPath: "inset(0% 0% 0% 0%)",
              duration: 1.2,
              ease: "power4.out",
              scrollTrigger: {
                trigger: sec,
                start: "top 75%",
                toggleActions: "play none none reverse",
              },
            },
          );
        }

        // Subtitle fade-slide
        const subtitleEl = sec.querySelector(".insight-subtitle");
        if (subtitleEl) {
          gsap.fromTo(
            subtitleEl,
            { opacity: 0, y: 30 },
            {
              opacity: 1,
              y: 0,
              duration: 0.8,
              ease: "power2.out",
              scrollTrigger: {
                trigger: sec,
                start: "top 68%",
                toggleActions: "play none none reverse",
              },
            },
          );
        }

        // Cards: scrapbook stop-motion entrance (no rotation, just placement)
        const cards = gsap.utils.toArray(".insight-need-card");
        cards.forEach((card, i) => {
          const icon = card.querySelector(".insight-icon");
          const glow = card.querySelector(".insight-glow-ring");
          const text = card.querySelector(".insight-card-text");
          const progressFill = card.querySelector(".insight-progress-fill");
          const statNumber = card.querySelector(".insight-stat-number");

          // Card entrance timeline
          const cardTl = gsap.timeline({
            scrollTrigger: {
              trigger: card,
              start: "top 88%",
              toggleActions: "play none none reverse",
            },
          });

          // Scrapbook-style: card drops in and settles (no rotation, just scale and position)
          cardTl.fromTo(
            card,
            {
              opacity: 0,
              y: -50,
              scale: 0.5,
              transformOrigin: "center center",
            },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.7,
              ease: "back.out(1.7)",
              delay: i * 0.15,
            },
          );

          // Icon pops in with bounce
          if (icon) {
            cardTl.fromTo(
              icon,
              { scale: 0, opacity: 0 },
              { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(2.5)" },
              "-=0.4",
            );
          }

          // Glow ring expands behind
          if (glow) {
            cardTl.fromTo(
              glow,
              { scale: 0, opacity: 0 },
              { scale: 1, opacity: 1, duration: 0.5, ease: "power2.out" },
              "-=0.5",
            );
          }

          // Text fades in
          if (text) {
            cardTl.fromTo(
              text,
              { opacity: 0, y: 20 },
              { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
              "-=0.3",
            );
          }

          // Progress bar fills
          if (progressFill) {
            cardTl.fromTo(
              progressFill,
              { scaleX: 0, transformOrigin: "left center" },
              { scaleX: 1, duration: 1.2, ease: "power2.inOut" },
              "-=0.3",
            );
          }

          // Stat number count-up
          if (statNumber) {
            const targetText = statNumber.textContent;
            const targetNum = parseInt(targetText.replace(/,/g, ""));
            const obj = { val: 0 };
            cardTl.to(
              obj,
              {
                val: targetNum,
                duration: 1.5,
                ease: "power2.out",
                onUpdate: () => {
                  statNumber.textContent = Math.round(obj.val).toLocaleString(
                    "id-ID",
                  );
                },
              },
              "-=1.2",
            );
          }

          // Icon continuous floating
          if (icon) {
            gsap.to(icon, {
              y: -10,
              duration: 2.5 + i * 0.3,
              yoyo: true,
              repeat: -1,
              ease: "sine.inOut",
              delay: i * 0.4 + 1.5,
            });
          }

          // Glow ring pulse loop
          if (glow) {
            gsap.to(glow, {
              scale: 1.15,
              opacity: 0.4,
              duration: 2,
              yoyo: true,
              repeat: -1,
              ease: "sine.inOut",
              delay: i * 0.3 + 2,
            });
          }

          // Card hover tilt with mouse
          card.addEventListener("mousemove", (e) => {
            const rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            gsap.to(card, {
              rotateY: x * 12,
              rotateX: -y * 8,
              transformPerspective: 800,
              duration: 0.4,
              ease: "power2.out",
            });
          });
          card.addEventListener("mouseleave", () => {
            gsap.to(card, {
              rotateY: 0,
              rotateX: 0,
              duration: 0.6,
              ease: "elastic.out(1, 0.5)",
            });
          });
        });

        // Closing text entrance
        const closingText = sec.querySelector(".insight-closing-text");
        if (closingText) {
          gsap.fromTo(
            closingText,
            { opacity: 0, y: 50, scale: 0.95 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.8,
              ease: "power3.out",
              scrollTrigger: {
                trigger: closingText,
                start: "top 90%",
                toggleActions: "play none none reverse",
              },
            },
          );
        }

        // Particles parallax
        const particles = gsap.utils.toArray(".insight-particle");
        particles.forEach((p, i) => {
          gsap.to(p, {
            y: () => gsap.utils.random(-150, 150),
            x: () => gsap.utils.random(-80, 80),
            rotation: gsap.utils.random(-360, 360),
            ease: "none",
            scrollTrigger: {
              trigger: sec,
              start: "top bottom",
              end: "bottom top",
              scrub: 1 + i * 0.1,
            },
          });
        });
      }

      // --- SECTION TRANSITION ANIMATIONS ---
      // Insight to Interview wave
      const insightToInterview = document.querySelector(
        ".insight-to-interview",
      );
      if (insightToInterview) {
        gsap.fromTo(
          insightToInterview.querySelector("svg path"),
          {
            attr: { d: "M0,120 C480,120 960,120 1440,120 L1440,120 L0,120 Z" },
          },
          {
            attr: { d: "M0,40 C480,120 960,0 1440,80 L1440,120 L0,120 Z" },
            ease: "power2.inOut",
            scrollTrigger: {
              trigger: insightToInterview,
              start: "top 90%",
              end: "top 40%",
              scrub: 0.8,
            },
          },
        );
      }

      // --- INTERVIEW: Title + subtitle entrance ---
      const interviewTitle = document.querySelector(".interview-title");
      const interviewSubtitle = document.querySelector(".interview-subtitle");
      if (interviewTitle) {
        gsap.fromTo(
          interviewTitle,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: ".interview-section",
              start: "top 80%",
              end: "top 50%",
              scrub: 0.6,
            },
          },
        );
      }
      if (interviewSubtitle) {
        gsap.fromTo(
          interviewSubtitle,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: ".interview-section",
              start: "top 75%",
              end: "top 45%",
              scrub: 0.6,
            },
          },
        );
      }

      // --- INTERVIEW: Horizontal pinned scroll ---
      const interviewStack = document.querySelector(".interview-stack");
      const interviewBlocks = gsap.utils.toArray(".interview-block");
      const scrollWrap = document.querySelector(".interview-scroll-wrap");

      if (interviewStack && interviewBlocks.length > 1 && scrollWrap) {
        const totalPanels = interviewBlocks.length;
        const scrollDistance = (totalPanels - 1) * window.innerWidth;

        // Pin the scroll wrapper and move the strip horizontally
        gsap.to(interviewStack, {
          x: -scrollDistance,
          ease: "none",
          scrollTrigger: {
            trigger: scrollWrap,
            start: "top top",
            end: () => `+=${scrollDistance}`,
            scrub: 0.8,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });
      }

      // --- INTERVIEW CLOSING: Full-width image + quote overlay entrance ---
      const closingImage = document.querySelector(
        ".interview-closing-img-wrap",
      );
      const closingQuote = document.querySelector(".interview-closing-quote");
      const closingQuoteText = document.querySelector(
        ".interview-closing-quote-text",
      );

      if (closingImage) {
        gsap.fromTo(
          closingImage,
          { opacity: 0, y: 60 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: ".interview-closing-wrap",
              start: "top 100%",
              end: "top 70%",
              scrub: 0.8,
            },
          },
        );
      }

      if (closingQuote) {
        const quoteTl = gsap.timeline({
          scrollTrigger: {
            trigger: ".interview-closing-wrap",
            start: "top 80%",
            end: "top 50%",
            scrub: 0.6,
          },
        });
        quoteTl
          .set(closingQuote, { opacity: 0, y: 80, x: -40, rotation: 2 })
          .to(closingQuote, {
            opacity: 0.3,
            y: 55,
            x: -25,
            rotation: 1.2,
            duration: 0.25,
            ease: "power2.out",
          })
          .to(closingQuote, {
            opacity: 0.7,
            y: 25,
            x: -10,
            rotation: 0.4,
            duration: 0.25,
            ease: "power2.out",
          })
          .to(closingQuote, {
            opacity: 1,
            y: -10,
            x: 5,
            rotation: -0.2,
            duration: 0.3,
            ease: "power2.out",
          })
          .to(closingQuote, {
            y: 3,
            x: 0,
            rotation: 0.1,
            duration: 0.2,
            ease: "power1.inOut",
          })
          .to(closingQuote, {
            y: 0,
            x: 0,
            rotation: 0,
            duration: 0.15,
            ease: "power1.out",
          });
      }

      if (closingQuoteText) {
        gsap.fromTo(
          closingQuoteText,
          { clipPath: "inset(0 100% 0 0)" },
          {
            clipPath: "inset(0 0% 0 0)",
            duration: 0.8,
            ease: "steps(25)",
            scrollTrigger: {
              trigger: ".interview-closing-wrap",
              start: "top 65%",
              end: "top 40%",
              scrub: 0.6,
            },
          },
        );
      }

      // --- CLOSING SECTION: "Lebih dari Peta" ---
      const closingSec = document.querySelector(".closing-section");
      if (closingSec) {
        const closingContent = closingSec.querySelector(".closing-content");
        const closingTag = closingSec.querySelector(".closing-tag");
        const closingTitle = closingSec.querySelector(".closing-title");
        const closingQuoteEl = closingSec.querySelector(".closing-quote");
        const closingDivider = closingSec.querySelector(".closing-divider");
        const closingCollageImgs = gsap.utils.toArray(".closing-collage-img");

        // Slow zoom out on collage
        gsap.fromTo(
          closingSec.querySelector(".closing-collage"),
          { scale: 1.25 },
          {
            scale: 1,
            ease: "none",
            scrollTrigger: {
              trigger: closingSec,
              start: "top bottom",
              end: "bottom top",
              scrub: 1,
            },
          },
        );

        // Fade to light overlay
        gsap.fromTo(
          closingSec.querySelector(".closing-bg-overlay"),
          { opacity: 0.3 },
          {
            opacity: 0.85,
            ease: "none",
            scrollTrigger: {
              trigger: closingSec,
              start: "top 60%",
              end: "center center",
              scrub: 1,
            },
          },
        );

        // Collage images stagger fade in
        closingCollageImgs.forEach((img, i) => {
          gsap.fromTo(
            img,
            { opacity: 0, scale: 1.15 },
            {
              opacity: 1,
              scale: 1,
              duration: 1,
              delay: i * 0.1,
              ease: "power2.out",
              scrollTrigger: {
                trigger: closingSec,
                start: "top 70%",
                end: "top 30%",
                scrub: 0.5,
              },
            },
          );
        });

        // Content elements entrance
        if (closingTag) {
          gsap.fromTo(
            closingTag,
            { opacity: 0, y: 30 },
            {
              opacity: 1,
              y: 0,
              duration: 0.8,
              ease: "power2.out",
              scrollTrigger: {
                trigger: closingContent,
                start: "top 75%",
                toggleActions: "play none none reverse",
              },
            },
          );
        }

        if (closingTitle) {
          gsap.fromTo(
            closingTitle,
            { opacity: 0, y: 40, scale: 0.95 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 1,
              ease: "power3.out",
              scrollTrigger: {
                trigger: closingContent,
                start: "top 70%",
                toggleActions: "play none none reverse",
              },
            },
          );
        }

        if (closingQuoteEl) {
          gsap.fromTo(
            closingQuoteEl,
            { opacity: 0, y: 30 },
            {
              opacity: 1,
              y: 0,
              duration: 1,
              delay: 0.2,
              ease: "power2.out",
              scrollTrigger: {
                trigger: closingContent,
                start: "top 65%",
                toggleActions: "play none none reverse",
              },
            },
          );
        }

        if (closingDivider) {
          gsap.fromTo(
            closingDivider,
            { scaleX: 0 },
            {
              scaleX: 1,
              duration: 1.2,
              ease: "power2.inOut",
              scrollTrigger: {
                trigger: closingContent,
                start: "top 60%",
                toggleActions: "play none none reverse",
              },
            },
          );
        }
      }
    }, mainContainer);

    return () => ctx.revert();
  }, []);

  // Load districts data from indonesia-district folder
  useEffect(() => {
    let isMounted = true;

    const loadDistricts = async () => {
      const data = await loadDistrictsData();
      if (isMounted) {
        setDistrictsData(data);
        console.log("Districts data loaded:", data.features.length, "features");
      }
    };

    loadDistricts();

    return () => {
      isMounted = false;
    };
  }, []);

  // Load R3P Kab GeoJSON data
  useEffect(() => {
    let isMounted = true;
    const url = new URL(
      "../assets/web-story-2/R3P-Kab-GeoJSON.geojson",
      import.meta.url,
    ).href;
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted) {
          setR3pKabData(data);
          console.log("R3P Kab data loaded:", data.features.length, "features");
        }
      })
      .catch((err) => {
        console.error("Failed to load R3P Kab data:", err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Initialize Skala Map (boundary polygons + markers + districts)
  useEffect(() => {
    if (!skalaSection.current || !r3pKabData) return;
    const skalaMapEl = skalaSection.current.querySelector(
      ".skala-map-container",
    );
    if (!skalaMapEl || skalaMapEl._mapInitialized) return;
    skalaMapEl._mapInitialized = true;

    const timer = setTimeout(() => {
      try {
        const skalaMap = new maplibregl.Map({
          container: skalaMapEl,
          style:
            "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
          center: [98.5, 2.0],
          zoom: 6,
          attributionControl: false,
          scrollZoom: false,
          dragPan: false,
          dragRotate: false,
          touchZoomRotate: false,
          doubleClickZoom: false,
          keyboard: false,
          antialias: true,
          interactive: false,
        });

        skalaMapRef.current = skalaMap;

        skalaMap.on("load", () => {
          // Filter R3P-Kab data for Aceh, Sumatera Utara, Sumatera Barat
          const targetProvinces = ["ACEH", "SUMATERA UTARA", "SUMATERA BARAT"];
          const filteredFeatures = r3pKabData.features.filter((f) =>
            targetProvinces.includes(f.properties.nmprov),
          );

          const filteredData = {
            type: "FeatureCollection",
            features: filteredFeatures,
          };

          skalaMap.addSource("skala-boundaries", {
            type: "geojson",
            data: filteredData,
          });

          // Fill layer
          skalaMap.addLayer({
            id: "skala-fill",
            type: "fill",
            source: "skala-boundaries",
            paint: {
              "fill-color": [
                "match",
                ["get", "nmprov"],
                "ACEH",
                "#FF6B6B",
                "SUMATERA UTARA",
                "#FFA500",
                "SUMATERA BARAT",
                "#FFD166",
                "#FFEA8A",
              ],
              "fill-opacity": 0,
            },
          });

          // Stroke layer
          skalaMap.addLayer({
            id: "skala-stroke",
            type: "line",
            source: "skala-boundaries",
            paint: {
              "line-color": [
                "match",
                ["get", "nmprov"],
                "ACEH",
                "#FF6B6B",
                "SUMATERA UTARA",
                "#FFA500",
                "SUMATERA BARAT",
                "#FFD166",
                "#FFEA8A",
              ],
              "line-width": 1.5,
              "line-opacity": 0,
            },
          });

          // District source/layers (hidden initially, used for region zoom steps)
          skalaMap.addSource("skala-districts", {
            type: "geojson",
            data: { type: "FeatureCollection", features: [] },
          });

          skalaMap.addLayer({
            id: "skala-districts-fill",
            type: "fill",
            source: "skala-districts",
            paint: {
              "fill-color": "#FFEA8A",
              "fill-opacity": 0,
            },
          });

          skalaMap.addLayer({
            id: "skala-districts-stroke",
            type: "line",
            source: "skala-districts",
            paint: {
              "line-color": "#FFEA8A",
              "line-width": 2,
              "line-opacity": 0,
            },
          });

          // Add markers for all regions (hidden initially)
          const markers = [];
          regionsData.forEach((region, idx) => {
            const pmlValue = region.stats[1]?.value?.split(" ")[0] || "0";
            const pclValue = region.stats[0]?.value?.split(" ")[0] || "0";

            const markerDiv = document.createElement("div");
            markerDiv.className = "point-marker";
            markerDiv.setAttribute("data-region", region.name);
            markerDiv.style.opacity = "0";
            markerDiv.style.pointerEvents = "none";
            markerDiv.innerHTML = `
              <div class="marker-label-top">
                <div class="region-name">${region.name}</div>
                <div class="pml-pcl-info">
                  <span class="pml-badge">${pmlValue} PML</span>
                  <span class="pcl-badge">${pclValue} PCL</span>
                </div>
              </div>
              <div class="marker-pin">
                <img src="${locationPinImage}" alt="location" />
              </div>
            `;

            const marker = new maplibregl.Marker({
              element: markerDiv,
              anchor: "center",
            })
              .setLngLat(region.coordinates)
              .addTo(skalaMap);
            markers.push(marker);
          });
          skalaMarkersRef.current = markers;

          // Initial flyTo + animate boundaries appearing
          skalaMap.flyTo({
            center: [98.5, 2.0],
            zoom: 7,
            duration: 2000,
            essential: true,
          });

          // Animate boundaries in immediately
          setTimeout(() => {
            let startTime = null;
            const animDuration = 2000;
            const animateBoundaries = (timestamp) => {
              if (!startTime) startTime = timestamp;
              const progress = Math.min(
                (timestamp - startTime) / animDuration,
                1,
              );
              const eased = 1 - Math.pow(1 - progress, 3);
              try {
                skalaMap.setPaintProperty(
                  "skala-stroke",
                  "line-opacity",
                  eased * 0.9,
                );
                skalaMap.setPaintProperty(
                  "skala-stroke",
                  "line-width",
                  1 + eased * 2.5,
                );
                skalaMap.setPaintProperty(
                  "skala-fill",
                  "fill-opacity",
                  eased * 0.25,
                );
              } catch (e) {}
              if (progress < 1) requestAnimationFrame(animateBoundaries);
            };
            requestAnimationFrame(animateBoundaries);
          }, 500);
        });
      } catch (err) {
        console.error("Failed to initialize skala map:", err);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [r3pKabData]);

  // Initialize Impact Map
  useEffect(() => {
    // Only run once
    if (impactMap.current) return;

    const timer = setTimeout(() => {
      if (!impactMapContainer.current) {
        console.log("Impact map container not found");
        return;
      }

      console.log("Initializing impact map...");

      try {
        const mapInstance = new maplibregl.Map({
          container: impactMapContainer.current,
          style: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
          center: [95.5, 3.5],
          zoom: 6.5,
          attributionControl: false,
          scrollZoom: true,
          antialias: true,
        });

        impactMap.current = mapInstance;

        mapInstance.on("load", () => {
          console.log("Impact map fully loaded");

          // Add Sumatera regions source and layers
          if (!mapInstance.getSource("sumatera-regions-impact")) {
            mapInstance.addSource("sumatera-regions-impact", {
              type: "geojson",
              data: sumateraData,
            });

            mapInstance.addLayer({
              id: "sumatera-fill-impact",
              type: "fill",
              source: "sumatera-regions-impact",
              paint: {
                "fill-color": "#003631",
                "fill-opacity": 0.2,
              },
            });

            mapInstance.addLayer({
              id: "sumatera-stroke-impact",
              type: "line",
              source: "sumatera-regions-impact",
              paint: {
                "line-color": "#FFEA8A",
                "line-width": 2,
              },
            });
          }

          // Add districts source and layers for impact map
          if (!mapInstance.getSource("indonesia-districts-impact")) {
            mapInstance.addSource("indonesia-districts-impact", {
              type: "geojson",
              data: {
                type: "FeatureCollection",
                features: [],
              },
            });

            mapInstance.addLayer({
              id: "districts-fill-impact",
              type: "fill",
              source: "indonesia-districts-impact",
              paint: {
                "fill-color": [
                  "case",
                  ["boolean", ["feature-state", "hover"], false],
                  "#FFD700",
                  "#FFEA8A",
                ],
                "fill-opacity": [
                  "case",
                  ["boolean", ["feature-state", "hover"], false],
                  0.6,
                  0.35,
                ],
              },
            });

            mapInstance.addLayer({
              id: "districts-stroke-impact",
              type: "line",
              source: "indonesia-districts-impact",
              paint: {
                "line-color": [
                  "case",
                  ["boolean", ["feature-state", "hover"], false],
                  "#003631",
                  "#003631",
                ],
                "line-width": [
                  "case",
                  ["boolean", ["feature-state", "hover"], false],
                  3.5,
                  2.5,
                ],
                "line-opacity": 0.8,
              },
            });
          }
        });

        mapInstance.on("error", (e) => {
          console.error("Impact map error:", e.error);
        });
      } catch (err) {
        console.error("Failed to initialize impact map:", err);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // ============ SKALA STEP CONTROLLER ============
  // Responds to skalaStep changes: flyTo, boundaries, markers, overlays
  useEffect(() => {
    const mapInstance = skalaMapRef.current;
    if (!mapInstance || !mapInstance.loaded()) return;

    const activeRegion = skalaStep >= 2 ? skalaStep - 2 : -1;
    const region = activeRegion >= 0 ? regionsData[activeRegion] : null;

    // --- Step 0: Intro — show boundaries, hide markers ---
    if (skalaStep === 0) {
      mapInstance.flyTo({
        center: [98.5, 2.0],
        zoom: 7,
        duration: 1500,
        essential: true,
      });

      // Ensure boundaries are visible
      try {
        mapInstance.setPaintProperty("skala-stroke", "line-opacity", 0.9);
        mapInstance.setPaintProperty("skala-stroke", "line-width", 2.5);
        mapInstance.setPaintProperty("skala-fill", "fill-opacity", 0.25);
      } catch (e) {}

      // Hide all markers
      const markers = document.querySelectorAll(".skala-section .point-marker");
      markers.forEach((m) => {
        m.style.opacity = "0";
        m.style.pointerEvents = "none";
      });

      // Hide district layers
      try {
        mapInstance.setPaintProperty("skala-districts-fill", "fill-opacity", 0);
        mapInstance.setPaintProperty(
          "skala-districts-stroke",
          "line-opacity",
          0,
        );
      } catch (e) {}

      // Animate skala content: show
      const skalaContent = document.querySelector(".skala-content");
      const pmlOverlay = document.querySelector(".skala-pml-overlay");
      const overlayUI = document.querySelector(".skala-overlay-ui");
      if (skalaContent)
        gsap.to(skalaContent, {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: "power2.out",
        });
      if (pmlOverlay) gsap.to(pmlOverlay, { opacity: 0, y: 20, duration: 0.3 });
      if (overlayUI) gsap.to(overlayUI, { opacity: 0, duration: 0.3 });
    }

    // --- Step 1: Show PML/PCL markers for all regions ---
    if (skalaStep === 1) {
      mapInstance.flyTo({
        center: [98.5, 2.0],
        zoom: 7,
        duration: 1500,
        essential: true,
      });

      // Hide skala intro content, show PML overlay
      const skalaContent = document.querySelector(".skala-content");
      const pmlOverlay = document.querySelector(".skala-pml-overlay");
      const overlayUI = document.querySelector(".skala-overlay-ui");
      if (skalaContent)
        gsap.to(skalaContent, { opacity: 0, y: -30, duration: 0.4 });
      if (pmlOverlay)
        gsap.to(pmlOverlay, {
          opacity: 1,
          y: 0,
          duration: 0.5,
          delay: 0.2,
          ease: "power2.out",
        });
      if (overlayUI) gsap.to(overlayUI, { opacity: 0, duration: 0.3 });

      // Show all markers
      const markers = document.querySelectorAll(".skala-section .point-marker");
      markers.forEach((m, i) => {
        gsap.to(m, {
          opacity: 1,
          pointerEvents: "auto",
          duration: 0.4,
          delay: i * 0.15,
          ease: "power2.out",
        });
      });

      // Hide districts
      try {
        mapInstance.setPaintProperty("skala-districts-fill", "fill-opacity", 0);
        mapInstance.setPaintProperty(
          "skala-districts-stroke",
          "line-opacity",
          0,
        );
      } catch (e) {}
    }

    // --- Steps 2-4: Fly to region, show stats card + photo ---
    if (skalaStep >= 2 && region) {
      mapInstance.flyTo({
        center: region.coordinates,
        zoom: 8.5,
        duration: 1800,
        essential: true,
        curve: 1.5,
      });

      // Hide skala content & PML overlay, show overlay UI
      const skalaContent = document.querySelector(".skala-content");
      const pmlOverlay = document.querySelector(".skala-pml-overlay");
      const overlayUI = document.querySelector(".skala-overlay-ui");
      if (skalaContent)
        gsap.to(skalaContent, { opacity: 0, y: -30, duration: 0.3 });
      if (pmlOverlay) gsap.to(pmlOverlay, { opacity: 0, y: 20, duration: 0.3 });
      if (overlayUI)
        gsap.to(overlayUI, { opacity: 1, duration: 0.4, delay: 0.2 });

      // Show only active region's marker
      const markers = document.querySelectorAll(".skala-section .point-marker");
      markers.forEach((m) => {
        const markerRegion = m.getAttribute("data-region");
        const isActive = markerRegion === region.name;
        gsap.to(m, {
          opacity: isActive ? 1 : 0,
          pointerEvents: isActive ? "auto" : "none",
          duration: 0.3,
        });
      });

      // Animate stats cards
      const allStatCards = document.querySelectorAll(
        ".skala-section .map-stats-card",
      );
      allStatCards.forEach((card, i) => {
        if (i === activeRegion) {
          gsap.fromTo(
            card,
            { y: 80, opacity: 0, visibility: "hidden" },
            {
              y: 0,
              opacity: 1,
              visibility: "visible",
              duration: 0.6,
              ease: "power3.out",
              delay: 0.3,
            },
          );
        } else {
          gsap.to(card, {
            y: -60,
            opacity: 0,
            duration: 0.35,
            ease: "power2.in",
            onComplete: () => gsap.set(card, { visibility: "hidden" }),
          });
        }
      });

      // Animate photo cards
      const allPhotoCards = document.querySelectorAll(
        ".skala-section .map-photo-card",
      );
      allPhotoCards.forEach((card, i) => {
        if (i === activeRegion) {
          gsap.fromTo(
            card,
            { y: 100, opacity: 0, visibility: "hidden" },
            {
              y: 0,
              opacity: 1,
              visibility: "visible",
              duration: 0.7,
              ease: "power3.out",
              delay: 0.4,
            },
          );
        } else {
          gsap.to(card, {
            y: -80,
            opacity: 0,
            duration: 0.35,
            ease: "power2.in",
            onComplete: () => gsap.set(card, { visibility: "hidden" }),
          });
        }
      });

      // Show district boundaries for active region
      if (districtsData) {
        const regionDistricts = districtsData.features.filter(
          (d) => d.properties.province === region.name,
        );
        try {
          const source = mapInstance.getSource("skala-districts");
          if (source && regionDistricts.length > 0) {
            source.setData({
              type: "FeatureCollection",
              features: regionDistricts,
            });
            mapInstance.setPaintProperty(
              "skala-districts-fill",
              "fill-opacity",
              0.25,
            );
            mapInstance.setPaintProperty(
              "skala-districts-stroke",
              "line-opacity",
              0.7,
            );
          }
        } catch (e) {}
      }
    }
  }, [skalaStep, regionsData, districtsData]);

  return (
    <div ref={mainContainer} className="findings-container">
      {/* ===== HERO SECTION — Full-screen Map ===== */}
      <section ref={heroSection} className="hero-section hero-section--map">
        {/* Grid pattern background */}
        <div className="hero-grid-pattern"></div>

        {/* Scrapbook decorative elements */}
        <div className="hero-scrapbook-elements">
          <div className="scrapbook-el scrapbook-el-1">
            <Paperclip size={32} strokeWidth={2} />
          </div>
          <div className="scrapbook-el scrapbook-el-2">
            <Camera size={28} strokeWidth={2} />
          </div>
          <div className="scrapbook-el scrapbook-el-3">
            <Image size={36} strokeWidth={1.8} />
          </div>
          <div className="scrapbook-el scrapbook-el-4">
            <Bookmark size={30} strokeWidth={2} />
          </div>
          <div className="scrapbook-el scrapbook-el-5">
            <StickyNote size={34} strokeWidth={1.8} />
          </div>
          <div className="scrapbook-el scrapbook-el-6">
            <Star size={24} strokeWidth={2.5} />
          </div>
          <div className="scrapbook-el scrapbook-el-7">
            <Compass size={32} strokeWidth={2} />
          </div>
          <div className="scrapbook-el scrapbook-el-8">
            <MapPin size={28} strokeWidth={2.2} />
          </div>
        </div>

        {/* Landscape photo transparent overlay */}
        <div
          ref={heroPhotoRef}
          className="hero-photo-overlay"
          style={{ backgroundImage: `url(${bencana1})` }}
        ></div>
        {/* Dark gradient for text readability */}
        <div className="hero-map-gradient"></div>
        {/* Content */}
        <div className="hero-content hero-content--map">
          <h1 ref={titleRef} className="hero-title-main hero-title--tilted">
            <span className="title-line">Data yang Berbicara,</span>
            <span className="title-line accent">Manusia yang Bertahan</span>
          </h1>
          <p
            ref={heroSubtitleRef}
            className="hero-subtitle hero-subtitle--story"
          >
            Bencana sering tampak sebagai titik dan garis di peta. Tapi ruang
            menyimpan lebih dari itu — ia menyimpan cara hidup, ingatan, dan
            hubungan yang tiba-tiba bergeser. Cerita ini menelusuri dampak dari
            ruang, data, dan manusia.
          </p>
          <div className="scroll-indicator">
            <span>Scroll untuk menjelajah</span>
            <div className="scroll-arrow">↓</div>
          </div>
        </div>
      </section>

      {/* ===== SKALA SECTION — Merged Map & Scroll-driven Region Cards ===== */}
      <section ref={skalaSection} className="skala-section">
        <div className="skala-map-container"></div>
        <div className="skala-gradient"></div>

        {/* Step 0: Intro content (boundaries) */}
        <div className="skala-content">
          <h2 className="skala-title">Seberapa Luas Dampaknya?</h2>
          <p className="skala-text">
            Kerusakan tidak berhenti di satu titik. Ia menjalar mengikuti
            sungai, jalan, dan pola permukiman — seperti riak yang terus meluas
            setelah batu pertama jatuh.
          </p>
          <div className="skala-legend">
            <div className="skala-legend-item">
              <span
                className="skala-dot"
                style={{ background: "#FF6B6B" }}
              ></span>
              Aceh
            </div>
            <div className="skala-legend-item">
              <span
                className="skala-dot"
                style={{ background: "#FFA500" }}
              ></span>
              Sumatera Utara
            </div>
            <div className="skala-legend-item">
              <span
                className="skala-dot"
                style={{ background: "#FFD166" }}
              ></span>
              Sumatera Barat
            </div>
          </div>
        </div>

        {/* Step 1: PML/PCL summary overlay */}
        <div className="skala-pml-overlay">
          <div className="pml-summary-card">
            <h3 className="pml-summary-title">Jumlah PML & PCL per Wilayah</h3>
            {regionsData.map((region) => {
              const pmlValue = region.stats[1]?.value || "0";
              const pclValue = region.stats[0]?.value || "0";
              return (
                <div key={region.id} className="pml-region-row">
                  <span className="pml-region-name">{region.name}</span>
                  <div className="pml-badges">
                    <span className="pml-badge-card">{pmlValue}</span>
                    <span className="pcl-badge-card">{pclValue}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Steps 2-4: Region detail overlay (stats + photo cards) */}
        <div className="skala-overlay-ui">
          {/* TOP-LEFT: Stats Card */}
          <div className="map-card-slot map-card-slot--top-left">
            {regionsData.map((region, index) => (
              <div
                key={region.id}
                className={`map-stats-card ${skalaStep >= 2 && skalaStep - 2 === index ? "active" : ""}`}
              >
                <div className="msc-header">
                  <div className="msc-icon">
                    <region.icon size={20} />
                  </div>
                  <div>
                    <h3 className="msc-region-name">{region.name}</h3>
                    <span className="msc-cities">
                      {region.cities.join(", ")}
                    </span>
                  </div>
                  <span className="msc-step">
                    {index + 1}/{regionsData.length}
                  </span>
                </div>
                <div className="msc-body">
                  <div className="msc-stat-grid">
                    {region.stats.map((stat) => (
                      <div key={stat.label} className="msc-stat">
                        <span className="msc-stat-value">{stat.value}</span>
                        <span className="msc-stat-label">{stat.label}</span>
                      </div>
                    ))}
                  </div>
                  <div className="msc-damage">
                    {region.damageDetails.map((d) => (
                      <div key={d.label} className="msc-damage-row">
                        <span className="msc-damage-icon">{d.icon}</span>
                        <span className="msc-damage-label">{d.label}</span>
                        <span className="msc-damage-val">{d.value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="msc-progress">
                    <div className="msc-progress-label">
                      <span>Pemulihan</span>
                      <span>{region.progress}%</span>
                    </div>
                    <div className="msc-progress-track">
                      <div
                        className="msc-progress-fill"
                        style={{ width: `${region.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="msc-needs">
                    {region.needs.map((n) => (
                      <span key={n} className="msc-need-tag">
                        {n}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* BOTTOM-RIGHT: Photo Card */}
          <div className="map-card-slot map-card-slot--bottom-right">
            {regionsData.map((region, index) => (
              <div
                key={region.id}
                className={`map-photo-card ${skalaStep >= 2 && skalaStep - 2 === index ? "active" : ""}`}
              >
                <div className="mpc-img-wrap">
                  <img
                    src={region.photo}
                    alt={region.name}
                    className="mpc-img"
                  />
                  <div className="mpc-img-gradient"></div>
                </div>
                <div className="mpc-caption">
                  <span className="mpc-badge">{region.name}</span>
                  <p className="mpc-text">{region.photoCaption}</p>
                  <p className="mpc-story">{region.stories}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Scroll hint */}
          <div className="map-scroll-hint">
            <span>↕ Scroll untuk menjelajah wilayah</span>
          </div>
        </div>

        {/* Step indicator */}
        <div className="skala-step-indicator">
          {["Skala", "PML/PCL", "Aceh", "Sumut", "Sumbar"].map((label, i) => (
            <div
              key={i}
              className={`skala-step-dot ${skalaStep === i ? "active" : ""}`}
            >
              <span className="skala-step-dot-inner"></span>
              <span className="skala-step-dot-label">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ===== TEMUAN FISIK SECTION — Horizontal Scroll Carousel ===== */}
      <section ref={temuanSection} className="temuan-section">
        <div className="temuan-header">
          <span className="section-tag dark">🏚️ Temuan Fisik</span>
          <h2 className="temuan-title">
            TEMUAN FISIK — <em>"Apa yang Tersisa"</em>
          </h2>
          <p className="temuan-quote">
            "Retakan pada dinding terlihat pertama, tapi perubahan rasa aman
            bertahan paling lama."
          </p>
        </div>

        <div ref={temuanTrack} className="temuan-track">
          {/* Photo carousel cards */}
          <div className="temuan-photo-card">
            <div className="temuan-tape"></div>
            <img src={bencana1} alt="Rumah rusak bencana" />
            <p className="temuan-photo-caption">
              Dinding retak akibat guncangan gempa
            </p>
          </div>
          <div className="temuan-photo-card">
            <div className="temuan-tape"></div>
            <img src={bencana2} alt="Kerusakan struktur" />
            <p className="temuan-photo-caption">
              Atap rumah ambruk — struktur tidak bisa diperbaiki
            </p>
          </div>
          <div className="temuan-photo-card">
            <div className="temuan-tape"></div>
            <img src={bencana3} alt="Dampak longsor" />
            <p className="temuan-photo-caption">
              Longsor menghancurkan permukiman di lereng
            </p>
          </div>
          <div className="temuan-photo-card">
            <div className="temuan-tape"></div>
            <img src={bencana4} alt="Bencana banjir" />
            <p className="temuan-photo-caption">
              Banjir merendam hunian hingga lantai dua
            </p>
          </div>
          <div className="temuan-photo-card">
            <div className="temuan-tape"></div>
            <img src={warga4} alt="Kondisi warga" />
            <p className="temuan-photo-caption">
              Warga menyelamatkan barang dari reruntuhan
            </p>
          </div>
          <div className="temuan-photo-card">
            <div className="temuan-tape"></div>
            <img src={warga5} alt="Dampak pada warga" />
            <p className="temuan-photo-caption">
              Sisa hunian yang tidak lagi bisa ditempati
            </p>
          </div>

          {/* Bar chart panel at the end of carousel */}
          <div className="temuan-chart-container">
            <h3 className="temuan-chart-title">Proporsi Jenis Kerusakan</h3>
            <div className="temuan-chart">
              <div className="temuan-bar-group">
                <div
                  className="temuan-bar"
                  data-height="180px"
                  style={{ "--bar-color": "#FF6B6B" }}
                ></div>
                <span className="temuan-bar-label">Rusak Berat</span>
                <span className="temuan-bar-value">42%</span>
              </div>
              <div className="temuan-bar-group">
                <div
                  className="temuan-bar"
                  data-height="130px"
                  style={{ "--bar-color": "#FFA500" }}
                ></div>
                <span className="temuan-bar-label">Rusak Sedang</span>
                <span className="temuan-bar-value">31%</span>
              </div>
              <div className="temuan-bar-group">
                <div
                  className="temuan-bar"
                  data-height="80px"
                  style={{ "--bar-color": "#FFD166" }}
                ></div>
                <span className="temuan-bar-label">Rusak Ringan</span>
                <span className="temuan-bar-value">18%</span>
              </div>
              <div className="temuan-bar-group">
                <div
                  className="temuan-bar"
                  data-height="40px"
                  style={{ "--bar-color": "#81C784" }}
                ></div>
                <span className="temuan-bar-label">Tidak Rusak</span>
                <span className="temuan-bar-value">9%</span>
              </div>
            </div>
            <p className="temuan-chart-note">
              Sumber: Pendataan Langsung Lapangan (PKL 65)
            </p>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="temuan-scroll-hint">
          <span>← Scroll untuk melihat lebih banyak →</span>
        </div>
      </section>

      {/* ===== IMPACT / DISASTER SECTION — Infographic ===== */}
      <section ref={impactSection} className="impact-section">
        <div className="infog-wrapper">
          <div className="infog-bg-grid"></div>

          <div className="infog-header">
            <span className="section-tag light">⚠️ Dampak Bencana</span>
            <h2 className="infog-title">Analisis Kerusakan dan Kerugian</h2>
          </div>

          <div className="infog-viewport">
            {disasterData.map((disaster, index) => (
              <div
                key={disaster.id}
                className={`infog-slide infog-slide-${index}`}
              >
                <div className="infog-slide-inner">
                  <div className="infog-visual">
                    <div className="infog-img-frame">
                      <img
                        src={disaster.image}
                        alt={disaster.title}
                        className="infog-img"
                      />
                      <div className="infog-img-overlay"></div>
                    </div>
                    <span className="infog-type-badge">
                      {disaster.description}
                    </span>
                  </div>

                  <div className="infog-content">
                    <div className="infog-slide-num">
                      {String(index + 1).padStart(2, "0")}
                    </div>
                    <h3 className="infog-slide-title">{disaster.title}</h3>
                    <p className="infog-story">{disaster.story}</p>

                    <div className="infog-stats">
                      {disaster.stats.map((stat) => (
                        <div
                          key={stat.label}
                          className="infog-stat"
                          style={{ "--accent": stat.color }}
                        >
                          <div
                            className="infog-stat-bar"
                            style={{ background: stat.color }}
                          ></div>
                          <span className="infog-stat-value">{stat.value}</span>
                          <span className="infog-stat-suffix">
                            {stat.suffix}
                          </span>
                          <span className="infog-stat-label">{stat.label}</span>
                        </div>
                      ))}
                    </div>

                    <div className="infog-callout">
                      <Lightbulb size={18} />
                      <p>{disaster.impact}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="infog-nav">
            {disasterData.map((d, i) => (
              <div
                key={i}
                className={`infog-dot ${activeDisaster === i ? "active" : ""}`}
              >
                <span className="infog-dot-inner"></span>
                <span className="infog-dot-label">{d.title}</span>
              </div>
            ))}
          </div>

          <div className="infog-scroll-hint">
            <span>↕ Scroll untuk melihat dampak lainnya</span>
          </div>
        </div>
      </section>

      {/* ===== EVACUATION SECTION ===== */}
      <section ref={evacuationSection} className="evacuation-section">
        {/* Hero parallax tent photo */}
        <div className="evac-hero-parallax">
          <img
            src={pengungsian}
            alt="Tenda pengungsian"
            className="evac-hero-img"
          />
          <div className="evac-hero-overlay" />
        </div>

        <div className="evac-container">
          <div className="section-header">
            <span className="section-tag">🏕️ Ruang Sementara</span>
            <h2 className="section-title-text">
              EVAKUASI — &ldquo;Ruang Sementara&rdquo;
            </h2>
            <p className="section-desc">
              &ldquo;Di bawah tenda, hidup berjalan pelan. Ruang mengecil,
              solidaritas membesar.&rdquo;
            </p>
          </div>

          {/* Photo gallery — stop motion scrapbook */}
          <div className="evac-photos">
            {evacuationData.map((evac, index) => (
              <div
                key={`photo-${evac.id}`}
                className={`evac-photo-frame evac-photo-${index + 1}`}
              >
                <img
                  src={evac.image}
                  alt={evac.title}
                  className="evac-photo-img"
                />
                <span className="evac-photo-label">{evac.title}</span>
              </div>
            ))}
          </div>

          {/* Stats section — separate from photos */}
          <div className="evac-stats-grid">
            {evacuationData.map((evac) =>
              evac.stats.map((stat) => {
                const IconComp = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className="evac-stat-card"
                    style={{ "--accent": stat.color }}
                  >
                    <div className="evac-stat-card-icon">
                      <IconComp size={22} />
                    </div>
                    <span className="evac-stat-card-val">
                      {stat.value} <small>{stat.suffix}</small>
                    </span>
                    <span className="evac-stat-card-label">{stat.label}</span>
                  </div>
                );
              }),
            )}
          </div>
        </div>
      </section>

      {/* ===== INSIGHT / KEBUTUHAN WARGA SECTION ===== */}
      <section ref={insightSection} className="insight-section">
        {/* Animated background layers */}
        <div className="insight-bg-layer">
          <div className="insight-bg-orb insight-orb-1" />
          <div className="insight-bg-orb insight-orb-2" />
          <div className="insight-bg-orb insight-orb-3" />
          <div className="insight-bg-grid" />
          <div className="insight-bg-noise" />
        </div>

        {/* Floating particles */}
        <div className="insight-particles">
          {[...Array(12)].map((_, i) => (
            <span
              key={i}
              className={`insight-particle insight-particle-${i + 1}`}
            />
          ))}
        </div>

        <div className="insight-container">
          {/* Header with animated underline */}
          <div className="insight-header">
            <span className="insight-tag">💡 Insight Kebutuhan</span>
            <h2 className="insight-title">
              Air Bersih, Tempat Tinggal, Kesehatan
            </h2>
            <div className="insight-title-underline" />
            <p className="insight-subtitle">
              &ldquo;Tiga kebutuhan yang terus kembali sebagai prioritas utama
              warga.&rdquo;
            </p>
          </div>

          {/* Cards - immersive layout */}
          <div className="insight-cards-grid">
            {needsData.map((need, index) => {
              const IconComponent = need.icon;
              return (
                <div
                  key={need.id}
                  className={`insight-need-card insight-card-${index + 1}`}
                  style={{
                    "--card-color": need.color,
                    "--card-color-light": need.colorLight,
                  }}
                >
                  {/* Glow ring behind icon */}
                  <div className="insight-glow-ring" />

                  {/* Number badge */}
                  <span className="insight-card-num">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <div className="insight-icon-wrapper">
                    <div className="insight-icon">
                      <IconComponent size={56} strokeWidth={1.5} />
                    </div>
                  </div>

                  <div className="insight-card-text">
                    <h3 className="insight-card-title">{need.title}</h3>
                    <p className="insight-card-description">
                      {need.description}
                    </p>

                    {/* Stat highlight */}
                    <div className="insight-stat-highlight">
                      <span className="insight-stat-number">{need.stats}</span>
                      <span className="insight-stat-label">
                        {need.statsLabel}
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="insight-progress-wrap">
                      <div className="insight-progress-header">
                        <span>Tingkat Kebutuhan</span>
                        <span className="insight-progress-pct">
                          {need.percentage}%
                        </span>
                      </div>
                      <div className="insight-progress-track">
                        <div
                          className="insight-progress-fill"
                          style={{ "--fill-width": `${need.percentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Detail text */}
                    <p className="insight-card-detail">{need.detail}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Closing callout */}
          <div className="insight-closing-text">
            <Lightbulb size={24} />
            <p>
              Melalui pendataan langsung, kami mengidentifikasi kebutuhan
              spesifik setiap komunitas untuk memastikan bantuan yang tepat
              sasaran dan berkelanjutan.
            </p>
          </div>
        </div>
      </section>

      {/* ===== TRANSITION: Insight → Interview ===== */}
      <div className="section-transition insight-to-interview">
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
          <path
            d="M0,40 C480,120 960,0 1440,80 L1440,120 L0,120 Z"
            fill="#0a1a18"
          />
        </svg>
      </div>

      {/* ===== INTERVIEW / WAWANCARA SECTION ===== */}
      <section ref={interviewSection} className="interview-section">
        <div className="interview-container">
          <div className="interview-header-area">
            <div className="section-header">
              <span className="section-tag">🎙️ Wawancara</span>
              <h2 className="section-title-text interview-title">
                Di Balik Angka Ada Suara
              </h2>
              <p className="section-desc interview-subtitle">
                &ldquo;Data memberi pola; suara memberi makna.&rdquo;
              </p>
            </div>
          </div>

          {/* Horizontal scroll strip */}
          <div className="interview-scroll-wrap">
            <div className="interview-stack">
              {interviewSlides.map((slide, i) => (
                <div
                  key={i}
                  className={`interview-block interview-block-${i + 1}`}
                >
                  <div className="interview-block-img-wrap">
                    <img
                      src={slide.image}
                      alt={slide.caption}
                      className="interview-block-img"
                    />
                    <div className="interview-block-gradient" />
                    {/* Quote overlay at bottom */}
                    <blockquote className="interview-block-quote">
                      <span className="interview-block-quote-text">
                        &ldquo;{slide.quote}&rdquo;
                      </span>
                    </blockquote>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section Closing — Full-width image with quote overlay */}
          <div className="interview-closing-wrap">
            <div className="interview-closing-img-wrap">
              <img
                src={wawancara}
                alt="Closing interview"
                className="interview-closing-img"
              />
              <div className="interview-closing-overlay" />
              {/* Quote overlay at bottom-left */}
              <blockquote className="interview-closing-quote">
                <span className="interview-closing-quote-text">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do
                  eiusmod.
                </span>
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CLOSING — "Lebih dari Peta" ===== */}
      <section className="closing-section">
        <div className="closing-bg-overlay" />
        <div className="closing-collage">
          <img
            src={warga1}
            alt="Warga terdampak"
            className="closing-collage-img closing-img-1"
          />
          <img
            src={warga2}
            alt="Tim lapangan"
            className="closing-collage-img closing-img-2"
          />
          <img
            src={relawan}
            alt="Relawan"
            className="closing-collage-img closing-img-3"
          />
          <img
            src={warga3}
            alt="Warga"
            className="closing-collage-img closing-img-4"
          />
          <img
            src={warga4}
            alt="Pendataan"
            className="closing-collage-img closing-img-5"
          />
          <img
            src={warga5}
            alt="Solidaritas"
            className="closing-collage-img closing-img-6"
          />
        </div>
        <div className="closing-content">
          <span className="closing-tag">Penutup</span>
          <h2 className="closing-title">Lebih dari Peta</h2>
          <p className="closing-quote">
            &ldquo;Ini bukan hanya arsip kerusakan. Ini catatan tentang
            ketahanan, solidaritas, dan kemampuan manusia untuk memulai
            lagi.&rdquo;
          </p>
          <div className="closing-divider" />
        </div>
      </section>
      <div className="story-navigation">
        <Link
          to="/journey"
          className="nav-button back"
          onClick={() => window.scrollTo(0, 0)}
        >
          ← Sebelumnya
        </Link>
        <Link
          to="/satellite"
          className="nav-button next"
          onClick={() => window.scrollTo(0, 0)}
        >
          Selanjutnya →
        </Link>
      </div>
    </div>
  );
}

export default Findings;
