"use client";

import { motion } from "framer-motion";
import { Shield, Lock, Eye, FileText, ChevronRight, Scale, Gavel, AlertCircle, CheckCircle2, Clock, Globe, CreditCard } from "lucide-react";

export default function OurPoliciesPage() {
    const sections = [
        { id: "privacy", title: "Privacy Policy", icon: Shield },
        { id: "terms", title: "Terms & Conditions", icon: Gavel },
        { id: "refund", title: "Cancellation & Refund", icon: CreditCard },
        { id: "cookies", title: "Cookie Policy", icon: Globe },
    ];

    return (
        <div className="min-h-screen bg-[#F8FAFC]">

            {/* Elegant Hero Section */}
            <div className="bg-white border-b border-gray-100 pt-24 pb-16">
                <div className="container mx-auto px-4 max-w-6xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col md:flex-row md:items-center justify-between gap-8"
                    >
                        <div>
                            <div className="flex items-center gap-2 text-blue-600 font-bold text-sm uppercase tracking-wider mb-4">
                                <Shield className="w-4 h-4" />
                                <span>Urban Host Legal Framework</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-[#0f294d] mb-4">Our Policies</h1>
                            <p className="text-gray-500 font-medium max-w-2xl leading-relaxed">
                                Transparent, fair, and secure. We've consolidated our Privacy, Terms, and Refund policies to help you understand how we operate and protect your interests.
                            </p>
                        </div>
                        <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 hidden lg:block">
                            <div className="flex items-center gap-4 text-[#1E3A8A]">
                                <Lock className="w-10 h-10 opacity-20" />
                                <div>
                                    <p className="text-xs font-black uppercase tracking-widest opacity-60">Compliance</p>
                                    <p className="text-lg font-bold">V 1.25 / 2026</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            <main className="py-12 md:py-20 text-[#334155]">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                        {/* Sidebar Navigation */}
                        <aside className="lg:col-span-3 hidden lg:block sticky top-32 h-fit">
                            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                                <h3 className="text-[10px] font-black text-gray-400 font-display uppercase tracking-widest mb-6 px-3">Policy Index</h3>
                                <nav className="space-y-1">
                                    {sections.map((section) => (
                                        <a
                                            key={section.id}
                                            href={`#${section.id}`}
                                            className="group flex items-center justify-between py-3 px-4 rounded-xl hover:bg-blue-50 transition-all text-sm font-bold text-gray-500 hover:text-blue-600"
                                        >
                                            <div className="flex items-center gap-3">
                                                <section.icon className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                                                <span>{section.title}</span>
                                            </div>
                                            <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all" />
                                        </a>
                                    ))}
                                </nav>
                            </div>
                        </aside>

                        {/* Full Policy Content */}
                        <div className="lg:col-span-9">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="space-y-16"
                            >
                                {/* 1. PRIVACY POLICY */}
                                <div id="privacy" className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-gray-100 scroll-mt-32">
                                    <div className="flex flex-col gap-6">
                                        <div className="pb-8 border-b border-gray-100">
                                            <h2 className="text-3xl font-black text-[#0f294d] mb-6">Privacy Policy</h2>
                                            <p className="font-bold text-lg text-blue-600 mb-4">URBANHOST (A Brand of Kuber Hoteliers & Management Services Pvt. Ltd.)</p>
                                            <p className="leading-relaxed">
                                                Kuber Hoteliers & Management Services Pvt. Ltd. (“Company”, “we”, “our”, “us”) respects the privacy of all users (“you”, “your”) who access or use our website, booking services, and hospitality-related offerings under the brand name URBANHOST.
                                            </p>
                                            <p className="mt-4 leading-relaxed">
                                                This Privacy Policy explains how we collect, use, store, share, and protect your personal information when you visit our website or use our services. By accessing or using URBANHOST services, you agree to the terms of this Privacy Policy.
                                            </p>
                                        </div>

                                        <div className="prose prose-blue max-w-none space-y-10 mt-6">
                                            <div className="space-y-4">
                                                <h3 className="text-xl font-bold text-[#0f294d]">1. Scope of This Privacy Policy</h3>
                                                <p>This Privacy Policy applies to:</p>
                                                <ul className="grid md:grid-cols-2 gap-x-8 gap-y-2 list-none p-0">
                                                    {[
                                                        "Visitors of the URBANHOST website",
                                                        "Customers making hotel or stay bookings",
                                                        "Users contacting via phone/email/forms",
                                                        "Guests availing hospitality services"
                                                    ].map(item => (
                                                        <li key={item} className="flex items-start gap-2 m-0 font-medium">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
                                                            {item}
                                                        </li>
                                                    ))}
                                                </ul>
                                                <p className="italic text-gray-500 text-sm">Note: This policy does not apply to third-party platforms which have their own privacy policies.</p>
                                            </div>

                                            <div className="space-y-6">
                                                <h3 className="text-xl font-bold text-[#0f294d]">2. Information We Collect</h3>

                                                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                                    <h4 className="font-bold text-blue-900 mb-2">A. Information You Provide Directly</h4>
                                                    <p className="mb-4">When you make a booking or enquiry, you may provide:</p>
                                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm font-medium">
                                                        {["Full Name", "Email Address", "Phone Number", "Residential Address", "Guest Details", "Booking Dates", "Special Requests", "Identity Proof"].map(t => (
                                                            <div key={t} className="flex items-center gap-2">
                                                                <CheckCircle2 className="w-3 h-3 text-green-600" /> {t}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div>
                                                    <h4 className="font-bold text-gray-900 mb-2">B. Booking and Transaction Information</h4>
                                                    <p>We collect booking confirmation details, payment status, and billing info.</p>
                                                    <div className="not-prose mt-3 bg-blue-50/50 p-4 rounded-xl border border-blue-100 text-xs text-blue-800 font-bold flex items-center gap-2">
                                                        <AlertCircle className="w-4 h-4" />
                                                        Note: We do not store complete card or UPI details.
                                                    </div>
                                                </div>

                                                <div>
                                                    <h4 className="font-bold text-gray-900 mb-2">C. Information Collected Automatically</h4>
                                                    <p>IP address, Browser type, Device info, Pages visited, and Cookie data.</p>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <h3 className="text-xl font-bold text-[#0f294d]">3. How We Use Your Information</h3>
                                                <ul className="space-y-2 list-none p-0">
                                                    {[
                                                        "To process and confirm hotel bookings",
                                                        "To provide hospitality services and guest support",
                                                        "To communicate booking updates or cancellations",
                                                        "To improve customer experience and personalize services",
                                                        "To comply with legal obligations under Indian laws",
                                                        "To prevent fraud or unauthorized activity",
                                                        "For internal analytics and promotional offers (opt-in)"
                                                    ].map(item => (
                                                        <li key={item} className="flex items-start gap-2 m-0 p-3 bg-gray-50/50 rounded-lg border border-gray-100/50">
                                                            <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5" />
                                                            <span className="font-medium">{item}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            <div className="space-y-4">
                                                <h3 className="text-xl font-bold text-[#0f294d]">4. Cookies and Tracking Technologies</h3>
                                                <p>URBANHOST uses cookies to enhance performance, remember preferences, and analyze traffic. You can disable these in your browser, though it may limit site features.</p>
                                            </div>

                                            <div className="space-y-4">
                                                <h3 className="text-xl font-bold text-[#0f294d]">5. Sharing of Personal Information</h3>
                                                <div className="grid md:grid-cols-3 gap-4">
                                                    {[
                                                        { t: "Service Providers", d: "Trusted partners like payment gateways and tech providers." },
                                                        { t: "Legal Compliance", d: "Law enforcement or regulatory requirements under Indian law." },
                                                        { t: "Business Transfers", d: "In case of merger or restructuring, subject to confidentiality." }
                                                    ].map(item => (
                                                        <div key={item.t} className="p-5 bg-white border border-gray-100 rounded-xl shadow-sm">
                                                            <p className="font-black text-sm mb-1">{item.t}</p>
                                                            <p className="text-xs text-gray-500 font-medium">{item.d}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <h3 className="text-xl font-bold text-[#0f294d]">6. Data Security Measures</h3>
                                                <p>We use SSL encryption, restricted access, and secure processing to protect your data. However, absolute security cannot be guaranteed.</p>
                                            </div>

                                            <div className="space-y-4">
                                                <h3 className="text-xl font-bold text-[#0f294d]">7. Data Retention Policy</h3>
                                                <p>Information is kept only as long as necessary for services, business records, and legal compliance. Data is securely purged when no longer needed.</p>
                                            </div>

                                            <div className="space-y-4">
                                                <h3 className="text-xl font-bold text-[#0f294d]">8. Your Rights and Choices</h3>
                                                <p>You have the right to access, correct, or delete your data (subject to legal limits), and withdraw marketing consent.</p>
                                            </div>

                                            <div className="space-y-4">
                                                <h3 className="text-xl font-bold text-[#0f294d]">9. Third-Party Links and OTA Platforms</h3>
                                                <p>UrbanHost properties may be on platforms like Booking.com, MakeMyTrip, etc. These platforms have their own independent privacy policies.</p>
                                            </div>

                                            <div className="space-y-4">
                                                <h3 className="text-xl font-bold text-[#0f294d]">10. Children’s Privacy</h3>
                                                <p>Services not intended for minors under 18 without guardian supervision. We do not knowingly collect personal data from minors.</p>
                                            </div>

                                            <div className="space-y-4">
                                                <h3 className="text-xl font-bold text-[#0f294d]">11. Changes to Policy</h3>
                                                <p>We update this policy from time to time. Changes will be posted here with a revised "Effective Date."</p>
                                            </div>

                                            <div className="space-y-4 pt-4 border-t border-gray-100">
                                                <h3 className="text-xl font-bold text-[#0f294d]">12. Contact Information</h3>
                                                <div className="flex items-center justify-between p-6 bg-gray-900 rounded-3xl text-white">
                                                    <div>
                                                        <p className="text-xs opacity-60 uppercase tracking-widest font-black">Support</p>
                                                        <p className="text-lg font-bold">Privacy-related concerns?</p>
                                                    </div>
                                                    <button className="bg-blue-600 px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all">
                                                        Contact Form
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* 2. TERMS & CONDITIONS */}
                                <div id="terms" className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-gray-100 scroll-mt-32">
                                    <h2 className="text-3xl font-black text-[#0f294d] mb-6">Terms & Conditions</h2>
                                    <p className="font-bold text-lg text-blue-600 mb-6">URBANHOST (A Brand of Kuber Hoteliers & Management Services Pvt. Ltd.)</p>

                                    <div className="prose prose-blue max-w-none space-y-10">
                                        <p>By accessing or using our services, you agree to comply with the following Terms & Conditions.</p>

                                        <div className="space-y-4">
                                            <h3 className="text-xl font-bold text-[#0f294d]">1. Services Offered</h3>
                                            <p>Hotel and stay bookings, hospitality accommodation, and guest support are subject to real-time availability.</p>
                                        </div>

                                        <div className="space-y-4">
                                            <h3 className="text-xl font-bold text-[#0f294d]">2. Booking Policy</h3>
                                            <ul>
                                                <li>Accurate guest details are required for all bookings.</li>
                                                <li>Confirmation is subject to successful payment.</li>
                                                <li>Timings are strictly as per individual hotel policies.</li>
                                            </ul>
                                            <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl text-sm font-medium text-orange-900">
                                                URBANHOST reserves the right to cancel bookings with incorrect information.
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h3 className="text-xl font-bold text-[#0f294d]">3. Guest Responsibilities</h3>
                                            <p>Carry valid Govt-issued ID, follow hotel rules, and maintain the property. Violations may result in cancellation without refund.</p>
                                        </div>

                                        <div className="space-y-4">
                                            <h3 className="text-xl font-bold text-[#0f294d]">4. Pricing & Payments</h3>
                                            <p>Prices are dynamic. Payments are secure. Sensitive card data is never stored locally.</p>
                                        </div>

                                        <div className="space-y-4">
                                            <h3 className="text-xl font-bold text-[#0f294d]">5. Modifications and Cancellations</h3>
                                            <p>Governed by our Cancellation & Refund Policy detailed in the next section.</p>
                                        </div>

                                        <div className="space-y-4">
                                            <h3 className="text-xl font-bold text-[#0f294d]">6. Third-Party OTA Platforms</h3>
                                            <p>Bookings made via OTAs (Booking.com, MMT, Yatra, etc.) follow their specific terms and cancellation rules.</p>
                                        </div>

                                        <div className="space-y-4">
                                            <h3 className="text-xl font-bold text-[#0f294d]">7. Limitation of Liability</h3>
                                            <p>UrbanHost is not liable for loss of belongings, natural event disruptions, or third-party gateaway failures. Liability is limited to booking amount paid.</p>
                                        </div>

                                        <div className="space-y-4">
                                            <h3 className="text-xl font-bold text-[#0f294d]">8. Intellectual Property</h3>
                                            <p>The Logo, brand name, text, and designs are property of Kuber Hoteliers & URBANHOST.</p>
                                        </div>

                                        <div className="space-y-4">
                                            <h3 className="text-xl font-bold text-[#0f294d]">9. Governing Law</h3>
                                            <p>Governed by laws of India. Disputes shall fall under the jurisdiction of local Courts.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* 3. CANCELLATION & REFUND POLICY */}
                                <div id="refund" className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-gray-100 scroll-mt-32">
                                    <h2 className="text-3xl font-black text-[#0f294d] mb-6">Cancellation & Refund Policy</h2>
                                    <p className="font-bold text-lg text-blue-600 mb-8">URBANHOST (Kuber Hoteliers & Management Services Pvt. Ltd.)</p>

                                    <div className="prose prose-blue max-w-none space-y-12">
                                        <div>
                                            <h3 className="text-xl font-bold text-[#0f294d] mb-6">1. Cancellation by Guest</h3>
                                            <div className="grid md:grid-cols-2 gap-6">
                                                <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100">
                                                    <h4 className="font-bold text-blue-900 mb-4">Standard Bookings</h4>
                                                    <div className="space-y-3 font-medium text-sm">
                                                        <p className="flex justify-between"><span>Before 48h check-in:</span> <span className="text-green-700 font-black">Full Refund</span></p>
                                                        <p className="flex justify-between border-t border-blue-100 pt-3"><span>Within 48h:</span> <span className="text-red-700">1-Night Charge</span></p>
                                                        <p className="flex justify-between border-t border-blue-100 pt-3 opacity-60"><span>No-show:</span> <span>No Refund</span></p>
                                                    </div>
                                                </div>
                                                <div className="p-6 bg-orange-50/30 rounded-2xl border border-orange-100">
                                                    <h4 className="font-bold text-orange-900 mb-4">Non-Refundable</h4>
                                                    <p className="text-sm font-medium">Certain discounted bookings are strictly non-refundable once confirmed.</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-8 text-sm">
                                            <div>
                                                <h4 className="font-bold text-gray-900 mb-2">2. Refund Processing</h4>
                                                <p>Eligible refunds take 7–14 working days. Credited back to original payment method.</p>
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900 mb-2">3. Modification Requests</h4>
                                                <p>Date or guest modifications are subject to availability, price differences, and approval.</p>
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900 mb-2">4. Cancellation by URBANHOST</h4>
                                                <p>In cases of operational issues or force majeure, full refund will be provided.</p>
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900 mb-2">5. OTA Bookings</h4>
                                                <p>Bookings made via Booking.com, MMT, Yatra etc. are governed by their own policies.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* 4. COOKIE POLICY */}
                                <div id="cookies" className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-gray-100 scroll-mt-32">
                                    <h2 className="text-3xl font-black text-[#0f294d] mb-6">Cookie Policy</h2>
                                    <p className="font-bold text-lg text-blue-600 mb-8">URBANHOST (A Brand of Kuber Hoteliers & Management Services Pvt. Ltd.)</p>

                                    <div className="prose prose-blue max-w-none space-y-10">
                                        <div>
                                            <h3 className="text-xl font-bold text-[#0f294d] mb-4">1. What Are Cookies?</h3>
                                            <p>Small files stored on your device that help remember preferences and improve service speed.</p>
                                        </div>

                                        <div>
                                            <h3 className="text-xl font-bold text-[#0f294d] mb-6">2. Cookies We Use</h3>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                {[
                                                    { t: "Essential", d: "Site core functions" },
                                                    { t: "Performance", d: "Traffic analytics" },
                                                    { t: "Preference", d: "User settings" },
                                                    { t: "Marketing", d: "Personalized deals" }
                                                ].map(item => (
                                                    <div key={item.t} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-center">
                                                        <p className="font-black text-xs mb-1">{item.t}</p>
                                                        <p className="text-[10px] opacity-60 font-medium leading-tight">{item.d}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-8">
                                            <div>
                                                <h3 className="text-xl font-bold text-[#0f294d] mb-4">3. Managing Cookies</h3>
                                                <p className="text-sm">You can disable cookies in your browser, though some features might not work as intended.</p>
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-[#0f294d] mb-4">4. Third Parties</h3>
                                                <p className="text-sm">We use tools like Google Analytics and payment security cookies from trusted partners.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Summary Ending */}
                                <div className="text-center bg-blue-900 rounded-[2.5rem] p-12 text-white shadow-2xl">
                                    <p className="text-sm opacity-60 uppercase tracking-widest font-black mb-4">Agreement</p>
                                    <p className="text-lg font-medium leading-relaxed max-w-2xl mx-auto">
                                        All bookings are subject to availability and confirmation. URBANHOST is not responsible for third-party OTA policies, payment gateway delays, or external service disruptions. By using this website, you agree to our Privacy Policy, Terms & Conditions, Cancellation & Refund Policy, and Cookie Policy.
                                    </p>
                                    <p className="mt-10 pt-8 border-t border-white/10 text-xs italic opacity-60">
                                        © 2026 URBANHOST | Kuber Hoteliers & Management Services Pvt. Ltd.
                                    </p>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
