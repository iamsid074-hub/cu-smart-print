import { motion } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Bell, User, Zap, Menu, X, ShoppingCart } from "lucide-react";
import DynamicIsland from "./DynamicIsland";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";

const navLinks = [
  { label: "Home", path: "/home" },
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
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [hasUnread, setHasUnread] = useState(false);
  const { totalItems: cartCount } = useCart();

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
      className="fixed top-0 left-0 right-0 z-50 border-b" style={{ background: 'rgba(51,44,39,0.92)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', borderColor: 'rgba(84,75,67,0.5)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-2 sm:gap-4">
        {/* Dynamic Island — logo + expandable search */}
        <DynamicIsland />

        {/* Nav links - Center Pill Dock */}
        <div className="hidden lg:flex flex-1 justify-center relative z-10">
          <div className="flex items-center gap-1 p-1 rounded-full border shadow-sm" style={{ backgroundColor: 'rgba(42,36,32,0.8)', borderColor: '#544B43' }}>
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
          <div className="flex items-center gap-1 p-1 rounded-full border shadow-sm" style={{ backgroundColor: 'rgba(42,36,32,0.8)', borderColor: '#544B43' }}>



            {/* Cart Icon */}
            <Link to="/cart" className="relative p-2.5 rounded-full hover:bg-foreground/5 transition-colors text-muted-foreground hover:text-foreground flex items-center justify-center">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-[#FF6B6B] text-white text-[10px] font-black flex items-center justify-center px-1 shadow-[0_0_8px_rgba(255,107,107,0.6)] border-2 border-[#3F3832]">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
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
          className="lg:hidden border-t px-4 py-4 flex flex-col gap-2" style={{ backgroundColor: '#3F3832', borderColor: '#544B43' }}
        >
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
