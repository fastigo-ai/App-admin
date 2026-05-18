import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  Clock,
  CheckCircle,
  AlertTriangle,
  MapPin,
  Loader2,
  Wallet,
  PiggyBank,
  Receipt,
  Briefcase,
  UserPlus,
  Activity,
  Percent,
  Zap
} from 'lucide-react';
import StatsCard from '../components/StatsCard';
import { getAllBookings } from '../api/bookingApi';
import { getAllPayments } from '../api/paymentApi';
import { getAllEngineers } from '../api/engineerApi';
import { getDashboardAnalytics } from '../api/dashboardApi';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  BarChart,
  Bar
} from 'recharts';

interface DashboardProps {
  setActiveScreen: (screen: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ setActiveScreen }) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any[]>([]);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [categoryPerformance, setCategoryPerformance] = useState<any[]>([]);
  const [quickStats, setQuickStats] = useState<any>({});
  const [analytics, setAnalytics] = useState<any>({
    revenueGrowth: [],
    userGrowth: [],
    serviceDemand: [],
    fulfillment: { avgCompletionTime: 0, avgAssignmentTime: 0 },
    financial: { totalCollected: 0, pendingPayouts: 0, commission: 0 },
    growth: {
      couponImpact: [],
      repeatRate: 0,
      utilization: { busy: 0, online: 0, offline: 0 },
      supplyDemandGap: [],
      notificationHealth: { successRate: 0, sent: 0, failed: 0 }
    }
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [bookingsRes, paymentsRes, engineersRes, analyticsRes] = await Promise.all([
        getAllBookings(),
        getAllPayments({ limit: 1000 }), // Get enough for stats
        getAllEngineers(),
        getDashboardAnalytics()
      ]);

      const bookings = Array.isArray(bookingsRes?.data) ? bookingsRes.data : [];
      const payments = Array.isArray(paymentsRes?.data?.payments) ? paymentsRes.data.payments : [];
      const engineers = Array.isArray(engineersRes?.data) ? engineersRes.data : [];
      
      if (analyticsRes.success) {
        setAnalytics(analyticsRes.data);
      }

      // Calculate Stats
      const totalRevenue = payments
        .filter((p: any) => p.status === 'captured' || p.status === 'paid')
        .reduce((sum: number, p: any) => sum + (p.amount || 0), 0);

      const activeEngineers = engineers.filter((e: any) => e.status === 'ONLINE' || e.isActive === 'true').length;
      
      const today = new Date().toISOString().split('T')[0];
      const todaysBookings = bookings.filter((b: any) => 
        (b.createdAt && b.createdAt.startsWith(today)) || 
        (b.scheduledAt && b.scheduledAt.startsWith(today))
      ).length;

      const completedServices = bookings.filter((b: any) => b.orderStatus === 'Completed').length;

      setStats([
        {
          title: 'Total Revenue',
          value: `₹${totalRevenue.toLocaleString()}`,
          change: '+12.5%', // Mock change for now
          icon: DollarSign,
          color: 'green' as const
        },
        {
          title: 'Active Engineers',
          value: activeEngineers.toString(),
          change: '+5',
          icon: Users,
          color: 'blue' as const
        },
        {
          title: 'Today\'s Bookings',
          value: todaysBookings.toString(),
          change: '+8',
          icon: Calendar,
          color: 'purple' as const
        },
        {
          title: 'Completed Services',
          value: completedServices.toString(),
          change: '+23',
          icon: CheckCircle,
          color: 'green' as const
        }
      ]);

      // Recent Bookings (Last 5)
      const recent = bookings
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
        .map((b: any) => ({
          id: b.orderId || 'N/A',
          customer: b.customerDetails?.name || 'Unknown',
          service: b.servicePlan?.name || 'Multiple Services',
          engineer: b.assignedEngineer?.name || 'Pending Assignment',
          location: b.bookingDetails?.address || b.addressText || 'N/A',
          status: b.orderStatus?.toLowerCase() || 'pending',
          time: getTimeAgo(new Date(b.createdAt)),
          amount: `₹${(b.amount || b.finalAmount || 0).toLocaleString()}`
        }));
      setRecentBookings(recent);
// ... (rest of the calculation logic)
      // Category Performance Logic
      const catMap: any = {};
      bookings.forEach((b: any) => {
        const cat = b.servicePlan?.category?.name || 'Uncategorized';
        if (!catMap[cat]) catMap[cat] = { bookings: 0, revenue: 0 };
        catMap[cat].bookings++;
        catMap[cat].revenue += (b.amount || b.finalAmount || 0);
      });

      const performance = Object.keys(catMap).map(cat => ({
        category: cat,
        bookings: catMap[cat].bookings,
        revenue: `₹${catMap[cat].revenue.toLocaleString()}`,
        growth: '+10%', // Mock growth
        color: cat === 'Electronics Repair' ? 'bg-blue-500' : 'bg-green-500'
      })).slice(0, 4);
      setCategoryPerformance(performance);

      // Quick Stats
      setQuickStats({
        responseTime: '12 min',
        successRate: '94.2%',
        coverage: '15',
        pendingIssues: bookings.filter((b: any) => b.orderStatus === 'Upcoming' && !b.assignedEngineer).length,
        acceptedPending: bookings.filter((b: any) => b.orderStatus === 'Accepted' && b.work_status === 'Accepted').length
      });

    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  };

  const getStatusBadge = (status: string) => {
    const config = {
      'completed': 'bg-green-100 text-green-800 border-green-200',
      'in progress': 'bg-blue-100 text-blue-800 border-blue-200',
      'assigned': 'bg-purple-100 text-purple-800 border-purple-200',
      'pending': 'bg-amber-100 text-amber-800 border-amber-200',
      'upcoming': 'bg-blue-100 text-blue-800 border-blue-200',
      'accepted': 'bg-green-100 text-green-800 border-green-200'
    };
    return config[status as keyof typeof config] || config.pending;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-600 font-medium">Loading Dashboard Data...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here's what's happening with your repair service platform today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Service Categories Performance */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Service Categories Performance</h3>
          <div className="space-y-4">
            {categoryPerformance.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`w-4 h-4 rounded-full ${item.color}`}></div>
                  <div>
                    <p className="font-medium text-gray-900">{item.category}</p>
                    <p className="text-sm text-gray-600">{item.bookings} bookings total</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{item.revenue}</p>
                  <p className="text-sm text-green-600">{item.growth}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Stats</h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Avg Response Time</p>
                  <p className="text-xs text-gray-600">Engineer assignment</p>
                </div>
              </div>
              <span className="text-lg font-bold text-blue-600">{quickStats.responseTime}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Success Rate</p>
                  <p className="text-xs text-gray-600">Completed services</p>
                </div>
              </div>
              <span className="text-lg font-bold text-green-600">{quickStats.successRate}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Accepted & Pending</p>
                  <p className="text-xs text-gray-600">Not yet started</p>
                </div>
              </div>
              <span className="text-lg font-bold text-indigo-600">{quickStats.acceptedPending}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Coverage Areas</p>
                  <p className="text-xs text-gray-600">Active locations</p>
                </div>
              </div>
              <span className="text-lg font-bold text-purple-600">{quickStats.coverage}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Pending Assignment</p>
                  <p className="text-xs text-gray-600">Require attention</p>
                </div>
              </div>
              <span className="text-lg font-bold text-amber-600">{quickStats.pendingIssues}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Growth Curve */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Revenue Growth Curve</h3>
              <p className="text-xs text-gray-500">Daily revenue trends for the last 30 days</p>
            </div>
            <div className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full">
              LIVE
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.revenueGrowth}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#9ca3af', fontSize: 10}}
                  minTickGap={30}
                  tickFormatter={(str) => {
                    const date = new Date(str);
                    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
                  }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#9ca3af', fontSize: 10}}
                  tickFormatter={(val) => `₹${val}`}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Revenue']}
                />
                <Area 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRev)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Service Demand & Fulfillment Speed */}
        <div className="grid grid-cols-1 gap-6">
          {/* Service Demand Donut */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Demand Distribution</h3>
            <div className="flex items-center">
              <div className="h-[200px] w-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.serviceDemand}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {analytics.serviceDemand.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index % 5]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 ml-6 space-y-2">
                {analytics.serviceDemand.slice(0, 4).map((item: any, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index % 5] }}></div>
                      <span className="text-xs font-medium text-gray-600 truncate max-w-[120px]">{item.name}</span>
                    </div>
                    <span className="text-xs font-bold text-gray-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Fulfillment Speed Widget */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center space-x-6">
            <div className="relative w-24 h-24 flex items-center justify-center">
               <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-blue-50"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeDasharray={251.2}
                  strokeDashoffset={251.2 * (1 - Math.min(analytics.fulfillment.avgAssignmentTime / 60, 1))}
                  strokeLinecap="round"
                  fill="transparent"
                  className="text-blue-500 transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-gray-900">{Math.round(analytics.fulfillment.avgAssignmentTime)}</span>
                <span className="text-[10px] text-gray-500 font-bold uppercase">Mins</span>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-1">Fulfillment Speed</h4>
              <p className="text-xs text-gray-500 mb-3">Avg. time from Booking to Assignment</p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-[10px] font-bold text-gray-600 uppercase">Assignment: {Math.round(analytics.fulfillment.avgAssignmentTime)}m</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-[10px] font-bold text-gray-600 uppercase">Completion: {Math.round(analytics.fulfillment.avgCompletionTime)}m</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Health Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Financial Health</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center space-x-4 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
            <div className="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-200">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Total Collected</p>
              <p className="text-2xl font-black text-gray-900">₹{analytics.financial.totalCollected.toLocaleString()}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 p-4 bg-amber-50 rounded-xl border border-amber-100">
            <div className="w-12 h-12 bg-amber-500 rounded-lg flex items-center justify-center shadow-lg shadow-amber-200">
              <PiggyBank className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">Pending Payouts</p>
              <p className="text-2xl font-black text-gray-900">₹{analytics.financial.pendingPayouts.toLocaleString()}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
            <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-200">
              <Receipt className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Platform Commission (25%)</p>
              <p className="text-2xl font-black text-gray-900">₹{analytics.financial.commission.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Growth & Strategy Section */}
      <div className="mb-8">
        <div className="flex items-center space-x-2 mb-6">
          <Activity className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Growth & Strategy</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Acquisition Trend */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">New User Acquisition</h3>
                <p className="text-xs text-gray-500">Daily registrations for the last 30 days</p>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg">
                <UserPlus className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.userGrowth}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#9ca3af', fontSize: 10}}
                    tickFormatter={(str) => {
                      const date = new Date(str);
                      return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
                    }}
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 10}} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Efficiency Metrics */}
          <div className="space-y-6">
            {/* Repeat Customer Rate */}
            <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Percent className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded-full uppercase">Retention</span>
              </div>
              <p className="text-sm font-medium text-indigo-100 mb-1">Repeat Customer Rate</p>
              <div className="flex items-baseline space-x-2">
                <h3 className="text-3xl font-black">{analytics.growth.repeatRate}%</h3>
                <span className="text-xs text-indigo-200">+2.4% vs last mo</span>
              </div>
              <div className="mt-4 w-full bg-white/20 rounded-full h-1.5">
                <div 
                  className="bg-white h-1.5 rounded-full" 
                  style={{ width: `${analytics.growth.repeatRate}%` }}
                ></div>
              </div>
            </div>

            {/* Engineer Utilization */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
               <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Utilization</h3>
                <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Busy (On Job)</span>
                  <span className="font-bold text-gray-900">{analytics.growth.utilization.busy}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div 
                    className="bg-amber-500 h-1.5 rounded-full" 
                    style={{ width: `${(analytics.growth.utilization.busy / (analytics.growth.utilization.online + analytics.growth.utilization.busy || 1)) * 100}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-gray-600">Waiting (Online)</span>
                  <span className="font-bold text-gray-900">{analytics.growth.utilization.online}</span>
                </div>
              </div>
            </div>

            {/* Notification Health */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">System Health</h3>
                <div className={`w-2 h-2 rounded-full animate-pulse ${Number(analytics.growth.notificationHealth.successRate) > 95 ? 'bg-green-500' : 'bg-red-500'}`}></div>
              </div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Activity className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Notification Success</p>
                  <p className="text-xl font-bold text-gray-900">{analytics.growth.notificationHealth.successRate}%</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-gray-50 rounded-lg text-center">
                  <p className="text-[10px] font-bold text-gray-500 uppercase">Sent</p>
                  <p className="text-sm font-bold text-green-600">{analytics.growth.notificationHealth.sent}</p>
                </div>
                <div className="p-2 bg-gray-50 rounded-lg text-center">
                  <p className="text-[10px] font-bold text-gray-500 uppercase">Failed</p>
                  <p className="text-sm font-bold text-red-600">{analytics.growth.notificationHealth.failed}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Supply-Demand Gap */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Supply-Demand Gap</h3>
            <div className="space-y-4">
              {analytics.growth.supplyDemandGap.map((gap: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">Cell {gap.h3Index}</p>
                      <p className="text-[10px] text-gray-500 uppercase font-bold">{gap.demand} Bookings</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-1 justify-end">
                      <Users className="w-3 h-3 text-gray-400" />
                      <span className="text-sm font-bold text-gray-900">{gap.supply} Engineers</span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${gap.supply < gap.demand / 2 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {gap.supply < gap.demand / 2 ? 'CRITICAL GAP' : 'STABLE'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Coupon Impact */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Coupon & Discount Impact</h3>
            <div className="grid grid-cols-2 gap-4">
              {analytics.growth.couponImpact.map((item: any, index: number) => (
                <div key={index} className={`p-4 rounded-xl border ${item._id === 'Discounted' ? 'bg-purple-50 border-purple-100' : 'bg-gray-50 border-gray-100'}`}>
                  <p className="text-xs font-bold text-gray-500 uppercase mb-1">{item._id} Revenue</p>
                  <p className={`text-xl font-black ${item._id === 'Discounted' ? 'text-purple-700' : 'text-gray-900'}`}>
                    ₹{item.revenue.toLocaleString()}
                  </p>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-[10px] font-bold text-gray-600">{item.count} Bookings</span>
                    <span className="text-[10px] font-bold text-gray-400">
                      Avg: ₹{Math.round(item.revenue / item.count).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100 flex items-start space-x-3">
              <Activity className="w-5 h-5 text-blue-600 mt-0.5" />
              <p className="text-xs text-blue-800 leading-relaxed">
                <strong>Growth Tip:</strong> {analytics.growth.couponImpact.find((i:any) => i._id === 'Discounted')?.revenue > analytics.growth.couponImpact.find((i:any) => i._id === 'Regular')?.revenue 
                ? "Discounts are your primary growth driver. Consider a loyalty program to reduce dependency." 
                : "Organic revenue is healthy. Targeted coupons could boost growth in low-performing areas."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Recent Bookings</h3>
            <button 
              onClick={() => setActiveScreen('bookings')}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View All →
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Booking ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Engineer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {booking.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{booking.customer}</p>
                      <p className="text-xs text-gray-500">{booking.time}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {booking.service}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {booking.engineer}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                      <span className="truncate max-w-[150px]">{booking.location}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusBadge(booking.status)}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    {booking.amount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {recentBookings.length === 0 && (
            <div className="p-12 text-center text-gray-500">
              No recent bookings found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;