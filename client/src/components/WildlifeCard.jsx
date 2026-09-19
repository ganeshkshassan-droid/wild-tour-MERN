import React from 'react';
import { MapPin, Clock, ArrowRight } from 'lucide-react';

const WildlifeCard = ({ animal, onSelect }) => {
  const imgSrc = animal.image_url || animal.image || '/images/tiger.jpg';

  return (
    <div className="white-card wildlife-card">
      <div className="card-media-wrap">
        <img
          src={imgSrc}
          alt=""
          aria-hidden="true"
          className="card-media-backdrop"
        />
        <img
          src={imgSrc}
          alt={animal.name}
          className="card-media-img"
          loading="lazy"
        />
        <span className="card-tag-pill">{animal.status || 'Protected Species'}</span>
      </div>

      <div className="card-body">
        <h3 className="card-title">{animal.name}</h3>
        <p className="scientific-name">{animal.scientificName || animal.scientific_name || animal.species}</p>
        <p className="card-desc">{animal.behavior || animal.tagline || animal.overview || animal.description || 'Native resident species of the Nagarhole ecosystem.'}</p>

        <div className="card-meta-row">
          <div className="card-meta-item">
            <Clock size={15} className="text-forest-primary" />
            <span>{animal.bestSightingTime || animal.best_time || 'Dawn & Dusk'}</span>
          </div>
          <div className="card-meta-item">
            <MapPin size={15} className="text-forest-primary" />
            <span>{animal.habitat || animal.hotspot || 'Dammanakatte Zone'}</span>
          </div>
        </div>

        <div className="card-footer-row">
          <button
            onClick={() => onSelect(animal)}
            className="btn-secondary btn-sm"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            <span>Learn More & Species Intel</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      <style>{`
        .wildlife-card .card-media-wrap {
          position: relative;
          width: 100%;
          height: 300px;
          padding-top: 0;
          background: #071911;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .wildlife-card .card-media-backdrop {
          position: absolute;
          inset: -20px;
          width: calc(100% + 40px);
          height: calc(100% + 40px);
          object-fit: cover;
          filter: blur(20px) brightness(0.35);
          transform: scale(1.1);
          pointer-events: none;
        }
        .wildlife-card .card-media-img {
          position: relative;
          top: auto;
          left: auto;
          width: 100%;
          height: 100%;
          object-fit: contain;
          object-position: center;
          z-index: 1;
          transition: transform 0.4s ease;
        }
        .wildlife-card:hover .card-media-img {
          transform: scale(1.02);
        }
        .scientific-name {
          font-size: 0.85rem;
          font-style: italic;
          color: var(--forest-primary);
          margin-bottom: 0.5rem;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
};

export default WildlifeCard;
