"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ArrowLeft, Mail, Lock, ShieldCheck, CheckCircle2 } from "lucide-react";
import Image from "next/image";

type ResetStep = "EMAIL" | "OTP" | "NEW_PASSWORD" | "SUCCESS";

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [step, setStep] = useState<ResetStep>("EMAIL");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            setError("Please enter your email");
            return;
        }
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/auth/forgot-password/send-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to send OTP");

            setStep("OTP");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtpStep = (e: React.FormEvent) => {
        e.preventDefault();
        if (otp.length !== 6) {
            setError("Please enter a valid 6-digit OTP");
            return;
        }
        setError("");
        setStep("NEW_PASSWORD");
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        if (newPassword.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/auth/forgot-password/reset", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp, newPassword }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Reset failed");

            setStep("SUCCESS");
            setTimeout(() => {
                router.push("/login");
            }, 3000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-gray-50 items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Logo & Header */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center mb-6">
                        <Image
                            src="/list_property.png"
                            alt="Urban Host Icon"
                            width={50}
                            height={50}
                            className="h-12 w-auto"
                            quality={100}
                        />
                        <Image
                            src="/logo_name.png"
                            alt="Urban Host"
                            width={200}
                            height={50}
                            className="h-20 w-auto -ml-3"
                            quality={100}
                        />
                    </Link>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                        Reset Password
                    </h1>
                    <p className="mt-2 text-gray-500 font-medium">
                        {step === "EMAIL" && "Enter your email to receive a reset code"}
                        {step === "OTP" && "Enter the 6-digit code sent to your email"}
                        {step === "NEW_PASSWORD" && "Create a secure new password"}
                        {step === "SUCCESS" && "Your password has been reset successfully"}
                    </p>
                </div>

                <div className="bg-white rounded-3xl shadow-xl shadow-blue-100/50 p-8 border border-gray-100 animate-in fade-in zoom-in duration-300">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-bold animate-pulse text-center">
                            {error}
                        </div>
                    )}

                    {step === "EMAIL" && (
                        <form onSubmit={handleSendOtp} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                                    </div>
                                    <Input
                                        type="email"
                                        placeholder="name@company.com"
                                        className="pl-12 h-14 rounded-2xl border-gray-100 bg-gray-50 focus:bg-white text-lg font-medium transition-all"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <Button className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-lg font-bold shadow-lg shadow-blue-100 group transition-all" disabled={loading}>
                                {loading ? <Loader2 className="animate-spin" /> : (
                                    <>
                                        Send Reset Code
                                        <ShieldCheck className="w-5 h-5 ml-2 group-hover:rotate-12 transition-transform" />
                                    </>
                                )}
                            </Button>
                        </form>
                    )}

                    {step === "OTP" && (
                        <form onSubmit={handleVerifyOtpStep} className="space-y-6">
                            <div className="space-y-2 text-center">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Verification Code</label>
                                <Input
                                    type="text"
                                    placeholder="000000"
                                    className="h-16 text-center text-3xl font-black tracking-[0.5em] rounded-2xl border-gray-100 bg-gray-50 focus:bg-white transition-all"
                                    maxLength={6}
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                                    required
                                />
                                <p className="text-sm text-gray-500 mt-2">Code sent to <span className="font-bold text-blue-600">{email}</span></p>
                            </div>
                            <Button className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-lg font-bold shadow-lg shadow-blue-100" type="submit">
                                Verify Code
                            </Button>
                        </form>
                    )}

                    {step === "NEW_PASSWORD" && (
                        <form onSubmit={handleResetPassword} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">New Password</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                                    </div>
                                    <Input
                                        type="password"
                                        placeholder="Min. 6 characters"
                                        className="pl-12 h-14 rounded-2xl border-gray-100 bg-gray-50 focus:bg-white text-lg font-medium transition-all"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Confirm Password</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                                    </div>
                                    <Input
                                        type="password"
                                        placeholder="Repeat your password"
                                        className="pl-12 h-14 rounded-2xl border-gray-100 bg-gray-50 focus:bg-white text-lg font-medium transition-all"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <Button className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-lg font-bold shadow-lg shadow-blue-100" disabled={loading}>
                                {loading ? <Loader2 className="animate-spin" /> : "Reset Property Access"}
                            </Button>
                        </form>
                    )}

                    {step === "SUCCESS" && (
                        <div className="text-center py-4">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle2 className="w-12 h-12 text-green-600" />
                            </div>
                            <h2 className="text-2xl font-black text-gray-900 mb-2">Success!</h2>
                            <p className="text-gray-500 font-medium mb-8">Your password has been updated. Redirecting to login...</p>
                            <Link href="/login" className="text-blue-600 font-bold hover:underline">
                                Click here if not redirected
                            </Link>
                        </div>
                    )}

                    {step !== "SUCCESS" && (
                        <div className="mt-8 text-center pt-6 border-t border-gray-100">
                            <Link href="/login" className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-blue-600 transition-colors">
                                <ArrowLeft className="w-4 h-4" />
                                Back to Login
                            </Link>
                        </div>
                    )}
                </div>

                {/* Footer Help */}
                <div className="mt-8 text-center">
                    <p className="text-sm text-gray-400 font-medium whitespace-pre-wrap">
                        Need assistance? Contact us at<br />
                        <span className="text-gray-600 font-bold">kuberhoteliers@gmail.com</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
