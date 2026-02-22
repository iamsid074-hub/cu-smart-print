import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, ShieldAlert, CheckCheck } from 'lucide-react';

export default function MessagesPage() {
    const [messages, setMessages] = useState([
        { id: 1, text: "Hey! Is the textbook still available?", sender: "me", time: "10:30 AM" },
        { id: 2, text: "Yes it is! The condition is very good, no highlights inside.", sender: "seller", time: "10:32 AM" },
        { id: 3, text: "Awesome. Could you negotiate on the price a bit?", sender: "me", time: "10:33 AM" },
    ]);
    const [input, setInput] = useState('');

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;
        setMessages([...messages, { id: Date.now(), text: input, sender: 'me', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
        setInput('');
    };

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 max-w-4xl mx-auto flex flex-col h-screen">
            <div className="glass-card flex-grow flex flex-col overflow-hidden relative border border-border/50">
                {/* Header */}
                <div className="p-4 border-b border-border bg-background/50 backdrop-blur-md flex justify-between items-center z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-tr from-accent to-secondary rounded-full flex items-center justify-center text-white font-bold shadow-md">
                            RK
                        </div>
                        <div>
                            <h3 className="font-bold">Rahul K. (Seller)</h3>
                            <p className="text-xs text-green-500 font-medium">Online • Calculus Book</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-accent bg-accent/10 px-3 py-1.5 rounded-full">
                        <ShieldAlert size={14} /> Number Hidden
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    <div className="text-center text-xs text-foreground/40 font-bold my-4">Today</div>

                    {messages.map((msg) => (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            key={msg.id}
                            className={`flex flex-col ${msg.sender === 'me' ? 'items-end' : 'items-start'}`}
                        >
                            <div className={`max-w-[75%] p-3 rounded-2xl ${msg.sender === 'me'
                                    ? 'bg-gradient-to-bl from-primary to-accent text-white rounded-tr-sm shadow-md'
                                    : 'bg-background border border-border rounded-tl-sm shadow-sm'
                                }`}>
                                {msg.text}
                            </div>
                            <div className="text-[10px] text-foreground/40 mt-1 flex items-center gap-1">
                                {msg.time} {msg.sender === 'me' && <CheckCheck size={12} className="text-primary" />}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-border bg-background/50 backdrop-blur-md">
                    <form onSubmit={handleSend} className="flex items-center gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type your message securely..."
                            className="flex-1 bg-background border border-border rounded-full px-6 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                        />
                        <button
                            type="submit"
                            className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center shadow-lg hover:scale-105 hover:bg-primary-hover transition-all"
                        >
                            <Send size={18} className="translate-x-[-1px]" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
