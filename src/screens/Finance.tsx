import React, { useState, useEffect, useCallback } from 'react';
import { 
  getPendingPayouts, 
  getPendingRefunds, 
  approvePayout, 
  rejectPayout,
  getAllWallets,
  getLedger,
  getFinanceStats,
  getPayoutHistory,
  exportLedger
} from '../api/financeApi';
import { useDebounce } from '../hooks/useDebounce';
import toast from 'react-hot-toast';
import { 
  Banknote, 
  CreditCard, 
  Users, 
  Clock, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  Download,
  History,
  Trophy,
  RefreshCcw,
  Loader2,
  DollarSign,
  Briefcase
} from 'lucide-react';

const Finance = () => {
  const [activeTab, setActiveTab] = useState<'withdrawals' | 'refunds' | 'wallets' | 'transactions' | 'history'>('withdrawals');
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const debouncedSearch = useDebounce(searchTerm, 500);
  
  const [data, setData] = useState<any>({
    withdrawals: [],
    refunds: [],
    wallets: [],
    transactions: [],
    history: [],
    pagination: { total: 0, totalPages: 1, currentPage: 1 }
  });

  const [stats, setStats] = useState<any>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      let res;
      if (activeTab === 'withdrawals') {
        res = await getPendingPayouts({ search: debouncedSearch });
        if (res.success) {
          setData({ ...data, withdrawals: res.data.withdrawals, pagination: res.data.pagination });
        }
      } else if (activeTab === 'refunds') {
        res = await getPendingRefunds({ search: debouncedSearch });
        if (res.success) {
          setData({ ...data, refunds: res.data.orders, pagination: res.data.pagination });
        }
      } else if (activeTab === 'wallets') {
        res = await getAllWallets({ search: debouncedSearch });
        if (res.success) {
          setData({ ...data, wallets: res.data.wallets, pagination: res.data.pagination });
        }
      } else if (activeTab === 'transactions') {
        res = await getLedger({ page: 1, limit: 20, search: debouncedSearch });
        if (res.success) {
          setData({ ...data, transactions: res.data.transactions, pagination: res.data.pagination });
        }
      } else if (activeTab === 'history') {
        res = await getPayoutHistory({ search: debouncedSearch });
        if (res.success) {
          setData({ ...data, history: res.data.payouts, pagination: res.data.pagination });
        }
      }

      const statsRes = await getFinanceStats();
      if (statsRes.success) {
        setStats(statsRes.data);
      }
    } catch (err) {
      console.error('Failed to fetch finance data:', err);
      toast.error('Failed to load financial records');
    } finally {
      setLoading(false);
    }
  }, [activeTab, debouncedSearch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleExport = async () => {
    try {
      setExporting(true);
      const blob = await exportLedger({
        startDate: dateRange.start,
        endDate: dateRange.end
      });
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ledger_export_${dateRange.start || 'all'}_to_${dateRange.end || 'today'}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Export completed for selected range');
    } catch (err) {
      toast.error('Export failed');
    } finally {
      setExporting(false);
    }
  };

  const setFinancialYear = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    // Indian Financial Year: April 1 to March 31
    if (now.getMonth() >= 3) { // April or later
      setDateRange({
        start: `${currentYear}-04-01`,
        end: `${currentYear + 1}-03-31`
      });
    } else {
      setDateRange({
        start: `${currentYear - 1}-04-01`,
        end: `${currentYear}-03-31`
      });
    }
  };

  const handleApprovePayout = async (id: string) => {
    if (!window.confirm('Are you sure you want to approve this payout?')) return;
    try {
      const res = await approvePayout(id);
      if (res.success) {
        toast.success('Payout approved and initiated');
        fetchData();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Approval failed');
    }
  };

  const handleRejectPayout = async (id: string) => {
    const reason = window.prompt('Enter reason for rejection:');
    if (reason === null) return;
    try {
      const res = await rejectPayout(id, reason);
      if (res.success) {
        toast.success('Payout request rejected');
        fetchData();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Rejection failed');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Financial Hub</h1>
          <p className="text-gray-500 mt-1">Global revenue insights and payout management.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-all shadow-sm disabled:opacity-50"
          >
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            <span>Export CSV</span>
          </button>
          <button 
            onClick={fetchData}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-100 rounded-xl font-semibold text-gray-600 hover:bg-gray-50 transition-all shadow-sm"
          >
            <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: 'Gross Revenue', value: stats?.metrics?.totalGross, icon: DollarSign, color: 'blue', prefix: '₹' },
            { label: 'Platform Commission', value: stats?.metrics?.totalCommission, icon: TrendingUp, color: 'emerald', prefix: '₹' },
            { label: 'Total Payouts', value: stats?.metrics?.totalPaidOut, icon: ArrowUpRight, color: 'amber', prefix: '₹' },
            { label: 'Net Profit', value: stats?.metrics?.netPlatformBalance, icon: Briefcase, color: 'indigo', prefix: '₹' }
          ].map((item, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{item.label}</p>
                <p className="text-2xl font-black text-gray-900 mt-1">
                  {item.prefix}{item.value?.toLocaleString() || '0'}
                </p>
              </div>
              <div className={`w-12 h-12 bg-${item.color}-50 rounded-xl flex items-center justify-center text-${item.color}-600 border border-${item.color}-100`}>
                <item.icon className="w-6 h-6" />
              </div>
            </div>
          ))}
        </div>

        {/* Top Earners Sidecard */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-gray-900">Top Earners (Fleet)</h3>
          </div>
          <div className="space-y-4">
            {stats?.topEarners?.map((earner: any, i: number) => (
              <div key={i} className="flex items-center justify-between group">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-xs font-bold text-gray-600 border border-gray-100 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{earner.name}</p>
                    <p className="text-[10px] text-gray-500">Withdrawn: ₹{earner.withdrawn?.toLocaleString()}</p>
                  </div>
                </div>
                <p className="text-sm font-black text-emerald-600">₹{earner.totalEarned?.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1 bg-gray-100/50 rounded-2xl w-fit">
        {[
          { id: 'withdrawals', label: 'Pending Payouts', icon: Banknote },
          { id: 'history', label: 'Payout History', icon: History },
          { id: 'refunds', label: 'Refunds', icon: CreditCard },
          { id: 'wallets', label: 'Wallets', icon: Users },
          { id: 'transactions', label: 'Ledger', icon: Clock }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === tab.id 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Search & Date Filter */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={`Filter records in ${activeTab}...`}
              className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:border-blue-500 focus:bg-white transition-all text-sm outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-2 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
              <span className="text-xs font-bold text-gray-400 uppercase">From</span>
              <input 
                type="date" 
                className="bg-transparent text-sm font-semibold outline-none text-gray-700"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              />
            </div>
            <div className="flex items-center space-x-2 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
              <span className="text-xs font-bold text-gray-400 uppercase">To</span>
              <input 
                type="date" 
                className="bg-transparent text-sm font-semibold outline-none text-gray-700"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              />
            </div>
            <button 
              onClick={setFinancialYear}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline px-2 py-1"
            >
              FY {new Date().getFullYear()}
            </button>
            {(dateRange.start || dateRange.end) && (
              <button 
                onClick={() => setDateRange({ start: '', end: '' })}
                className="text-xs font-bold text-red-500 hover:text-red-600"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Table Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
            <p className="text-gray-500 font-medium tracking-wide">Crunching financial data...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {activeTab === 'withdrawals' && (
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-left">
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Engineer</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Request Details</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Amount</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Net Payout</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.withdrawals.map((req: any) => (
                    <tr key={req._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-bold text-sm">
                            {req.engineerId?.name?.[0] || 'E'}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">{req.engineerId?.name || 'Unknown'}</p>
                            <p className="text-[11px] text-gray-500">{req.engineerId?.mobile}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs font-medium text-gray-600">REQ-{req._id.substring(req._id.length - 6).toUpperCase()}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {new Date(req.createdAt).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-bold text-gray-900">₹{req.amount.toLocaleString()}</td>
                      <td className="px-6 py-4 text-right text-sm font-bold text-emerald-600">₹{req.netAmount?.toLocaleString() || req.amount.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-amber-50 text-amber-700 border border-amber-100 uppercase tracking-wider">
                          {req.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button 
                            onClick={() => handleRejectPayout(req._id)}
                            className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => handleApprovePayout(req._id)}
                            className="p-2 hover:bg-emerald-50 text-emerald-600 rounded-lg transition-colors"
                          >
                            <CheckCircle2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {data.withdrawals.length === 0 && (
                    <tr><td colSpan={6} className="py-20 text-center text-gray-500">No pending requests</td></tr>
                  )}
                </tbody>
              </table>
            )}

            {activeTab === 'history' && (
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-left">
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Engineer</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Amount</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Reference</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.history.map((req: any) => (
                    <tr key={req._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(req.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-gray-900">{req.engineerId?.name}</p>
                        <p className="text-[11px] text-gray-500">{req.engineerId?.mobile}</p>
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-bold text-gray-900">₹{req.amount.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <p className="text-[10px] font-mono text-gray-500">{req.payoutId || req._id}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                          req.status === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                          req.status === 'failed' ? 'bg-red-50 text-red-700 border border-red-100' :
                          'bg-gray-50 text-gray-700 border border-gray-100'
                        }`}>
                          {req.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'refunds' && (
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-left">
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Booking ID</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Amount</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Refund Status</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.refunds.map((order: any) => (
                    <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-bold text-gray-900">{order.orderId}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{order.userId?.name || 'Guest'}</td>
                      <td className="px-6 py-4 text-right text-sm font-bold text-gray-900">₹{order.finalAmount / 100}</td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-100 uppercase tracking-wider">
                          {order.refundStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="px-4 py-1.5 bg-gray-900 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg hover:bg-blue-600 transition-colors shadow-sm">
                          Process Refund
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'wallets' && (
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-left">
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Engineer</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Available</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Escrow</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Total Withdrawn</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.wallets.map((wallet: any) => (
                    <tr key={wallet._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-bold text-gray-900">{wallet.engineerId?.name}</td>
                      <td className="px-6 py-4 text-right text-sm font-bold text-emerald-600">₹{wallet.availableBalance.toLocaleString()}</td>
                      <td className="px-6 py-4 text-right text-sm font-bold text-amber-600">₹{wallet.lockedBalance.toLocaleString()}</td>
                      <td className="px-6 py-4 text-right text-sm font-bold text-gray-900">₹{wallet.withdrawnAmount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'transactions' && (
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-left">
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Engineer</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Amount</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.transactions.map((tx: any) => (
                    <tr key={tx._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-bold text-gray-900">{tx.engineerId?.name}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${tx.type === 'credit' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-gray-600 uppercase tracking-wider">{tx.category}</td>
                      <td className="px-6 py-4 text-right text-sm font-bold text-gray-900">₹{tx.amount.toLocaleString()}</td>
                      <td className="px-6 py-4 text-xs text-gray-500">{new Date(tx.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Finance;
