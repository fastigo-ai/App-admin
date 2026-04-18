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
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Assign Engineer</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {/* Booking Summary */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <h3 className="text-sm font-bold text-gray-900 mb-2">Booking Details</h3>
            <div className="space-y-1">
              <p className="text-xs text-gray-600">Order ID: <span className="text-gray-900 font-medium">{order.orderId}</span></p>
              <p className="text-xs text-gray-600">Customer: <span className="text-gray-900 font-medium">{order.customerDetails?.name}</span></p>
              <p className="text-xs text-gray-600">Service: <span className="text-gray-900 font-medium">{order.servicePlan?.name}</span></p>
            </div>
          </div>

          <h3 className="text-sm font-bold text-gray-900 mb-4">Available Online Engineers</h3>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-2" />
              <p className="text-sm text-gray-500">Fetching online partners...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500 text-sm mb-4">{error}</p>
              <button 
                onClick={fetchEngineers}
                className="text-blue-600 font-semibold text-sm hover:underline"
              >
                Try Again
              </button>
            </div>
          ) : engineers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">No online engineers found at the moment.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
              {engineers.map((engineer) => (
                <button
                  key={engineer._id}
                  onClick={() => handleAssign(engineer._id)}
                  disabled={!!assigning}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-blue-500 hover:bg-blue-50/50 transition-all group disabled:opacity-50"
                >
                  <div className="flex items-center text-left">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3 group-hover:bg-blue-200 transition-colors">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex flex-col text-left">
                      <div className="flex items-center">
                        <p className="text-[14px] font-bold text-gray-900 leading-tight">{engineer.name}</p>
                        <div className="ml-2 w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)] animate-pulse"></div>
                      </div>
                      <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Online Now</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-medium text-gray-500">{(engineer.assignedOrders || []).length} orders</p>
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
