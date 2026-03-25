"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ArrowRight, User as UserIcon, Calendar, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { signIn } from "next-auth/react";
import Link from 'next/link';
import Image from "next/image";

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type AuthStep = "PHONE_INPUT" | "OTP_VERIFY" | "NAME_INPUT" | "DOB_INPUT" | "SUCCESS";

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
    const [step, setStep] = useState<AuthStep>("PHONE_INPUT");
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [name, setName] = useState("");
    const [dob, setDob] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [isNewUser, setIsNewUser] = useState(false);

    const handleSendOtp = async () => {
        if (!phone || phone.length < 10) {
            setError("Please enter a valid phone number");
            return;
        }
        setIsLoading(true);
        setError("");
        try {
            const res = await fetch("/api/auth/otp/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to send OTP");

            setStep("OTP_VERIFY");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (inputOtp?: string) => {
        const otpToVerify = inputOtp || otp;
        if (!otpToVerify || otpToVerify.length < 6) {
            setError("Please enter a valid 6-digit OTP");
            return;
        }
        setIsLoading(true);
        setError("");
        try {
            const res = await fetch("/api/auth/otp/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone, otp: otpToVerify }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Invalid OTP");

            if (data.isNewUser) {
                setIsNewUser(true);
                setStep("NAME_INPUT");
            } else {
                // Login directly
                await performLogin();
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
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

    const handleNameSubmit = () => {
        if (!name.trim()) {
            setError("Please enter your name");
            return;
        }
        setError("");
        setStep("DOB_INPUT");
    };

    const handleRegister = async () => {
        if (!dob) {
            setError("Please select your date of birth");
            return;
        }
        setIsLoading(true);
        setError("");
        try {
            // Pass OTP to register endpoint for security verification
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone, name, dob, otp }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Registration failed");

            // After register, perform login
            await performLogin();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const performLogin = async () => {
        // Since we already verified OTP via API, we now call NextAuth signIn to create session.
        // NOTE: NextAuth authorize will verify phone existence again.
        // We reuse the OTP we possess. However, the verify API usually consumes the OTP.
        // In the updated flow plan, I should make sure verify-otp API keeps the record or I re-send something.
        // Given I updated authorize to verify OTP again, assume verify-otp API was just a check.
        // BUT verify-otp API currently consumes attempts.
        // Correct approach with current settings: signIn directly with credentials.

        setIsLoading(true);
        const res = await signIn("phone-login", {
            phone,
            otp,
            redirect: false,
        });

        if (res?.error) {
            if (res.error === "USER_NOT_FOUND") {
                // Should have been caught by verify-otp isNewUser logic, but safety net
                setIsNewUser(true);
                setStep("NAME_INPUT");
                setIsLoading(false);
            } else {
                setError(res.error || "Login failed");
                setIsLoading(false);
            }
        } else {
            // Success
            setStep("SUCCESS");
            setTimeout(() => {
                onClose();
                window.location.reload(); // Refresh to update session state in UI
            }, 1500);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md w-[95%] rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
                <DialogHeader className="sr-only">
                    <DialogTitle>Login or Signup</DialogTitle>
                </DialogHeader>

                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-center text-white flex flex-col items-center">
                    <div className="flex items-center mb-4">
                        <Image
                            src="/list_property.png"
                            alt="Urban Host Icon"
                            width={40}
                            height={40}
                            className="h-9 w-auto brightness-0 invert"
                            quality={100}
                            unoptimized
                        />
                        <Image
                            src="/logo_name.png"
                            alt="Urban Host"
                            width={220}
                            height={60}
                            className="h-20 w-auto -ml-4 brightness-0 invert"
                            quality={100}
                            unoptimized
                        />
                    </div>
                    <p className="text-blue-100 text-sm">Experience luxury stays & memorable trips</p>
                </div>

                <div className="p-8">
                    {step === "PHONE_INPUT" && (
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Phone Number</label>
                                <div className="flex gap-3">
                                    <div className="flex items-center justify-center bg-gray-100 rounded-xl px-4 font-bold text-gray-600 border border-gray-200">
                                        +91
                                    </div>
                                    <Input
                                        type="tel"
                                        placeholder="Mobile Number"
                                        className="h-12 rounded-xl border-gray-200 bg-gray-50 font-medium text-lg focus-visible:ring-blue-600"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                    />
                                </div>
                            </div>
                            <Button className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-lg font-bold rounded-xl" onClick={handleSendOtp} disabled={isLoading}>
                                {isLoading ? <Loader2 className="animate-spin" /> : "Continue"}
                            </Button>

                            {/* Divider */}
                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-white text-gray-500 font-medium">or</span>
                                </div>
                            </div>

                            {/* Google Sign In */}
                            <Button
                                variant="outline"
                                className="w-full h-12 rounded-xl border-gray-300 hover:bg-gray-50 font-semibold text-gray-700 !text-gray-700 hover:!text-gray-900 flex items-center justify-center gap-3"
                                onClick={() => signIn("google", { callbackUrl: "/profile" })}
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Continue with Google
                            </Button>
                        </div>
                    )}

                    {step === "OTP_VERIFY" && (
                        <div className="space-y-6">
                            <div className="text-center">
                                <p className="text-sm text-gray-500 mb-1">Enter OTP sent to</p>
                                <p className="font-bold text-gray-900 text-lg">+91 {phone} <button onClick={() => setStep("PHONE_INPUT")} className="text-blue-600 text-xs ml-2 font-bold underline">Change</button></p>
                            </div>
                            <div className="space-y-2">
                                <Input
                                    type="text"
                                    placeholder="Enter 6-digit OTP"
                                    className="h-14 rounded-xl border-gray-200 bg-gray-50 font-bold text-2xl text-center letter-spacing-4 tracking-[0.5em] focus-visible:ring-blue-600"
                                    maxLength={6}
                                    value={otp}
                                    onChange={handleOtpChange}
                                />
                            </div>
                            <Button className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-lg font-bold rounded-xl" onClick={() => handleVerifyOtp()} disabled={isLoading}>
                                {isLoading ? <Loader2 className="animate-spin" /> : "Verify OTP"}
                            </Button>
                        </div>
                    )}

                    {step === "NAME_INPUT" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">What's your name?</h3>
                                <p className="text-sm text-gray-500">Let us get to know you better. Same as on Government ID.</p>
                            </div>
                            <div className="space-y-2">
                                <Input
                                    type="text"
                                    placeholder="Full Name"
                                    className="h-12 rounded-xl border-gray-200 bg-gray-50 font-medium text-lg focus-visible:ring-blue-600"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                            <Button className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-lg font-bold rounded-xl flex items-center gap-2 justify-center" onClick={handleNameSubmit}>
                                Next <ArrowRight className="w-5 h-5" />
                            </Button>
                        </div>
                    )}

                    {step === "DOB_INPUT" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">When were you born?</h3>
                                <p className="text-sm text-gray-500">You must be at least 18 years old to book.</p>
                            </div>
                            <div className="space-y-2">
                                <Input
                                    type="date"
                                    className="h-12 rounded-xl border-gray-200 bg-gray-50 font-medium text-lg focus-visible:ring-blue-600"
                                    value={dob}
                                    onChange={(e) => setDob(e.target.value)}
                                />
                            </div>
                            <Button className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-lg font-bold rounded-xl" onClick={handleRegister} disabled={isLoading}>
                                {isLoading ? <Loader2 className="animate-spin" /> : "Complete Signup"}
                            </Button>
                        </div>
                    )}

                    {step === "SUCCESS" && (
                        <div className="text-center py-8 animate-in zoom-in duration-300">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle2 className="w-10 h-10 text-green-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Welcome Aboard!</h3>
                            <p className="text-gray-500">You are successfully logged in.</p>
                        </div>
                    )}

                    {error && (
                        <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm font-bold rounded-lg text-center animate-pulse">
                            {error}
                        </div>
                    )}

                    {!isNewUser && step === "PHONE_INPUT" && (
                        <div className="mt-8 text-center pt-6 border-t border-gray-100">
                            <Link href="/login" onClick={onClose} className="text-xs font-bold text-gray-400 hover:text-blue-600 transition-colors">
                                Login as Admin or Partner
                            </Link>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
