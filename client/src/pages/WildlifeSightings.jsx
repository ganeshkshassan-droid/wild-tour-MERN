import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import WildlifeCard from '../components/WildlifeCard';
import SkeletonLoader from '../components/SkeletonLoader';
import {
  TreePine,
  Volume2,
  Camera,
  MapPin,
  Clock,
  Activity,
  ChevronRight
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

const WildlifeSightings = () => {
  const [speciesList, setSpeciesList] = useState([]);
  const [activeSpecies, setActiveSpecies] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    fetchWildlife();
  }, []);

  const fetchWildlife = async () => {
    try {
      const res = await api.getWildlife();
      if (res.success && res.data.length > 0) {
        setSpeciesList(res.data);
        setActiveSpecies(res.data[0]);
      }
    } catch (error) {
      console.error('Error loading wildlife data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateSound = (soundName) => {
    showToast(`🔊 Sound Simulation: "${soundName}"`, 'info');
  };

  return (
    <div className="wildlife-page container section-padding">
      <div className="section-header text-left mb-5">
        <span className="section-eyebrow">
          <TreePine size={16} />
          <span>FAUNA DIRECTORY & RADAR</span>
        </span>
        <h1 className="section-title">Wildlife Sightings & Species Guide</h1>
        <p className="section-subtitle">
          Explore the habitat ranges, optimal viewing hours, and conservation status of resident species in the Nagarhole & Kabini ecosystem.
        </p>
      </div>

      {loading ? (
        <SkeletonLoader count={3} />
      ) : activeSpecies ? (
        <div className="wildlife-spotlight-layout mb-5">
          {/* Left Species Directory Sidebar */}
          <div className="white-card species-sidebar">
            <h3 className="sidebar-title">Species Directory</h3>
            <div className="species-nav-list">
              {speciesList.map((item) => (
                <button
                  key={item.slug || item.id || item._id}
                  onClick={() => setActiveSpecies(item)}
                  className={`species-nav-btn ${(activeSpecies._id === item._id || activeSpecies.slug === item.slug) ? 'active' : ''}`}
                >
                  <img
                    src={item.image || item.image_url}
                    alt={item.name}
                    className="species-nav-thumb"
                  />
                  <div className="species-nav-text">
                    <span className="species-name">{item.name}</span>
                    <span className="species-status">{item.status || 'Protected'}</span>
                  </div>
                  <ChevronRight size={16} className="species-arrow" />
                </button>
              ))}
            </div>
          </div>

          {/* Active Species Detailed Spotlight */}
          <div className="white-card species-spotlight-box">
            <div className="spotlight-media-wrap">
              <img
                src={activeSpecies.image || activeSpecies.image_url}
                alt={activeSpecies.name}
                className="spotlight-img"
              />
              <div className="spotlight-overlay-tags">
                <span className="badge badge-forest">{activeSpecies.status || 'Protected Species'}</span>
                {(activeSpecies.sound || activeSpecies.sound_name) && (
                  <button
                    onClick={() => handleSimulateSound(activeSpecies.sound || activeSpecies.sound_name)}
                    className="btn-primary btn-sm bg-white text-forest-primary"
                  >
                    <Volume2 size={15} />
                    <span>Play Alarm Call</span>
                  </button>
                )}
              </div>
            </div>

            <div className="spotlight-body">
              <h2 className="spotlight-title">{activeSpecies.name}</h2>
              {activeSpecies.kannadaName && (
                <span className="badge badge-gold mb-2 font-bold" style={{ fontSize: '0.82rem' }}>
                  {activeSpecies.kannadaName}
                </span>
              )}
              <p className="spotlight-scientific">{activeSpecies.scientificName || activeSpecies.scientific_name || activeSpecies.species}</p>
              <p className="spotlight-overview">{activeSpecies.behavior || activeSpecies.overview || activeSpecies.description || activeSpecies.tagline}</p>

              <div className="spotlight-intel-grid">
                <div className="intel-box">
                  <Clock size={18} className="text-gold-primary" />
                  <div>
                    <span className="intel-label">Best Sighting Window</span>
                    <span className="intel-val">{activeSpecies.bestSightingTime || activeSpecies.best_time || '06:00 AM - 08:30 AM'}</span>
                  </div>
                </div>

                <div className="intel-box">
                  <MapPin size={18} className="text-forest-primary" />
                  <div>
                    <span className="intel-label">Primary Habitat Hotspot</span>
                    <span className="intel-val">{activeSpecies.habitat || activeSpecies.hotspot || 'Dammanakatte Zone A & B'}</span>
                  </div>
                </div>

                <div className="intel-box">
                  <Camera size={18} className="text-sky-blue" />
                  <div>
                    <span className="intel-label">Sighting Probability</span>
                    <span className="intel-val">{activeSpecies.sightingProbability || 'High in Summer'}</span>
                  </div>
                </div>

                <div className="intel-box">
                  <Activity size={18} className="text-forest-light" />
                  <div>
                    <span className="intel-label">Sanctuary Status & Notes</span>
                    <span className="intel-val">{activeSpecies.population_note || activeSpecies.population || 'Protected Resident'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Grid of All Cards */}
      <h3 className="section-title text-xl text-left mb-4">All Resident Species</h3>
      <div className="cards-grid">
        {speciesList.map((animal) => (
          <WildlifeCard
            key={animal._id || animal.id}
            animal={animal}
            onSelect={(a) => {
              setActiveSpecies(a);
              window.scrollTo({ top: 180, behavior: 'smooth' });
            }}
            onPlaySound={handleSimulateSound}
          />
        ))}
      </div>

      <style>{`
        .wildlife-spotlight-layout {
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 2rem;
        }
        .species-sidebar {
          padding: 1.5rem;
          height: fit-content;
        }
        .sidebar-title {
          font-size: 1.15rem;
          color: var(--text-heading);
          margin-bottom: 1.2rem;
        }
        .species-nav-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .species-nav-btn {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          background: var(--bg-surface-subtle);
          border: 1px solid var(--border-light);
          padding: 0.65rem 0.85rem;
          border-radius: var(--radius-sm);
          text-align: left;
          width: 100%;
        }
        .species-nav-btn:hover, .species-nav-btn.active {
          background-color: var(--forest-subtle);
          border-color: var(--forest-primary);
        }
        .species-nav-thumb {
          width: 44px;
          height: 44px;
          border-radius: var(--radius-xs);
          object-fit: cover;
        }
        .species-nav-text {
          flex: 1;
        }
        .species-name {
          font-size: 0.92rem;
          font-weight: 700;
          color: var(--text-heading);
          display: block;
        }
        .species-status {
          font-size: 0.72rem;
          color: var(--forest-primary);
        }
        .species-arrow {
          color: var(--text-muted);
        }
        /* Spotlight Box */
        .spotlight-media-wrap {
          position: relative;
          width: 100%;
          height: 380px;
        }
        .spotlight-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .spotlight-overlay-tags {
          position: absolute;
          bottom: 16px;
          left: 16px;
          right: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .spotlight-body {
          padding: 2.2rem;
        }
        .spotlight-title {
          font-size: 2.2rem;
          color: var(--text-heading);
          margin-bottom: 0.2rem;
        }
        .spotlight-scientific {
          color: var(--forest-primary);
          font-style: italic;
          font-size: 1rem;
          margin-bottom: 1rem;
        }
        .spotlight-overview {
          color: var(--text-secondary);
          font-size: 0.98rem;
          line-height: 1.7;
          margin-bottom: 1.6rem;
        }
        .spotlight-intel-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.2rem;
        }
        .intel-box {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          background: var(--bg-surface-subtle);
          padding: 1rem;
          border-radius: var(--radius-md);
        }
        .intel-label {
          font-size: 0.72rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          display: block;
        }
        .intel-val {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--text-heading);
          margin-top: 2px;
          display: block;
        }
        .cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
          gap: 2rem;
        }

        @media (max-width: 900px) {
          .wildlife-spotlight-layout { grid-template-columns: 1fr; }
          .spotlight-intel-grid { grid-template-columns: 1fr; }
          .spotlight-media-wrap { height: 260px; }
        }
      `}</style>
    </div>
  );
};

export default WildlifeSightings;
