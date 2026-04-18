import React, { useState } from 'react';
import { Search, User, Phone, Mail, MapPin, Calendar, Star } from 'lucide-react';

const Customers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');

  const customers = [
    {
      id: 1,
      name: 'Rajesh Kumar',
      email: 'rajesh.kumar@email.com',
      phone: '+91 9876543210',
      location: 'Sector 15, Noida, UP',
      joinDate: '2023-08-15',
      totalBookings: 8,
      completedServices: 7,
      totalSpent: '₹12,500',
      rating: 4.8,
      lastService: '2024-01-15',
      preferredServices: ['Laptop Repair', 'Mobile Repair'],
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: 2,
      name: 'Priya Singh',
      email: 'priya.singh@email.com',
      phone: '+91 9876543211',
      location: 'Lajpat Nagar, Delhi',
      joinDate: '2023-09-22',
      totalBookings: 5,
      completedServices: 4,
      totalSpent: '₹8,900',
      rating: 4.9,
      lastService: '2024-01-14',
      preferredServices: ['AC Services', 'Home Appliances'],
      avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: 3,
      name: 'Suresh Gupta',
      email: 'suresh.gupta@email.com',
      phone: '+91 9876543212',
      location: 'Gurgaon Sector 21, Haryana',
      joinDate: '2023-07-10',
      totalBookings: 12,
      completedServices: 11,
      totalSpent: '₹18,750',
      rating: 4.7,
      lastService: '2024-01-12',
      preferredServices: ['Washing Machine', 'Refrigerator'],
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: 4,
      name: 'Anita Devi',
      email: 'anita.devi@email.com',
      phone: '+91 9876543213',
      location: 'Karol Bagh, Delhi',
      joinDate: '2023-11-05',
      totalBookings: 3,
      completedServices: 2,
      totalSpent: '₹3,200',
      rating: 4.6,
      lastService: '2024-01-10',
      preferredServices: ['Mobile Repair'],
      avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: 5,
      name: 'Manoj Sharma',
      email: 'manoj.sharma@email.com',
      phone: '+91 9876543214',
      location: 'Dwarka Sector 10, Delhi',
      joinDate: '2023-06-18',
      totalBookings: 6,
      completedServices: 5,
      totalSpent: '₹9,800',
      rating: 4.5,
      lastService: '2024-01-08',
      preferredServices: ['TV Repair', 'Electronics'],
      avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?w=150&h=150&fit=crop&crop=face'
    }
  ];

  const locations = ['all', 'Delhi', 'Noida', 'Gurgaon', 'Other'];

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.phone.includes(searchTerm);
    const matchesLocation = locationFilter === 'all' || customer.location.includes(locationFilter);
    return matchesSearch && matchesLocation;
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Customer Management</h1>
        <p className="text-gray-600 mt-2">Manage your customer base and track their service history.</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900">{customers.length}</p>
            </div>
            <User className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Customers</p>
              <p className="text-2xl font-bold text-green-600">{customers.filter(c => new Date(c.lastService) > new Date('2024-01-01')).length}</p>
            </div>
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-green-600 rounded-full"></div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Rating</p>
              <p className="text-2xl font-bold text-amber-600">4.7</p>
            </div>
            <Star className="w-8 h-8 text-amber-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-purple-600">₹53,150</p>
            </div>
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-purple-600 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <select
              className="flex-1 md:flex-none px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
            >
              {locations.map(location => (
                <option key={location} value={location}>
                  {location === 'all' ? 'All Locations' : location}
                </option>
              ))}
            </select>
            <button className="flex-1 md:flex-none px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">
              Filter
            </button>
          </div>
        </div>
      </div>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCustomers.map((customer) => (
          <div key={customer.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-4">
                <img
                  src={customer.avatar}
                  alt={customer.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{customer.name}</h3>
                  <div className="flex items-center mt-1">
                    <Star className="w-4 h-4 text-amber-500 mr-1" />
                    <span className="text-sm font-medium text-gray-900">{customer.rating}</span>
                    <span className="text-xs text-gray-500 ml-1">rating</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="w-4 h-4 mr-2 text-gray-400" />
                {customer.email}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="w-4 h-4 mr-2 text-gray-400" />
                {customer.phone}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                {customer.location}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                Joined {new Date(customer.joinDate).toLocaleDateString()}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <p className="text-lg font-bold text-blue-600">{customer.totalBookings}</p>
                <p className="text-xs text-gray-500">Total Bookings</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-green-600">{customer.completedServices}</p>
                <p className="text-xs text-gray-500">Completed</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-purple-600">{customer.totalSpent}</p>
                <p className="text-xs text-gray-500">Total Spent</p>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm font-medium text-gray-900 mb-2">Preferred Services</p>
              <div className="flex flex-wrap gap-1">
                {customer.preferredServices.map((service, index) => (
                  <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md">
                    {service}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Last service: {new Date(customer.lastService).toLocaleDateString()}
              </div>
              <div className="flex space-x-2">
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  View History
                </button>
                <button className="text-gray-600 hover:text-gray-800 text-sm font-medium">
                  Contact
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Customers;