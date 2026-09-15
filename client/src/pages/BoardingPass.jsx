import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Printer,
  ArrowLeft,
  Calendar,
  Users,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Ticket,
  Home,
  RotateCcw,
  Compass,
  Clock
} from 'lucide-react';

const BoardingPass = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (bookingId) {
      fetchBookingDetails();
    } else {
      setError('Invalid booking identifier provided.');
      setLoading(false);
    }
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getBookingById(bookingId);
      if (res && res.success && res.data) {
        setBooking(res.data);
      } else {
        setError('Booking reservation not found in the sanctuary registry.');
      }
    } catch (err) {
      console.error('Error fetching boarding pass:', err);
      setError(err.message || 'Unable to retrieve your boarding pass details.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="boarding-pass-page-root">
        <div className="pass-container max-w-xl mx-auto py-12 px-4">
          <div className="pass-skeleton-card">
            <div className="skeleton-line h-14 w-full shimmer mb-4" />
            <div className="skeleton-line h-8 w-3/4 shimmer mb-6" />
            <div className="skeleton-line h-32 w-full shimmer mb-6" />
            <div className="skeleton-line h-12 w-48 shimmer mx-auto" />
          </div>
        </div>
        <style>{`
          .boarding-pass-page-root {
            min-height: calc(100vh - 80px);
            background: #f8fafc;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .pass-skeleton-card {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 16px;
            padding: 32px;
            width: 100%;
            max-width: 580px;
          }
          .shimmer {
            background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
            border-radius: 8px;
          }
          @keyframes shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}</style>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="boarding-pass-page-root">
        <div className="pass-error-card">
          <div className="error-icon-box">
            <AlertCircle size={40} className="text-danger" />
          </div>
          <h2 className="error-title">Boarding Pass Not Found</h2>
          <p className="error-desc">
            {error || "We couldn't locate this wildlife reservation permit. Please check your trips dashboard."}
          </p>
          <div className="error-actions">
            <button onClick={fetchBookingDetails} className="action-btn secondary">
              <RotateCcw size={15} />
              <span>Retry</span>
            </button>
            <Link to="/trips" className="action-btn primary">
              <Ticket size={15} />
              <span>Go to My Trips</span>
            </Link>
          </div>
        </div>
        <style>{`
          .boarding-pass-page-root {
            min-height: calc(100vh - 80px);
            background: #f8fafc;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 32px 16px;
          }
          .pass-error-card {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 16px;
            padding: 40px 32px;
            max-width: 460px;
            text-align: center;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
          }
          .error-icon-box {
            width: 64px;
            height: 64px;
            border-radius: 50%;
            background: #fef2f2;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 16px auto;
          }
          .error-title {
            font-size: 1.3rem;
            font-weight: 800;
            color: #0f172a;
            margin: 0 0 8px 0;
          }
          .error-desc {
            font-size: 0.88rem;
            color: #64748b;
            line-height: 1.5;
            margin: 0 0 24px 0;
          }
          .error-actions {
            display: flex;
            justify-content: center;
            gap: 12px;
          }
          .action-btn {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 9px 16px;
            border-radius: 8px;
            font-weight: 700;
            font-size: 0.85rem;
            text-decoration: none;
            cursor: pointer;
            border: none;
          }
          .action-btn.primary { background: #1b4332; color: #ffffff; }
          .action-btn.secondary { background: #ffffff; color: #334155; border: 1px solid #cbd5e1; }
        `}</style>
      </div>
    );
  }

  const isCancelled = booking.status === 'Cancelled';
  const scheduleDate =
    booking.from_date && booking.to_date
      ? `${new Date(booking.from_date).toLocaleDateString([], { month: 'short', day: 'numeric' })} – ${new Date(booking.to_date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}`
      : booking.booking_date
      ? new Date(booking.booking_date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
      : 'Confirmed on permit';

  const permitId = booking.ticket_number || `WT-${booking._id.substring(0, 6).toUpperCase()}`;

  return (
    <div className="boarding-pass-page-root">
      {/* Top Floating Control Bar (Hidden during print) */}
      <div className="pass-top-toolbar no-print">
        <div className="pass-toolbar-container">
          <Link to="/trips" className="toolbar-back-btn">
            <ArrowLeft size={16} />
            <span>Back to My Trips</span>
          </Link>
          <div className="toolbar-actions">
            <button onClick={handlePrint} className="print-cta-btn">
              <Printer size={16} />
              <span>Print Official Boarding Pass</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Printable Ticket Container */}
      <div className="pass-canvas-wrap">
        <div className="official-pass-document" id="printable-boarding-pass">
          
          {/* Header Banner */}
          <div className="pass-header-section">
            <div className="pass-brand-row">
              <div className="pass-brand-title-wrap">
                <span className="brand-leaf-icon">🌿</span>
                <span className="pass-brand-main">WILDTOUR KARNATAKA</span>
              </div>
              <div className="pass-official-pill">
                <ShieldCheck size={14} />
                <span>OFFICIAL SANCTUARY PERMIT</span>
              </div>
            </div>
            <p className="pass-header-caption">
              Nagarhole (Rajiv Gandhi) National Park & Kabini Tiger Reserve • Forest Dept. Range Office
            </p>
          </div>

          {/* Body Section */}
          <div className="pass-body-section">
            
            {/* Experience Headline & Status */}
            <div className="pass-exp-headline-row">
              <div className="pass-exp-left">
                <span className="pass-mini-label">{booking.item_type?.toUpperCase() || 'SAFARI'} RESERVATION</span>
                <h1 className="pass-item-title">{booking.item_name}</h1>
                <div className="pass-permit-badge font-mono">
                  <span>PERMIT VOUCHER: <strong>{permitId}</strong></span>
                </div>
              </div>

              <div className="pass-status-right">
                <span className={`pass-status-tag ${booking.status?.toLowerCase() || 'confirmed'}`}>
                  {isCancelled ? '✕ CANCELLED' : '✓ CONFIRMED'}
                </span>
                <span className="pass-price-tariff font-mono font-bold">
                  ₹{(booking.total_price || 0).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Detailed Metadata Grid */}
            <div className="pass-info-grid">
              <div className="pass-grid-cell">
                <span className="cell-label">LEAD TRAVELER</span>
                <p className="cell-value font-bold">{booking.tourist_name || user?.name || 'Traveler'}</p>
                <span className="cell-sub">{booking.user?.email || user?.email || 'Registered Guest'}</span>
              </div>

              <div className="pass-grid-cell">
                <span className="cell-label">TOTAL ADMISSIONS</span>
                <p className="cell-value font-bold">{booking.num_persons || 1} Guest(s)</p>
                <span className="cell-sub">Reserved Vehicle Allocation</span>
              </div>

              <div className="pass-grid-cell">
                <span className="cell-label">SCHEDULE / DATES</span>
                <p className="cell-value font-bold">{scheduleDate}</p>
                <span className="cell-sub">Reporting: 05:30 AM / 03:00 PM</span>
              </div>

              <div className="pass-grid-cell">
                <span className="cell-label">PAYMENT SETTLEMENT</span>
                <p className="cell-value font-bold text-forest">
                  {isCancelled ? 'Refund Processed' : `PAID (${booking.payment_method || 'UPI/Card'})`}
                </p>
                <span className="cell-sub">Official Tax Invoice Included</span>
              </div>

              <div className="pass-grid-cell full-width">
                <span className="cell-label">GATE CHECKPOST & CHECK-IN POINT</span>
                <p className="cell-value font-bold">
                  Dammanakatte Forest Reception & Gate Checkpost, Kabini Range, HD Kote, Karnataka 571114
                </p>
              </div>
            </div>

            {/* QR Code, Barcode & Instructions Strip */}
            <div className="pass-barcode-gate-strip">
              <div className="pass-qr-container">
                <div className="simulated-qr-box">
                  <div className="qr-marker top-left" />
                  <div className="qr-marker top-right" />
                  <div className="qr-marker bottom-left" />
                  <div className="qr-center-box" />
                  <span className="qr-watermark font-mono">{permitId.slice(0, 9)}</span>
                </div>
                <span className="qr-scan-hint">Ranger Gate Scanner</span>
              </div>

              <div className="pass-ranger-guidelines">
                <h4 className="guidelines-title">Sanctuary Gate Clearance Instructions:</h4>
                <ul className="guidelines-list">
                  <li>Present this physical printout or digital boarding pass at the Dammanakatte Range Counter 30 minutes prior to departure.</li>
                  <li>All adult passengers must carry a valid original Government Photo ID (Aadhaar, Passport, or Driving License).</li>
                  <li>Plastic bottles, drone photography, and stepping out of vehicles inside sanctuary zones are strictly prohibited by Karnataka Forest Department rules.</li>
                </ul>
              </div>
            </div>

            {/* Verification Barcode Line */}
            <div className="pass-bottom-barcode-row">
              <div className="simulated-barcode-bars" />
              <div className="barcode-id-row font-mono">
                <span>*WT-{booking._id.toUpperCase()}*</span>
              </div>
            </div>

          </div>

          {/* Pass Footer */}
          <div className="pass-footer-strip">
            <span>Official Wild Tour Reservation Document • Forest Department Helpdesk: +91 94808 05000</span>
          </div>

        </div>
      </div>

      <style>{`
        .boarding-pass-page-root {
          background-color: #f1f5f9;
          min-height: 100vh;
          padding: 0 0 60px 0;
          color: #0f172a;
        }

        .pass-top-toolbar {
          background: #ffffff;
          border-bottom: 1px solid #e2e8f0;
          padding: 12px 24px;
          position: sticky;
          top: 0;
          z-index: 50;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
        }

        .pass-toolbar-container {
          max-width: 800px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .toolbar-back-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #475569;
          text-decoration: none;
          font-weight: 700;
          font-size: 0.86rem;
        }

        .toolbar-back-btn:hover { color: #1b4332; }

        .print-cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #1b4332;
          color: #ffffff;
          border: none;
          padding: 9px 18px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 0.88rem;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 8px rgba(27, 67, 50, 0.2);
        }

        .print-cta-btn:hover {
          background: #143527;
          transform: translateY(-1px);
        }

        /* Canvas Document */
        .pass-canvas-wrap {
          max-width: 800px;
          margin: 32px auto 0 auto;
          padding: 0 16px;
        }

        .official-pass-document {
          background: #ffffff;
          border: 2px solid #1b4332;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
          position: relative;
        }

        .pass-header-section {
          background: #1b4332;
          color: #ffffff;
          padding: 20px 28px;
          border-bottom: 2px dashed rgba(255, 255, 255, 0.3);
        }

        .pass-brand-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;
        }

        .pass-brand-title-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .brand-leaf-icon { font-size: 1.2rem; }

        .pass-brand-main {
          font-family: var(--font-heading, 'Outfit', sans-serif);
          font-size: 1.25rem;
          font-weight: 900;
          letter-spacing: 0.08em;
        }

        .pass-official-pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: rgba(255, 255, 255, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.3);
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.06em;
          padding: 4px 10px;
          border-radius: 20px;
        }

        .pass-header-caption {
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.85);
          margin: 0;
        }

        .pass-body-section {
          padding: 28px;
        }

        .pass-exp-headline-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
          padding-bottom: 20px;
          border-bottom: 1px solid #e2e8f0;
          margin-bottom: 22px;
        }

        .pass-mini-label {
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          color: #1b4332;
          background: #e8f5e9;
          padding: 2px 8px;
          border-radius: 4px;
          display: inline-block;
          margin-bottom: 6px;
        }

        .pass-item-title {
          font-family: var(--font-heading, 'Outfit', sans-serif);
          font-size: 1.6rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 6px 0;
          line-height: 1.2;
        }

        .pass-permit-badge {
          font-size: 0.82rem;
          color: #64748b;
        }

        .pass-permit-badge strong {
          color: #92400e;
          background: #fef3c7;
          border: 1px solid rgba(251, 191, 36, 0.4);
          padding: 2px 6px;
          border-radius: 4px;
        }

        .pass-status-right {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 4px;
        }

        .pass-status-tag {
          font-size: 0.76rem;
          font-weight: 800;
          letter-spacing: 0.05em;
          padding: 4px 10px;
          border-radius: 20px;
        }

        .pass-status-tag.confirmed { background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; }
        .pass-status-tag.cancelled { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }

        .pass-price-tariff {
          font-size: 1.5rem;
          color: #1b4332;
        }

        /* Metadata Grid */
        .pass-info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 24px;
        }

        .pass-grid-cell {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 12px 16px;
        }

        .pass-grid-cell.full-width {
          grid-column: span 2;
        }

        .cell-label {
          display: block;
          font-size: 0.68rem;
          font-weight: 800;
          letter-spacing: 0.06em;
          color: #64748b;
          text-transform: uppercase;
          margin-bottom: 2px;
        }

        .cell-value {
          font-size: 0.94rem;
          color: #0f172a;
          margin: 0 0 2px 0;
        }

        .cell-sub {
          font-size: 0.74rem;
          color: #64748b;
        }

        .text-forest { color: #1b4332; }

        /* QR and Guidelines */
        .pass-barcode-gate-strip {
          display: flex;
          align-items: center;
          gap: 20px;
          background: #fdfbf7;
          border: 1px solid #fed7aa;
          border-radius: 12px;
          padding: 16px 20px;
          margin-bottom: 24px;
        }

        .pass-qr-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          flex-shrink: 0;
        }

        .simulated-qr-box {
          width: 80px;
          height: 80px;
          background: #ffffff;
          border: 2px solid #0f172a;
          border-radius: 6px;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .qr-marker {
          position: absolute;
          width: 16px;
          height: 16px;
          background: #1b4332;
        }

        .qr-marker.top-left { top: 4px; left: 4px; }
        .qr-marker.top-right { top: 4px; right: 4px; }
        .qr-marker.bottom-left { bottom: 4px; left: 4px; }

        .qr-center-box {
          width: 10px;
          height: 10px;
          background: #1b4332;
        }

        .qr-watermark {
          position: absolute;
          bottom: 2px;
          font-size: 0.52rem;
          color: #64748b;
        }

        .qr-scan-hint {
          font-size: 0.68rem;
          font-weight: 700;
          color: #475569;
        }

        .pass-ranger-guidelines {
          flex: 1;
        }

        .guidelines-title {
          font-size: 0.84rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 6px 0;
        }

        .guidelines-list {
          margin: 0;
          padding-left: 16px;
          font-size: 0.74rem;
          color: #475569;
          line-height: 1.5;
        }

        /* Simulated Barcode */
        .pass-bottom-barcode-row {
          text-align: center;
          padding-top: 12px;
          border-top: 1px dashed #cbd5e1;
        }

        .simulated-barcode-bars {
          height: 38px;
          background: repeating-linear-gradient(
            90deg,
            #0f172a,
            #0f172a 3px,
            transparent 3px,
            transparent 6px,
            #0f172a 6px,
            #0f172a 8px,
            transparent 8px,
            transparent 12px
          );
          max-width: 360px;
          margin: 0 auto 6px auto;
        }

        .barcode-id-row {
          font-size: 0.76rem;
          font-weight: 700;
          letter-spacing: 0.2em;
          color: #475569;
        }

        .pass-footer-strip {
          background: #f8fafc;
          border-top: 1px solid #e2e8f0;
          padding: 10px 24px;
          text-align: center;
          font-size: 0.72rem;
          color: #64748b;
          font-weight: 600;
        }

        /* -------------------------------------------------- */
        /* PRINT STYLESHEET                                   */
        /* -------------------------------------------------- */
        @media print {
          body {
            background: #ffffff !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          .no-print,
          nav,
          header.navbar,
          footer,
          .app-navbar,
          .pass-top-toolbar {
            display: none !important;
          }

          .boarding-pass-page-root {
            background: #ffffff !important;
            padding: 0 !important;
            min-height: auto !important;
          }

          .pass-canvas-wrap {
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          .official-pass-document {
            border: 2px solid #000000 !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            page-break-inside: avoid;
          }

          .pass-header-section {
            background: #1b4332 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
};

export default BoardingPass;
