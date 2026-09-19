import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import StayCard from '../components/StayCard';
import SkeletonLoader from '../components/SkeletonLoader';
import ScrollReveal from '../components/ScrollReveal';
import {
  Search,
  Calendar,
  Users,
  Compass,
  ArrowRight,
  ArrowLeft,
  Star,
  CheckCircle2,
  TreePine,
  ShieldCheck,
  ChevronRight,
  Hotel,
  Layers,
  Award,
  Sparkles,
  MapPin,
  Clock
} from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();

  // Data States
  const [safaris, setSafaris] = useState([]);
  const [stays, setStays] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search Widget State
  const [activeTab, setActiveTab] = useState('Safaris');
  const [searchZone, setSearchZone] = useState('All Zones');
  const [searchDate, setSearchDate] = useState('');
  const [searchGuests, setSearchGuests] = useState('2');

  // Horizontal Scroll Ref for Stays Shelf
  const staysScrollRef = useRef(null);

  useEffect(() => {
    fetchHomeData();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setSearchDate(tomorrow.toISOString().split('T')[0]);
  }, []);

  const fetchHomeData = async () => {
    try {
      const [safariRes, stayRes, pkgRes] = await Promise.all([
        api.getSafaris(),
        api.getStays(),
        api.getPackages(),
      ]);

      if (safariRes.success) setSafaris(safariRes.data);
      if (stayRes.success) setStays(stayRes.data);
      if (pkgRes.success) setPackages(pkgRes.data);
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenBooking = (item, type) => {
    const itemType = type || 'Stay';
    navigate(`/booking/${itemType}/${item._id || item.id}`, {
      state: { item, itemType },
    });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (activeTab === 'Safaris') navigate('/safaris');
    else if (activeTab === 'Stays') navigate('/stays');
    else if (activeTab === 'Packages') navigate('/packages');
    else navigate('/guides');
  };

  const scrollStays = (direction) => {
    if (staysScrollRef.current) {
      const scrollAmount = 380;
      staysScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="home-page-root">
      {/* 1. HERO SECTION */}
      <section className="hero-section">
        <div className="hero-bg-overlay" />
        <div className="container hero-container">
          <div className="hero-content text-center">
            <span className="hero-eyebrow">
              <TreePine size={16} />
              <span>NAGARHOLE NATIONAL PARK & KABINI RESERVOIR</span>
            </span>
            <h1 className="hero-title">
              Untamed Wilderness.<br />Unrivaled Luxury.
            </h1>
            <p className="hero-subtitle">
              Reserve official 4x4 open-top safaris, luxury riverfront lodges, and certified naturalist guides in India’s premier big cat sanctuary.
            </p>
          </div>

          {/* Floating Search Widget */}
          <div className="hero-search-widget">
            {/* Category Tabs */}
            <div className="search-tabs-row">
              {['Safaris', 'Stays', 'Packages', 'Guides'].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`search-tab-pill ${activeTab === tab ? 'active' : ''}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Form Fields */}
            <form onSubmit={handleSearchSubmit} className="search-form-grid">
              <div className="search-field-box">
                <label className="search-field-label">EXPERIENCE / ZONE</label>
                <div className="search-field-input-wrap">
                  <Compass size={18} className="text-forest-primary" />
                  <select
                    value={searchZone}
                    onChange={(e) => setSearchZone(e.target.value)}
                    className="search-select"
                  >
                    <option value="All Zones">All Sanctuary Zones</option>
                    <option value="Dammanakatte Zone A">Dammanakatte Zone A</option>
                    <option value="Dammanakatte Zone B">Dammanakatte Zone B</option>
                    <option value="Kabini Riverfront">Kabini Riverfront</option>
                  </select>
                </div>
              </div>

              <div className="search-field-box">
                <label className="search-field-label">SCHEDULE DATE</label>
                <div className="search-field-input-wrap">
                  <Calendar size={18} className="text-forest-primary" />
                  <input
                    type="date"
                    value={searchDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setSearchDate(e.target.value)}
                    className="search-input"
                  />
                </div>
              </div>

              <div className="search-field-box">
                <label className="search-field-label">TRAVELERS</label>
                <div className="search-field-input-wrap">
                  <Users size={18} className="text-forest-primary" />
                  <select
                    value={searchGuests}
                    onChange={(e) => setSearchGuests(e.target.value)}
                    className="search-select"
                  >
                    <option value="1">1 Person</option>
                    <option value="2">2 Persons</option>
                    <option value="4">4 Persons (Gypsy)</option>
                    <option value="6">6 Persons (Family)</option>
                  </select>
                </div>
              </div>

              <div className="search-cta-box">
                <button type="submit" className="btn-primary search-submit-btn">
                  <span>Explore {activeTab}</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            </form>

            {/* Live Sanctuary Telemetry & Sighting Odds Ticker */}
            <div className="hero-telemetry-strip">
              <div className="telemetry-live-badge">
                <span className="live-pulse-dot" />
                <span>LIVE DISPATCH</span>
              </div>
              <div className="telemetry-scroll-wrapper">
                <Link to="/wildlife" className="telemetry-chip">
                  <span className="chip-emoji">🐆</span>
                  <span><strong>Saya (Black Panther):</strong> Sighted in Zone B Teak Canopy</span>
                </Link>
                <Link to="/safaris" className="telemetry-chip">
                  <span className="chip-emoji">🐅</span>
                  <span><strong>Bengal Tiger:</strong> 88% Sighting Probability in Zone A</span>
                </Link>
                <Link to="/stays" className="telemetry-chip">
                  <span className="chip-emoji">🐘</span>
                  <span><strong>Kabini Backwaters:</strong> 42+ Wild Elephants at Sunset</span>
                </Link>
                <Link to="/safaris" className="telemetry-chip highlight">
                  <span className="chip-emoji">🎟️</span>
                  <span><strong>Permit Quotas:</strong> 6 Open Gypsy Seats Remaining</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. QUICK SANCTUARY EXPLORER (INTERACTIVE EXPERIENCE MATRIX) */}
      <ScrollReveal as="section" className="container section-padding-sm pb-2">
        <div className="section-header text-left mb-4">
          <span className="section-eyebrow">
            <Sparkles size={15} />
            <span>INSTANT SANCTUARY DISCOVERY</span>
          </span>
          <h2 className="section-title text-2xl">Featured Sanctuary Expeditions</h2>
          <p className="section-subtitle">
            Direct access to official Nagarhole core safaris, wildlife radar, and waterfront lodges.
          </p>
        </div>

        <div className="quick-explorer-grid stagger-group">
          <div className="quick-exp-card" onClick={() => navigate('/safaris')}>
            <div className="exp-icon-circle bg-forest">
              <Compass size={22} className="text-forest-primary" />
            </div>
            <div className="exp-info">
              <h3 className="exp-title">4x4 Open Gypsy Safari</h3>
              <p className="exp-desc">Core Zone A & B Dawn Predator Corridors</p>
              <span className="exp-link">Book Permits →</span>
            </div>
            <span className="exp-badge">88% Tiger Odds</span>
          </div>

          <div className="quick-exp-card" onClick={() => navigate('/wildlife')}>
            <div className="exp-icon-circle bg-gold">
              <TreePine size={22} className="text-gold-primary" />
            </div>
            <div className="exp-info">
              <h3 className="exp-title">Black Panther & Wildlife Radar</h3>
              <p className="exp-desc">Real-time sighting tracking & species guide</p>
              <span className="exp-link">Live Radar →</span>
            </div>
            <span className="exp-badge gold">Saya Tracking</span>
          </div>

          <div className="quick-exp-card" onClick={() => navigate('/stays')}>
            <div className="exp-icon-circle bg-sky">
              <Hotel size={22} className="text-sky-blue" />
            </div>
            <div className="exp-info">
              <h3 className="exp-title">Waterfront Lodges & Stays</h3>
              <p className="exp-desc">Colonial bungalows along Kabini backwaters</p>
              <span className="exp-link">View Lodges →</span>
            </div>
            <span className="exp-badge">Verified Luxury</span>
          </div>

          <div className="quick-exp-card" onClick={() => navigate('/packages')}>
            <div className="exp-icon-circle bg-forest">
              <Layers size={22} className="text-forest-primary" />
            </div>
            <div className="exp-info">
              <h3 className="exp-title">All-Inclusive Tour Packages</h3>
              <p className="exp-desc">Lodge Stay + 4 Safaris + Certified Guide</p>
              <span className="exp-link">Explore Itineraries →</span>
            </div>
            <span className="exp-badge">Complete Trips</span>
          </div>
        </div>
      </ScrollReveal>

      {/* 3. HORIZONTAL DISCOVERY SHELF: WATERFRONT STAYS & LODGES */}
      <ScrollReveal as="section" className="horizontal-shelf-section section-padding">
        <div className="container">
          <div className="shelf-header-row">
            <div>
              <span className="section-eyebrow">
                <Hotel size={16} />
                <span>WATERFRONT RESORTS & JUNGLE LODGES</span>
              </span>
              <h2 className="section-title text-left">Curated Accommodations</h2>
              <p className="section-subtitle text-left">
                Five-star colonial bungalows and eco-cottages along the tranquil Kabini backwaters.
              </p>
            </div>

            {/* Scroll Navigation Arrows */}
            <div className="shelf-scroll-controls">
              <button
                onClick={() => scrollStays('left')}
                className="btn-icon"
                aria-label="Previous stays"
              >
                <ArrowLeft size={18} />
              </button>
              <button
                onClick={() => scrollStays('right')}
                className="btn-icon"
                aria-label="Next stays"
              >
                <ArrowRight size={18} />
              </button>
              <Link to="/stays" className="btn-secondary btn-sm">
                View All Stays
              </Link>
            </div>
          </div>

          {/* Horizontal Scroll Track */}
          {loading ? (
            <SkeletonLoader count={3} />
          ) : (
            <div className="shelf-scroll-track" ref={staysScrollRef}>
              {stays.map((stay) => (
                <div key={stay._id || stay.id} className="shelf-card-wrapper">
                  <StayCard stay={stay} onBook={(s) => handleOpenBooking(s, 'Stay')} />
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollReveal>

      {/* 4. BLACK PANTHER EDITORIAL SPOTLIGHT ("MELANISTIC LEOPARD") */}
      <ScrollReveal as="section" className="container section-padding">
        <div className="panther-editorial-card">
          <div className="panther-img-wrap">
            <img
              src="/images/black-panther.jpg"
              alt="Black Panther - Melanistic Leopard"
              className="panther-feature-img"
            />
            <span className="card-tag-pill">RARE SANCTUARY SIGHTING</span>
          </div>

          <div className="panther-content-wrap">
            <span className="section-eyebrow gold">
              <Sparkles size={16} />
              <span>THE GHOST OF KABINI</span>
            </span>
            <h2 className="panther-title">Black Panther</h2>
            <p className="panther-subtitle font-medium text-forest-primary">
              Melanistic Leopard (Panthera pardus)
            </p>
            <p className="panther-desc">
              Known locally as Saya, the iconic black panther of Kabini is an extraordinary melanistic morph of the Indian leopard. Possessing dense dark rosettes concealed beneath a glistening obsidian coat, this elusive apex predator is native to the dense teak and bamboo canopies of Nagarhole.
            </p>

            <div className="panther-meta-grid">
              <div className="panther-meta-item">
                <span className="p-label">PRIMARY TERRITORY</span>
                <span className="p-val">Dammanakatte Zone B Corridors</span>
              </div>
              <div className="panther-meta-item">
                <span className="p-label">BEST SIGHTING MONTHS</span>
                <span className="p-val">February – May (Dry Season)</span>
              </div>
            </div>

            <div className="panther-actions mt-4">
              <Link to="/wildlife" className="btn-primary">
                <span>Explore Wildlife Radar</span>
                <ChevronRight size={18} />
              </Link>
              <Link to="/photography" className="btn-secondary">
                Photography Masterclass
              </Link>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* 5. ALL-INCLUSIVE SIGNATURE EXPEDITIONS (TIMELINE LAYOUT) */}
      <ScrollReveal as="section" className="container section-padding">
        <div className="section-header">
          <span className="section-eyebrow">
            <Layers size={16} />
            <span>ALL-INCLUSIVE HOLIDAYS</span>
          </span>
          <h2 className="section-title">Curated Expedition Itineraries</h2>
          <p className="section-subtitle">
            Complete holiday journeys combining luxury stays, daily morning & evening safaris, gourmet dining, and certified guides.
          </p>
        </div>

        {loading ? (
          <SkeletonLoader count={2} />
        ) : (
          <div className="packages-timeline-grid stagger-group">
            {packages.slice(0, 2).map((pkg) => (
              <div key={pkg._id || pkg.id} className="white-card package-timeline-card">
                <div className="package-timeline-header">
                  <div className="package-media-thumb-wrap">
                    <img
                      src={pkg.image_url || 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=600&q=80'}
                      alt={pkg.name}
                      className="package-media-thumb"
                    />
                  </div>
                  <div>
                    <span className="badge badge-gold mb-1">{pkg.duration_days} Days / {pkg.duration_days - 1} Nights</span>
                    <h3 className="card-title text-xl">{pkg.name}</h3>
                    <p className="text-secondary text-sm">{pkg.description}</p>
                  </div>
                </div>

                {/* Day-by-Day Timeline */}
                <div className="itinerary-timeline-list">
                  <div className="timeline-step-row">
                    <span className="step-circle">1</span>
                    <div>
                      <h4 className="step-title">Day 1: Arrival & Riverboat Safari</h4>
                      <p className="step-desc">Check-in at waterfront lodge, orientation tea, and sunset catamaran wildlife cruise.</p>
                    </div>
                  </div>

                  <div className="timeline-step-row">
                    <span className="step-circle">2</span>
                    <div>
                      <h4 className="step-title">Day 2: Dawn Tiger Tracking & Forest Walk</h4>
                      <p className="step-desc">06:00 AM 4x4 open gypsy safari in Core Zone A followed by evening naturalist trail.</p>
                    </div>
                  </div>

                  <div className="timeline-step-row">
                    <span className="step-circle">3</span>
                    <div>
                      <h4 className="step-title">Day 3: Sunrise Birding & Departure</h4>
                      <p className="step-desc">Morning canopy birdwatching, traditional buffet breakfast, and check-out escort.</p>
                    </div>
                  </div>
                </div>

                <div className="card-footer-row mt-4">
                  <div className="price-box">
                    <span className="price-label">All-inclusive itinerary</span>
                    <span className="price-amount">₹{(pkg.price || 24000).toLocaleString()}</span>
                  </div>

                  <button
                    onClick={() => handleOpenBooking(pkg, 'Package')}
                    className="btn-primary btn-sm"
                  >
                    <span>Reserve Package</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollReveal>

      {/* 6. HOW BOOKING WORKS (4-STEP FRICTIONLESS JOURNEY) */}
      <ScrollReveal as="section" className="how-it-works-section section-padding">
        <div className="container">
          <div className="section-header">
            <span className="section-eyebrow">
              <Compass size={16} />
              <span>SEAMLESS EXPEDITION PLANNING</span>
            </span>
            <h2 className="section-title">How Your Journey Unfolds</h2>
            <p className="section-subtitle">
              From online permit reservation to gate clearance, we make jungle safari booking effortless.
            </p>
          </div>

          <div className="steps-cards-grid stagger-group">
            <div className="step-item-card">
              <span className="step-num-pill">01</span>
              <h3 className="step-card-title">Choose Experience</h3>
              <p className="step-card-desc">
                Select your preferred 4x4 gypsy safari, river cruise, luxury lodge, or tour package.
              </p>
            </div>

            <div className="step-item-card">
              <span className="step-num-pill">02</span>
              <h3 className="step-card-title">Instant E-Permit</h3>
              <p className="step-card-desc">
                Choose your schedule date, enter traveler names, and receive your confirmed E-Permit voucher.
              </p>
            </div>

            <div className="step-item-card">
              <span className="step-num-pill">03</span>
              <h3 className="step-card-title">Ranger Gate Entry</h3>
              <p className="step-card-desc">
                Present your digital or printed boarding pass at Dammanakatte Gate for seamless entry.
              </p>
            </div>

            <div className="step-item-card">
              <span className="step-num-pill">04</span>
              <h3 className="step-card-title">Untamed Safari</h3>
              <p className="step-card-desc">
                Embark into core zones guided by certified naturalists for unforgettable wildlife moments.
              </p>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* 7. TRUST & CONSERVATION PILLARS */}
      <ScrollReveal as="section" className="container section-padding">
        <div className="trust-pillars-grid stagger-group">
          <div className="trust-pillar-item">
            <div className="trust-icon-box">
              <TreePine size={24} className="text-forest-primary" />
            </div>
            <h3 className="trust-title">Ethical Wildlife Tourism</h3>
            <p className="trust-desc">
              We respect wildlife corridors and enforce quiet safari vehicle guidelines to protect natural habitats.
            </p>
          </div>

          <div className="trust-pillar-item">
            <div className="trust-icon-box">
              <Award size={24} className="text-gold-primary" />
            </div>
            <h3 className="trust-title">Certified Naturalists</h3>
            <p className="trust-desc">
              All expeditions are led by experienced naturalists trained in big cat behavior and alarm calls.
            </p>
          </div>

          <div className="trust-pillar-item">
            <div className="trust-icon-box">
              <ShieldCheck size={24} className="text-sky-blue" />
            </div>
            <h3 className="trust-title">Verified Gate Permits</h3>
            <p className="trust-desc">
              Official E-Permit generation ensuring guaranteed vehicle seats and gate admissions.
            </p>
          </div>
        </div>
      </ScrollReveal>

      {/* 8. FINAL CALL TO ADVENTURE */}
      <ScrollReveal as="section" className="container mb-5">
        <div className="final-cta-banner">
          <div className="final-cta-content text-center">
            <h2 className="final-cta-title">Ready for Your Nagarhole Expedition?</h2>
            <p className="final-cta-desc">
              Permit quotas are limited per safari track. Secure your dates and experience Kabini in its prime season.
            </p>
            <div className="final-cta-btns">
              <Link to="/safaris" className="btn-primary btn-lg bg-white text-forest-primary">
                <span>Explore Safari Permits</span>
                <ArrowRight size={18} />
              </Link>
              <Link to="/contact" className="btn-secondary border-white text-white">
                Contact Ranger Desk
              </Link>
            </div>
          </div>
        </div>
      </ScrollReveal>

      <style>{`
        /* Hero */
        .hero-section {
          position: relative;
          min-height: 82vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: url('https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=2000&q=80') center/cover no-repeat;
          padding: 6rem 0 7rem 0;
        }
        .hero-bg-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(15, 41, 30, 0.65) 0%, rgba(15, 41, 30, 0.8) 100%);
        }
        .hero-container {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3rem;
        }
        .hero-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: #a7f3d0;
          font-size: 0.82rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          background: rgba(255, 255, 255, 0.12);
          backdrop-filter: blur(8px);
          padding: 0.4rem 1rem;
          border-radius: var(--radius-full);
          margin-bottom: 1.2rem;
        }
        .hero-title {
          font-size: 3.8rem;
          font-weight: 900;
          color: #ffffff;
          line-height: 1.15;
          margin-bottom: 1.2rem;
        }
        .hero-subtitle {
          color: rgba(255, 255, 255, 0.88);
          font-size: 1.2rem;
          max-width: 680px;
          margin: 0 auto;
          line-height: 1.6;
        }
        /* Search Widget */
        .hero-search-widget {
          background: #ffffff;
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-modal);
          padding: 1.8rem;
          width: 100%;
          max-width: 980px;
        }
        .search-tabs-row {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1.4rem;
          border-bottom: 1px solid var(--border-light);
          padding-bottom: 0.85rem;
        }
        .search-tab-pill {
          padding: 0.5rem 1.35rem;
          border-radius: var(--radius-full);
          font-size: 0.92rem;
          font-weight: 600;
          color: var(--text-secondary);
          background: transparent;
        }
        .search-tab-pill:hover {
          color: var(--forest-primary);
        }
        .search-tab-pill.active {
          background-color: var(--forest-subtle);
          color: var(--forest-primary);
        }
        .search-form-grid {
          display: grid;
          grid-template-columns: 1.3fr 1.1fr 1fr auto;
          gap: 1.2rem;
          align-items: flex-end;
        }
        .search-field-box {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        .search-field-label {
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--text-muted);
          letter-spacing: 0.06em;
        }
        .search-field-input-wrap {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          border: 1px solid var(--border-light);
          border-radius: var(--radius-md);
          padding: 0.7rem 0.95rem;
          background: var(--bg-surface-subtle);
        }
        .search-select, .search-input {
          border: none;
          background: transparent;
          font-size: 0.92rem;
          color: var(--text-heading);
          width: 100%;
          font-weight: 500;
        }
        .search-submit-btn {
          height: 48px;
          white-space: nowrap;
        }
        /* Live Telemetry Ticker Strip */
        .hero-telemetry-strip {
          margin-top: 1.25rem;
          padding-top: 1.1rem;
          border-top: 1px dashed var(--border-light);
          display: flex;
          align-items: center;
          gap: 1rem;
          overflow-x: auto;
          scrollbar-width: none;
        }
        .hero-telemetry-strip::-webkit-scrollbar {
          display: none;
        }
        .telemetry-live-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          background: #ecfdf5;
          color: #065f46;
          border: 1px solid rgba(16, 185, 129, 0.3);
          padding: 0.3rem 0.75rem;
          border-radius: var(--radius-full);
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.06em;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .live-pulse-dot {
          width: 8px;
          height: 8px;
          background: #10b981;
          border-radius: 50%;
          box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
          animation: pulseGreen 1.8s infinite;
        }
        @keyframes pulseGreen {
          0% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
          }
          70% {
            transform: scale(1);
            box-shadow: 0 0 0 6px rgba(16, 185, 129, 0);
          }
          100% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
          }
        }
        .telemetry-scroll-wrapper {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          white-space: nowrap;
        }
        .telemetry-chip {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          background: var(--bg-surface-subtle);
          border: 1px solid var(--border-light);
          padding: 0.35rem 0.85rem;
          border-radius: var(--radius-full);
          font-size: 0.82rem;
          color: var(--text-secondary);
          text-decoration: none;
          transition: all 0.25s ease;
          flex-shrink: 0;
        }
        .telemetry-chip:hover {
          background: #f0fdf4;
          border-color: var(--forest-primary);
          color: var(--forest-primary);
          transform: translateY(-1px);
        }
        .telemetry-chip.highlight {
          background: #fffbeb;
          border-color: #fde68a;
          color: #92400e;
        }
        .telemetry-chip.highlight:hover {
          background: #fef3c7;
          border-color: var(--gold-primary);
        }
        .chip-emoji {
          font-size: 0.95rem;
        }

        /* Quick Sanctuary Explorer Grid */
        .quick-explorer-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.25rem;
          margin-top: 1.5rem;
        }
        .quick-exp-card {
          position: relative;
          background: #ffffff;
          border: 1px solid var(--border-light);
          border-radius: var(--radius-lg);
          padding: 1.4rem 1.2rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
        }
        .quick-exp-card:hover {
          transform: translateY(-4px);
          border-color: var(--forest-light);
          box-shadow: 0 12px 28px rgba(15, 41, 30, 0.08);
        }
        .exp-icon-circle {
          width: 46px;
          height: 46px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .exp-icon-circle.bg-forest {
          background: var(--forest-subtle);
        }
        .exp-icon-circle.bg-gold {
          background: var(--gold-subtle);
        }
        .exp-icon-circle.bg-sky {
          background: var(--sky-subtle);
        }
        .exp-badge {
          position: absolute;
          top: 1.2rem;
          right: 1.2rem;
          font-size: 0.7rem;
          font-weight: 700;
          background: var(--bg-surface-subtle);
          color: var(--forest-primary);
          border: 1px solid var(--border-light);
          padding: 0.2rem 0.55rem;
          border-radius: var(--radius-full);
          letter-spacing: 0.02em;
        }
        .exp-badge.gold {
          background: #fffbeb;
          color: #b45309;
          border-color: #fde68a;
        }
        .exp-info {
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
        }
        .exp-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--text-heading);
          line-height: 1.3;
        }
        .exp-desc {
          font-size: 0.82rem;
          color: var(--text-secondary);
          line-height: 1.45;
        }
        .exp-link {
          font-size: 0.82rem;
          font-weight: 700;
          color: var(--forest-primary);
          margin-top: 0.5rem;
          display: inline-flex;
          align-items: center;
          transition: transform 0.2s ease;
        }
        .quick-exp-card:hover .exp-link {
          transform: translateX(3px);
          color: var(--gold-dark);
        }

        /* Horizontal Shelf */
        .horizontal-shelf-section {
          background-color: var(--bg-surface-subtle);
        }
        .shelf-header-row {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 2.5rem;
        }
        .shelf-scroll-controls {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .shelf-scroll-track {
          display: flex;
          gap: 1.8rem;
          overflow-x: auto;
          padding-bottom: 1rem;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .shelf-scroll-track::-webkit-scrollbar {
          display: none;
        }
        .shelf-card-wrapper {
          min-width: 360px;
          max-width: 360px;
          flex-shrink: 0;
        }
        /* Panther Editorial Card */
        .panther-editorial-card {
          background-color: #ffffff;
          border: 1px solid var(--border-light);
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-md);
          overflow: hidden;
          display: grid;
          grid-template-columns: 1.15fr 1fr;
        }
        .panther-img-wrap {
          position: relative;
          min-height: 440px;
        }
        .panther-feature-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 15%;
        }
        .panther-content-wrap {
          padding: 3.5rem 3rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .panther-title {
          font-size: 2.6rem;
          color: var(--text-heading);
          margin-bottom: 0.3rem;
        }
        .panther-subtitle {
          font-size: 1.1rem;
          margin-bottom: 1.2rem;
        }
        .panther-desc {
          color: var(--text-secondary);
          font-size: 1rem;
          line-height: 1.7;
          margin-bottom: 1.8rem;
        }
        .panther-meta-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.2rem;
          background: var(--bg-surface-subtle);
          padding: 1.2rem 1.4rem;
          border-radius: var(--radius-md);
          margin-bottom: 1rem;
        }
        .panther-meta-item {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }
        .p-label {
          font-size: 0.72rem;
          color: var(--text-muted);
          font-weight: 700;
          letter-spacing: 0.05em;
        }
        .p-val {
          font-size: 0.88rem;
          color: var(--text-heading);
          font-weight: 600;
        }
        .panther-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        /* Packages Timeline */
        .packages-timeline-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
        }
        .package-timeline-card {
          padding: 2rem;
        }
        .package-timeline-header {
          display: flex;
          gap: 1.2rem;
          margin-bottom: 1.6rem;
        }
        .package-media-thumb-wrap {
          width: 90px;
          height: 90px;
          border-radius: var(--radius-md);
          overflow: hidden;
          flex-shrink: 0;
        }
        .package-media-thumb {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .itinerary-timeline-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          border-left: 2px solid var(--forest-subtle);
          padding-left: 1.2rem;
          margin-left: 0.8rem;
        }
        .timeline-step-row {
          position: relative;
        }
        .step-circle {
          position: absolute;
          left: -1.75rem;
          top: 0;
          width: 24px;
          height: 24px;
          background: var(--forest-primary);
          color: #ffffff;
          border-radius: 50%;
          font-size: 0.72rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .step-title {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--text-heading);
          margin-bottom: 0.2rem;
        }
        .step-desc {
          font-size: 0.85rem;
          color: var(--text-secondary);
          line-height: 1.45;
        }
        /* How It Works */
        .how-it-works-section {
          background-color: var(--bg-surface-subtle);
        }
        .steps-cards-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
        }
        .step-item-card {
          background: #ffffff;
          border: 1px solid var(--border-light);
          padding: 2rem 1.6rem;
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-sm);
        }
        .step-num-pill {
          display: inline-block;
          font-family: var(--font-heading);
          font-size: 1.3rem;
          font-weight: 800;
          color: var(--forest-primary);
          background: var(--forest-subtle);
          padding: 0.2rem 0.7rem;
          border-radius: var(--radius-sm);
          margin-bottom: 1.2rem;
        }
        .step-card-title {
          font-size: 1.15rem;
          color: var(--text-heading);
          margin-bottom: 0.5rem;
        }
        .step-card-desc {
          font-size: 0.88rem;
          color: var(--text-secondary);
          line-height: 1.55;
        }
        /* Trust Pillars */
        .trust-pillars-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
        }
        .trust-pillar-item {
          background: #ffffff;
          border: 1px solid var(--border-subtle);
          padding: 2.2rem;
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-sm);
        }
        .trust-icon-box {
          width: 52px;
          height: 52px;
          border-radius: var(--radius-md);
          background: var(--bg-surface-subtle);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.2rem;
        }
        .trust-title {
          font-size: 1.2rem;
          color: var(--text-heading);
          margin-bottom: 0.5rem;
        }
        .trust-desc {
          font-size: 0.9rem;
          color: var(--text-secondary);
          line-height: 1.6;
        }
        /* Final CTA */
        .final-cta-banner {
          background: linear-gradient(135deg, var(--forest-dark) 0%, var(--forest-primary) 100%);
          color: #ffffff;
          padding: 4.5rem 2rem;
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-lg);
        }
        .final-cta-title {
          font-size: 2.6rem;
          color: #ffffff;
          margin-bottom: 0.8rem;
        }
        .final-cta-desc {
          color: rgba(255, 255, 255, 0.85);
          font-size: 1.1rem;
          max-width: 600px;
          margin: 0 auto 2rem auto;
        }
        .final-cta-btns {
          display: flex;
          justify-content: center;
          gap: 1rem;
        }

        @media (max-width: 1024px) {
          .hero-title { font-size: 2.8rem; }
          .search-form-grid { grid-template-columns: 1fr 1fr; }
          .quick-explorer-grid { grid-template-columns: 1fr 1fr; }
          .panther-editorial-card { grid-template-columns: 1fr; }
          .panther-img-wrap { min-height: 320px; }
          .packages-timeline-grid { grid-template-columns: 1fr; }
          .steps-cards-grid { grid-template-columns: 1fr 1fr; }
          .trust-pillars-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 768px) {
          .hero-title { font-size: 2.2rem; }
          .search-form-grid { grid-template-columns: 1fr; }
          .quick-explorer-grid { grid-template-columns: 1fr; }
          .panther-content-wrap { padding: 2rem 1.4rem; }
          .panther-actions { flex-direction: column; align-items: stretch; }
          .shelf-card-wrapper { min-width: 290px; }
          .steps-cards-grid { grid-template-columns: 1fr; }
          .final-cta-btns { flex-direction: column; }
        }
      `}</style>
    </div>
  );
};

export default Home;
