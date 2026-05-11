import React from 'react';
import { X, Calendar, Clock, MapPin, User, Mail, Phone, CreditCard, Tag, Wrench, ShieldCheck, Activity } from 'lucide-react';

interface BookingDetailsModalProps {
  booking: any;
  onClose: () => void;
}

const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({ booking, onClose }) => {
  if (!booking) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusColor = (status: string) => {
    const s = status?.toLowerCase();
    if (s === 'paid' || s === 'completed') return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    if (s === 'upcoming' || s === 'accepted') return 'bg-blue-50 text-blue-700 border-blue-100';
    if (s === 'cancelled' || s === 'rejected') return 'bg-red-50 text-red-700 border-red-100';
    return 'bg-gray-50 text-gray-700 border-gray-100';
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-3xl relative animate-in fade-in zoom-in duration-300 overflow-hidden">
        {/* Header Section */}
        <div className="bg-gray-50/50 px-8 py-8 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-3">
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">Booking Details</h2>
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(booking.orderStatus)}`}>
                  {booking.orderStatus || 'N/A'}
                </span>
              </div>
              <p className="text-gray-400 font-bold text-sm">ID: {booking.orderId}</p>
            </div>
            <button 
              onClick={onClose}
              className="p-3 hover:bg-white hover:shadow-lg rounded-2xl transition-all text-gray-400 hover:text-red-500"
            >
              <X className="w-8 h-8" />
            </button>
          </div>
        </div>

        <div className="p-8 space-y-10 max-h-[75vh] overflow-y-auto custom-scrollbar">
          {/* Quick Summary Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 bg-blue-50/50 rounded-3xl border border-blue-100/50">
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Total Amount</p>
              <p className="text-2xl font-black text-blue-600 font-mono">₹{booking.amount || booking.finalAmount || 0}</p>
            </div>
            <div className="p-5 bg-emerald-50/50 rounded-3xl border border-emerald-100/50">
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Payment Status</p>
              <p className="text-2xl font-black text-emerald-600 uppercase text-sm tracking-tighter">{booking.paymentStatus || booking.status || 'CREATED'}</p>
            </div>
            <div className="p-5 bg-purple-50/50 rounded-3xl border border-purple-100/50">
              <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-1">Work Status</p>
              <p className="text-2xl font-black text-purple-600 uppercase text-sm tracking-tighter">{booking.work_status || 'NOT STARTED'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Customer Section */}
            <section className="space-y-6">
              <div className="flex items-center space-x-3 pb-2 border-b-2 border-gray-50">
                <div className="p-2 bg-gray-900 rounded-xl">
                  <User className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-black text-gray-900 tracking-tight">Customer Information</h3>
              </div>
              <div className="space-y-4 px-1">
                <div className="flex items-center space-x-4 group">
                  <div className="p-3 bg-gray-50 rounded-2xl transition-colors group-hover:bg-blue-50">
                    <User className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Full Name</p>
                    <p className="text-base font-black text-gray-900">{booking.customerDetails?.name || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 group">
                  <div className="p-3 bg-gray-50 rounded-2xl transition-colors group-hover:bg-blue-50">
                    <Phone className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mobile Number</p>
                    <p className="text-base font-black text-gray-900">{booking.customerDetails?.phone || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 group">
                  <div className="p-3 bg-gray-50 rounded-2xl transition-colors group-hover:bg-blue-50">
                    <Mail className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email Address</p>
                    <p className="text-base font-black text-gray-900 truncate">{booking.customerDetails?.email || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Service Section */}
            <section className="space-y-6">
              <div className="flex items-center space-x-3 pb-2 border-b-2 border-gray-50">
                <div className="p-2 bg-gray-900 rounded-xl">
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-black text-gray-900 tracking-tight">Service Context</h3>
              </div>
              <div className="space-y-4 px-1">
                <div className="flex items-center space-x-4 group">
                  <div className="p-3 bg-gray-50 rounded-2xl transition-colors group-hover:bg-blue-50">
                    <Wrench className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Main Service</p>
                    <p className="text-base font-black text-gray-900">{booking.servicePlan?.name || 'Custom Booking'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 group">
                  <div className="p-3 bg-gray-50 rounded-2xl transition-colors group-hover:bg-blue-50">
                    <Tag className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Service Category</p>
                    <p className="text-base font-black text-blue-600 uppercase tracking-tighter">{booking.servicePlan?.category?.name || 'General'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 group">
                  <div className="p-3 bg-gray-50 rounded-2xl transition-colors group-hover:bg-blue-50">
                    <CreditCard className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Payment Gateway ID</p>
                    <p className="text-sm font-black text-gray-900">{booking.razorpayOrderId || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Appointment Section */}
          <section className="space-y-6">
            <div className="flex items-center space-x-3 pb-2 border-b-2 border-gray-50">
              <div className="p-2 bg-gray-900 rounded-xl">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-black text-gray-900 tracking-tight">Appointment & Location</h3>
            </div>
            <div className="bg-gray-50 rounded-[2rem] p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 pb-8 border-b border-gray-200/50">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Scheduled Date</p>
                    <p className="text-lg font-black text-gray-900">{booking.bookingDetails?.date || (booking.scheduledAt ? new Date(booking.scheduledAt).toLocaleDateString() : 'N/A')}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center">
                    <Clock className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Time Slot</p>
                    <p className="text-lg font-black text-gray-900">{booking.bookingDetails?.time || (booking.scheduledAt ? new Date(booking.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A')}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Service Address</p>
                  <p className="text-base font-bold text-gray-700 leading-relaxed max-w-xl">
                    {booking.bookingDetails?.address || booking.addressText || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Engineer Section (Conditional) */}
          {booking.assignedEngineer && (
            <section className="space-y-6">
              <div className="flex items-center space-x-3 pb-2 border-b-2 border-gray-50">
                <div className="p-2 bg-blue-600 rounded-xl">
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-black text-gray-900 tracking-tight">Assigned Engineer</h3>
              </div>
              <div className="flex items-center space-x-6 p-6 bg-blue-50/30 rounded-[2rem] border border-blue-100">
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-xl font-black text-gray-900">{booking.assignedEngineer.name}</p>
                  <p className="text-sm font-bold text-blue-600 flex items-center mt-1">
                    <Phone className="w-4 h-4 mr-2" /> {booking.assignedEngineer.mobile || 'No Phone'}
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* Activity Logs / Timestamps */}
          <section className="space-y-6 pt-4">
            <div className="flex items-center space-x-3 pb-2 border-b-2 border-gray-50">
              <div className="p-2 bg-gray-900 rounded-xl">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-black text-gray-900 tracking-tight">Timeline Info</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 bg-gray-50 rounded-3xl">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Created At</p>
                <p className="text-sm font-black text-gray-900">{formatDate(booking.createdAt)}</p>
              </div>
              <div className="p-6 bg-gray-50 rounded-3xl">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Last Updated</p>
                <p className="text-sm font-black text-gray-900">{formatDate(booking.updatedAt)}</p>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="p-8 bg-gray-900 flex justify-end">
          <button 
            onClick={onClose}
            className="px-10 py-4 bg-white text-gray-900 font-black rounded-2xl hover:bg-gray-100 transition-all shadow-xl active:scale-95"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailsModal;
