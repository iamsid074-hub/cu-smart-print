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
        <Link to="/" className="flex items-center gap-2 flex-shrink-0 group">
          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center p-0.5 group-hover:border-neon-cyan/50 transition-colors shadow-lg">
            <img src="/logo.png" alt="CU BAZZAR Logo" className="w-[140%] h-[140%] object-cover object-center mix-blend-screen" />
          </div>
          <span className="font-bold text-lg tracking-tight hidden sm:block">
            <span className="text-neon-fire">CU</span>
            <span className="text-foreground group-hover:text-neon-cyan transition-colors"> BAZZAR</span>
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

        {/* Nav links - Center Pill Dock */}
        <div className="hidden lg:flex flex-1 justify-center relative z-10">
          <div className="flex items-center gap-1 p-1 rounded-full glass bg-black/40 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 relative overflow-hidden ${location.pathname === link.path
                  ? "text-white shadow-lg"
                  : "text-muted-foreground hover:text-white"
                  }`}
              >
                {/* Active Gradient Pill */}
                {location.pathname === link.path && (
                  <motion.div
                    layoutId="active-nav-pill"
                    className="absolute inset-0 bg-gradient-to-r from-neon-orange to-neon-pink rounded-full -z-10 shadow-neon-fire"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Actions - Right Side */}
        <div className="flex items-center gap-3 ml-auto z-10">
          <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md p-1 rounded-full border border-white/10 glass shadow-[0_8px_32px_rgba(0,0,0,0.5)]">

            {/* Notification Bell */}
            <div className="static sm:relative">
              <button
                onClick={handleNotificationClick}
                className={`relative p-2.5 rounded-full hover-bell-ring transition-colors flex items-center justify-center ${showNotifications ? 'bg-white/10 text-white' : 'hover:bg-white/5 text-muted-foreground hover:text-white'
                  }`}
              >
                <Bell className="w-5 h-5" />
                {hasUnread && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-neon-orange shadow-[0_0_10px_rgba(255,100,0,0.8)] border-2 border-[#12121A]"></span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="fixed top-[76px] left-4 right-4 sm:absolute sm:top-[calc(100%+12px)] sm:left-auto sm:-right-2 sm:mt-0 w-[calc(100vw-32px)] sm:w-[380px] glass-heavy border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 origin-top sm:origin-top-right bg-[#0A0A0F]/95 backdrop-blur-xl"
                >
                  <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
                    <h3 className="font-bold text-sm tracking-wide">Notifications</h3>
                    <button
                      onClick={() => {
                        setHasUnread(false);
                        setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
                      }}
                      className="text-xs font-semibold text-neon-cyan hover:text-white transition-colors"
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="max-h-[350px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-muted-foreground flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                          <Bell className="w-6 h-6 opacity-40" />
                        </div>
                        <span className="text-sm">You're all caught up!</span>
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
                        className="p-4 border-b border-white/5 hover:bg-white/10 transition-colors cursor-pointer flex gap-4 items-start"
                      >
                        <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 shadow-sm ${n.unread && hasUnread ? "bg-neon-orange shadow-[0_0_8px_rgba(255,100,0,0.8)]" : "bg-white/10"}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white truncate">{n.title}</p>
                          <p className="text-sm text-muted-foreground mt-1 break-words line-clamp-2 leading-relaxed">{n.desc}</p>
                          <p className="text-xs text-muted-foreground/50 mt-2 font-mono">{n.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div
                    onClick={() => {
                      setShowNotifications(false);
                      navigate('/chat');
                    }}
                    className="p-3.5 text-center bg-white/5 hover:bg-white/10 transition-colors cursor-pointer border-t border-white/5"
                  >
                    <span className="text-xs font-bold text-white tracking-wide uppercase">Open Messages</span>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Chat Icon */}
            <Link to="/chat" className="p-2.5 rounded-full hover:bg-white/5 transition-colors text-muted-foreground hover:text-white flex items-center justify-center">
              <MessageCircle className="w-5 h-5" />
            </Link>

            {/* Profile Avatar */}
            <div className="pl-1 pr-1.5">
              <Link to="/profile" className="w-9 h-9 rounded-full bg-gradient-to-tr from-neon-blue to-neon-cyan flex items-center justify-center cursor-pointer hover:shadow-[0_0_15px_rgba(0,255,255,0.4)] transition-all transform hover:scale-105 border border-white/20">
                <User className="w-4.5 h-4.5 text-white drop-shadow-md" />
              </Link>
            </div>
          </div>

          <button
            className="premium-glass-button lg:hidden p-2 text-muted-foreground"
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
