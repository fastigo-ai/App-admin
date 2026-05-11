import React, { useState, useEffect } from 'react';
import { X, Shield, Activity, Star, Briefcase, Wallet, CreditCard, Clock, CheckCircle2, AlertTriangle, TrendingUp, User, MapPin, Phone, Mail } from 'lucide-react';
import { getEngineerDossier } from '../api/engineerApi';
import { Loader2 } from 'lucide-react';

interface EngineerDossierModalProps {
  engineerId: string;
  onClose: () => void;
}

const EngineerDossierModal: React.FC<EngineerDossierModalProps> = ({ engineerId, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getEngineerDossier(engineerId);
        if (res.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch dossier:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [engineerId]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
        <div className="bg-white rounded-[2.5rem] p-12 flex flex-col items-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
          <p className="text-gray-500 font-black uppercase tracking-widest text-sm">Compiling Dossier...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { profile, stats } = data;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] flex items-center justify-center p-4 md:p-8">
      <div className="bg-[#f8fafc] w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-[3rem] shadow-2xl relative border-8 border-white">
        
        {/* Header Strip */}
        <div className="bg-gray-900 p-8 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/10 rounded-2xl">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-white text-2xl font-black tracking-tight">Professional Dossier</h2>
              <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Engineer ID: {profile.engineerId || profile._id.substring(0,8)}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-3 bg-white/10 text-white rounded-2xl hover:bg-red-500 transition-all active:scale-90"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8 space-y-8">
          {/* Profile Overview Card */}
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-8 items-center md:items-start">
            <div className="relative group">
              <div className="w-40 h-40 bg-gray-100 rounded-[3rem] overflow-hidden border-4 border-gray-50 group-hover:scale-105 transition-transform duration-500">
                <img 
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=random&size=256&bold=true`}
                  className="w-full h-full object-cover"
                  alt={profile.name}
                />
              </div>
              <div className={`absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl border-4 border-white shadow-lg flex items-center justify-center ${profile.status === 'ONLINE' ? 'bg-emerald-500' : 'bg-gray-400'}`}>
                <Activity className="w-5 h-5 text-white" />
              </div>
            </div>

            <div className="flex-1 space-y-4 text-center md:text-left w-full">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-4xl font-black text-gray-900 tracking-tight">{profile.name}</h1>
                  <p className="text-gray-500 font-bold text-lg">{profile.skills?.join(' • ') || 'General Professional'}</p>
                </div>
                <div className="flex items-center space-x-3 bg-amber-50 px-6 py-3 rounded-2xl border border-amber-100 self-center md:self-start">
                  <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
                  <span className="text-2xl font-black text-amber-700">{profile.rating?.toFixed(1) || '0.0'}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-50">
                <div className="flex items-center space-x-3 text-gray-600">
                  <Phone className="w-4 h-4 text-blue-500" />
                  <span className="font-bold">{profile.mobile}</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-600">
                  <Mail className="w-4 h-4 text-blue-500" />
                  <span className="font-bold truncate">{profile.email}</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-600">
                  <MapPin className="w-4 h-4 text-blue-500" />
                  <span className="font-bold">H3: {profile.h3Index || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Regular Orders */}
            <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm space-y-6">
              <div className="flex items-center space-x-3 pb-4 border-b border-gray-50">
                <Briefcase className="w-6 h-6 text-blue-600" />
                <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Regular Orders</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-6 rounded-[2rem] text-center">
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Total</p>
                  <p className="text-3xl font-black text-blue-700">{stats.regularOrders.totalOrders}</p>
                </div>
                <div className="bg-emerald-50 p-6 rounded-[2rem] text-center">
                  <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Success</p>
                  <p className="text-3xl font-black text-emerald-700">{stats.regularOrders.completedCount}</p>
                </div>
                <div className="bg-amber-50 p-6 rounded-[2rem] text-center">
                  <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-1">Ongoing</p>
                  <p className="text-3xl font-black text-amber-700">{stats.regularOrders.ongoingCount}</p>
                </div>
                <div className="bg-red-50 p-6 rounded-[2rem] text-center">
                  <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">Cancelled</p>
                  <p className="text-3xl font-black text-red-700">{stats.regularOrders.cancelledCount}</p>
                </div>
              </div>
            </div>

            {/* Vendor Projects */}
            <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm space-y-6">
              <div className="flex items-center space-x-3 pb-4 border-b border-gray-50">
                <TrendingUp className="w-6 h-6 text-purple-600" />
                <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Vendor Projects</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl">
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <span className="font-bold text-gray-600">Completed Projects</span>
                  </div>
                  <span className="text-xl font-black text-gray-900">{stats.vendorOrders.completedVendorCount}</span>
                </div>
                <div className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl">
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-amber-500" />
                    <span className="font-bold text-gray-600">Active Assignments</span>
                  </div>
                  <span className="text-xl font-black text-gray-900">{stats.vendorOrders.ongoingVendorCount}</span>
                </div>
                <div className="p-6 bg-purple-50 rounded-[2rem] text-center mt-2">
                   <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-1">Engagement Rate</p>
                   <p className="text-3xl font-black text-purple-700">
                    {stats.vendorOrders.totalVendorOrders > 0 ? ((stats.vendorOrders.completedVendorCount / stats.vendorOrders.totalVendorOrders) * 100).toFixed(0) : 0}%
                   </p>
                </div>
              </div>
            </div>

            {/* Financial Overview */}
            <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm space-y-6">
              <div className="flex items-center space-x-3 pb-4 border-b border-gray-50">
                <Wallet className="w-6 h-6 text-emerald-600" />
                <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Financial Profile</h3>
              </div>
              <div className="space-y-4">
                <div className="p-6 bg-gray-900 rounded-[2rem] text-white">
                  <div className="flex items-center justify-between mb-4">
                    <CreditCard className="w-5 h-5 text-gray-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Available Balance</span>
                  </div>
                  <p className="text-4xl font-black">₹{stats.wallet.availableBalance.toLocaleString()}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Withdrawn</p>
                    <p className="text-lg font-black text-emerald-700">₹{stats.wallet.withdrawnAmount.toLocaleString()}</p>
                  </div>
                  <div className="p-5 bg-amber-50 rounded-2xl border border-amber-100">
                    <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-1">Pending</p>
                    <p className="text-lg font-black text-amber-700">₹{stats.withdrawals.pendingWithdrawalAmount.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Warnings / Flags */}
          {stats.regularOrders.cancelledCount > (stats.regularOrders.totalOrders * 0.3) && (
            <div className="bg-red-50 border-2 border-red-100 p-6 rounded-[2rem] flex items-center space-x-4">
              <AlertTriangle className="w-10 h-10 text-red-500" />
              <div>
                <h4 className="text-red-900 font-black uppercase tracking-tight">High Cancellation Rate Detected</h4>
                <p className="text-red-700 font-bold text-sm">This engineer has cancelled more than 30% of their assigned regular orders. Investigation recommended.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EngineerDossierModal;
