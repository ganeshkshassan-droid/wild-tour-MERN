import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import AdminItemModal from '../../components/AdminItemModal';
import ConfirmModal from '../../components/ConfirmModal';
import SkeletonLoader from '../../components/SkeletonLoader';
import {
  Compass,
  ShieldCheck,
  TrendingUp,
  DollarSign,
  Ticket,
  Users,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Layers,
  Search,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  ExternalLink,
  MoreVertical,
  ChevronRight,
  ArrowUpRight,
  Sparkles,
  MapPin,
  Clock,
  Tag,
  Star,
  Activity,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Core Data States
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(new Date());

  // Booking Performance Range Filter ('7d' | '30d' | '6m')
  const [perfRange, setPerfRange] = useState('30d');
  const [performanceData, setPerformanceData] = useState(null);
  const [perfLoading, setPerfLoading] = useState(true);
  const [perfError, setPerfError] = useState(null);
  const perfRequestIdRef = useRef(0);

  // Inventory Management State
  const [activeTab, setActiveTab] = useState('Safaris');
  const [inventoryList, setInventoryList] = useState([]);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortBy, setSortBy] = useState('default');

  // Row Action Dropdown Menu
  const [openActionMenuId, setOpenActionMenuId] = useState(null);

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  useEffect(() => {
    fetchDashboardAnalytics();
  }, []);

  useEffect(() => {
    fetchBookingPerformance(perfRange);
  }, [perfRange]);

  useEffect(() => {
    fetchInventoryTab(activeTab);
  }, [activeTab]);

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

  const fetchDashboardAnalytics = async () => {
    setRefreshing(true);
    try {
      const res = await api.getAdminAnalytics();
      if (res && res.success) {
        setStats(res);
        setLastSyncTime(new Date());
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      showToast('Failed to sync analytics metrics', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchBookingPerformance = async (range) => {
    const reqId = ++perfRequestIdRef.current;
    setPerfLoading(true);
    setPerfError(null);
    try {
      const res = await api.getAdminBookingPerformance(range);
      if (reqId === perfRequestIdRef.current) {
        if (res && res.success) {
          setPerformanceData(res);
        } else {
          setPerfError('Failed to load performance analytics');
        }
      }
    } catch (err) {
      if (reqId === perfRequestIdRef.current) {
        console.error('Error fetching performance analytics:', err);
        setPerfError(err.message || 'Failed to load performance analytics');
      }
    } finally {
      if (reqId === perfRequestIdRef.current) {
        setPerfLoading(false);
      }
    }
  };

  const fetchInventoryTab = async (tab) => {
    setInventoryLoading(true);
    setSearchQuery('');
    setCategoryFilter('All');
    try {
      let res;
      if (tab === 'Safaris') res = await api.getAdminSafaris();
      else if (tab === 'Stays') res = await api.getAdminStays();
      else if (tab === 'Packages') res = await api.getAdminPackages();
      else if (tab === 'Guides') res = await api.getAdminGuides();

      if (res && res.success) {
        setInventoryList(res.data || []);
      }
    } catch (error) {
      console.error(`Error fetching ${tab}:`, error);
      showToast(`Failed to load ${tab} directory`, 'error');
    } finally {
      setInventoryLoading(false);
    }
  };

  const confirmDeleteAction = async () => {
    if (!itemToDelete) return;
    try {
      let res;
      const id = itemToDelete._id || itemToDelete.id;
      if (activeTab === 'Safaris') res = await api.deleteSafari(id);
      else if (activeTab === 'Stays') res = await api.deleteStay(id);
      else if (activeTab === 'Packages') res = await api.deletePackage(id);
      else if (activeTab === 'Guides') res = await api.deleteGuide(id);

      if (res && res.success) {
        showToast(res.message || 'Record deleted successfully', 'success');
        setDeleteModalOpen(false);
        fetchInventoryTab(activeTab);
        fetchDashboardAnalytics();
      }
    } catch (error) {
      showToast(error.message || 'Failed to delete item', 'error');
    }
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setModalOpen(true);
    setOpenActionMenuId(null);
  };

  const handleOpenCreate = () => {
    setEditingItem(null);
    setModalOpen(true);
  };

  const handleOpenDelete = (item) => {
    setItemToDelete(item);
    setDeleteModalOpen(true);
    setOpenActionMenuId(null);
  };

  const getItemTypeSingular = (tab) => {
    if (tab === 'Safaris') return 'Safari';
    if (tab === 'Stays') return 'Stay';
    if (tab === 'Packages') return 'Package';
    if (tab === 'Guides') return 'Guide';
    return 'Item';
  };

  // Safe Metric Extractions
  const statData = stats?.stats || {};
  const totalRevenue = statData.totalRevenue || 0;
  const totalBookings = statData.totalBookings || 0;
  const confirmedBookings = statData.confirmedBookings || 0;
  const pendingBookings = statData.pendingBookings || 0;
  const cancelledBookings = statData.cancelledBookings || 0;
  const averageOrderValue = statData.averageOrderValue || (totalBookings > 0 ? Math.round(totalRevenue / totalBookings) : 0);
  const totalUsers = statData.totalUsers || 0;
  const verifiedUsers = statData.verifiedUsers || 0;

  // Status Breakdown Percentages
  const confirmedPct = totalBookings > 0 ? Math.round((confirmedBookings / totalBookings) * 100) : 75;
  const pendingPct = totalBookings > 0 ? Math.round((pendingBookings / totalBookings) * 100) : 15;
  const cancelledPct = totalBookings > 0 ? Math.round((cancelledBookings / totalBookings) * 100) : 10;

  // Filter and Sort Inventory List
  const filteredInventory = inventoryList.filter((item) => {
    const matchesSearch =
      !searchQuery ||
      item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      categoryFilter === 'All' ||
      item.category === categoryFilter ||
      item.property_type === categoryFilter ||
      item.specialty === categoryFilter;

    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    if (sortBy === 'price-low') return (a.price_per_seat || a.price || 0) - (b.price_per_seat || b.price || 0);
    if (sortBy === 'price-high') return (b.price_per_seat || b.price || 0) - (a.price_per_seat || a.price || 0);
    if (sortBy === 'rating') return (b.rating || b.sighting_rating || 0) - (a.rating || a.sighting_rating || 0);
    if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
    return 0;
  });

  // Extract unique categories for filter dropdown
  const availableCategories = ['All', ...new Set(inventoryList.map(item => item.category || item.property_type || item.specialty).filter(Boolean))];

  // Top Performing Item
  const topItem = stats?.topPerformingItems?.[0] || {
    _id: 'Jeep Safari (Zone A & B)',
    item_type: 'Safari',
    bookingsCount: 14,
    totalRevenue: 28000,
    item_image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=400&q=80'
  };

  return (
    <div className="warden-dashboard-root">
      <div className="warden-dashboard-container">
        
        {/* ==================================================== */}
        {/* A. TOP NAVIGATION / DASHBOARD HEADER                 */}
        {/* ==================================================== */}
        <header className="warden-header-bar">
          <div className="warden-header-titles">
            <div className="warden-badge-row">
              <span className="warden-badge">
                <Compass size={14} className="text-gold" />
                <span>NAGARHOLE SANCTUARY RANGE COMMAND</span>
              </span>
              <span className="sync-status-indicator" title={`Last synced at ${lastSyncTime.toLocaleTimeString()}`}>
                <span className={`sync-dot ${refreshing ? 'syncing' : ''}`} />
                <span>{refreshing ? 'Syncing...' : `Synced ${lastSyncTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}</span>
              </span>
            </div>
            <h1 className="warden-page-title">Chief Warden Dashboard</h1>
            <p className="warden-page-subtitle">
              Real-time telemetry of sanctuary operations, safari bookings, permit quotas, travelers, and revenue.
            </p>
          </div>

          <div className="warden-header-actions">
            <button
              onClick={fetchDashboardAnalytics}
              disabled={refreshing}
              className="action-btn icon-only"
              title="Refresh telemetry"
              aria-label="Refresh telemetry"
            >
              <RefreshCw size={17} className={refreshing ? 'animate-spin' : ''} />
            </button>

            <Link
              to="/admin/checkpost"
              className="action-btn secondary"
              style={{ borderColor: '#d97706', color: '#d97706' }}
            >
              <ShieldCheck size={16} />
              <span>Gate Checkpost</span>
            </Link>

            <Link to="/" className="action-btn secondary">
              <ExternalLink size={15} />
              <span>View Website</span>
            </Link>

            <Link to="/admin/trips" className="action-btn primary">
              <Ticket size={16} />
              <span>Manage Bookings</span>
            </Link>
          </div>

        </header>

        {/* ==================================================== */}
        {/* B. SYSTEM OVERVIEW / KPI SECTION                     */}
        {/* ==================================================== */}
        <section className="dashboard-section mb-6">
          <div className="section-title-bar">
            <div>
              <h2 className="section-heading">Today's Sanctuary Overview</h2>
              <p className="section-caption">Core operational and financial key performance metrics</p>
            </div>
          </div>

          {loading ? (
            <div className="kpi-skeleton-grid">
              <SkeletonLoader count={4} />
            </div>
          ) : (
            <div className="kpi-hierarchy-grid">
              {/* 1. Primary Card: Total Revenue */}
              <div className="kpi-card primary-kpi revenue-theme">
                <div className="kpi-card-header">
                  <span className="kpi-label">Gross Sanctuary Revenue</span>
                  <div className="kpi-icon-badge forest">
                    <DollarSign size={20} />
                  </div>
                </div>
                <div className="kpi-main-metric font-mono">
                  ₹{totalRevenue.toLocaleString()}
                </div>
                <div className="kpi-card-footer">
                  <span className="trend-badge positive">
                    <TrendingUp size={13} />
                    <span>+18.4%</span>
                  </span>
                  <span className="kpi-subtext">Avg ₹{averageOrderValue.toLocaleString()} / permit</span>
                </div>
              </div>

              {/* 2. Primary Card: Active Confirmed Bookings */}
              <div className="kpi-card primary-kpi bookings-theme">
                <div className="kpi-card-header">
                  <span className="kpi-label">Active Permits Issued</span>
                  <div className="kpi-icon-badge gold">
                    <Ticket size={20} />
                  </div>
                </div>
                <div className="kpi-main-metric font-mono">
                  {confirmedBookings}
                </div>
                <div className="kpi-card-footer">
                  <span className="trend-badge positive">
                    <ArrowUpRight size={13} />
                    <span>{confirmedBookings} active</span>
                  </span>
                  <span className="kpi-subtext">{cancelledBookings} cancelled • {totalBookings} total</span>
                </div>
              </div>

              {/* 3. Secondary Card: Registered Explorers */}
              <div className="kpi-card secondary-kpi">
                <div className="kpi-card-header">
                  <span className="kpi-label">Registered Travelers</span>
                  <div className="kpi-icon-badge sky">
                    <Users size={18} />
                  </div>
                </div>
                <div className="kpi-main-metric font-mono">
                  {totalUsers}
                </div>
                <div className="kpi-card-footer">
                  <span className="kpi-subtext">{verifiedUsers} email-verified profiles</span>
                </div>
              </div>

              {/* 4. Secondary Card: Permit Quota Utilization */}
              <div className="kpi-card secondary-kpi">
                <div className="kpi-card-header">
                  <span className="kpi-label">Permit Quota Utilization</span>
                  <div className="kpi-icon-badge emerald">
                    <Activity size={18} />
                  </div>
                </div>
                <div className="kpi-main-metric font-mono">
                  {totalBookings > 0 ? `${Math.min(100, Math.round(confirmedPct * 0.92))}%` : '68%'}
                </div>
                <div className="kpi-progress-track">
                  <div
                    className="kpi-progress-bar"
                    style={{ width: `${Math.min(100, Math.round(confirmedPct * 0.92))}%` }}
                  />
                </div>
                <div className="kpi-card-footer">
                  <span className="kpi-subtext">Peak Zone-A demand steady</span>
                </div>
              </div>

              {/* 5. Secondary Card: Pending Actions */}
              <div className={`kpi-card secondary-kpi ${pendingBookings > 0 ? 'highlight-alert' : ''}`}>
                <div className="kpi-card-header">
                  <span className="kpi-label">Pending Verifications</span>
                  <div className={`kpi-icon-badge ${pendingBookings > 0 ? 'amber' : 'forest'}`}>
                    {pendingBookings > 0 ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
                  </div>
                </div>
                <div className="kpi-main-metric font-mono">
                  {pendingBookings}
                </div>
                <div className="kpi-card-footer">
                  <span className="kpi-subtext">
                    {pendingBookings > 0 ? 'Requires warden review' : 'Zero pending items'}
                  </span>
                </div>
              </div>

              {/* 6. Secondary Card: Average Booking Tariff */}
              <div className="kpi-card secondary-kpi">
                <div className="kpi-card-header">
                  <span className="kpi-label">Average Order Value</span>
                  <div className="kpi-icon-badge gold">
                    <Sparkles size={18} />
                  </div>
                </div>
                <div className="kpi-main-metric font-mono">
                  ₹{averageOrderValue.toLocaleString()}
                </div>
                <div className="kpi-card-footer">
                  <span className="kpi-subtext">Across all expedition tiers</span>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* ==================================================== */}
        {/* 2. ATTENTION REQUIRED SECTION                        */}
        {/* ==================================================== */}
        <section className="dashboard-section mb-6">
          <div className="attention-panel">
            <div className="attention-header">
              <div className="attention-title-group">
                <span className="attention-pulse-icon">
                  {pendingBookings > 0 ? <AlertTriangle size={20} className="text-amber" /> : <ShieldCheck size={20} className="text-emerald" />}
                </span>
                <div>
                  <h3 className="attention-heading">
                    {pendingBookings > 0 ? 'Action Required: Active Operational Alerts' : 'Operational Status: All Systems Nominal'}
                  </h3>
                  <p className="attention-desc">
                    {pendingBookings > 0
                      ? 'The following items require your authorization or attention to maintain guest scheduling.'
                      : 'Safari permit gateways, Gypsy driver allocations, and lodge reservations are operating normally.'}
                  </p>
                </div>
              </div>

              {pendingBookings > 0 && (
                <Link to="/admin/trips" className="action-btn primary alert-action-btn">
                  <span>Review {pendingBookings} Pending Bookings</span>
                  <ChevronRight size={16} />
                </Link>
              )}
            </div>

            {pendingBookings > 0 ? (
              <div className="attention-alerts-list">
                <div className="alert-item">
                  <div className="alert-item-left">
                    <span className="alert-tag warning">PENDING APPROVAL</span>
                    <p className="alert-item-text">
                      <strong>{pendingBookings} Guest Reservation Requests</strong> are pending confirmation and permit ticket generation.
                    </p>
                  </div>
                  <Link to="/admin/trips" className="alert-link-btn">
                    Authorize &rarr;
                  </Link>
                </div>

                <div className="alert-item">
                  <div className="alert-item-left">
                    <span className="alert-tag info">CAPACITY NOTICE</span>
                    <p className="alert-item-text">
                      <strong>Zone-A 4x4 Gypsy Morning Slots</strong> for this weekend are at 85% capacity.
                    </p>
                  </div>
                  <button onClick={() => { setActiveTab('Safaris'); document.getElementById('inventory-section')?.scrollIntoView({ behavior: 'smooth' }); }} className="alert-link-btn">
                    Adjust Seats &rarr;
                  </button>
                </div>
              </div>
            ) : (
              <div className="smooth-running-banner">
                <CheckCircle2 size={18} className="text-emerald" />
                <span>Zero blocking alerts. All permits, gate admissions, and guide schedules are up to date.</span>
              </div>
            )}
          </div>
        </section>

        {/* ==================================================== */}
        {/* 3 & 4. ANALYTICS & REVENUE DUAL SECTION              */}
        {/* ==================================================== */}
        <div className="analytics-dual-grid mb-6">
          
          {/* Left: Booking Performance Trends */}
          <div className="dashboard-card analytics-card">
            <div className="dashboard-card-header">
              <div>
                <div className="card-title-row">
                  <h3 className="card-heading">Booking Performance</h3>
                  {performanceData && !perfLoading && (
                    <span className="perf-summary-pill font-mono">
                      {performanceData.totalBookings} Bookings • ₹{performanceData.totalRevenue.toLocaleString()}
                    </span>
                  )}
                </div>
                <p className="card-subheading">
                  {perfRange === '7d' ? 'Last 7 days daily reservations' : perfRange === '6m' ? 'Last 6 months monthly trajectory' : 'Last 30 days daily reservations'}
                </p>
              </div>

              <div className="timeframe-selector">
                {[
                  { key: '7d', label: '7 Days' },
                  { key: '30d', label: '30 Days' },
                  { key: '6m', label: '6 Months' }
                ].map((tf) => (
                  <button
                    key={tf.key}
                    onClick={() => setPerfRange(tf.key)}
                    className={`timeframe-btn ${perfRange === tf.key ? 'active' : ''}`}
                    disabled={perfLoading}
                  >
                    {tf.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Interactive SVG / Visual Bar Trend */}
            <div className="trend-chart-container">
              {perfLoading ? (
                <div className="chart-skeleton-box">
                  <div className="chart-skeleton-shimmer" />
                </div>
              ) : perfError ? (
                <div className="chart-error-box">
                  <AlertTriangle size={20} className="text-amber mb-1" />
                  <p className="text-xs text-muted mb-2">{perfError}</p>
                  <button onClick={() => fetchBookingPerformance(perfRange)} className="action-btn secondary text-xs">
                    Retry
                  </button>
                </div>
              ) : (
                <div className={`chart-bars-track track-${perfRange}`}>
                  {(() => {
                    const chartData = performanceData?.chartData || [];
                    const maxCount = Math.max(1, ...chartData.map((c) => c.bookings));

                    return chartData.map((item, idx) => {
                      const heightPct = item.bookings > 0
                        ? Math.max(14, Math.round((item.bookings / maxCount) * 100))
                        : 3;

                      return (
                        <div
                          key={item.key || idx}
                          className={`chart-bar-column ${item.bookings > 0 ? 'has-bookings' : 'zero-bookings'}`}
                        >
                          <div className="bar-tooltip">
                            <span className="tooltip-date font-bold">{item.fullLabel || item.label}</span>
                            <span className="tooltip-count font-mono">{item.bookings} {item.bookings === 1 ? 'Booking' : 'Bookings'}</span>
                            <span className="tooltip-rev font-mono">₹{(item.revenue || 0).toLocaleString()} Paid</span>
                            {item.cancelledBookings > 0 && (
                              <span className="tooltip-cancelled text-xs font-mono">{item.cancelledBookings} Cancelled</span>
                            )}
                          </div>
                          <div className="bar-fill-wrap">
                            <div
                              className="bar-fill"
                              style={{ height: `${heightPct}%` }}
                            />
                          </div>
                          <span className="bar-label">{item.label}</span>
                        </div>
                      );
                    });
                  })()}
                </div>
              )}
            </div>

            <div className="chart-footer-metrics">
              <div className="chart-metric-item">
                <span className="metric-label">Current Velocity</span>
                <span className="metric-val text-forest font-bold font-mono">
                  {perfLoading ? '...' : performanceData?.bookingVelocity?.formatted || '0 bookings/day'}
                </span>
                <span className="metric-subtext font-mono">
                  {perfLoading ? '' : `Over ${performanceData?.daysInRange || 0} days`}
                </span>
              </div>
              <div className="chart-metric-item">
                <span className="metric-label">Highest Booking Peak</span>
                <span className="metric-val text-heading font-bold font-mono">
                  {perfLoading ? '...' : performanceData?.highestBookingPeak?.label || 'No bookings in this period'}
                </span>
                <span className="metric-subtext font-mono">
                  {perfLoading
                    ? ''
                    : performanceData?.highestBookingPeak?.bookings > 0
                    ? `${performanceData.highestBookingPeak.bookings} Bookings`
                    : 'Zero reservations'}
                </span>
              </div>
              <div className="chart-metric-item">
                <span className="metric-label">Payment Fulfillment</span>
                <span className="metric-val text-emerald font-bold font-mono">
                  {perfLoading ? '...' : `${performanceData?.paymentFulfillment?.percentage ?? 0}%`}
                </span>
                <span className="metric-subtext font-mono">
                  {perfLoading ? '' : performanceData?.paymentFulfillment?.label || '0 of 0 bookings paid'}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Booking Status Breakdown */}
          <div className="dashboard-card status-card">
            <div className="dashboard-card-header">
              <div>
                <h3 className="card-heading">Status Distribution</h3>
                <p className="card-subheading">
                  {perfRange === '7d' ? 'Past 7 Days' : perfRange === '6m' ? 'Past 6 Months' : 'Past 30 Days'} ratio
                </p>
              </div>
            </div>

            <div className="status-progress-breakdown">
              {(() => {
                const breakdown = performanceData?.statusBreakdown || {
                  confirmed: confirmedBookings,
                  pending: pendingBookings,
                  completed: 0,
                  cancelled: cancelledBookings,
                  confirmedPct,
                  pendingPct,
                  completedPct: 0,
                  cancelledPct,
                };

                return (
                  <>
                    {/* Segmented Bar */}
                    <div className="segmented-status-bar">
                      <div className="segment confirmed" style={{ width: `${breakdown.confirmedPct}%` }} title={`Confirmed: ${breakdown.confirmedPct}%`} />
                      <div className="segment pending" style={{ width: `${breakdown.pendingPct}%` }} title={`Pending: ${breakdown.pendingPct}%`} />
                      <div className="segment cancelled" style={{ width: `${breakdown.cancelledPct}%` }} title={`Cancelled: ${breakdown.cancelledPct}%`} />
                    </div>

                    {/* Status List */}
                    <div className="status-legend-list">
                      <div className="status-legend-item">
                        <div className="legend-marker confirmed" />
                        <div className="legend-content">
                          <span className="legend-title">Confirmed & Active</span>
                          <span className="legend-count font-mono">{breakdown.confirmed} Bookings</span>
                        </div>
                        <span className="legend-percentage font-mono">{breakdown.confirmedPct}%</span>
                      </div>

                      <div className="status-legend-item">
                        <div className="legend-marker pending" />
                        <div className="legend-content">
                          <span className="legend-title">Pending Authorization</span>
                          <span className="legend-count font-mono">{breakdown.pending} Bookings</span>
                        </div>
                        <span className="legend-percentage font-mono">{breakdown.pendingPct}%</span>
                      </div>

                      <div className="status-legend-item">
                        <div className="legend-marker cancelled" />
                        <div className="legend-content">
                          <span className="legend-title">Cancelled / Refunded</span>
                          <span className="legend-count font-mono">{breakdown.cancelled} Bookings</span>
                        </div>
                        <span className="legend-percentage font-mono">{breakdown.cancelledPct}%</span>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Top Performing Experience Spotlight */}
            <div className="top-item-spotlight">
              <div className="spotlight-badge">
                <Sparkles size={13} className="text-gold" />
                <span>TOP PERFORMING SAFARI</span>
              </div>
              <div className="spotlight-card">
                <img
                  src={topItem.item_image || 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=200&q=80'}
                  alt={topItem._id}
                  className="spotlight-thumb"
                />
                <div className="spotlight-info">
                  <h4 className="spotlight-name">{topItem._id}</h4>
                  <div className="spotlight-metrics">
                    <span className="spotlight-stat font-mono text-forest-primary font-bold">
                      ₹{topItem.totalRevenue?.toLocaleString()} Revenue
                    </span>
                    <span className="spotlight-dot">•</span>
                    <span className="spotlight-stat font-mono">
                      {topItem.bookingsCount} Reservations
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ==================================================== */}
        {/* 5 & 6. OPERATIONAL SUMMARY & RECENT ACTIVITY         */}
        {/* ==================================================== */}
        <div className="operations-activity-grid mb-6">
          
          {/* Left: Operational Workload */}
          <div className="dashboard-card ops-summary-card">
            <div className="dashboard-card-header">
              <div>
                <h3 className="card-heading">Operational Summary</h3>
                <p className="card-subheading">Upcoming sanctuary dispatch workload</p>
              </div>
            </div>

            <div className="ops-workload-grid">
              <div className="workload-box">
                <span className="workload-tag">TODAY</span>
                <h4 className="workload-number font-mono">{Math.max(2, Math.round(confirmedBookings * 0.25))}</h4>
                <span className="workload-label">Safaris Dispatched</span>
              </div>

              <div className="workload-box">
                <span className="workload-tag">TOMORROW</span>
                <h4 className="workload-number font-mono">{Math.max(4, Math.round(confirmedBookings * 0.4))}</h4>
                <span className="workload-label">Safaris Scheduled</span>
              </div>

              <div className="workload-box">
                <span className="workload-tag">NEXT 7 DAYS</span>
                <h4 className="workload-number font-mono">{Math.max(8, confirmedBookings)}</h4>
                <span className="workload-label">Expeditions Booked</span>
              </div>
            </div>

            <div className="inventory-summary-strip mt-3">
              <div className="inv-mini-stat">
                <span className="inv-num font-mono">{statData.totalSafaris || 4}</span>
                <span className="inv-lbl">Active Safaris</span>
              </div>
              <div className="inv-mini-stat">
                <span className="inv-num font-mono">{statData.totalStays || 4}</span>
                <span className="inv-lbl">Luxury Stays</span>
              </div>
              <div className="inv-mini-stat">
                <span className="inv-num font-mono">{statData.totalPackages || 4}</span>
                <span className="inv-lbl">Tour Packages</span>
              </div>
              <div className="inv-mini-stat">
                <span className="inv-num font-mono">{statData.totalGuides || 4}</span>
                <span className="inv-lbl">Field Naturalists</span>
              </div>
            </div>
          </div>

          {/* Right: Recent Activity Feed */}
          <div className="dashboard-card recent-activity-card">
            <div className="dashboard-card-header">
              <div>
                <h3 className="card-heading">Recent Booking Activity</h3>
                <p className="card-subheading">Latest reservations across all channels</p>
              </div>
              <Link to="/admin/trips" className="card-header-link">
                <span>View All</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            <div className="activity-timeline-list">
              {(stats?.recentBookings?.length > 0 ? stats.recentBookings.slice(0, 5) : [
                {
                  _id: 'b1',
                  tourist_name: 'Ganesh K S',
                  item_name: 'Jeep Safari (Zone A & B)',
                  total_price: 1600,
                  status: 'Confirmed',
                  createdAt: new Date().toISOString()
                },
                {
                  _id: 'b2',
                  tourist_name: 'Ram',
                  item_name: 'Kabini River Boat Safari',
                  total_price: 1000,
                  status: 'Confirmed',
                  createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
                },
                {
                  _id: 'b3',
                  tourist_name: 'Arun Kumar',
                  item_name: 'Elephant Back Safari',
                  total_price: 2000,
                  status: 'Booked',
                  createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
                },
                {
                  _id: 'b4',
                  tourist_name: 'Sneha Rao',
                  item_name: 'Kaav Safari Lodge',
                  total_price: 18500,
                  status: 'Confirmed',
                  createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
                }
              ]).map((booking) => {
                const dateObj = new Date(booking.createdAt);
                const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                return (
                  <div key={booking._id} className="activity-timeline-item">
                    <div className="activity-icon-node">
                      <Ticket size={13} className="text-forest-primary" />
                    </div>
                    <div className="activity-details">
                      <div className="activity-title-row">
                        <span className="activity-user-name">{booking.tourist_name || booking.user?.name || 'Explorer'}</span>
                        <span className="activity-time font-mono">{timeStr}</span>
                      </div>
                      <p className="activity-desc">
                        Reserved <strong>{booking.item_name}</strong>
                      </p>
                    </div>
                    <div className="activity-price-tag font-mono">
                      ₹{booking.total_price?.toLocaleString()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ==================================================== */}
        {/* 7 & 8. SAFARI & DIRECTORY MANAGEMENT DATA TABLE      */}
        {/* ==================================================== */}
        <section id="inventory-section" className="dashboard-section inventory-management-section">
          <div className="inventory-panel-card">
            
            {/* Management Section Header */}
            <div className="inventory-panel-header">
              <div>
                <div className="section-eyebrow-pill">
                  <Layers size={14} className="text-forest-primary" />
                  <span>SANCTUARY INVENTORY & DIRECTORY</span>
                </div>
                <h2 className="section-heading mt-1">Resource & Quota Management</h2>
                <p className="section-caption">
                  Configure safaris, eco-lodges, tour packages, and naturalist guide profiles.
                </p>
              </div>

              <button onClick={handleOpenCreate} className="action-btn primary add-item-btn">
                <Plus size={16} />
                <span>Add New {getItemTypeSingular(activeTab)}</span>
              </button>
            </div>

            {/* Segmented Directory Navigation Tabs */}
            <div className="segmented-dir-tabs">
              {['Safaris', 'Stays', 'Packages', 'Guides'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`dir-tab-btn ${activeTab === tab ? 'active' : ''}`}
                >
                  <span>{tab} Directory</span>
                  <span className="tab-counter-badge">
                    {tab === 'Safaris' ? (statData.totalSafaris || inventoryList.length)
                      : tab === 'Stays' ? (statData.totalStays || inventoryList.length)
                      : tab === 'Packages' ? (statData.totalPackages || inventoryList.length)
                      : (statData.totalGuides || inventoryList.length)}
                  </span>
                </button>
              ))}
            </div>

            {/* Search & Filter Toolbar */}
            <div className="inventory-toolbar">
              <div className="toolbar-search-wrap">
                <Search size={16} className="search-icon" />
                <input
                  type="text"
                  placeholder={`Search ${activeTab.toLowerCase()} by name, category or details...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="toolbar-search-input"
                />
              </div>

              <div className="toolbar-filters-group">
                {/* Category Filter */}
                <div className="filter-select-wrap">
                  <SlidersHorizontal size={14} className="filter-select-icon" />
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="toolbar-select"
                  >
                    {availableCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat === 'All' ? 'All Categories' : cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort Filter */}
                <div className="filter-select-wrap">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="toolbar-select"
                  >
                    <option value="default">Sort by: Default</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Highest Rating</option>
                    <option value="name">Name (A-Z)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Data Table */}
            {inventoryLoading ? (
              <div className="table-loading-wrap p-4">
                <SkeletonLoader count={4} />
              </div>
            ) : filteredInventory.length === 0 ? (
              <div className="empty-inventory-state">
                <Compass size={42} className="text-muted mb-2" />
                <h4 className="empty-title">No matching {activeTab.toLowerCase()} found</h4>
                <p className="empty-desc">
                  {searchQuery || categoryFilter !== 'All'
                    ? 'Try clearing your search query or category filters.'
                    : `No ${activeTab.toLowerCase()} records currently exist in the database.`}
                </p>
                <button onClick={handleOpenCreate} className="action-btn secondary mt-3">
                  <Plus size={15} />
                  <span>Add First {getItemTypeSingular(activeTab)}</span>
                </button>
              </div>
            ) : (
              <div className="table-responsive-container">
                <table className="warden-data-table">
                  <thead>
                    <tr>
                      <th className="col-entity">Experience / Entity</th>
                      <th className="col-category">Category</th>
                      <th className="col-duration">Duration / Specs</th>
                      <th className="col-pricing">Pricing Tariff</th>
                      <th className="col-rating">Rating</th>
                      <th className="col-status">Status</th>
                      <th className="col-actions text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInventory.map((item) => {
                      const id = item._id || item.id;
                      const image = item.image_url || item.image || item.avatar || 'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&w=150&q=80';
                      const price = item.price_per_seat || item.price_per_night || item.price_per_day || item.price || 0;
                      const rating = item.rating || item.sighting_rating || 4.9;
                      const isMenuOpen = openActionMenuId === id;

                      return (
                        <tr key={id} className="warden-table-row">
                          {/* 1. Entity Thumbnail + Info */}
                          <td className="col-entity">
                            <div className="entity-cell">
                              <img src={image} alt={item.name} className="entity-thumb" />
                              <div className="entity-meta">
                                <span className="entity-name">{item.name}</span>
                                <span className="entity-subtext">
                                  {item.vehicle_type || item.location || item.specialty || `${item.duration_days || 3} Days Tour`}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* 2. Category */}
                          <td className="col-category">
                            <span className="category-tag">
                              {item.category || item.property_type || item.specialty || 'Expedition'}
                            </span>
                          </td>

                          {/* 3. Duration */}
                          <td className="col-duration">
                            <span className="spec-text">
                              <Clock size={13} className="text-muted inline-icon" />
                              <span>{item.duration || (item.duration_days ? `${item.duration_days} Days` : item.experience_years ? `${item.experience_years} Years Exp` : '3.5 Hours')}</span>
                            </span>
                          </td>

                          {/* 4. Pricing Tariff */}
                          <td className="col-pricing">
                            <span className="price-tag font-mono">
                              ₹{price.toLocaleString()}
                              <span className="price-unit">
                                {activeTab === 'Safaris' ? '/seat' : activeTab === 'Stays' ? '/night' : activeTab === 'Guides' ? '/day' : '/person'}
                              </span>
                            </span>
                          </td>

                          {/* 5. Rating */}
                          <td className="col-rating">
                            <span className="rating-pill">
                              <Star size={12} className="text-gold" />
                              <span>{rating}</span>
                            </span>
                          </td>

                          {/* 6. Status */}
                          <td className="col-status">
                            <span className={`status-pill ${item.active !== false ? 'active' : 'inactive'}`}>
                              <span className="status-dot" />
                              <span>{item.active !== false ? 'Active' : 'Offline'}</span>
                            </span>
                          </td>

                          {/* 7. Action Dropdown Menu */}
                          <td className="col-actions text-right">
                            <div className="row-actions-menu-container">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenActionMenuId(isMenuOpen ? null : id);
                                }}
                                className="row-menu-trigger"
                                title="Row Actions"
                                aria-label="Row Actions"
                              >
                                <MoreVertical size={16} />
                              </button>

                              {isMenuOpen && (
                                <div className="row-dropdown-menu animate-fade-in">
                                  <button
                                    onClick={() => handleOpenEdit(item)}
                                    className="dropdown-item"
                                  >
                                    <Edit2 size={14} />
                                    <span>Edit Record</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      showToast(`Viewing details for ${item.name}`, 'info');
                                      setOpenActionMenuId(null);
                                    }}
                                    className="dropdown-item"
                                  >
                                    <EyeIcon size={14} />
                                    <span>Quick Preview</span>
                                  </button>
                                  <div className="dropdown-divider" />
                                  <button
                                    onClick={() => handleOpenDelete(item)}
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
            )}
          </div>
        </section>

      </div>

      {/* Item Create / Edit Modal */}
      <AdminItemModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        itemType={getItemTypeSingular(activeTab)}
        item={editingItem}
        onSaved={() => {
          fetchInventoryTab(activeTab);
          fetchDashboardAnalytics();
        }}
      />

      {/* Item Delete Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDeleteAction}
        title={`Delete ${getItemTypeSingular(activeTab)}?`}
        message={`Are you sure you want to permanently remove "${itemToDelete?.name}" from the active sanctuary database?`}
        confirmText="Yes, Delete Record"
        danger={true}
      />

      <style>{`
        .warden-dashboard-root {
          background-color: #f8fafc;
          min-height: calc(100vh - 72px);
          padding: 32px 24px 64px 24px;
          color: #1e293b;
        }

        .warden-dashboard-container {
          max-width: 1440px;
          margin: 0 auto;
        }

        /* -------------------------------------------------- */
        /* A. HEADER                                          */
        /* -------------------------------------------------- */
        .warden-header-bar {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 24px;
          padding-bottom: 28px;
          border-bottom: 1px solid #e2e8f0;
          margin-bottom: 32px;
        }

        .warden-badge-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
        }

        .warden-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.1em;
          color: #1b4332;
          background: #e8f5e9;
          padding: 4px 10px;
          border-radius: 20px;
          border: 1px solid #c8e6c9;
        }

        .sync-status-indicator {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.76rem;
          font-weight: 600;
          color: #64748b;
        }

        .sync-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #10b981;
        }

        .sync-dot.syncing {
          background: #f59e0b;
          animation: pulse 1s infinite;
        }

        .warden-page-title {
          font-family: var(--font-heading, 'Outfit', sans-serif);
          font-size: 1.95rem;
          font-weight: 800;
          letter-spacing: -0.03em;
          color: #0f172a;
          line-height: 1.2;
          margin: 0 0 6px 0;
        }

        .warden-page-subtitle {
          font-size: 0.92rem;
          color: #64748b;
          margin: 0;
          max-width: 700px;
          line-height: 1.5;
        }

        .warden-header-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }

        .action-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px 18px;
          border-radius: 10px;
          font-size: 0.88rem;
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
          box-shadow: 0 4px 12px rgba(27, 67, 50, 0.22);
        }

        .action-btn.primary:hover {
          background: #143527;
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(27, 67, 50, 0.32);
        }

        .action-btn.secondary {
          background: #ffffff;
          color: #1e293b;
          border: 1px solid #cbd5e1;
        }

        .action-btn.secondary:hover {
          background: #f1f5f9;
          border-color: #94a3b8;
          transform: translateY(-1px);
        }

        .action-btn.icon-only {
          padding: 10px;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          color: #475569;
          border-radius: 10px;
        }

        .action-btn.icon-only:hover {
          background: #f1f5f9;
          color: #1b4332;
        }

        /* -------------------------------------------------- */
        /* B. KPI OVERVIEW                                    */
        /* -------------------------------------------------- */
        .section-title-bar {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 18px;
        }

        .section-heading {
          font-size: 1.25rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 2px 0;
          letter-spacing: -0.015em;
        }

        .section-caption {
          font-size: 0.85rem;
          color: #64748b;
          margin: 0;
        }

        .kpi-hierarchy-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 16px;
        }

        .kpi-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 18px;
          display: flex;
          flex-direction: column;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
          transition: all 0.2s ease;
        }

        .kpi-card:hover {
          border-color: #cbd5e1;
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
          transform: translateY(-2px);
        }

        .kpi-card.primary-kpi {
          grid-column: span 3;
          padding: 22px 24px;
        }

        .kpi-card.secondary-kpi {
          grid-column: span 1;
        }

        .kpi-card.highlight-alert {
          border-color: #fde68a;
          background: #fffdf5;
        }

        .kpi-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .kpi-label {
          font-size: 0.78rem;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .kpi-icon-badge {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .kpi-icon-badge.forest { background: #e8f5e9; color: #1b4332; }
        .kpi-icon-badge.gold { background: #fef3c7; color: #d97706; }
        .kpi-icon-badge.sky { background: #e0f2fe; color: #0284c7; }
        .kpi-icon-badge.emerald { background: #ecfdf5; color: #059669; }
        .kpi-icon-badge.amber { background: #fffbeb; color: #d97706; }

        .kpi-main-metric {
          font-size: 1.85rem;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -0.03em;
          margin-bottom: 6px;
        }

        .primary-kpi .kpi-main-metric {
          font-size: 2.2rem;
        }

        .kpi-card-footer {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: auto;
        }

        .trend-badge {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          font-size: 0.74rem;
          font-weight: 800;
          padding: 2px 7px;
          border-radius: 6px;
        }

        .trend-badge.positive {
          background: #ecfdf5;
          color: #047857;
        }

        .kpi-subtext {
          font-size: 0.78rem;
          color: #64748b;
          font-weight: 500;
        }

        .kpi-progress-track {
          width: 100%;
          height: 6px;
          background: #f1f5f9;
          border-radius: 4px;
          overflow: hidden;
          margin: 6px 0;
        }

        .kpi-progress-bar {
          height: 100%;
          background: #1b4332;
          border-radius: 4px;
          transition: width 0.4s ease;
        }

        /* -------------------------------------------------- */
        /* 2. ATTENTION REQUIRED PANEL                        */
        /* -------------------------------------------------- */
        .attention-panel {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 20px 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
        }

        .attention-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
        }

        .attention-title-group {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .attention-pulse-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: #fef3c7;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .attention-heading {
          font-size: 1.05rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 2px 0;
        }

        .attention-desc {
          font-size: 0.85rem;
          color: #64748b;
          margin: 0;
        }

        .alert-action-btn {
          font-size: 0.82rem;
          padding: 8px 14px;
          flex-shrink: 0;
        }

        .attention-alerts-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid #f1f5f9;
        }

        .alert-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 12px 16px;
        }

        .alert-item-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .alert-tag {
          font-size: 0.68rem;
          font-weight: 800;
          letter-spacing: 0.06em;
          padding: 3px 8px;
          border-radius: 6px;
        }

        .alert-tag.warning { background: #fef3c7; color: #b45309; }
        .alert-tag.info { background: #e0f2fe; color: #0369a1; }

        .alert-item-text {
          font-size: 0.85rem;
          color: #334155;
          margin: 0;
        }

        .alert-link-btn {
          background: none;
          border: none;
          color: #1b4332;
          font-weight: 700;
          font-size: 0.82rem;
          cursor: pointer;
          text-decoration: none;
        }

        .alert-link-btn:hover {
          text-decoration: underline;
        }

        .smooth-running-banner {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.85rem;
          color: #047857;
          background: #ecfdf5;
          padding: 10px 14px;
          border-radius: 8px;
          margin-top: 14px;
          font-weight: 600;
        }

        /* -------------------------------------------------- */
        /* 3 & 4. ANALYTICS & DUAL SECTION                    */
        /* -------------------------------------------------- */
        .analytics-dual-grid {
          display: grid;
          grid-template-columns: 1.6fr 1fr;
          gap: 20px;
        }

        .dashboard-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 22px 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
        }

        .dashboard-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
        }

        .card-heading {
          font-size: 1.12rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 2px 0;
        }

        .card-subheading {
          font-size: 0.82rem;
          color: #64748b;
          margin: 0;
        }

        .timeframe-selector {
          display: flex;
          background: #f1f5f9;
          padding: 3px;
          border-radius: 8px;
        }

        .timeframe-btn {
          border: none;
          background: transparent;
          font-size: 0.76rem;
          font-weight: 700;
          color: #64748b;
          padding: 4px 10px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .timeframe-btn.active {
          background: #ffffff;
          color: #0f172a;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .card-title-row {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .perf-summary-pill {
          font-size: 0.72rem;
          font-weight: 700;
          color: #1b4332;
          background: #e8f5e9;
          border: 1px solid #c8e6c9;
          padding: 2px 8px;
          border-radius: 6px;
        }

        /* Trend Chart Simulation */
        .trend-chart-container {
          height: 180px;
          display: flex;
          align-items: flex-end;
          margin-bottom: 20px;
          padding: 10px 0;
          position: relative;
        }

        .chart-skeleton-box {
          width: 100%;
          height: 100%;
          background: #f1f5f9;
          border-radius: 8px;
          position: relative;
          overflow: hidden;
        }

        .chart-skeleton-shimmer {
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent);
          animation: skeletonShimmer 1.5s infinite;
        }

        @keyframes skeletonShimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        .chart-error-box {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #fffdf5;
          border: 1px dashed #fde68a;
          border-radius: 8px;
          padding: 16px;
        }

        .chart-bars-track {
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 10px;
        }

        .chart-bars-track.track-30d {
          gap: 3px;
        }

        .chart-bars-track.track-30d .bar-fill-wrap {
          max-width: 16px;
          border-radius: 3px;
        }

        .chart-bars-track.track-30d .bar-label {
          font-size: 0.62rem;
          transform: rotate(-45deg);
          margin-top: 10px;
          white-space: nowrap;
          display: none;
        }

        /* Show every 5th label on 30d view */
        .chart-bars-track.track-30d .chart-bar-column:nth-child(5n+1) .bar-label {
          display: block;
        }

        .chart-bar-column {
          position: relative;
          flex: 1;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          align-items: center;
          cursor: pointer;
        }

        .bar-fill-wrap {
          width: 100%;
          max-width: 44px;
          height: 130px;
          background: #f1f5f9;
          border-radius: 6px;
          display: flex;
          align-items: flex-end;
          overflow: hidden;
        }

        .bar-fill {
          width: 100%;
          background: linear-gradient(180deg, #10b981 0%, #1b4332 100%);
          border-radius: 6px 6px 0 0;
          transition: height 0.4s ease;
        }

        .chart-bar-column.zero-bookings .bar-fill {
          background: #cbd5e1;
        }

        .chart-bar-column:hover .bar-fill {
          background: linear-gradient(180deg, #34d399 0%, #1b4332 100%);
        }

        .bar-label {
          font-size: 0.72rem;
          font-weight: 600;
          color: #64748b;
          margin-top: 8px;
          white-space: nowrap;
        }

        .bar-tooltip {
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          margin-bottom: 6px;
          background: #0f172a;
          color: #ffffff;
          padding: 6px 10px;
          border-radius: 7px;
          font-size: 0.72rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.15s ease;
          white-space: nowrap;
          z-index: 20;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .bar-tooltip::after {
          content: '';
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          border: 4px solid transparent;
          border-top-color: #0f172a;
        }

        .chart-bar-column:hover .bar-tooltip {
          opacity: 1;
        }

        .tooltip-date {
          color: #94a3b8;
          font-size: 0.68rem;
        }

        .tooltip-count {
          color: #ffffff;
          font-size: 0.82rem;
          font-weight: 700;
        }

        .tooltip-rev {
          color: #34d399;
          font-size: 0.74rem;
        }

        .tooltip-cancelled {
          color: #f87171;
        }

        .chart-footer-metrics {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          padding-top: 16px;
          border-top: 1px solid #f1f5f9;
        }

        .chart-metric-item {
          display: flex;
          flex-direction: column;
        }

        .metric-label {
          font-size: 0.7rem;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 700;
        }

        .metric-val {
          font-size: 0.95rem;
          margin-top: 2px;
        }

        .metric-subtext {
          font-size: 0.72rem;
          color: #94a3b8;
          margin-top: 1px;
        }

        /* Status Breakdown Card */
        .segmented-status-bar {
          width: 100%;
          height: 12px;
          background: #f1f5f9;
          border-radius: 8px;
          display: flex;
          overflow: hidden;
          margin-bottom: 18px;
        }

        .segment.confirmed { background: #10b981; }
        .segment.pending { background: #f59e0b; }
        .segment.cancelled { background: #ef4444; }

        .status-legend-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 20px;
        }

        .status-legend-item {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .legend-marker {
          width: 10px;
          height: 10px;
          border-radius: 3px;
          flex-shrink: 0;
        }

        .legend-marker.confirmed { background: #10b981; }
        .legend-marker.pending { background: #f59e0b; }
        .legend-marker.cancelled { background: #ef4444; }

        .legend-content {
          flex: 1;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .legend-title {
          font-size: 0.82rem;
          font-weight: 600;
          color: #334155;
        }

        .legend-count {
          font-size: 0.8rem;
          color: #64748b;
        }

        .legend-percentage {
          font-size: 0.85rem;
          font-weight: 700;
          color: #0f172a;
        }

        /* Spotlight Card */
        .top-item-spotlight {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 14px;
        }

        .spotlight-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 0.68rem;
          font-weight: 800;
          color: #92400e;
          letter-spacing: 0.08em;
          margin-bottom: 8px;
        }

        .spotlight-card {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .spotlight-thumb {
          width: 52px;
          height: 52px;
          border-radius: 8px;
          object-fit: cover;
        }

        .spotlight-name {
          font-size: 0.9rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 3px 0;
        }

        .spotlight-metrics {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.78rem;
          color: #64748b;
        }

        /* -------------------------------------------------- */
        /* 5 & 6. OPERATIONS & RECENT ACTIVITY                */
        /* -------------------------------------------------- */
        .operations-activity-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .ops-workload-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 16px;
        }

        .workload-box {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 14px;
          text-align: center;
        }

        .workload-tag {
          font-size: 0.68rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          color: #64748b;
        }

        .workload-number {
          font-size: 1.7rem;
          font-weight: 800;
          color: #0f172a;
          margin: 4px 0;
        }

        .workload-label {
          font-size: 0.74rem;
          color: #64748b;
        }

        .inventory-summary-strip {
          display: flex;
          justify-content: space-between;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 12px 18px;
        }

        .inv-mini-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .inv-num {
          font-size: 1.15rem;
          font-weight: 800;
          color: #1b4332;
        }

        .inv-lbl {
          font-size: 0.72rem;
          color: #64748b;
          font-weight: 600;
        }

        /* Recent Activity */
        .card-header-link {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 0.8rem;
          font-weight: 700;
          color: #1b4332;
          text-decoration: none;
        }

        .card-header-link:hover {
          text-decoration: underline;
        }

        .activity-timeline-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .activity-timeline-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          background: #f8fafc;
          border: 1px solid #f1f5f9;
          border-radius: 10px;
          transition: background 0.15s ease;
        }

        .activity-timeline-item:hover {
          background: #f1f5f9;
        }

        .activity-icon-node {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: #e8f5e9;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .activity-details {
          flex: 1;
        }

        .activity-title-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .activity-user-name {
          font-size: 0.84rem;
          font-weight: 700;
          color: #0f172a;
        }

        .activity-time {
          font-size: 0.72rem;
          color: #94a3b8;
        }

        .activity-desc {
          font-size: 0.78rem;
          color: #475569;
          margin: 1px 0 0 0;
        }

        .activity-price-tag {
          font-size: 0.85rem;
          font-weight: 700;
          color: #1b4332;
        }

        /* -------------------------------------------------- */
        /* 7 & 8. INVENTORY MANAGEMENT & TABLE                */
        /* -------------------------------------------------- */
        .inventory-panel-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
          overflow: hidden;
        }

        .inventory-panel-header {
          padding: 24px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          border-bottom: 1px solid #f1f5f9;
          gap: 16px;
        }

        .section-eyebrow-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.72rem;
          font-weight: 800;
          color: #1b4332;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .add-item-btn {
          flex-shrink: 0;
        }

        /* Segmented Directory Tabs */
        .segmented-dir-tabs {
          display: flex;
          gap: 8px;
          padding: 14px 24px;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          overflow-x: auto;
        }

        .dir-tab-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          color: #475569;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 0.84rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s ease;
          white-space: nowrap;
        }

        .dir-tab-btn:hover {
          border-color: #94a3b8;
          color: #0f172a;
        }

        .dir-tab-btn.active {
          background: #1b4332;
          border-color: #1b4332;
          color: #ffffff;
          box-shadow: 0 2px 6px rgba(27, 67, 50, 0.2);
        }

        .tab-counter-badge {
          font-size: 0.7rem;
          font-weight: 800;
          padding: 1px 6px;
          border-radius: 10px;
          background: rgba(0, 0, 0, 0.06);
        }

        .dir-tab-btn.active .tab-counter-badge {
          background: rgba(255, 255, 255, 0.2);
          color: #ffffff;
        }

        /* Toolbar */
        .inventory-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          padding: 16px 24px;
          border-bottom: 1px solid #f1f5f9;
          flex-wrap: wrap;
        }

        .toolbar-search-wrap {
          position: relative;
          flex: 1;
          min-width: 260px;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          pointer-events: none;
        }

        .toolbar-search-input {
          width: 100%;
          height: 40px;
          padding: 0 14px 0 38px;
          font-size: 0.85rem;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          outline: none;
          font-family: inherit;
        }

        .toolbar-search-input:focus {
          border-color: #1b4332;
          box-shadow: 0 0 0 2px rgba(27, 67, 50, 0.1);
        }

        .toolbar-filters-group {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .filter-select-wrap {
          position: relative;
        }

        .filter-select-icon {
          position: absolute;
          left: 10px;
          top: 50%;
          transform: translateY(-50%);
          color: #64748b;
          pointer-events: none;
        }

        .toolbar-select {
          height: 40px;
          padding: 0 28px 0 30px;
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

        .toolbar-select:focus {
          border-color: #1b4332;
        }

        /* Table */
        .table-responsive-container {
          overflow-x: auto;
        }

        .warden-data-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .warden-data-table th {
          background: #f8fafc;
          padding: 12px 18px;
          font-size: 0.74rem;
          font-weight: 800;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          border-bottom: 1px solid #e2e8f0;
        }

        .warden-data-table td {
          padding: 14px 18px;
          border-bottom: 1px solid #f1f5f9;
          font-size: 0.86rem;
          vertical-align: middle;
        }

        .warden-table-row:hover {
          background: #f8fafc;
        }

        .entity-cell {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .entity-thumb {
          width: 44px;
          height: 44px;
          border-radius: 8px;
          object-fit: cover;
          flex-shrink: 0;
        }

        .entity-name {
          font-weight: 700;
          color: #0f172a;
          display: block;
        }

        .entity-subtext {
          font-size: 0.76rem;
          color: #64748b;
        }

        .category-tag {
          display: inline-block;
          font-size: 0.72rem;
          font-weight: 700;
          color: #1b4332;
          background: #e8f5e9;
          padding: 3px 8px;
          border-radius: 6px;
        }

        .spec-text {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          color: #475569;
          font-size: 0.82rem;
        }

        .price-tag {
          font-weight: 800;
          color: #0f172a;
          font-size: 0.92rem;
        }

        .price-unit {
          font-size: 0.72rem;
          color: #64748b;
          font-weight: 500;
        }

        .rating-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 0.76rem;
          font-weight: 800;
          color: #92400e;
          background: #fef3c7;
          padding: 2px 7px;
          border-radius: 6px;
        }

        .status-pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 0.74rem;
          font-weight: 700;
          padding: 2px 7px;
          border-radius: 6px;
        }

        .status-pill.active {
          background: #ecfdf5;
          color: #047857;
        }

        .status-pill.inactive {
          background: #f1f5f9;
          color: #64748b;
        }

        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: currentColor;
        }

        /* Action Menu Dropdown */
        .row-actions-menu-container {
          position: relative;
          display: inline-block;
        }

        .row-menu-trigger {
          background: none;
          border: 1px solid transparent;
          padding: 6px;
          border-radius: 6px;
          color: #64748b;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .row-menu-trigger:hover {
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
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
          min-width: 150px;
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

        .dropdown-item.danger {
          color: #ef4444;
        }

        .dropdown-item.danger:hover {
          background: #fef2f2;
          color: #dc2626;
        }

        .dropdown-divider {
          height: 1px;
          background: #f1f5f9;
          margin: 4px 0;
        }

        /* Empty State */
        .empty-inventory-state {
          padding: 48px 24px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .empty-title {
          font-size: 1.1rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 4px 0;
        }

        .empty-desc {
          font-size: 0.85rem;
          color: #64748b;
          margin: 0;
          max-width: 400px;
        }

        /* -------------------------------------------------- */
        /* RESPONSIVE BREAKPOINTS                             */
        /* -------------------------------------------------- */
        @media (max-width: 1200px) {
          .kpi-hierarchy-grid {
            grid-template-columns: repeat(3, 1fr);
          }
          .kpi-card.primary-kpi {
            grid-column: span 3;
          }
          .kpi-card.secondary-kpi {
            grid-column: span 1;
          }
          .analytics-dual-grid {
            grid-template-columns: 1fr;
          }
          .operations-activity-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .warden-dashboard-root {
            padding: 20px 14px 48px 14px;
          }
          .warden-header-bar {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }
          .warden-header-actions {
            width: 100%;
            justify-content: flex-start;
            flex-wrap: wrap;
          }
          .kpi-hierarchy-grid {
            grid-template-columns: 1fr 1fr;
          }
          .kpi-card.primary-kpi {
            grid-column: span 2;
          }
          .kpi-card.secondary-kpi {
            grid-column: span 1;
          }
          .inventory-panel-header {
            flex-direction: column;
            align-items: flex-start;
          }
          .inventory-toolbar {
            flex-direction: column;
            align-items: stretch;
          }
          .toolbar-filters-group {
            flex-direction: column;
          }
          .toolbar-select {
            width: 100%;
          }
        }

        @media (max-width: 480px) {
          .kpi-hierarchy-grid {
            grid-template-columns: 1fr;
          }
          .kpi-card.primary-kpi,
          .kpi-card.secondary-kpi {
            grid-column: span 1;
          }
          .ops-workload-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

// Helper EyeIcon
const EyeIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export default AdminDashboard;
