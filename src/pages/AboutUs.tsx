import { ArrowLeft, Heart, Package, ShieldCheck, Zap, Clock, Star, Bike, BookOpen, Smartphone } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AboutUs() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0d0d0f] text-white pb-20">
      {/* HEADER */}
      <div className="sticky top-0 z-40 bg-[#0d0d0f]/80 backdrop-blur-xl border-b border-white/5 px-4 h-14 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-white/5 transition-all text-white active:scale-95"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-[18px] font-black tracking-tight">About Us</h1>
      </div>

      <div className="px-4 py-8 max-w-lg mx-auto space-y-10">
        
        {/* HERO SECTION — Real Logo */}
        <div className="text-center space-y-3">
          <div className="w-24 h-24 rounded-3xl mx-auto overflow-hidden mb-4 shadow-2xl">
            <img
              src="/cb_logo_final.webp"
              alt="CU Bazzar Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <h2 className="text-[28px] font-black tracking-tighter leading-none">CU Bazzar</h2>
          <p className="text-gray-400 font-medium text-[14px] leading-relaxed max-w-xs mx-auto">
            The exclusive digital marketplace built entirely for the students of Chandigarh University, by the students.
          </p>
        </div>

        {/* WHAT WE OFFER — DETAILED */}
        <div className="space-y-4">
          <h3 className="text-[16px] font-black tracking-tight border-b border-white/10 pb-2 uppercase tracking-widest text-gray-300">
            What We Offer
          </h3>

          <div className="bg-[#1c1c1e] p-5 rounded-3xl border border-white/5 flex gap-4">
            <div className="w-11 h-11 bg-emerald-500/10 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h4 className="text-[15px] font-black mb-1.5 tracking-tight">Lightning Campus Delivery</h4>
              <p className="text-gray-400 text-[13px] leading-relaxed font-medium">
                Get your assignments printed and delivered, food orders from campus canteens, stationery, and late-night essentials rushed directly to your hostel block — typically within 10 to 30 minutes, without needing to step outside.
              </p>
            </div>
          </div>

          <div className="bg-[#1c1c1e] p-5 rounded-3xl border border-white/5 flex gap-4">
            <div className="w-11 h-11 bg-indigo-500/10 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Package className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h4 className="text-[15px] font-black mb-1.5 tracking-tight">Peer-to-Peer Marketplace</h4>
              <p className="text-gray-400 text-[13px] leading-relaxed font-medium">
                Buy or sell textbooks, electronics, stationery, lab coats, sports gear, hostel utilities, and fashion items — all within the verified CU community. No middleman, no suspicious buyers, no cash dealing mishaps.
              </p>
            </div>
          </div>

          <div className="bg-[#1c1c1e] p-5 rounded-3xl border border-white/5 flex gap-4">
            <div className="w-11 h-11 bg-amber-500/10 rounded-2xl flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h4 className="text-[15px] font-black mb-1.5 tracking-tight">Verified Student Community</h4>
              <p className="text-gray-400 text-[13px] leading-relaxed font-medium">
                Every user is a verified CU student. No anonymous outsiders, no catfishing. Trust is at the foundation of everything — real student profiles, real accountability, and admin-monitored listings for your safety.
              </p>
            </div>
          </div>

          <div className="bg-[#1c1c1e] p-5 rounded-3xl border border-white/5 flex gap-4">
            <div className="w-11 h-11 bg-rose-500/10 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Bike className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <h4 className="text-[15px] font-black mb-1.5 tracking-tight">Student Delivery Partner Program</h4>
              <p className="text-gray-400 text-[13px] leading-relaxed font-medium">
                Earn real money while on campus. Join as a delivery partner for 7 days, fulfill orders within your block, and pocket 60% of every delivery charge — a genuine micro-earning opportunity for students.
              </p>
            </div>
          </div>

          <div className="bg-[#1c1c1e] p-5 rounded-3xl border border-white/5 flex gap-4">
            <div className="w-11 h-11 bg-purple-500/10 rounded-2xl flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h4 className="text-[15px] font-black mb-1.5 tracking-tight">Academic Resources Exchange</h4>
              <p className="text-gray-400 text-[13px] leading-relaxed font-medium">
                List or discover study materials, previous year question papers, notes bundles, and practical files — an academic economy built within CU to help every student perform better.
              </p>
            </div>
          </div>

          <div className="bg-[#1c1c1e] p-5 rounded-3xl border border-white/5 flex gap-4">
            <div className="w-11 h-11 bg-cyan-500/10 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Smartphone className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h4 className="text-[15px] font-black mb-1.5 tracking-tight">Native Mobile Experience</h4>
              <p className="text-gray-400 text-[13px] leading-relaxed font-medium">
                A fully optimized Progressive Web App (PWA) installable on your Android or iOS device. Real-time order tracking, push notifications, and a lightning-fast UI engineered specifically for mobile-first campus use.
              </p>
            </div>
          </div>
        </div>

        {/* HOW IT WORKS */}
        <div className="space-y-4">
          <h3 className="text-[16px] font-black tracking-tight border-b border-white/10 pb-2 uppercase tracking-widest text-gray-300">
            How It Works
          </h3>
          <ol className="relative border-l-2 border-white/10 ml-3 space-y-6">
            {[
              {
                step: "1",
                title: "Create Your Profile",
                desc: "Sign up with your university email. Set your hostel block and room number so deliveries reach you precisely.",
              },
              {
                step: "2",
                title: "Browse or List",
                desc: "Explore the marketplace for items you need, or list your own products and waiting orders to start selling.",
              },
              {
                step: "3",
                title: "Place Your Order",
                desc: "Add items to cart, choose delivery or pickup, and confirm via COD or UPI.",
              },
              {
                step: "4",
                title: "Real-Time Tracking",
                desc: "Track your delivery live through the Dynamic Island tracker at the top of the app — from confirmation to door delivery.",
              },
              {
                step: "5",
                title: "Rate & Repeat",
                desc: "Complete your transaction, leave feedback, and enjoy the seamless campus purchasing experience again.",
              },
            ].map(({ step, title, desc }) => (
              <li key={step} className="ml-6">
                <span className="absolute flex items-center justify-center w-7 h-7 bg-[#0d0d0f] rounded-full -left-3.5 ring-4 ring-[#0d0d0f] border border-white/20 text-[11px] font-black text-gray-300">
                  {step}
                </span>
                <h4 className="font-black text-[15px] mb-1 tracking-tight">{title}</h4>
                <p className="text-[13px] text-gray-400 font-medium leading-relaxed">{desc}</p>
              </li>
            ))}
          </ol>
        </div>

        {/* SLOGAN */}
        <div className="text-center border-t border-white/10 pt-10 pb-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-px bg-gradient-to-r from-transparent to-white/20" />
            <Heart className="w-4 h-4 text-red-500 fill-red-500" />
            <div className="w-10 h-px bg-gradient-to-l from-transparent to-white/20" />
          </div>
          <p className="text-[20px] italic text-gray-300 leading-snug font-medium">
            "Made by Virat crafted with heart ❤️<br />for cu's youth."
          </p>
          <p className="text-[13px] font-black text-gray-500 mt-2 tracking-widest uppercase">
            cu bazzar
          </p>
        </div>

      </div>
    </div>
  );
}
