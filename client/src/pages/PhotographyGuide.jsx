import React from 'react';
import ScrollReveal from '../components/ScrollReveal';
import { Camera, Sun, Aperture, Eye, Sparkles } from 'lucide-react';

const PhotographyGuide = () => {
  const photoGallery = [
    {
      title: 'Dusk Silhouette on Savanna Horizon',
      author: 'K. S. Ganesh',
      settings: '400mm • f/5.6 • 1/1600s • ISO 400',
      image: '/images/sunset-acacia-trail.jpg',
    },
    {
      title: 'Savanna Sentinel at Golden Hour',
      author: 'Wildlife Desk',
      settings: '500mm • f/4 • 1/2000s • ISO 800',
      image: '/images/savanna-wildlife-safari.jpg',
    },
    {
      title: 'Kabini River Emerald Lagoon',
      author: 'Kabini Safari Crew',
      settings: '24-70mm • f/8 • 1/1000s • ISO 200',
      image: '/images/lagoon-boat-safari.jpg',
    },
    {
      title: 'Waterfront Rainforest Villa',
      author: 'Eco Lodge Media',
      settings: '35mm • f/5.6 • 1/800s • ISO 100',
      image: '/images/waterfront-villa-stay.jpg',
    },
    {
      title: 'Overwater Sanctuary Bungalow',
      author: 'Retreat Desk',
      settings: '28mm • f/4 • 1/1200s • ISO 160',
      image: '/images/luxury-overwater-bungalow.jpg',
    },
    {
      title: 'Saya in Low Canopy',
      author: 'K. S. Ganesh',
      settings: '600mm • f/4 • 1/1250s • ISO 3200',
      image: 'https://images.unsplash.com/photo-1579202673506-ca3ce28943ef?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'Kabini Tusker at Dawn',
      author: 'Padmini R.',
      settings: '200mm • f/2.8 • 1/800s • ISO 800',
      image: 'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'Royal Bengal Tiger Water Crossing',
      author: 'Kabini Safari Crew',
      settings: '400mm • f/2.8 • 1/2000s • ISO 1600',
      image: 'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&w=800&q=80',
    },
  ];

  return (
    <div className="photo-guide-page container section-padding">
      <div className="section-header text-left mb-5">
        <span className="section-eyebrow">
          <Camera size={16} />
          <span>WILDLIFE PHOTOGRAPHY MASTERCLASS</span>
        </span>
        <h1 className="section-title">Field Photography Guide</h1>
        <p className="section-subtitle">
          Recommended focal lengths, shutter speed strategies, and field guidelines for capturing wildlife portraits from open safari gypsies.
        </p>
      </div>

      {/* 3 Pillar Cards */}
      <ScrollReveal className="guide-pillars-grid stagger-group mb-5">
        <div className="white-card pillar-card">
          <div className="pillar-icon"><Sun size={26} className="text-gold-primary" /></div>
          <h3 className="card-title">Golden Hour Timing</h3>
          <p className="card-desc">
            Optimal natural light occurs between 06:15 AM - 07:45 AM and 04:30 PM - 06:00 PM. Position your vehicle for back-lit rim lighting against morning jungle mist.
          </p>
        </div>

        <div className="white-card pillar-card">
          <div className="pillar-icon"><Aperture size={26} className="text-forest-primary" /></div>
          <h3 className="card-title">Lens & Shutter Speed</h3>
          <p className="card-desc">
            Use single-point continuous tracking autofocus (AF-C). Maintain a minimum shutter speed of 1/1000s to counter vehicle engine vibrations on forest tracks.
          </p>
        </div>

        <div className="white-card pillar-card">
          <div className="pillar-icon"><Eye size={26} className="text-sky-blue" /></div>
          <h3 className="card-title">Subject Eye-Level Angle</h3>
          <p className="card-desc">
            Use beanbags instead of tripods on the open gypsy railing. Lowering your optical angle creates an intimate portrait with pleasing background blur.
          </p>
        </div>
      </ScrollReveal>

      {/* Gallery Section */}
      <div className="section-header text-left mt-5 mb-4">
        <span className="section-eyebrow gold">FIELD PORTFOLIO</span>
        <h2 className="section-title">Captured in Nagarhole & Kabini</h2>
      </div>

      <ScrollReveal className="photo-gallery-grid stagger-group">
        {photoGallery.map((item, idx) => (
          <div key={idx} className="white-card gallery-photo-card">
            <div className="gallery-img-wrap">
              <img src={item.image} alt={item.title} className="gallery-img" />
              <div className="gallery-overlay">
                <h4 className="gallery-photo-title">{item.title}</h4>
                <p className="gallery-author">Shot by {item.author}</p>
                <div className="gallery-settings-chip">{item.settings}</div>
              </div>
            </div>
          </div>
        ))}
      </ScrollReveal>

      <style>{`
        .guide-pillars-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
        }
        .pillar-card {
          padding: 2rem;
        }
        .pillar-icon {
          width: 52px;
          height: 52px;
          border-radius: var(--radius-md);
          background: var(--bg-surface-subtle);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.2rem;
        }
        .photo-gallery-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
          gap: 2rem;
        }
        .gallery-img-wrap {
          position: relative;
          width: 100%;
          height: 280px;
        }
        .gallery-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }
        .gallery-photo-card:hover .gallery-img {
          transform: scale(1.06);
        }
        .gallery-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, transparent 40%, rgba(15, 23, 42, 0.9) 100%);
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 1.4rem;
        }
        .gallery-photo-title {
          font-size: 1.15rem;
          color: #ffffff;
          margin-bottom: 0.2rem;
        }
        .gallery-author {
          font-size: 0.82rem;
          color: rgba(255, 255, 255, 0.8);
          margin-bottom: 0.5rem;
        }
        .gallery-settings-chip {
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(6px);
          color: #ffffff;
          padding: 0.25rem 0.65rem;
          border-radius: var(--radius-sm);
          font-size: 0.75rem;
          font-family: monospace;
          width: fit-content;
        }

        @media (max-width: 900px) {
          .guide-pillars-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default PhotographyGuide;
