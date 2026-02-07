import { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Map, { Source, Layer } from "react-map-gl/maplibre";
import gsap from "gsap";
import "maplibre-gl/dist/maplibre-gl.css";
import "./Satellite.css";
import groundTruthPoints from "../data/groundTruthPoints.json";

// Free basemap style dari OpenStreetMap
const MAP_STYLE =
  "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

// Chapter configurations untuk scroll-based navigation
const chapters = {
  cover: {
    center: [98.6, 2.5],
    zoom: 7,
    pitch: 45,
    bearing: -15,
  },
  problem: {
    center: [99.5, 0.5],
    zoom: 5.5,
    pitch: 0,
    bearing: 0,
    duration: 2000,
  },
  groundtruth: {
    center: [98.6, 3.0],
    zoom: 7,
    pitch: 30,
    bearing: 0,
    duration: 2500,
  },
};

function Satellite() {
  const mapRef = useRef();
  const satelliteRef = useRef();
  const [viewState, setViewState] = useState({
    longitude: 99.0,
    latitude: 2.5,
    zoom: 6,
    pitch: 0,
    bearing: 0,
  });
  const [activeChapter, setActiveChapter] = useState("cover");
  const [showPoints, setShowPoints] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Handle map load
  const handleMapLoad = () => {
    setMapLoaded(true);
  };

  // Load and add GeoJSON when map is ready
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;

    const map = mapRef.current.getMap();

    // Dummy GeoJSON data untuk testing (area sekitar Sumatera Utara)
    const dummyData = {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [98.0, 4.0],
            [100.0, 4.0],
            [100.0, 1.0],
            [98.0, 1.0],
            [98.0, 4.0],
          ],
        ],
      },
    };

    // Add source
    if (!map.getSource("survey-area")) {
      map.addSource("survey-area", {
        type: "geojson",
        data: dummyData,
      });

      // Add fill layer
      map.addLayer({
        id: "survey-area-fill",
        type: "fill",
        source: "survey-area",
        paint: {
          "fill-color": "#FF0000",
          "fill-opacity": 0.8,
        },
      });

      // Add outline layer
      map.addLayer({
        id: "survey-area-outline",
        type: "line",
        source: "survey-area",
        paint: {
          "line-color": "#0000FF",
          "line-width": 4,
        },
      });

      console.log("Dummy polygon added successfully");
      console.log(
        "Map layers:",
        map.getStyle().layers.map((l) => l.id),
      );
      console.log("Map sources:", Object.keys(map.getStyle().sources));
    }

    // TODO: Ganti dengan load dari file setelah dummy berhasil
    // fetch('/assets/satellite/R3P_Provinsi.geojson')
    //   .then(response => response.json())
    //   .then(data => {
    //     console.log('GeoJSON loaded:', data);
    //     map.getSource('survey-area').setData(data);
    //   })
    //   .catch(error => {
    //     console.error('Error loading GeoJSON:', error);
    //   });
  }, [mapLoaded]);

  // Update layer opacity based on active chapter
  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current.getMap();
    if (map.getLayer("survey-area-fill")) {
      map.setPaintProperty(
        "survey-area-fill",
        "fill-opacity",
        activeChapter === "problem" ? 0.6 : 0.15,
      );
      map.setPaintProperty(
        "survey-area-outline",
        "line-width",
        activeChapter === "problem" ? 3 : 2,
      );
    }
  }, [activeChapter]);

  // Scroll handler untuk chapter detection
  useEffect(() => {
    const handleScroll = () => {
      const sections = ["cover", "problem", "groundtruth"];

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const bounds = element.getBoundingClientRect();
          // Check if section is in viewport
          if (bounds.top < window.innerHeight * 0.6 && bounds.bottom > 0) {
            if (activeChapter !== section) {
              setActiveChapter(section);

              // Fly to chapter location
              if (mapRef.current && chapters[section]) {
                console.log("Flying to chapter:", section, chapters[section]);
                mapRef.current.flyTo(chapters[section]);
              }

              // Show points on groundtruth section
              if (section === "groundtruth") {
                setShowPoints(true);
              } else {
                setShowPoints(false);
              }
            }
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [activeChapter]);

  useEffect(() => {
    // Animation untuk map
    const mapTimer = setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.flyTo({
          center: [98.6, 2.5],
          zoom: 7,
          pitch: 45,
          bearing: -15,
          duration: 3000,
          essential: true,
        });
      }
    }, 1000);

    // GSAP animation untuk satellite - stop motion style
    if (satelliteRef.current) {
      const timeline = gsap.timeline();

      // Set initial position
      gsap.set(satelliteRef.current, {
        x: -150,
        y: -120,
        rotation: -50,
        opacity: 0,
      });

      // Step 1: Jump to position 1
      timeline.to(satelliteRef.current, {
        x: -100,
        y: -80,
        rotation: -35,
        opacity: 0.4,
        duration: 0,
        delay: 0.3,
      });

      // Step 2: Jump to position 2
      timeline.to(satelliteRef.current, {
        x: -60,
        y: -50,
        rotation: -22,
        opacity: 0.7,
        duration: 0,
        delay: 0.25,
      });

      // Step 3: Jump to position 3
      timeline.to(satelliteRef.current, {
        x: -25,
        y: -20,
        rotation: -15,
        opacity: 0.9,
        duration: 0,
        delay: 0.25,
      });

      // Step 4: Jump to final position
      timeline.to(satelliteRef.current, {
        x: 0,
        y: 0,
        rotation: -8,
        opacity: 1,
        duration: 0,
        delay: 0.25,
      });

      // Bouncy settle (smooth)
      timeline.to(satelliteRef.current, {
        y: -10,
        rotation: -6,
        duration: 0.3,
        ease: "power2.out",
      });

      timeline.to(satelliteRef.current, {
        y: 3,
        rotation: -9,
        duration: 0.25,
        ease: "power2.inOut",
      });

      timeline.to(satelliteRef.current, {
        y: 0,
        rotation: -8,
        duration: 0.2,
        ease: "power2.out",
      });

      // Floating animation (smooth infinite)
      timeline.to(satelliteRef.current, {
        y: -8,
        duration: 2.5,
        yoyo: true,
        repeat: -1,
        ease: "power1.inOut",
      });
    }

    return () => clearTimeout(mapTimer);
  }, []);

  return (
    <div className="satellite-story">
      {/* Fixed Map Container */}
      <div className="map-container-fixed">
        <Map
          ref={mapRef}
          {...viewState}
          onMove={(evt) => setViewState(evt.viewState)}
          onLoad={handleMapLoad}
          mapStyle={MAP_STYLE}
          style={{ width: "100%", height: "100%" }}
          attributionControl={false}
          scrollZoom={false}
          dragPan={false}
          dragRotate={false}
          doubleClickZoom={false}
          touchZoomRotate={false}
        >
          {/* Survey Area Polygons - Added via addSource/addLayer in useEffect */}

          {/* Ground Truth Points - Show on section 3 */}
          {mapLoaded && showPoints && (
            <Source id="ground-truth" type="geojson" data={groundTruthPoints}>
              <Layer
                id="ground-truth-points"
                type="circle"
                paint={{
                  "circle-radius": 8,
                  "circle-color": "#FF4444",
                  "circle-stroke-color": "#FFFFFF",
                  "circle-stroke-width": 2,
                  "circle-opacity": 0.9,
                }}
              />
            </Source>
          )}
        </Map>
      </div>

      {/* Scrollable Content Sections */}
      <div className="story-chapters">
        {/* Section 1: Cover - Solid Background */}
        <section id="cover" className="chapter cover-section">
          <div className="scrapbook-satellite" ref={satelliteRef}>
            <img
              src="/assets/satellite/satellite.webp"
              alt="Satellite"
              className="satellite-image"
            />
          </div>
          <div className="cover-content">
            <h1 className="main-headline">Dari Lapangan ke Satelit</h1>
            <p className="subtitle">Memastikan data lebih akurat</p>
            <div className="scroll-hint">
              <span>Scroll untuk melanjutkan</span>
              <span className="arrow">↓</span>
            </div>
          </div>
        </section>

        {/* Section 2: Problem */}
        <section
          id="problem"
          className={`chapter ${activeChapter === "problem" ? "active" : ""}`}
        >
          <div className="floating-card card-left">
            <h2 className="chapter-title">Wilayah Luas, Waktu Terbatas</h2>
            <p className="chapter-subtitle">Kenapa Perlu Satelit?</p>
            <p className="chapter-text">
              Survei lapangan saja tidak cukup untuk melihat gambaran besar.
              Tiga provinsi dengan ribuan kilometer persegi membutuhkan
              teknologi satelit untuk pemantauan menyeluruh.
            </p>
            <div className="stats">
              <div className="stat-item">
                <span className="stat-number">3</span>
                <span className="stat-label">Provinsi</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">20</span>
                <span className="stat-label">Hari Survei</span>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Ground Truth */}
        <section
          id="groundtruth"
          className={`chapter ${activeChapter === "groundtruth" ? "active" : ""}`}
        >
          <div className="floating-card card-right">
            <h2 className="chapter-title">
              Data Lapangan sebagai Ground Truth
            </h2>
            <p className="chapter-subtitle">Peran Mahasiswa</p>
            <p className="chapter-text">
              Titik koordinat hasil pendataan langsung di lapangan menjadi acuan
              validasi untuk data satelit. Setiap pin merah adalah lokasi yang
              telah disurvei tim.
            </p>
            <div className="info-box">
              <p>📍 12 Titik Survei</p>
              <p>📅 14-26 Januari 2026</p>
            </div>
          </div>
        </section>

        {/* Placeholder untuk section 4-9 */}
        <section className="chapter placeholder">
          <div className="floating-card">
            <h2>Sections 4-9</h2>
            <p>Coming soon...</p>
          </div>
        </section>
      </div>

      {/* Navigation */}
      <div className="story-navigation">
        <Link
          to="/findings"
          className="nav-button back"
          onClick={() => window.scrollTo(0, 0)}
        >
          ← Sebelumnya
        </Link>
        <Link
          to="/"
          className="nav-button next"
          onClick={() => window.scrollTo(0, 0)}
        >
          Selesai →
        </Link>
      </div>
    </div>
  );
}

export default Satellite;
