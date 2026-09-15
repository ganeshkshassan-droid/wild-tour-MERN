import React from 'react';
import { Ticket, Calendar, Users, MapPin, Printer, X, ShieldCheck, CheckCircle2, QrCode } from 'lucide-react';

const BookingPassModal = ({ isOpen, onClose, booking }) => {
  if (!isOpen || !booking) return null;

  const handlePrint = () => {
    window.print();
  };

  const scheduleDate =
    booking.from_date && booking.to_date
      ? `${new Date(booking.from_date).toLocaleDateString()} - ${new Date(booking.to_date).toLocaleDateString()}`
      : booking.booking_date
      ? new Date(booking.booking_date).toLocaleDateString()
      : 'Confirmed on permit';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-box boarding-pass-modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn no-print" onClick={onClose} aria-label="Close modal">
          <X size={18} />
        </button>

        <div className="boarding-pass-card" id="printable-pass">
          {/* Header */}
          <div className="pass-header-strip">
            <div className="pass-brand-row">
              <span className="pass-brand-title">WILDTOUR KARNATAKA</span>
              <span className="badge badge-forest">OFFICIAL E-PERMIT</span>
            </div>
            <p className="pass-sub-strip">Nagarhole (Rajiv Gandhi) National Park • Dammanakatte Gate Reception</p>
          </div>

          {/* Main Pass Content */}
          <div className="pass-main-body">
            <div className="pass-primary-info">
              <span className="pass-label">EXPEDITION NAME</span>
              <h3 className="pass-item-name">{booking.item_name}</h3>
              <span className="badge badge-gold font-mono">{booking.item_type} RESERVATION</span>
            </div>

            <div className="pass-fields-grid">
              <div className="pass-field">
                <span className="pass-label">LEAD TRAVELER</span>
                <p className="pass-val font-bold">{booking.tourist_name}</p>
              </div>

              <div className="pass-field">
                <span className="pass-label">E-PERMIT VOUCHER #</span>
                <p className="pass-val font-mono font-bold text-forest-primary">{booking.ticket_number}</p>
              </div>

              <div className="pass-field">
                <span className="pass-label">EXPEDITION SCHEDULE & TIMING</span>
                <p className="pass-val font-bold">{scheduleDate}</p>
                {booking.safari_shift && booking.safari_shift !== 'N/A' && (
                  <span className="badge badge-forest mt-1" style={{ fontSize: '0.75rem' }}>
                    {booking.safari_shift === 'Morning' ? '🌅 Morning Dawn (06:00 AM)' : '🐆 Evening Drive (03:30 PM)'}
                  </span>
                )}
              </div>

              <div className="pass-field">
                <span className="pass-label">ADMISSIONS</span>
                <p className="pass-val font-bold">{booking.num_persons} Person(s)</p>
                <span className="text-secondary" style={{ fontSize: '0.75rem' }}>Reserved Vehicle Seat(s)</span>
              </div>

              <div className="pass-field">
                <span className="pass-label">PAYMENT SETTLEMENT</span>
                <p className="pass-val font-bold text-forest-primary">PAID (₹{(booking.total_price || 0).toLocaleString()})</p>
                <span className="text-secondary" style={{ fontSize: '0.75rem' }}>{booking.payment_mode || 'UPI/Card'}</span>
              </div>

              <div className="pass-field">
                <span className="pass-label">GATE ADMISSION POINT</span>
                <p className="pass-val text-forest-light font-bold">Dammanakatte Zone Checkpost</p>
                <span className="text-secondary" style={{ fontSize: '0.75rem' }}>Reporting: 30m prior</span>
              </div>
            </div>


            {/* Simulated QR & Gate Notice */}
            <div className="pass-qr-row">
              <div className="qr-box">
                <div className="simulated-qr">
                  <div className="qr-corner top-left" />
                  <div className="qr-corner top-right" />
                  <div className="qr-corner bottom-left" />
                  <div className="qr-center-dot" />
                  <span className="qr-id-text font-mono">{booking.ticket_number?.slice(0, 8)}</span>
                </div>
              </div>
              <div className="pass-instructions">
                <p className="font-bold text-heading text-sm mb-1">Ranger Gate Instructions:</p>
                <p className="text-secondary text-xs line-height-relaxed">
                  Present this digital boarding pass or a printed copy alongside a valid government photo ID at the Dammanakatte Gate 30 minutes prior to scheduled safari departure.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pass-actions-row mt-4 no-print">
          <button onClick={handlePrint} className="btn-primary">
            <Printer size={16} />
            <span>Print E-Permit Pass</span>
          </button>
          <button onClick={onClose} className="btn-secondary">
            Close
          </button>
        </div>
      </div>

      <style>{`
        .boarding-pass-modal-box {
          max-width: 580px;
          padding: 2rem;
        }
        .boarding-pass-card {
          background: #ffffff;
          border: 2px dashed var(--border-forest);
          border-radius: var(--radius-lg);
          overflow: hidden;
        }
        .pass-header-strip {
          background-color: var(--forest-primary);
          color: #ffffff;
          padding: 1.2rem 1.6rem;
        }
        .pass-brand-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.35rem;
        }
        .pass-brand-title {
          font-family: var(--font-heading);
          font-weight: 800;
          letter-spacing: 0.08em;
          font-size: 1.1rem;
        }
        .pass-sub-strip {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.8);
        }
        .pass-main-body {
          padding: 1.6rem;
        }
        .pass-primary-info {
          margin-bottom: 1.4rem;
          padding-bottom: 1.2rem;
          border-bottom: 1px solid var(--border-light);
        }
        .pass-label {
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--text-muted);
          font-weight: 700;
          display: block;
          margin-bottom: 2px;
        }
        .pass-item-name {
          font-size: 1.35rem;
          color: var(--text-heading);
          margin-bottom: 0.35rem;
        }
        .pass-fields-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.2rem;
          margin-bottom: 1.4rem;
        }
        .pass-val {
          font-size: 0.95rem;
          color: var(--text-heading);
        }
        .pass-qr-row {
          display: flex;
          align-items: center;
          gap: 1.2rem;
          background: var(--bg-surface-subtle);
          padding: 1rem;
          border-radius: var(--radius-md);
        }
        .qr-box {
          flex-shrink: 0;
        }
        .simulated-qr {
          width: 72px;
          height: 72px;
          background: #ffffff;
          border: 2px solid var(--text-heading);
          border-radius: var(--radius-xs);
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .qr-corner {
          position: absolute;
          width: 14px;
          height: 14px;
          background: var(--forest-primary);
        }
        .qr-corner.top-left { top: 4px; left: 4px; }
        .qr-corner.top-right { top: 4px; right: 4px; }
        .qr-corner.bottom-left { bottom: 4px; left: 4px; }
        .qr-center-dot {
          width: 8px;
          height: 8px;
          background: var(--forest-primary);
        }
        .qr-id-text {
          position: absolute;
          bottom: 2px;
          font-size: 0.55rem;
          color: var(--text-muted);
        }
        .pass-actions-row {
          display: flex;
          justify-content: center;
          gap: 0.85rem;
        }

        @media print {
          body * { visibility: hidden; }
          #printable-pass, #printable-pass * { visibility: visible; }
          #printable-pass {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: 2px solid #000000;
          }
          .no-print { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default BookingPassModal;
