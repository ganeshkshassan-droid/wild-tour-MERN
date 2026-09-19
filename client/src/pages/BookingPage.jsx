import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api, extractErrorMessage } from '../services/api';
import confetti from 'canvas-confetti';
import {
  Calendar,
  Users,
  CreditCard,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Clock,
  AlertCircle,
  MapPin,
  Sparkles,
  TreePine,
  Hotel,
  Layers,
  Award,
  Phone,
  User as UserIcon,
  Mail,
  Lock,
  Compass,
  FileText,
  Star,
  Check,
  Info
} from 'lucide-react';

const BookingPage = () => {
  const { type: paramType, id: paramId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  // Normalize item type: 'Safari' | 'Stay' | 'Package' | 'Guide'
  const normalizedType = useMemo(() => {
    const rawType = paramType || location.state?.itemType || 'Safari';
    const lower = rawType.toLowerCase();
    if (lower.includes('stay') || lower.includes('lodge') || lower.includes('resort')) return 'Stay';
    if (lower.includes('package') || lower.includes('tour')) return 'Package';
    if (lower.includes('guide') || lower.includes('naturalist')) return 'Guide';
    return 'Safari';
  }, [paramType, location.state?.itemType]);

  const itemId = paramId || location.state?.item?._id || location.state?.item?.id;

  // Item Data & Loading
  const [item, setItem] = useState(location.state?.item || null);
  const [loadingItem, setLoadingItem] = useState(!location.state?.item);
  const [itemError, setItemError] = useState(null);

  // Booking Form State
  const [touristName, setTouristName] = useState(user?.name || '');
  const [touristPhone, setTouristPhone] = useState(user?.phone || '');
  const [touristEmail, setTouristEmail] = useState(user?.email || '');
  const [numPersons, setNumPersons] = useState(2);
  const [safariShift, setSafariShift] = useState('Morning');
  const [bookingDate, setBookingDate] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [paymentMode, setPaymentMode] = useState('UPI / NetBanking');
  const [idempotencyKey, setIdempotencyKey] = useState('');
  const [formErrors, setFormErrors] = useState({});

  // Live Slot Availability State (Safaris Only)
  const [slotAvailability, setSlotAvailability] = useState(null);
  const [loadingAvailability, setLoadingAvailability] = useState(false);

  // Submission & Confirmation State
  const [submitting, setSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // Initialize Dates and Idempotency Key
  useEffect(() => {
    if (user) {
      if (!touristName) setTouristName(user.name || '');
      if (!touristPhone) setTouristPhone(user.phone || '');
      if (!touristEmail) setTouristEmail(user.email || '');
    }

    const today = new Date();
    today.setDate(today.getDate() + 1);
    const pad = (n) => String(n).padStart(2, '0');
    const defaultStart = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

    const nextDay = new Date(today);
    nextDay.setDate(nextDay.getDate() + 2);
    const defaultEnd = `${nextDay.getFullYear()}-${pad(nextDay.getMonth() + 1)}-${pad(nextDay.getDate())}`;

    setBookingDate(defaultStart);
    setFromDate(defaultStart);
    setToDate(defaultEnd);

    const key = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `ik_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    setIdempotencyKey(key);
  }, [user]);

  // Fetch Inventory Item if not in state
  useEffect(() => {
    if (!itemId) {
      setItemError('No experience selected for reservation.');
      setLoadingItem(false);
      return;
    }

    const fetchItemDetails = async () => {
      setLoadingItem(true);
      setItemError(null);
      try {
        let res;
        if (normalizedType === 'Stay') res = await api.getStayById(itemId);
        else if (normalizedType === 'Package') res = await api.getPackageById(itemId);
        else if (normalizedType === 'Guide') res = await api.getGuideById(itemId);
        else res = await api.getSafariById(itemId);

        if (res.success && res.data) {
          setItem(res.data);
        } else {
          setItemError('Requested sanctuary experience could not be loaded.');
        }
      } catch (err) {
        console.error('Error loading booking item:', err);
        setItemError(extractErrorMessage(err));
      } finally {
        setLoadingItem(false);
      }
    };

    fetchItemDetails();
  }, [itemId, normalizedType]);

  // Live Slot Availability Query for Safaris
  useEffect(() => {
    if (normalizedType === 'Safari' && itemId && bookingDate) {
      setLoadingAvailability(true);
      api.getSafariAvailability(itemId, bookingDate, safariShift)
        .then((res) => {
          if (res.success && res.data) {
            setSlotAvailability(res.data);
          }
        })
        .catch(() => {
          setSlotAvailability(null);
        })
        .finally(() => {
          setLoadingAvailability(false);
        });
    }
  }, [normalizedType, itemId, bookingDate, safariShift]);

  const isMultiDay = normalizedType === 'Stay';

  // Dynamic Price Calculation
  const baseRate = useMemo(() => {
    if (!item) return 1850;
    return (
      item.price_per_seat ||
      item.price_per_night ||
      item.price_per_day ||
      item.price ||
      1850
    );
  }, [item]);

  const durationMultiplier = useMemo(() => {
    if (isMultiDay && fromDate && toDate) {
      const start = new Date(fromDate);
      const end = new Date(toDate);
      const diffTime = end.getTime() - start.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 1;
    }
    return 1;
  }, [isMultiDay, fromDate, toDate]);

  const subtotal = useMemo(() => {
    if (isMultiDay) {
      return baseRate * durationMultiplier;
    }
    return baseRate * Number(numPersons);
  }, [baseRate, isMultiDay, durationMultiplier, numPersons]);

  const ecoLevy = useMemo(() => Math.round(subtotal * 0.05), [subtotal]);
  const totalAmount = useMemo(() => subtotal + ecoLevy, [subtotal, ecoLevy]);

  const isOverCapacity = useMemo(() => {
    return (
      normalizedType === 'Safari' &&
      slotAvailability &&
      slotAvailability.remaining_seats < Number(numPersons)
    );
  }, [normalizedType, slotAvailability, numPersons]);

  // Validate form before submission
  const validateForm = () => {
    const errors = {};

    if (!touristName.trim()) {
      errors.touristName = 'Lead traveler full name is required for official permit.';
    }

    if (touristPhone && !/^[0-9+ -]{7,15}$/.test(touristPhone.trim())) {
      errors.touristPhone = 'Please enter a valid phone number.';
    }

    if (isMultiDay) {
      if (!fromDate) errors.fromDate = 'Check-in date is required.';
      if (!toDate) errors.toDate = 'Check-out date is required.';
      if (fromDate && toDate && new Date(toDate) <= new Date(fromDate)) {
        errors.toDate = 'Check-out date must be strictly after check-in date.';
      }
    } else {
      if (!bookingDate) errors.bookingDate = 'Schedule date is required.';
    }

    if (!numPersons || numPersons < 1) {
      errors.numPersons = 'Please select at least 1 guest.';
    }

    if (isOverCapacity) {
      errors.capacity = `Selected shift only has ${slotAvailability.remaining_seats} seat(s) remaining.`;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 110,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#1b4332', '#2d6a4f', '#d97706', '#10b981', '#fef08a'],
      });
    } catch (e) {}
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      showToast('Please sign in to complete your sanctuary reservation', 'warning');
      navigate('/login', { state: { from: location.pathname, item, itemType: normalizedType } });
      return;
    }

    if (!validateForm()) {
      showToast('Please check the required booking fields', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        item_id: item._id || item.id,
        item_type: normalizedType,
        item_name: item.name,
        item_image: item.image_url || item.image || '',
        tourist_name: touristName.trim(),
        tourist_phone: touristPhone.trim() || (user.phone || ''),
        num_persons: Number(numPersons),
        safari_shift: normalizedType === 'Safari' ? safariShift : 'N/A',
        payment_mode: paymentMode,
        booking_date: isMultiDay ? fromDate : bookingDate,
        from_date: isMultiDay ? fromDate : undefined,
        to_date: isMultiDay ? toDate : undefined,
        special_requests: specialRequests.trim(),
        idempotency_key: idempotencyKey,
      };

      const res = await api.createBooking(payload);
      if (res.success && (res.booking || res.data)) {
        const savedBooking = res.booking || res.data;
        setConfirmedBooking(savedBooking);
        triggerConfetti();
        showToast('Official Sanctuary Permit Issued Successfully!', 'success');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        showToast(res.message || 'Booking could not be finalized.', 'error');
      }
    } catch (error) {
      console.error('Booking submission error:', error);
      showToast(extractErrorMessage(error), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Loading State
  if (loadingItem) {
    return (
      <div className="booking-page-root container section-padding">
        <div className="booking-loading-box text-center py-5">
          <div className="loading-spinner mb-3" />
          <h2 className="text-xl font-bold text-heading">Loading Sanctuary Reservation Engine...</h2>
          <p className="text-secondary text-sm">Fetching verified rates and gate permit quotas.</p>
        </div>
      </div>
    );
  }

  // Error State
  if (itemError || !item) {
    return (
      <div className="booking-page-root container section-padding">
        <div className="white-card text-center p-5 mx-auto" style={{ maxWidth: 540 }}>
          <AlertCircle size={48} className="text-danger mx-auto mb-3" />
          <h2 className="text-2xl font-bold text-heading mb-2">Expedition Not Found</h2>
          <p className="text-secondary mb-4">{itemError || 'The requested safari or lodge could not be found.'}</p>
          <div className="d-flex gap-3 justify-content-center">
            <Link to="/safaris" className="btn-primary">
              <Compass size={16} />
              <span>Explore Safaris</span>
            </Link>
            <Link to="/stays" className="btn-secondary">
              <Hotel size={16} />
              <span>View Lodges</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // CONFIRMATION STATE (RENDERED IN-PAGE UPON SUCCESSFUL DATABASE INSERTION)
  // =========================================================================
  if (confirmedBooking) {
    const permitId =
      confirmedBooking.ticket_number ||
      `WT-${(confirmedBooking._id || confirmedBooking.id || 'CONFIRMED').substring(0, 8).toUpperCase()}`;

    const dateDisplay =
      confirmedBooking.from_date && confirmedBooking.to_date
        ? `${new Date(confirmedBooking.from_date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} – ${new Date(confirmedBooking.to_date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}`
        : confirmedBooking.booking_date
        ? new Date(confirmedBooking.booking_date).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })
        : 'Registered on Permit';

    return (
      <div className="booking-page-root container section-padding">
        <div className="confirmation-layout mx-auto">
          {/* Header Banner */}
          <div className="confirmation-header text-center mb-4">
            <div className="confirmation-success-icon-wrap mb-3">
              <CheckCircle2 size={44} className="text-success-icon" />
            </div>
            <span className="confirmation-badge-pill">
              <ShieldCheck size={14} />
              <span>OFFICIAL SANCTUARY PERMIT ISSUED</span>
            </span>
            <h1 className="confirmation-main-title">Reservation Confirmed!</h1>
            <p className="confirmation-subtitle">
              Your official Nagarhole & Kabini sanctuary permit has been generated and recorded in the forest department system.
            </p>
          </div>

          {/* Permit Voucher Card */}
          <div className="white-card confirmation-card">
            {/* Top Bar */}
            <div className="permit-top-bar">
              <div>
                <span className="permit-tag-label">E-PERMIT IDENTIFIER</span>
                <span className="permit-number font-mono">{permitId}</span>
              </div>
              <div className="permit-status-badge">
                <span className="status-dot-pulse" />
                <span>CONFIRMED & ACTIVE</span>
              </div>
            </div>

            {/* Experience Overview */}
            <div className="permit-item-row">
              <img
                src={confirmedBooking.item_image || item.image_url || item.image || '/images/tiger.jpg'}
                alt={confirmedBooking.item_name}
                className="permit-item-img"
              />
              <div className="permit-item-info">
                <span className="badge badge-forest mb-1">{confirmedBooking.item_type || normalizedType} EXPEDITION</span>
                <h2 className="permit-item-name">{confirmedBooking.item_name}</h2>
                <p className="permit-item-location text-secondary">
                  <MapPin size={14} className="text-forest-primary inline-icon" />
                  <span>{item.location || item.category || 'Nagarhole National Park, Dammanakatte'}</span>
                </p>
              </div>
            </div>

            {/* Structured Metadata Grid */}
            <div className="permit-grid-details">
              <div className="permit-detail-item">
                <span className="detail-label">Lead Traveler</span>
                <strong className="detail-val">{confirmedBooking.tourist_name}</strong>
              </div>

              <div className="permit-detail-item">
                <span className="detail-label">Headcount</span>
                <strong className="detail-val">{confirmedBooking.num_persons} {confirmedBooking.num_persons === 1 ? 'Guest' : 'Guests'}</strong>
              </div>

              <div className="permit-detail-item">
                <span className="detail-label">Scheduled Date</span>
                <strong className="detail-val">{dateDisplay}</strong>
              </div>

              {confirmedBooking.safari_shift && confirmedBooking.safari_shift !== 'N/A' && (
                <div className="permit-detail-item">
                  <span className="detail-label">Shift & Timing</span>
                  <strong className="detail-val">
                    {confirmedBooking.safari_shift === 'Morning' ? '🌅 Morning (06:00 AM)' : '🐆 Evening (03:30 PM)'}
                  </strong>
                </div>
              )}

              <div className="permit-detail-item">
                <span className="detail-label">Payment Channel</span>
                <strong className="detail-val">{confirmedBooking.payment_mode || paymentMode}</strong>
              </div>

              <div className="permit-detail-item">
                <span className="detail-label">Payment Status</span>
                <span className={`badge ${confirmedBooking.payment_status === 'Paid' ? 'badge-forest' : 'badge-gold'}`}>
                  ● {confirmedBooking.payment_status || 'Paid'}
                </span>
              </div>
            </div>

            {/* Tariff Breakdown Footer */}
            <div className="permit-fare-summary">
              <div className="fare-row">
                <span>Tariff Calculation</span>
                <span className="font-mono font-medium">₹{(confirmedBooking.total_price || totalAmount).toLocaleString()}</span>
              </div>
              <div className="fare-row">
                <span>Gate Admission Verification</span>
                <span className="text-forest-primary font-medium">Included (E-Permit)</span>
              </div>
              <div className="fare-total-row">
                <span className="font-bold">Total Tariff Amount</span>
                <span className="font-bold font-mono text-xl text-forest-primary">
                  ₹{(confirmedBooking.total_price || totalAmount).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Ranger Checkpost Note */}
            <div className="ranger-checkpost-notice">
              <Info size={18} className="text-forest-primary flex-shrink-0" />
              <p className="notice-text">
                Please present this E-Permit Reference (<strong>{permitId}</strong>) along with a valid government photo ID at the Dammanakatte Ranger Checkpost 30 minutes prior to gate departure.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="confirmation-action-buttons">
              <button
                type="button"
                onClick={() => navigate('/my-trips')}
                className="btn-primary btn-lg flex-1 justify-content-center"
              >
                <FileText size={18} />
                <span>View My Trips</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/safaris')}
                className="btn-secondary btn-lg flex-1 justify-content-center"
              >
                <Compass size={18} />
                <span>Explore More Safaris</span>
              </button>
            </div>
          </div>
        </div>

        <style>{`
          .confirmation-layout {
            max-width: 780px;
          }
          .confirmation-success-icon-wrap {
            width: 72px;
            height: 72px;
            background: #ecfdf5;
            border: 2px solid #a7f3d0;
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 8px 24px rgba(16, 185, 129, 0.2);
          }
          .text-success-icon {
            color: #059669;
          }
          .confirmation-badge-pill {
            display: inline-flex;
            align-items: center;
            gap: 0.45rem;
            background: #f0fdf4;
            color: #166534;
            font-size: 0.78rem;
            font-weight: 800;
            letter-spacing: 0.08em;
            padding: 0.35rem 0.95rem;
            border-radius: var(--radius-full);
            border: 1px solid rgba(22, 101, 52, 0.2);
            margin-bottom: 0.75rem;
          }
          .confirmation-main-title {
            font-size: 2.4rem;
            font-weight: 900;
            color: var(--text-heading);
            margin-bottom: 0.5rem;
          }
          .confirmation-subtitle {
            color: var(--text-secondary);
            font-size: 1.05rem;
            max-width: 620px;
            margin: 0 auto;
            line-height: 1.55;
          }
          .confirmation-card {
            padding: 2.2rem;
            border-radius: var(--radius-xl);
            box-shadow: var(--shadow-modal);
            margin-top: 1.5rem;
          }
          .permit-top-bar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding-bottom: 1.4rem;
            border-bottom: 1px dashed var(--border-light);
            margin-bottom: 1.5rem;
          }
          .permit-tag-label {
            font-size: 0.72rem;
            font-weight: 800;
            color: var(--text-muted);
            letter-spacing: 0.08em;
            display: block;
          }
          .permit-number {
            font-size: 1.35rem;
            font-weight: 800;
            color: var(--forest-primary);
          }
          .permit-status-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.45rem;
            background: #ecfdf5;
            color: #065f46;
            font-size: 0.75rem;
            font-weight: 800;
            padding: 0.35rem 0.75rem;
            border-radius: var(--radius-full);
            border: 1px solid rgba(16, 185, 129, 0.3);
          }
          .status-dot-pulse {
            width: 8px;
            height: 8px;
            background: #10b981;
            border-radius: 50%;
          }
          .permit-item-row {
            display: flex;
            gap: 1.4rem;
            margin-bottom: 1.8rem;
          }
          .permit-item-img {
            width: 110px;
            height: 90px;
            border-radius: var(--radius-md);
            object-fit: cover;
            flex-shrink: 0;
          }
          .permit-item-name {
            font-size: 1.35rem;
            font-weight: 800;
            color: var(--text-heading);
            margin-bottom: 0.25rem;
          }
          .permit-grid-details {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 1.2rem;
            background: var(--bg-surface-subtle);
            padding: 1.4rem;
            border-radius: var(--radius-md);
            border: 1px solid var(--border-light);
            margin-bottom: 1.6rem;
          }
          .permit-detail-item {
            display: flex;
            flex-direction: column;
            gap: 0.2rem;
          }
          .detail-label {
            font-size: 0.72rem;
            color: var(--text-muted);
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          .detail-val {
            font-size: 0.95rem;
            color: var(--text-heading);
          }
          .permit-fare-summary {
            padding: 1.2rem;
            background: #ffffff;
            border: 1px solid var(--border-light);
            border-radius: var(--radius-md);
            margin-bottom: 1.4rem;
          }
          .fare-row {
            display: flex;
            justify-content: space-between;
            font-size: 0.9rem;
            color: var(--text-secondary);
            margin-bottom: 0.5rem;
          }
          .fare-total-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-top: 0.75rem;
            border-top: 1px solid var(--border-light);
            margin-top: 0.5rem;
          }
          .ranger-checkpost-notice {
            display: flex;
            align-items: flex-start;
            gap: 0.85rem;
            background: #f0fdf4;
            border: 1px solid #bbf7d0;
            padding: 1rem 1.2rem;
            border-radius: var(--radius-md);
            margin-bottom: 1.8rem;
          }
          .notice-text {
            font-size: 0.88rem;
            color: #166534;
            line-height: 1.5;
            margin: 0;
          }
          .confirmation-action-buttons {
            display: flex;
            gap: 1rem;
          }
          @media (max-width: 768px) {
            .permit-grid-details { grid-template-columns: 1fr 1fr; }
            .confirmation-action-buttons { flex-direction: column; }
            .permit-item-row { flex-direction: column; }
            .permit-item-img { width: 100%; height: 160px; }
          }
          @media (max-width: 500px) {
            .permit-grid-details { grid-template-columns: 1fr; }
          }
        `}</style>
      </div>
    );
  }

  // =========================================================================
  // BOOKING FORM VIEW (FULL-PAGE RESPONSIVE 2-COLUMN EXPERIENCE)
  // =========================================================================
  return (
    <div className="booking-page-root container section-padding">
      {/* Breadcrumb Navigation */}
      <div className="booking-nav-header mb-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="btn-ghost btn-sm text-secondary"
          style={{ paddingLeft: 0 }}
        >
          <ArrowLeft size={16} />
          <span>Back to {normalizedType}s</span>
        </button>
      </div>

      <div className="booking-page-grid">
        {/* LEFT COLUMN: BOOKING CONFIGURATION & TRAVELLER DETAILS */}
        <div className="booking-form-col">
          <div className="section-header text-left mb-4">
            <span className="section-eyebrow">
              <TreePine size={15} />
              <span>NAGARHOLE E-PERMIT RESERVATION</span>
            </span>
            <h1 className="section-title text-3xl">Reserve Your {normalizedType} Permit</h1>
            <p className="section-subtitle text-sm">
              Official forest department gate admission & verified expedition booking engine.
            </p>
          </div>

          {!user && (
            <div className="auth-prompt-banner mb-4">
              <Lock size={18} className="text-forest-primary flex-shrink-0" />
              <div className="auth-prompt-text">
                <strong className="block text-heading text-sm">Guest Checkout Mode</strong>
                <p className="text-xs text-secondary mb-2">Sign in to automatically link this permit to your official profile and My Trips.</p>
                <Link
                  to="/login"
                  state={{ from: location.pathname, item, itemType: normalizedType }}
                  className="btn-secondary btn-sm"
                  style={{ display: 'inline-flex' }}
                >
                  <span>Sign In for Instant Autofill</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          )}

          <form onSubmit={handleBookingSubmit} className="booking-main-form">
            {/* 1. Lead Traveller Information */}
            <div className="form-section-card white-card mb-4">
              <h2 className="form-section-title">
                <UserIcon size={18} className="text-forest-primary" />
                <span>1. Lead Traveler Information</span>
              </h2>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">
                    Full Legal Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="As displayed on Government ID"
                    value={touristName}
                    onChange={(e) => {
                      setTouristName(e.target.value);
                      if (formErrors.touristName) setFormErrors({ ...formErrors, touristName: null });
                    }}
                    className={`modern-input ${formErrors.touristName ? 'input-error' : ''}`}
                  />
                  {formErrors.touristName && <span className="field-error-msg">{formErrors.touristName}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Contact Phone</label>
                  <div className="input-with-icon">
                    <Phone size={16} className="input-inner-icon text-muted" />
                    <input
                      type="tel"
                      placeholder="e.g. 9876543210"
                      value={touristPhone}
                      onChange={(e) => {
                        setTouristPhone(e.target.value);
                        if (formErrors.touristPhone) setFormErrors({ ...formErrors, touristPhone: null });
                      }}
                      className={`modern-input pl-icon ${formErrors.touristPhone ? 'input-error' : ''}`}
                    />
                  </div>
                  {formErrors.touristPhone && <span className="field-error-msg">{formErrors.touristPhone}</span>}
                </div>
              </div>

              <div className="form-group mb-0">
                <label className="form-label">Email for E-Permit Delivery</label>
                <div className="input-with-icon">
                  <Mail size={16} className="input-inner-icon text-muted" />
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={touristEmail}
                    onChange={(e) => setTouristEmail(e.target.value)}
                    className="modern-input pl-icon"
                  />
                </div>
              </div>
            </div>

            {/* 2. Schedule, Dates & Safari Shift */}
            <div className="form-section-card white-card mb-4">
              <h2 className="form-section-title">
                <Calendar size={18} className="text-forest-primary" />
                <span>2. Schedule & Group Size</span>
              </h2>

              {/* Safari Shift Timing Selector */}
              {normalizedType === 'Safari' && (
                <div className="form-group mb-4">
                  <label className="form-label">Select Safari Shift & Track Timing</label>
                  <div className="shift-selector-grid">
                    <button
                      type="button"
                      onClick={() => setSafariShift('Morning')}
                      className={`shift-option-box ${safariShift === 'Morning' ? 'active' : ''}`}
                    >
                      <div className="shift-box-header">
                        <span className="shift-emoji">🌅</span>
                        <strong className="shift-title">Morning Dawn Trail</strong>
                      </div>
                      <span className="shift-timing">06:00 AM – 09:30 AM</span>
                      <span className="shift-tag">Prime Big Cat Sighting</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSafariShift('Evening')}
                      className={`shift-option-box ${safariShift === 'Evening' ? 'active' : ''}`}
                    >
                      <div className="shift-box-header">
                        <span className="shift-emoji">🐆</span>
                        <strong className="shift-title">Evening Predator Drive</strong>
                      </div>
                      <span className="shift-timing">03:30 PM – 06:30 PM</span>
                      <span className="shift-tag">Waterhole Herd Activity</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Date Pickers */}
              <div className="form-grid-2">
                {isMultiDay ? (
                  <>
                    <div className="form-group">
                      <label className="form-label">Check-in Date <span className="text-danger">*</span></label>
                      <input
                        type="date"
                        required
                        value={fromDate}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => {
                          setFromDate(e.target.value);
                          if (formErrors.fromDate) setFormErrors({ ...formErrors, fromDate: null });
                        }}
                        className={`modern-input ${formErrors.fromDate ? 'input-error' : ''}`}
                      />
                      {formErrors.fromDate && <span className="field-error-msg">{formErrors.fromDate}</span>}
                    </div>

                    <div className="form-group">
                      <label className="form-label">Check-out Date <span className="text-danger">*</span></label>
                      <input
                        type="date"
                        required
                        value={toDate}
                        min={fromDate || new Date().toISOString().split('T')[0]}
                        onChange={(e) => {
                          setToDate(e.target.value);
                          if (formErrors.toDate) setFormErrors({ ...formErrors, toDate: null });
                        }}
                        className={`modern-input ${formErrors.toDate ? 'input-error' : ''}`}
                      />
                      {formErrors.toDate && <span className="field-error-msg">{formErrors.toDate}</span>}
                    </div>
                  </>
                ) : (
                  <div className="form-group">
                    <label className="form-label">Safari Schedule Date <span className="text-danger">*</span></label>
                    <input
                      type="date"
                      required
                      value={bookingDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => {
                        setBookingDate(e.target.value);
                        if (formErrors.bookingDate) setFormErrors({ ...formErrors, bookingDate: null });
                      }}
                      className={`modern-input ${formErrors.bookingDate ? 'input-error' : ''}`}
                    />
                    {formErrors.bookingDate && <span className="field-error-msg">{formErrors.bookingDate}</span>}
                  </div>
                )}

                {/* Number of Guests */}
                <div className="form-group">
                  <label className="form-label">Number of Travelers / Seats <span className="text-danger">*</span></label>
                  <select
                    value={numPersons}
                    onChange={(e) => {
                      setNumPersons(Number(e.target.value));
                      if (formErrors.numPersons) setFormErrors({ ...formErrors, numPersons: null });
                    }}
                    className="modern-input"
                  >
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <option key={n} value={n}>
                        {n} {n === 1 ? 'Traveler (1 Seat)' : `${n} Travelers (${n} Seats)`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Real-time Safari Shift Capacity Indicator */}
              {normalizedType === 'Safari' && slotAvailability && (
                <div className={`slot-capacity-status-banner ${isOverCapacity ? 'soldout' : 'available'}`}>
                  {isOverCapacity ? (
                    <>
                      <AlertCircle size={18} className="text-danger flex-shrink-0" />
                      <div>
                        <strong>Capacity Limit Exceeded:</strong> Only {slotAvailability.remaining_seats} of {slotAvailability.capacity} seats remaining for this {safariShift} shift.
                      </div>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={18} className="text-forest-primary flex-shrink-0" />
                      <div>
                        <strong>Confirmed Quota Available:</strong> {slotAvailability.remaining_seats} open seats ({slotAvailability.booked_seats}/{slotAvailability.capacity} reserved on this track).
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Special Requests Optional Input */}
              <div className="form-group mb-0">
                <label className="form-label">Special Requests / Naturalist Notes (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Telephoto lens mount request, senior citizen front seat, vegetarian breakfast box"
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  className="modern-input"
                />
              </div>
            </div>

            {/* 3. Payment Method */}
            <div className="form-section-card white-card mb-4">
              <h2 className="form-section-title">
                <CreditCard size={18} className="text-forest-primary" />
                <span>3. Payment Channel</span>
              </h2>

              <div className="payment-method-selector-grid">
                {[
                  { id: 'UPI / NetBanking', title: 'UPI & NetBanking', sub: 'Instant GPay / PhonePe / Paytm / Bank', icon: '⚡' },
                  { id: 'Credit/Debit Card', title: 'Credit / Debit Card', sub: 'Visa, MasterCard, RuPay, Amex', icon: '💳' },
                  { id: 'Pay on Arrival', title: 'Pay on Arrival', sub: 'Pay Cash/Card at Checkpost Gate', icon: '🛡️' },
                ].map((pm) => (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => setPaymentMode(pm.id)}
                    className={`payment-mode-box ${paymentMode === pm.id ? 'active' : ''}`}
                  >
                    <div className="pm-header">
                      <span className="pm-icon">{pm.icon}</span>
                      <strong className="pm-title">{pm.title}</strong>
                    </div>
                    <span className="pm-sub">{pm.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Reservation Button */}
            <button
              type="submit"
              disabled={submitting || isOverCapacity}
              className="btn-primary btn-lg w-full submit-booking-cta"
            >
              <span>{submitting ? 'Confirming Sanctuary E-Permit...' : `Confirm & Reserve E-Permit — ₹${totalAmount.toLocaleString()}`}</span>
              <ArrowRight size={18} />
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: STICKY EXPERIENCE SUMMARY & DYNAMIC PRICE BREAKDOWN */}
        <div className="booking-summary-col">
          <div className="sticky-summary-card white-card">
            {/* Image & Badges */}
            <div className="summary-media-wrap">
              <img
                src={item.image_url || item.image || '/images/tiger.jpg'}
                alt={item.name}
                className="summary-img"
              />
              <span className="card-tag-pill gold-glow">
                {normalizedType.toUpperCase()} EXPEDITION
              </span>
              <span className="card-rating-pill">
                <Star size={13} fill="currentColor" />
                <span>{item.sighting_rating || item.rating || 4.9}</span>
              </span>
            </div>

            {/* Item Details */}
            <div className="summary-body">
              <h2 className="summary-item-name">{item.name}</h2>
              <p className="summary-item-location text-secondary">
                <MapPin size={14} className="text-forest-primary inline-icon" />
                <span>{item.location || item.category || 'Nagarhole National Park & Kabini'}</span>
              </p>

              <div className="summary-features-row">
                <div className="summary-feature-pill">
                  <Clock size={14} className="text-forest-primary" />
                  <span>{item.duration || (isMultiDay ? `${durationMultiplier} Nights` : '3.5 Hours')}</span>
                </div>
                <div className="summary-feature-pill">
                  <Compass size={14} className="text-forest-primary" />
                  <span>{item.vehicle_type || item.room_type || 'Core Predator Track'}</span>
                </div>
              </div>

              {/* Dynamic Live Price Breakdown */}
              <div className="price-breakdown-section">
                <h3 className="breakdown-heading">Transparent Price Breakdown</h3>

                <div className="breakdown-line">
                  <span>Base Tariff ({isMultiDay ? `${durationMultiplier} Nights` : `${numPersons} Traveler(s)`})</span>
                  <span className="font-mono">₹{subtotal.toLocaleString()}</span>
                </div>

                <div className="breakdown-line">
                  <span>Forest Department Eco-Levy (5%)</span>
                  <span className="font-mono">₹{ecoLevy.toLocaleString()}</span>
                </div>

                <div className="breakdown-line-total">
                  <span className="font-bold">Total Tariff Amount</span>
                  <div className="text-right">
                    <span className="font-bold font-mono text-xl text-forest-primary block">
                      ₹{totalAmount.toLocaleString()}
                    </span>
                    <span className="text-xs text-muted">All Taxes & Permits Included</span>
                  </div>
                </div>
              </div>

              {/* Guarantee Pill */}
              <div className="sanctuary-guarantee-box">
                <ShieldCheck size={18} className="text-forest-primary flex-shrink-0" />
                <span className="guarantee-text">Official Nagarhole Wildlife Department E-Permit Guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .booking-page-root {
          min-height: 85vh;
        }
        .booking-page-grid {
          display: grid;
          grid-template-columns: 1.4fr 1fr;
          gap: 2.5rem;
          align-items: flex-start;
        }
        .form-section-card {
          padding: 1.8rem;
          border-radius: var(--radius-lg);
        }
        .form-section-title {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-size: 1.15rem;
          font-weight: 800;
          color: var(--text-heading);
          margin-bottom: 1.25rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid var(--border-light);
        }
        .form-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.2rem;
        }
        .input-with-icon {
          position: relative;
        }
        .input-inner-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
        }
        .modern-input.pl-icon {
          padding-left: 38px;
        }
        .input-error {
          border-color: #ef4444 !important;
          background: #fef2f2 !important;
        }
        .field-error-msg {
          font-size: 0.75rem;
          color: #ef4444;
          font-weight: 600;
          margin-top: 0.3rem;
          display: block;
        }
        .shift-selector-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        .shift-option-box {
          background: var(--bg-surface-subtle);
          border: 1px solid var(--border-light);
          padding: 1rem;
          border-radius: var(--radius-md);
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 0.25rem;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
        }
        .shift-option-box:hover {
          border-color: var(--forest-primary);
        }
        .shift-option-box.active {
          border-color: var(--forest-primary);
          background: #f0fdf4;
          box-shadow: 0 0 0 1px var(--forest-primary);
        }
        .shift-box-header {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }
        .shift-title {
          font-size: 0.95rem;
          color: var(--text-heading);
        }
        .shift-timing {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--forest-primary);
        }
        .shift-tag {
          font-size: 0.72rem;
          color: var(--text-muted);
        }
        .slot-capacity-status-banner {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.85rem 1.1rem;
          border-radius: var(--radius-md);
          font-size: 0.86rem;
          margin-bottom: 1.25rem;
        }
        .slot-capacity-status-banner.available {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          color: #166534;
        }
        .slot-capacity-status-banner.soldout {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #991b1b;
        }
        .payment-method-selector-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.85rem;
        }
        .payment-mode-box {
          background: var(--bg-surface-subtle);
          border: 1px solid var(--border-light);
          padding: 1rem 0.85rem;
          border-radius: var(--radius-md);
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 0.35rem;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
        }
        .payment-mode-box:hover {
          border-color: var(--forest-primary);
        }
        .payment-mode-box.active {
          border-color: var(--forest-primary);
          background: #f0fdf4;
          box-shadow: 0 0 0 1px var(--forest-primary);
        }
        .pm-header {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }
        .pm-title {
          font-size: 0.88rem;
          color: var(--text-heading);
        }
        .pm-sub {
          font-size: 0.72rem;
          color: var(--text-secondary);
          line-height: 1.35;
        }
        .submit-booking-cta {
          height: 52px;
          font-size: 1.05rem;
          font-weight: 700;
        }
        .auth-prompt-banner {
          display: flex;
          align-items: flex-start;
          gap: 0.85rem;
          background: #fffbeb;
          border: 1px solid #fde68a;
          padding: 1rem 1.2rem;
          border-radius: var(--radius-md);
        }
        /* Sticky Summary Card */
        .sticky-summary-card {
          position: sticky;
          top: 96px;
          border-radius: var(--radius-xl);
          overflow: hidden;
          box-shadow: var(--shadow-md);
        }
        .summary-media-wrap {
          position: relative;
          width: 100%;
          height: 220px;
          overflow: hidden;
        }
        .summary-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 20%;
        }
        .summary-body {
          padding: 1.6rem;
        }
        .summary-item-name {
          font-size: 1.35rem;
          font-weight: 800;
          color: var(--text-heading);
          margin-bottom: 0.25rem;
        }
        .summary-item-location {
          font-size: 0.86rem;
          margin-bottom: 1rem;
        }
        .summary-features-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 1.25rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--border-light);
        }
        .summary-feature-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          background: var(--bg-surface-subtle);
          border: 1px solid var(--border-light);
          padding: 0.3rem 0.65rem;
          border-radius: var(--radius-sm);
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--text-secondary);
        }
        .price-breakdown-section {
          background: var(--bg-surface-subtle);
          border: 1px solid var(--border-light);
          padding: 1.1rem;
          border-radius: var(--radius-md);
          margin-bottom: 1rem;
        }
        .breakdown-heading {
          font-size: 0.8rem;
          font-weight: 800;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-bottom: 0.75rem;
        }
        .breakdown-line {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin-bottom: 0.45rem;
        }
        .breakdown-line-total {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 0.65rem;
          border-top: 1px dashed var(--border-light);
          margin-top: 0.45rem;
        }
        .sanctuary-guarantee-box {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          padding: 0.75rem 0.95rem;
          border-radius: var(--radius-sm);
          font-size: 0.78rem;
          color: #166534;
          font-weight: 600;
        }

        @media (max-width: 960px) {
          .booking-page-grid { grid-template-columns: 1fr; }
          .sticky-summary-card { position: static; }
          .form-grid-2 { grid-template-columns: 1fr; }
          .shift-selector-grid { grid-template-columns: 1fr; }
          .payment-method-selector-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default BookingPage;
