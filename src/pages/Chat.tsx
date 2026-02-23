import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import { Send, Phone, Video, MoreVertical, ArrowLeft, Search, CheckCheck, Smile, MessageCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const avatarGradients = ["from-neon-orange to-neon-pink", "from-neon-cyan to-neon-blue", "from-neon-pink to-neon-blue", "from-neon-orange to-neon-cyan", "from-neon-blue to-neon-pink"];

type Profile = { id: string; username: string | null; full_name: string; avatar_url: string | null; online?: boolean };
type Message = { id: string; sender_id: string; receiver_id: string; content: string; created_at: string };

export default function Chat() {
  const { user } = useAuth();
  const location = useLocation();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeContact, setActiveContact] = useState<Profile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (location.state?.contact) {
      setActiveContact(location.state.contact as Profile);
      // clean up history state if you don't want it to reopen every reload
      window.history.replaceState({}, document.title)
    }
  }, [location.state]);

  useEffect(() => {
    const fetchProfiles = async () => {
      if (!user) return;
      if (!searchQuery.trim()) {
        setProfiles([]);
        return;
      }

      let query = supabase.from("profiles").select("id, username, full_name, avatar_url").neq("id", user.id);
      query = query.ilike("username", `%${searchQuery.trim()}%`);

      const { data, error } = await query.limit(20);

      if (!error && data) {
        setProfiles(data);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchProfiles();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, user]);

  useEffect(() => {
    if (!user || !activeContact) return;

    const fetchHistory = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${activeContact.id}),and(sender_id.eq.${activeContact.id},receiver_id.eq.${user.id})`)
        .order("created_at", { ascending: true });

      if (!error && data) {
        setMessages(data);
      }
    };

    fetchHistory();

    const channel = supabase
      .channel('chat_room')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${user.id}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          if (newMsg.sender_id === activeContact.id) {
            setMessages((prev) => [...prev, newMsg]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, activeContact]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeContact]);

  const sendMessage = async () => {
    if (!input.trim() || !activeContact || !user) return;

    const newMsgContent = input.trim();
    setInput("");

    const tempId = crypto.randomUUID();
    setMessages((prev) => [...prev, {
      id: tempId,
      sender_id: user.id,
      receiver_id: activeContact.id,
      content: newMsgContent,
      created_at: new Date().toISOString()
    }]);

    const { error } = await supabase.from("messages").insert({
      sender_id: user.id,
      receiver_id: activeContact.id,
      content: newMsgContent
    });

    if (error) {
      toast.error("Failed to send message: " + error.message);
      setMessages((prev) => prev.filter(m => m.id !== tempId));
    }
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-background pt-16 flex">
      {/* Sidebar */}
      <div className={`w-full md:w-80 flex-shrink-0 flex flex-col border-r border-white/5 ${activeContact ? "hidden md:flex" : "flex"}`}>
        {/* Header */}
        <div className="p-4 border-b border-white/5">
          <h2 className="font-bold text-lg mb-3">Messages</h2>
          <div className="flex items-center gap-2 glass rounded-xl px-3 py-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by username..."
              className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Contact list */}
        <div className="flex-1 overflow-y-auto">
          {profiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 opacity-60">
              <MessageCircle className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-sm font-medium">{searchQuery ? "No users found" : "No active chats"}</p>
              <p className="text-xs text-muted-foreground mt-1">{searchQuery ? "Try a different search term" : "Search for a user to start chatting!"}</p>
            </div>
          ) : (
            profiles.map((profile, i) => (
              <motion.button
                key={profile.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setActiveContact(profile)}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left ${activeContact?.id === profile.id ? "bg-white/5 border-r-2 border-neon-orange" : ""}`}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt={profile.full_name} className="w-11 h-11 rounded-full object-cover" />
                  ) : (
                    <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${avatarGradients[i % 5]} flex items-center justify-center text-white text-xs font-bold`}>
                      {getInitials(profile.full_name || "User")}
                    </div>
                  )}
                  {profile.online && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-400 border-2 border-background" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col items-start justify-center">
                    <span className="font-semibold text-sm text-foreground">{profile.full_name}</span>
                    <span className="text-xs text-neon-cyan/70 font-mono -mt-0.5">@{profile.username || "unknown"}</span>
                  </div>
                </div>
              </motion.button>
            ))
          )}
        </div>
      </div>

      {/* Chat window */}
      {activeContact ? (
        <div className={`flex-1 flex flex-col ${!activeContact ? "hidden md:flex" : "flex"}`}>
          {/* Chat header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5 glass-heavy">
            <button onClick={() => setActiveContact(null)} className="premium-glass-button md:hidden p-1 text-muted-foreground">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="relative flex-shrink-0">
              {activeContact.avatar_url ? (
                <img src={activeContact.avatar_url} alt={activeContact.full_name} className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatarGradients[Math.abs(activeContact.id.charCodeAt(0)) % 5]} flex items-center justify-center text-white text-xs font-bold`}>
                  {getInitials(activeContact.full_name || "User")}
                </div>
              )}
            </div>
            <div className="flex-1 leading-tight">
              <p className="font-semibold text-sm">{activeContact.full_name}</p>
              <div className="flex items-center gap-2">
                <p className="text-xs text-muted-foreground font-mono">@{activeContact.username || "unknown"}</p>
                <p className="text-xs text-neon-cyan">{activeContact.online ? "● Online" : ""}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="premium-glass-button p-2 rounded-full hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors"><Phone className="w-4 h-4" /></button>
              <button className="premium-glass-button p-2 rounded-full hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors"><Video className="w-4 h-4" /></button>
              <button className="premium-glass-button p-2 rounded-full hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors"><MoreVertical className="w-4 h-4" /></button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            {messages.length === 0 && (
              <div className="text-center mt-10">
                <span className="text-xs text-muted-foreground bg-secondary px-3 py-1 rounded-full">Say hello to {activeContact.full_name}! 👋</span>
              </div>
            )}

            <AnimatePresence>
              {messages.map((msg) => {
                const isSentByMe = msg.sender_id === user?.id;

                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ ease: [0.34, 1.56, 0.64, 1] }}
                    className={`flex ${isSentByMe ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl ${isSentByMe
                      ? "bg-gradient-fire text-white rounded-br-md shadow-neon-fire"
                      : "glass text-foreground rounded-bl-md"
                      }`}>
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                      <div className={`flex items-center justify-end gap-1 mt-1 ${isSentByMe ? "text-white/70" : "text-muted-foreground"}`}>
                        <span className="text-[10px]">{formatTime(msg.created_at)}</span>
                        {isSentByMe && <CheckCheck className="w-3 h-3 text-neon-cyan" />}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-white/5">
            <div className="flex items-center gap-3 glass rounded-2xl px-4 py-2">
              <button className="premium-glass-button text-muted-foreground hover:text-foreground transition-colors">
                <Smile className="w-5 h-5" />
              </button>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Type a message..."
                className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground"
              />
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={sendMessage}
                disabled={!input.trim()}
                className="w-8 h-8 rounded-full bg-gradient-fire flex items-center justify-center text-white disabled:opacity-40 transition-opacity shadow-neon-fire"
              >
                <Send className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center">
          <div className="text-center">
            <div className="text-5xl mb-4">💬</div>
            <h3 className="font-semibold text-lg text-foreground mb-2">Select a conversation</h3>
            <p className="text-muted-foreground text-sm">Choose from your chats to start messaging in real-time</p>
          </div>
        </div>
      )}
    </div>
  );
}
