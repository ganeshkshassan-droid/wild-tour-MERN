import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import BookingPassModal from '../../components/BookingPassModal';
import ConfirmModal from '../../components/ConfirmModal';
import SkeletonLoader from '../../components/SkeletonLoader';
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  Clock,
  Trash2,
  Printer,
  ChevronLeft,
  Calendar,
  DollarSign,
  User,
  Phone,
  Mail,
  Home,
  SlidersHorizontal,
  Download,
  RefreshCw,
  MoreVertical,
  X,
  Eye,
  AlertTriangle,
  Send,
  Ticket,
  ChevronRight,
  Filter,
  Check,
  Sparkles,
  ExternalLink,
  MapPin,
  Users,
  Compass,
  ArrowUpDown
} from 'lucide-react';

const AdminTripManagement = () => {
  const { showToast } = useToast();
  
  // Data States
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest' | 'price-high' | 'price-low'

  // Row Action Dropdown Menu
  const [openActionMenuId, setOpenActionMenuId] = useState(null);

  // Right-Side Details Drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerBooking, setDrawerBooking] = useState(null);

  // Modals
  const [passModalOpen, setPassModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  // Close open action menu on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.row-actions-menu-container')) {
        setOpenActionMenuId(null);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  const fetchBookings = async () => {
    setRefreshing(true);
    setError(null);
    try {
      const res = await api.getAllBookings();
      if (res && res.success) {
        setBookings(res.data || []);
      } else {
        setError('Failed to fetch bookings');
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError(err.message || 'Failed to fetch bookings');
      showToast('Error connecting to bookings service', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      const res = await api.updateBookingStatus(bookingId, {
        status: newStatus,
        payment_status: newStatus === 'Cancelled' ? 'Refunded' : 'Paid',
      });
      if (res && res.success) {
        showToast(res.message || `Booking status updated to ${newStatus}!`, 'success');
        
        // Update local state directly for instant feedback
        setBookings((prev) =>
          prev.map((b) =>
            (b._id || b.id) === bookingId
              ? { ...b, status: newStatus, payment_status: newStatus === 'Cancelled' ? 'Refunded' : 'Paid' }
              : b
          )
        );

        if (drawerBooking && (drawerBooking._id || drawerBooking.id) === bookingId) {
          setDrawerBooking((prev) => ({
            ...prev,
            status: newStatus,
            payment_status: newStatus === 'Cancelled' ? 'Refunded' : 'Paid',
          }));
        }
      }
    } catch (err) {
      showToast(err.message || 'Failed to update status', 'error');
    }
  };

  const confirmDeleteAction = async () => {
    if (!bookingToDelete) return;
    try {
      const id = bookingToDelete._id || bookingToDelete.id;
      const res = await api.deleteBooking(id);
      if (res && res.success) {
        showToast(res.message || 'Booking deleted successfully', 'success');
        setDeleteModalOpen(false);
        setBookings((prev) => prev.filter((b) => (b._id || b.id) !== id));
        if (drawerBooking && (drawerBooking._id || drawerBooking.id) === id) {
          setDrawerOpen(false);
        }
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete booking', 'error');
    }
  };

  // Compute Summary KPI Counts
  const summaryCounts = useMemo(() => {
    const total = bookings.length;
    const pending = bookings.filter((b) => b.status === 'Pending' || b.status === 'Booked').length;
    const confirmed = bookings.filter((b) => b.status === 'Confirmed').length;
    const completed = bookings.filter((b) => b.status === 'Completed').length;
    const cancelled = bookings.filter((b) => b.status === 'Cancelled').length;
    return { total, pending, confirmed, completed, cancelled };
  }, [bookings]);

  // Filter & Sort Bookings
  const filteredBookings = useMemo(() => {
    return bookings
      .filter((b) => {
        // Status filter
        if (statusFilter !== 'All') {
          if (statusFilter === 'Pending') {
            if (b.status !== 'Pending' && b.status !== 'Booked') return false;
          } else if (b.status !== statusFilter) {
            return false;
          }
        }

        // Type filter
        if (typeFilter !== 'All' && b.item_type !== typeFilter) {
          return false;
        }

        // Search Query
        if (searchTerm) {
          const q = searchTerm.toLowerCase();
          const tourist = (b.tourist_name || '').toLowerCase();
          const email = (b.user?.email || '').toLowerCase();
          const ticket = (b.ticket_number || '').toLowerCase();
          const item = (b.item_name || '').toLowerCase();
          if (!tourist.includes(q) && !email.includes(q) && !ticket.includes(q) && !item.includes(q)) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        if (sortBy === 'oldest') return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        if (sortBy === 'price-high') return (b.total_price || 0) - (a.total_price || 0);
        if (sortBy === 'price-low') return (a.total_price || 0) - (b.total_price || 0);
        return 0;
      });
  }, [bookings, statusFilter, typeFilter, searchTerm, sortBy]);

  // Safe CSV field sanitization to prevent formula injection and escape quotes
  const sanitizeCsvField = (val) => {
    if (val === null || val === undefined) return '""';
    let str = String(val);
    // Neutralize formula triggers: =, +, -, @, \t, \r
    if (/^[=+\-@\t\r]/.test(str)) {
      str = `'${str}`;
    }
    // Escape internal double quotes
    str = str.replace(/"/g, '""');
    return `"${str}"`;
  };

  // Export Bookings to CSV
  const handleExportCSV = () => {
    if (filteredBookings.length === 0) {
      showToast('No bookings to export', 'warning');
      return;
    }

    const headers = ['Permit ID', 'Tourist Name', 'Email', 'Phone', 'Item Type', 'Item Name', 'Date', 'Persons', 'Total Price', 'Payment Mode', 'Payment Status', 'Status', 'Created At'];
    const rows = filteredBookings.map((b) => [
      sanitizeCsvField(b.ticket_number || ''),
      sanitizeCsvField(b.tourist_name || ''),
      sanitizeCsvField(b.user?.email || ''),
      sanitizeCsvField(b.user?.phone || ''),
      sanitizeCsvField(b.item_type || ''),
      sanitizeCsvField(b.item_name || ''),
      sanitizeCsvField(b.booking_date ? new Date(b.booking_date).toLocaleDateString() : b.from_date ? new Date(b.from_date).toLocaleDateString() : ''),
      b.num_persons || 1,
      b.total_price || 0,
      sanitizeCsvField(b.payment_mode || 'UPI'),
      sanitizeCsvField(b.payment_status || 'Paid'),
      sanitizeCsvField(b.status || 'Confirmed'),
      sanitizeCsvField(new Date(b.createdAt || Date.now()).toISOString()),
    ]);

    const csvContent = [headers.map(sanitizeCsvField).join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `wildtour_bookings_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(`Exported ${filteredBookings.length} booking records securely!`, 'success');
  };

  const handleOpenDrawer = (booking) => {
    setDrawerBooking(booking);
    setDrawerOpen(true);
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setStatusFilter('All');
    setTypeFilter('All');
    setSortBy('newest');
  };

  const hasActiveFilters = searchTerm || statusFilter !== 'All' || typeFilter !== 'All' || sortBy !== 'newest';

  return (
    <div className="bookings-mgr-root">
      <div className="bookings-mgr-container">

        {/* ==================================================== */}
        {/* 1. PAGE HEADER                                       */}
        {/* ==================================================== */}
        <header className="bookings-header-bar">
          <div className="bookings-header-left">
            {/* Breadcrumb Navigation */}
            <div className="header-breadcrumbs">
              <Link to="/admin" className="breadcrumb-link">Admin Dashboard</Link>
              <span className="breadcrumb-sep">/</span>
              <span className="breadcrumb-current">Bookings</span>
            </div>

            <div className="header-eyebrow-row">
              <span className="header-eyebrow-pill">
                <ShieldCheck size={14} className="text-forest-primary" />
                <span>PERMIT & GUEST OPERATIONS</span>
              </span>
            </div>

            <h1 className="bookings-title">Expedition Bookings</h1>
            <p className="bookings-subtitle">
              Manage safari reservations, permits, guests, payments, and gate admission validation.
            </p>
          </div>

          <div className="bookings-header-actions">
            <button
              onClick={fetchBookings}
              disabled={refreshing}
              className="action-btn secondary"
              title="Refresh Bookings Data"
            >
              <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
              <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>

            <Link
              to="/admin/checkpost"
              className="action-btn secondary"
              style={{ borderColor: '#d97706', color: '#d97706' }}
              title="Open Ranger Gate Checkpost Scanner"
            >
              <ShieldCheck size={15} />
              <span>Gate Checkpost</span>
            </Link>

            <button
              onClick={handleExportCSV}
              className="action-btn primary"
              title="Export Current View to CSV"
            >
              <Download size={15} />
              <span>Export CSV</span>
            </button>
          </div>

        </header>

        {/* ==================================================== */}
        {/* 2. BOOKING SUMMARY CARDS                             */}
        {/* ==================================================== */}
        <section className="summary-cards-section mb-5">
          <div className="summary-cards-grid">
            {/* Total Bookings */}
            <div
              className={`summary-card ${statusFilter === 'All' ? 'active-filter' : ''}`}
              onClick={() => setStatusFilter('All')}
            >
              <div className="summary-card-top">
                <span className="summary-label">Total Bookings</span>
                <div className="summary-icon-box slate">
                  <Ticket size={18} />
                </div>
              </div>
              <div className="summary-value font-mono">{summaryCounts.total}</div>
              <div className="summary-subtext">All expedition records</div>
            </div>

            {/* Pending Approvals */}
            <div
              className={`summary-card ${summaryCounts.pending > 0 ? 'highlight-pending' : ''} ${statusFilter === 'Pending' ? 'active-filter' : ''}`}
              onClick={() => setStatusFilter('Pending')}
            >
              <div className="summary-card-top">
                <span className="summary-label">Pending</span>
                <div className="summary-icon-box amber">
                  <AlertTriangle size={18} />
                </div>
              </div>
              <div className="summary-value font-mono">{summaryCounts.pending}</div>
              <div className="summary-subtext">
                {summaryCounts.pending > 0 ? 'Requires warden review' : 'Zero pending'}
              </div>
            </div>

            {/* Confirmed */}
            <div
              className={`summary-card ${statusFilter === 'Confirmed' ? 'active-filter' : ''}`}
              onClick={() => setStatusFilter('Confirmed')}
            >
              <div className="summary-card-top">
                <span className="summary-label">Confirmed</span>
                <div className="summary-icon-box emerald">
                  <CheckCircle2 size={18} />
                </div>
              </div>
              <div className="summary-value font-mono">{summaryCounts.confirmed}</div>
              <div className="summary-subtext">Permits active & valid</div>
            </div>

            {/* Completed */}
            <div
              className={`summary-card ${statusFilter === 'Completed' ? 'active-filter' : ''}`}
              onClick={() => setStatusFilter('Completed')}
            >
              <div className="summary-card-top">
                <span className="summary-label">Completed</span>
                <div className="summary-icon-box sky">
                  <Clock size={18} />
                </div>
              </div>
              <div className="summary-value font-mono">{summaryCounts.completed}</div>
              <div className="summary-subtext">Expeditions concluded</div>
            </div>

            {/* Cancelled */}
            <div
              className={`summary-card ${statusFilter === 'Cancelled' ? 'active-filter' : ''}`}
              onClick={() => setStatusFilter('Cancelled')}
            >
              <div className="summary-card-top">
                <span className="summary-label">Cancelled</span>
                <div className="summary-icon-box rose">
                  <X size={18} />
                </div>
              </div>
              <div className="summary-value font-mono">{summaryCounts.cancelled}</div>
              <div className="summary-subtext">Refunded / Voided</div>
            </div>
          </div>
        </section>

        {/* ==================================================== */}
        {/* 3. SEARCH, FILTER & CONTROL PANEL                    */}
        {/* ==================================================== */}
        <section className="controls-panel-section mb-4">
          <div className="controls-panel-card">
            <div className="controls-top-row">
              {/* Search Bar */}
              <div className="controls-search-wrap">
                <Search size={17} className="controls-search-icon" />
                <input
                  type="text"
                  placeholder="Search by tourist name, email, permit # (e.g. WT-), or safari..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="controls-search-input"
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="controls-clear-search">
                    <X size={15} />
                  </button>
                )}
              </div>

              {/* Dropdown Filters */}
              <div className="controls-filters-group">
                {/* Status Dropdown */}
                <div className="control-select-wrap">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="control-select"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                {/* Item Type Dropdown */}
                <div className="control-select-wrap">
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="control-select"
                  >
                    <option value="All">All Categories</option>
                    <option value="Safari">Safari</option>
                    <option value="Stay">Stay</option>
                    <option value="Package">Package</option>
                    <option value="Guide">Guide</option>
                  </select>
                </div>

                {/* Sort Order Dropdown */}
                <div className="control-select-wrap">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="control-select"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="price-low">Price: Low to High</option>
                  </select>
                </div>

                {/* Reset Button */}
                {hasActiveFilters && (
                  <button onClick={clearAllFilters} className="control-reset-btn" title="Reset all filters">
                    <RefreshCw size={14} />
                    <span>Reset</span>
                  </button>
                )}
              </div>
            </div>

            {/* Quick Filter Chips Row */}
            <div className="quick-chips-row">
              <div className="quick-chips-list">
                {[
                  { label: 'All', count: summaryCounts.total },
                  { label: 'Pending', count: summaryCounts.pending },
                  { label: 'Confirmed', count: summaryCounts.confirmed },
                  { label: 'Completed', count: summaryCounts.completed },
                  { label: 'Cancelled', count: summaryCounts.cancelled },
                ].map((chip) => (
                  <button
                    key={chip.label}
                    onClick={() => setStatusFilter(chip.label)}
                    className={`quick-chip-btn ${statusFilter === chip.label ? 'active' : ''}`}
                  >
                    <span>{chip.label}</span>
                    <span className="chip-count font-mono">{chip.count}</span>
                  </button>
                ))}
              </div>

              {/* Showing count indicator */}
              <div className="results-counter font-mono">
                Showing <strong>{filteredBookings.length}</strong> of <strong>{bookings.length}</strong> bookings
              </div>
            </div>

            {/* Active Filter Tags Feedback */}
            {hasActiveFilters && (
              <div className="active-filter-tags-row">
                <span className="filter-feedback-label">Active Filters:</span>
                <div className="filter-tags-list">
                  {searchTerm && (
                    <span className="active-filter-tag">
                      <span>Query: "{searchTerm}"</span>
                      <button onClick={() => setSearchTerm('')}><X size={12} /></button>
                    </span>
                  )}
                  {statusFilter !== 'All' && (
                    <span className="active-filter-tag">
                      <span>Status: {statusFilter}</span>
                      <button onClick={() => setStatusFilter('All')}><X size={12} /></button>
                    </span>
                  )}
                  {typeFilter !== 'All' && (
                    <span className="active-filter-tag">
                      <span>Category: {typeFilter}</span>
                      <button onClick={() => setTypeFilter('All')}><X size={12} /></button>
                    </span>
                  )}
                  {sortBy !== 'newest' && (
                    <span className="active-filter-tag">
                      <span>Sort: {sortBy}</span>
                      <button onClick={() => setSortBy('newest')}><X size={12} /></button>
                    </span>
                  )}
                  <button onClick={clearAllFilters} className="clear-all-link">
                    Clear all filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ==================================================== */}
        {/* 4. BOOKINGS DATA TABLE & MOBILE CARD VIEW            */}
        {/* ==================================================== */}
        <section className="table-section mb-6">
          <div className="table-panel-card">
            {loading ? (
              <div className="p-4">
                <SkeletonLoader count={5} />
              </div>
            ) : error ? (
              <div className="empty-state-card error">
                <AlertTriangle size={42} className="text-amber mb-2" />
                <h3 className="empty-title">Unable to Load Bookings</h3>
                <p className="empty-desc">{error}</p>
                <button onClick={fetchBookings} className="action-btn primary mt-3">
                  <RefreshCw size={15} />
                  <span>Retry Connection</span>
                </button>
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="empty-state-card">
                <Ticket size={44} className="text-muted mb-2" />
                <h3 className="empty-title">No Expeditions Found</h3>
                <p className="empty-desc">
                  {hasActiveFilters
                    ? 'No bookings match your current search query or active filter settings.'
                    : 'No reservations currently exist in the sanctuary registry.'}
                </p>
                {hasActiveFilters && (
                  <button onClick={clearAllFilters} className="action-btn secondary mt-3">
                    <RefreshCw size={15} />
                    <span>Clear All Filters</span>
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Desktop Data Table */}
                <div className="table-responsive-wrapper desktop-only-table">
                  <table className="bookings-data-table">
                    <thead>
                      <tr>
                        <th className="col-permit">Booking / Permit</th>
                        <th className="col-guest">Guest Information</th>
                        <th className="col-experience">Experience</th>
                        <th className="col-schedule">Schedule Date</th>
                        <th className="col-payment">Tariff & Payment</th>
                        <th className="col-status">Admission Status</th>
                        <th className="col-actions text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBookings.map((b) => {
                        const id = b._id || b.id;
                        const isMenuOpen = openActionMenuId === id;
                        const dateStr = b.from_date && b.to_date
                          ? `${new Date(b.from_date).toLocaleDateString([], { month: 'short', day: 'numeric' })} - ${new Date(b.to_date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}`
                          : b.booking_date
                          ? new Date(b.booking_date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
                          : 'On Request';

                        return (
                          <tr
                            key={id}
                            className="booking-table-row"
                            onClick={() => handleOpenDrawer(b)}
                          >
                            {/* 1. Permit ID */}
                            <td className="col-permit">
                              <div className="permit-code-cell">
                                <span className="permit-badge font-mono">
                                  <Ticket size={12} className="permit-badge-icon" />
                                  <span>{b.ticket_number || `WT-${id.substring(0, 6).toUpperCase()}`}</span>
                                </span>
                                <span className="permit-timestamp">
                                  {new Date(b.createdAt || Date.now()).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                </span>
                              </div>
                            </td>

                            {/* 2. Guest Info */}
                            <td className="col-guest">
                              <div className="guest-info-cell">
                                <span className="guest-name">{b.tourist_name || b.user?.name || 'Explorer'}</span>
                                <span className="guest-subtext">
                                  {b.num_persons || 1} Guest(s) • {b.user?.email || b.tourist_name}
                                </span>
                              </div>
                            </td>

                            {/* 3. Experience */}
                            <td className="col-experience">
                              <div className="experience-cell">
                                <span className={`category-tag ${b.item_type?.toLowerCase() || 'safari'}`}>
                                  {b.item_type?.toUpperCase() || 'SAFARI'}
                                </span>
                                <span className="experience-title">{b.item_name}</span>
                              </div>
                            </td>

                            {/* 4. Schedule */}
                            <td className="col-schedule">
                              <div className="schedule-cell">
                                <Calendar size={13} className="schedule-icon" />
                                <span className="schedule-date">{dateStr}</span>
                              </div>
                            </td>

                            {/* 5. Payment */}
                            <td className="col-payment">
                              <div className="payment-cell">
                                <span className="payment-amount font-mono">
                                  ₹{(b.total_price || 0).toLocaleString()}
                                </span>
                                <span className={`payment-status-pill ${b.payment_status?.toLowerCase() || 'paid'}`}>
                                  <span className="payment-dot" />
                                  <span>{b.payment_status || 'Paid'}</span>
                                </span>
                              </div>
                            </td>

                            {/* 6. Admission Status (Interactive) */}
                            <td className="col-status" onClick={(e) => e.stopPropagation()}>
                              <select
                                value={b.status || 'Confirmed'}
                                onChange={(e) => handleStatusChange(id, e.target.value)}
                                className={`interactive-status-select ${
                                  b.status === 'Confirmed' ? 'confirmed' :
                                  b.status === 'Completed' ? 'completed' :
                                  b.status === 'Cancelled' ? 'cancelled' : 'pending'
                                }`}
                              >
                                <option value="Confirmed">✓ Confirmed</option>
                                <option value="Pending">⏳ Pending</option>
                                <option value="Completed">★ Completed</option>
                                <option value="Cancelled">✕ Cancelled</option>
                              </select>
                            </td>

                            {/* 7. Action Menu */}
                            <td className="col-actions text-right" onClick={(e) => e.stopPropagation()}>
                              <div className="row-actions-menu-container">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenActionMenuId(isMenuOpen ? null : id);
                                  }}
                                  className="row-menu-btn"
                                  title="Booking Actions"
                                  aria-label="Booking Actions"
                                >
                                  <MoreVertical size={16} />
                                </button>

                                {isMenuOpen && (
                                  <div className="row-dropdown-menu animate-fade-in">
                                    <button
                                      onClick={() => {
                                        handleOpenDrawer(b);
                                        setOpenActionMenuId(null);
                                      }}
                                      className="dropdown-item"
                                    >
                                      <Eye size={14} />
                                      <span>View Details</span>
                                    </button>

                                    <button
                                      onClick={() => {
                                        setSelectedBooking(b);
                                        setPassModalOpen(true);
                                        setOpenActionMenuId(null);
                                      }}
                                      className="dropdown-item"
                                    >
                                      <Printer size={14} />
                                      <span>Print Permit Pass</span>
                                    </button>

                                    <button
                                      onClick={() => {
                                        showToast(`Permit pass confirmation dispatched to ${b.user?.email || 'guest'}`, 'success');
                                        setOpenActionMenuId(null);
                                      }}
                                      className="dropdown-item"
                                    >
                                      <Send size={14} />
                                      <span>Send Email</span>
                                    </button>

                                    <div className="dropdown-divider" />

                                    {b.status !== 'Cancelled' ? (
                                      <button
                                        onClick={() => {
                                          handleStatusChange(id, 'Cancelled');
                                          setOpenActionMenuId(null);
                                        }}
                                        className="dropdown-item warning"
                                      >
                                        <X size={14} />
                                        <span>Cancel Permit</span>
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => {
                                          handleStatusChange(id, 'Confirmed');
                                          setOpenActionMenuId(null);
                                        }}
                                        className="dropdown-item"
                                      >
                                        <Check size={14} />
                                        <span>Re-activate Permit</span>
                                      </button>
                                    )}

                                    <button
                                      onClick={() => {
                                        setBookingToDelete(b);
                                        setDeleteModalOpen(true);
                                        setOpenActionMenuId(null);
                                      }}
                                      className="dropdown-item danger"
                                    >
                                      <Trash2 size={14} />
                                      <span>Delete Record</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Responsive Booking Cards (< 768px) */}
                <div className="mobile-cards-list mobile-only-view">
                  {filteredBookings.map((b) => {
                    const id = b._id || b.id;
                    const dateStr = b.from_date && b.to_date
                      ? `${new Date(b.from_date).toLocaleDateString([], { month: 'short', day: 'numeric' })} - ${new Date(b.to_date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}`
                      : b.booking_date
                      ? new Date(b.booking_date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
                      : 'On Request';

                    return (
                      <div
                        key={id}
                        className="mobile-booking-card"
                        onClick={() => handleOpenDrawer(b)}
                      >
                        <div className="mobile-card-top">
                          <span className="permit-badge font-mono">
                            <Ticket size={12} />
                            <span>{b.ticket_number || `WT-${id.substring(0, 6).toUpperCase()}`}</span>
                          </span>

                          <span className={`status-pill-small ${b.status?.toLowerCase() || 'confirmed'}`}>
                            {b.status || 'Confirmed'}
                          </span>
                        </div>

                        <div className="mobile-card-body">
                          <h4 className="mobile-guest-name">{b.tourist_name || b.user?.name || 'Explorer'}</h4>
                          <p className="mobile-item-title">{b.item_name}</p>

                          <div className="mobile-meta-row">
                            <span className="mobile-meta-item">
                              <Calendar size={13} />
                              <span>{dateStr}</span>
                            </span>
                            <span className="mobile-meta-item">
                              <Users size={13} />
                              <span>{b.num_persons || 1} Guest(s)</span>
                            </span>
                          </div>

                          <div className="mobile-price-row">
                            <span className="mobile-price font-mono">
                              ₹{(b.total_price || 0).toLocaleString()}
                            </span>
                            <span className="mobile-payment-status">
                              ● {b.payment_status || 'Paid'}
                            </span>
                          </div>
                        </div>

                        <div className="mobile-card-footer" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => {
                              setSelectedBooking(b);
                              setPassModalOpen(true);
                            }}
                            className="mobile-action-btn"
                          >
                            <Printer size={14} />
                            <span>Pass</span>
                          </button>

                          <button
                            onClick={() => handleOpenDrawer(b)}
                            className="mobile-action-btn primary"
                          >
                            <span>Details</span>
                            <ChevronRight size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </section>

      </div>

      {/* ==================================================== */}
      {/* 5. RIGHT-SIDE BOOKING DETAILS DRAWER                 */}
      {/* ==================================================== */}
      {drawerOpen && drawerBooking && (
        <div className="drawer-backdrop" onClick={() => setDrawerOpen(false)}>
          <div className="drawer-panel animate-slide-left" onClick={(e) => e.stopPropagation()}>
            
            {/* Drawer Header */}
            <div className="drawer-header">
              <div>
                <div className="drawer-eyebrow">
                  <Ticket size={14} className="text-forest-primary" />
                  <span>EXPEDITION PERMIT DOSSIER</span>
                </div>
                <h3 className="drawer-title font-mono">
                  {drawerBooking.ticket_number || `WT-${(drawerBooking._id || '').substring(0, 6).toUpperCase()}`}
                </h3>
              </div>

              <button onClick={() => setDrawerOpen(false)} className="drawer-close-btn">
                <X size={20} />
              </button>
            </div>

            {/* Drawer Content Body */}
            <div className="drawer-body">
              {/* Status Banner */}
              <div className={`drawer-status-banner ${drawerBooking.status?.toLowerCase() || 'confirmed'}`}>
                <div className="drawer-status-left">
                  <span className="status-label">Admission Status:</span>
                  <strong className="status-value">{drawerBooking.status || 'Confirmed'}</strong>
                </div>
                <select
                  value={drawerBooking.status || 'Confirmed'}
                  onChange={(e) => handleStatusChange(drawerBooking._id || drawerBooking.id, e.target.value)}
                  className="drawer-status-dropdown"
                >
                  <option value="Confirmed">Confirmed</option>
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              {/* Guest Information Section */}
              <div className="drawer-section">
                <h4 className="drawer-section-title">
                  <User size={16} />
                  <span>Primary Traveler Details</span>
                </h4>
                <div className="drawer-info-grid">
                  <div className="info-item">
                    <span className="info-lbl">Full Name</span>
                    <span className="info-val font-bold">{drawerBooking.tourist_name || drawerBooking.user?.name || 'Explorer'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-lbl">Account Email</span>
                    <span className="info-val">{drawerBooking.user?.email || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-lbl">Contact Phone</span>
                    <span className="info-val">{drawerBooking.user?.phone || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-lbl">Party Size</span>
                    <span className="info-val font-bold">{drawerBooking.num_persons || 1} Guest(s)</span>
                  </div>
                </div>
              </div>

              {/* Experience Details Section */}
              <div className="drawer-section">
                <h4 className="drawer-section-title">
                  <Compass size={16} />
                  <span>Sanctuary Reservation</span>
                </h4>

                <div className="drawer-experience-card">
                  {drawerBooking.item_image && (
                    <img
                      src={drawerBooking.item_image}
                      alt={drawerBooking.item_name}
                      className="drawer-exp-thumb"
                    />
                  )}
                  <div className="drawer-exp-info">
                    <span className="drawer-exp-badge">{drawerBooking.item_type || 'Safari'}</span>
                    <h5 className="drawer-exp-title">{drawerBooking.item_name}</h5>
                    <p className="drawer-exp-date">
                      <Calendar size={13} />
                      <span>
                        {drawerBooking.from_date && drawerBooking.to_date
                          ? `${new Date(drawerBooking.from_date).toLocaleDateString()} - ${new Date(drawerBooking.to_date).toLocaleDateString()}`
                          : drawerBooking.booking_date
                          ? new Date(drawerBooking.booking_date).toLocaleDateString()
                          : 'On Request'}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Financial & Tariff Breakdown */}
              <div className="drawer-section">
                <h4 className="drawer-section-title">
                  <DollarSign size={16} />
                  <span>Tariff & Payment Breakdown</span>
                </h4>
                <div className="drawer-info-grid">
                  <div className="info-item">
                    <span className="info-lbl">Total Tariff Paid</span>
                    <span className="info-val font-mono font-bold text-forest-primary text-lg">
                      ₹{(drawerBooking.total_price || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-lbl">Payment Mode</span>
                    <span className="info-val">{drawerBooking.payment_mode || 'UPI / NetBanking'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-lbl">Payment Status</span>
                    <span className="info-val">
                      <span className={`payment-pill ${drawerBooking.payment_status?.toLowerCase() || 'paid'}`}>
                        {drawerBooking.payment_status || 'Paid'}
                      </span>
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-lbl">Record Created</span>
                    <span className="info-val font-mono text-xs text-muted">
                      {new Date(drawerBooking.createdAt || Date.now()).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Special Requests if any */}
              {drawerBooking.special_requests && (
                <div className="drawer-section">
                  <h4 className="drawer-section-title">Special Requests / Notes</h4>
                  <p className="drawer-notes-text">{drawerBooking.special_requests}</p>
                </div>
              )}
            </div>

            {/* Drawer Footer Actions */}
            <div className="drawer-footer">
              <button
                onClick={() => {
                  setSelectedBooking(drawerBooking);
                  setPassModalOpen(true);
                }}
                className="action-btn primary w-full"
              >
                <Printer size={16} />
                <span>Print Official Permit Pass</span>
              </button>

              <button
                onClick={() => {
                  showToast(`Confirmation dispatched to ${drawerBooking.user?.email || 'guest'}`, 'success');
                }}
                className="action-btn secondary w-full mt-2"
              >
                <Send size={15} />
                <span>Resend Confirmation Email</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Boarding Pass Modal */}
      <BookingPassModal
        isOpen={passModalOpen}
        onClose={() => setPassModalOpen(false)}
        booking={selectedBooking}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDeleteAction}
        title="Delete Permit Record?"
        message={`Are you sure you want to permanently delete Permit #${bookingToDelete?.ticket_number || 'this booking'}? This action is irreversible.`}
        confirmText="Yes, Delete Record"
        danger={true}
      />

      <style>{`
        .bookings-mgr-root {
          background-color: #f8fafc;
          min-height: calc(100vh - 72px);
          padding: 32px 24px 64px 24px;
          color: #1e293b;
        }

        .bookings-mgr-container {
          max-width: 1440px;
          margin: 0 auto;
        }

        /* -------------------------------------------------- */
        /* 1. HEADER                                          */
        /* -------------------------------------------------- */
        .bookings-header-bar {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 24px;
          padding-bottom: 24px;
          border-bottom: 1px solid #e2e8f0;
          margin-bottom: 28px;
        }

        .header-breadcrumbs {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.8rem;
          margin-bottom: 6px;
        }

        .breadcrumb-link {
          color: #64748b;
          text-decoration: none;
          font-weight: 600;
        }

        .breadcrumb-link:hover {
          color: #1b4332;
        }

        .breadcrumb-sep {
          color: #cbd5e1;
        }

        .breadcrumb-current {
          color: #0f172a;
          font-weight: 700;
        }

        .header-eyebrow-row {
          margin-bottom: 6px;
        }

        .header-eyebrow-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.1em;
          color: #1b4332;
          background: #e8f5e9;
          padding: 3px 9px;
          border-radius: 20px;
          border: 1px solid #c8e6c9;
        }

        .bookings-title {
          font-family: var(--font-heading, 'Outfit', sans-serif);
          font-size: 1.85rem;
          font-weight: 800;
          letter-spacing: -0.03em;
          color: #0f172a;
          line-height: 1.2;
          margin: 0 0 4px 0;
        }

        .bookings-subtitle {
          font-size: 0.9rem;
          color: #64748b;
          margin: 0;
          line-height: 1.45;
        }

        .bookings-header-actions {
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
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
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
          grid-template-columns: repeat(5, 1fr);
          gap: 14px;
        }

        .summary-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 16px;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
        }

        .summary-card:hover {
          transform: translateY(-2px);
          border-color: #cbd5e1;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
        }

        .summary-card.active-filter {
          border-color: #1b4332;
          box-shadow: 0 0 0 2px rgba(27, 67, 50, 0.15);
        }

        .summary-card.highlight-pending {
          border-color: #fde68a;
          background: #fffdf5;
        }

        .summary-card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .summary-label {
          font-size: 0.76rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #64748b;
        }

        .summary-icon-box {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .summary-icon-box.slate { background: #f1f5f9; color: #475569; }
        .summary-icon-box.amber { background: #fef3c7; color: #d97706; }
        .summary-icon-box.emerald { background: #ecfdf5; color: #059669; }
        .summary-icon-box.sky { background: #e0f2fe; color: #0284c7; }
        .summary-icon-box.rose { background: #ffe4e6; color: #e11d48; }

        .summary-value {
          font-size: 1.65rem;
          font-weight: 800;
          color: #0f172a;
          line-height: 1.1;
          margin-bottom: 4px;
        }

        .summary-subtext {
          font-size: 0.74rem;
          color: #64748b;
          font-weight: 500;
        }

        /* -------------------------------------------------- */
        /* 3. SEARCH & CONTROLS PANEL                         */
        /* -------------------------------------------------- */
        .controls-panel-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 18px 20px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
        }

        .controls-top-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .controls-search-wrap {
          position: relative;
          flex: 1;
          min-width: 300px;
        }

        .controls-search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          pointer-events: none;
        }

        .controls-search-input {
          width: 100%;
          height: 42px;
          padding: 0 36px 0 42px;
          font-size: 0.88rem;
          border: 1px solid #cbd5e1;
          border-radius: 9px;
          outline: none;
          font-family: inherit;
          background: #ffffff;
        }

        .controls-search-input:focus {
          border-color: #1b4332;
          box-shadow: 0 0 0 3px rgba(27, 67, 50, 0.1);
        }

        .controls-clear-search {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
        }

        .controls-filters-group {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .control-select-wrap {
          position: relative;
        }

        .control-select {
          height: 42px;
          padding: 0 28px 0 14px;
          font-size: 0.84rem;
          font-weight: 600;
          color: #334155;
          border: 1px solid #cbd5e1;
          border-radius: 9px;
          background: #ffffff;
          outline: none;
          cursor: pointer;
          font-family: inherit;
        }

        .control-select:focus {
          border-color: #1b4332;
        }

        .control-reset-btn {
          height: 42px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 0 14px;
          font-size: 0.82rem;
          font-weight: 700;
          color: #64748b;
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          border-radius: 9px;
          cursor: pointer;
        }

        .control-reset-btn:hover {
          color: #0f172a;
          background: #e2e8f0;
        }

        /* Quick Chips Row */
        .quick-chips-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 14px;
          padding-top: 14px;
          border-top: 1px solid #f1f5f9;
          flex-wrap: wrap;
          gap: 10px;
        }

        .quick-chips-list {
          display: flex;
          align-items: center;
          gap: 8px;
          overflow-x: auto;
        }

        .quick-chip-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 7px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          font-size: 0.8rem;
          font-weight: 700;
          color: #475569;
          cursor: pointer;
          transition: all 0.15s ease;
          white-space: nowrap;
        }

        .quick-chip-btn:hover {
          border-color: #cbd5e1;
          color: #0f172a;
        }

        .quick-chip-btn.active {
          background: #1b4332;
          border-color: #1b4332;
          color: #ffffff;
        }

        .chip-count {
          font-size: 0.72rem;
          padding: 1px 5px;
          border-radius: 4px;
          background: rgba(0, 0, 0, 0.07);
        }

        .quick-chip-btn.active .chip-count {
          background: rgba(255, 255, 255, 0.2);
          color: #ffffff;
        }

        .results-counter {
          font-size: 0.8rem;
          color: #64748b;
        }

        /* Active Filter Tags */
        .active-filter-tags-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid #f8fafc;
          flex-wrap: wrap;
        }

        .filter-feedback-label {
          font-size: 0.75rem;
          font-weight: 700;
          color: #64748b;
        }

        .filter-tags-list {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }

        .active-filter-tag {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: #e8f5e9;
          border: 1px solid #c8e6c9;
          color: #1b4332;
          padding: 2px 8px;
          border-radius: 6px;
          font-size: 0.74rem;
          font-weight: 600;
        }

        .active-filter-tag button {
          background: none;
          border: none;
          color: #1b4332;
          cursor: pointer;
          padding: 0;
          display: flex;
          align-items: center;
        }

        .clear-all-link {
          background: none;
          border: none;
          color: #dc2626;
          font-size: 0.75rem;
          font-weight: 700;
          cursor: pointer;
          text-decoration: underline;
        }

        /* -------------------------------------------------- */
        /* 4. TABLE SECTION                                   */
        /* -------------------------------------------------- */
        .table-panel-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
          overflow: hidden;
        }

        .table-responsive-wrapper {
          overflow-x: auto;
        }

        .bookings-data-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .bookings-data-table th {
          background: #f8fafc;
          padding: 12px 18px;
          font-size: 0.74rem;
          font-weight: 800;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          border-bottom: 1px solid #e2e8f0;
          position: sticky;
          top: 0;
          z-index: 5;
        }

        .booking-table-row {
          cursor: pointer;
          transition: background 0.15s ease;
        }

        .booking-table-row:hover {
          background: #f8fafc;
        }

        .booking-table-row td {
          padding: 14px 18px;
          border-bottom: 1px solid #f1f5f9;
          font-size: 0.88rem;
          vertical-align: middle;
        }

        /* Permit Cell */
        .permit-code-cell {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .permit-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: #fef3c7;
          color: #92400e;
          border: 1px solid rgba(251, 191, 36, 0.4);
          padding: 2px 7px;
          border-radius: 6px;
          font-size: 0.76rem;
          font-weight: 800;
          width: fit-content;
        }

        .permit-timestamp {
          font-size: 0.72rem;
          color: #94a3b8;
        }

        /* Guest Cell */
        .guest-info-cell {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .guest-name {
          font-weight: 700;
          color: #0f172a;
          font-size: 0.9rem;
        }

        .guest-subtext {
          font-size: 0.76rem;
          color: #64748b;
        }

        /* Experience Cell */
        .experience-cell {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .category-tag {
          font-size: 0.68rem;
          font-weight: 800;
          letter-spacing: 0.06em;
          padding: 2px 6px;
          border-radius: 4px;
          width: fit-content;
        }

        .category-tag.safari { background: #e8f5e9; color: #1b4332; }
        .category-tag.stay { background: #e0f2fe; color: #0369a1; }
        .category-tag.package { background: #fef3c7; color: #b45309; }
        .category-tag.guide { background: #f3e8ff; color: #7e22ce; }

        .experience-title {
          font-size: 0.85rem;
          font-weight: 600;
          color: #334155;
        }

        /* Schedule Cell */
        .schedule-cell {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #475569;
          font-size: 0.82rem;
        }

        .schedule-icon {
          color: #94a3b8;
        }

        /* Payment Cell */
        .payment-cell {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .payment-amount {
          font-weight: 800;
          color: #0f172a;
          font-size: 0.92rem;
        }

        .payment-status-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 0.72rem;
          font-weight: 700;
          width: fit-content;
        }

        .payment-status-pill.paid { color: #047857; }
        .payment-status-pill.pending { color: #b45309; }
        .payment-status-pill.refunded { color: #dc2626; }

        .payment-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: currentColor;
        }

        /* Status Select */
        .interactive-status-select {
          padding: 5px 10px;
          border-radius: 7px;
          font-size: 0.78rem;
          font-weight: 700;
          border: 1px solid transparent;
          outline: none;
          cursor: pointer;
          font-family: inherit;
        }

        .interactive-status-select.confirmed {
          background: #ecfdf5;
          border-color: #a7f3d0;
          color: #047857;
        }

        .interactive-status-select.pending {
          background: #fffbeb;
          border-color: #fde68a;
          color: #b45309;
        }

        .interactive-status-select.completed {
          background: #e0f2fe;
          border-color: #bae6fd;
          color: #0369a1;
        }

        .interactive-status-select.cancelled {
          background: #fef2f2;
          border-color: #fecaca;
          color: #dc2626;
        }

        /* Action Menu */
        .row-actions-menu-container {
          position: relative;
          display: inline-block;
        }

        .row-menu-btn {
          background: none;
          border: 1px solid transparent;
          padding: 6px;
          border-radius: 6px;
          color: #64748b;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .row-menu-btn:hover {
          background: #e2e8f0;
          color: #0f172a;
        }

        .row-dropdown-menu {
          position: absolute;
          right: 0;
          top: 100%;
          margin-top: 4px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.12);
          min-width: 170px;
          z-index: 50;
          padding: 4px;
        }

        .dropdown-item {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          font-size: 0.8rem;
          font-weight: 600;
          color: #334155;
          background: none;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          text-align: left;
          font-family: inherit;
        }

        .dropdown-item:hover {
          background: #f1f5f9;
          color: #0f172a;
        }

        .dropdown-item.warning {
          color: #b45309;
        }

        .dropdown-item.warning:hover {
          background: #fffbeb;
        }

        .dropdown-item.danger {
          color: #dc2626;
        }

        .dropdown-item.danger:hover {
          background: #fef2f2;
        }

        .dropdown-divider {
          height: 1px;
          background: #f1f5f9;
          margin: 4px 0;
        }

        /* Mobile View Cards */
        .mobile-only-view { display: none; }

        .mobile-booking-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 12px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
        }

        .mobile-card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .status-pill-small {
          font-size: 0.72rem;
          font-weight: 700;
          padding: 2px 7px;
          border-radius: 4px;
        }

        .status-pill-small.confirmed { background: #ecfdf5; color: #047857; }
        .status-pill-small.pending { background: #fffbeb; color: #b45309; }
        .status-pill-small.completed { background: #e0f2fe; color: #0369a1; }
        .status-pill-small.cancelled { background: #fef2f2; color: #dc2626; }

        .mobile-guest-name {
          font-size: 1rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 2px 0;
        }

        .mobile-item-title {
          font-size: 0.85rem;
          color: #475569;
          margin: 0 0 10px 0;
        }

        .mobile-meta-row {
          display: flex;
          align-items: center;
          gap: 14px;
          font-size: 0.78rem;
          color: #64748b;
          margin-bottom: 10px;
        }

        .mobile-meta-item {
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .mobile-price-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 10px;
          border-top: 1px solid #f1f5f9;
        }

        .mobile-price {
          font-size: 1.1rem;
          font-weight: 800;
          color: #1b4332;
        }

        .mobile-payment-status {
          font-size: 0.75rem;
          font-weight: 700;
          color: #047857;
        }

        .mobile-card-footer {
          display: flex;
          gap: 8px;
          margin-top: 12px;
        }

        .mobile-action-btn {
          flex: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 8px;
          border-radius: 7px;
          font-size: 0.8rem;
          font-weight: 700;
          border: 1px solid #cbd5e1;
          background: #ffffff;
          color: #334155;
          cursor: pointer;
        }

        .mobile-action-btn.primary {
          background: #1b4332;
          border-color: #1b4332;
          color: #ffffff;
        }

        /* Empty State */
        .empty-state-card {
          padding: 56px 24px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .empty-title {
          font-size: 1.15rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 4px 0;
        }

        .empty-desc {
          font-size: 0.86rem;
          color: #64748b;
          margin: 0;
          max-width: 420px;
        }

        /* -------------------------------------------------- */
        /* 5. RIGHT-SIDE DRAWER                               */
        /* -------------------------------------------------- */
        .drawer-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.5);
          backdrop-filter: blur(4px);
          z-index: 100;
          display: flex;
          justify-content: flex-end;
        }

        .drawer-panel {
          width: 100%;
          max-width: 480px;
          height: 100%;
          background: #ffffff;
          box-shadow: -10px 0 30px rgba(0, 0, 0, 0.15);
          display: flex;
          flex-direction: column;
          overflow-y: auto;
        }

        .animate-slide-left {
          animation: slideLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes slideLeft {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }

        .drawer-header {
          padding: 24px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 1px solid #e2e8f0;
          background: #f8fafc;
        }

        .drawer-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.7rem;
          font-weight: 800;
          color: #1b4332;
          letter-spacing: 0.08em;
        }

        .drawer-title {
          font-size: 1.45rem;
          font-weight: 800;
          color: #0f172a;
          margin: 4px 0 0 0;
        }

        .drawer-close-btn {
          background: none;
          border: none;
          color: #64748b;
          cursor: pointer;
          padding: 4px;
          border-radius: 6px;
        }

        .drawer-close-btn:hover {
          background: #e2e8f0;
          color: #0f172a;
        }

        .drawer-body {
          padding: 24px;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .drawer-status-banner {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          border-radius: 10px;
          border: 1px solid transparent;
        }

        .drawer-status-banner.confirmed { background: #ecfdf5; border-color: #a7f3d0; color: #047857; }
        .drawer-status-banner.pending { background: #fffbeb; border-color: #fde68a; color: #b45309; }
        .drawer-status-banner.completed { background: #e0f2fe; border-color: #bae6fd; color: #0369a1; }
        .drawer-status-banner.cancelled { background: #fef2f2; border-color: #fecaca; color: #dc2626; }

        .drawer-status-left {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.85rem;
        }

        .drawer-status-dropdown {
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: 700;
          border: 1px solid rgba(0, 0, 0, 0.15);
          background: #ffffff;
          cursor: pointer;
        }

        .drawer-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .drawer-section-title {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-size: 0.85rem;
          font-weight: 800;
          color: #0f172a;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin: 0;
        }

        .drawer-info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 14px;
        }

        .info-item {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .info-lbl {
          font-size: 0.72rem;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .info-val {
          font-size: 0.85rem;
          color: #0f172a;
        }

        .drawer-experience-card {
          display: flex;
          align-items: center;
          gap: 14px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 12px;
        }

        .drawer-exp-thumb {
          width: 64px;
          height: 64px;
          border-radius: 8px;
          object-fit: cover;
        }

        .drawer-exp-badge {
          display: inline-block;
          font-size: 0.68rem;
          font-weight: 800;
          background: #e8f5e9;
          color: #1b4332;
          padding: 2px 6px;
          border-radius: 4px;
          margin-bottom: 3px;
        }

        .drawer-exp-title {
          font-size: 0.92rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 4px 0;
        }

        .drawer-exp-date {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 0.78rem;
          color: #64748b;
          margin: 0;
        }

        .drawer-notes-text {
          font-size: 0.85rem;
          color: #334155;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 12px;
          margin: 0;
        }

        .drawer-footer {
          padding: 20px 24px;
          border-top: 1px solid #e2e8f0;
          background: #f8fafc;
        }

        /* -------------------------------------------------- */
        /* RESPONSIVE BREAKPOINTS                             */
        /* -------------------------------------------------- */
        @media (max-width: 1200px) {
          .summary-cards-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 768px) {
          .bookings-mgr-root {
            padding: 20px 14px 48px 14px;
          }
          .bookings-header-bar {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }
          .bookings-header-actions {
            width: 100%;
            justify-content: flex-start;
          }
          .summary-cards-grid {
            grid-template-columns: 1fr 1fr;
          }
          .controls-top-row {
            flex-direction: column;
            align-items: stretch;
          }
          .controls-filters-group {
            width: 100%;
            flex-direction: column;
          }
          .control-select-wrap,
          .control-select {
            width: 100%;
          }
          .desktop-only-table {
            display: none;
          }
          .mobile-only-view {
            display: block;
            padding: 12px;
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

export default AdminTripManagement;
