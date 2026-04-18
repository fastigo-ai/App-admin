import React from 'react';
import { X, Calendar, Clock, MapPin, User, Mail, Phone, CreditCard, Tag, Wrench } from 'lucide-react';

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
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl relative animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900">Booking Details</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-8 max-h-[80vh] overflow-y-auto">
          {/* Order Information */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Tag className="w-5 h-5 mr-2 text-blue-600" />
              Order Information
            </h3>
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <p className="text-sm text-gray-600">Order ID: <span className="text-gray-900 font-medium">{booking.orderId}</span></p>
              <p className="text-sm text-gray-600">Razorpay Order ID: <span className="text-gray-900 font-medium">{booking.razorpayOrderId || 'N/A'}</span></p>
              <p className="text-sm text-gray-600">Payment ID: <span className="text-gray-900 font-medium">{booking.razorpayPaymentId || 'N/A'}</span></p>
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Customer Details */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-blue-600" />
                Customer Details
              </h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <User className="w-4 h-4 mt-1 mr-3 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{booking.customerDetails?.name || 'Unknown'}</p>
                    <p className="text-xs text-gray-500">Name</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Mail className="w-4 h-4 mt-1 mr-3 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{booking.customerDetails?.email || 'N/A'}</p>
                    <p className="text-xs text-gray-500">Email</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Phone className="w-4 h-4 mt-1 mr-3 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{booking.customerDetails?.phone || 'N/A'}</p>
                    <p className="text-xs text-gray-500">Phone</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Service Summary */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Wrench className="w-5 h-5 mr-2 text-blue-600" />
                Service Details
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{booking.servicePlan?.name || 'Custom Booking'}</p>
                  <p className="text-xs text-gray-500">Service</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{booking.servicePlan?.category?.name || 'General'}</p>
                  <p className="text-xs text-gray-500">Category</p>
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-sm font-bold text-blue-600 font-mono">₹{booking.amount}</p>
                    <p className="text-xs text-gray-500">Total Amount</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 text-[10px] font-bold rounded-full uppercase ${
                      booking.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {booking.status}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">Payment Status</p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Appointment Details */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-blue-600" />
              Appointment Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 rounded-xl p-4">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-3 text-gray-400" />
                <p className="text-sm text-gray-700">Date: <span className="font-semibold">{booking.bookingDetails?.date || 'N/A'}</span></p>
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-3 text-gray-400" />
                <p className="text-sm text-gray-700">Time: <span className="font-semibold">{booking.bookingDetails?.time || 'N/A'}</span></p>
              </div>
              <div className="flex items-start md:col-span-2 mt-2">
                <MapPin className="w-4 h-4 mr-3 mt-1 text-gray-400 flex-shrink-0" />
                <p className="text-sm text-gray-700">{booking.bookingDetails?.address || booking.addressText || 'N/A'}</p>
              </div>
            </div>
          </section>

          {/* Individual Services */}
          {booking.bookingDetails?.services && booking.bookingDetails?.services.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Itemized Services:</h3>
              <div className="border border-gray-100 rounded-xl divide-y divide-gray-100 overflow-hidden">
                {booking.bookingDetails.services.map((item: any, idx: number) => (
                  <div key={idx} className="p-3 flex justify-between text-sm">
                    <span className="text-gray-700">• {item.name}</span>
                    <span className="text-gray-500 font-mono">₹{item.price} x {item.quantity}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Timestamps */}
          <div className="pt-6 border-t border-gray-100 grid grid-cols-2 gap-4 text-[10px] text-gray-400 uppercase tracking-wider">
            <div>
              <p>Created: {formatDate(booking.createdAt)}</p>
            </div>
            <div className="text-right">
              <p>Updated: {formatDate(booking.updatedAt)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailsModal;
