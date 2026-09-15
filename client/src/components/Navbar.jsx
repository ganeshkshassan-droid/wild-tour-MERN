import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import {
  Compass,
  Home,
  TreePine,
  ShieldAlert,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  Ticket,
  ChevronDown,
  Camera,
  Layers,
  Award,
  Info,
  PhoneCall,
  Sparkles,
  Heart
} from 'lucide-react';

const Navbar = () => {
  const { user, isAdmin, logout, quickDemoLogin } = useAuth();
  const { wishlistCount } = useWishlist();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [exploreDropdownOpen, setExploreDropdownOpen] = useState(false);
  const [desktopRevealed, setDesktopRevealed] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const exploreRef = useRef(null);
  const userRef = useRef(null);
  const hideTimerRef = useRef(null);

  // Primary Navigation
  const primaryLinks = [
    { name: 'Home', path: '/' },
    { name: 'Safaris', path: '/safaris' },
    { name: 'Resorts & Stays', path: '/stays' },
    { name: 'Tour Packages', path: '/packages' },
  ];

  // Secondary Links under Explore dropdown
  const secondaryLinks = [
    { name: 'Wildlife Sighting Radar', path: '/wildlife', icon: TreePine, desc: 'Species guide and tracking hotspot map' },
    { name: 'Certified Naturalists', path: '/guides', icon: Award, desc: 'Meet our experienced forest guides' },
    { name: 'Photography Masterclass', path: '/photography', icon: Camera, desc: 'Focal lengths & field camera settings' },
    { name: 'About Conservation', path: '/about', icon: Info, desc: 'Our mission and ecological values' },
    { name: 'Ranger Help Desk', path: '/contact', icon: PhoneCall, desc: 'Direct gate office contacts & FAQ' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Top screen hover listener for desktop
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (window.innerWidth > 900) {
        if (e.clientY <= 25) {
          if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
          setDesktopRevealed(true);
        }
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Close dropdowns on route change
  useEffect(() => {
    setUserDropdownOpen(false);
    setExploreDropdownOpen(false);
    setMobileMenuOpen(false);
    setDesktopRevealed(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (exploreRef.current && !exploreRef.current.contains(e.target)) {
        setExploreDropdownOpen(false);
      }
      if (userRef.current && !userRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMouseEnter = () => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    setDesktopRevealed(true);
  };

  const handleMouseLeave = () => {
    hideTimerRef.current = setTimeout(() => {
      if (!userDropdownOpen && !exploreDropdownOpen) {
        setDesktopRevealed(false);
      }
    }, 450);
  };

  const handleQuickDemo = async (role) => {
    await quickDemoLogin(role);
    setUserDropdownOpen(false);
    if (role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/my-trips');
    }
  };

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const isDropdownActive = userDropdownOpen || exploreDropdownOpen;

  return (
    <>
      {/* Invisible top edge trigger strip for desktop */}
      <div
        className="navbar-top-hover-sensor"
        onMouseEnter={handleMouseEnter}
        aria-hidden="true"
      />

      <header
        className={`navbar-header ${scrolled ? 'navbar-scrolled' : ''} ${
          desktopRevealed || isDropdownActive ? 'desktop-revealed' : ''
        }`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="container navbar-inner">
          {/* Brand Logo */}
          <Link to="/" className="navbar-brand" title="Wild Tour Home" aria-label="Wild Tour Home">
            <div className="brand-icon-box">
              <Compass className="text-forest-primary" size={22} />
            </div>
            <div className="brand-text">
              <span className="brand-title">WILD<span className="brand-highlight">TOUR</span></span>
              <span className="brand-subtitle">KABINI & NAGARHOLE</span>
            </div>
          </Link>

          {/* Desktop Primary Navigation */}
          <nav className="nav-links-desktop" aria-label="Main Navigation">
            {primaryLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`nav-link-item ${isActive(link.path) ? 'active' : ''}`}
              >
                {link.name}
              </Link>
            ))}

            {/* Explore Dropdown */}
            <div className="dropdown-wrapper" ref={exploreRef}>
              <button
                type="button"
                className={`nav-link-item explore-trigger ${exploreDropdownOpen ? 'active' : ''}`}
                onClick={() => setExploreDropdownOpen(!exploreDropdownOpen)}
                aria-expanded={exploreDropdownOpen}
              >
                <span>Explore</span>
                <ChevronDown size={14} className={`dropdown-chevron ${exploreDropdownOpen ? 'rotated' : ''}`} />
              </button>

              {exploreDropdownOpen && (
                <div className="explore-menu-dropdown animate-fade-in">
                  <div className="explore-grid">
                    {secondaryLinks.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          className="explore-item-row"
                          onClick={() => setExploreDropdownOpen(false)}
                        >
                          <div className="explore-icon-box">
                            <Icon size={18} />
                          </div>
                          <div>
                            <p className="explore-item-title">{item.name}</p>
                            <p className="explore-item-desc">{item.desc}</p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* Navbar Right Actions */}
          <div className="navbar-actions">
            {user ? (
              <div className="user-dropdown-wrapper" ref={userRef}>
                <Link to="/saved" className="saved-quick-btn" title="View saved experiences">
                  <Heart size={15} fill={wishlistCount > 0 ? '#ef4444' : 'none'} className={wishlistCount > 0 ? 'text-danger' : ''} />
                  <span>Saved</span>
                  {wishlistCount > 0 && <span className="saved-badge font-mono">{wishlistCount}</span>}
                </Link>

                <Link to="/my-trips" className="my-trips-quick-btn" title="View confirmed permits">
                  <Ticket size={16} />
                  <span>My Trips</span>
                </Link>

                <button
                  className="user-profile-btn"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  aria-expanded={userDropdownOpen}
                >
                  <img
                    src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                    alt={user.name}
                    className="user-avatar-img"
                  />
                  <span className="user-name-text">{user.name.split(' ')[0]}</span>
                  {isAdmin && <span className="admin-chip">ADMIN</span>}
                  <ChevronDown size={14} className="text-secondary" />
                </button>

                {userDropdownOpen && (
                  <div className="user-menu-dropdown animate-fade-in">
                    <div className="dropdown-user-header">
                      <p className="dropdown-user-name">{user.name}</p>
                      <p className="dropdown-user-email">{user.email}</p>
                    </div>

                    <div className="dropdown-divider" />

                    <Link to="/" className="dropdown-link" onClick={() => setUserDropdownOpen(false)}>
                      <Home size={16} />
                      <span>Wild Tour Home</span>
                    </Link>

                    {isAdmin && (
                      <>
                        <Link to="/admin" className="dropdown-link admin-highlight" onClick={() => setUserDropdownOpen(false)}>
                          <ShieldAlert size={16} />
                          <span>Admin Dashboard</span>
                        </Link>
                        <Link to="/admin/trips" className="dropdown-link" onClick={() => setUserDropdownOpen(false)}>
                          <Layers size={16} />
                          <span>Manage Bookings</span>
                        </Link>
                      </>
                    )}

                    <Link to="/my-trips" className="dropdown-link" onClick={() => setUserDropdownOpen(false)}>
                      <Ticket size={16} />
                      <span>My Bookings & Passes</span>
                    </Link>

                    <Link to="/saved" className="dropdown-link" onClick={() => setUserDropdownOpen(false)}>
                      <Heart size={16} fill={wishlistCount > 0 ? '#ef4444' : 'none'} className={wishlistCount > 0 ? 'text-danger' : ''} />
                      <span>Saved Experiences</span>
                      {wishlistCount > 0 && <span className="saved-badge-pill font-mono">{wishlistCount}</span>}
                    </Link>

                    <Link to="/profile" className="dropdown-link" onClick={() => setUserDropdownOpen(false)}>
                      <UserIcon size={16} />
                      <span>Account Settings</span>
                    </Link>

                    <div className="dropdown-divider" />

                    {/* Discreet Demo Switcher */}
                    <div className="dropdown-demo-section">
                      <span className="demo-section-label">Demo Quick Logins</span>
                      <div className="demo-pills-row">
                        <button
                          type="button"
                          onClick={() => handleQuickDemo('admin')}
                          className="demo-pill admin"
                        >
                          Admin
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickDemo('user')}
                          className="demo-pill traveler"
                        >
                          Traveler
                        </button>
                      </div>
                    </div>

                    <div className="dropdown-divider" />

                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                      }}
                      className="dropdown-link text-danger"
                    >
                      <LogOut size={16} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="auth-btn-group">
                <Link to="/login" className="btn-ghost btn-sm">
                  Sign In
                </Link>
                <Link to="/safaris" className="btn-primary btn-sm">
                  Book Safari
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              className="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Peek indicator tab for desktop */}
        <div className="navbar-top-peek-tab" onClick={handleMouseEnter}>
          <span>MENU &bull; EXPLORE</span>
        </div>

        {/* Mobile Drawer Menu */}
        {mobileMenuOpen && (
          <div className="mobile-drawer-backdrop" onClick={() => setMobileMenuOpen(false)}>
            <div className="mobile-drawer-content animate-slide-in" onClick={(e) => e.stopPropagation()}>
              <div className="mobile-drawer-header">
                <Link to="/" className="brand-text" onClick={() => setMobileMenuOpen(false)} title="Wild Tour Home">
                  <span className="brand-title">WILD<span className="brand-highlight">TOUR</span></span>
                  <span className="brand-subtitle">KABINI & NAGARHOLE</span>
                </Link>
                <button
                  className="modal-close-btn"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close menu"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mobile-nav-list">
                <span className="mobile-section-label">Main Navigation</span>
                {primaryLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`mobile-nav-row ${isActive(link.path) ? 'active' : ''}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.path === '/' && <Home size={18} className="text-forest-primary" />}
                    <span>{link.name}</span>
                  </Link>
                ))}

                <div className="dropdown-divider" />

                <span className="mobile-section-label">Explore Sanctuary</span>
                {secondaryLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`mobile-nav-row ${isActive(link.path) ? 'active' : ''}`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Icon size={18} className="text-forest-primary" />
                      <span>{link.name}</span>
                    </Link>
                  );
                })}

                <div className="dropdown-divider" />

                {user ? (
                  <>
                    <span className="mobile-section-label">Traveler Account</span>
                    <Link
                      to="/"
                      className="mobile-nav-row"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Home size={18} className="text-forest-primary" />
                      <span>Return to Home</span>
                    </Link>
                    <Link
                      to="/my-trips"
                      className="mobile-nav-row"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Ticket size={18} className="text-forest-primary" />
                      <span>My Bookings & Permits</span>
                    </Link>
                    <Link
                      to="/saved"
                      className="mobile-nav-row"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Heart size={18} fill={wishlistCount > 0 ? '#ef4444' : 'none'} className={wishlistCount > 0 ? 'text-danger' : 'text-forest-primary'} />
                      <span>Saved Experiences</span>
                      {wishlistCount > 0 && <span className="saved-badge font-mono">{wishlistCount}</span>}
                    </Link>
                    <Link
                      to="/profile"
                      className="mobile-nav-row"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <UserIcon size={18} className="text-forest-primary" />
                      <span>Account Profile</span>
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="mobile-nav-row text-gold font-bold"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <ShieldAlert size={18} />
                        <span>Admin Dashboard</span>
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                      className="mobile-nav-row text-danger mt-2"
                    >
                      <LogOut size={18} />
                      <span>Sign Out</span>
                    </button>
                  </>
                ) : (
                  <div className="mobile-auth-btns mt-3">
                    <Link
                      to="/login"
                      className="btn-secondary w-full text-center"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/safaris"
                      className="btn-primary w-full text-center mt-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Book Safari
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      <style>{`
        .navbar-top-hover-sensor {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 18px;
          z-index: 1001;
          pointer-events: auto;
        }

        .navbar-header {
          position: sticky;
          top: 0;
          z-index: 100;
          background-color: rgba(255, 255, 255, 0.96);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid var(--border-light);
          transition: transform 0.32s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.32s ease, background-color 0.32s ease;
        }

        .navbar-scrolled {
          box-shadow: 0 4px 20px rgba(15, 41, 30, 0.08);
          background-color: #ffffff;
        }

        .navbar-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 70px;
        }

        .navbar-top-peek-tab {
          display: none;
        }

        /* Desktop Auto-Hide / Reveal when cursor approaches top */
        @media (min-width: 901px) {
          .navbar-header {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 1000;
            transform: translateY(-90%);
            opacity: 0.9;
          }

          .navbar-header:hover,
          .navbar-header:focus-within,
          .navbar-header.desktop-revealed {
            transform: translateY(0);
            opacity: 1;
            box-shadow: 0 10px 30px rgba(15, 41, 30, 0.12);
          }

          .navbar-top-peek-tab {
            display: block;
            position: absolute;
            bottom: -16px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(27, 67, 50, 0.88);
            color: #ffffff;
            font-size: 0.62rem;
            font-weight: 800;
            letter-spacing: 0.08em;
            padding: 2px 14px;
            border-radius: 0 0 10px 10px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
            cursor: pointer;
            transition: opacity 0.2s ease;
          }

          .navbar-header:hover .navbar-top-peek-tab,
          .navbar-header:focus-within .navbar-top-peek-tab,
          .navbar-header.desktop-revealed .navbar-top-peek-tab {
            opacity: 0;
            pointer-events: none;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .navbar-header {
            transition: none !important;
          }
        }

        /* Brand */
        .navbar-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          text-decoration: none;
        }

        .brand-icon-box {
          width: 38px;
          height: 38px;
          border-radius: var(--radius-sm);
          background-color: var(--forest-subtle);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform var(--transition-fast);
        }

        .navbar-brand:hover .brand-icon-box {
          transform: rotate(15deg);
        }

        .brand-text {
          display: flex;
          flex-direction: column;
        }

        .brand-title {
          font-family: var(--font-heading);
          font-weight: 900;
          font-size: 1.25rem;
          letter-spacing: 0.06em;
          color: var(--forest-dark);
          line-height: 1.1;
        }

        .brand-highlight {
          color: var(--gold-primary);
        }

        .brand-subtitle {
          font-size: 0.62rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          color: var(--text-muted);
          text-transform: uppercase;
        }

        /* Desktop Links */
        .nav-links-desktop {
          display: flex;
          align-items: center;
          gap: 1.6rem;
        }

        .nav-link-item {
          color: var(--text-secondary);
          font-weight: 600;
          font-size: 0.92rem;
          padding: 0.5rem 0.2rem;
          position: relative;
          transition: color var(--transition-fast);
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          background: transparent;
          border: none;
          cursor: pointer;
        }

        .nav-link-item:hover, .nav-link-item.active {
          color: var(--forest-primary);
        }

        .nav-link-item.active::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 2px;
          background-color: var(--forest-primary);
          border-radius: var(--radius-full);
        }

        .explore-trigger {
          font-family: inherit;
        }

        .dropdown-chevron {
          transition: transform var(--transition-fast);
        }

        .dropdown-chevron.rotated {
          transform: rotate(180deg);
        }

        .dropdown-wrapper {
          position: relative;
        }

        .explore-menu-dropdown {
          position: absolute;
          top: calc(100% + 12px);
          left: -40px;
          width: 340px;
          background: #ffffff;
          border: 1px solid var(--border-light);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-lg);
          padding: 0.8rem;
          z-index: 110;
        }

        .explore-grid {
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
        }

        .explore-item-row {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          padding: 0.65rem 0.75rem;
          border-radius: var(--radius-sm);
          transition: background-color var(--transition-fast);
        }

        .explore-item-row:hover {
          background-color: var(--forest-subtle);
        }

        .explore-icon-box {
          width: 34px;
          height: 34px;
          border-radius: var(--radius-xs);
          background: var(--bg-surface-subtle);
          color: var(--forest-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .explore-item-title {
          font-size: 0.88rem;
          font-weight: 700;
          color: var(--text-heading);
          margin-bottom: 2px;
        }

        .explore-item-desc {
          font-size: 0.72rem;
          color: var(--text-muted);
          line-height: 1.25;
        }

        /* Navbar Actions */
        .navbar-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .auth-btn-group {
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }

        .saved-quick-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          color: #991b1b;
          background: #fef2f2;
          padding: 0.45rem 0.85rem;
          border-radius: var(--radius-full);
          font-size: 0.82rem;
          font-weight: 700;
          border: 1px solid rgba(239, 68, 68, 0.2);
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .saved-quick-btn:hover {
          background: #fee2e2;
          transform: translateY(-1px);
        }

        .saved-badge {
          background: #ef4444;
          color: #ffffff;
          font-size: 0.7rem;
          padding: 1px 6px;
          border-radius: 10px;
          line-height: 1.2;
        }

        .saved-badge-pill {
          background: #fef2f2;
          color: #ef4444;
          font-size: 0.72rem;
          font-weight: 800;
          padding: 1px 7px;
          border-radius: 10px;
          margin-left: auto;
          border: 1px solid #fee2e2;
        }

        .my-trips-quick-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          color: var(--forest-primary);
          background: var(--forest-subtle);
          padding: 0.45rem 0.85rem;
          border-radius: var(--radius-full);
          font-size: 0.82rem;
          font-weight: 700;
          border: 1px solid rgba(27, 67, 50, 0.12);
        }

        .my-trips-quick-btn:hover {
          background: #e2f2e9;
        }

        .user-dropdown-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          gap: 0.8rem;
        }

        .user-profile-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--bg-surface-subtle);
          border: 1px solid var(--border-light);
          padding: 0.35rem 0.7rem 0.35rem 0.35rem;
          border-radius: var(--radius-full);
          cursor: pointer;
        }

        .user-avatar-img {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          object-fit: cover;
        }

        .user-name-text {
          font-size: 0.86rem;
          font-weight: 700;
          color: var(--text-heading);
        }

        .admin-chip {
          background-color: var(--gold-subtle);
          color: var(--gold-primary);
          font-size: 0.65rem;
          font-weight: 800;
          padding: 0.1rem 0.4rem;
          border-radius: 4px;
          letter-spacing: 0.05em;
        }

        .user-menu-dropdown {
          position: absolute;
          top: calc(100% + 10px);
          right: 0;
          width: 250px;
          background: #ffffff;
          border: 1px solid var(--border-light);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-lg);
          padding: 0.8rem;
          z-index: 110;
        }

        .dropdown-user-header {
          padding: 0.4rem 0.6rem;
        }

        .dropdown-user-name {
          font-weight: 700;
          color: var(--text-heading);
          font-size: 0.92rem;
        }

        .dropdown-user-email {
          font-size: 0.76rem;
          color: var(--text-muted);
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .dropdown-divider {
          height: 1px;
          background: var(--border-light);
          margin: 0.5rem 0;
        }

        .dropdown-link {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          padding: 0.55rem 0.65rem;
          border-radius: var(--radius-xs);
          font-size: 0.86rem;
          font-weight: 600;
          color: var(--text-secondary);
          transition: all var(--transition-fast);
          width: 100%;
          background: transparent;
          border: none;
          text-align: left;
          cursor: pointer;
        }

        .dropdown-link:hover {
          background-color: var(--forest-subtle);
          color: var(--forest-primary);
        }

        .dropdown-link.admin-highlight {
          color: var(--gold-primary);
        }

        .dropdown-demo-section {
          padding: 0.4rem 0.6rem;
        }

        .demo-section-label {
          font-size: 0.7rem;
          font-weight: 800;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          display: block;
          margin-bottom: 0.4rem;
        }

        .demo-pills-row {
          display: flex;
          gap: 0.4rem;
        }

        .demo-pill {
          flex: 1;
          padding: 0.35rem;
          font-size: 0.75rem;
          font-weight: 700;
          border-radius: var(--radius-xs);
          border: 1px solid var(--border-light);
          background: var(--bg-surface-subtle);
          cursor: pointer;
        }

        .demo-pill.admin { color: var(--gold-primary); background: var(--gold-subtle); }
        .demo-pill.traveler { color: var(--forest-primary); background: var(--forest-subtle); }

        /* Mobile Menu */
        .mobile-menu-toggle {
          display: none;
          background: transparent;
          border: none;
          color: var(--forest-primary);
          padding: 0.3rem;
          cursor: pointer;
        }

        .mobile-drawer-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(15, 41, 30, 0.4);
          backdrop-filter: blur(4px);
          z-index: 200;
          display: flex;
          justify-content: flex-end;
        }

        .mobile-drawer-content {
          width: 82%;
          max-width: 320px;
          height: 100%;
          background: #ffffff;
          padding: 1.5rem;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }

        .mobile-drawer-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid var(--border-light);
          padding-bottom: 1rem;
          margin-bottom: 1.2rem;
        }

        .mobile-nav-list {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .mobile-section-label {
          font-size: 0.72rem;
          font-weight: 800;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.06em;
          padding: 0.4rem 0.6rem;
        }

        .mobile-nav-row {
          display: flex;
          align-items: center;
          gap: 0.8rem;
          padding: 0.75rem 0.85rem;
          border-radius: var(--radius-sm);
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--text-heading);
          background: transparent;
          border: none;
          text-align: left;
        }

        .mobile-nav-row:hover, .mobile-nav-row.active {
          background-color: var(--forest-subtle);
          color: var(--forest-primary);
        }

        @media (max-width: 900px) {
          .nav-links-desktop { display: none; }
          .mobile-menu-toggle { display: block; }
          .my-trips-quick-btn { display: none; }
        }
      `}</style>
    </>
  );
};

export default Navbar;
