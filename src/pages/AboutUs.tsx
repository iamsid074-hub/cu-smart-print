import { Info, Users, Globe, Building2 } from "lucide-react";

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-[#000000] text-gray-300 pt-24 pb-16 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col items-center text-center mb-16">
          <div className="w-20 h-20 bg-indigo-500/10 rounded-[2rem] flex items-center justify-center mb-6">
            <Info className="w-10 h-10 text-indigo-500" />
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight mb-4">
            About CU Bazzar
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl font-medium">
            The #1 student marketplace built exclusively for Chandigarh University. We redefine how students buy, sell, and eat on campus.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 mb-12">
          <div className="bg-[#1c1c1e] border border-white/5 p-8 rounded-[2rem] shadow-xl">
            <Users className="w-8 h-8 text-indigo-400 mb-6" />
            <h2 className="text-2xl font-bold text-white mb-3">Our Mission</h2>
            <p className="text-gray-400 leading-relaxed text-[15px]">
              We aim to bridge the gap between students by providing a secure, ultra-fast platform where they can trade essentials, share resources, and get hot meals delivered directly to their hostel rooms — all within an ecosystem they trust.
            </p>
          </div>

          <div className="bg-[#1c1c1e] border border-white/5 p-8 rounded-[2rem] shadow-xl">
            <Building2 className="w-8 h-8 text-indigo-400 mb-6" />
            <h2 className="text-2xl font-bold text-white mb-3">Campus Exclusive</h2>
            <p className="text-gray-400 leading-relaxed text-[15px]">
              Unlike massive global marketplaces, CU Bazzar is strictly tailored to the CU atmosphere. From specific hostel block filtering to localized vendor setups, every feature is designed to fit the unique student lifestyle.
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/20 p-8 sm:p-12 rounded-[2.5rem] shadow-2xl relative overflow-hidden text-center">
          <Globe className="w-32 h-32 text-indigo-500/10 absolute -top-10 -right-10 rotate-12" />
          <h2 className="text-3xl font-black text-white mb-4 relative z-10">We Are Student-Led</h2>
          <p className="text-gray-300 max-w-2xl mx-auto relative z-10 text-[16px] leading-relaxed">
            CU Bazzar started as a simple idea in a dorm room to fix the hassle of campus commerce. Today, it has grown into an expansive ecosystem supporting thousands of internal transactions, fast-food cravings, and quick deliveries tracking straight to the campus. 
          </p>
        </div>
      </div>
    </div>
  );
}
