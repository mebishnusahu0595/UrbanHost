"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import {
    FiMapPin,
    FiPhone,
    FiMail,
    FiShare2,
} from "react-icons/fi";
import { FaYoutube, FaGlobe } from "react-icons/fa";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: ""
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(true);
                setFormData({ name: "", email: "", subject: "", message: "" });
            } else {
                setError(data.error || "Something went wrong. Please try again.");
            }
        } catch (err) {
            setError("Failed to send message. Please check your connection.");
        } finally {
            setLoading(false);
        }
    };


    const handleShare = async () => {
        try {
            if (typeof navigator !== 'undefined' && navigator.share) {
                await navigator.share({
                    title: "Urban Host - Contact Us",
                    text: "Get in touch with Urban Host for 24/7 support and partnership inquiries.",
                    url: window.location.href,
                });
            } else {
                throw new Error("Web Share not supported");
            }
        } catch (error) {
            // Fallback to clipboard
            try {
                if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
                    await navigator.clipboard.writeText(window.location.href);
                    alert("Link copied to clipboard!");
                } else {
                    // Fallback for insecure contexts (HTTP)
                    const textArea = document.createElement("textarea");
                    textArea.value = window.location.href;
                    document.body.appendChild(textArea);
                    textArea.select();
                    try {
                        document.execCommand('copy');
                        alert("Link copied to clipboard!");
                    } catch (e) {
                        console.error("Copy failed", e);
                        alert("Unable to copy link");
                    }
                    document.body.removeChild(textArea);
                }
            } catch (err) {
                console.error("Share failed", err);
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Contact Section */}
            <div className="max-w-7xl mx-auto px-6 py-12">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-3">Contact Us</h1>
                    <p className="text-gray-600 max-w-2xl">
                        Have a question about a booking or want to partner with us? Our team is here
                        to help you 24/7. Reach out via the form below or find our office details.
                    </p>
                </div>

                {/* Contact Form and Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
                    {/* Contact Form */}
                    <div className="bg-white rounded-lg p-8 shadow-sm">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a message</h2>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Full Name
                                    </label>
                                    <Input
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="John Doe"
                                        className="bg-gray-50 border-gray-200"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email Address
                                    </label>
                                    <Input
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="john@example.com"
                                        type="email"
                                        className="bg-gray-50 border-gray-200"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Subject
                                </label>
                                <Input
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="How can we help?"
                                    className="bg-gray-50 border-gray-200"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Message
                                </label>
                                <Textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Tell us more about your inquiry..."
                                    rows={6}
                                    className="bg-gray-50 border-gray-200 resize-none"
                                />
                            </div>

                            {error && <p className="text-red-500 text-sm">{error}</p>}
                            {success && <p className="text-green-600 text-sm font-medium">Message sent successfully!</p>}

                            <Button
                                type="submit"
                                disabled={loading}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-md w-full md:w-auto flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Sending...
                                    </>
                                ) : "Send Message"}
                            </Button>
                        </form>
                    </div>

                    {/* Get in Touch */}
                    <div className="bg-blue-50 rounded-lg p-8 shadow-sm">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Get in Touch</h2>

                        <div className="space-y-6">
                            <ContactInfo
                                icon={<FiPhone className="w-5 h-5" />}
                                title="Phone Support"
                                lines={[
                                    "+1 (555) 000-1111",
                                    "Available 24/7 for guest support",
                                ]}
                                highlight
                            />

                            <ContactInfo
                                icon={<FiMail className="w-5 h-5" />}
                                title="Email Us"
                                lines={[
                                    "kuberhoteliers@gmail.com",
                                ]}
                            />

                            <div className="pt-4 border-t border-gray-200">
                                <p className="font-semibold text-gray-900 mb-3">Follow Us</p>
                                <div className="flex gap-3">
                                    <SocialIcon icon={<FiShare2 className="w-4 h-4" />} onClick={handleShare} />
                                    <SocialIcon icon={<FaYoutube className="w-4 h-4" />} href="https://youtube.com" />
                                    <SocialIcon icon={<FaGlobe className="w-4 h-4" />} href="https://urbanhost.com" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="bg-white rounded-lg p-10 shadow-sm">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold text-gray-900 mb-3">
                            Frequently Asked Questions
                        </h2>
                        <p className="text-gray-600">
                            Quick answers to the most common questions.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <FAQ
                            question="How do I cancel my reservation?"
                            answer="You can cancel through your dashboard under 'My Bookings'. Refund eligibility depends on the hotel's specific policy shown at checkout."
                        />
                        <FAQ
                            question="Where can I find my booking receipt?"
                            answer="Receipts are automatically emailed to you. You can also download them from the 'Billing' section in your account settings."
                        />
                        <FAQ
                            question="Can I modify my check-in time?"
                            answer="Early check-ins are subject to availability. We recommend messaging the host through the platform 24 hours before arrival."
                        />
                        <FAQ
                            question="Are there corporate discounts?"
                            answer="Yes! If you're booking for a company, please contact our partnerships team for special rates and consolidated billing."
                        />
                    </div>

                    <div className="text-center pt-4">
                        <p className="text-gray-600">
                            Still have questions?{" "}
                            <a href="#" className="text-blue-600 font-semibold hover:underline">
                                Visit our full Support Center
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ---------- helpers ---------- */

function ContactInfo({
    icon,
    title,
    lines,
    highlight,
}: {
    icon: React.ReactNode;
    title: string;
    lines: string[];
    highlight?: boolean;
}) {
    return (
        <div className="flex gap-4">
            <div className="h-12 w-12 rounded-lg bg-blue-600 text-white flex items-center justify-center flex-shrink-0">
                {icon}
            </div>
            <div>
                <p className="font-semibold text-gray-900 mb-1">{title}</p>
                {lines.map((line, i) => (
                    <p
                        key={i}
                        className={`text-sm ${highlight && i === 1
                            ? "text-blue-600 font-medium"
                            : "text-gray-600"
                            }`}
                    >
                        {line}
                    </p>
                ))}
            </div>
        </div>
    );
}

function SocialIcon({ icon, onClick, href }: { icon: React.ReactNode; onClick?: () => void; href?: string }) {
    const content = (
        <div
            onClick={onClick}
            className="h-10 w-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-blue-600 cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-colors"
        >
            {icon}
        </div>
    );

    if (href) {
        return <a href={href} target="_blank" rel="noopener noreferrer">{content}</a>;
    }

    return content;
}

function FAQ({
    question,
    answer,
}: {
    question: string;
    answer: string;
}) {
    return (
        <div className="bg-gray-50 rounded-lg p-6">
            <p className="font-semibold text-gray-900 mb-2">{question}</p>
            <p className="text-sm text-gray-600 leading-relaxed">
                {answer}
            </p>
        </div>
    );
}
