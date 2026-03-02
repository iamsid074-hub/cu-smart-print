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
  { label: "Food", path: "/food" },
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
      className="fixed top-0 left-0 right-0 z-50 border-b" style={{ background: 'rgba(201,187,176,0.85)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderColor: '#A89885' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-2 sm:gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0 group">
          <div className="relative w-10 h-10 rounded-full overflow-hidden border flex items-center justify-center p-0.5 transition-colors shadow-sm" style={{ backgroundColor: '#D9CFC1', borderColor: '#A89885' }}>
            <img src="/logo.png" alt="CU BAZZAR Logo" className="w-full h-full object-cover object-center rounded-full" />
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
          <div className="flex items-center gap-1 p-1 rounded-full border shadow-sm" style={{ backgroundColor: '#D9CFC1', borderColor: '#A89885' }}>
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 relative overflow-hidden ${location.pathname === link.path
                  ? "text-white shadow-md"
                  : "text-foreground/60 hover:text-foreground"
                  }`}
              >
                {/* Active Gradient Pill */}
                {location.pathname === link.path && (
                  <motion.div
                    layoutId="active-nav-pill"
                    className="absolute inset-0 rounded-full -z-10" style={{ background: '#FF6B6B', boxShadow: '0 2px 10px rgba(255,107,107,0.3)' }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Actions - Right Side */}
        <div className="flex items-center gap-2 ml-auto z-10 flex-shrink-0">
          <div className="flex items-center gap-1 p-1 rounded-full border shadow-sm" style={{ backgroundColor: '#D9CFC1', borderColor: '#A89885' }}>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={handleNotificationClick}
                className={`relative p-2.5 rounded-full hover-bell-ring transition-colors flex items-center justify-center ${showNotifications ? 'bg-foreground/10 text-foreground' : 'hover:bg-foreground/5 text-muted-foreground hover:text-foreground'
                  }`}
              >
                <Bell className="w-5 h-5" />
                {hasUnread && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-[#FF6B6B] shadow-[0_0_8px_rgba(255,107,107,0.6)] border-2 border-[#D9CFC1]"></span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="absolute top-[calc(100%+12px)] right-[-60px] sm:right-0 w-[min(380px,calc(100vw-32px))] border rounded-2xl shadow-xl overflow-hidden z-50 origin-top-right" style={{ backgroundColor: '#D9CFC1', borderColor: '#A89885' }}
                >
                  <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: '#A89885', backgroundColor: 'rgba(184,168,150,0.3)' }}>
                    <h3 className="font-bold text-sm tracking-wide">Notifications</h3>
                    <button
                      onClick={() => {
                        setHasUnread(false);
                        setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
                      }}
                      className="text-xs font-semibold text-[#FF6B6B] hover:text-[#e55a5a] transition-colors"
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="max-h-[350px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-muted-foreground flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(184,168,150,0.3)' }}>
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
                        className="p-4 border-b hover:bg-foreground/5 transition-colors cursor-pointer flex gap-4 items-start" style={{ borderColor: '#A89885' }}
                      >
                        <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 shadow-sm ${n.unread && hasUnread ? "bg-[#FF6B6B] shadow-[0_0_6px_rgba(255,107,107,0.5)]" : "bg-foreground/10"}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">{n.title}</p>
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
                    className="p-3.5 text-center hover:bg-foreground/5 transition-colors cursor-pointer border-t" style={{ borderColor: '#A89885' }}
                  >
                    <span className="text-xs font-bold text-foreground tracking-wide uppercase">Open Messages</span>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Chat Icon */}
            <Link to="/chat" className="p-2.5 rounded-full hover:bg-foreground/5 transition-colors text-muted-foreground hover:text-foreground flex items-center justify-center">
              <MessageCircle className="w-5 h-5" />
            </Link>

            {/* Profile Avatar */}
            <div className="pl-1 pr-1.5">
              <Link to="/profile" className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer transition-all transform hover:scale-105 border" style={{ background: '#FF6B6B', borderColor: '#e55a5a' }}>
                <User className="w-4.5 h-4.5 text-white" />
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
          className="lg:hidden border-t px-4 py-4 flex flex-col gap-2" style={{ backgroundColor: '#D9CFC1', borderColor: '#A89885' }}
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
                ? "text-white"
                : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                }`}
              style={location.pathname === link.path ? { background: '#FF6B6B' } : undefined}
            >
              {link.label}
            </Link>
          ))}
        </motion.div>
      )
      }
    </motion.nav >
  );
}
