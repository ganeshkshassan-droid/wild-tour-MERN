import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import BookingPassModal from '../components/BookingPassModal';
import ConfirmModal from '../components/ConfirmModal';
import SkeletonLoader from '../components/SkeletonLoader';
import {
  Ticket,
  Calendar,
  Users,
  MapPin,
  Printer,
  Ban,
  ArrowRight,
  Compass,
  CheckCircle2,
  Clock,
  X,
  Search,
  SlidersHorizontal,
  Home,
  ChevronRight,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  CreditCard,
  Eye,
  RefreshCw
} from 'lucide-react';

const MyTrips = () => {
  const { user, quickDemoLogin } = useAuth();
  const { showToast } = useToast();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters & Sorting
  const [filterStatus, setFilterStatus] = useState('All'); // 'All' | 'Confirmed' | 'Completed' | 'Cancelled'
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('upcoming'); // 'upcoming' | 'newest' | 'oldest' | 'price-high' | 'price-low'

  // Boarding Pass Modal
  const [passModalOpen, setPassModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  // Cancellation Confirm Modal
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  // Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [bookingToReview, setBookingToReview] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (user) {
      fetchMyBookings();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchMyBookings = async () => {
    setLoading(true);
    setRefreshing(true);
    try {
      const res = await api.getMyBookings();
      if (res && res.success) {
        setBookings(res.data || []);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      showToast('Unable to load your bookings', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const confirmCancelAction = async () => {
    if (!bookingToCancel) return;
    setCancelling(true);
    try {
      const id = bookingToCancel._id || bookingToCancel.id;
      const res = await api.cancelBooking(id, 'Traveler requested cancellation');
      if (res && res.success) {
        showToast(res.message || 'Booking cancelled successfully. Reserved slot capacity released.', 'success');
        setCancelModalOpen(false);

        // Update local state immediately
        setBookings((prev) =>
          prev.map((b) =>
            (b._id || b.id) === id
              ? {
                  ...b,
                  status: 'Cancelled',
                  refund_status: res.data?.refund_status || 'Pending Manual Processing',
                }
              : b
          )
        );
      }
    } catch (error) {
      showToast(extractErrorMessage(error) || 'Failed to cancel booking', 'error');
    } finally {
      setCancelling(false);
    }
  };

  const handleOpenReviewModal = (booking) => {
    setBookingToReview(booking);
    setReviewRating(5);
    setReviewComment('');
    setReviewModalOpen(true);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!bookingToReview || !reviewComment.trim()) {
      showToast('Please write a brief summary of your wildlife experience', 'warning');
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await api.createReview({
        booking_id: bookingToReview._id || bookingToReview.id,
        item_id: bookingToReview.item_id || bookingToReview.item?._id,
        item_type: bookingToReview.item_type,
        rating: Number(reviewRating),
        comment: reviewComment.trim(),
      });

      if (res.success) {
        showToast('Verified review submitted successfully! Thank you.', 'success');
        setReviewModalOpen(false);
      }
    } catch (error) {
      showToast(extractErrorMessage(error), 'error');
    } finally {
      setSubmittingReview(false);
    }
  };


  const handleOpenCancelModal = (booking) => {
    setBookingToCancel(booking);
    setCancelModalOpen(true);
  };

  const handleViewPass = (booking) => {
    setSelectedBooking(booking);
    setPassModalOpen(true);
  };

  // Summary Metrics Calculation
  const summaryCounts = useMemo(() => {
    const total = bookings.length;
    const upcoming = bookings.filter((b) => b.status === 'Confirmed' || b.status === 'Booked').length;
    const completed = bookings.filter((b) => b.status === 'Completed').length;
    const cancelled = bookings.filter((b) => b.status === 'Cancelled').length;
    return { total, upcoming, completed, cancelled };
  }, [bookings]);

  // Filtered and Sorted Bookings List
  const filteredBookings = useMemo(() => {
    return bookings
      .filter((b) => {
        // Status filter
        if (filterStatus !== 'All') {
          if (filterStatus === 'Confirmed' || filterStatus === 'Upcoming') {
            if (b.status !== 'Confirmed' && b.status !== 'Booked') return false;
          } else if (b.status?.toLowerCase() !== filterStatus.toLowerCase()) {
            return false;
          }
        }

        // Search query
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          const name = (b.item_name || '').toLowerCase();
          const ticket = (b.ticket_number || '').toLowerCase();
          const tourist = (b.tourist_name || '').toLowerCase();
          const type = (b.item_type || '').toLowerCase();
          if (!name.includes(q) && !ticket.includes(q) && !tourist.includes(q) && !type.includes(q)) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'upcoming') {
          // Put Confirmed/Booked first, then by earliest trip date
          if (a.status === 'Confirmed' && b.status !== 'Confirmed') return -1;
          if (b.status === 'Confirmed' && a.status !== 'Confirmed') return 1;
          return new Date(a.booking_date || a.from_date || a.createdAt) - new Date(b.booking_date || b.from_date || b.createdAt);
        }
        if (sortBy === 'newest') return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        if (sortBy === 'oldest') return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        if (sortBy === 'price-high') return (b.total_price || 0) - (a.total_price || 0);
        if (sortBy === 'price-low') return (a.total_price || 0) - (b.total_price || 0);
        return 0;
      });
  }, [bookings, filterStatus, searchQuery, sortBy]);

  // Auth Guard Screen for unauthenticated visitors
  if (!user) {
    return (
      <div className="trips-unauth-container">
        <div className="trips-unauth-card">
          <div className="unauth-icon-box">
            <Ticket size={36} className="text-forest-primary" />
          </div>
          <h2 className="unauth-title">Sign In to Access Your Trips & Passes</h2>
          <p className="unauth-desc">
            Access your confirmed safari boarding passes, download official printable e-permits, and manage upcoming wildlife reservations.
          </p>
          <div className="unauth-actions">
            <Link to="/login" className="action-btn primary">
              Sign In to Wild Tour
            </Link>
            <button
              onClick={() => quickDemoLogin('user')}
              className="action-btn secondary"
            >
              1-Click Demo Traveler
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-trips-root">
      <div className="my-trips-container">

        {/* ==================================================== */}
        {/* 1. HEADER & BREADCRUMB NAVIGATION                    */}
        {/* ==================================================== */}
        <header className="trips-header-bar">
          <div className="trips-header-left">
            <div className="trips-breadcrumbs">
              <Link to="/" className="breadcrumb-link">
                <Home size={13} />
                <span>Home</span>
              </Link>
              <span className="breadcrumb-sep">/</span>
              <span className="breadcrumb-current">My Trips</span>
            </div>

            <div className="trips-eyebrow-row">
              <span className="trips-eyebrow-pill">
                <ShieldCheck size={13} className="text-forest-primary" />
                <span>SANCTUARY PERMIT PASSPORT</span>
              </span>
            </div>

            <h1 className="trips-main-title">My Trips & Safari Passes</h1>
            <p className="trips-main-subtitle">
              Manage your confirmed jungle permits, view upcoming itineraries, and access printable boarding passes.
            </p>
          </div>

          <div className="trips-header-actions">
            <button
              onClick={fetchMyBookings}
              disabled={refreshing}
              className="action-btn secondary"
              title="Refresh your trips"
            >
              <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
              <span>{refreshing ? 'Syncing...' : 'Sync Passes'}</span>
            </button>

            <Link to="/safaris" className="action-btn primary">
              <Compass size={15} />
              <span>Book New Adventure</span>
            </Link>
          </div>
        </header>

        {/* ==================================================== */}
        {/* 2. COMPACT SUMMARY CARDS                             */}
        {/* ==================================================== */}
        <section className="trips-summary-section mb-4">
          <div className="summary-cards-grid">
            
            {/* 1. Total Trips */}
            <div
              className={`summary-card ${filterStatus === 'All' ? 'active-summary' : ''}`}
              onClick={() => setFilterStatus('All')}
            >
              <div className="summary-card-inner">
                <div className="summary-info">
                  <span className="summary-label">Total Expeditions</span>
                  <div className="summary-value font-mono">{summaryCounts.total}</div>
                </div>
                <div className="summary-icon-box slate">
                  <Ticket size={20} />
                </div>
              </div>
            </div>

            {/* 2. Upcoming / Confirmed */}
            <div
              className={`summary-card ${filterStatus === 'Confirmed' ? 'active-summary' : ''}`}
              onClick={() => setFilterStatus('Confirmed')}
            >
              <div className="summary-card-inner">
                <div className="summary-info">
                  <span className="summary-label">Upcoming / Confirmed</span>
                  <div className="summary-value font-mono text-forest-primary">{summaryCounts.upcoming}</div>
                </div>
                <div className="summary-icon-box emerald">
                  <CheckCircle2 size={20} />
                </div>
              </div>
            </div>

            {/* 3. Completed */}
            <div
              className={`summary-card ${filterStatus === 'Completed' ? 'active-summary' : ''}`}
              onClick={() => setFilterStatus('Completed')}
            >
              <div className="summary-card-inner">
                <div className="summary-info">
                  <span className="summary-label">Completed</span>
                  <div className="summary-value font-mono text-sky-blue">{summaryCounts.completed}</div>
                </div>
                <div className="summary-icon-box sky">
                  <Clock size={20} />
                </div>
              </div>
            </div>

            {/* 4. Cancelled */}
            <div
              className={`summary-card ${filterStatus === 'Cancelled' ? 'active-summary' : ''}`}
              onClick={() => setFilterStatus('Cancelled')}
            >
              <div className="summary-card-inner">
                <div className="summary-info">
                  <span className="summary-label">Cancelled / Refunded</span>
                  <div className="summary-value font-mono text-danger">{summaryCounts.cancelled}</div>
                </div>
                <div className="summary-icon-box rose">
                  <X size={20} />
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ==================================================== */}
        {/* 3. HORIZONTAL FILTER TABS & SEARCH/SORT TOOLBAR       */}
        {/* ==================================================== */}
        <section className="trips-controls-section mb-4">
          <div className="trips-controls-card">
            
            {/* Left: Horizontal Filter Tabs */}
            <div className="horizontal-tabs-container">
              {[
                { key: 'All', label: 'All Trips', count: summaryCounts.total },
                { key: 'Confirmed', label: 'Upcoming', count: summaryCounts.upcoming },
                { key: 'Completed', label: 'Completed', count: summaryCounts.completed },
                { key: 'Cancelled', label: 'Cancelled', count: summaryCounts.cancelled },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilterStatus(tab.key)}
                  className={`tab-btn ${filterStatus === tab.key ? 'active' : ''}`}
                >
                  <span>{tab.label}</span>
                  <span className="tab-count font-mono">{tab.count}</span>
                </button>
              ))}
            </div>

            {/* Right: Search & Sort Bar */}
            <div className="controls-right-group">
              {/* Search Box */}
              <div className="trip-search-box">
                <Search size={15} className="trip-search-icon" />
                <input
                  type="text"
                  placeholder="Search trips, permits..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="trip-search-input"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="trip-clear-search">
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* Sort Dropdown */}
              <div className="trip-sort-box">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="trip-sort-select"
                >
                  <option value="upcoming">Sort: Upcoming First</option>
                  <option value="newest">Sort: Newest Booking</option>
                  <option value="oldest">Sort: Oldest Booking</option>
                  <option value="price-high">Sort: Price High to Low</option>
                  <option value="price-low">Sort: Price Low to High</option>
                </select>
              </div>
            </div>

          </div>
        </section>

        {/* ==================================================== */}
        {/* 4. REDESIGNED BOOKINGS LIST                          */}
        {/* ==================================================== */}
        <section className="trips-list-section mb-6">
          {loading ? (
            <div className="trips-skeleton-list">
              {[1, 2, 3].map((i) => (
                <div key={i} className="trip-skeleton-card">
                  <div className="skeleton-line shimmer h-6 w-32 mb-3" />
                  <div className="skeleton-line shimmer h-8 w-64 mb-4" />
                  <div className="skeleton-grid-placeholder shimmer mb-4" />
                  <div className="skeleton-line shimmer h-10 w-48 ml-auto" />
                </div>
              ))}
            </div>
          ) : filteredBookings.length === 0 ? (
            /* Empty State */
            <div className="trips-empty-card">
              <div className="empty-icon-wrap">
                <Compass size={40} className="text-forest-primary" />
              </div>
              <h3 className="empty-title">
                {filterStatus === 'All'
                  ? 'No Wildlife Expeditions Found'
                  : filterStatus === 'Confirmed'
                  ? 'No Upcoming Adventures Scheduled'
                  : filterStatus === 'Completed'
                  ? 'No Completed Expeditions Yet'
                  : 'No Cancelled Reservations'}
              </h3>
              <p className="empty-desc">
                {filterStatus === 'All'
                  ? 'You have not reserved any jungle safaris, riverboat cruises, or rainforest stays yet. Your next adventure awaits!'
                  : searchQuery
                  ? `No bookings match your search query "${searchQuery}". Try searching with a different keyword or clear filters.`
                  : `You currently have zero bookings marked under the ${filterStatus} category.`}
              </p>
              <div className="empty-actions">
                {searchQuery || filterStatus !== 'All' ? (
                  <button
                    onClick={() => {
                      setFilterStatus('All');
                      setSearchQuery('');
                    }}
                    className="action-btn secondary"
                  >
                    <RotateCcw size={15} />
                    <span>Clear All Filters</span>
                  </button>
                ) : (
                  <Link to="/safaris" className="action-btn primary">
                    <span>Explore Safari Expeditions</span>
                    <ArrowRight size={15} />
                  </Link>
                )}
              </div>
            </div>
          ) : (
            /* Booking Cards Grid / Feed */
            <div className="trips-feed-list">
              {filteredBookings.map((b) => {
                const id = b._id || b.id;
                const isCancelled = b.status === 'Cancelled';
                const isCompleted = b.status === 'Completed';
                const isConfirmed = b.status === 'Confirmed' || b.status === 'Booked';

                const dateDisplay = b.from_date && b.to_date
                  ? `${new Date(b.from_date).toLocaleDateString([], { month: 'short', day: 'numeric' })} – ${new Date(b.to_date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}`
                  : b.booking_date
                  ? new Date(b.booking_date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
                  : 'Schedule confirmed on permit';

                // Category Identity Icon
                const typeIcon =
                  b.item_type === 'Safari' ? '🐘' :
                  b.item_type === 'Stay' ? '🏕️' :
                  b.item_type === 'Package' ? '🧭' : '🌿';

                return (
                  <div
                    key={id}
                    className={`trip-luxury-card ${isCancelled ? 'card-cancelled' : ''}`}
                  >
                    {/* Top Identity & Status Row */}
                    <div className="trip-card-top-bar">
                      <span className={`trip-type-tag ${b.item_type?.toLowerCase() || 'safari'}`}>
                        <span>{typeIcon}</span>
                        <span>{b.item_type?.toUpperCase() || 'SAFARI'} RESERVATION</span>
                      </span>

                      <div className="trip-status-wrapper">
                        {isConfirmed && (
                          <span className="status-pill confirmed">
                            <CheckCircle2 size={13} />
                            <span>Confirmed</span>
                          </span>
                        )}
                        {isCompleted && (
                          <span className="status-pill completed">
                            <Clock size={13} />
                            <span>Completed</span>
                          </span>
                        )}
                        {isCancelled && (
                          <span className="status-pill cancelled">
                            <X size={13} />
                            <span>Cancelled</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Main Title & Tariff Row */}
                    <div className="trip-card-main-row">
                      <div className="trip-main-info">
                        <h3 className="trip-title-text">{b.item_name}</h3>
                        <div className="permit-badge-box">
                          <span className="permit-label">E-PERMIT:</span>
                          <span className="permit-number font-mono">
                            {b.ticket_number || `WT-${id.substring(0, 6).toUpperCase()}`}
                          </span>
                        </div>
                      </div>

                      <div className="trip-pricing-box">
                        <span className="trip-total-price font-mono">
                          ₹{(b.total_price || 0).toLocaleString()}
                        </span>
                        <span className={`payment-indicator ${b.payment_status?.toLowerCase() || 'paid'}`}>
                          ● {isCancelled ? 'Refund Processed' : b.payment_mode ? `Paid via ${b.payment_mode}` : 'Paid'}
                        </span>
                      </div>
                    </div>

                    {/* Structured Metadata Strip */}
                    <div className="trip-metadata-strip">
                      <div className="meta-col">
                        <div className="meta-col-inner">
                          <Calendar size={15} className="meta-icon text-forest" />
                          <div>
                            <span className="meta-label">Schedule Date</span>
                            <span className="meta-value">{dateDisplay}</span>
                          </div>
                        </div>
                      </div>

                      <div className="meta-col">
                        <div className="meta-col-inner">
                          <Users size={15} className="meta-icon text-gold" />
                          <div>
                            <span className="meta-label">Travelers</span>
                            <span className="meta-value">
                              {b.num_persons || 1} Guest(s) • {b.tourist_name || user.name || 'Traveler'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="meta-col">
                        <div className="meta-col-inner">
                          <MapPin size={15} className="meta-icon text-sky" />
                          <div>
                            <span className="meta-label">Gate Check-in</span>
                            <span className="meta-value">Dammanakatte Forest Reception</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card Actions Footer */}
                    <div className="trip-card-actions-row">
                      <div className="actions-left-note">
                        {isConfirmed && (
                          <span className="gate-notice-text">
                            Report 30 mins prior to departure time with a valid photo ID.
                          </span>
                        )}
                        {isCancelled && (
                          <span className="cancelled-notice-text">
                            This reservation is voided. Cancellation reference: #{b.ticket_number}
                          </span>
                        )}
                      </div>

                      <div className="actions-right-buttons">
                        {/* Primary Action: View Boarding Pass */}
                        <button
                          onClick={() => handleViewPass(b)}
                          className="trip-action-btn primary"
                          title="View and print official boarding pass"
                        >
                          <Printer size={15} />
                          <span>{isCancelled ? 'View Permit Details' : 'View Boarding Pass'}</span>
                        </button>

                        {/* Secondary Action: Cancel Reservation (Only on Confirmed / Active) */}
                        {isConfirmed && (
                          <button
                            onClick={() => handleOpenCancelModal(b)}
                            className="trip-action-btn danger-ghost"
                            title="Cancel reservation with refund"
                          >
                            <Ban size={14} />
                            <span>Cancel Reservation</span>
                          </button>
                        )}

                        {/* For Completed: Leave Verified Review & Rebook */}
                        {isCompleted && (
                          <>
                            <button
                              onClick={() => handleOpenReviewModal(b)}
                              className="trip-action-btn primary"
                              style={{ backgroundColor: '#d97706', borderColor: '#d97706' }}
                              title="Leave a verified review for this completed expedition"
                            >
                              <Sparkles size={14} />
                              <span>Leave Review</span>
                            </button>
                            <Link to="/safaris" className="trip-action-btn secondary">
                              <RotateCcw size={14} />
                              <span>Book Again</span>
                            </Link>
                          </>
                        )}

                        {/* For Cancelled: Rebook shortcut */}
                        {isCancelled && (
                          <Link to="/safaris" className="trip-action-btn secondary">
                            <Compass size={14} />
                            <span>Explore Safaris</span>
                          </Link>
                        )}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </section>

      </div>

      {/* Boarding Pass Modal */}
      <BookingPassModal
        isOpen={passModalOpen}
        onClose={() => setPassModalOpen(false)}
        booking={selectedBooking}
      />

      {/* Verified Review Modal */}
      {reviewModalOpen && bookingToReview && (
        <div className="modal-overlay" onClick={() => setReviewModalOpen(false)}>
          <div className="modal-content-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <button className="modal-close-btn" onClick={() => setReviewModalOpen(false)}>
              <X size={18} />
            </button>

            <div className="mb-3">
              <span className="badge badge-forest mb-1">VERIFIED TRAVELER REVIEW</span>
              <h3 style={{ fontSize: '1.3rem', color: '#1b4332', marginTop: '4px' }}>
                {bookingToReview.item_name}
              </h3>
              <p className="text-secondary" style={{ fontSize: '0.85rem' }}>
                Permit #{bookingToReview.ticket_number} • Completed Expedition
              </p>
            </div>

            <form onSubmit={handleReviewSubmit}>
              <div className="form-group mb-3">
                <label className="form-label">Rating (1 to 5 Stars)</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '8px',
                        backgroundColor: reviewRating >= star ? '#d97706' : '#f1f5f9',
                        color: reviewRating >= star ? '#fff' : '#64748b',
                        border: 'none',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      ★ {star}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group mb-4">
                <label className="form-label">Your Review & Highlights</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Share details about wildlife sightings, naturalist guidance, and sanctuary experience..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="modern-input"
                  style={{ width: '100%', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setReviewModalOpen(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview || !reviewComment.trim()}
                  className="btn-primary"
                >
                  {submittingReview ? 'Submitting...' : 'Publish Verified Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancellation Confirmation Dialog */}
      <ConfirmModal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        onConfirm={confirmCancelAction}
        title="Cancel Wildlife Reservation?"
        message={`Are you sure you want to cancel your reservation for ${bookingToCancel?.item_name} (Permit #${bookingToCancel?.ticket_number})? Reserved safari vehicle seats will be released back to the sanctuary registry.`}
        confirmText={cancelling ? 'Cancelling...' : 'Yes, Cancel Reservation'}
        danger={true}
      />


      <style>{`
        .my-trips-root {
          background-color: #f8fafc;
          min-height: calc(100vh - 72px);
          padding: 32px 24px 64px 24px;
          color: #1e293b;
        }

        .my-trips-container {
          max-width: 1240px;
          margin: 0 auto;
        }

        /* -------------------------------------------------- */
        /* 1. HEADER                                          */
        /* -------------------------------------------------- */
        .trips-header-bar {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 24px;
          padding-bottom: 24px;
          border-bottom: 1px solid #e2e8f0;
          margin-bottom: 28px;
        }

        .trips-breadcrumbs {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.8rem;
          margin-bottom: 6px;
        }

        .breadcrumb-link {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          color: #64748b;
          text-decoration: none;
          font-weight: 600;
        }

        .breadcrumb-link:hover { color: #1b4332; }
        .breadcrumb-sep { color: #cbd5e1; }
        .breadcrumb-current { color: #0f172a; font-weight: 700; }

        .trips-eyebrow-row {
          margin-bottom: 6px;
        }

        .trips-eyebrow-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          color: #1b4332;
          background: #e8f5e9;
          padding: 3px 9px;
          border-radius: 20px;
          border: 1px solid #c8e6c9;
        }

        .trips-main-title {
          font-family: var(--font-heading, 'Outfit', sans-serif);
          font-size: 1.85rem;
          font-weight: 800;
          letter-spacing: -0.03em;
          color: #0f172a;
          line-height: 1.2;
          margin: 0 0 4px 0;
        }

        .trips-main-subtitle {
          font-size: 0.9rem;
          color: #64748b;
          margin: 0;
          line-height: 1.45;
        }

        .trips-header-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }

        .action-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          padding: 9px 16px;
          border-radius: 9px;
          font-size: 0.86rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          text-decoration: none;
          border: none;
          font-family: inherit;
        }

        .action-btn.primary {
          background: #1b4332;
          color: #ffffff;
          box-shadow: 0 3px 10px rgba(27, 67, 50, 0.2);
        }

        .action-btn.primary:hover {
          background: #143527;
          transform: translateY(-1px);
          box-shadow: 0 5px 14px rgba(27, 67, 50, 0.3);
        }

        .action-btn.secondary {
          background: #ffffff;
          color: #1e293b;
          border: 1px solid #cbd5e1;
        }

        .action-btn.secondary:hover {
          background: #f1f5f9;
          border-color: #94a3b8;
        }

        /* -------------------------------------------------- */
        /* 2. SUMMARY CARDS                                   */
        /* -------------------------------------------------- */
        .summary-cards-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
        }

        .summary-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 16px 18px;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
        }

        .summary-card:hover {
          transform: translateY(-2px);
          border-color: #cbd5e1;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
        }

        .summary-card.active-summary {
          border-color: #1b4332;
          box-shadow: 0 0 0 2px rgba(27, 67, 50, 0.15);
        }

        .summary-card-inner {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .summary-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .summary-label {
          font-size: 0.76rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #64748b;
        }

        .summary-value {
          font-size: 1.6rem;
          font-weight: 800;
          color: #0f172a;
          line-height: 1;
        }

        .summary-icon-box {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .summary-icon-box.slate { background: #f1f5f9; color: #475569; }
        .summary-icon-box.emerald { background: #ecfdf5; color: #059669; }
        .summary-icon-box.sky { background: #e0f2fe; color: #0284c7; }
        .summary-icon-box.rose { background: #ffe4e6; color: #e11d48; }

        /* -------------------------------------------------- */
        /* 3. HORIZONTAL TABS & CONTROLS                      */
        /* -------------------------------------------------- */
        .trips-controls-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 12px 18px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
        }

        .horizontal-tabs-container {
          display: flex;
          align-items: center;
          gap: 6px;
          overflow-x: auto;
        }

        .tab-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 14px;
          border-radius: 8px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          font-size: 0.84rem;
          font-weight: 700;
          color: #475569;
          cursor: pointer;
          transition: all 0.15s ease;
          white-space: nowrap;
        }

        .tab-btn:hover {
          border-color: #cbd5e1;
          color: #0f172a;
        }

        .tab-btn.active {
          background: #1b4332;
          border-color: #1b4332;
          color: #ffffff;
        }

        .tab-count {
          font-size: 0.74rem;
          padding: 1px 6px;
          border-radius: 10px;
          background: rgba(0, 0, 0, 0.06);
        }

        .tab-btn.active .tab-count {
          background: rgba(255, 255, 255, 0.22);
          color: #ffffff;
        }

        .controls-right-group {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .trip-search-box {
          position: relative;
          min-width: 220px;
        }

        .trip-search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          pointer-events: none;
        }

        .trip-search-input {
          width: 100%;
          height: 38px;
          padding: 0 30px 0 34px;
          font-size: 0.84rem;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          outline: none;
          background: #ffffff;
          font-family: inherit;
        }

        .trip-search-input:focus {
          border-color: #1b4332;
          box-shadow: 0 0 0 2px rgba(27, 67, 50, 0.1);
        }

        .trip-clear-search {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
        }

        .trip-sort-select {
          height: 38px;
          padding: 0 12px;
          font-size: 0.82rem;
          font-weight: 600;
          color: #334155;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          background: #ffffff;
          outline: none;
          cursor: pointer;
          font-family: inherit;
        }

        /* -------------------------------------------------- */
        /* 4. BOOKING LUXURY CARD                             */
        /* -------------------------------------------------- */
        .trips-feed-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .trip-luxury-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 20px 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .trip-luxury-card:hover {
          border-color: #cbd5e1;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.06);
          transform: translateY(-2px);
        }

        .trip-luxury-card.card-cancelled {
          background: #fafbfc;
          border-color: #f1f5f9;
          opacity: 0.88;
        }

        .trip-card-top-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .trip-type-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.06em;
          padding: 3px 8px;
          border-radius: 6px;
        }

        .trip-type-tag.safari { background: #e8f5e9; color: #1b4332; }
        .trip-type-tag.stay { background: #e0f2fe; color: #0369a1; }
        .trip-type-tag.package { background: #fef3c7; color: #b45309; }
        .trip-type-tag.guide { background: #f3e8ff; color: #7e22ce; }

        .status-pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 0.76rem;
          font-weight: 700;
          padding: 3px 10px;
          border-radius: 20px;
        }

        .status-pill.confirmed { background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; }
        .status-pill.completed { background: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd; }
        .status-pill.cancelled { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }

        /* Main Row */
        .trip-card-main-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
          margin-bottom: 16px;
        }

        .trip-title-text {
          font-family: var(--font-heading, 'Outfit', sans-serif);
          font-size: 1.35rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 4px 0;
          line-height: 1.25;
        }

        .permit-badge-box {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.78rem;
          color: #64748b;
        }

        .permit-label {
          font-weight: 700;
          color: #94a3b8;
        }

        .permit-number {
          font-weight: 800;
          color: #92400e;
          background: #fef3c7;
          border: 1px solid rgba(251, 191, 36, 0.4);
          padding: 2px 7px;
          border-radius: 5px;
        }

        .trip-pricing-box {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 2px;
          flex-shrink: 0;
        }

        .trip-total-price {
          font-size: 1.4rem;
          font-weight: 800;
          color: #1b4332;
          line-height: 1.1;
        }

        .payment-indicator {
          font-size: 0.74rem;
          font-weight: 600;
          color: #64748b;
        }

        .payment-indicator.paid { color: #047857; }
        .payment-indicator.refunded { color: #dc2626; }

        /* Metadata Strip */
        .trip-metadata-strip {
          display: grid;
          grid-template-columns: 1.2fr 1.2fr 1.4fr;
          gap: 12px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 12px 16px;
          margin-bottom: 16px;
        }

        .meta-col-inner {
          display: flex;
          align-items: flex-start;
          gap: 8px;
        }

        .meta-icon {
          flex-shrink: 0;
          margin-top: 2px;
        }

        .meta-icon.text-forest { color: #1b4332; }
        .meta-icon.text-gold { color: #d97706; }
        .meta-icon.text-sky { color: #0284c7; }

        .meta-label {
          display: block;
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: #64748b;
          margin-bottom: 1px;
        }

        .meta-value {
          font-size: 0.86rem;
          font-weight: 600;
          color: #0f172a;
        }

        /* Actions Row */
        .trip-card-actions-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          padding-top: 12px;
          border-top: 1px solid #f1f5f9;
        }

        .gate-notice-text {
          font-size: 0.78rem;
          color: #64748b;
          font-style: italic;
        }

        .cancelled-notice-text {
          font-size: 0.78rem;
          color: #dc2626;
          font-weight: 500;
        }

        .actions-right-buttons {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .trip-action-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          border-radius: 8px;
          font-size: 0.82rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s ease;
          text-decoration: none;
          font-family: inherit;
        }

        .trip-action-btn.primary {
          background: #1b4332;
          color: #ffffff;
          border: none;
          box-shadow: 0 2px 8px rgba(27, 67, 50, 0.2);
        }

        .trip-action-btn.primary:hover {
          background: #143527;
          transform: translateY(-1px);
        }

        .trip-action-btn.secondary {
          background: #ffffff;
          color: #1e293b;
          border: 1px solid #cbd5e1;
        }

        .trip-action-btn.secondary:hover {
          background: #f1f5f9;
          border-color: #94a3b8;
        }

        .trip-action-btn.danger-ghost {
          background: transparent;
          color: #dc2626;
          border: 1px solid transparent;
        }

        .trip-action-btn.danger-ghost:hover {
          background: #fef2f2;
          border-color: #fecaca;
        }

        /* -------------------------------------------------- */
        /* 5. EMPTY & SKELETON STATES                         */
        /* -------------------------------------------------- */
        .trips-empty-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 56px 24px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .empty-icon-wrap {
          width: 64px;
          height: 64px;
          border-radius: 16px;
          background: #e8f5e9;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
        }

        .empty-title {
          font-size: 1.25rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 6px 0;
        }

        .empty-desc {
          font-size: 0.88rem;
          color: #64748b;
          margin: 0 0 20px 0;
          max-width: 440px;
          line-height: 1.5;
        }

        .empty-actions {
          display: flex;
          gap: 10px;
        }

        /* Skeleton Loaders */
        .trips-skeleton-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .trip-skeleton-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 20px 24px;
        }

        .shimmer {
          background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 6px;
        }

        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        .skeleton-grid-placeholder {
          height: 50px;
          border-radius: 8px;
        }

        /* Unauthenticated View */
        .trips-unauth-container {
          min-height: calc(100vh - 120px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          background: #f8fafc;
        }

        .trips-unauth-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 40px 32px;
          max-width: 480px;
          text-align: center;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
        }

        .unauth-icon-box {
          width: 64px;
          height: 64px;
          border-radius: 16px;
          background: #e8f5e9;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px auto;
        }

        .unauth-title {
          font-size: 1.35rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 8px 0;
        }

        .unauth-desc {
          font-size: 0.88rem;
          color: #64748b;
          margin: 0 0 24px 0;
          line-height: 1.5;
        }

        .unauth-actions {
          display: flex;
          justify-content: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        /* -------------------------------------------------- */
        /* RESPONSIVE DESIGN                                  */
        /* -------------------------------------------------- */
        @media (max-width: 1024px) {
          .summary-cards-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .trip-metadata-strip {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 768px) {
          .my-trips-root {
            padding: 20px 14px 48px 14px;
          }
          .trips-header-bar {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }
          .trips-header-actions {
            width: 100%;
            justify-content: flex-start;
          }
          .trips-controls-card {
            flex-direction: column;
            align-items: stretch;
          }
          .controls-right-group {
            flex-direction: column;
            width: 100%;
          }
          .trip-search-box,
          .trip-sort-select {
            width: 100%;
          }
          .trip-card-main-row {
            flex-direction: column;
            gap: 10px;
          }
          .trip-pricing-box {
            align-items: flex-start;
          }
          .trip-metadata-strip {
            grid-template-columns: 1fr;
            gap: 10px;
          }
          .trip-card-actions-row {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
          }
          .actions-right-buttons {
            flex-direction: column;
            width: 100%;
          }
          .trip-action-btn {
            width: 100%;
            justify-content: center;
          }
        }

        @media (max-width: 480px) {
          .summary-cards-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default MyTrips;
