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
  updateOrderStatus,
  unassignEngineer,
} from "../api/bookingApi";
import BookingDetailsModal from "../components/BookingDetailsModal";
import AssignEngineerModal from "../components/AssignEngineerModal";
import { useDebounce } from "../hooks/useDebounce";

const Bookings = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [orderForAssignment, setOrderForAssignment] = useState<any>(null);

  const [stats, setStats] = useState({
    totalRevenue: 0,
    upcomingCount: 0,
    acceptedCount: 0,
    completedCount: 0
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
      const response = await getAllBookings({
        page,
        limit: 10,
        search,
        status: statusFilter
      });

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
  }, [page, search, statusFilter]);

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
      Upcoming: "bg-blue-50 text-blue-700 border-blue-100",
      Accepted: "bg-indigo-50 text-indigo-700 border-indigo-100",
      "In Progress": "bg-purple-50 text-purple-700 border-purple-100",
      Completed: "bg-emerald-50 text-emerald-700 border-emerald-100",
      Cancelled: "bg-red-50 text-red-700 border-red-100",
      Rejected: "bg-gray-50 text-gray-700 border-gray-100",
    };
    return config[status as keyof typeof config] || config.Upcoming;
  };

  const getPaymentBadge = (status: string) => {
    if (status === "PAS_PENDING")
      return "bg-amber-50 text-amber-700 border-amber-100";
    if (status === "PAID" || status === "paid")
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
    <div className="animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Booking Management</h1>
        <p className="text-gray-500 mt-2 font-medium text-lg">
          Track and manage all service bookings and assignments.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center space-x-4 transition-all hover:scale-105">
          <div className="p-3 bg-blue-50 rounded-2xl">
            <RefreshCw className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total</p>
            <p className="text-2xl font-black text-gray-900">{pagination.totalCount}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center space-x-4 transition-all hover:scale-105">
          <div className="p-3 bg-amber-50 rounded-2xl">
            <Clock className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Upcoming</p>
            <p className="text-2xl font-black text-amber-600">{stats.upcomingCount}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center space-x-4 transition-all hover:scale-105">
          <div className="p-3 bg-indigo-50 rounded-2xl">
            <Wrench className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Accepted</p>
            <p className="text-2xl font-black text-indigo-600">{stats.acceptedCount}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center space-x-4 transition-all hover:scale-105">
          <div className="p-3 bg-emerald-50 rounded-2xl">
            <div className="w-6 h-6 bg-emerald-600 rounded-full" />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Completed</p>
            <p className="text-2xl font-black text-emerald-600">{stats.completedCount}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center space-x-4 transition-all hover:scale-105">
          <div className="p-3 bg-blue-600 rounded-2xl">
            <span className="text-white font-black text-xs">₹</span>
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Revenue</p>
            <p className="text-2xl font-black text-blue-600">₹{stats.totalRevenue.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-6 mb-8">
        <div className="relative w-full lg:w-[32rem]">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-300" />
          <input
            type="text"
            placeholder="Search by ID, Customer or Phone..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-16 pr-6 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-500/20 focus:bg-white rounded-[2rem] outline-none transition-all placeholder:text-gray-400 font-bold text-gray-700"
          />
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => handleStatusFilterChange(e.target.value)}
            className="w-full sm:w-64 px-6 py-4 bg-gray-50 border-none rounded-[2rem] focus:ring-2 focus:ring-blue-500/20 outline-none font-bold text-gray-600 appearance-none cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="Upcoming">Upcoming</option>
            <option value="Accepted">Accepted</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Rejected">Rejected</option>
          </select>
          
          <button 
            onClick={fetchBookings}
            className="p-4 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-[1.5rem] transition-all"
            title="Refresh List"
          >
            <RefreshCw className={`w-6 h-6 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-6 bg-red-50 border-2 border-red-100 rounded-3xl text-red-600 font-bold flex items-center mb-8">
          <AlertCircle className="w-5 h-5 mr-4" />
          {error}
        </div>
      )}

      {/* Bookings Table */}
      <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Booking ID</th>
                <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Customer</th>
                <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Service</th>
                <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Schedule</th>
                <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Engineer</th>
                <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-6 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount</th>
                <th className="px-8 py-6 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {bookings.map((booking) => {
                const createdTime = formatDateTime(booking.createdAt);
                const scheduledTime = booking.scheduledAt ? formatDateTime(booking.scheduledAt) : null;

                return (
                  <tr key={booking._id} className="hover:bg-blue-50/30 transition-all duration-300 group">
                    <td className="px-8 py-6">
                      <div className="space-y-1">
                        <p className="text-sm font-black text-gray-900">{booking.orderId}</p>
                        <p className="text-[10px] font-bold text-gray-400">{createdTime.date} • {createdTime.time}</p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-gray-900">{booking.customerDetails?.name || "N/A"}</span>
                        <span className="text-[11px] font-bold text-gray-400">{booking.customerDetails?.phone || "N/A"}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-2xl bg-gray-50 overflow-hidden flex-shrink-0 border border-gray-100">
                          {booking.servicePlan?.image ? (
                            <img src={booking.servicePlan.image} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"><Wrench className="w-4 h-4 text-gray-300" /></div>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-gray-900 truncate max-w-[120px]">{booking.servicePlan?.name || "Service"}</span>
                          <span className="text-[10px] font-black text-blue-600 uppercase">{booking.servicePlan?.category?.name || "General"}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      {scheduledTime ? (
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-gray-900">{scheduledTime.date}</span>
                          <span className="text-[11px] font-bold text-amber-600 uppercase">{scheduledTime.time}</span>
                        </div>
                      ) : (
                        <span className="text-[11px] font-bold text-gray-300 italic">Unscheduled</span>
                      )}
                    </td>
                    <td className="px-8 py-6">
                      {booking.assignedEngineer ? (
                        <div className="flex flex-col">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="w-6 h-6 rounded-lg bg-blue-100 flex items-center justify-center">
                              <User className="w-3 h-3 text-blue-600" />
                            </div>
                            <span className="text-[13px] font-black text-gray-900">{booking.assignedEngineer.name}</span>
                          </div>
                          {booking.orderStatus !== 'Completed' && booking.orderStatus !== 'Cancelled' && (
                            <button
                              onClick={() => handleUnassign(booking._id)}
                              className="text-[10px] font-black text-red-600 hover:text-red-800 uppercase tracking-widest text-left"
                            >
                              Unassign
                            </button>
                          )}
                        </div>
                      ) : (
                        booking.orderStatus !== 'Completed' && booking.orderStatus !== 'Cancelled' ? (
                          <button
                            onClick={() => {
                              setOrderForAssignment(booking);
                              setIsAssignModalOpen(true);
                            }}
                            className="flex items-center text-blue-600 hover:text-blue-700 font-black text-[11px] uppercase tracking-widest group/btn"
                          >
                            <UserPlus className="w-4 h-4 mr-2 transition-transform group-hover/btn:scale-110" />
                            Assign
                          </button>
                        ) : (
                          <span className="text-[10px] font-bold text-gray-300 uppercase italic">Locked</span>
                        )
                      )}
                    </td>
                    <td className="px-8 py-6">
                      <div className="relative inline-block">
                        <select
                          value={booking.orderStatus}
                          disabled={booking.orderStatus === 'Completed' || booking.orderStatus === 'Cancelled'}
                          onChange={(e) => handleStatusChange(booking._id, e.target.value)}
                          className={`appearance-none pl-4 pr-10 py-2 text-[11px] font-black uppercase tracking-widest rounded-2xl border-none cursor-pointer focus:ring-2 focus:ring-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${getStatusBadge(booking.orderStatus)}`}
                        >
                          <option value="Upcoming">Upcoming</option>
                          <option value="Accepted">Accepted</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-current">
                          <ChevronLeft className="w-3 h-3 rotate-[-90deg]" />
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <span className="text-sm font-black text-gray-900">₹{booking.amount || booking.finalAmount}</span>
                      <p className={`text-[9px] font-black uppercase tracking-tighter mt-1 ${getPaymentBadge(booking.paymentStatus).split(' ')[1]}`}>
                        {booking.paymentStatus || "PENDING"}
                      </p>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button
                        onClick={() => setSelectedBooking(booking)}
                        className="p-3 bg-gray-50 text-gray-400 hover:bg-blue-600 hover:text-white rounded-2xl transition-all shadow-sm"
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
            <div className="py-32 text-center">
              <Search className="w-16 h-16 text-gray-100 mx-auto mb-6" />
              <h3 className="text-2xl font-black text-gray-900">No bookings found</h3>
              <p className="text-gray-500 mt-2 font-medium">Try adjusting your filters or search terms.</p>
            </div>
          )}
        </div>

        {/* Proper Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-8 py-10 bg-gray-50/50 border-t border-gray-50">
            <p className="text-sm font-bold text-gray-400">
              Showing <span className="text-gray-900">{(page - 1) * pagination.limit + 1}</span> to <span className="text-gray-900">{Math.min(page * pagination.limit, pagination.totalCount)}</span> of <span className="text-gray-900">{pagination.totalCount}</span> Bookings
            </p>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="p-4 bg-white border-2 border-gray-100 rounded-2xl shadow-sm hover:shadow-xl hover:border-blue-100 disabled:opacity-20 disabled:hover:shadow-none transition-all text-gray-600"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              
              <div className="flex items-center space-x-2">
                {getPageNumbers().map((num, i) => (
                  num === '...' ? (
                    <div key={`dots-${i}`} className="px-2">
                      <MoreHorizontal className="w-5 h-5 text-gray-300" />
                    </div>
                  ) : (
                    <button
                      key={num}
                      onClick={() => handlePageChange(num as number)}
                      className={`w-12 h-12 rounded-2xl text-sm font-black transition-all ${
                        page === num 
                          ? 'bg-blue-600 text-white shadow-2xl shadow-blue-200 scale-110' 
                          : 'bg-white border-2 border-gray-100 text-gray-400 hover:border-blue-500/20 hover:text-blue-600'
                      }`}
                    >
                      {num}
                    </button>
                  )
                ))}
              </div>

              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === pagination.totalPages}
                className="p-4 bg-white border-2 border-gray-100 rounded-2xl shadow-sm hover:shadow-xl hover:border-blue-100 disabled:opacity-20 disabled:hover:shadow-none transition-all text-gray-600"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}
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
