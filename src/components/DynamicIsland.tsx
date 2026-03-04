import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

/* ═══════════════════════════════════════════════
   DYNAMIC ISLAND — CU Bazaar Marketplace
   Collapsed: shows logo "CU BAZZAR" (pill shape)
   Expanded: logo (left) + search bar + 🔍
   Renders INLINE in the navbar (not floating)
   ═══════════════════════════════════════════════ */

const spring = { type: "spring" as const, stiffness: 380, damping: 28 };

export default function DynamicIsland() {
    const [expanded, setExpanded] = useState(false);
    const [query, setQuery] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
    const islandRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    // Focus input when expanding
    useEffect(() => {
        if (expanded) setTimeout(() => inputRef.current?.focus(), 200);
    }, [expanded]);

    // ESC to close
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") { setExpanded(false); setQuery(""); }
        };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, []);

    // Click outside to collapse
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (islandRef.current && !islandRef.current.contains(e.target as Node)) {
                setExpanded(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const handleSearch = () => {
        if (query.trim()) {
            navigate(`/browse?q=${encodeURIComponent(query.trim())}`);
            setExpanded(false);
            setQuery("");
        }
    };

    return (
        <>
            <style>{`
        @keyframes diBreathe {
          0%,100% { box-shadow: 0 0 0 0.5px rgba(255,255,255,0.06), 0 2px 10px rgba(0,0,0,0.5); }
          50% { box-shadow: 0 0 0 0.5px rgba(255,255,255,0.1), 0 2px 14px rgba(0,0,0,0.4), 0 0 18px rgba(255,107,107,0.05); }
        }
      `}</style>

            <motion.div
                ref={islandRef}
                layout
                animate={{
                    width: expanded ? "min(500px, calc(100vw - 110px))" : 150,
                    height: expanded ? 48 : 40,
                }}
                transition={spring}
                onClick={() => { if (!expanded) { setExpanded(true); try { navigator.vibrate?.(10); } catch { } } }}
                className="dynamic-island-el"
                style={{
                    cursor: expanded ? "default" : "pointer",
                    background: "rgba(0, 0, 0, 0.94)",
                    backdropFilter: "blur(40px) saturate(180%)",
                    WebkitBackdropFilter: "blur(40px) saturate(180%)",
                    borderRadius: 50,
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    userSelect: "none",
                    flexShrink: 0,
                    WebkitTapHighlightColor: "transparent",
                    animation: !expanded ? "diBreathe 4s ease-in-out infinite" : "none",
                    boxShadow: expanded
                        ? "0 0 0 0.5px rgba(255,255,255,0.1), 0 4px 24px rgba(0,0,0,0.6), 0 0 50px rgba(255,107,107,0.08)"
                        : "0 0 0 0.5px rgba(255,255,255,0.08), 0 2px 12px rgba(0,0,0,0.5)",
                    border: "0.5px solid rgba(255,255,255,0.06)",
                }}
            >
                <AnimatePresence mode="wait">
                    {!expanded ? (
                        /* ═══ COLLAPSED: Logo only ═══ */
                        <motion.div
                            key="collapsed"
                            initial={{ opacity: 0, scale: 0.85 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.85 }}
                            transition={{ duration: 0.18 }}
                            style={{
                                display: "flex", alignItems: "center", gap: 7,
                                padding: "0 14px", height: "100%",
                            }}
                        >
                            <div style={{
                                width: 24, height: 24, borderRadius: "50%", overflow: "hidden",
                                border: "1.5px solid rgba(255,255,255,0.1)", flexShrink: 0,
                            }}>
                                <img
                                    src="/logo.png" alt="CU"
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                                />
                            </div>
                            <span style={{
                                fontWeight: 700, fontSize: 13, letterSpacing: -0.3,
                                whiteSpace: "nowrap", display: "flex", gap: 4,
                            }}>
                                <span style={{ color: "#FF6B6B" }}>CU</span>
                                <span style={{ color: "#ffffff" }}>BAZZAR</span>
                            </span>
                        </motion.div>
                    ) : (
                        /* ═══ EXPANDED: Logo + Search ═══ */
                        <motion.div
                            key="expanded"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2, delay: 0.08 }}
                            style={{
                                display: "flex", alignItems: "center", gap: 8,
                                padding: "0 6px 0 12px", height: "100%", width: "100%",
                            }}
                        >
                            {/* Logo mini */}
                            <div style={{
                                width: 26, height: 26, borderRadius: "50%", overflow: "hidden",
                                border: "1.5px solid rgba(255,255,255,0.1)", flexShrink: 0,
                            }}>
                                <img
                                    src="/logo.png" alt="CU"
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                                />
                            </div>

                            {/* Search input */}
                            <div style={{
                                flex: 1, display: "flex", alignItems: "center",
                                background: "rgba(255,255,255,0.08)",
                                borderRadius: 24, padding: "0 4px 0 10px", height: 32,
                                border: "1px solid rgba(255,255,255,0.06)",
                                minWidth: 0,
                            }}>
                                <Search style={{ width: 13, height: 13, color: "rgba(255,255,255,0.35)", flexShrink: 0 }} />
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
                                    placeholder="Search products..."
                                    style={{
                                        flex: 1, background: "none", border: "none", outline: "none",
                                        color: "#fff", fontSize: 13, padding: "0 6px",
                                        fontFamily: "inherit", minWidth: 0,
                                    }}
                                />
                                {query && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setQuery(""); inputRef.current?.focus(); }}
                                        style={{
                                            background: "rgba(255,255,255,0.1)", border: "none",
                                            borderRadius: "50%", width: 20, height: 20,
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            cursor: "pointer", flexShrink: 0,
                                        }}
                                    >
                                        <X style={{ width: 11, height: 11, color: "rgba(255,255,255,0.6)" }} />
                                    </button>
                                )}
                            </div>

                            {/* Search button */}
                            <button
                                onClick={(e) => { e.stopPropagation(); handleSearch(); }}
                                style={{
                                    width: 30, height: 30, borderRadius: "50%", border: "none",
                                    background: query.trim() ? "#FF6B6B" : "rgba(255,255,255,0.08)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    cursor: "pointer", flexShrink: 0, transition: "all 0.2s",
                                    boxShadow: query.trim() ? "0 2px 10px rgba(255,107,107,0.3)" : "none",
                                }}
                            >
                                <Search style={{ width: 14, height: 14, color: query.trim() ? "#fff" : "rgba(255,255,255,0.4)" }} />
                            </button>

                            {/* Close button */}
                            <button
                                onClick={(e) => { e.stopPropagation(); setExpanded(false); setQuery(""); }}
                                style={{
                                    width: 28, height: 28, borderRadius: "50%", border: "none",
                                    background: "rgba(255,255,255,0.06)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    cursor: "pointer", flexShrink: 0, transition: "all 0.2s",
                                }}
                            >
                                <X style={{ width: 13, height: 13, color: "rgba(255,255,255,0.5)" }} />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </>
    );
}
