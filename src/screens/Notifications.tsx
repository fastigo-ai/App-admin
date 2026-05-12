import React, { useState, useEffect } from "react";
import { 
  Send, 
  Users, 
  Megaphone, 
  Search, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  ChevronRight,
  Filter,
  Layers,
  MapPin,
  Info,
  Image as ImageIcon,
  Link as LinkIcon,
  Calendar as CalendarIcon,
  History as HistoryIcon,
  RefreshCcw,
  ExternalLink,
  MoreVertical,
  Trash2,
  Settings,
  Eye,
  TrendingUp
} from "lucide-react";
import { getAllCustomers } from "../api/customerApi";
import { getAllEngineers } from "../api/engineerApi";
import { sendNotification, sendCampaign, getNotificationHistory } from "../api/notificationApi";
import { useDebounce } from "../hooks/useDebounce";
import Pagination from "../components/Pagination";
import toast from "react-hot-toast";

const formatDate = (date: string | Date) => {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

type TabType = "campaign" | "direct" | "history";
type TargetType = "all" | "city" | "segment";
type UserModel = "User" | "Engineer";

const APP_SCREENS = [
  { label: "Home / Dashboard", value: "Home" },
  { label: "Booking Details", value: "BookingDetails" },
  { label: "Wallet / Payments", value: "Wallet" },
  { label: "Promotions / Offers", value: "Offers" },
  { label: "Profile Settings", value: "Profile" },
  { label: "Support Chat", value: "Support" },
];

const Notifications = () => {
  const [activeTab, setActiveTab] = useState<TabType>("campaign");
  const [isSending, setIsSending] = useState(false);

  // Form State
  const [userModel, setUserModel] = useState<UserModel>("User");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [image, setImage] = useState("");
  const [screen, setScreen] = useState("");
  const [notificationType, setNotificationType] = useState("PROMO");
  const [scheduledAt, setScheduledAt] = useState("");
  
  // Campaign specific
  const [target, setTarget] = useState<TargetType>("all");
  const [city, setCity] = useState("");
  const [segment, setSegment] = useState("NEW");
  const [batchSize, setBatchSize] = useState<number>(500);
  const [staggerMinutes, setStaggerMinutes] = useState<number>(0);

  // Direct specific
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [isFetchingUsers, setIsFetchingUsers] = useState(false);

  const [history, setHistory] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);
  const [isFetchingHistory, setIsFetchingHistory] = useState(false);

  useEffect(() => {
    if (activeTab === "direct" && debouncedSearch) {
      fetchUsers();
    }
  }, [debouncedSearch, userModel, activeTab]);

  useEffect(() => {
    if (activeTab === "history") {
      fetchHistory();
    }
  }, [activeTab, historyPage]);

  const fetchUsers = async () => {
    setIsFetchingUsers(true);
    try {
      if (userModel === "User") {
        const res = await getAllCustomers({ search: debouncedSearch, limit: 10 });
        setUsers(res.data || []);
      } else {
        const res = await getAllEngineers({ search: debouncedSearch, limit: 10 });
        setUsers(res.data || []);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setIsFetchingUsers(false);
    }
  };

  const fetchHistory = async () => {
    setIsFetchingHistory(true);
    try {
      const res = await getNotificationHistory({ page: historyPage, limit: 10 });
      setHistory(res.data || []);
      setStats(res.stats || null);
      setHistoryTotalPages(res.pagination?.pages || 1);
    } catch (err) {
      toast.error("Failed to fetch history");
    } finally {
      setIsFetchingHistory(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !body) {
      toast.error("Please fill in title and body");
      return;
    }

    if (activeTab === "direct" && selectedUserIds.length === 0) {
      toast.error("Please select at least one recipient");
      return;
    }

    setIsSending(true);
    try {
      const commonParams = {
        userModel,
        type: notificationType,
        title,
        body,
        image: image || undefined,
        screen: screen || undefined,
        scheduledAt: scheduledAt || undefined,
        batchSize,
        staggerMinutes
      };

      if (activeTab === "campaign") {
        await sendCampaign({
          ...commonParams,
          target,
          segment: target === "segment" ? segment : undefined,
          city: target === "city" ? city : undefined,
        });
        toast.success("Campaign enqueued successfully!");
      } else {
        await sendNotification({
          ...commonParams,
          userIds: selectedUserIds,
        });
        toast.success("Notifications sent successfully!");
        setSelectedUserIds([]);
      }
      
      // Reset form
      setTitle("");
      setBody("");
      setImage("");
      setScreen("");
      setScheduledAt("");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to send notification");
    } finally {
      setIsSending(false);
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUserIds(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const getStatusBadge = (status: string) => {
    const colors: any = {
      SENT: "bg-emerald-100 text-emerald-700",
      PENDING: "bg-amber-100 text-amber-700",
      FAILED: "bg-red-100 text-red-700",
      PROCESSING: "bg-blue-100 text-blue-700",
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${colors[status] || "bg-gray-100 text-gray-700"}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Notification Hub</h1>
          <p className="text-gray-500 mt-1">Advanced management for app-wide communication and user engagement.</p>
        </div>
        <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-100">
          {[
            { id: "campaign", label: "Campaign", icon: Megaphone },
            { id: "direct", label: "Direct", icon: Send },
            { id: "history", label: "Logs", icon: HistoryIcon },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab !== "history" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900 flex items-center">
                  {activeTab === "campaign" ? <Megaphone className="w-5 h-5 mr-2 text-blue-600" /> : <Send className="w-5 h-5 mr-2 text-indigo-600" />}
                  {activeTab === "campaign" ? "Launch Campaign" : "Direct Message"}
                </h2>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                    Target: {userModel}
                  </span>
                </div>
              </div>
              
              <form onSubmit={handleSend} className="p-6 space-y-6">
                {/* 1. Target & Type Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">User Type</label>
                    <div className="flex p-1 bg-gray-50 rounded-xl border border-gray-100">
                      <button
                        type="button"
                        onClick={() => setUserModel("User")}
                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                          userModel === "User" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500"
                        }`}
                      >
                        Customers
                      </button>
                      <button
                        type="button"
                        onClick={() => setUserModel("Engineer")}
                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                          userModel === "Engineer" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500"
                        }`}
                      >
                        Engineers
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Category</label>
                    <select
                      value={notificationType}
                      onChange={(e) => setNotificationType(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 outline-none"
                    >
                      <option value="PROMO">Promotional</option>
                      <option value="OFFER">Special Offer</option>
                      <option value="UPDATE">App Update</option>
                      <option value="SYSTEM">System Alert</option>
                    </select>
                  </div>
                </div>

                {/* 2. Campaign Targeting UI */}
                {activeTab === "campaign" && (
                  <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 space-y-5">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1 space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Audience Filter</label>
                        <div className="flex gap-2 p-1 bg-white rounded-lg border border-gray-100">
                          {(["all", "city", "segment"] as TargetType[]).map((t) => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => setTarget(t)}
                              className={`flex-1 py-1.5 rounded text-xs font-bold capitalize transition-all ${
                                target === t
                                  ? "bg-blue-600 text-white shadow-sm"
                                  : "text-gray-500 hover:bg-gray-50"
                              }`}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>

                      {target === "city" && (
                        <div className="flex-1 space-y-2">
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">City</label>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                            <input
                              type="text"
                              placeholder="e.g. Mumbai"
                              value={city}
                              onChange={(e) => setCity(e.target.value)}
                              className="w-full bg-white border border-gray-100 rounded-xl pl-9 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                          </div>
                        </div>
                      )}

                      {target === "segment" && (
                        <div className="flex-1 space-y-2">
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Segment</label>
                          <select
                            value={segment}
                            onChange={(e) => setSegment(e.target.value)}
                            className="w-full bg-white border border-gray-100 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                          >
                            <option value="NEW">New (Joined &lt; 7d)</option>
                            <option value="ACTIVE">Power Users</option>
                            <option value="INACTIVE">Dormant Users</option>
                            <option value="VIP">High Value (VIP)</option>
                          </select>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Staggering</label>
                        <div className="grid grid-cols-2 gap-2">
                          <input 
                            type="number" 
                            placeholder="Batch"
                            value={batchSize}
                            onChange={(e) => setBatchSize(Number(e.target.value))}
                            className="w-full bg-white border border-gray-100 rounded-lg px-3 py-2 text-xs outline-none"
                          />
                          <input 
                            type="number" 
                            placeholder="Interval"
                            value={staggerMinutes}
                            onChange={(e) => setStaggerMinutes(Number(e.target.value))}
                            className="w-full bg-white border border-gray-100 rounded-lg px-3 py-2 text-xs outline-none"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Schedule (Optional)</label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-2 w-4 h-4 text-gray-400" />
                          <input
                            type="datetime-local"
                            value={scheduledAt}
                            onChange={(e) => setScheduledAt(e.target.value)}
                            className="w-full bg-white border border-gray-100 rounded-lg pl-9 pr-4 py-1.5 text-xs outline-none focus:ring-2 focus:ring-blue-500/20"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Direct Message UI */}
                {activeTab === "direct" && (
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-gray-700">Select Recipients</label>
                    <div className="relative">
                      <Search className="absolute left-4 top-3 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder={`Search ${userModel.toLowerCase()}s...`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-12 pr-4 py-3 text-sm outline-none focus:bg-white transition-all focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                    
                    {isFetchingUsers ? (
                      <div className="flex justify-center py-6">
                        <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                      </div>
                    ) : users.length > 0 ? (
                      <div className="max-h-60 overflow-y-auto border border-gray-100 rounded-xl divide-y divide-gray-100 bg-white">
                        {users.map((u) => (
                          <div 
                            key={u._id}
                            onClick={() => toggleUserSelection(u._id)}
                            className={`flex items-center justify-between p-3 cursor-pointer transition-colors ${
                              selectedUserIds.includes(u._id) ? "bg-blue-50" : "hover:bg-gray-50"
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${selectedUserIds.includes(u._id) ? "border-blue-200 bg-blue-100 text-blue-600" : "border-gray-100 bg-gray-50 text-gray-400"}`}>
                                <Users className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-gray-900">{u.name}</p>
                                <p className="text-[11px] text-gray-500">{u.mobile}</p>
                              </div>
                            </div>
                            {selectedUserIds.includes(u._id) && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
                          </div>
                        ))}
                      </div>
                    ) : searchTerm && !isFetchingUsers ? (
                      <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <p className="text-sm text-gray-500 font-medium">No results found</p>
                      </div>
                    ) : null}

                    {selectedUserIds.length > 0 && (
                      <div className="flex items-center justify-between py-1">
                        <p className="text-xs font-bold text-blue-600">
                          {selectedUserIds.length} recipients selected
                        </p>
                        <button type="button" onClick={() => setSelectedUserIds([])} className="text-xs text-red-500 hover:underline font-bold">
                          Clear
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* 4. Content Area */}
                <div className="space-y-5 pt-5 border-t border-gray-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Title</label>
                      <input
                        type="text"
                        placeholder="Notification Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Image URL (Optional)</label>
                      <input
                        type="text"
                        placeholder="https://..."
                        value={image}
                        onChange={(e) => setImage(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Message Body</label>
                    <textarea
                      rows={3}
                      placeholder="Your message content..."
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Target Screen</label>
                    <select
                      value={screen}
                      onChange={(e) => setScreen(e.target.value)}
                      className="w-full bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="">Default (Open App)</option>
                      {APP_SCREENS.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSending}
                  className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center space-x-2 ${
                    isSending ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700 shadow-blue-200 hover:shadow-blue-300"
                  }`}
                >
                  {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  <span>{isSending ? "Sending..." : activeTab === "campaign" ? "Launch Campaign" : "Send Message"}</span>
                </button>
              </form>
            </div>
          </div>

          {/* Sidebar: Preview */}
          <div className="space-y-6">
            <div className="bg-gray-900 rounded-[2.5rem] p-3 shadow-2xl border-4 border-gray-800">
              <div className="bg-gray-100 rounded-[2rem] min-h-[400px] p-4 relative overflow-hidden">
                <div className="bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-lg border border-white/50 flex gap-3 animate-in slide-in-from-top mt-4">
                  <div className="w-9 h-9 bg-blue-600 rounded-xl flex-shrink-0 flex items-center justify-center">
                    <Settings className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <p className="text-[10px] font-bold text-blue-600 uppercase tracking-tighter">Door2fy</p>
                      <p className="text-[10px] text-gray-400">now</p>
                    </div>
                    <h4 className="text-xs font-bold text-gray-900 truncate">{title || "Title"}</h4>
                    <p className="text-[11px] text-gray-600 line-clamp-2 mt-0.5">{body || "Your notification body will appear here..."}</p>
                    {image && (
                      <div className="mt-2 rounded-lg overflow-hidden border border-gray-100 aspect-video">
                        <img src={image} className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-24 h-1 bg-gray-300 rounded-full" />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 flex items-center text-sm mb-4">
                <AlertCircle className="w-4 h-4 mr-2 text-amber-500" />
                Campaign Tips
              </h3>
              <div className="space-y-3">
                {[
                  "Use {name} for personalization",
                  "Include a high-quality image",
                  "Target specific user segments",
                  "Time your sends for peak activity"
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center text-xs text-gray-500 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-2 text-emerald-500" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* History Section */
        <div className="space-y-6">
          {/* Performance Dashboard */}
          {stats && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { label: 'Total Broadcasts', value: stats.total, icon: Megaphone, color: 'blue' },
                { label: 'Total Opens', value: stats.opened, icon: Eye, color: 'emerald' },
                { label: 'Open Rate', value: `${stats.openRate}%`, icon: TrendingUp, color: 'indigo' }
              ].map((item, idx) => (
                <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">{item.label}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{item.value}</p>
                  </div>
                  <div className={`w-12 h-12 ${item.color === 'emerald' ? 'bg-emerald-100 text-emerald-600' : item.color === 'indigo' ? 'bg-blue-100 text-blue-600' : 'bg-blue-100 text-blue-600'} rounded-xl flex items-center justify-center`}>
                    <item.icon className="w-6 h-6" />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Delivery History</h2>
              <button onClick={fetchHistory} className="p-2 hover:bg-white rounded-lg transition-colors">
                <RefreshCcw className={`w-5 h-5 text-gray-400 ${isFetchingHistory ? "animate-spin" : ""}`} />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-left">
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Recipient</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Message</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Sent Time</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {isFetchingHistory ? (
                    [...Array(5)].map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td colSpan={6} className="px-6 py-5"><div className="h-10 bg-gray-50 rounded-lg w-full" /></td>
                      </tr>
                    ))
                  ) : history.length === 0 ? (
                    <tr><td colSpan={6} className="px-6 py-20 text-center text-gray-500 font-medium">No records found</td></tr>
                  ) : (
                    history.map((log) => (
                      <tr key={log._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xs uppercase">
                              {log.userModel?.[0] || 'U'}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-900">{log.userId?.name || "Bulk"}</p>
                              <p className="text-[11px] text-gray-400">{log.userId?.mobile || "Campaign"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 max-w-xs">
                          <p className="text-sm font-bold text-gray-900 truncate">{log.title}</p>
                          <p className="text-xs text-gray-500 truncate">{log.body}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold rounded uppercase tracking-wider">
                            {log.type}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(log.status)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <p className="text-xs text-gray-600 font-medium">{log.sentAt ? formatDate(log.sentAt) : "-"}</p>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="p-2 hover:bg-gray-100 text-gray-400 hover:text-blue-600 rounded-lg transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <Pagination 
              currentPage={historyPage}
              totalPages={historyTotalPages}
              onPageChange={setHistoryPage}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
