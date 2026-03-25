
"use client";

import { useState, useEffect, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ArrowRight, CheckCircle2, ShieldCheck, Mail } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";

function PartnerLoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [step, setStep] = useState<"email" | "otp">("email");
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const message = searchParams.get("message");
        if (message === "no_approved_property") {
            setError("Your property has not been approved yet. Please wait for admin approval or check your email for credentials.");
        } else if (message === "error") {
            setError("An error occurred. Please try logging in again.");
        }
    }, [searchParams]);

    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/otp/email/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to send OTP");
            }

            setStep("otp");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const result = await signIn("email-otp", {
                email,
                otp,
                redirect: false,
            });

            if (result?.error) {
                throw new Error(result.error);
            }

            // Redirect to the new Property Panel
            router.push("/property-panel/dashboard");
            router.refresh();
        } catch (err: any) {
            setError(err.message || "Invalid OTP");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen bg-gray-50 font-sans overflow-hidden">
            <Navbar />

            <div className="h-[calc(100vh-80px)] mt-20 flex flex-col md:flex-row">
                {/* Left Side - Hero/Branding */}
                <div className="hidden md:flex flex-1 bg-[#1E3A8A] text-white p-12 flex-col justify-between relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

                    <div className="relative z-10">
                        <h1 className="text-4xl font-bold mb-6">Grow your business with Urban Host</h1>
                        <p className="text-lg text-blue-100 max-w-md">
                            Join thousands of property owners who trust us to manage their listings and increase bookings.
                        </p>
                    </div>

                    <div className="relative z-10 space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="font-semibold text-lg">Secure & Reliable</div>
                                <div className="text-sm text-blue-200">Verified guests and secure payments</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                                <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="font-semibold text-lg">Easy Management</div>
                                <div className="text-sm text-blue-200">Real-time dashboard for all your needs</div>
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10 text-sm text-blue-300">
                        © {new Date().getFullYear()} Urban Host Inc.
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="flex-1 flex items-center justify-center p-6 md:p-12 bg-white">
                    <div className="w-full max-w-md space-y-8">
                        <div className="text-center md:text-left">
                            <h2 className="text-3xl font-bold text-gray-900">
                                {step === "email" ? "Partner Login / Sign Up" : "Verify Email"}
                            </h2>
                            <p className="mt-2 text-gray-600">
                                {step === "email"
                                    ? "Enter your email to access your property dashboard"
                                    : `We sent a 6-digit code to ${email}`
                                }
                            </p>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
                                <div className="mt-0.5">⚠️</div>
                                <div>{error}</div>
                            </div>
                        )}

                        {step === "email" ? (
                            <form onSubmit={handleSendOTP} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                        <Input
                                            type="email"
                                            placeholder="partner@example.com"
                                            className="pl-10 h-12 text-base"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-12 text-lg font-semibold bg-[#1E3A8A] hover:bg-[#1e40af]"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            Sending Code...
                                        </>
                                    ) : (
                                        "Continue"
                                    )}
                                </Button>
                            </form>
                        ) : (
                            <form onSubmit={handleVerifyOTP} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Enter Verification Code
                                    </label>
                                    <Input
                                        type="text"
                                        placeholder="123456"
                                        className="h-14 text-center text-2xl tracking-widest font-mono"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        maxLength={6}
                                        required
                                        autoFocus
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-12 text-lg font-semibold bg-[#1E3A8A] hover:bg-[#1e40af]"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            Verifying...
                                        </>
                                    ) : (
                                        "Verify & Login"
                                    )}
                                </Button>

                                <div className="text-center">
                                    <button
                                        type="button"
                                        onClick={() => setStep("email")}
                                        className="text-sm text-gray-500 hover:text-[#1E3A8A] underline"
                                    >
                                        Change Email
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function PartnerLogin() {
    return (
        <Suspense fallback={
            <div className="h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        }>
            <PartnerLoginForm />
        </Suspense>
    );
}
