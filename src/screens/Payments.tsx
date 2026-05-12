import React, { useState, useEffect, useCallback } from 'react';
import { Search, Download, Eye, DollarSign, CreditCard, Clock, CheckCircle, Loader2 } from 'lucide-react';
import { getAllPayments } from '../api/paymentApi';

const Payments = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAllPayments({ status: statusFilter === 'all' ? undefined : statusFilter });
      if (response.success) {
        setPayments(response.data.payments);
      }
    } catch (err) {
      console.error('Failed to fetch payments:', err);
      setError('Failed to load transaction data.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const getStatusBadge = (status: string) => {
    const config = {
      'captured': 'bg-green-100 text-green-800 border-green-200',
      'paid': 'bg-green-100 text-green-800 border-green-200',
      'pending': 'bg-amber-100 text-amber-800 border-amber-200',
      'failed': 'bg-red-100 text-red-800 border-red-200',
      'refunded': 'bg-gray-100 text-gray-800 border-gray-200',
      'authorized': 'bg-blue-100 text-blue-800 border-blue-200'
    };
    return config[status.toLowerCase() as keyof typeof config] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getPaymentMethodIcon = (method: string) => {
    if (!method) return '💰';
    switch (method.toLowerCase()) {
      case 'upi':
        return '📱';
      case 'card':
        return '💳';
      case 'cash':
        return '💵';
      case 'netbanking':
        return '🏦';
      default:
        return '💰';
    }
  };

  const filteredPayments = payments.filter(payment => {
    const customerName = payment.orderId?.customerDetails?.name || payment.userId?.name || '';
    const paymentId = payment.paymentId || '';
    const bookingId = payment.orderId?.orderId || '';

    const matchesSearch = customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          paymentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          bookingId.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const totalRevenue = payments
    .filter(p => p.status === 'captured' || p.status === 'paid')
    .reduce((sum, p) => sum + (p.amount || 0), 0);
  
  const totalCommission = totalRevenue * 0.25;

  const pendingAmount = payments
    .filter(p => p.status === 'pending' || p.status === 'authorized')
    .reduce((sum, p) => sum + (p.amount || 0), 0);


  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Payment Management</h1>
        <p className="text-gray-600 mt-2">Track all payments, commissions, and financial transactions.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">₹{totalRevenue.toLocaleString()}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Payouts</p>
              <p className="text-2xl font-bold text-green-600">₹{(totalRevenue - totalCommission).toLocaleString()}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-amber-600">₹{pendingAmount.toLocaleString()}</p>
            </div>
            <Clock className="w-8 h-8 text-amber-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Commission</p>
              <p className="text-2xl font-bold text-blue-600">₹{totalCommission.toLocaleString()}</p>
            </div>
            <CreditCard className="w-8 h-8 text-blue-600" />
          </div>
        </div>
      </div>
      {/* Header Actions & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by customer, ID, or invoice..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select 
            className="flex-1 md:flex-none px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="captured">Captured</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
          <button className="flex-1 md:flex-none flex items-center justify-center px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
            <p className="text-gray-500">Loading payment data...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <p className="text-red-500">{error}</p>
            <button 
              onClick={fetchPayments}
              className="mt-4 text-blue-600 border border-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50"
            >
              Retry
            </button>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No payments found matching your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Engineer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commission</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPayments.map((payment) => (
                  <tr key={payment._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{payment.paymentId}</p>
                        <p className="text-xs text-gray-500">Booking: {payment.orderId?.orderId || 'N/A'}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(payment.createdAt).toLocaleDateString()} at {new Date(payment.createdAt).toLocaleTimeString()}
                        </p>
                        {payment.razorpayPaymentId && (
                          <p className="text-xs text-gray-400">TXN: {payment.razorpayPaymentId}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.orderId?.customerDetails?.name || payment.userId?.name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.orderId?.servicePlan?.name || 'Multiple Services'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.orderId?.assignedEngineer?.name || 'Not Assigned'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      ₹{payment.amount?.toLocaleString() || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="mr-2">{getPaymentMethodIcon(payment.method)}</span>
                        <span className="text-sm text-gray-900 capitalize">{payment.method || 'Other'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusBadge(payment.status)}`}>
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                      ₹{(payment.amount * 0.25).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Payments;