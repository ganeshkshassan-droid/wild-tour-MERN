import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import BookingModal from '../components/BookingModal';
import SafariCard from '../components/SafariCard';
import StayCard from '../components/StayCard';
import PackageCard from '../components/PackageCard';
import SkeletonLoader from '../components/SkeletonLoader';
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

  // Booking Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedItemType, setSelectedItemType] = useState('Safari');

  // Horizontal Scroll Ref for Stays Shelf & Spotlight Scroll Reveal
  const staysScrollRef = useRef(null);
  const spotlightRef = useRef(null);
  const [spotlightVisible, setSpotlightVisible] = useState(false);

  useEffect(() => {
    fetchHomeData();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setSearchDate(tomorrow.toISOString().split('T')[0]);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSpotlightVisible(true);
        }
      },
      { threshold: 0.12 }
    );
    if (spotlightRef.current) {
      observer.observe(spotlightRef.current);
    }
    return () => observer.disconnect();
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
    setSelectedItem(item);
    setSelectedItemType(type);
    setModalOpen(true);
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

  const signatureSafari = safaris.length > 0 ? safaris[0] : null;

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
          </div>
        </div>
      </section>

      {/* 2. SIGNATURE SAFARI SPOTLIGHT (SLEEK COMPACT SCROLL-REVEAL CARD) */}
      {signatureSafari && (
        <section className="container section-padding pb-2">
          <div
            ref={spotlightRef}
            className={`spotlight-asymmetric-card ${spotlightVisible ? 'spotlight-scrolled-in' : ''}`}
          >
            <div className="spotlight-media-side">
              <img
                src={signatureSafari.image_url || '/images/jeep-safari-lion.jpg'}
                alt={signatureSafari.name}
                className="spotlight-media-img"
              />
              <div className="spotlight-media-overlay" />
              <span className="card-tag-pill gold-glow">FEATURED JEEP EXPEDITION</span>
            </div>

            <div className="spotlight-content-side">
              <div className="spotlight-badge-row">
                <span className="section-eyebrow mb-0">
                  <Sparkles size={14} />
                  <span>SIGNATURE JEEP SAFARI</span>
                </span>
                <span className="sighting-pill">
                  <Star size={13} className="text-gold-primary fill-gold" />
                  <span>{signatureSafari.sighting_rating || 4.95} / 5.0</span>
                </span>
              </div>

              <h2 className="spotlight-title">{signatureSafari.name}</h2>
              <p className="spotlight-desc">
                {signatureSafari.description ||
                  'High-clearance 4x4 open safari gypsies escorted by certified naturalists through Nagarhole’s legendary predator corridors.'}
              </p>

              <div className="spotlight-pills-row">
                <div className="spotlight-pill">
                  <Clock size={14} className="text-forest-primary" />
                  <span>{signatureSafari.duration || '3.5 Hours'}</span>
                </div>
                <div className="spotlight-pill">
                  <MapPin size={14} className="text-forest-primary" />
                  <span>{signatureSafari.vehicle_type || 'Custom 4x4 Open Gypsy'}</span>
                </div>
                <div className="spotlight-pill">
                  <Users size={14} className="text-forest-primary" />
                  <span>Max 6 Seats</span>
                </div>
              </div>

              <div className="spotlight-cta-row">
                <div className="price-box">
                  <span className="price-label">Tariff per seat</span>
                  <span className="price-amount text-xl font-bold">
                    ₹{(signatureSafari.price_per_seat || 1850).toLocaleString()}
                    <span className="price-sub text-xs text-muted"> + 5% Levy</span>
                  </span>
                </div>

                <button
                  onClick={() => handleOpenBooking(signatureSafari, 'Safari')}
                  className="btn-primary btn-md spotlight-book-btn"
                >
                  <span>Book Jeep Safari</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 3. HORIZONTAL DISCOVERY SHELF: WATERFRONT STAYS & LODGES */}
      <section className="horizontal-shelf-section section-padding">
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
      </section>

      {/* 4. BLACK PANTHER EDITORIAL SPOTLIGHT ("MELANISTIC LEOPARD") */}
      <section className="container section-padding">
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
      </section>

      {/* 5. ALL-INCLUSIVE SIGNATURE EXPEDITIONS (TIMELINE LAYOUT) */}
      <section className="container section-padding">
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
          <div className="packages-timeline-grid">
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
      </section>

      {/* 6. HOW BOOKING WORKS (4-STEP FRICTIONLESS JOURNEY) */}
      <section className="how-it-works-section section-padding">
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

          <div className="steps-cards-grid">
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
      </section>

      {/* 7. TRUST & CONSERVATION PILLARS */}
      <section className="container section-padding">
        <div className="trust-pillars-grid">
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
      </section>

      {/* 8. FINAL CALL TO ADVENTURE */}
      <section className="container mb-5">
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
      </section>

      {/* Booking Modal */}
      <BookingModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        item={selectedItem}
        itemType={selectedItemType}
      />

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
        /* Spotlight Asymmetric - Compact & Scroll Reveal */
        .spotlight-asymmetric-card {
          display: grid;
          grid-template-columns: 1fr 1.15fr;
          background: #ffffff;
          border: 1px solid var(--border-subtle);
          border-radius: 20px;
          box-shadow: 0 12px 36px rgba(0, 0, 0, 0.06);
          overflow: hidden;
          opacity: 0;
          transform: translateY(35px) scale(0.98);
          transition: opacity 0.75s cubic-bezier(0.16, 1, 0.3, 1), transform 0.75s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease;
          max-height: 380px;
        }
        .spotlight-asymmetric-card.spotlight-scrolled-in {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
        .spotlight-asymmetric-card:hover {
          box-shadow: 0 20px 48px rgba(15, 41, 30, 0.12);
        }
        .spotlight-media-side {
          position: relative;
          height: 100%;
          min-height: 320px;
          overflow: hidden;
        }
        .spotlight-media-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .spotlight-asymmetric-card:hover .spotlight-media-img {
          transform: scale(1.06);
        }
        .spotlight-media-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.5) 100%);
          pointer-events: none;
        }
        .card-tag-pill.gold-glow {
          position: absolute;
          top: 1rem;
          left: 1rem;
          background: rgba(15, 41, 30, 0.85);
          color: #fef08a;
          border: 1px solid rgba(250, 204, 21, 0.4);
          backdrop-filter: blur(8px);
          font-size: 0.72rem;
          font-weight: 700;
          padding: 0.35rem 0.85rem;
          border-radius: 999px;
          letter-spacing: 0.06em;
          box-shadow: 0 4px 14px rgba(0,0,0,0.25);
        }
        .spotlight-content-side {
          padding: 2rem 2.2rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          background: #ffffff;
        }
        .spotlight-badge-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.4rem;
        }
        .sighting-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          background: #fef9c3;
          color: #854d0e;
          font-size: 0.78rem;
          font-weight: 700;
          padding: 0.25rem 0.65rem;
          border-radius: 999px;
          border: 1px solid rgba(234, 179, 8, 0.3);
        }
        .spotlight-title {
          font-size: 1.65rem;
          font-weight: 800;
          color: var(--text-heading);
          line-height: 1.25;
          margin-bottom: 0.4rem;
        }
        .spotlight-desc {
          color: var(--text-secondary);
          font-size: 0.92rem;
          line-height: 1.5;
          margin-bottom: 1rem;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .spotlight-pills-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0.6rem;
          margin-bottom: 1.2rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--border-light);
        }
        .spotlight-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: var(--bg-surface-subtle);
          border: 1px solid var(--border-light);
          padding: 0.35rem 0.75rem;
          border-radius: 8px;
          font-size: 0.82rem;
          font-weight: 600;
          color: var(--text-secondary);
        }
        .spotlight-cta-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }
        .spotlight-book-btn {
          height: 42px;
          padding: 0 1.35rem;
          font-size: 0.92rem;
        }
        @media (max-width: 900px) {
          .spotlight-asymmetric-card {
            grid-template-columns: 1fr;
            max-height: none;
          }
          .spotlight-media-side {
            min-height: 240px;
          }
          .spotlight-content-side {
            padding: 1.5rem;
          }
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
          object-position: center 25%;
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
          .spotlight-asymmetric-card { grid-template-columns: 1fr; }
          .panther-editorial-card { grid-template-columns: 1fr; }
          .panther-img-wrap { min-height: 320px; }
          .packages-timeline-grid { grid-template-columns: 1fr; }
          .steps-cards-grid { grid-template-columns: 1fr 1fr; }
          .trust-pillars-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 768px) {
          .hero-title { font-size: 2.2rem; }
          .search-form-grid { grid-template-columns: 1fr; }
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
