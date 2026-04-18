import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  Clock,
  CheckCircle,
  AlertTriangle,
  MapPin,
  Loader2
} from 'lucide-react';
import StatsCard from '../components/StatsCard';
import { getAllBookings } from '../api/bookingApi';
import { getAllPayments } from '../api/paymentApi';
import { getAllEngineers } from '../api/engineerApi';

interface DashboardProps {
  setActiveScreen: (screen: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ setActiveScreen }) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any[]>([]);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [categoryPerformance, setCategoryPerformance] = useState<any[]>([]);
  const [quickStats, setQuickStats] = useState<any>({});

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [bookingsRes, paymentsRes, engineersRes] = await Promise.all([
        getAllBookings(),
        getAllPayments({ limit: 1000 }), // Get enough for stats
        getAllEngineers()
      ]);

      const bookings = Array.isArray(bookingsRes?.data) ? bookingsRes.data : [];
      const payments = Array.isArray(paymentsRes?.data?.payments) ? paymentsRes.data.payments : [];
      const engineers = Array.isArray(engineersRes?.data) ? engineersRes.data : [];

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
        pendingIssues: bookings.filter((b: any) => b.orderStatus === 'Upcoming' && !b.assignedEngineer).length
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