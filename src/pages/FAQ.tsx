import { ArrowLeft, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  {
    question: "How do I place an order on CU Bazzar?",
    answer: "Simply navigate to the Home or Search pages, find the item you need, add it to your cart, and proceed to checkout. You will need to make sure your Hostel Block and Room Number are correctly set in your profile."
  },
  {
    question: "How fast is the delivery?",
    answer: "Normally, deliveries are completed within 15 to 45 minutes, relying on our student delivery network inside the University Campus."
  },
  {
    question: "Can I become a delivery partner?",
    answer: "Yes! Navigate to the Settings tab and click 'Be Our Delivery Partner'. You can act as a delivery partner for 7 days and earn 60% of the delivery charge from each order you fulfill."
  },
  {
    question: "What happens if I receive a damaged product or face an issue?",
    answer: "You should immediately reject the product at the door during Cash on Delivery. If paid via UPI beforehand, contact support at iamsid074@gmail.com with your order details."
  },
  {
    question: "Can I sell my old textbooks or gadgets here?",
    answer: "Absolutely. Head to your Profile, tap on the listings section (or 'Start Selling'), and upload your product details. Once approved, it will be visible to all students on campus."
  }
];

export default function FAQ() {
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-[#0d0d0f] text-white pb-20">
      {/* HEADER */}
      <div className="sticky top-0 z-40 bg-[#0d0d0f]/80 backdrop-blur-xl border-b border-white/5 px-4 h-16 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-white/5 transition-all text-white active:scale-95"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-[20px] font-black tracking-tight">CU Bazzar FAQ</h1>
      </div>

      <div className="px-5 py-8 max-w-2xl mx-auto space-y-4">
        
        <p className="text-gray-400 font-medium text-[15px] mb-8">
          Find answers to the most commonly asked questions about buying, selling, and delivery on CU Bazzar.
        </p>

        {faqs.map((faq, index) => (
          <div key={index} className="bg-[#1c1c1e] rounded-3xl border border-white/5 overflow-hidden">
            <button 
              onClick={() => toggleFaq(index)}
              className="w-full flex items-center justify-between p-5 text-left active:bg-white/5 transition-colors"
            >
              <h3 className="font-bold text-[15px] text-white pr-4">{faq.question}</h3>
              <ChevronDown 
                className={`w-5 h-5 text-gray-400 transition-transform duration-300 flex-shrink-0 ${openIndex === index ? 'rotate-180' : ''}`} 
              />
            </button>
            <AnimatePresence>
              {openIndex === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5 pt-1 border-t border-white/5 mt-1">
                    <p className="text-[14px] text-gray-400 font-medium leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}

        <div className="mt-12 text-center">
           <p className="text-gray-500 font-bold text-[13px]">
             Still need help? Email <a href="mailto:iamsid074@gmail.com" className="text-indigo-400 underline">iamsid074@gmail.com</a>
           </p>
        </div>

      </div>
    </div>
  );
}
