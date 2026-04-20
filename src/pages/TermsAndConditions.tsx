import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function TermsAndConditions() {
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
        <h1 className="text-[20px] font-black tracking-tight">Terms & Conditions</h1>
      </div>

      <div className="px-5 py-8 max-w-2xl mx-auto space-y-8">
        
        <div className="space-y-3">
          <h2 className="text-[18px] font-black tracking-tight">Acceptance of Terms</h2>
          <p className="text-gray-400 text-[14px] leading-relaxed font-medium">By accessing or using CU Bazzar, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, please refrain from using our services.</p>
        </div>

        <div className="space-y-3">
          <h2 className="text-[18px] font-black tracking-tight">Service Description</h2>
          <p className="text-gray-400 text-[14px] leading-relaxed font-medium">CU Bazzar is an exclusive digital marketplace meant to bridge the gap between students, providing seamless peer-to-peer selling, grocery deliveries, and campus-specific services.</p>
        </div>

        <div className="space-y-3">
          <h2 className="text-[18px] font-black tracking-tight">User Responsibilities</h2>
          <p className="text-gray-400 text-[14px] leading-relaxed font-medium">You agree to provide accurate information when creating your profile, maintain the security of your account, and use the platform respectfully without engaging in abusive behavior or violating university regulations.</p>
        </div>

        <div className="space-y-3">
          <h2 className="text-[18px] font-black tracking-tight">Delivery Terms</h2>
          <p className="text-gray-400 text-[14px] leading-relaxed font-medium">Delivery partners are fellow students operating within campus limits. Delivery timeframes are estimates and may vary based on demand, distance, and host block accessibility.</p>
        </div>

        <div className="space-y-3">
          <h2 className="text-[18px] font-black tracking-tight">Payment and Pricing</h2>
          <p className="text-gray-400 text-[14px] leading-relaxed font-medium">All payments are made via Cash on Delivery (COD) or UPI transfers handled securely at the time of order fulfillment. Users agree to honor payments upon successful delivery.</p>
        </div>

        <div className="space-y-3">
          <h2 className="text-[18px] font-black tracking-tight">Pricing Transparency</h2>
          <p className="text-gray-400 text-[14px] leading-relaxed font-medium">We maintain a strict transparent pricing mechanism. Base product prices and any applicable delivery fees will always be displayed fully during the checkout process.</p>
        </div>

        <div className="space-y-3">
          <h2 className="text-[18px] font-black tracking-tight">Cancellation and Refunds</h2>
          <p className="text-gray-400 text-[14px] leading-relaxed font-medium">Orders can only be canceled prior to seller acceptance. In the rare event of a failed completion after monetary exchange, refunds are processed based on situational review by admins.</p>
        </div>

        <div className="space-y-3">
          <h2 className="text-[18px] font-black tracking-tight">Privacy and Data Protection</h2>
          <p className="text-gray-400 text-[14px] leading-relaxed font-medium">Your data is secured and primarily used to facilitate deliveries and improve platform stability. We do not sell your personal data to external third parties.</p>
        </div>

        <div className="space-y-3">
          <h2 className="text-[18px] font-black tracking-tight">Limitation of Liability</h2>
          <p className="text-gray-400 text-[14px] leading-relaxed font-medium">CU Bazzar solely acts as a bridge. We are not liable for direct disputes involving peer-to-peer product quality, behavioral incidents, or unintended platform downtime.</p>
        </div>

        <div className="space-y-3">
          <h2 className="text-[18px] font-black tracking-tight">Modification to Terms</h2>
          <p className="text-gray-400 text-[14px] leading-relaxed font-medium">CU Bazzar reserves the right to modify these terms at any point. Continued usage of the application implies active acceptance of the newly modified terms.</p>
        </div>

        <div className="space-y-3">
          <h2 className="text-[18px] font-black tracking-tight">Contact Us</h2>
          <p className="text-gray-400 text-[14px] leading-relaxed font-medium">For any issues, queries, or disputes, please reach out to us internally via the provided support channels or email directly at <a href="mailto:iamsid074@gmail.com" className="text-indigo-400 underline">iamsid074@gmail.com</a>.</p>
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
