import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ShippingPolicy() {
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
        <h1 className="text-[20px] font-black tracking-tight">Shipping Policy</h1>
      </div>

      <div className="px-5 py-8 max-w-2xl mx-auto space-y-8">
        
        <div className="space-y-3">
          <h2 className="text-[18px] font-black tracking-tight">Delivery Areas</h2>
          <p className="text-gray-400 text-[14px] leading-relaxed font-medium">Currently, our internal delivery network strictly operates within the boundaries of the university campus. Orders set to be delivered anywhere outside the specifically validated hostel blocks will be automatically rejected.</p>
        </div>

        <div className="space-y-3">
          <h2 className="text-[18px] font-black tracking-tight">Delivery Time</h2>
          <p className="text-gray-400 text-[14px] leading-relaxed font-medium">Under normal circumstances, our student delivery partners strive to complete fulfilled orders within 15 to 45 minutes, depending heavily on the distance between the seller’s block and your specified delivery address.</p>
        </div>

        <div className="space-y-3">
          <h2 className="text-[18px] font-black tracking-tight">Shipping Charges</h2>
          <p className="text-gray-400 text-[14px] leading-relaxed font-medium">A dynamically calculated shipping charge is applied to every delivery-oriented purchase. The exact shipping charge is clearly stated on your checkout page before your order is finalized.</p>
        </div>

        <div className="space-y-3">
          <h2 className="text-[18px] font-black tracking-tight">Order Verifications</h2>
          <p className="text-gray-400 text-[14px] leading-relaxed font-medium">You may receive a verification call or message from your respective delivery partner once they reach your hostel boundary to confirm your exact location and availability.</p>
        </div>

        <div className="space-y-3">
          <h2 className="text-[18px] font-black tracking-tight">Delivery Confirmations</h2>
          <p className="text-gray-400 text-[14px] leading-relaxed font-medium">Upon successfully securing the item, the status of your order will accurately reflect as "Delivered" inside the Transactions page, formally completing the cycle.</p>
        </div>

        <div className="space-y-3">
          <h2 className="text-[18px] font-black tracking-tight">Failed Deliveries</h2>
          <p className="text-gray-400 text-[14px] leading-relaxed font-medium">In circumstances where you are entirely unreachable during the delivery phase or cancel forcefully at the door, the order will be marked as "Failed". Repeated failed deliveries will flag your account.</p>
        </div>

        <div className="space-y-3">
          <h2 className="text-[18px] font-black tracking-tight">Contact Us</h2>
          <p className="text-gray-400 text-[14px] leading-relaxed font-medium">If you experience persistent logistical issues or disputes over a targeted delivery schedule, please immediately contact us via <a href="mailto:iamsid074@gmail.com" className="text-indigo-400 underline">iamsid074@gmail.com</a>.</p>
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
