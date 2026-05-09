import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Grid as GridIcon, Plus, X } from "lucide-react";

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
  // Local state for folder contents (persisted in memory for now)
  const [folderContents, setFolderContents] = useState<Record<number, AppDef[]>>({
    0: [], 1: [], 2: [], 3: [], 4: [], 5: []
  });
  
  const [isPicking, setIsPicking] = useState<number | null>(null);

  const folderTitles = ["Productivity", "Social", "Shopping", "Entertainment", "Utilities", "Other"];

  const addAppToFolder = (app: AppDef) => {
    if (isPicking === null) return;
    
    // Don't add same app twice to same folder
    if (folderContents[isPicking].find(a => a.name === app.name)) {
      setIsPicking(null);
      return;
    }

    setFolderContents(prev => ({
      ...prev,
      [isPicking]: [...prev[isPicking], app]
    }));
    setIsPicking(null);
  };

  const removeAppFromFolder = (folderIdx: number, appName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFolderContents(prev => ({
      ...prev,
      [folderIdx]: prev[folderIdx].filter(a => a.name !== appName)
    }));
  };

  return (
    <div className="w-full h-full flex flex-col px-6">
      {/* Search Bar */}
      <div className="mt-16 mb-8">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl h-12 flex items-center px-4 gap-3 border border-white/10 shadow-lg">
          <Search className="w-5 h-5 text-white/40" />
          <span className="text-white/40 font-medium">App Library</span>
        </div>
      </div>

      {/* Folders Grid */}
      <div className="grid grid-cols-2 gap-4 pb-20">
        {folderTitles.map((title, idx) => (
          <div key={idx} className="flex flex-col gap-2">
            <div 
              className="bg-white/10 backdrop-blur-2xl rounded-[32px] p-3 grid grid-cols-2 gap-2 aspect-square border border-white/5 shadow-xl relative"
              style={{ background: "rgba(255,255,255,0.08)" }}
            >
              {/* Folder Content (Up to 3 large) */}
              {folderContents[idx].slice(0, 3).map((app) => (
                <div key={app.name} className="relative group">
                   <button
                    onClick={() => onTap(app.path)}
                    className="w-full h-full rounded-2xl overflow-hidden active:scale-90 transition-transform shadow-sm"
                  >
                    {app.img ? (
                      <img src={app.img} alt={app.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center" style={{ background: app.iconBg || "#333" }}>
                        {app.icon && <app.icon className="w-6 h-6" style={{ color: app.iconColor || "#fff" }} />}
                      </div>
                    )}
                  </button>
                  {/* Remove btn */}
                  <button 
                    onClick={(e) => removeAppFromFolder(idx, app.name, e)}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center border border-white/20"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ))}
              
              {/* Mini grid or Add button */}
              <div className="w-full h-full flex items-center justify-center">
                 {folderContents[idx].length > 3 ? (
                    <div className="grid grid-cols-2 gap-1 p-0.5 w-full h-full">
                       {folderContents[idx].slice(3, 7).map(app => (
                         <div key={app.name} className="relative">
                            <button
                              onClick={() => onTap(app.path)}
                              className="w-full h-full rounded-lg overflow-hidden"
                            >
                               {app.img ? (
                                <img src={app.img} alt={app.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center scale-75" style={{ background: app.iconBg || "#333" }}>
                                  {app.icon && <app.icon className="w-4 h-4" style={{ color: app.iconColor || "#fff" }} />}
                                </div>
                              )}
                            </button>
                         </div>
                       ))}
                    </div>
                 ) : (
                   <button 
                    onClick={() => setIsPicking(idx)}
                    className="w-full h-full rounded-2xl bg-white/5 border border-dashed border-white/20 flex items-center justify-center active:bg-white/10 transition-colors"
                   >
                     <Plus className="w-6 h-6 text-white/40" />
                   </button>
                 )}
              </div>
            </div>
            <span className="text-white/60 text-[11px] font-bold text-center tracking-tight uppercase px-2 truncate">
              {title}
            </span>
          </div>
        ))}
      </div>

      {/* App Picker Overlay */}
      <AnimatePresence>
        {isPicking !== null && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-0 z-[60000] bg-black/60 backdrop-blur-md flex flex-col p-8 rounded-t-[40px] mt-20"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white text-xl font-bold">Add to {folderTitles[isPicking]}</h3>
              <button onClick={() => setIsPicking(null)} className="p-2 bg-white/10 rounded-full">
                <X className="text-white w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-6 overflow-y-auto pb-10">
              {apps.map(app => (
                <button
                  key={app.name}
                  onClick={() => addAppToFolder(app)}
                  className="flex flex-col items-center gap-2"
                >
                   <div className="w-16 h-16 rounded-[14px] overflow-hidden shadow-lg border border-white/10">
                      {app.img ? (
                        <img src={app.img} alt={app.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center" style={{ background: app.iconBg || "#333" }}>
                          {app.icon && <app.icon className="w-7 h-7" style={{ color: app.iconColor || "#fff" }} />}
                        </div>
                      )}
                   </div>
                   <span className="text-white/80 text-[10px] font-medium text-center truncate w-full px-1">{app.name}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
