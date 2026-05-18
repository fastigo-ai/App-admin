import React, { useState, useEffect } from 'react';
import { X, User, Loader2, CheckCircle2 } from 'lucide-react';
import { getAvailableEngineers } from '../api/engineerApi';
import { assignEngineer } from '../api/bookingApi';

interface AssignEngineerModalProps {
  order: any;
  onClose: () => void;
  onSuccess: () => void;
}

const AssignEngineerModal: React.FC<AssignEngineerModalProps> = ({ order, onClose, onSuccess }) => {
  const [engineers, setEngineers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEngineers();
  }, []);

  const fetchEngineers = async () => {
    try {
      setLoading(true);
      const data = await getAvailableEngineers();
      setEngineers(data || []);
    } catch (err) {
      console.error('Error fetching engineers:', err);
      setError('Failed to load available engineers');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (engineerId: string) => {
    try {
      setAssigning(engineerId);
      await assignEngineer(order._id, engineerId);
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error assigning engineer:', err);
      alert('Failed to assign engineer');
    } finally {
      setAssigning(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative animate-in fade-in zoom-in duration-300">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Assign Partner</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-all"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {/* Booking Summary */}
          <div className="bg-gray-50 rounded-2xl p-5 mb-6">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Target Booking</h3>
            <div className="space-y-2">
              <p className="text-xs font-bold text-gray-900 flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                {order.isVendor ? order.call_id : order.orderId}
              </p>
              <p className="text-[13px] font-medium text-gray-600 ml-4">{order.isVendor ? order.contact_name : order.customerDetails?.name}</p>
              <p className="text-[11px] font-bold text-blue-600 ml-4 uppercase tracking-wider">{order.isVendor ? order.projectId : order.servicePlan?.name}</p>
            </div>
          </div>

          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 ml-1">Available Partners</h3>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-10">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
              <p className="text-sm font-medium text-gray-500 tracking-tight">Searching online partners...</p>
            </div>
          ) : error ? (
            <div className="text-center py-10">
              <p className="text-red-500 text-sm font-bold mb-4">{error}</p>
              <button 
                onClick={fetchEngineers}
                className="text-blue-600 font-bold text-sm hover:underline"
              >
                Try Again
              </button>
            </div>
          ) : engineers.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <p className="text-gray-400 text-sm font-medium">No partners online at the moment.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
              {engineers.map((engineer) => (
                <button
                  key={engineer._id}
                  onClick={() => handleAssign(engineer._id)}
                  disabled={!!assigning}
                  className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-blue-500 hover:bg-blue-50 transition-all group disabled:opacity-50"
                >
                  <div className="flex items-center text-left">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mr-3 group-hover:bg-blue-100 transition-colors">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center">
                        <p className="text-sm font-bold text-gray-900">{engineer.name}</p>
                        <div className="ml-2 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                      </div>
                      <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider mt-0.5">Online</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{(engineer.assignedOrders || []).length} Active</p>
                    {assigning === engineer._id ? (
                      <Loader2 className="w-4 h-4 text-blue-600 animate-spin ml-auto mt-1" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-transparent group-hover:text-blue-500 transition-colors ml-auto mt-1" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssignEngineerModal;
