import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Calendar,
  Users,
  Ticket,
  Printer,
  Compass,
  X,
  ShieldCheck,
  ArrowRight,
  MapPin,
  Sparkles
} from 'lucide-react';

const BookingSuccessModal = ({ isOpen, onClose, booking, onViewPass }) => {
  const navigate = useNavigate();

  if (!isOpen || !booking) return null;

  const id = booking._id || booking.id;
  const permitId = booking.ticket_number || `WT-${id ? id.substring(0, 6).toUpperCase() : 'CONFIRMED'}`;

  const scheduleDate =
    booking.from_date && booking.to_date
      ? `${new Date(booking.from_date).toLocaleDateString([], { month: 'short', day: 'numeric' })} – ${new Date(booking.to_date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}`
      : booking.booking_date
      ? new Date(booking.booking_date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
      : 'Schedule confirmed on permit';

  const typeIcon =
    booking.item_type === 'Safari' ? '🐘' :
    booking.item_type === 'Stay' ? '🏕️' :
    booking.item_type === 'Package' ? '🧭' : '🌿';

  const handleViewPassClick = () => {
    if (onViewPass) {
      onViewPass(booking);
    } else if (id) {
      navigate(`/boarding-pass/${id}`);
      onClose();
    }
  };

  const handleGoToTrips = () => {
    navigate('/trips');
    onClose();
  };

  return (
    <div className="modal-overlay success-modal-overlay" onClick={onClose}>
      <div
        className="modal-content-box booking-success-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          <X size={18} />
        </button>

        {/* 1. Success Animated Icon & Badge */}
        <div className="success-header-center">
          <div className="success-icon-ring">
            <CheckCircle2 size={38} className="success-check-svg" />
          </div>
          <div className="success-banner-pill">
            <ShieldCheck size={13} />
            <span>CONFIRMED RESERVATION</span>
          </div>
          <h2 className="success-heading-text">Your Booking is Confirmed!</h2>
          <p className="success-subheading-text">
            Your wildlife permit voucher has been officially issued and registered with Nagarhole Forest Range.
          </p>
        </div>

        {/* 2. Compact Booking Summary Card */}
        <div className="success-summary-box">
          <div className="summary-box-top">
            <span className={`summary-type-tag ${booking.item_type?.toLowerCase() || 'safari'}`}>
              <span>{typeIcon}</span>
              <span>{booking.item_type?.toUpperCase() || 'SAFARI'} EXPEDITION</span>
            </span>
            <span className="summary-status-badge">✓ Confirmed</span>
          </div>

          <div className="summary-title-price-row">
            <div>
              <h3 className="summary-item-name">{booking.item_name}</h3>
              <p className="summary-duration-text">
                {booking.duration || (booking.item_type === 'Stay' ? 'Luxury Eco-Stay' : '3.5 Hours Morning / Evening')}
              </p>
            </div>
            <div className="summary-price-col">
              <span className="summary-amount font-mono">
                ₹{(booking.total_price || 0).toLocaleString()}
              </span>
              <span className="summary-paid-pill">● Paid</span>
            </div>
          </div>

          <div className="summary-meta-grid">
            <div className="summary-meta-item">
              <Calendar size={14} className="meta-icon text-forest" />
              <div>
                <span className="summary-meta-label">Date</span>
                <span className="summary-meta-val">{scheduleDate}</span>
              </div>
            </div>

            <div className="summary-meta-item">
              <Users size={14} className="meta-icon text-gold" />
              <div>
                <span className="summary-meta-label">Travelers</span>
                <span className="summary-meta-val">{booking.num_persons || 1} Guest(s) • {booking.tourist_name}</span>
              </div>
            </div>
          </div>

          <div className="summary-permit-bar font-mono">
            <span className="permit-lead">🎟 E-PERMIT ID:</span>
            <span className="permit-code">{permitId}</span>
          </div>
        </div>

        {/* 3. Action Buttons */}
        <div className="success-actions-footer">
          <button
            type="button"
            onClick={handleViewPassClick}
            className="success-btn primary"
          >
            <Printer size={16} />
            <span>View Boarding Pass</span>
          </button>

          <button
            type="button"
            onClick={handleGoToTrips}
            className="success-btn secondary"
          >
            <Ticket size={16} />
            <span>View My Trips</span>
          </button>
        </div>

      </div>

      <style>{`
        .success-modal-overlay {
          background: rgba(15, 23, 42, 0.7);
          backdrop-filter: blur(4px);
          animation: fadeInBackdrop 0.25s ease forwards;
        }

        @keyframes fadeInBackdrop {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .booking-success-modal-card {
          max-width: 540px;
          width: 92%;
          background: #ffffff;
          border-radius: 20px;
          padding: 32px 28px 28px 28px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
          border: 1px solid #e2e8f0;
          animation: scaleUpModal 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes scaleUpModal {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .success-header-center {
          text-align: center;
          margin-bottom: 20px;
        }

        .success-icon-ring {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: #ecfdf5;
          border: 4px solid #d1fae5;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 12px auto;
          color: #059669;
          animation: popSuccess 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }

        @keyframes popSuccess {
          0% { transform: scale(0.5); opacity: 0; }
          70% { transform: scale(1.15); }
          100% { transform: scale(1); opacity: 1; }
        }

        .success-banner-pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          color: #1b4332;
          background: #e8f5e9;
          padding: 2px 10px;
          border-radius: 12px;
          margin-bottom: 8px;
        }

        .success-heading-text {
          font-family: var(--font-heading, 'Outfit', sans-serif);
          font-size: 1.45rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 6px 0;
          line-height: 1.25;
        }

        .success-subheading-text {
          font-size: 0.86rem;
          color: #64748b;
          margin: 0 auto;
          max-width: 420px;
          line-height: 1.45;
        }

        /* Summary Box */
        .success-summary-box {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 16px 18px;
          margin-bottom: 24px;
        }

        .summary-box-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .summary-type-tag {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 0.7rem;
          font-weight: 800;
          letter-spacing: 0.06em;
          padding: 2px 8px;
          border-radius: 5px;
        }

        .summary-type-tag.safari { background: #e8f5e9; color: #1b4332; }
        .summary-type-tag.stay { background: #e0f2fe; color: #0369a1; }
        .summary-type-tag.package { background: #fef3c7; color: #b45309; }
        .summary-type-tag.guide { background: #f3e8ff; color: #7e22ce; }

        .summary-status-badge {
          font-size: 0.74rem;
          font-weight: 700;
          color: #059669;
          background: #ecfdf5;
          padding: 2px 8px;
          border-radius: 10px;
          border: 1px solid #a7f3d0;
        }

        .summary-title-price-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
          padding-bottom: 12px;
          border-bottom: 1px solid #e2e8f0;
          margin-bottom: 12px;
        }

        .summary-item-name {
          font-family: var(--font-heading, 'Outfit', sans-serif);
          font-size: 1.15rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 2px 0;
        }

        .summary-duration-text {
          font-size: 0.78rem;
          color: #64748b;
          margin: 0;
        }

        .summary-price-col {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }

        .summary-amount {
          font-size: 1.25rem;
          font-weight: 800;
          color: #1b4332;
        }

        .summary-paid-pill {
          font-size: 0.7rem;
          font-weight: 700;
          color: #059669;
        }

        .summary-meta-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-bottom: 12px;
        }

        .summary-meta-item {
          display: flex;
          align-items: flex-start;
          gap: 7px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 8px 10px;
        }

        .meta-icon.text-forest { color: #1b4332; }
        .meta-icon.text-gold { color: #d97706; }

        .summary-meta-label {
          display: block;
          font-size: 0.65rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #64748b;
        }

        .summary-meta-val {
          font-size: 0.8rem;
          font-weight: 600;
          color: #0f172a;
        }

        .summary-permit-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #fef3c7;
          border: 1px solid #fde68a;
          border-radius: 8px;
          padding: 7px 12px;
          font-size: 0.8rem;
        }

        .permit-lead {
          color: #92400e;
          font-weight: 700;
        }

        .permit-code {
          color: #78350f;
          font-weight: 800;
        }

        /* Actions Footer */
        .success-actions-footer {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 12px;
        }

        .success-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          padding: 11px 16px;
          border-radius: 10px;
          font-size: 0.88rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: inherit;
        }

        .success-btn.primary {
          background: #1b4332;
          color: #ffffff;
          border: none;
          box-shadow: 0 4px 12px rgba(27, 67, 50, 0.2);
        }

        .success-btn.primary:hover {
          background: #143527;
          transform: translateY(-1px);
        }

        .success-btn.secondary {
          background: #ffffff;
          color: #1e293b;
          border: 1px solid #cbd5e1;
        }

        .success-btn.secondary:hover {
          background: #f1f5f9;
          border-color: #94a3b8;
        }

        @media (max-width: 540px) {
          .booking-success-modal-card {
            padding: 24px 18px 20px 18px;
          }
          .summary-meta-grid {
            grid-template-columns: 1fr;
          }
          .success-actions-footer {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default BookingSuccessModal;
