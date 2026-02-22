import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { LogOut, User, MapPin, Phone, Package, Heart, Edit2, Check, Loader2, Camera } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function Profile() {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();

    const [profile, setProfile] = useState<any>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);

    // Editable fields
    const [fullName, setFullName] = useState("");
    const [hostelBlock, setHostelBlock] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        async function fetchProfile() {
            if (!user) return;
            const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
            if (data) {
                setProfile(data);
                setFullName(data.full_name || "");
                setHostelBlock(data.hostel_block || "");
                setPhoneNumber(data.phone_number || "");
            }
        }
        fetchProfile();
    }, [user]);

    const handleSaveProfile = async () => {
        if (!user) return;
        setLoading(true);

        try {
            const formattedUsername = profile.username?.toLowerCase().trim();
            if (formattedUsername && !/^[a-zA-Z0-9_]{3,20}$/.test(formattedUsername)) {
                throw new Error("Username must be 3-20 characters long and contain no spaces.");
            }

            const payload: any = {
                id: user.id,
                full_name: fullName || user.email?.split('@')[0] || "Student User",
                hostel_block: hostelBlock,
                phone_number: phoneNumber,
            };

            if (formattedUsername) {
                payload.username = formattedUsername;
            }

            const { data, error } = await supabase
                .from("profiles")
                .upsert(payload, { onConflict: 'id' })
                .select();

            if (error) {
                if (error.code === '23505') throw new Error("That username is already taken!");
                throw error;
            }

            if (!data || data.length === 0) {
                throw new Error("Update failed. Data was not persisted.");
            }

            setProfile(data[0]);
            toast.success("Profile updated successfully!");
            setIsEditing(false);
        } catch (err: any) {
            toast.error(err.message || "Failed to update profile.");
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setLoading(true);
            if (!event.target.files || event.target.files.length === 0) return;

            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const filePath = `${user?.id}-${Math.random()}.${fileExt}`;

            // Upload to Supabase Storage - assuming a public bucket named 'avatars' exists. 
            // If it fails, ensure the bucket is created in Supabase Dashboard.
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) {
                // Graceful fallback if "avatars" bucket doesn't exist yet, we can try "product-images" temporarily
                const { error: fallbackError } = await supabase.storage
                    .from('product-images')
                    .upload(filePath, file);

                if (fallbackError) throw fallbackError;

                const { data } = supabase.storage.from('product-images').getPublicUrl(filePath);
                await updateAvatarUrl(data.publicUrl);
                return;
            }

            const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
            await updateAvatarUrl(data.publicUrl);

        } catch (error: any) {
            toast.error("Error uploading avatar: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const updateAvatarUrl = async (url: string) => {
        if (!user) return;
        const { error } = await supabase.from('profiles').update({ avatar_url: url }).eq('id', user.id);
        if (error) throw error;
        setProfile({ ...profile, avatar_url: url });
        toast.success("Avatar updated!");
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-background pt-24 pb-16 px-4">
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">

                {/* Left Col - Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="col-span-1 glass-heavy rounded-3xl p-6 border border-white/5 flex flex-col items-center text-center shadow-xl h-fit relative group"
                >
                    {/* Edit Toggle */}
                    <button
                        onClick={() => {
                            if (isEditing) handleSaveProfile();
                            else setIsEditing(true);
                        }}
                        disabled={loading}
                        className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/5 text-muted-foreground hover:text-white transition-colors"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : isEditing ? <Check className="w-5 h-5 text-neon-green" /> : <Edit2 className="w-5 h-5" />}
                    </button>

                    <div className="relative group/avatar cursor-pointer" onClick={() => isEditing && fileInputRef.current?.click()}>
                        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-neon-pink to-neon-orange p-1 mb-4 shadow-neon-pink transition-transform group-hover/avatar:scale-105">
                            <div className="w-full h-full rounded-full bg-background flex flex-col items-center justify-center overflow-hidden">
                                {profile?.avatar_url ? (
                                    <img src={profile?.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-10 h-10 text-muted-foreground" />
                                )}
                            </div>
                        </div>
                        {isEditing && (
                            <div className="absolute inset-0 top-0 left-0 w-24 h-24 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity mx-auto">
                                <Camera className="w-6 h-6 text-white" />
                            </div>
                        )}
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                    </div>

                    {isEditing ? (
                        <div className="flex flex-col items-center w-full mb-1">
                            <input
                                className="bg-black/20 border-b border-white/20 outline-none text-center text-foreground font-bold text-2xl py-1 rounded w-full focus:border-neon-cyan transition-colors"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Your Name"
                            />
                        </div>
                    ) : (
                        <h2 className="text-2xl font-bold mb-1">{profile?.full_name || "Student User"}</h2>
                    )}

                    {isEditing ? (
                        <div className="flex flex-col items-center mt-1 mb-6">
                            <span className="text-muted-foreground font-mono text-sm mb-1">@</span>
                            <input
                                className="bg-black/20 border-b border-white/20 outline-none text-center text-foreground font-mono py-1 rounded w-3/4 focus:border-neon-cyan transition-colors text-sm"
                                value={profile?.username || ""}
                                onChange={(e) => setProfile({ ...profile, username: e.target.value.toLowerCase().trim() })}
                                placeholder="new_username"
                                maxLength={20}
                            />
                            <span className="text-xs text-muted-foreground mt-2">{user.email}</span>
                        </div>
                    ) : (
                        <>
                            <p className="text-sm text-neon-cyan font-mono mb-1">@{profile?.username || "student"}</p>
                            <p className="text-xs text-muted-foreground mb-6">{user.email}</p>
                        </>
                    )}

                    <div className="w-full space-y-3 mb-8 text-sm text-left">
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                            <MapPin className="w-4 h-4 text-neon-cyan font-bold flex-shrink-0" />
                            {isEditing ? (
                                <input
                                    className="bg-transparent border-b border-white/20 outline-none w-full text-foreground placeholder:text-muted-foreground/50 py-1"
                                    value={hostelBlock}
                                    onChange={(e) => setHostelBlock(e.target.value)}
                                    placeholder="e.g. Block A, Room 102"
                                />
                            ) : (
                                <span className={profile?.hostel_block ? "text-foreground" : "text-muted-foreground italic"}>
                                    {profile?.hostel_block || "No hostel added"}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                            <Phone className="w-4 h-4 text-neon-green flex-shrink-0" />
                            {isEditing ? (
                                <input
                                    className="bg-transparent border-b border-white/20 outline-none w-full text-foreground placeholder:text-muted-foreground/50 py-1"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    placeholder="e.g. +91 9876543210"
                                />
                            ) : (
                                <span className={profile?.phone_number ? "text-foreground" : "text-muted-foreground italic"}>
                                    {profile?.phone_number || "No phone number added"}
                                </span>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={async () => {
                            await signOut();
                            navigate("/login");
                        }}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-red-500/30 text-red-500 hover:bg-red-500/10 transition-colors font-medium relative group overflow-hidden"
                    >
                        <span className="absolute inset-0 bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                </motion.div>

                {/* Right Col - Activity */}
                <div className="col-span-1 md:col-span-2 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="glass rounded-3xl p-6 sm:p-8"
                    >
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Package className="w-5 h-5 text-neon-blue" /> My Active Listings
                        </h3>
                        <div className="text-center py-12 text-muted-foreground border-2 border-dashed border-white/10 rounded-2xl">
                            You haven't listed any items yet.
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="glass rounded-3xl p-6 sm:p-8"
                    >
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Heart className="w-5 h-5 text-neon-pink" /> Saved Items
                        </h3>
                        <div className="text-center py-12 text-muted-foreground border-2 border-dashed border-white/10 rounded-2xl">
                            No saved items.
                        </div>
                    </motion.div>
                </div>

            </div>
        </div>
    );
}
