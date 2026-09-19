import React from 'react';
import ScrollReveal from '../components/ScrollReveal';
import { Compass, ShieldCheck, TreePine, Award, Users, MapPin } from 'lucide-react';

const About = () => {
  return (
    <div className="about-page container section-padding">
      <div className="section-header text-left mb-5">
        <span className="section-eyebrow">
          <TreePine size={16} />
          <span>ABOUT WILD TOUR</span>
        </span>
        <h1 className="section-title">Preserving Nagarhole’s Natural Heritage</h1>
        <p className="section-subtitle">
          Dedicated to ethical wildlife expeditions, habitat preservation, and supporting certified local naturalists in the Nilgiri Biosphere.
        </p>
      </div>

      {/* Hero Visual Card */}
      <ScrollReveal className="about-hero-card white-card mb-5">
        <div className="about-hero-img-wrap">
          <img
            src="https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80"
            alt="Nagarhole Canopy"
            className="about-hero-img"
          />
        </div>
        <div className="about-hero-text">
          <span className="badge badge-forest mb-2">OUR CORE MISSION</span>
          <h2 className="about-hero-title">Respecting the Rhythms of the Jungle</h2>
          <p className="about-lead">
            The Nagarhole National Park and Kabini reservoir ecosystem forms a vital lifeline in the Western Ghats. Our mission is to bridge travelers with profound wildlife experiences without disturbing fragile natural habitats.
          </p>
          <p className="about-lead">
            We follow strict ethical guidelines: limiting vehicles per track, adhering to speed limits, avoiding plastic waste, and promoting eco-sensitive lodge accommodations.
          </p>
        </div>
      </ScrollReveal>

      {/* 3 Core Values Grid */}
      <ScrollReveal className="values-grid stagger-group">
        <div className="white-card value-card">
          <div className="value-icon"><TreePine size={26} className="text-forest-primary" /></div>
          <h3 className="card-title">Low-Impact Tourism</h3>
          <p className="card-desc">
            We restrict the number of vehicles per safari track and strictly enforce engine cutoff protocols near predator sightings to eliminate noise pollution.
          </p>
        </div>

        <div className="white-card value-card">
          <div className="value-icon"><Award size={26} className="text-gold-primary" /></div>
          <h3 className="card-title">Experienced Naturalists</h3>
          <p className="card-desc">
            Our safari guides and trackers have generational field knowledge of tiger pugmarks, alarm calls, and rainforest flora.
          </p>
        </div>

        <div className="white-card value-card">
          <div className="value-icon"><ShieldCheck size={26} className="text-sky-blue" /></div>
          <h3 className="card-title">Verified Gate Permits</h3>
          <p className="card-desc">
            All 4x4 open-top safaris and catamaran boat cruises adhere strictly to forest reception carrying capacities and timings.
          </p>
        </div>
      </ScrollReveal>

      <style>{`
        .about-hero-card {
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          gap: 2.5rem;
          padding: 2rem;
          align-items: center;
        }
        .about-hero-img-wrap {
          width: 100%;
          height: 360px;
          border-radius: var(--radius-md);
          overflow: hidden;
        }
        .about-hero-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .about-hero-title {
          font-size: 2rem;
          color: var(--text-heading);
          margin-bottom: 1rem;
        }
        .about-lead {
          color: var(--text-secondary);
          font-size: 0.96rem;
          line-height: 1.7;
          margin-bottom: 1rem;
        }
        .values-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
        }
        .value-card {
          padding: 2rem;
        }
        .value-icon {
          width: 52px;
          height: 52px;
          border-radius: var(--radius-md);
          background: var(--bg-surface-subtle);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.2rem;
        }

        @media (max-width: 900px) {
          .about-hero-card { grid-template-columns: 1fr; }
          .values-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default About;
