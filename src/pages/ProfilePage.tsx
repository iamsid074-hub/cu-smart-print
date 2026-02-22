import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Save, MapPin, Phone, User, ShieldCheck, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/supabase';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];

export default function ProfilePage() {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [profile, setProfile] = useState<Partial<ProfileRow>>({});

    useEffect(() => {
        async function fetchProfile() {
            if (!user) return;

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (!error && data) {
                setProfile(data);
            } else {
                // Fallback for new users who haven't set up full profiles yet
                setProfile({
                    full_name: user?.user_metadata?.full_name || 'Anonymous Student',
                    hostel_block: '',
                    phone_number: '',
                });
            }
            setLoading(false);
        }

        fetchProfile();
    }, [user]);

    const handleSave = async () => {
        setSaving(true);
        if (!user) return;

        const { error } = await supabase
            .from('profiles')
            .upsert({
                id: user.id,
                full_name: profile.full_name,
                hostel_block: profile.hostel_block,
                phone_number: profile.phone_number,
            });

        setSaving(false);

        if (error) {
            alert('Error saving profile: ' + error.message);
        } else {
            setIsEditing(false);
        }
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" size={48} /></div>;
    }

    return (
        <div className="min-h-screen pt-24 pb-12 px-6 max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar / Avatar Area */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex-shrink-0 w-full md:w-1/3 flex flex-col items-center glass-card p-6"
                >
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-accent p-1 mb-4">
                        <img
                            src={`https://api.dicebear.com/7.x/notionists/svg?seed=${profile.full_name}`}
                            alt="Avatar"
                            className="w-full h-full object-cover rounded-full bg-white"
                        />
                    </div>
                    <h2 className="text-2xl font-black text-center">{profile.full_name}</h2>
                    <p className="text-sm text-foreground/50">{user?.email}</p>
                    <div className="flex items-center gap-1 text-green-500 font-medium text-sm mt-3">
                        <ShieldCheck size={16} /> Verified Student
                    </div>
                </motion.div>

                {/* Main Details Area */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex-grow glass-card p-8"
                >
                    <div className="flex justify-between items-center mb-8 border-b border-border pb-4">
                        <h1 className="text-3xl font-bold tracking-tight">Account Details</h1>
                        <button
                            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                            disabled={saving}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-foreground/5 hover:bg-foreground/10 font-bold transition-colors disabled:opacity-50"
                        >
                            {saving ? <Loader2 className="animate-spin" size={18} /> : (isEditing ? <><Save size={18} /> Save</> : <><Settings size={18} /> Edit</>)}
                        </button>
                    </div>

                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <label className="text-sm font-bold text-foreground/60 flex items-center gap-2">
                                    <User size={16} /> Full Name
                                </label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={profile.full_name || ''}
                                        onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                                        className="w-full bg-background/50 border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                                    />
                                ) : (
                                    <div className="px-4 py-2 font-medium text-lg">{profile.full_name || 'Not set'}</div>
                                )}
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-bold text-foreground/60 flex items-center gap-2">
                                    <MapPin size={16} /> Delivery Location
                                </label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={profile.hostel_block || ''}
                                        onChange={(e) => setProfile({ ...profile, hostel_block: e.target.value })}
                                        placeholder="e.g. Block B, Room 402"
                                        className="w-full bg-background/50 border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                                    />
                                ) : (
                                    <div className="px-4 py-2 font-medium text-lg">{profile.hostel_block || 'Not set'}</div>
                                )}
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-bold text-foreground/60 flex items-center gap-2">
                                    <Phone size={16} /> Phone Number (Private)
                                </label>
                                {isEditing ? (
                                    <input
                                        type="tel"
                                        value={profile.phone_number || ''}
                                        onChange={(e) => setProfile({ ...profile, phone_number: e.target.value })}
                                        placeholder="+91..."
                                        className="w-full bg-background/50 border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                                    />
                                ) : (
                                    <div className="px-4 py-2 font-medium text-lg">{profile.phone_number || 'Not set'}</div>
                                )}
                            </div>
                        </div>

                        <div className="mt-8 p-4 bg-primary/5 rounded-xl border border-primary/20">
                            <p className="text-sm text-foreground/60 leading-relaxed">
                                <strong>Privacy Note:</strong> Your phone number is strictly private and is never shared with buyers. All communication must occur through our secure in-app messaging platform.
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
