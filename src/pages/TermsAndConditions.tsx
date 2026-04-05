import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Shield, AlertTriangle, Scale } from "lucide-react";

const sections = [
    { id: "1", title: "Acceptance of Terms", content: `By accessing or using CU Bazaar ("Platform", "Website", "Service"), you agree to be bound by these Terms and Conditions. If you do not agree, please discontinue use immediately.` },
    { id: "2", title: "Platform Description", content: `CU Bazaar is a peer-to-peer marketplace platform operating within Chandigarh University campus that:\nâ€¢ Allows users to list products for sale\nâ€¢ Facilitates connections between buyers and sellers\nâ€¢ Provides delivery services for listed products\nâ€¢ IS NOT the seller of products â€” we are an intermediary platform only` },
    { id: "3", title: "Legal Structure & Liability", content: `3.1 Platform Role\nCU Bazaar operates as an intermediary platform under the Information Technology Act, 2000 and IT (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021. We:\nâ€¢ Do NOT own, sell, or take possession of listed products\nâ€¢ Act solely as a facilitator between buyers and sellers\nâ€¢ Provide delivery logistics services only\n\n3.2 Seller Responsibilities\nAll sellers agree that:\nâ€¢ They are the legal owners of products listed\nâ€¢ Products are legally obtained and owned\nâ€¢ They have the right to sell the products\nâ€¢ Products comply with all applicable laws\n\n3.3 Platform Liability Limitation\nCU Bazaar is NOT liable for:\nâ€¢ Quality, safety, legality, or authenticity of products listed by users\nâ€¢ Accuracy of product descriptions provided by sellers\nâ€¢ Disputes between buyers and sellers\nâ€¢ Loss, damage, or theft of products during or after delivery\nâ€¢ Any injuries or damages arising from product use` },
    { id: "4", title: "User Eligibility", content: `To use CU Bazaar, you must:\nâ€¢ Be a current student, faculty, or staff member of Chandigarh University\nâ€¢ Be at least 18 years old OR have parental/guardian consent if under 18\nâ€¢ Provide accurate registration information\nâ€¢ Have a valid university ID and contact details\nâ€¢ Comply with university policies and regulations` },
    { id: "5", title: "User Accounts", content: `5.1 Registration\nâ€¢ Users must register with valid university credentials\nâ€¢ One account per user â€” account sharing is prohibited\nâ€¢ You are responsible for maintaining account security\n\n5.2 Account Termination\nWe reserve the right to suspend or terminate accounts for:\nâ€¢ Violation of these Terms\nâ€¢ Fraudulent activity\nâ€¢ Listing prohibited items\nâ€¢ Harassment or misconduct\nâ€¢ Non-payment of delivery charges` },
    { id: "6", title: "Delivery Services", content: `6.1 Delivery Terms\nâ€¢ CU Bazaar provides delivery services within Chandigarh University campus\nâ€¢ Delivery charges are clearly displayed before order confirmation\nâ€¢ Delivery times are estimates only, not guarantees\n\n6.2 Delivery Charges\nâ€¢ Delivery fees are separate from product prices\nâ€¢ All delivery charges must be paid before delivery\nâ€¢ Fees are non-refundable once delivery is initiated\n\n6.3 Delivery Liability\nâ€¢ Our liability is limited to the delivery service only\nâ€¢ Users must inspect items at time of delivery\nâ€¢ Report any delivery issues within 2 hours of receipt` },
    { id: "7", title: "Prohibited Items", content: `The following items are STRICTLY PROHIBITED:\n\n7.1 Illegal Items\nâ€¢ Narcotics, drugs, or controlled substances\nâ€¢ Weapons, firearms, ammunition, explosives\nâ€¢ Counterfeit or pirated goods\nâ€¢ Stolen property\nâ€¢ Items violating intellectual property rights\n\n7.2 Restricted Items\nâ€¢ Alcohol and tobacco products\nâ€¢ Prescription medications or medical devices\nâ€¢ Hazardous or flammable materials\nâ€¢ Live animals\nâ€¢ Perishable food items without proper licensing\nâ€¢ Adult content or materials\n\n7.3 University Policy Violations\nâ€¢ Items banned by Chandigarh University policies\nâ€¢ Academic materials that violate academic integrity\nâ€¢ Items that could pose safety risks on campus\n\nViolation will result in immediate account termination and may be reported to university authorities and/or law enforcement.` },
    { id: "8", title: "Seller Obligations", content: `Sellers must:\nâ€¢ Provide accurate product descriptions and genuine photos\nâ€¢ Set fair and reasonable prices\nâ€¢ Disclose any defects or issues\nâ€¢ Update availability promptly\nâ€¢ Pack items securely for delivery\nâ€¢ Honor confirmed sales and respond to buyer inquiries promptly\n\nBy listing a product, sellers warrant that they have legal right to sell the item and that all information provided is truthful and accurate.` },
    { id: "9", title: "Buyer Obligations", content: `Buyers agree to:\nâ€¢ Pay the agreed price plus delivery charges\nâ€¢ Inspect items upon delivery\nâ€¢ Report issues within specified timeframes\nâ€¢ Treat delivery personnel respectfully\nâ€¢ Ensure payment completion through approved methods` },
    { id: "10", title: "Intellectual Property", content: `â€¢ CU Bazaar name, logo, and platform design are our intellectual property\nâ€¢ Users may not reproduce, distribute, or create derivative works without permission\nâ€¢ User-generated content (listings, photos) remains the property of users\nâ€¢ By posting content, users grant CU Bazaar a non-exclusive, worldwide, royalty-free license to use, display, and distribute the content for platform operation purposes.` },
    { id: "11", title: "Privacy & Data Protection", content: `We collect and process user data in accordance with:\nâ€¢ Information Technology Act, 2000\nâ€¢ IT (Reasonable Security Practices) Rules, 2011\nâ€¢ Digital Personal Data Protection Act, 2023\n\nYour data is used for platform operation, transaction facilitation, and communication. We do not sell user data. We may share data with delivery personnel (delivery-related info only), university authorities (if required for safety), or law enforcement (when legally required).` },
    { id: "12", title: "Dispute Resolution", content: `User Disputes: Should be resolved directly between buyers and sellers. CU Bazaar may facilitate communication but is not obligated to resolve disputes.\n\nPlatform Disputes:\n1. First attempt resolution through our support system\n2. If unresolved, disputes shall be subject to arbitration in Chandigarh, India\n3. Governing law: Laws of India\n4. Jurisdiction: Courts of Chandigarh, India` },
    { id: "13", title: "Disclaimers", content: `CU Bazaar is provided "AS IS" and "AS AVAILABLE" without warranties of any kind.\n\nWe do not guarantee:\nâ€¢ Uninterrupted or error-free service\nâ€¢ Product quality or accuracy of listings\nâ€¢ Successful transaction completion\nâ€¢ Specific delivery times\n\nWe are not responsible for actions of users, including buyers and sellers.` },
    { id: "14", title: "Indemnification", content: `Users agree to indemnify and hold harmless CU Bazaar, its operators, and affiliates from any claims, damages, losses, or expenses (including legal fees) arising from:\nâ€¢ Your use of the platform\nâ€¢ Your violation of these Terms\nâ€¢ Your violation of any laws or third-party rights\nâ€¢ Products you list or purchase\nâ€¢ Disputes with other users` },
    { id: "15", title: "Limitation of Liability", content: `TO THE MAXIMUM EXTENT PERMITTED BY LAW:\nâ€¢ CU Bazaar's liability is limited to the delivery charges paid for the specific transaction\nâ€¢ We are not liable for indirect, incidental, consequential, or punitive damages\nâ€¢ We are not liable for loss of profits, data, or business opportunities` },
    { id: "16", title: "Compliance with Laws", content: `Users must comply with:\nâ€¢ All Indian laws and regulations\nâ€¢ Chandigarh University policies and codes of conduct\nâ€¢ Information Technology Act, 2000\nâ€¢ Consumer Protection Act, 2019\nâ€¢ Sale of Goods Act, 1930\nâ€¢ Indian Contract Act, 1872\n\nUsers are responsible for their own tax obligations arising from transactions on the platform.` },
    { id: "17", title: "Food Safety", content: `If food products are listed:\nâ€¢ Sellers must comply with Food Safety and Standards Act, 2006\nâ€¢ Sellers must have appropriate licenses if required\nâ€¢ CU Bazaar is not responsible for food safety or quality\nâ€¢ Users consume food products at their own risk` },
    { id: "18", title: "Content Moderation", content: `We reserve the right to remove any content that:\nâ€¢ Violates these Terms or applicable laws\nâ€¢ Is offensive, harmful, or inappropriate\nâ€¢ Infringes on third-party rights\n\nUsers can report inappropriate content or behavior. We will investigate and take appropriate action.` },
    { id: "19", title: "Modifications to Terms", content: `â€¢ We may modify these Terms at any time\nâ€¢ Changes will be posted on the platform\nâ€¢ Continued use after changes constitutes acceptance\nâ€¢ Material changes will be notified to users` },
    { id: "20", title: "Termination", content: `Users may terminate their account at any time by contacting support.\n\nWe may terminate or suspend the service or any user account at our discretion, particularly for Terms violations.\n\nUpon termination:\nâ€¢ Access to the platform will be revoked\nâ€¢ Pending transactions must be completed or cancelled\nâ€¢ Provisions such as indemnification and liability limitations survive termination` },
    { id: "21-24", title: "General Provisions", content: `Severability: If any provision of these Terms is found to be unenforceable, the remaining provisions remain in full effect.\n\nEntire Agreement: These Terms constitute the entire agreement between users and CU Bazaar regarding platform use.\n\nContact: For questions, concerns, or reports:\nEmail: support@cubazzar.shop\nAddress: Chandigarh University, NH-95, Chandigarh-Ludhiana Highway, Mohali, Punjab 140413` },
];

export default function TermsAndConditions() {
    const [openSection, setOpenSection] = useState<string | null>("1");

    return (
        <div className="min-h-screen" style={{ backgroundColor: "#0f0f10", color: "#e0e0e0" }}>
            {/* Header */}
            <div className="border-b" style={{ borderColor: "#1e1e21" }}>
                <div className="max-w-3xl mx-auto px-4 py-10">
                    <div className="flex items-center gap-2 text-xs mb-4" style={{ color: "#555" }}>
                        <Link to="/" className="hover:text-white transition-colors">Home</Link>
                        <ChevronRight className="w-3 h-3" />
                        <span style={{ color: "#999" }}>Terms and Conditions</span>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: "#1a1a1d" }}>
                            <Scale className="w-5 h-5" style={{ color: "#4DB8AC" }} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold" style={{ color: "#e8e8e8" }}>Terms and Conditions</h1>
                            <p className="text-sm mt-1" style={{ color: "#666" }}>CU Bazaar â€” Last updated: March 3, 2026</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Important Notices */}
            <div className="max-w-3xl mx-auto px-4 py-6 space-y-3">
                <div className="flex gap-3 p-4 rounded-xl" style={{ backgroundColor: "#1a1a1d", border: "1px solid #2a2a2e" }}>
                    <Shield className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#4DB8AC" }} />
                    <div>
                        <p className="text-sm font-semibold" style={{ color: "#e0e0e0" }}>Intermediary Platform</p>
                        <p className="text-xs mt-0.5 leading-relaxed" style={{ color: "#888" }}>CU Bazaar operates as an intermediary under IT Act, 2000. We are NOT the seller â€” transactions occur directly between users.</p>
                    </div>
                </div>
                <div className="flex gap-3 p-4 rounded-xl" style={{ backgroundColor: "#1a150a", border: "1px solid #2a1e0a" }}>
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#F0C040" }} />
                    <div>
                        <p className="text-sm font-semibold" style={{ color: "#e0e0e0" }}>Limited Liability</p>
                        <p className="text-xs mt-0.5 leading-relaxed" style={{ color: "#888" }}>Our liability is strictly limited to delivery services only. Users are responsible for the legality and quality of their own transactions.</p>
                    </div>
                </div>
            </div>

            {/* Accordion Sections */}
            <div className="max-w-3xl mx-auto px-4 pb-20 space-y-1.5">
                {sections.map((s) => (
                    <div key={s.id} className="rounded-xl overflow-hidden" style={{ border: "1px solid #1e1e21" }}>
                        <button
                            onClick={() => setOpenSection(openSection === s.id ? null : s.id)}
                            className="w-full flex items-center justify-between px-5 py-3.5 text-left transition-colors"
                            style={{ backgroundColor: openSection === s.id ? "#161618" : "#0f0f10" }}
                        >
                            <span className="text-sm font-medium" style={{ color: openSection === s.id ? "#e0e0e0" : "#aaa" }}>
                                <span style={{ color: "#555", marginRight: "8px", fontSize: "11px" }}>{s.id}.</span>
                                {s.title}
                            </span>
                            <ChevronRight
                                className="w-4 h-4 flex-shrink-0 transition-transform"
                                style={{ color: "#555", transform: openSection === s.id ? "rotate(90deg)" : "rotate(0)" }}
                            />
                        </button>
                        {openSection === s.id && (
                            <div className="px-5 pb-5 pt-1" style={{ backgroundColor: "#161618" }}>
                                <div className="h-px mb-3" style={{ backgroundColor: "#1e1e21" }} />
                                <p className="text-xs leading-relaxed whitespace-pre-wrap" style={{ color: "#888" }}>
                                    {s.content}
                                </p>
                            </div>
                        )}
                    </div>
                ))}

                {/* Acknowledgment box */}
                <div className="mt-6 p-5 rounded-xl" style={{ backgroundColor: "#161618", border: "1px solid #1e1e21" }}>
                    <p className="text-xs leading-relaxed" style={{ color: "#777" }}>
                        <strong style={{ color: "#aaa" }}>Acknowledgment:</strong> By using CU Bazaar, you confirm that you have read and understood these Terms, agree to be bound by them, understand we are an intermediary platform only, and will comply with all applicable laws and university policies.
                    </p>
                    <p className="text-[10px] mt-3" style={{ color: "#444" }}>
                        <strong>By clicking "I Accept" or by using CU Bazzar, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.</strong>
                    </p>
                </div>
            </div>
        </div>
    );
}
