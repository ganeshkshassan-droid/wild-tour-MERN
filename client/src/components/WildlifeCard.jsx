import React from 'react';
import { Volume2, MapPin, Clock, ArrowRight } from 'lucide-react';

const WildlifeCard = ({ animal, onSelect, onPlaySound }) => {
  return (
    <div className="white-card wildlife-card">
      <div className="card-media-wrap">
        <img
          src={animal.image_url || animal.image || 'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&w=800&q=80'}
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
          {(animal.sound || animal.sound_name) ? (
            <button
              onClick={() => onPlaySound(animal.sound || animal.sound_name)}
              className="btn-ghost btn-sm"
              title="Play alarm call audio"
            >
              <Volume2 size={16} className="text-forest-primary" />
              <span>Alarm Call</span>
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={() => onSelect(animal)}
            className="btn-secondary btn-sm"
          >
            <span>Learn More</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      <style>{`
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
