import React, { useState, useEffect, useCallback } from 'react';
import { Search, Download, Eye, DollarSign, CreditCard, Clock, CheckCircle, Loader2, RefreshCcw } from 'lucide-react';
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
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Payment Management</h1>
          <p className="text-gray-500 mt-1">Track all payments, commissions, and financial transactions.</p>
        </div>
        <button 
          onClick={fetchPayments}
          className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-100 rounded-xl font-semibold text-gray-600 hover:bg-gray-50 transition-all shadow-sm"
        >
          <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Ledger</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Revenue', value: totalRevenue, icon: DollarSign, color: 'blue', prefix: '₹' },
          { label: 'Total Payouts', value: totalRevenue - totalCommission, icon: CheckCircle, color: 'emerald', prefix: '₹' },
          { label: 'Pending', value: pendingAmount, icon: Clock, color: 'amber', prefix: '₹' },
          { label: 'Commission', value: totalCommission, icon: CreditCard, color: 'indigo', prefix: '₹' }
        ].map((item, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">{item.label}</p>
              <p className={`text-2xl font-bold mt-1 ${item.color === 'emerald' ? 'text-emerald-600' : item.color === 'amber' ? 'text-amber-600' : 'text-gray-900'}`}>
                {item.prefix}{item.value.toLocaleString()}
              </p>
            </div>
            <div className={`w-12 h-12 bg-${item.color === 'indigo' ? 'blue' : item.color}-100 rounded-xl flex items-center justify-center text-${item.color === 'indigo' ? 'blue' : item.color}-600`}>
              <item.icon className="w-6 h-6" />
            </div>
          </div>
        ))}
      </div>

      {/* Header Actions & Filters */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by customer, ID, or invoice..."
            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:border-blue-500 focus:bg-white transition-all text-sm outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select 
            className="px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-semibold text-gray-700 outline-none cursor-pointer"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="captured">Captured</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
          <button className="flex items-center px-4 py-3 bg-white border border-gray-100 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
            <p className="text-gray-500 font-medium">Syncing transactions...</p>
          </div>
        ) : error ? (
          <div className="p-20 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-600 text-xl font-bold">!</span>
            </div>
            <p className="text-red-600 font-bold">{error}</p>
            <button 
              onClick={fetchPayments}
              className="mt-6 px-6 py-2 bg-gray-900 text-white rounded-xl font-bold hover:bg-blue-600 transition-colors"
            >
              Retry Connection
            </button>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="p-20 text-center">
            <Search className="w-12 h-12 text-gray-100 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900">No transactions found</h3>
            <p className="text-sm text-gray-500 mt-1">Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-left">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Payment Details</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Service</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Amount</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Method</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Commission</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPayments.map((payment) => (
                  <tr key={payment._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-gray-900">{payment.paymentId}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">Booking: {payment.orderId?.orderId || 'N/A'}</p>
                      <p className="text-[10px] text-gray-400">
                        {new Date(payment.createdAt).toLocaleDateString()} • {new Date(payment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {payment.orderId?.customerDetails?.name || payment.userId?.name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <p className="max-w-[150px] truncate">{payment.orderId?.servicePlan?.name || 'Multiple Services'}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900">
                      ₹{payment.amount?.toLocaleString() || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getPaymentMethodIcon(payment.method)}</span>
                        <span className="text-xs font-bold text-gray-600 uppercase">{payment.method || 'Other'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border uppercase tracking-wider ${getStatusBadge(payment.status)}`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-blue-600">
                      ₹{(payment.amount * 0.25).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 hover:bg-blue-50 text-gray-400 hover:text-blue-600 rounded-lg transition-colors">
                        <Eye className="w-5 h-5" />
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