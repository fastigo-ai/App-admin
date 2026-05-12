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
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl relative animate-in fade-in zoom-in duration-300 overflow-hidden">
        {/* Header Section */}
        <div className="bg-gray-50/50 px-8 py-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-3">
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Booking Details</h2>
                <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(booking.isVendor ? booking.status : booking.orderStatus)}`}>
                  {booking.isVendor ? booking.status : (booking.orderStatus || 'N/A')}
                </span>
              </div>
              <p className="text-gray-400 font-bold text-xs uppercase tracking-wider">{booking.isVendor ? 'Call ID' : 'Order ID'}: {booking.isVendor ? booking.call_id : booking.orderId}</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white hover:shadow-md rounded-xl transition-all text-gray-400 hover:text-red-500"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-8 space-y-10 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {/* Quick Summary Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100/50">
              <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">Total Amount</p>
              <p className="text-xl font-bold text-blue-600">₹{booking.isVendor ? (booking.order_price || 0) : (booking.amount || booking.finalAmount || 0)}</p>
            </div>
            <div className="p-5 bg-emerald-50/50 rounded-2xl border border-emerald-100/50">
              <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1">Status</p>
              <p className="text-lg font-bold text-emerald-600 uppercase tracking-tight">{booking.isVendor ? booking.status : (booking.paymentStatus || booking.status || 'CREATED')}</p>
            </div>
            <div className="p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
              <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Work Status</p>
              <p className="text-lg font-bold text-indigo-600 uppercase tracking-tight">{booking.work_status || 'NOT STARTED'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Customer Section */}
            <section className="space-y-6">
              <div className="flex items-center space-x-2 pb-2 border-b border-gray-100">
                <User className="w-5 h-5 text-gray-900" />
                <h3 className="text-lg font-bold text-gray-900">{booking.isVendor ? 'Vendor Contact' : 'Customer Info'}</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gray-50 rounded-xl">
                    <User className="w-4 h-4 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Name</p>
                    <p className="text-sm font-bold text-gray-900">{booking.isVendor ? (booking.contact_name || 'N/A') : (booking.customerDetails?.name || 'N/A')}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gray-50 rounded-xl">
                    <Phone className="w-4 h-4 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Phone</p>
                    <p className="text-sm font-bold text-gray-900">{booking.isVendor ? (booking.contact_phone || 'N/A') : (booking.customerDetails?.phone || 'N/A')}</p>
                  </div>
                </div>
                {!booking.isVendor && (
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-50 rounded-xl">
                      <Mail className="w-4 h-4 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email</p>
                      <p className="text-sm font-bold text-gray-900">{booking.customerDetails?.email || 'N/A'}</p>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Service Section */}
            <section className="space-y-6">
              <div className="flex items-center space-x-2 pb-2 border-b border-gray-100">
                <ShieldCheck className="w-5 h-5 text-gray-900" />
                <h3 className="text-lg font-bold text-gray-900">{booking.isVendor ? 'Project Details' : 'Service Details'}</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gray-50 rounded-xl">
                    <Wrench className="w-4 h-4 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{booking.isVendor ? 'Project' : 'Service'}</p>
                    <p className="text-sm font-bold text-gray-900">{booking.isVendor ? (booking.projectId || 'N/A') : (booking.servicePlan?.name || 'Custom Booking')}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gray-50 rounded-xl">
                    <Tag className="w-4 h-4 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Category</p>
                    <p className="text-sm font-bold text-blue-600 uppercase">{booking.isVendor ? (booking.asset_type || 'N/A') : (booking.servicePlan?.category?.name || 'General')}</p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Appointment Section */}
          <section className="space-y-4">
            <div className="flex items-center space-x-2 pb-2 border-b border-gray-100">
              <Calendar className="w-5 h-5 text-gray-900" />
              <h3 className="text-lg font-bold text-gray-900">Location & Time</h3>
            </div>
            <div className="bg-gray-50 rounded-2xl p-6">
              {!booking.isVendor && (
                <div className="grid grid-cols-2 gap-6 mb-6 pb-6 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date</p>
                      <p className="text-sm font-bold text-gray-900">{booking.bookingDetails?.date || (booking.scheduledAt ? new Date(booking.scheduledAt).toLocaleDateString() : 'N/A')}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center">
                      <Clock className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Time Slot</p>
                      <p className="text-sm font-bold text-gray-900">{booking.bookingDetails?.time || (booking.scheduledAt ? new Date(booking.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A')}</p>
                    </div>
                  </div>
                </div>
              )}
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Address</p>
                  <p className="text-sm font-medium text-gray-700 leading-relaxed">
                    {booking.isVendor ? (booking.complete_address || 'N/A') : (booking.bookingDetails?.address || booking.addressText || 'N/A')}
                    {booking.isVendor && booking.pincode && ` - ${booking.pincode}`}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Engineer Section (Conditional) */}
          {(booking.assignedEngineer || booking.assigned_engineer_id) && (
            <section className="space-y-4">
              <div className="flex items-center space-x-2 pb-2 border-b border-gray-100">
                <ShieldCheck className="w-5 h-5 text-gray-900" />
                <h3 className="text-lg font-bold text-gray-900">Assigned Partner</h3>
              </div>
              <div className="flex items-center space-x-4 p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-base font-bold text-gray-900">{(booking.assignedEngineer || booking.assigned_engineer_id).name}</p>
                  <p className="text-xs font-bold text-blue-600 flex items-center mt-0.5">
                    <Phone className="w-3.5 h-3.5 mr-1.5" /> {(booking.assignedEngineer || booking.assigned_engineer_id).mobile || (booking.assignedEngineer || booking.assigned_engineer_id).phone || 'No Phone'}
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* Activity Logs */}
          <section className="space-y-4">
            <div className="flex items-center space-x-2 pb-2 border-b border-gray-100">
              <Activity className="w-5 h-5 text-gray-900" />
              <h3 className="text-lg font-bold text-gray-900">Timeline</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-2xl">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Created</p>
                <p className="text-xs font-bold text-gray-900">{formatDate(booking.createdAt || booking.created_at)}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Updated</p>
                <p className="text-xs font-bold text-gray-900">{formatDate(booking.updatedAt || booking.updated_at)}</p>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-900 flex justify-end">
          <button 
            onClick={onClose}
            className="px-8 py-3 bg-white text-gray-900 font-bold rounded-xl hover:bg-gray-100 transition-all active:scale-95 shadow-lg"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailsModal;
