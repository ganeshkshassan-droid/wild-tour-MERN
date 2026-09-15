import React, { useState } from 'react';
import { api, extractErrorMessage } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Users,
  Calendar,
  Ticket,
  ArrowRight,
  RefreshCw,
  QrCode
} from 'lucide-react';

const AdminCheckpost = () => {
  const [ticketInput, setTicketInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(null);
  const [alreadyCheckedIn, setAlreadyCheckedIn] = useState(false);
  const { showToast } = useToast();

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    if (!ticketInput.trim()) {
      showToast('Please enter a ticket number or permit code', 'warning');
      return;
    }

    setLoading(true);
    setAlreadyCheckedIn(false);
    setBooking(null);

    try {
      const res = await api.checkInBooking(ticketInput.trim());
      if (res.success) {
        setBooking(res.booking);
        if (res.alreadyCheckedIn) {
          setAlreadyCheckedIn(true);
          showToast(res.message, 'info');
        } else {
          showToast(res.message, 'success');
        }
      }
    } catch (err) {
      const msg = extractErrorMessage(err);
      showToast(msg, 'error');
      if (err.data?.booking) {
        setBooking(err.data.booking);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSampleScan = (sampleTicket) => {
    setTicketInput(sampleTicket);
    setTimeout(() => {
      api.checkInBooking(sampleTicket)
        .then((res) => {
          setBooking(res.booking);
          if (res.alreadyCheckedIn) {
            setAlreadyCheckedIn(true);
            showToast(res.message, 'info');
          } else {
            showToast(res.message, 'success');
          }
        })
        .catch((err) => {
          showToast(extractErrorMessage(err), 'error');
        });
    }, 100);
  };

  return (
    <div className="container section-padding" style={{ minHeight: '80vh' }}>
      {/* Header */}
      <div className="section-header text-left mb-4">
        <span className="section-eyebrow">
          <ShieldCheck size={16} />
          <span>DAMMANAKATTE GATE RECEPTION</span>
        </span>
        <h1 className="section-title">Ranger Checkpost & Permit Scanner</h1>
        <p className="section-subtitle">
          Real-time gate clearance station for Nagarhole Zone A/B safaris, river cruises, and estate stays.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        {/* Left: Search & Scanner Tool */}
        <div className="white-card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <QrCode className="text-gold-primary" size={22} />
            Scan or Enter E-Permit Number
          </h3>

          <form onSubmit={handleVerify} style={{ marginBottom: '1.5rem' }}>
            <div style={{ position: 'relative', marginBottom: '1rem' }}>
              <input
                type="text"
                placeholder="e.g. WT-KABINI-001 or WT-L7K8..."
                value={ticketInput}
                onChange={(e) => setTicketInput(e.target.value.toUpperCase())}
                style={{
                  width: '100%',
                  padding: '14px 16px 14px 44px',
                  borderRadius: '12px',
                  border: '2px solid rgba(27, 67, 50, 0.2)',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  letterSpacing: '1px',
                  backgroundColor: '#f8faf6',
                  color: '#1b4332',
                  outline: 'none',
                }}
              />
              <Ticket
                size={20}
                style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'rgba(27, 67, 50, 0.5)'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !ticketInput.trim()}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                fontSize: '1rem',
                fontWeight: 700
              }}
            >
              {loading ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  Verifying Permit against Forest Ledger...
                </>
              ) : (
                <>
                  <ShieldCheck size={20} />
                  Verify & Clear for Gate Entry
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Test Permits */}
          <div style={{ marginTop: '2rem', borderTop: '1px dashed rgba(27, 67, 50, 0.15)', paddingTop: '1.25rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'rgba(27,67,50,0.6)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
              Quick Ranger Test Samples:
            </span>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => handleQuickSampleScan('WT-KABINI-001')}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(27,67,50,0.08)',
                  border: '1px solid rgba(27,67,50,0.2)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  color: '#1b4332'
                }}
              >
                WT-KABINI-001 (Confirmed)
              </button>
              <button
                type="button"
                onClick={() => handleQuickSampleScan('WT-ROYAL-002')}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(27,67,50,0.08)',
                  border: '1px solid rgba(27,67,50,0.2)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  color: '#1b4332'
                }}
              >
                WT-ROYAL-002 (Checked-In)
              </button>
            </div>
          </div>
        </div>

        {/* Right: Clearance Inspection Card */}
        <div>
          {booking ? (
            <div
              className="white-card"
              style={{
                padding: '2rem',
                borderLeft: booking.status === 'Cancelled'
                  ? '6px solid #ef4444'
                  : '6px solid #1b4332',
                boxShadow: '0 12px 32px rgba(0,0,0,0.08)'
              }}
            >
              {/* Status Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'rgba(27,67,50,0.6)', textTransform: 'uppercase' }}>
                    Gate Verification Status
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    {booking.status === 'Cancelled' ? (
                      <span className="badge badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }}>
                        <XCircle size={16} /> PERMIT CANCELLED — ENTRY FORBIDDEN
                      </span>
                    ) : booking.check_in_status === 'CHECKED_IN' ? (
                      <span className="badge badge-gold" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }}>
                        <CheckCircle2 size={16} /> ALREADY CHECKED-IN
                      </span>
                    ) : (
                      <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }}>
                        <CheckCircle2 size={16} /> APPROVED FOR GATE CLEARANCE
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.75rem', color: 'rgba(27,67,50,0.5)', display: 'block' }}>Ticket #</span>
                  <span style={{ fontWeight: 800, fontSize: '1.15rem', color: '#1b4332', letterSpacing: '0.5px' }}>
                    {booking.ticket_number}
                  </span>
                </div>
              </div>

              {/* Details Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem', backgroundColor: '#f8faf6', padding: '1.25rem', borderRadius: '12px' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'rgba(27,67,50,0.6)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <User size={13} /> Lead Traveler
                  </span>
                  <strong style={{ display: 'block', fontSize: '0.95rem', color: '#1b4332', marginTop: '2px' }}>
                    {booking.tourist_name}
                  </strong>
                  <span style={{ fontSize: '0.8rem', color: 'rgba(27,67,50,0.7)' }}>
                    {booking.tourist_phone || booking.user?.phone || 'No phone'}
                  </span>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', color: 'rgba(27,67,50,0.6)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Users size={13} /> Group Size
                  </span>
                  <strong style={{ display: 'block', fontSize: '0.95rem', color: '#1b4332', marginTop: '2px' }}>
                    {booking.num_persons} {booking.num_persons === 1 ? 'Person' : 'Persons'}
                  </strong>
                  <span style={{ fontSize: '0.8rem', color: '#d97706', fontWeight: 600 }}>
                    {booking.safari_shift || 'Standard Schedule'}
                  </span>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', color: 'rgba(27,67,50,0.6)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={13} /> Schedule Date
                  </span>
                  <strong style={{ display: 'block', fontSize: '0.95rem', color: '#1b4332', marginTop: '2px' }}>
                    {booking.booking_date ? new Date(booking.booking_date).toLocaleDateString('en-IN') : (booking.from_date ? new Date(booking.from_date).toLocaleDateString('en-IN') : 'Confirmed')}
                  </strong>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', color: 'rgba(27,67,50,0.6)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={13} /> Check-In Log
                  </span>
                  <strong style={{ display: 'block', fontSize: '0.85rem', color: '#1b4332', marginTop: '2px' }}>
                    {booking.checked_in_at ? new Date(booking.checked_in_at).toLocaleTimeString('en-IN') : 'Pending Scan'}
                  </strong>
                </div>
              </div>

              {/* Experience Item Info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderTop: '1px solid rgba(27,67,50,0.1)', paddingTop: '1rem' }}>
                {booking.item_image && (
                  <img
                    src={booking.item_image}
                    alt={booking.item_name}
                    style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }}
                  />
                )}
                <div>
                  <span className="badge badge-forest" style={{ fontSize: '0.75rem', padding: '2px 8px', marginBottom: '2px' }}>
                    {booking.item_type}
                  </span>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: '#1b4332' }}>
                    {booking.item_name}
                  </h4>
                </div>
              </div>
            </div>
          ) : (
            <div
              className="white-card text-center"
              style={{
                padding: '3rem 2rem',
                border: '2px dashed rgba(27, 67, 50, 0.2)',
                backgroundColor: 'rgba(27, 67, 50, 0.02)',
                color: 'rgba(27, 67, 50, 0.6)'
              }}
            >
              <ShieldCheck size={48} style={{ opacity: 0.3, margin: '0 auto 1rem' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#1b4332', marginBottom: '0.5rem' }}>
                No Permit Scanned Yet
              </h3>
              <p style={{ fontSize: '0.9rem', maxWidth: '320px', margin: '0 auto' }}>
                Enter or scan a traveler's Wild Tour ticket code to verify identity, headcount, and gate clearance.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCheckpost;
