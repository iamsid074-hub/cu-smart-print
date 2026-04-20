import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0d0d0f] text-white pb-20">
      {/* HEADER - Adjusted for Dynamic Island clearance */}
      <div className="sticky top-0 z-40 bg-[#0d0d0f]/80 backdrop-blur-xl border-b border-white/5 px-4 pt-16 pb-4 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-white/5 transition-all text-white active:scale-95"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-[20px] font-black tracking-tight">Privacy Policy</h1>
      </div>

      <div className="px-5 py-8 max-w-2xl mx-auto space-y-8">
        
        <div className="space-y-3">
          <h2 className="text-[18px] font-black tracking-tight">Information We Collect</h2>
          <p className="text-gray-400 text-[14px] leading-relaxed font-medium">When you register or use CU Bazzar, we collect specific logistical data. This includes your name, contact information (email/phone number), and your institutional delivery parameters (Hostel block, Room number) to securely facilitate internal deliveries.</p>
        </div>

        <div className="space-y-3">
          <h2 className="text-[18px] font-black tracking-tight">How We Use Your Information</h2>
          <p className="text-gray-400 text-[14px] leading-relaxed font-medium">Your information is actively used to bridge buyers with sellers, process and verify transactions securely, and ensure accurate delivery targeting across the university campus. We also use aggregated non-personal data to monitor app health and stability.</p>
        </div>

        <div className="space-y-3">
          <h2 className="text-[18px] font-black tracking-tight">Data Security</h2>
          <p className="text-gray-400 text-[14px] leading-relaxed font-medium">We employ industry-standard security protocols to keep your personal data and internal listings safe against unauthorized access or disclosure. We do not store financial payment configurations directly on our servers.</p>
        </div>

        <div className="space-y-3">
          <h2 className="text-[18px] font-black tracking-tight">Info Sharing</h2>
          <p className="text-gray-400 text-[14px] leading-relaxed font-medium">Information such as your name, room number, and phone number is shared strictly with the assigned delivery partner to fulfill an order you place. We do not sell your personal data to advertisers or third-party entities.</p>
        </div>

        <div className="space-y-3">
          <h2 className="text-[18px] font-black tracking-tight">Your Rights</h2>
          <p className="text-gray-400 text-[14px] leading-relaxed font-medium">You hold the right to modify your personal parameters from the internal Settings dashboard. At any point, you may request complete account deletion resulting in the permanent removal of your data sets from our core database.</p>
        </div>

        <div className="space-y-3">
          <h2 className="text-[18px] font-black tracking-tight">Contact Us</h2>
          <p className="text-gray-400 text-[14px] leading-relaxed font-medium">For inquiries about your data privacy or if you have any questions regarding this policy, please reach out to us at <a href="mailto:iamsid074@gmail.com" className="text-indigo-400 underline">iamsid074@gmail.com</a>.</p>
        </div>

        <div className="pt-8 border-t border-white/10 text-center pb-8">
           <p className="text-gray-500 font-bold text-[13px]">
             &copy; 2026 cubazzar, all rights reserved.
           </p>
        </div>

      </div>
    </div>
  );
}
