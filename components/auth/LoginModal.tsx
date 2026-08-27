"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ArrowRight, Mail, Lock, CheckCircle2, ShieldCheck } from "lucide-react";
import { signIn } from "next-auth/react";
import Link from 'next/link';
import Image from "next/image";

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type AuthStep = "EMAIL_INPUT" | "OTP_VERIFY" | "PASSWORD_INPUT" | "SUCCESS";

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
    const [step, setStep] = useState<AuthStep>("EMAIL_INPUT");
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [resendCooldown, setResendCooldown] = useState(0);

    const handleSendEmailOtp = async (targetEmail?: string) => {
        const emailToSend = targetEmail || email;
        if (!emailToSend || !emailToSend.includes("@")) {
            setError("Please enter a valid email address");
            return;
        }
        setIsLoading(true);
        setError("");
        try {
            const res = await fetch("/api/auth/otp/email/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: emailToSend.trim().toLowerCase() }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to send verification code");

            setStep("OTP_VERIFY");
            setResendCooldown(60);
            const interval = setInterval(() => {
                setResendCooldown((prev) => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (inputOtp?: string) => {
        const otpToVerify = inputOtp || otp;
        if (!otpToVerify || otpToVerify.length < 6) {
            setError("Please enter a valid 6-digit code");
            return;
        }
        setIsLoading(true);
        setError("");
        try {
            const res = await signIn("email-otp", {
                email: email.trim().toLowerCase(),
                otp: otpToVerify.trim(),
                redirect: false,
            });

            if (res?.error) {
                setError(res.error || "Invalid or expired verification code");
                setIsLoading(false);
                return;
            }

            setStep("SUCCESS");
            setTimeout(() => {
                onClose();
                window.location.reload();
            }, 1200);
        } catch (err: any) {
            setError(err.message || "Failed to verify code");
            setIsLoading(false);
        }
    };

    const handlePasswordLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!password) {
            setError("Please enter your password");
            return;
        }
        setIsLoading(true);
        setError("");
        try {
            const res = await signIn("credentials", {
                email: email.trim().toLowerCase(),
                password,
                redirect: false,
            });

            if (res?.error) {
                setError("Invalid email or password");
                setIsLoading(false);
                return;
            }

            setStep("SUCCESS");
            setTimeout(() => {
                onClose();
                window.location.reload();
            }, 1200);
        } catch (err: any) {
            setError("Failed to sign in");
            setIsLoading(false);
        }
    };

    const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/\D/g, '').slice(0, 6);
        setOtp(val);
        if (val.length === 6) {
            handleVerifyOtp(val);
        }
    };

    const handleGoogleSignIn = () => {
        signIn("google", { callbackUrl: "/" });
    };

    const resetModal = () => {
        setStep("EMAIL_INPUT");
        setEmail("");
        setOtp("");
        setPassword("");
        setError("");
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={resetModal}>
            <DialogContent className="sm:max-w-md w-[95%] rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
                <DialogHeader className="sr-only">
                    <DialogTitle>Sign in to StayNTour</DialogTitle>
                </DialogHeader>

                <div className="bg-gradient-to-br from-[#1E3A8A] to-[#1E40AF] p-8 text-center text-white flex flex-col items-center">
                    <div className="flex items-center justify-center mb-3">
                        <Image
                            src="/logo_name.png"
                            alt="StayNTour"
                            width={190}
                            height={54}
                            className="h-11 w-auto object-contain brightness-0 invert"
                            quality={100}
                            unoptimized
                        />
                    </div>
                    <p className="text-blue-100 text-sm">Experience luxury stays & memorable trips across the USA</p>
                </div>

                <div className="p-8">
                    {step === "EMAIL_INPUT" && (
                        <div className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Email Address</label>
                                <div className="relative">
                                    <Mail className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                    <Input
                                        type="email"
                                        placeholder="name@example.com"
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            setError("");
                                        }}
                                        onKeyDown={(e) => e.key === "Enter" && handleSendEmailOtp()}
                                        className="h-12 pl-11 text-base rounded-xl border-gray-200 focus:border-blue-600 focus:ring-blue-600 font-medium"
                                        autoFocus
                                    />
                                </div>
                            </div>

                            {error && <p className="text-red-500 text-xs font-medium bg-red-50 p-2.5 rounded-lg border border-red-100">{error}</p>}

                            <Button
                                onClick={() => handleSendEmailOtp()}
                                disabled={isLoading}
                                className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-600/20 text-base"
                            >
                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Continue with Email OTP"}
                            </Button>

                            <div className="flex items-center justify-between text-xs pt-1">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setError("");
                                        setStep("PASSWORD_INPUT");
                                    }}
                                    className="text-blue-600 hover:underline font-semibold"
                                >
                                    Sign in with Password
                                </button>
                                <Link href="/signup" onClick={onClose} className="text-gray-500 hover:text-gray-800 font-medium">
                                    Create an account
                                </Link>
                            </div>

                            <div className="relative flex py-2 items-center">
                                <div className="flex-grow border-t border-gray-100"></div>
                                <span className="flex-shrink mx-4 text-gray-400 text-xs font-medium uppercase tracking-wider">or</span>
                                <div className="flex-grow border-t border-gray-100"></div>
                            </div>

                            <button
                                type="button"
                                onClick={handleGoogleSignIn}
                                className="w-full h-12 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 active:bg-gray-100 flex items-center justify-center gap-3 font-semibold text-gray-800 hover:text-gray-900 cursor-pointer shadow-sm transition-colors duration-150"
                            >
                                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                                </svg>
                                <span>Continue with Google</span>
                            </button>

                            <div className="pt-2 text-center">
                                <Link
                                    href="/partner/login"
                                    onClick={onClose}
                                    className="text-xs text-gray-500 hover:text-blue-600 font-semibold transition-colors"
                                >
                                    Login as Admin or Partner Portal →
                                </Link>
                            </div>
                        </div>
                    )}

                    {step === "PASSWORD_INPUT" && (
                        <form onSubmit={handlePasswordLogin} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Email Address</label>
                                <Input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="h-12 text-base rounded-xl border-gray-200"
                                    placeholder="name@example.com"
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Password</label>
                                    <Link href="/forgot-password" onClick={onClose} className="text-xs text-blue-600 hover:underline">
                                        Forgot?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <Lock className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                    <Input
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            setError("");
                                        }}
                                        className="h-12 pl-11 text-base rounded-xl border-gray-200"
                                        autoFocus
                                    />
                                </div>
                            </div>

                            {error && <p className="text-red-500 text-xs font-medium bg-red-50 p-2.5 rounded-lg border border-red-100">{error}</p>}

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-600/20 text-base"
                            >
                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
                            </Button>

                            <div className="text-center pt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setError("");
                                        setStep("EMAIL_INPUT");
                                    }}
                                    className="text-xs text-gray-500 hover:text-blue-600 font-semibold"
                                >
                                    ← Back to Email OTP
                                </button>
                            </div>
                        </form>
                    )}

                    {step === "OTP_VERIFY" && (
                        <div className="space-y-6">
                            <div className="text-center space-y-1">
                                <div className="inline-flex p-3 rounded-full bg-blue-50 text-blue-600 mb-2">
                                    <ShieldCheck className="w-6 h-6" />
                                </div>
                                <h3 className="font-bold text-gray-900 text-lg">Check Your Email</h3>
                                <p className="text-xs text-gray-500">
                                    We sent a 6-digit code to <span className="font-bold text-gray-700">{email}</span>
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Input
                                    type="text"
                                    maxLength={6}
                                    placeholder="• • • • • •"
                                    value={otp}
                                    onChange={handleOtpChange}
                                    className="h-14 text-center tracking-[0.6em] text-2xl font-bold rounded-xl border-gray-200 focus:border-blue-600"
                                    autoFocus
                                />
                            </div>

                            {error && <p className="text-red-500 text-xs font-medium bg-red-50 p-2.5 rounded-lg border border-red-100">{error}</p>}

                            <Button
                                onClick={() => handleVerifyOtp()}
                                disabled={isLoading || otp.length < 6}
                                className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-600/20 text-base"
                            >
                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify & Sign In"}
                            </Button>

                            <div className="flex items-center justify-between text-xs pt-1">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setError("");
                                        setStep("EMAIL_INPUT");
                                    }}
                                    className="text-gray-500 hover:text-gray-800"
                                >
                                    Change Email
                                </button>
                                <button
                                    type="button"
                                    disabled={resendCooldown > 0 || isLoading}
                                    onClick={() => handleSendEmailOtp()}
                                    className="text-blue-600 font-semibold hover:underline disabled:opacity-50"
                                >
                                    {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : "Resend Code"}
                                </button>
                            </div>
                        </div>
                    )}

                    {step === "SUCCESS" && (
                        <div className="py-8 flex flex-col items-center justify-center space-y-3 text-center animate-in fade-in zoom-in duration-300">
                            <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center text-green-600 mb-2">
                                <CheckCircle2 className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Welcome to StayNTour!</h3>
                            <p className="text-sm text-gray-500">Signing you in securely...</p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
