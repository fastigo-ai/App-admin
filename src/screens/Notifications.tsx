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
  Settings
} from "lucide-react";
import { getAllCustomers } from "../api/customerApi";
import { getAllEngineers } from "../api/engineerApi";
import { sendNotification, sendCampaign, getNotificationHistory } from "../api/notificationApi";
import { useDebounce } from "../hooks/useDebounce";
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
  const [isLoading, setIsLoading] = useState(false);
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

  // History State
  const [history, setHistory] = useState<any[]>([]);
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
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight text-gradient bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            Notification Hub
          </h1>
          <p className="text-gray-500 mt-1">Advanced management for app-wide communication and user engagement.</p>
        </div>
        <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-gray-100">
          {[
            { id: "campaign", label: "Campaign", icon: Megaphone },
            { id: "direct", label: "Direct", icon: Send },
            { id: "history", label: "Logs", icon: HistoryIcon },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
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
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900 flex items-center">
                  {activeTab === "campaign" ? <Megaphone className="w-5 h-5 mr-2 text-blue-600" /> : <Send className="w-5 h-5 mr-2 text-indigo-600" />}
                  {activeTab === "campaign" ? "Launch New Campaign" : "Direct Message Composer"}
                </h2>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-400 font-medium italic">Targeting:</span>
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                    {userModel === "User" ? "Customers" : "Engineers"}
                  </span>
                </div>
              </div>
              
              <form onSubmit={handleSend} className="p-8 space-y-8">
                {/* 1. Target & Type Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-gray-700 ml-1">User Type</label>
                    <div className="flex p-1 bg-gray-50 rounded-2xl border border-gray-100">
                      <button
                        type="button"
                        onClick={() => setUserModel("User")}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                          userModel === "User" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500"
                        }`}
                      >
                        Customers
                      </button>
                      <button
                        type="button"
                        onClick={() => setUserModel("Engineer")}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                          userModel === "Engineer" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500"
                        }`}
                      >
                        Engineers
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-bold text-gray-700 ml-1 text-gradient bg-clip-text">Category</label>
                    <select
                      value={notificationType}
                      onChange={(e) => setNotificationType(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
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
                  <div className="p-6 bg-blue-50/50 rounded-3xl border border-blue-100 space-y-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex-1 space-y-3">
                        <label className="text-xs font-black text-blue-800 uppercase tracking-widest ml-1">Audience Filter</label>
                        <div className="flex gap-2 p-1 bg-white rounded-xl shadow-sm border border-blue-100">
                          {(["all", "city", "segment"] as TargetType[]).map((t) => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => setTarget(t)}
                              className={`flex-1 py-2 rounded-lg text-xs font-bold capitalize transition-all ${
                                target === t
                                  ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                                  : "text-gray-500 hover:bg-gray-50"
                              }`}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>

                      {target === "city" && (
                        <div className="flex-1 space-y-3">
                          <label className="text-xs font-black text-blue-800 uppercase tracking-widest ml-1">City</label>
                          <div className="relative">
                            <MapPin className="absolute left-4 top-3.5 w-4 h-4 text-blue-400" />
                            <input
                              type="text"
                              placeholder="e.g. Mumbai"
                              value={city}
                              onChange={(e) => setCity(e.target.value)}
                              className="w-full bg-white border border-blue-100 rounded-2xl pl-11 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                          </div>
                        </div>
                      )}

                      {target === "segment" && (
                        <div className="flex-1 space-y-3">
                          <label className="text-xs font-black text-blue-800 uppercase tracking-widest ml-1">Segment</label>
                          <select
                            value={segment}
                            onChange={(e) => setSegment(e.target.value)}
                            className="w-full bg-white border border-blue-100 rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                          >
                            <option value="NEW">New (Joined &lt; 7d)</option>
                            <option value="ACTIVE">Power Users</option>
                            <option value="INACTIVE">Dormant Users</option>
                            <option value="VIP">High Value (VIP)</option>
                          </select>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-blue-100">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between ml-1">
                          <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Staggering</label>
                          <span className="text-[10px] text-blue-600 font-bold bg-blue-100 px-2 py-0.5 rounded-full">Anti-Spam</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <p className="text-[10px] text-gray-400 ml-1">Batch Size</p>
                            <input 
                              type="number" 
                              value={batchSize}
                              onChange={(e) => setBatchSize(Number(e.target.value))}
                              className="w-full bg-white border border-gray-100 rounded-xl px-3 py-2 text-xs outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] text-gray-400 ml-1">Minutes Between</p>
                            <input 
                              type="number" 
                              value={staggerMinutes}
                              onChange={(e) => setStaggerMinutes(Number(e.target.value))}
                              className="w-full bg-white border border-gray-100 rounded-xl px-3 py-2 text-xs outline-none"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Schedule (Optional)</label>
                        <div className="relative">
                          <Clock className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                          <input
                            type="datetime-local"
                            value={scheduledAt}
                            onChange={(e) => setScheduledAt(e.target.value)}
                            className="w-full bg-white border border-gray-100 rounded-2xl pl-11 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Direct Message UI */}
                {activeTab === "direct" && (
                  <div className="space-y-4">
                    <label className="text-sm font-bold text-gray-700 ml-1">Select Recipients</label>
                    <div className="relative group">
                      <Search className="absolute left-4 top-4 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                      <input
                        type="text"
                        placeholder={`Search ${userModel === "User" ? "customers" : "engineers"}...`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-12 pr-4 py-4 text-sm focus:bg-white transition-all outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500"
                      />
                    </div>
                    
                    {isFetchingUsers ? (
                      <div className="flex justify-center py-8">
                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : users.length > 0 ? (
                      <div className="max-h-60 overflow-y-auto border border-gray-100 rounded-2xl divide-y divide-gray-50 shadow-inner bg-gray-50/30">
                        {users.map((u) => (
                          <div 
                            key={u._id}
                            onClick={() => toggleUserSelection(u._id)}
                            className={`flex items-center justify-between p-4 cursor-pointer transition-all ${
                              selectedUserIds.includes(u._id) ? "bg-blue-50" : "hover:bg-white"
                            }`}
                          >
                            <div className="flex items-center space-x-4">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${selectedUserIds.includes(u._id) ? "border-blue-200 bg-white" : "border-gray-100 bg-gray-50"}`}>
                                <Users className={`w-5 h-5 ${selectedUserIds.includes(u._id) ? "text-blue-600" : "text-gray-400"}`} />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-gray-900">{u.name}</p>
                                <p className="text-xs text-gray-500 font-medium">{u.mobile}</p>
                              </div>
                            </div>
                            {selectedUserIds.includes(u._id) && (
                              <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                                <CheckCircle2 className="w-4 h-4 text-white" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : searchTerm && !isFetchingUsers ? (
                      <div className="text-center py-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        <Search className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">No matching {userModel.toLowerCase()}s found</p>
                      </div>
                    ) : null}

                    {selectedUserIds.length > 0 && (
                      <div className="flex items-center justify-between px-2 pt-2">
                        <p className="text-xs font-bold text-blue-700">
                          {selectedUserIds.length} recipient{selectedUserIds.length > 1 ? "s" : ""} selected
                        </p>
                        <button 
                          type="button"
                          onClick={() => setSelectedUserIds([])}
                          className="text-xs text-red-500 hover:underline font-bold"
                        >
                          Clear Selection
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* 4. Content Area */}
                <div className="space-y-6 pt-6 border-t border-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-sm font-bold text-gray-700 ml-1">Title</label>
                      <input
                        type="text"
                        placeholder="e.g. Flash Sale: 20% Off"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3.5 text-sm font-medium outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-sm font-bold text-gray-700 ml-1 flex items-center">
                        <ImageIcon className="w-4 h-4 mr-1 text-gray-400" />
                        Image URL (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="https://example.com/banner.jpg"
                        value={image}
                        onChange={(e) => setImage(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3.5 text-sm font-medium outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-bold text-gray-700 ml-1">Message Body</label>
                    <textarea
                      rows={4}
                      placeholder="Enter your notification message content here..."
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-4 text-sm font-medium outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 resize-none transition-all"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-bold text-gray-700 ml-1 flex items-center">
                      <LinkIcon className="w-4 h-4 mr-1 text-gray-400" />
                      Deep Link / Screen (Optional)
                    </label>
                    <select
                      value={screen}
                      onChange={(e) => setScreen(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3.5 text-sm font-medium outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
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
                  className={`w-full py-5 rounded-2xl font-black text-white shadow-xl shadow-blue-500/20 flex items-center justify-center space-x-3 transition-all ${
                    isSending ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 hover:scale-[1.02] active:scale-100"
                  }`}
                >
                  {isSending ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-6 h-6" />
                      <span className="text-lg">
                        {activeTab === "campaign" 
                          ? (scheduledAt ? "Schedule Campaign" : "Blast Campaign Now") 
                          : "Dispatch Message"}
                      </span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Sidebar: Preview & Quick Tips */}
          <div className="space-y-8">
            {/* Live Preview */}
            <div className="bg-gray-900 rounded-[3rem] p-4 shadow-2xl border-8 border-gray-800 relative overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-gray-800 rounded-b-2xl z-10" />
              <div className="bg-gray-100 rounded-[2rem] min-h-[450px] p-6 relative">
                <div className="mt-8 space-y-4">
                  <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-white flex gap-3 animate-in slide-in-from-top duration-500">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex-shrink-0 flex items-center justify-center">
                      <Settings className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <p className="text-[10px] font-bold text-blue-600 uppercase tracking-tighter">Door2fy</p>
                        <p className="text-[10px] text-gray-400">now</p>
                      </div>
                      <h4 className="text-sm font-black text-gray-900 truncate">{title || "Notification Title"}</h4>
                      <p className="text-xs text-gray-600 line-clamp-2 mt-0.5">{body || "The notification message will appear here..."}</p>
                      {image && (
                        <div className="mt-3 rounded-lg overflow-hidden border border-gray-100 aspect-video bg-gray-200">
                          <img src={image} alt="preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-gray-300 rounded-full" />
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
              <h3 className="font-bold text-gray-900 flex items-center">
                <AlertCircle className="w-5 h-5 mr-2 text-amber-500" />
                Quick Checklist
              </h3>
              <div className="space-y-3">
                {[
                  "Personalize with {name} tag",
                  "Check links for deep linking",
                  "Verify image URL validity",
                  "Optimize batch size for speed",
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center text-xs font-bold text-gray-500">
                    <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-500" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* History Section */
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 flex items-center">
              <HistoryIcon className="w-5 h-5 mr-2 text-blue-600" />
              Notification History Logs
            </h2>
            <button 
              onClick={fetchHistory}
              className="p-2 hover:bg-white rounded-xl transition-colors text-gray-400 hover:text-blue-600"
            >
              <RefreshCcw className={`w-5 h-5 ${isFetchingHistory ? "animate-spin" : ""}`} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50 text-left">
                  <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Recipient</th>
                  <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Message</th>
                  <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Type</th>
                  <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Scheduled</th>
                  <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Sent At</th>
                  <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isFetchingHistory ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={7} className="px-6 py-4">
                        <div className="h-12 bg-gray-50 rounded-xl w-full" />
                      </td>
                    </tr>
                  ))
                ) : history.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500 font-medium">
                      No notification logs found.
                    </td>
                  </tr>
                ) : (
                  history.map((log) => (
                    <tr key={log._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xs">
                            {log.userModel === "User" ? "C" : "E"}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">{log.userId?.name || "System"}</p>
                            <p className="text-[10px] text-gray-400 font-medium">{log.userId?.mobile || "Bulk Broadcast"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 max-w-xs">
                        <p className="text-sm font-bold text-gray-900 truncate">{log.title}</p>
                        <p className="text-xs text-gray-500 truncate">{log.body}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                          {log.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(log.status)}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs text-gray-500">
                          {log.nextRunAt && new Date(log.nextRunAt) > new Date(log.createdAt) 
                            ? formatDate(log.nextRunAt) 
                            : "-"}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs text-gray-500">
                          {log.sentAt ? formatDate(log.sentAt) : "-"}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-blue-600 transition-all">
                            <ExternalLink className="w-4 h-4" />
                          </button>
                          <button className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-red-500 transition-all">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {historyTotalPages > 1 && (
            <div className="p-6 border-t border-gray-50 flex items-center justify-between bg-gray-50/20">
              <p className="text-xs font-bold text-gray-500">
                Page {historyPage} of {historyTotalPages}
              </p>
              <div className="flex space-x-2">
                <button
                  disabled={historyPage === 1}
                  onClick={() => setHistoryPage(p => p - 1)}
                  className="px-4 py-2 rounded-xl text-sm font-bold bg-white border border-gray-100 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  disabled={historyPage === historyTotalPages}
                  onClick={() => setHistoryPage(p => p + 1)}
                  className="px-4 py-2 rounded-xl text-sm font-bold bg-white border border-gray-100 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Notifications;
