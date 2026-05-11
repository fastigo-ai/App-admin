import React, { useState } from 'react';
import { Shield, Phone, Key, ArrowRight, Loader2, AlertCircle, ChevronDown } from 'lucide-react';
import api from '../api/api';

interface LoginProps {
  onLoginSuccess: (user: any) => void;
}

const countryCodes = [
  { code: '+91', name: 'India', flag: '🇮🇳' },
  { code: '+1', name: 'USA', flag: '🇺🇸' },
  { code: '+44', name: 'UK', flag: '🇬🇧' },
  { code: '+971', name: 'UAE', flag: '🇦🇪' },
  { code: '+61', name: 'Australia', flag: '🇦🇺' },
  { code: '+65', name: 'Singapore', flag: '🇸🇬' },
];

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [selectedCountry, setSelectedCountry] = useState(countryCodes[0]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const fullMobile = `${selectedCountry.code}${phoneNumber}`;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) return;

    setLoading(true);
    setError('');
    try {
      const response = await api.post('/admin/auth/send-otp', { mobile: fullMobile });
      if (response.data.success) {
        setStep('otp');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return;

    setLoading(true);
    setError('');
    try {
      const response = await api.post('/admin/auth/verify-otp', { mobile: fullMobile, otp });
      if (response.data.success) {
        onLoginSuccess(response.data.user);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-md w-full bg-[#1e293b]/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl relative z-10">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/20">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Admin Portal</h1>
          <p className="text-slate-400">Secure access for Door2fy administrators</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl flex items-center space-x-3 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {step === 'phone' ? (
          <form onSubmit={handleSendOtp} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2 ml-1">
                Registered Mobile Number
              </label>
              <div className="flex space-x-2">
                {/* Country Code Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center space-x-2 px-4 py-4 bg-[#0f172a]/50 border border-slate-700 rounded-2xl text-white hover:bg-slate-700/50 transition-all min-w-[100px]"
                  >
                    <span>{selectedCountry.flag}</span>
                    <span>{selectedCountry.code}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute left-0 top-full mt-2 w-48 bg-[#1e293b] border border-slate-700 rounded-xl shadow-2xl z-50 py-2">
                      {countryCodes.map((country) => (
                        <button
                          key={country.code}
                          type="button"
                          onClick={() => {
                            setSelectedCountry(country);
                            setIsDropdownOpen(false);
                          }}
                          className="w-full flex items-center space-x-3 px-4 py-3 text-left text-slate-300 hover:bg-slate-700/50 transition-colors"
                        >
                          <span>{country.flag}</span>
                          <span>{country.name}</span>
                          <span className="text-slate-500 ml-auto">{country.code}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="relative flex-1 group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="XXXXX XXXXX"
                    className="block w-full pl-11 pr-4 py-4 bg-[#0f172a]/50 border border-slate-700 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !phoneNumber}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold py-4 px-6 rounded-2xl flex items-center justify-center space-x-2 shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>Generate OTP</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2 ml-1">
                <label className="block text-sm font-medium text-slate-300">
                  Verification Code
                </label>
                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="text-xs text-blue-400 hover:text-blue-300 font-medium"
                >
                  Change number
                </button>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Key className="h-5 w-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter OTP"
                  maxLength={6}
                  className="block w-full pl-11 pr-4 py-4 bg-[#0f172a]/50 border border-slate-700 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all tracking-[0.5em] text-center font-bold"
                  required
                />
              </div>
              <p className="mt-3 text-xs text-slate-500 text-center">
                OTP sent to <span className="text-slate-300">{fullMobile}</span>
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !otp}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold py-4 px-6 rounded-2xl flex items-center justify-center space-x-2 shadow-lg shadow-emerald-600/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>Verify & Secure Login</span>
                  <Shield className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </>
              )}
            </button>
          </form>
        )}

        <div className="mt-10 text-center">
          <p className="text-slate-500 text-xs uppercase tracking-widest font-semibold">
            &copy; 2026 Door2fy Technologies
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
