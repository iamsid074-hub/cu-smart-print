import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Grid as GridIcon, X } from "lucide-react";

interface AppDef {
  name: string;
  img?: string;
  icon?: React.ElementType;
  iconBg?: string;
  iconColor?: string;
  path: string;
}

interface MobileAppLibraryProps {
  onTap: (path: string) => void;
  apps: AppDef[];
}

export default function MobileAppLibrary({ onTap, apps }: MobileAppLibraryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFolder, setActiveFolder] = useState<{ title: string; apps: AppDef[] } | null>(null);

  const folderTitles = ["Productivity", "Social", "Shopping", "Entertainment", "Utilities", "Other"];

  // Dynamically categorize apps into folders based on their names
  const categorizedFolders = useMemo(() => {
    const folders: Record<number, AppDef[]> = {
      0: [], // Productivity
      1: [], // Social
      2: [], // Shopping
      3: [], // Entertainment
      4: [], // Utilities
      5: []  // Other
    };

    apps.forEach(app => {
      const name = app.name.toLowerCase();
      if (name === "wallet" || name === "home") {
        folders[0].push(app);
      } else if (name === "profile") {
        folders[1].push(app);
      } else if (name === "shops" || name === "grocery" || name === "cart" || name === "combos") {
        folders[2].push(app);
      } else if (name === "games") {
        folders[3].push(app);
      } else if (name === "lock" || name === "wallpaper" || name === "settings" || name === "admin") {
        folders[4].push(app);
      } else {
        folders[5].push(app);
      }
    });

    return folders;
  }, [apps]);

  return (
    <div className="w-full h-full flex flex-col px-6">
      {/* Search Bar */}
      <div className="mt-16 mb-6">
        <div 
          className="backdrop-blur-2xl rounded-2xl h-12 flex items-center px-4 gap-3" 
          style={{ 
            backgroundColor: "rgba(255, 255, 255, 0.65)",
            border: "1.5px solid rgba(255, 255, 255, 0.45)",
            boxShadow: "0 10px 24px rgba(15, 23, 42, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.6)"
          }}
        >
          <Search className="w-5 h-5 text-slate-800 flex-shrink-0" />
          <input 
            type="text"
            value={searchQuery}
            placeholder="App Library"
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-slate-950 text-[15px] w-full placeholder-slate-600 font-extrabold"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="p-1 hover:bg-slate-950/10 rounded-full">
              <X className="w-4 h-4 text-slate-800" />
            </button>
          )}
        </div>
      </div>

      {searchQuery ? (
        /* Real-time Search Results View */
        <div 
          className="flex-grow overflow-y-auto pb-20 scrollbar-hide pt-2"
          style={{
            maskImage: "linear-gradient(to bottom, transparent 0%, black 24px, black calc(100% - 24px), transparent 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 24px, black calc(100% - 24px), transparent 100%)"
          }}
        >
          <div className="flex flex-col gap-3">
            {apps
              .filter(app => app.name.toLowerCase().includes(searchQuery.toLowerCase()))
              .map(app => (
                <div 
                  key={app.name}
                  onClick={() => onTap(app.path)}
                  className="flex items-center gap-4 bg-slate-800/10 hover:bg-slate-800/15 p-3 rounded-2xl border border-slate-800/10 transition-colors cursor-pointer active:scale-[0.98]"
                >
                  <div className="w-12 h-12 rounded-[12px] overflow-hidden flex-shrink-0 relative">
                    {app.img ? (
                      <img src={app.img} alt={app.name} className={`w-full h-full object-cover ${app.name === "Grocery" ? "scale-125" : "scale-[1.18]"}`} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center" style={{ background: app.iconBg || "#333" }}>
                        {app.icon && <app.icon className="w-5 h-5 text-white" />}
                      </div>
                    )}
                  </div>
                  <span className="text-slate-800 font-extrabold text-[14px] drop-shadow-sm">{app.name}</span>
                </div>
              ))}
            {apps.filter(app => app.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
              <div className="text-center text-slate-700/60 font-bold py-10">No apps found for "{searchQuery}"</div>
            )}
          </div>
        </div>
      ) : (
        /* Folders Grid View */
        <div 
          className="grid grid-cols-2 gap-4 pb-20 overflow-y-auto scrollbar-hide pt-2"
          style={{
            maskImage: "linear-gradient(to bottom, transparent 0%, black 24px, black calc(100% - 24px), transparent 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 24px, black calc(100% - 24px), transparent 100%)"
          }}
        >
          {folderTitles.map((title, idx) => {
            const folderApps = categorizedFolders[idx] || [];
            return (
              <div key={idx} className="flex flex-col gap-2">
                <div 
                  className="backdrop-blur-2xl rounded-[32px] p-3 grid grid-cols-2 grid-rows-2 gap-2 aspect-square relative"
                  style={{ 
                    background: "rgba(255, 255, 255, 0.62)",
                    border: "1.5px solid rgba(255, 255, 255, 0.45)",
                    boxShadow: "0 14px 28px rgba(15, 23, 42, 0.15), 0 4px 10px rgba(0, 0, 0, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.6)"
                  }}
                >
                  {/* Empty state placeholder */}
                  {folderApps.length === 0 ? (
                    <div className="col-span-2 row-span-2 flex items-center justify-center text-slate-500/50">
                      <GridIcon className="w-8 h-8" />
                    </div>
                  ) : folderApps.length <= 4 ? (
                    // Render up to 4 large icons directly
                    <>
                      {folderApps.map(app => (
                        <button
                          key={app.name}
                          onClick={() => onTap(app.path)}
                          className="w-full h-full rounded-2xl overflow-hidden active:scale-95 transition-transform shadow-md relative"
                        >
                          {app.img ? (
                            <img src={app.img} alt={app.name} className={`w-full h-full object-cover ${app.name === "Grocery" ? "scale-125" : "scale-[1.18]"}`} />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center" style={{ background: app.iconBg || "#333" }}>
                              {app.icon && <app.icon className="w-6 h-6" style={{ color: app.iconColor || "#fff" }} />}
                            </div>
                          )}
                        </button>
                      ))}
                      {/* Empty placeholders to preserve grid structure if less than 4 */}
                      {Array.from({ length: 4 - folderApps.length }).map((_, i) => (
                        <div key={i} className="w-full h-full rounded-2xl bg-slate-950/8 border border-slate-950/5" />
                      ))}
                    </>
                  ) : (
                    // More than 4 apps: render 3 large and 1 mini-grid of the rest
                    <>
                      {folderApps.slice(0, 3).map(app => (
                        <button
                          key={app.name}
                          onClick={() => onTap(app.path)}
                          className="w-full h-full rounded-2xl overflow-hidden active:scale-95 transition-transform shadow-md"
                        >
                          {app.img ? (
                            <img src={app.img} alt={app.name} className={`w-full h-full object-cover ${app.name === "Grocery" ? "scale-125" : "scale-[1.18]"}`} />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center" style={{ background: app.iconBg || "#333" }}>
                              {app.icon && <app.icon className="w-6 h-6" style={{ color: app.iconColor || "#fff" }} />}
                            </div>
                          )}
                        </button>
                      ))}
                      {/* 4th quadrant is a mini 2x2 grid */}
                      <div 
                        className="w-full h-full rounded-2xl bg-slate-950/8 border border-slate-950/5 p-1.5 grid grid-cols-2 gap-1 cursor-pointer active:scale-95 transition-transform"
                        onClick={() => setActiveFolder({ title, apps: folderApps })}
                      >
                        {folderApps.slice(3, 7).map(app => (
                          <div key={app.name} className="w-full h-full rounded-lg overflow-hidden">
                            {app.img ? (
                              <img src={app.img} alt={app.name} className={`w-full h-full object-cover animate-fade-in ${app.name === "Grocery" ? "scale-125" : "scale-[1.18]"}`} />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center" style={{ background: app.iconBg || "#475569" }}>
                                {app.icon && <app.icon className="w-3.5 h-3.5 text-white" />}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
                <span 
                  className="text-slate-950 text-[11px] font-black text-center tracking-wider uppercase px-2 truncate drop-shadow-md"
                  style={{
                    textShadow: "0 1px 4px rgba(255, 255, 255, 0.95), 0 0 1px rgba(255, 255, 255, 0.8)"
                  }}
                >
                  {title}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Expanded Folder Modal Overlay */}
      <AnimatePresence>
        {activeFolder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60000] bg-black/55 backdrop-blur-2xl flex items-center justify-center p-6"
            onClick={() => setActiveFolder(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 230 }}
              className="w-full max-w-[340px] rounded-[36px] p-6 flex flex-col items-center"
              style={{
                background: "rgba(15, 23, 42, 0.65)",
                backdropFilter: "blur(25px)",
                WebkitBackdropFilter: "blur(25px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                boxShadow: "0 24px 48px rgba(0,0,0,0.3)"
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Title */}
              <h3 className="text-white text-2xl font-black mb-6 self-start px-2 tracking-tight drop-shadow-md">
                {activeFolder.title}
              </h3>

              {/* Grid inside */}
              <div className="grid grid-cols-3 gap-x-6 gap-y-7 justify-items-center w-full pb-2">
                {activeFolder.apps.map(app => (
                  <button
                    key={app.name}
                    onClick={() => {
                      setActiveFolder(null);
                      onTap(app.path);
                    }}
                    className="flex flex-col items-center gap-2 group cursor-pointer"
                  >
                    <div className="w-16 h-16 rounded-[14px] overflow-hidden shadow-lg border border-white/10 active:scale-95 transition-transform duration-150 relative">
                      {app.img ? (
                        <img src={app.img} alt={app.name} className={`w-full h-full object-cover ${app.name === "Grocery" ? "scale-125" : "scale-[1.18]"}`} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center" style={{ background: app.iconBg || "#333" }}>
                          {app.icon && <app.icon className="w-7 h-7" style={{ color: app.iconColor || "#fff" }} />}
                        </div>
                      )}
                      {/* Gloss sheen */}
                      <div
                        className="absolute inset-x-0 top-0 pointer-events-none"
                        style={{
                          height: "45%",
                          borderRadius: "22% 22% 0 0",
                          background: "linear-gradient(to bottom, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.02) 100%)",
                        }}
                      />
                    </div>
                    <span className="text-white/80 text-[11px] font-semibold text-center truncate w-full px-1 drop-shadow-sm">{app.name}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
