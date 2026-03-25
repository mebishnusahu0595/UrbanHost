"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, ShieldCheck, CreditCard, Headphones, CheckCircle2, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

export default function SafetyPage() {
    return (
        <div className="min-h-screen bg-gray-50/30">
            {/* Header / Search */}
            <div className="bg-white border-b border-gray-100 py-16 px-4">
                <div className="max-w-4xl mx-auto text-center space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-4">Safety & Cancellation Policy</h1>
                        <p className="text-lg text-gray-500 font-bold max-w-2xl mx-auto leading-relaxed">
                            Your peace of mind is our top priority. We've designed our policies to be transparent, flexible, and focused on your wellbeing.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* SAFETY COMMITMENT */}
            <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-2xl font-black text-gray-900 mb-10 text-center uppercase tracking-widest">Safety Commitment</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        {
                            icon: ShieldCheck,
                            title: "Cleanliness Standards",
                            desc: "Enhanced sanitization and hygiene protocols at every stay. We partner with professional cleaning services to ensure industry-leading standards.",
                            color: "text-blue-600",
                            bg: "bg-blue-50"
                        },
                        {
                            icon: CreditCard,
                            title: "Secure Payments",
                            desc: "All transactions are encrypted with PCI-DSS compliance. We never store your full card details, ensuring total financial privacy.",
                            color: "text-indigo-600",
                            bg: "bg-indigo-50"
                        },
                        {
                            icon: Headphones,
                            title: "Guest Support",
                            desc: "24/7 dedicated support team and verified host background checks for a worry-free experience from check-in to check-out.",
                            color: "text-cyan-600",
                            bg: "bg-cyan-50"
                        }
                    ].map((item, i) => (
                        <div key={i} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg transition-all text-center">
                            <div className={`w-14 h-14 ${item.bg} ${item.color} rounded-2xl flex items-center justify-center mb-6 mx-auto`}>
                                <item.icon className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-black text-gray-900 mb-4">{item.title}</h3>
                            <p className="text-sm text-gray-500 font-medium leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CANCELLATION POLICY TABLE */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-2xl font-black text-gray-900 mb-10 text-center uppercase tracking-widest">Cancellation Policy</h2>
                    <div className="overflow-hidden rounded-3xl border border-gray-100 shadow-xl">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">Cancellation Timing</th>
                                    <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">Refund Amount</th>
                                    <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">Policy Tier</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {[
                                    { timing: "More than 48 hours before check-in", amount: "100% Refund", tier: "FLEXIBLE", tierColor: "bg-green-100 text-green-700", amountColor: "text-green-600" },
                                    { timing: "24 to 48 hours before check-in", amount: "50% Refund", tier: "MODERATE", tierColor: "bg-orange-100 text-orange-700", amountColor: "text-orange-600" },
                                    { timing: "Less than 24 hours before check-in", amount: "No Refund", tier: "STRICT", tierColor: "bg-red-100 text-red-700", amountColor: "text-red-600" }
                                ].map((row, i) => (
                                    <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-8 py-8 text-sm font-black text-gray-600">{row.timing}</td>
                                        <td className={`px-8 py-8 text-sm font-black ${row.amountColor}`}>{row.amount}</td>
                                        <td className="px-8 py-8">
                                            <span className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${row.tierColor}`}>
                                                {row.tier}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* REFUND PROCESS STEPS */}
            <section className="py-24 bg-gray-50/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-2xl font-black text-gray-900 mb-16 uppercase tracking-widest">How the Refund Process Works</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
                        {[
                            { num: "1", title: "Submit Request", desc: "Cancel via your dashboard in one click" },
                            { num: "2", title: "Review & Auto-Check", desc: "Our system calculates your eligibility" },
                            { num: "3", title: "Payment Reversal", desc: "Refund is sent to original payment method" },
                            { num: "4", title: "Funds Received", desc: "Typically appears in 3-5 business days" }
                        ].map((step, i) => (
                            <div key={i} className="relative">
                                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-lg font-black shadow-lg shadow-blue-600/30">
                                    {step.num}
                                </div>
                                <h3 className="text-base font-black text-gray-900 mb-2">{step.title}</h3>
                                <p className="text-xs text-gray-500 font-bold leading-relaxed">{step.desc}</p>
                                {i < 3 && <div className="hidden lg:block absolute top-6 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-0.5 bg-blue-100" />}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* NEED HELP */}
            <section className="py-24">
                <div className="max-w-4xl mx-auto px-4">
                    <Card className="bg-white border border-gray-100 rounded-[3rem] p-12 text-center shadow-2xl shadow-gray-200/50">
                        <h2 className="text-3xl font-black text-gray-900 mb-6 font-display">Need more clarification?</h2>
                        <p className="text-gray-500 font-bold text-lg mb-10 max-w-xl mx-auto leading-relaxed">
                            Our support team is available 24/7 to help you with specific cancellation requests or safety concerns.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl px-10 py-7 font-black text-base shadow-xl shadow-blue-600/20">
                                Contact Support
                            </Button>
                            <Button variant="outline" className="border-2 border-gray-100 hover:bg-gray-50 rounded-2xl px-10 py-7 font-black text-base">
                                View FAQ
                            </Button>
                        </div>
                    </Card>
                </div>
            </section>
        </div>
    );
}
