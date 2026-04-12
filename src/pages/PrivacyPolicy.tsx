import { Shield, Lock, Eye, FileText } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#000000] text-gray-300 pt-24 pb-16 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="w-8 h-8 text-indigo-500" />
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">Privacy Policy</h1>
        </div>

        <p className="text-gray-400 mb-8 font-medium">Last updated: April 12, 2026</p>

        <div className="space-y-8 text-[15px] leading-relaxed">
          <section className="bg-[#1c1c1e] border border-white/5 p-6 sm:p-8 rounded-3xl shadow-xl">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-indigo-400" /> 1. Information We Collect
            </h2>
            <p className="mb-4">
              When you use CU Bazzar, we may collect the following types of information:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-gray-400">
              <li><strong>Personal Data:</strong> Name, email address, phone number, and hostel/room details.</li>
              <li><strong>Usage Data:</strong> Pages visited, links clicked, IP address, device type, and browser details.</li>
              <li><strong>Advertising Data:</strong> We employ third-party advertising partners (like Google AdSense) that may collect data using cookies to serve personalized ads based on your prior visits to our website.</li>
            </ul>
          </section>

          <section className="bg-[#1c1c1e] border border-white/5 p-6 sm:p-8 rounded-3xl shadow-xl">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-indigo-400" /> 2. How We Use Your Information
            </h2>
            <p className="mb-4">
              We process your personal information for the following reasons:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-gray-400">
              <li>To provide and maintain the CU Bazzar marketplace platform.</li>
              <li>To facilitate smooth food deliveries directly to your hostel.</li>
              <li>To personalize your experience and show you relevant products.</li>
              <li>To effectively display advertisements through the Google AdSense network.</li>
            </ul>
          </section>

          <section className="bg-[#1c1c1e] border border-white/5 p-6 sm:p-8 rounded-3xl shadow-xl">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-400" /> 3. Google AdSense & Cookies
            </h2>
            <p className="mb-4 text-gray-400">
              We use Google AdSense to publish ads on this site. When you view or click on an ad, a cookie will be set 
              to help better provide advertisements that may be of interest to you.
            </p>
            <p className="text-gray-400">
              Third-party vendors, including Google, use cookies to serve ads based on a user's prior visits to our website.
              You may opt out of personalized advertising by visiting <a href="https://myadcenter.google.com/" className="text-indigo-400 underline">Google's Ads Settings</a>.
            </p>
          </section>

          <section className="bg-[#1c1c1e] border border-white/5 p-6 sm:p-8 rounded-3xl shadow-xl">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">4. Contact Us</h2>
            <p className="text-gray-400">
              If you have any questions or concerns about this Privacy Policy, please contact our support team through the Help Center.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
