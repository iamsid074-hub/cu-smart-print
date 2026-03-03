import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Shield, AlertTriangle, Scale } from "lucide-react";

const sections = [
    { id: "1", title: "Acceptance of Terms", content: `By accessing or using CU Bazaar ("Platform", "Website", "Service"), you agree to be bound by these Terms and Conditions. If you do not agree, please discontinue use immediately.` },
    { id: "2", title: "Platform Description", content: `CU Bazaar is a peer-to-peer marketplace platform operating within Chandigarh University campus that:\n• Allows users to list products for sale\n• Facilitates connections between buyers and sellers\n• Provides delivery services for listed products\n• IS NOT the seller of products — we are an intermediary platform only` },
    { id: "3", title: "Legal Structure & Liability", content: `3.1 Platform Role\nCU Bazaar operates as an intermediary platform under the Information Technology Act, 2000 and IT (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021. We:\n• Do NOT own, sell, or take possession of listed products\n• Act solely as a facilitator between buyers and sellers\n• Provide delivery logistics services only\n\n3.2 Seller Responsibilities\nAll sellers agree that:\n• They are the legal owners of products listed\n• Products are legally obtained and owned\n• They have the right to sell the products\n• Products comply with all applicable laws\n\n3.3 Platform Liability Limitation\nCU Bazaar is NOT liable for:\n• Quality, safety, legality, or authenticity of products listed by users\n• Accuracy of product descriptions provided by sellers\n• Disputes between buyers and sellers\n• Loss, damage, or theft of products during or after delivery\n• Any injuries or damages arising from product use` },
    { id: "4", title: "User Eligibility", content: `To use CU Bazaar, you must:\n• Be a current student, faculty, or staff member of Chandigarh University\n• Be at least 18 years old OR have parental/guardian consent if under 18\n• Provide accurate registration information\n• Have a valid university ID and contact details\n• Comply with university policies and regulations` },
    { id: "5", title: "User Accounts", content: `5.1 Registration\n• Users must register with valid university credentials\n• One account per user — account sharing is prohibited\n• You are responsible for maintaining account security\n\n5.2 Account Termination\nWe reserve the right to suspend or terminate accounts for:\n• Violation of these Terms\n• Fraudulent activity\n• Listing prohibited items\n• Harassment or misconduct\n• Non-payment of delivery charges` },
    { id: "6", title: "Delivery Services", content: `6.1 Delivery Terms\n• CU Bazaar provides delivery services within Chandigarh University campus\n• Delivery charges are clearly displayed before order confirmation\n• Delivery times are estimates only, not guarantees\n\n6.2 Delivery Charges\n• Delivery fees are separate from product prices\n• All delivery charges must be paid before delivery\n• Fees are non-refundable once delivery is initiated\n\n6.3 Delivery Liability\n• Our liability is limited to the delivery service only\n• Users must inspect items at time of delivery\n• Report any delivery issues within 2 hours of receipt` },
    { id: "7", title: "Prohibited Items", content: `The following items are STRICTLY PROHIBITED:\n\n7.1 Illegal Items\n• Narcotics, drugs, or controlled substances\n• Weapons, firearms, ammunition, explosives\n• Counterfeit or pirated goods\n• Stolen property\n• Items violating intellectual property rights\n\n7.2 Restricted Items\n• Alcohol and tobacco products\n• Prescription medications or medical devices\n• Hazardous or flammable materials\n• Live animals\n• Perishable food items without proper licensing\n• Adult content or materials\n\n7.3 University Policy Violations\n• Items banned by Chandigarh University policies\n• Academic materials that violate academic integrity\n• Items that could pose safety risks on campus\n\nViolation will result in immediate account termination and may be reported to university authorities and/or law enforcement.` },
    { id: "8", title: "Seller Obligations", content: `Sellers must:\n• Provide accurate product descriptions and genuine photos\n• Set fair and reasonable prices\n• Disclose any defects or issues\n• Update availability promptly\n• Pack items securely for delivery\n• Honor confirmed sales and respond to buyer inquiries promptly\n\nBy listing a product, sellers warrant that they have legal right to sell the item and that all information provided is truthful and accurate.` },
    { id: "9", title: "Buyer Obligations", content: `Buyers agree to:\n• Pay the agreed price plus delivery charges\n• Inspect items upon delivery\n• Report issues within specified timeframes\n• Treat delivery personnel respectfully\n• Ensure payment completion through approved methods` },
    { id: "10", title: "Intellectual Property", content: `• CU Bazaar name, logo, and platform design are our intellectual property\n• Users may not reproduce, distribute, or create derivative works without permission\n• User-generated content (listings, photos) remains the property of users\n• By posting content, users grant CU Bazaar a non-exclusive, worldwide, royalty-free license to use, display, and distribute the content for platform operation purposes.` },
    { id: "11", title: "Privacy & Data Protection", content: `We collect and process user data in accordance with:\n• Information Technology Act, 2000\n• IT (Reasonable Security Practices) Rules, 2011\n• Digital Personal Data Protection Act, 2023\n\nYour data is used for platform operation, transaction facilitation, and communication. We do not sell user data. We may share data with delivery personnel (delivery-related info only), university authorities (if required for safety), or law enforcement (when legally required).` },
    { id: "12", title: "Dispute Resolution", content: `User Disputes: Should be resolved directly between buyers and sellers. CU Bazaar may facilitate communication but is not obligated to resolve disputes.\n\nPlatform Disputes:\n1. First attempt resolution through our support system\n2. If unresolved, disputes shall be subject to arbitration in Chandigarh, India\n3. Governing law: Laws of India\n4. Jurisdiction: Courts of Chandigarh, India` },
    { id: "13", title: "Disclaimers", content: `CU Bazaar is provided "AS IS" and "AS AVAILABLE" without warranties of any kind.\n\nWe do not guarantee:\n• Uninterrupted or error-free service\n• Product quality or accuracy of listings\n• Successful transaction completion\n• Specific delivery times\n\nWe are not responsible for actions of users, including buyers and sellers.` },
    { id: "14", title: "Indemnification", content: `Users agree to indemnify and hold harmless CU Bazaar, its operators, and affiliates from any claims, damages, losses, or expenses (including legal fees) arising from:\n• Your use of the platform\n• Your violation of these Terms\n• Your violation of any laws or third-party rights\n• Products you list or purchase\n• Disputes with other users` },
    { id: "15", title: "Limitation of Liability", content: `TO THE MAXIMUM EXTENT PERMITTED BY LAW:\n• CU Bazaar's liability is limited to the delivery charges paid for the specific transaction\n• We are not liable for indirect, incidental, consequential, or punitive damages\n• We are not liable for loss of profits, data, or business opportunities` },
    { id: "16", title: "Compliance with Laws", content: `Users must comply with:\n• All Indian laws and regulations\n• Chandigarh University policies and codes of conduct\n• Information Technology Act, 2000\n• Consumer Protection Act, 2019\n• Sale of Goods Act, 1930\n• Indian Contract Act, 1872\n\nUsers are responsible for their own tax obligations arising from transactions on the platform.` },
    { id: "17", title: "Food Safety", content: `If food products are listed:\n• Sellers must comply with Food Safety and Standards Act, 2006\n• Sellers must have appropriate licenses if required\n• CU Bazaar is not responsible for food safety or quality\n• Users consume food products at their own risk` },
    { id: "18", title: "Content Moderation", content: `We reserve the right to remove any content that:\n• Violates these Terms or applicable laws\n• Is offensive, harmful, or inappropriate\n• Infringes on third-party rights\n\nUsers can report inappropriate content or behavior. We will investigate and take appropriate action.` },
    { id: "19", title: "Modifications to Terms", content: `• We may modify these Terms at any time\n• Changes will be posted on the platform\n• Continued use after changes constitutes acceptance\n• Material changes will be notified to users` },
    { id: "20", title: "Termination", content: `Users may terminate their account at any time by contacting support.\n\nWe may terminate or suspend the service or any user account at our discretion, particularly for Terms violations.\n\nUpon termination:\n• Access to the platform will be revoked\n• Pending transactions must be completed or cancelled\n• Provisions such as indemnification and liability limitations survive termination` },
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
                            <p className="text-sm mt-1" style={{ color: "#666" }}>CU Bazaar — Last updated: March 3, 2026</p>
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
                        <p className="text-xs mt-0.5 leading-relaxed" style={{ color: "#888" }}>CU Bazaar operates as an intermediary under IT Act, 2000. We are NOT the seller — transactions occur directly between users.</p>
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
