import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api, extractErrorMessage } from '../services/api';
import confetti from 'canvas-confetti';
import BookingPassModal from './BookingPassModal';
import BookingSuccessModal from './BookingSuccessModal';
import {
  Calendar,
  Users,
  CreditCard,
  CheckCircle2,
  ShieldCheck,
  X,
  ArrowRight,
  Sparkles,
  Ticket,
  Clock,
  AlertCircle
} from 'lucide-react';

const BookingModal = ({ isOpen, onClose, item, itemType = 'Safari' }) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [passModalOpen, setPassModalOpen] = useState(false);

  // Form State
  const [touristName, setTouristName] = useState('');
  const [numPersons, setNumPersons] = useState(2);
  const [safariShift, setSafariShift] = useState('Morning');
  const [bookingDate, setBookingDate] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [paymentMode, setPaymentMode] = useState('UPI / NetBanking');
  const [idempotencyKey, setIdempotencyKey] = useState('');

  // Live Availability State
  const [slotAvailability, setSlotAvailability] = useState(null);
  const [loadingAvailability, setLoadingAvailability] = useState(false);

  // Initialize fields when modal opens
  useEffect(() => {
    if (isOpen) {
      if (user) {
        setTouristName(user.name || '');
      }
      const today = new Date();
      today.setDate(today.getDate() + 1);
      const pad = (n) => String(n).padStart(2, '0');
      const defaultDateStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

      const nextDay = new Date(today);
      nextDay.setDate(nextDay.getDate() + 2);
      const nextDayStr = `${nextDay.getFullYear()}-${pad(nextDay.getMonth() + 1)}-${pad(nextDay.getDate())}`;

      setBookingDate(defaultDateStr);
      setFromDate(defaultDateStr);
      setToDate(nextDayStr);
      setSafariShift('Morning');
      setStep(1);
      setConfirmedBooking(null);

      // Generate a fresh idempotency key per checkout initiation
      const uniqueKey = typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `ik_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      setIdempotencyKey(uniqueKey);
    }
  }, [isOpen, user]);

  // Query live availability when date or shift changes for Safaris
  useEffect(() => {
    if (isOpen && item && itemType === 'Safari' && item._id && bookingDate) {
      setLoadingAvailability(true);
      api.getSafariAvailability(item._id, bookingDate, safariShift)
        .then((res) => {
          if (res.success && res.data) {
            setSlotAvailability(res.data);
          }
        })
        .catch(() => {
          // If slot endpoint encounters error, keep null
          setSlotAvailability(null);
        })
        .finally(() => {
          setLoadingAvailability(false);
        });
    }
  }, [isOpen, item?._id, bookingDate, safariShift, itemType]);

  if (!isOpen || !item) return null;

  // Pricing Calculation based on authoritative server pricing engine rules
  const baseRate =
    item.price_per_seat ||
    item.price_per_night ||
    item.price_per_day ||
    item.price ||
    800;

  const isMultiDay = itemType === 'Stay';

  let durationMultiplier = 1;
  if (isMultiDay && fromDate && toDate) {
    const start = new Date(fromDate);
    const end = new Date(toDate);
    const diffTime = end - start;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    durationMultiplier = diffDays > 0 ? diffDays : 1;
  }

  const subtotal = isMultiDay
    ? baseRate * durationMultiplier
    : baseRate * numPersons;

  const ecoTax = Math.round(subtotal * 0.05); // 5% Forest Eco Levy
  const totalPrice = subtotal + ecoTax;

  const isOverCapacity =
    itemType === 'Safari' &&
    slotAvailability &&
    slotAvailability.remaining_seats < numPersons;

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.6 },
        colors: ['#1b4332', '#2d6a4f', '#d97706', '#10b981'],
      });
    } catch (e) {}
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!touristName.trim()) {
      showToast('Please provide the lead traveler name', 'warning');
      return;
    }

    if (isOverCapacity) {
      showToast(`Selected shift has only ${slotAvailability.remaining_seats} seat(s) remaining`, 'error');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        item_id: item._id || item.id,
        item_type: itemType,
        item_name: item.name,
        item_image: item.image_url || item.image || '',
        tourist_name: touristName.trim(),
        num_persons: Number(numPersons),
        safari_shift: itemType === 'Safari' ? safariShift : 'N/A',
        payment_mode: paymentMode,
        booking_date: isMultiDay ? fromDate : bookingDate,
        from_date: isMultiDay ? fromDate : undefined,
        to_date: isMultiDay ? toDate : undefined,
        idempotency_key: idempotencyKey,
      };

      const res = await api.createBooking(payload);
      if (res.success) {
        setConfirmedBooking(res.booking || res.data);
        triggerConfetti();
        showToast('Sanctuary Permit Reserved Successfully!', 'success');
        setStep(3); // Confirmation step
      }
    } catch (error) {
      showToast(extractErrorMessage(error), 'error');
    } finally {
      setLoading(false);
    }
  };

  if (step === 3 && confirmedBooking) {
    return (
      <>
        <BookingSuccessModal
          isOpen={true}
          onClose={onClose}
          booking={confirmedBooking}
          onViewPass={() => setPassModalOpen(true)}
        />

        {/* Boarding Pass Printable Modal */}
        <BookingPassModal
          isOpen={passModalOpen}
          onClose={() => setPassModalOpen(false)}
          booking={confirmedBooking}
        />
      </>
    );
  }

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content-box booking-modal-box" onClick={(e) => e.stopPropagation()}>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>

          {/* Modal Header */}
          <div className="booking-modal-header mb-4">
            <span className="badge badge-forest mb-1">{itemType} EXPEDITION</span>
            <h2 className="booking-item-title">{item.name}</h2>
            <p className="booking-item-meta text-secondary">
              {item.location || item.category || `${item.duration || '3.5 Hours'}`}
            </p>
          </div>

          {/* Booking Form */}
          <form onSubmit={handleBookingSubmit}>
            {/* Lead Traveler */}
            <div className="form-group">
              <label className="form-label">Lead Traveler Name</label>
              <input
                type="text"
                required
                placeholder="Enter full name for sanctuary permit"
                value={touristName}
                onChange={(e) => setTouristName(e.target.value)}
                className="modern-input"
              />
            </div>

            {/* Safari Shift Selector (Safaris Only) */}
            {itemType === 'Safari' && (
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={14} className="text-gold-primary" />
                  Select Safari Shift & Timing
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => setSafariShift('Morning')}
                    className={`payment-option-pill ${safariShift === 'Morning' ? 'active' : ''}`}
                    style={{ padding: '0.75rem', flexDirection: 'column', alignItems: 'flex-start' }}
                  >
                    <strong style={{ fontSize: '0.9rem' }}>🌅 Morning Dawn Trail</strong>
                    <span style={{ fontSize: '0.75rem', color: 'rgba(27,67,50,0.7)' }}>06:00 AM - 09:30 AM</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSafariShift('Evening')}
                    className={`payment-option-pill ${safariShift === 'Evening' ? 'active' : ''}`}
                    style={{ padding: '0.75rem', flexDirection: 'column', alignItems: 'flex-start' }}
                  >
                    <strong style={{ fontSize: '0.9rem' }}>🐆 Evening Predator Drive</strong>
                    <span style={{ fontSize: '0.75rem', color: 'rgba(27,67,50,0.7)' }}>03:30 PM - 06:30 PM</span>
                  </button>
                </div>
              </div>
            )}

            {/* Dates & Persons */}
            <div className="form-grid-2">
              {isMultiDay ? (
                <>
                  <div className="form-group">
                    <label className="form-label">Check-in Date</label>
                    <input
                      type="date"
                      required
                      value={fromDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setFromDate(e.target.value)}
                      className="modern-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Check-out Date</label>
                    <input
                      type="date"
                      required
                      value={toDate}
                      min={fromDate || new Date().toISOString().split('T')[0]}
                      onChange={(e) => setToDate(e.target.value)}
                      className="modern-input"
                    />
                  </div>
                </>
              ) : (
                <div className="form-group">
                  <label className="form-label">Safari Schedule Date</label>
                  <input
                    type="date"
                    required
                    value={bookingDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="modern-input"
                  />
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Number of Guests</label>
                <select
                  value={numPersons}
                  onChange={(e) => setNumPersons(Number(e.target.value))}
                  className="modern-input"
                >
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={n}>
                      {n} {n === 1 ? 'Guest' : 'Guests'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Real-time Capacity Status Indicator */}
            {itemType === 'Safari' && slotAvailability && (
              <div
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: isOverCapacity
                    ? 'rgba(239, 68, 68, 0.1)'
                    : 'rgba(27, 67, 50, 0.08)',
                  color: isOverCapacity ? '#ef4444' : '#1b4332',
                  border: `1px solid ${isOverCapacity ? 'rgba(239,68,68,0.2)' : 'rgba(27,67,50,0.15)'}`
                }}
              >
                {isOverCapacity ? (
                  <>
                    <AlertCircle size={16} />
                    <strong>Capacity Alert:</strong> Only {slotAvailability.remaining_seats} of {slotAvailability.capacity} seats remaining for this shift.
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} className="text-forest-primary" />
                    <span>
                      Live Slot Availability: <strong>{slotAvailability.remaining_seats}</strong> seats remaining ({slotAvailability.booked_seats}/{slotAvailability.capacity} booked)
                    </span>
                  </>
                )}
              </div>
            )}

            {/* Payment Mode Selector */}
            <div className="form-group">
              <label className="form-label">Select Payment Channel</label>
              <div className="payment-options-grid">
                {['UPI / NetBanking', 'Credit/Debit Card', 'Pay on Arrival'].map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMode(method)}
                    className={`payment-option-pill ${paymentMode === method ? 'active' : ''}`}
                  >
                    <CreditCard size={15} />
                    <span>{method}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Transparent Price Breakdown */}
            <div className="price-breakdown-box mb-4">
              <div className="breakdown-row">
                <span>Base Tariff ({isMultiDay ? `${durationMultiplier} Nights` : `${numPersons} Guest(s)`})</span>
                <span className="font-mono">₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="breakdown-row">
                <span>Forest Eco-Conservation Levy (5%)</span>
                <span className="font-mono">₹{ecoTax.toLocaleString()}</span>
              </div>
              <div className="breakdown-total-row">
                <span className="font-bold">Total Estimated Amount</span>
                <span className="font-bold font-mono text-forest-primary total-amount-val">
                  ₹{totalPrice.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Submit CTA */}
            <button
              type="submit"
              disabled={loading || isOverCapacity}
              className="btn-primary w-full btn-lg"
            >
              <span>{loading ? 'Confirming Sanctuary Reservation...' : `Confirm & Reserve Permit — ₹${totalPrice.toLocaleString()}`}</span>
              <ArrowRight size={18} />
            </button>
          </form>
        </div>
      </div>

      {/* Boarding Pass Printable Modal */}
      {confirmedBooking && (
        <BookingPassModal
          isOpen={passModalOpen}
          onClose={() => setPassModalOpen(false)}
          booking={confirmedBooking}
        />
      )}

      <style>{`
        .booking-modal-box {
          max-width: 540px;
        }
        .booking-item-title {
          font-size: 1.5rem;
          color: var(--text-heading);
          margin: 0.2rem 0;
        }
        .payment-options-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.5rem;
        }
        .payment-option-pill {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.35rem;
          padding: 0.65rem 0.5rem;
          background: #ffffff;
          border: 1px solid var(--border-light);
          border-radius: var(--radius-sm);
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-body);
          cursor: pointer;
        }
        .payment-option-pill:hover {
          border-color: var(--forest-primary);
          background: var(--forest-subtle);
        }
        .payment-option-pill.active {
          border-color: var(--forest-primary);
          background: var(--forest-subtle);
          color: var(--forest-primary);
        }
        .price-breakdown-box {
          background-color: var(--bg-surface-subtle);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-md);
          padding: 1.2rem;
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }
        .breakdown-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.88rem;
          color: var(--text-secondary);
        }
        .breakdown-total-row {
          display: flex;
          justify-content: space-between;
          font-size: 1.1rem;
          color: var(--text-heading);
          padding-top: 0.75rem;
          border-top: 1px solid var(--border-light);
          margin-top: 0.25rem;
        }
        .total-amount-val {
          font-size: 1.3rem;
        }

        @media (max-width: 600px) {
          .payment-options-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </>
  );
};

export default BookingModal;
