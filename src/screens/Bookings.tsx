import React, { useState, useEffect } from "react";
import {
  Search,
  Eye,
  MapPin,
  Clock,
  User,
  Wrench,
  Loader2,
  AlertCircle,
  Phone,
  Mail,
  UserPlus,
} from "lucide-react";
import {
  getAllBookings,
  updateOrderStatus,
  unassignEngineer,
} from "../api/bookingApi";
import BookingDetailsModal from "../components/BookingDetailsModal";
import AssignEngineerModal from "../components/AssignEngineerModal";

const Bookings = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [orderForAssignment, setOrderForAssignment] = useState<any>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllBookings();
      // Handle different possible backend response structures safely
      const bookingsData =
        response?.data || (Array.isArray(response) ? response : []);
      setBookings(bookingsData);
    } catch (err: any) {
      console.error("Error fetching bookings:", err);
      setError("Failed to load bookings. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateOrderStatus(id, newStatus);
      // Update local state
      setBookings((prev) =>
        prev.map((b) => (b._id === id ? { ...b, orderStatus: newStatus } : b)),
      );
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
      fetchBookings(); // Refresh to get clean state
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

  const filteredBookings = bookings.filter((booking) => {
    const customerName = booking.customerDetails?.name || "";
    const orderId = booking.orderId || "";
    const serviceName = booking.servicePlan?.name || "";

    const matchesSearch =
      customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      serviceName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || booking.orderStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-600 font-medium">Loading bookings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          Error Loading Data
        </h3>
        <p className="text-gray-600 mb-6 max-w-sm">{error}</p>
        <button
          onClick={fetchBookings}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Booking Management</h1>
        <p className="text-gray-600 mt-2">
          Track and manage all service bookings and assignments.
        </p>
      </div>
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Bookings
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {bookings.length}
              </p>
            </div>
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Upcoming</p>
              <p className="text-2xl font-bold text-blue-600">
                {bookings.filter((b) => b.orderStatus === "Upcoming").length}
              </p>
            </div>
            <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center">
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Accepted</p>
              <p className="text-2xl font-bold text-indigo-600">
                {bookings.filter((b) => b.orderStatus === "Accepted").length}
              </p>
            </div>
            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
              <Wrench className="w-4 h-4 text-indigo-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">
                {bookings.filter((b) => b.orderStatus === "Completed").length}
              </p>
            </div>
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-green-600 rounded-full"></div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Revenue</p>
              <p className="text-2xl font-bold text-blue-600">
                ₹
                {(Array.isArray(bookings) ? bookings : [])
                  .reduce(
                    (acc, curr) =>
                      acc +
                      (Number(curr.amount) || Number(curr.finalAmount) || 0),
                    0,
                  )
                  .toLocaleString()}
              </p>
            </div>
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by customer, booking ID, or service..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <select
              className="flex-1 md:flex-none px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
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
              className="flex-1 md:flex-none px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>
      {/* Bookings Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#f8f9fa] border-y border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Booking ID
                </th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Booking Details
                </th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Engineer
                </th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Order Status
                </th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-4 text-right text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBookings.map((booking) => {
                const createdTime = formatDateTime(booking.createdAt);
                const scheduledTime = booking.scheduledAt
                  ? formatDateTime(booking.scheduledAt)
                  : null;

                return (
                  <tr
                    key={booking._id}
                    className="hover:bg-gray-50/50 transition-colors border-b border-gray-50 last:border-0"
                  >
                    <td className="px-6 py-5">
                      <div className="space-y-1">
                        <p className="text-[13px] font-bold text-gray-900">
                          {booking.orderId}
                        </p>
                        <p className="text-[12px] text-gray-500">
                          {createdTime.date}
                        </p>
                        <p className="text-[12px] text-gray-400">
                          {createdTime.time}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="space-y-1.5">
                        <div className="flex items-center text-[13px] font-bold text-gray-900">
                          <User className="w-3.5 h-3.5 mr-2 text-gray-400" />
                          {booking.customerDetails?.name || "N/A"}
                        </div>
                        <div className="flex items-center text-[12px] text-gray-500">
                          <Phone className="w-3.5 h-3.5 mr-2 text-gray-400" />
                          {booking.customerDetails?.phone || "N/A"}
                        </div>
                        <div className="flex items-center text-[12px] text-gray-400">
                          <Mail className="w-3.5 h-3.5 mr-2 text-gray-400" />
                          {booking.customerDetails?.email || "N/A"}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="space-y-1">
                        <p className="text-[13px] font-bold text-gray-900">
                          {booking.servicePlan?.name || "Booking"}
                        </p>
                        <p className="text-[12px] text-gray-500">
                          {booking.servicePlan?.category?.name || "Service"}
                        </p>
                        {booking.servicePlan?.image && (
                          <div className="mt-1 w-10 h-10 rounded-lg border border-gray-100 overflow-hidden bg-gray-50">
                            <img
                              src={booking.servicePlan.image}
                              alt="Service"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      {scheduledTime ? (
                        <div className="space-y-1">
                          <p className="text-[12px] font-medium text-gray-900">
                            {scheduledTime.date}
                          </p>
                          <p className="text-[12px] text-gray-500">
                            {scheduledTime.time}
                          </p>
                        </div>
                      ) : (
                        <p className="text-[12px] text-gray-400 italic">
                          Not scheduled
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      {booking.assignedEngineer ? (
                        <div className="flex flex-col items-center">
                          <div className="flex items-center mb-1">
                            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                              <User className="w-3.5 h-3.5 text-blue-600" />
                            </div>
                            <span className="text-[13px] font-medium text-gray-900">
                              {booking.assignedEngineer.name || "Engineer"}
                            </span>
                          </div>
                          <button
                            onClick={() => handleUnassign(booking._id)}
                            className="text-[11px] font-bold text-red-600 bg-red-50 px-3 py-1 rounded-md hover:bg-red-100 transition-colors"
                          >
                            Unassign
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setOrderForAssignment(booking);
                            setIsAssignModalOpen(true);
                          }}
                          className="flex items-center text-blue-600 hover:text-blue-700 font-bold text-[13px] group"
                        >
                          <UserPlus className="w-4 h-4 mr-1.5 transition-transform group-hover:scale-110" />
                          Assign Engineer
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getPaymentBadge(booking.paymentStatus)}`}
                      >
                        {booking.paymentStatus === "PAS_PENDING"
                          ? "pending"
                          : booking.paymentStatus === "PAID"
                            ? "paid"
                            : booking.paymentStatus || "pending"}
                      </span>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="relative inline-block">
                        <select
                          value={booking.orderStatus}
                          onChange={(e) =>
                            handleStatusChange(booking._id, e.target.value)
                          }
                          className={`appearance-none pl-3 pr-8 py-1 text-[11px] font-bold rounded-full border cursor-pointer focus:outline-none transition-all ${getStatusBadge(booking.orderStatus)}`}
                        >
                          <option value="Upcoming">Upcoming</option>
                          <option value="Accepted">Accepted</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-current">
                          <svg
                            className="fill-current h-3 w-3"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                          </svg>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-[13px] font-bold text-gray-900">
                      ₹{booking.amount || booking.finalAmount}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-right">
                      <button
                        onClick={() => setSelectedBooking(booking)}
                        className="text-blue-600 hover:bg-blue-50 p-2 rounded-full transition-all"
                        title="View Details"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredBookings.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-gray-500">No bookings found</p>
            </div>
          )}
        </div>
      </div>
      {/* Booking Details Modal */}
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
