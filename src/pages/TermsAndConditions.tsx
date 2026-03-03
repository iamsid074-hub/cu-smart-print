import { motion } from "framer-motion";
import { ArrowLeft, ShieldCheck, AlertTriangle, Scale, Users, Ban, FileText, Gavel } from "lucide-react";
import { Link } from "react-router-dom";

const sections = [
    {
        icon: FileText,
        title: "1. Platform Nature",
        content: `CU Bazzar is an independent online student marketplace platform that facilitates buying and selling between users.\n\nCU Bazzar:\n• Does NOT manufacture, stock, or directly supply goods\n• Acts only as an intermediary platform\n• Is not affiliated with any college, university, or institution\n\nAll transactions occur directly between users.`
    },
    {
        icon: Users,
        title: "2. Eligibility",
        content: `Users must:\n• Be 18 years or older\n• Provide accurate information\n• Use the platform only for lawful purposes\n\nMisrepresentation of identity is strictly prohibited.`
    },
    {
        icon: Ban,
        title: "3. Strictly Prohibited Items",
        content: `The following items are NOT allowed under any circumstances:\n• Alcohol, tobacco, drugs\n• Weapons of any kind\n• Academic cheating materials\n• Fake documents or IDs\n• Pirated software or digital content\n• Stolen goods\n• Any item prohibited under Indian law\n• Any item prohibited under college/institution rules\n\nViolation leads to:\n• Immediate account suspension\n• Permanent ban\n• Reporting to authorities if required`
    },
    {
        icon: ShieldCheck,
        title: "4. User Responsibility",
        content: `Sellers are solely responsible for:\n• Legality of items\n• Authenticity\n• Quality\n• Delivery compliance\n\nBuyers are responsible for verifying product details before purchase.\n\nCU Bazzar does not guarantee product accuracy or quality.`
    },
    {
        icon: AlertTriangle,
        title: "5. No Liability Clause",
        content: `CU Bazzar shall not be held responsible for:\n• Product disputes\n• Delivery issues\n• Misconduct between users\n• False claims made by users\n• Any indirect or consequential damages\n\nPlatform only provides listing infrastructure.`
    },
    {
        icon: Scale,
        title: "6. Indemnification Clause",
        content: `Users agree to indemnify and hold harmless CU Bazzar and its operator from:\n• Any legal claims\n• Allegations\n• Penalties\n• Losses arising from user misconduct\n\nIf a user violates laws, the user alone is liable.`
    },
    {
        icon: Gavel,
        title: "7. Compliance With Law & Institutional Policies",
        content: `Users must comply with:\n• Information Technology Act, 2000 (India)\n• Indian Penal Code\n• Consumer Protection Laws\n• Applicable institutional regulations\n\nCU Bazzar reserves the right to remove listings violating these rules.`
    },
    {
        icon: ShieldCheck,
        title: "8. Right to Remove or Suspend",
        content: `CU Bazzar may:\n• Remove any listing without notice\n• Suspend any user suspected of policy violation\n• Cooperate with authorities when required\n\nThis ensures platform safety.`
    },
    {
        icon: Users,
        title: "9. No Partnership or Agency",
        content: `Nothing in these Terms creates:\n• Partnership\n• Joint venture\n• Employment\n• Agency relationship\n\nBetween CU Bazzar and any user.`
    },
    {
        icon: Scale,
        title: "10. Dispute Resolution",
        content: `Users agree that:\n• Disputes between buyer and seller are their responsibility\n• Platform is not obligated to mediate\n\nJurisdiction: Courts of Chandigarh, India`
    },
    {
        icon: FileText,
        title: "11. Modification of Terms",
        content: `CU Bazzar reserves the right to update these terms anytime.\n\nContinued use implies acceptance.`
    },
];

export default function TermsAndConditions() {
    return (
        <div className="min-h-screen bg-[#0A0505] relative">
            {/* Ambient glows */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-20 relative z-10">
                {/* Back */}
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                    <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors mb-8">
                        <ArrowLeft className="w-4 h-4" /> Back to Home
                    </Link>
                </motion.div>

                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 font-semibold text-sm mb-4 backdrop-blur-md">
                        <Scale className="w-4 h-4" /> Legal
                    </div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-3 tracking-tight">
                        Terms & Conditions
                    </h1>
                    <p className="text-muted-foreground text-sm sm:text-base max-w-lg mx-auto">
                        Please read these terms carefully before using CU Bazzar. By using the platform, you agree to these terms.
                    </p>
                    <p className="text-xs text-muted-foreground/60 mt-3 font-mono">
                        Effective Date: March 3, 2026 · Operated by ANSHU
                    </p>
                </motion.div>

                {/* Sections */}
                <div className="space-y-4">
                    {sections.map((section, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.04 }}
                            className="rounded-2xl border border-white/8 p-5 sm:p-6 hover:border-white/15 transition-all"
                            style={{ background: 'rgba(255,255,255,0.02)' }}
                        >
                            <div className="flex items-start gap-3 mb-3">
                                <div className="w-9 h-9 rounded-xl bg-orange-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <section.icon className="w-4 h-4 text-orange-400" />
                                </div>
                                <h2 className="text-lg font-bold text-white">{section.title}</h2>
                            </div>
                            <div className="pl-12">
                                {section.content.split('\n').map((line, j) => (
                                    <p key={j} className={`text-sm leading-relaxed ${line.startsWith('•') ? 'text-muted-foreground pl-2' : line === '' ? '' : 'text-muted-foreground'}`}>
                                        {line}
                                    </p>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Footer note */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-12 text-center"
                >
                    <p className="text-xs text-muted-foreground/50">
                        © 2026 CU Bazzar · All rights reserved · For queries, contact the platform admin.
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
