import { motion } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, Bell, MessageCircle, User, Zap, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

const navLinks = [
  { label: "Home", path: "/home" },
  { label: "Chat", path: "/chat" },
  { label: "Sell", path: "/list" },
  { label: "Track", path: "/tracking" },
];

type Notification = {
  id: string;
  title: string;
  desc: string;
  time: string;
  unread: boolean;
  senderProfile?: any;
};

export default function Navbar() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select(`id, content, created_at, profiles!messages_sender_id_fkey(id, full_name, username, avatar_url)`)
        .eq("receiver_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (!error && data) {
        // Group by sender to avoid duplicate notifications from the same person (optional) or just map
        const mapped: Notification[] = data.map((msg: any) => ({
          id: msg.id,
          title: "New Message",
          desc: `${msg.profiles.full_name} sent: "${msg.content.length > 30 ? msg.content.substring(0, 30) + "..." : msg.content}"`,
          time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          unread: true,
          senderProfile: msg.profiles,
        }));

        setNotifications(mapped);
        setHasUnread(mapped.length > 0);
      }
    };

    fetchNotifications();

    const channel = supabase.channel('navbar_notifications').on('postgres_changes', {
      event: 'INSERT', schema: 'public', table: 'messages', filter: `receiver_id=eq.${user.id}`
    }, () => {
      fetchNotifications();
    }).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) setHasUnread(false);
  };

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
      className="fixed top-0 left-0 right-0 z-50 glass-heavy border-b border-white/5"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-fire flex items-center justify-center animate-glow-pulse">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">
            <span className="text-neon-fire">CU</span>
            <span className="text-foreground"> BAZZAR</span>
          </span>
        </Link>

        {/* Search */}
        <div className={`hidden md:flex flex-1 max-w-md mx-4 relative transition-all duration-300 ${searchFocused ? "max-w-lg" : ""}`}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search products, categories..."
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="w-full pl-10 pr-4 py-2 rounded-full glass text-sm text-foreground placeholder:text-muted-foreground outline-none border border-white/10 focus:border-neon-orange/50 focus:shadow-neon-fire transition-all duration-300"
          />
        </div>

        {/* Nav links */}
        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${location.pathname === link.path
                ? "bg-gradient-fire text-white shadow-neon-fire"
                : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 ml-auto lg:ml-0">
          <div className="static sm:relative">
            <button
              onClick={handleNotificationClick}
              className={`relative p-2 rounded-full hover-bell-ring transition-colors ${showNotifications ? 'bg-white/10 text-foreground' : 'hover:bg-white/5 text-muted-foreground hover:text-foreground'}`}
            >
              <Bell className="w-5 h-5" />
              {hasUnread && <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-gradient-fire"></span>}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="absolute top-[64px] left-4 right-4 sm:top-full sm:left-auto sm:right-0 sm:mt-2 w-auto sm:w-[360px] glass-heavy border border-white/10 rounded-2xl shadow-xl overflow-hidden z-50 origin-top sm:origin-top-right"
              >
                <div className="p-4 border-b border-white/5 flex items-center justify-between">
                  <h3 className="font-bold text-sm">Notifications</h3>
                  <button
                    onClick={() => {
                      setHasUnread(false);
                      setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
                    }}
                    className="text-xs text-neon-cyan hover:text-white transition-colors"
                  >
                    Mark all as read
                  </button>
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-muted-foreground flex flex-col items-center gap-2">
                      <Bell className="w-8 h-8 opacity-40" />
                      <span className="text-sm">No new notifications</span>
                    </div>
                  ) : notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        setShowNotifications(false);
                        if (n.senderProfile) {
                          navigate('/chat', { state: { contact: n.senderProfile } });
                        } else {
                          navigate('/chat');
                        }
                      }}
                      className="p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer flex gap-3"
                    >
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.unread && hasUnread ? "bg-neon-orange" : "bg-transparent"}`} />
                      <div className="flex-1 min-w-0 pr-2">
                        <p className="text-sm font-semibold text-foreground truncate">{n.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 break-words line-clamp-2">{n.desc}</p>
                        <p className="text-xs text-muted-foreground/60 mt-1">{n.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div
                  onClick={() => {
                    setShowNotifications(false);
                    navigate('/chat');
                  }}
                  className="p-3 text-center bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <span className="text-xs font-medium text-foreground">View all messages</span>
                </div>
              </motion.div>
            )}
          </div>
          <Link to="/chat" className="p-2 rounded-full hover:bg-white/5 transition-colors text-muted-foreground hover:text-foreground">
            <MessageCircle className="w-5 h-5" />
          </Link>
          <Link to="/profile" className="w-8 h-8 rounded-full bg-gradient-ocean flex items-center justify-center cursor-pointer hover:shadow-neon-cyan transition-shadow">
            <User className="w-4 h-4 text-white" />
          </Link>
          <button
            className="lg:hidden p-2 text-muted-foreground"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:hidden glass-heavy border-t border-white/5 px-4 py-4 flex flex-col gap-2"
        >
          <div className="flex items-center gap-2 mb-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              placeholder="Search..."
              className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground"
            />
          </div>
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMenuOpen(false)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${location.pathname === link.path
                ? "bg-gradient-fire text-white"
                : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`}
            >
              {link.label}
            </Link>
          ))}
        </motion.div>
      )}
    </motion.nav>
  );
}
