import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search,
  Eye,
  Clock,
  User,
  Wrench,
  Loader2,
  AlertCircle,
  Phone,
  Mail,
  UserPlus,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal
} from "lucide-react";
import {
  getAllBookings,
  getAllVendorBookings,
  updateOrderStatus,
  unassignEngineer,
} from "../api/bookingApi";
import BookingDetailsModal from "../components/BookingDetailsModal";
import AssignEngineerModal from "../components/AssignEngineerModal";
import Pagination from "../components/Pagination";
import { useDebounce } from "../hooks/useDebounce";

const Bookings = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [orderForAssignment, setOrderForAssignment] = useState<any>(null);
  
  // New state for booking type
  const [bookingType, setBookingType] = useState<'user' | 'vendor'>('user');

  const [stats, setStats] = useState({
    totalRevenue: 0,
    upcomingCount: 0,
    acceptedCount: 0,
    completedCount: 0,
    pendingCount: 0 // For vendor
  });

  const [pagination, setPagination] = useState({
    totalCount: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 10
  });

  // URL State
  const page = parseInt(searchParams.get('page') || '1');
  const search = searchParams.get('search') || '';
  const statusFilter = searchParams.get('status') || 'all';

  // Local Search Input
  const [searchInput, setSearchInput] = useState(search);
  const debouncedSearch = useDebounce(searchInput, 500);

  // Sync debounced search to URL
  useEffect(() => {
    const currentSearch = searchParams.get('search') || '';
    if (debouncedSearch !== currentSearch) {
      setSearchParams(prev => {
        if (debouncedSearch) {
          prev.set('search', debouncedSearch);
        } else {
          prev.delete('search');
        }
        prev.set('page', '1');
        return prev;
      }, { replace: true });
    }
  }, [debouncedSearch, setSearchParams, searchParams]);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page,
        limit: 10,
        search,
        status: statusFilter
      };

      const response = bookingType === 'user' 
        ? await getAllBookings(params)
        : await getAllVendorBookings(params);

      if (response.success) {
        setBookings(response.data);
        if (response.stats) {
          setStats(response.stats);
        }
        if (response.pagination) {
          setPagination(response.pagination);
        }
      }
    } catch (err: any) {
      console.error("Error fetching bookings:", err);
      setError("Failed to load bookings. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, bookingType]);

  useEffect(() => {
    const handleOpenAssignModal = (e: any) => {
      setOrderForAssignment(e.detail);
      setIsAssignModalOpen(true);
    };
    window.addEventListener('OPEN_ASSIGN_MODAL', handleOpenAssignModal);
    return () => window.removeEventListener('OPEN_ASSIGN_MODAL', handleOpenAssignModal);
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handlePageChange = (newPage: number) => {
    setSearchParams(prev => {
      prev.set('page', newPage.toString());
      return prev;
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStatusFilterChange = (newStatus: string) => {
    setSearchParams(prev => {
      if (newStatus === 'all') {
        prev.delete('status');
      } else {
        prev.set('status', newStatus);
      }
      prev.set('page', '1');
      return prev;
    });
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateOrderStatus(id, newStatus);
      fetchBookings(); // Refresh to sync all status fields (work_status, lifecycle, etc.)
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update status");
    }
  };

  const handleUnassign = async (id: string) => {
    if (!window.confirm("Are you sure you want to unassign the engineer?"))
      return;
    try {
      await unassignEngineer(id);
      fetchBookings();
    } catch (err) {
      console.error("Error unassigning:", err);
      alert("Failed to unassign engineer");
    }
  };

  const getStatusBadge = (status: string) => {
    const config = {
      // User Statuses
      Upcoming: "bg-blue-50 text-blue-700 border-blue-100",
      Accepted: "bg-indigo-50 text-indigo-700 border-indigo-100",
      "In Progress": "bg-purple-50 text-purple-700 border-purple-100",
      Completed: "bg-emerald-50 text-emerald-700 border-emerald-100",
      Cancelled: "bg-red-50 text-red-700 border-red-100",
      Rejected: "bg-gray-50 text-gray-700 border-gray-100",
      ExpertUnavailable: "bg-orange-50 text-orange-700 border-orange-100",
      
      // Vendor Statuses
      PENDING: "bg-amber-50 text-amber-700 border-amber-100",
      MATCHING: "bg-blue-50 text-blue-700 border-blue-100",
      ACCEPTED: "bg-indigo-50 text-indigo-700 border-indigo-100",
      COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-100",
      CANCELLED: "bg-red-50 text-red-700 border-red-100",
      EXPIRED: "bg-gray-50 text-gray-700 border-gray-100",
      STARTED: "bg-purple-50 text-purple-700 border-purple-100",
      IN_PROGRESS: "bg-purple-50 text-purple-700 border-purple-100",
    };
    return config[status as keyof typeof config] || config.Upcoming;
  };

  const getPaymentBadge = (status: string) => {
    if (status === "PAS_PENDING")
      return "bg-amber-50 text-amber-700 border-amber-100";
    if (status === "PAID" || status === "paid" || status === "COMPLETED")
      return "bg-emerald-50 text-emerald-700 border-emerald-100";
    return "bg-gray-50 text-gray-700 border-gray-100";
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return { date: "N/A", time: "" };
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return { date: "N/A", time: "" };

    const d = date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const t = date
      .toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
      .toLowerCase();

    return { date: d, time: t };
  };

  const getPageNumbers = () => {
    const total = pagination.totalPages;
    const current = pagination.currentPage;
    const pages: (number | string)[] = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      if (current <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', total);
      } else if (current >= total - 3) {
        pages.push(1, '...', total - 4, total - 3, total - 2, total - 1, total);
      } else {
        pages.push(1, '...', current - 1, current, current + 1, '...', total);
      }
    }
    return pages;
  };

  if (loading && bookings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-600 font-medium">Loading bookings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Booking Management</h1>
          <p className="text-gray-500 mt-1">Track and manage all service bookings and assignments.</p>
        </div>

        {/* Tab System */}
        <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-gray-100">
          <button
            onClick={() => {
              setBookingType('user');
              setSearchParams(prev => { prev.delete('status'); prev.set('page', '1'); return prev; });
            }}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              bookingType === 'user' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            User Bookings
          </button>
          <button
            onClick={() => {
              setBookingType('vendor');
              setSearchParams(prev => { prev.delete('status'); prev.set('page', '1'); return prev; });
            }}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              bookingType === 'vendor' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Vendor Bookings
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Bookings</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{pagination.totalCount}</p>
          </div>
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
            <RefreshCw className="w-6 h-6" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{bookingType === 'user' ? 'Upcoming' : 'Pending'}</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">
              {bookingType === 'user' ? stats.upcomingCount : (stats as any).pendingCount || 0}
            </p>
          </div>
          <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
            <Clock className="w-6 h-6" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Completed</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.completedCount}</p>
          </div>
          <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
            <Wrench className="w-6 h-6" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Revenue</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">₹{(stats.totalRevenue || 0).toLocaleString()}</p>
          </div>
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
            <span className="text-xl font-bold">₹</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="relative w-full lg:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by ID, Customer or Phone..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-transparent focus:border-blue-500 focus:bg-white rounded-xl outline-none transition-all text-sm"
          />
        </div>
        
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => handleStatusFilterChange(e.target.value)}
            className="flex-1 lg:w-48 px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none text-sm font-medium text-gray-700"
          >
            <option value="all">All Status</option>
            {bookingType === 'user' ? (
              <>
                <option value="Upcoming">Upcoming</option>
                <option value="Accepted">Accepted</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Rejected">Rejected</option>
              </>
            ) : (
              <>
                <option value="PENDING">Pending</option>
                <option value="MATCHING">Matching</option>
                <option value="ACCEPTED">Accepted</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="EXPIRED">Expired</option>
              </>
            )}
          </select>
          
          <button 
            onClick={fetchBookings}
            className="p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all border border-gray-100"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium flex items-center">
          <AlertCircle className="w-5 h-5 mr-3" />
          {error}
        </div>
      )}

      {/* Bookings Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-left">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{bookingType === 'user' ? 'Booking ID' : 'Call ID'}</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{bookingType === 'user' ? 'Customer' : 'Vendor Detail'}</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{bookingType === 'user' ? 'Service' : 'Project/Asset'}</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{bookingType === 'user' ? 'Schedule' : 'Address'}</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Engineer</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bookings.map((booking) => {
                const createdTime = formatDateTime(booking.createdAt || booking.created_at);
                const scheduledTime = booking.scheduledAt ? formatDateTime(booking.scheduledAt) : null;
                const displayId = bookingType === 'user' ? booking.orderId : booking.call_id;
                const currentStatus = bookingType === 'user' ? booking.orderStatus : booking.status;
                const assignedEngineer = bookingType === 'user' ? booking.assignedEngineer : booking.assignedEngineer;

                return (
                  <tr key={booking._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-gray-900">{displayId}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{createdTime.date} • {createdTime.time}</p>
                    </td>
                    <td className="px-6 py-4">
                      {bookingType === 'user' ? (
                        <div>
                          <p className="text-sm font-medium text-gray-900">{booking.customerDetails?.name || "N/A"}</p>
                          <p className="text-[11px] text-gray-500">{booking.customerDetails?.phone || "N/A"}</p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm font-medium text-gray-900">{booking.contact_name || "Vendor Client"}</p>
                          <p className="text-[11px] text-gray-500">{booking.contact_phone || "N/A"}</p>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {bookingType === 'user' ? (
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-lg bg-gray-50 overflow-hidden border border-gray-100">
                            {booking.servicePlan?.image ? (
                              <img src={booking.servicePlan.image} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center"><Wrench className="w-4 h-4 text-gray-300" /></div>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 truncate max-w-[150px]">{booking.servicePlan?.name || "Service"}</p>
                            <p className="text-[10px] text-blue-600 font-bold uppercase">{booking.servicePlan?.category?.name || "General"}</p>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm font-medium text-gray-900">{booking.projectId || "N/A"}</p>
                          <p className="text-[10px] text-gray-500 font-bold uppercase">{booking.asset_type || "Asset"}</p>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {bookingType === 'user' ? (
                        scheduledTime ? (
                          <div>
                            <p className="text-sm font-medium text-gray-900">{scheduledTime.date}</p>
                            <p className="text-[11px] text-amber-600 font-bold">{scheduledTime.time}</p>
                          </div>
                        ) : (
                          <span className="text-[11px] text-gray-300 italic">Unscheduled</span>
                        )
                      ) : (
                        <p className="text-xs text-gray-600 line-clamp-2 max-w-[150px]">{booking.complete_address || "N/A"}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {assignedEngineer ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center">
                            <User className="w-3.5 h-3.5 text-blue-600" />
                          </div>
                          <span className="text-sm font-medium text-gray-900">{assignedEngineer.name}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusBadge(currentStatus)}`}>
                        {currentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="text-sm font-bold text-gray-900">₹{bookingType === 'user' ? (booking.amount || booking.finalAmount) : booking.order_price}</p>
                      <p className="text-[10px] text-gray-500 font-bold uppercase">{booking.paymentStatus || "PENDING"}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedBooking({ ...booking, isVendor: bookingType === 'vendor' })}
                        className="p-2 hover:bg-blue-50 text-gray-400 hover:text-blue-600 rounded-lg transition-colors"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {bookings.length === 0 && !loading && (
            <div className="py-20 text-center">
              <Search className="w-12 h-12 text-gray-100 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900">No bookings found</h3>
              <p className="text-sm text-gray-500 mt-1">Try adjusting your filters.</p>
            </div>
          )}
        </div>

        <Pagination 
          currentPage={page}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
        />
      </div>

      {/* Modals */}
      {selectedBooking && (
        <BookingDetailsModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
        />
      )}
      {isAssignModalOpen && orderForAssignment && (
        <AssignEngineerModal
          order={orderForAssignment}
          onClose={() => {
            setIsAssignModalOpen(false);
            setOrderForAssignment(null);
          }}
          onSuccess={fetchBookings}
        />
      )}
    </div>
  );
};

export default Bookings;
