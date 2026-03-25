"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, Mail, Lock, ArrowLeft, Star } from "lucide-react";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState(0); // 0: Email, 1: Password
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email) {
      setError("Please enter your email");
      return;
    }
    setError("");
    setStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
        setLoading(false);
        return;
      }

      const response = await fetch('/api/auth/session');
      const session = await response.json();

      if (session?.user) {
        const userRole = (session.user as any).role;
        if (userRole === 'admin') router.push('/admin/dashboard');
        else if (userRole === 'propertyOwner') router.push('/property-owner/dashboard');
        else if (userRole === 'hotelOwner') router.push('/property-panel/dashboard');
        else if (userRole === 'receptionist') router.push('/receptionist/bookings');
        else router.push('/');
      } else {
        router.push('/');
      }

      router.refresh();
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/profile" });
  };

  return (
    <div className="h-screen overflow-hidden flex bg-white">
      {/* Left side - Login Form */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-20 relative">
        <div className="absolute top-8 left-8">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors">
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm font-semibold">Home</span>
          </Link>
        </div>

        <div className="max-w-md w-full mx-auto space-y-8">
          <div className="text-center">
            <Link href="/" className="inline-flex items-center mb-6">
              <Image
                src="/list_property.png"
                alt="Urban Host Icon"
                width={60}
                height={60}
                className="h-16 w-auto"
                quality={100}
                unoptimized
              />
              <Image
                src="/logo_name.png"
                alt="Urban Host"
                width={300}
                height={80}
                className="h-28 w-auto -ml-3"
                quality={100}
                unoptimized
              />
            </Link>
            <h2 className="text-4xl font-black text-gray-900 tracking-tight">
              {step === 0 ? "Welcome back" : "Enter Password"}
            </h2>
            <p className="mt-3 text-gray-500 font-medium">
              {step === 0
                ? "Manage your hospitality business with ease."
                : `Logged in as ${formData.email}`}
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={step === 0 ? handleNext : handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-medium animate-in fade-in slide-in-from-top-1">
                {error}
              </div>
            )}

            <div className="space-y-4">
              {step === 0 ? (
                <div className="space-y-1 animate-in fade-in slide-in-from-right-4 duration-300">
                  <label htmlFor="email" className="block text-sm font-bold text-gray-700 ml-1">
                    Email address
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-[#1E3A8A] transition-colors" />
                    </div>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      className="pl-12 h-14 rounded-xl border-gray-200 focus:border-[#1E3A8A] focus:ring-[#1E3A8A] text-base"
                      placeholder="name@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-1 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="flex justify-between items-center ml-1">
                    <label htmlFor="password" className="block text-sm font-bold text-gray-700">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setStep(0)}
                      className="text-xs font-bold text-[#1E3A8A] hover:underline"
                    >
                      Change Email
                    </button>
                  </div>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-[#1E3A8A] transition-colors" />
                    </div>
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      className="pl-12 pr-12 h-14 rounded-xl border-gray-200 focus:border-[#1E3A8A] focus:ring-[#1E3A8A] text-base"
                      placeholder="••••••••"
                      value={formData.password}
                      autoFocus
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-4 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-[#1E3A8A] border-gray-300 rounded focus:ring-[#1E3A8A]"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm font-medium text-gray-600">
                  Keep me signed in
                </label>
              </div>
              {step === 1 && (
                <Link href="/forgot-password" className="text-sm font-bold text-[#1E3A8A] hover:text-[#1e40af]">
                  Forgot password?
                </Link>
              )}
            </div>

            <div className="space-y-4 pt-2">
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1E3A8A] hover:bg-[#1e40af] text-white h-14 rounded-xl text-lg font-bold shadow-lg shadow-blue-100 transition-all active:scale-[0.98]"
              >
                {step === 0 ? "Next" : (loading ? "Verifying..." : "Sign in")}
              </Button>

              {step === 0 && (
                <>
                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100" /></div>
                    <div className="relative flex justify-center text-xs uppercase font-black tracking-widest text-gray-400">
                      <span className="px-3 bg-white">Trusted Partners</span>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGoogleSignIn}
                    className="w-full h-14 rounded-xl text-base font-bold border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Continue with Google
                  </Button>
                </>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Right side - Premium Branding */}
      <div className="hidden lg:flex lg:flex-1 bg-[#1E3A8A] relative overflow-hidden">
        {/* Animated background patterns */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 -left-20 w-80 h-80 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-pulse" />
          <div className="absolute bottom-0 -right-20 w-96 h-96 bg-blue-400 rounded-full mix-blend-overlay filter blur-3xl" />
        </div>

        <div className="relative z-10 w-full flex items-center justify-center p-20">
          <div className="max-w-md text-white space-y-10">
            <Badge className="bg-white/10 text-white border-white/20 px-4 py-1.5 backdrop-blur-md text-sm font-bold uppercase tracking-widest rounded-full">
              Partner with the Best
            </Badge>
            <div className="space-y-4">
              <h1 className="text-6xl font-black leading-tight tracking-tighter">
                Grow your <span className="text-blue-300 italic">vision</span> with us.
              </h1>
              <p className="text-xl text-blue-100 font-medium leading-relaxed opacity-90">
                Join 10,000+ happy property owners who are scaling their business globally.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-8 py-6">
              <div className="space-y-1">
                <p className="text-4xl font-black">₹0</p>
                <p className="text-xs font-black uppercase tracking-widest text-blue-300">Listing Fee</p>
              </div>
              <div className="space-y-1">
                <p className="text-4xl font-black">24/7</p>
                <p className="text-xs font-black uppercase tracking-widest text-blue-300">Host Support</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 italic text-blue-50 text-sm">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-[#1E3A8A] bg-blue-400 flex items-center justify-center text-[10px] font-bold">U{i}</div>
                ))}
              </div>
              "Urban Host doubled my occupancy rate in 3 months!"
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
