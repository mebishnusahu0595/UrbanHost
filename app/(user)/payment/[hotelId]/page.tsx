"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    ArrowLeft,
    CreditCard,
    Lock,
    MapPin,
    Check,
    Building2,
    ShieldCheck,
    Smartphone,
    CheckCircle2
} from "lucide-react";
import { useHotel } from "@/lib/hooks/useHotels";

const paymentSchema = z.object({
    cardNumber: z.string().min(15, "Valid 15-16 digit card number is required"),
    cardName: z.string().min(2, "Cardholder full name is required"),
    expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/?([0-9]{2})$/, "Enter MM/YY format"),
    cvv: z.string().min(3, "3 or 4 digit CVV/CVC required").max(4, "Max 4 digits"),
    zipCode: z.string().min(5, "5-digit billing ZIP is required").max(10, "Invalid ZIP code"),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

export default function PaymentPage() {
    const searchParams = useSearchParams();
    const params = useParams();
    const router = useRouter();
    const { data: session } = useSession();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<"card" | "applepay" | "property">("card");

    const hotelId = params.hotelId as string;
    const roomId = searchParams.get("room");
    const checkInDate = searchParams.get("from");
    const checkOutDate = searchParams.get("to");
    const guests = searchParams.get("adults") || "2";
    const roomsCount = searchParams.get("rooms") || "1";
    const specialRequests = searchParams.get("specialRequests") || "";

    const [guestDetails, setGuestDetails] = useState({
        name: "",
        email: "",
        phone: ""
    });

    // Coupon State
    const [couponCode, setCouponCode] = useState("");
    const [appliedCouponCode, setAppliedCouponCode] = useState("");
    const [discount, setDiscount] = useState(0);
    const [couponError, setCouponError] = useState("");
    const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

    useEffect(() => {
        if (session?.user) {
            setGuestDetails({
                name: session.user.name || "",
                email: session.user.email || "",
                phone: (session.user as any).phone || ""
            });
        }
    }, [session]);

    const nights = checkInDate && checkOutDate
        ? Math.max(1, Math.ceil((new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 60 * 60 * 24)))
        : 1;

    // Fetch real hotel data
    const { data: hotel, isLoading, error } = useHotel(hotelId);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<PaymentFormData>({
        resolver: zodResolver(paymentSchema),
        defaultValues: {
            zipCode: "10001",
        }
    });

    const selectedRoom = hotel?.rooms?.find((r: any) => r._id === roomId) || hotel?.rooms?.[0] || { type: "Standard Room", price: 0 };
    const roomPricePerNight = selectedRoom.price || 0;
    const basePrice = roomPricePerNight * nights * parseInt(roomsCount);
    // US Lodging & State Occupancy Tax (12%)
    const taxes = Math.round(basePrice * 0.12);
    const totalAmount = basePrice + taxes;
    const finalCharge = Math.max(0, totalAmount - discount);

    const handleCreateBooking = async (cardDetails?: { name?: string; last4?: string; methodLabel?: string }) => {
        setIsSubmitting(true);
        try {
            const chosenMethod = cardDetails?.methodLabel || (
                paymentMethod === "card"
                    ? `Credit Card **** ${cardDetails?.last4 || "4242"}`
                    : paymentMethod === "applepay"
                        ? "Apple Pay / Digital Wallet"
                        : "Pay at Property (Front Desk)"
            );

            // Create booking in database
            const response = await fetch("/api/bookings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    hotel: hotelId,
                    roomType: selectedRoom.type || selectedRoom.name || "Bed & Breakfast Suite",
                    checkInDate,
                    checkOutDate,
                    numberOfRooms: parseInt(roomsCount),
                    guests: {
                        adults: parseInt(guests),
                        children: 0
                    },
                    totalPrice: finalCharge,
                    discount: discount,
                    couponCode: appliedCouponCode,
                    specialRequests,
                    paymentMethod: chosenMethod,
                    status: paymentMethod === "property" ? "confirmed" : "confirmed",
                    guestInfo: {
                        name: guestDetails.name || session?.user?.name || cardDetails?.name || "Guest",
                        email: guestDetails.email || session?.user?.email || "guest@stayntour.com",
                        phone: guestDetails.phone || "+1 (555) 000-0000"
                    }
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to create reservation");
            }

            const bookingData = await response.json();
            router.push(`/confirmation/${bookingData.bookingId}`);
        } catch (err: any) {
            alert(err.message || "Reservation failed. Please try again.");
            setIsSubmitting(false);
        }
    };

    const onSubmit = async (data: PaymentFormData) => {
        const last4 = data.cardNumber.replace(/\D/g, "").slice(-4) || "4242";
        await handleCreateBooking({
            name: data.cardName,
            last4: last4,
            methodLabel: `Credit Card (Visa ending in ${last4})`
        });
    };

    const paymentMethods = [
        {
            id: "card",
            label: "Credit / Debit Card",
            subtext: "Visa, Mastercard, AMEX, Discover",
            icon: CreditCard,
        },
        {
            id: "applepay",
            label: "Apple Pay / Google Pay",
            subtext: "Express 1-Touch Checkout",
            icon: Smartphone,
        },
        {
            id: "property",
            label: "Pay at Property",
            subtext: "Reserve with $0 down, pay on arrival",
            icon: Building2,
        },
    ];

    const hotelImage = hotel?.images?.[0] || "/bnb-images/1822-bougainvillea-house.jpg";
    const hotelLocation = hotel?.address ? `${hotel.address.city}, ${hotel.address.state}` : "United States";

    const handleApplyCoupon = async () => {
        if (!couponCode) return;
        setIsApplyingCoupon(true);
        setCouponError("");
        try {
            const res = await fetch("/api/coupons/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code: couponCode, orderValue: totalAmount, hotelId })
            });
            const data = await res.json();
            if (data.success) {
                setDiscount(data.discount || 0);
                setAppliedCouponCode(data.couponCode);
                setCouponError("");
            } else {
                setDiscount(0);
                setAppliedCouponCode("");
                setCouponError(data.error || "Invalid coupon code");
            }
        } catch (e) {
            setCouponError("Failed to apply coupon");
        } finally {
            setIsApplyingCoupon(false);
        }
    };

    const handleRemoveCoupon = () => {
        setDiscount(0);
        setAppliedCouponCode("");
        setCouponCode("");
        setCouponError("");
    };

    // Loading & Error states
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error || !hotel) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Property Not Found</h2>
                <p className="text-gray-600 mb-6">We couldn't load the payment details for this property.</p>
                <Button onClick={() => router.push('/search')}>Browse All Stays</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] pt-8 pb-16">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Back Button */}
                <button
                    onClick={() => router.back()}
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 font-medium text-sm transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Property Details
                </button>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Review & Pay</h1>
                        <p className="text-sm text-gray-500 mt-1">Guaranteed Best Rates • Instant Confirmation</p>
                    </div>
                    <div className="flex items-center gap-2 px-3.5 py-1.5 bg-green-50 border border-green-200 rounded-full text-green-700 text-xs font-bold w-fit">
                        <ShieldCheck className="w-4 h-4 text-green-600" />
                        256-Bit SSL Encrypted
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Payment Form Column */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Guest Details */}
                        <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">1. Guest Information</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase tracking-wider text-gray-600">Full Name *</label>
                                    <Input
                                        placeholder="First & Last Name"
                                        value={guestDetails.name}
                                        onChange={(e) => setGuestDetails({ ...guestDetails, name: e.target.value })}
                                        className="h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase tracking-wider text-gray-600">Email Address *</label>
                                    <Input
                                        type="email"
                                        placeholder="name@example.com"
                                        value={guestDetails.email}
                                        onChange={(e) => setGuestDetails({ ...guestDetails, email: e.target.value })}
                                        className="h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white"
                                    />
                                </div>
                                <div className="space-y-1 sm:col-span-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-gray-600">Phone Number (US/International)</label>
                                    <Input
                                        type="tel"
                                        placeholder="+1 (555) 000-0000"
                                        value={guestDetails.phone}
                                        onChange={(e) => setGuestDetails({ ...guestDetails, phone: e.target.value })}
                                        className="h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Payment Method Selection */}
                        <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">2. Select Payment Method</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {paymentMethods.map((method) => {
                                    const isSelected = paymentMethod === method.id;
                                    return (
                                        <button
                                            key={method.id}
                                            type="button"
                                            onClick={() => setPaymentMethod(method.id as typeof paymentMethod)}
                                            className={`flex flex-col items-start p-4 rounded-2xl border-2 text-left transition-all relative ${isSelected
                                                ? "border-[#1E3A8A] bg-blue-50/50 shadow-md shadow-blue-900/5 ring-2 ring-blue-500/20"
                                                : "border-gray-200 hover:border-gray-300 bg-white"
                                                }`}
                                        >
                                            {isSelected && (
                                                <div className="absolute top-3 right-3">
                                                    <CheckCircle2 className="w-5 h-5 text-[#1E3A8A]" />
                                                </div>
                                            )}
                                            <div className={`p-2 rounded-xl mb-2 ${isSelected ? 'bg-[#1E3A8A] text-white' : 'bg-gray-100 text-gray-600'}`}>
                                                <method.icon className="w-5 h-5" />
                                            </div>
                                            <span className="font-bold text-gray-900 text-sm">{method.label}</span>
                                            <span className="text-xs text-gray-500 mt-0.5 leading-snug">{method.subtext}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Card Form */}
                        {paymentMethod === "card" && (
                            <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-gray-100 animate-in fade-in duration-300">
                                <div className="flex items-center justify-between mb-5">
                                    <h3 className="text-lg font-bold text-gray-900">Enter Credit / Debit Card</h3>
                                    <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                                        <span className="px-2 py-1 bg-gray-100 rounded">VISA</span>
                                        <span className="px-2 py-1 bg-gray-100 rounded">MC</span>
                                        <span className="px-2 py-1 bg-gray-100 rounded">AMEX</span>
                                        <span className="px-2 py-1 bg-gray-100 rounded">DISC</span>
                                    </div>
                                </div>

                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                                            Cardholder Name *
                                        </label>
                                        <Input
                                            {...register("cardName")}
                                            placeholder="Name as printed on card"
                                            className="h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white"
                                        />
                                        {errors.cardName && (
                                            <p className="text-red-500 text-xs mt-1">{errors.cardName.message}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                                            Card Number *
                                        </label>
                                        <div className="relative">
                                            <Input
                                                {...register("cardNumber")}
                                                placeholder="•••• •••• •••• ••••"
                                                className="h-11 rounded-xl pl-11 bg-gray-50 border-gray-200 focus:bg-white font-mono"
                                                maxLength={19}
                                            />
                                            <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        </div>
                                        {errors.cardNumber && (
                                            <p className="text-red-500 text-xs mt-1">{errors.cardNumber.message}</p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-3 gap-3">
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                                                Expires *
                                            </label>
                                            <Input
                                                {...register("expiryDate")}
                                                placeholder="MM/YY"
                                                className="h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white text-center font-mono"
                                                maxLength={5}
                                            />
                                            {errors.expiryDate && (
                                                <p className="text-red-500 text-xs mt-1">{errors.expiryDate.message}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                                                CVV / CVC *
                                            </label>
                                            <Input
                                                {...register("cvv")}
                                                type="password"
                                                placeholder="123"
                                                className="h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white text-center font-mono"
                                                maxLength={4}
                                            />
                                            {errors.cvv && (
                                                <p className="text-red-500 text-xs mt-1">{errors.cvv.message}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                                                Billing ZIP *
                                            </label>
                                            <Input
                                                {...register("zipCode")}
                                                placeholder="ZIP Code"
                                                className="h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white text-center font-mono"
                                                maxLength={10}
                                            />
                                            {errors.zipCode && (
                                                <p className="text-red-500 text-xs mt-1">{errors.zipCode.message}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2.5 p-3.5 bg-blue-50/70 border border-blue-100 rounded-2xl text-blue-900 text-xs mt-4">
                                        <Lock className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                        <span>Your card data is securely tokenized. We never store raw card numbers.</span>
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full bg-[#1E3A8A] hover:bg-[#1e40af] text-white rounded-2xl h-13 text-base font-bold shadow-lg shadow-blue-900/20 mt-4 transition-all"
                                    >
                                        {isSubmitting ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Authorizing Payment...
                                            </div>
                                        ) : (
                                            `Authorize & Pay $${finalCharge.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                        )}
                                    </Button>
                                </form>
                            </div>
                        )}

                        {/* Apple Pay / Digital Wallet */}
                        {paymentMethod === "applepay" && (
                            <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-gray-100 animate-in fade-in duration-300">
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Express Apple Pay / Google Pay</h3>
                                <p className="text-sm text-gray-500 mb-6">
                                    Instant 1-touch checkout with your device's default biometric authentication (Face ID / Touch ID).
                                </p>

                                <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200 text-center space-y-4">
                                    <div className="mx-auto w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center shadow-md">
                                        <Smartphone className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 text-base">Apple Pay / Google Wallet</p>
                                        <p className="text-xs text-gray-500 mt-1">Total to be charged: <strong className="text-gray-900">${finalCharge.toFixed(2)}</strong></p>
                                    </div>

                                    <Button
                                        onClick={() => handleCreateBooking({ methodLabel: "Apple Pay (Touch/Face ID)" })}
                                        disabled={isSubmitting}
                                        className="w-full max-w-sm mx-auto bg-black hover:bg-neutral-900 text-white rounded-2xl h-12 text-base font-bold shadow-md"
                                    >
                                        {isSubmitting ? "Connecting Wallet..." : " Pay with Apple Pay"}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Pay at Property */}
                        {paymentMethod === "property" && (
                            <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-gray-100 animate-in fade-in duration-300">
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Pay at the Property</h3>
                                <p className="text-sm text-gray-500 mb-6">
                                    Zero upfront charge today. Reserve your room now and pay directly at the front desk when you arrive.
                                </p>

                                <div className="space-y-3 p-5 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-emerald-900 text-sm">
                                    <div className="flex items-center gap-2 font-bold text-emerald-800">
                                        <Check className="w-4 h-4 text-emerald-600" />
                                        <span>$0.00 Due Right Now</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-emerald-700 text-xs">
                                        <Check className="w-4 h-4 text-emerald-600" />
                                        <span>Free Cancellation up to 24 hours before check-in</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-emerald-700 text-xs">
                                        <Check className="w-4 h-4 text-emerald-600" />
                                        <span>Pay with Credit Card, Debit Card, or Cash at check-in</span>
                                    </div>
                                </div>

                                <Button
                                    onClick={() => handleCreateBooking({ methodLabel: "Pay at Property (Front Desk)" })}
                                    disabled={isSubmitting}
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl h-13 text-base font-bold shadow-lg shadow-emerald-600/20 mt-6"
                                >
                                    {isSubmitting ? "Confirming Reservation..." : "Confirm Reservation ($0 Today)"}
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Order Summary Column */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                            {/* Hotel Info */}
                            <div className="flex gap-3.5 mb-6 pb-6 border-b border-gray-100">
                                <div className="relative w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 bg-gray-100">
                                    <Image
                                        src={hotelImage}
                                        alt={hotel.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <span className="text-[10px] font-black uppercase tracking-wider text-[#1E3A8A] block truncate">
                                        {selectedRoom.type || selectedRoom.name || "Bed & Breakfast"}
                                    </span>
                                    <h3 className="font-bold text-gray-900 text-base leading-tight truncate">
                                        {hotel.name}
                                    </h3>
                                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                        <MapPin className="w-3 h-3 flex-shrink-0 text-rose-500" />
                                        <span className="truncate">{hotelLocation}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Booking Dates Summary */}
                            <div className="bg-gray-50 rounded-2xl p-4 mb-5 space-y-2 border border-gray-100 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-gray-500 font-medium">Dates</span>
                                    <span className="font-bold text-gray-900">{checkInDate || "Jan 15"} → {checkOutDate || "Jan 16"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500 font-medium">Stay Duration</span>
                                    <span className="font-bold text-gray-900">{nights} {nights === 1 ? 'Night' : 'Nights'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500 font-medium">Guests & Rooms</span>
                                    <span className="font-bold text-gray-900">{guests} Guests, {roomsCount} Room</span>
                                </div>
                            </div>

                            {/* Coupon Section */}
                            <div className="mb-5 pb-5 border-b border-gray-100">
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">Have a promo code?</label>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="PROMO CODE"
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value)}
                                        disabled={!!appliedCouponCode}
                                        className="uppercase h-10 rounded-xl bg-gray-50 text-xs font-bold"
                                    />
                                    {appliedCouponCode ? (
                                        <Button variant="outline" size="sm" onClick={handleRemoveCoupon} type="button" className="rounded-xl text-xs h-10">Remove</Button>
                                    ) : (
                                        <Button size="sm" onClick={handleApplyCoupon} disabled={isApplyingCoupon || !couponCode} type="button" className="rounded-xl text-xs h-10 bg-[#1E3A8A]">
                                            {isApplyingCoupon ? "..." : "Apply"}
                                        </Button>
                                    )}
                                </div>
                                {couponError && <p className="text-red-500 text-xs mt-1.5">{couponError}</p>}
                                {appliedCouponCode && <p className="text-emerald-600 text-xs mt-1.5 font-bold">✓ Coupon {appliedCouponCode} applied!</p>}
                            </div>

                            {/* Transparent Price Breakdown */}
                            <div className="space-y-2.5 mb-5 text-sm">
                                <div className="flex justify-between text-gray-600">
                                    <span>Room Rate (${roomPricePerNight} × {nights}n × {roomsCount}r)</span>
                                    <span className="font-semibold text-gray-900">${basePrice.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>US Lodging & Occupancy Tax (12%)</span>
                                    <span className="font-semibold text-gray-900">${taxes.toFixed(2)}</span>
                                </div>
                                {discount > 0 && (
                                    <div className="flex justify-between text-sm bg-green-50 -mx-6 px-6 py-2">
                                        <span className="text-green-700 font-bold">Discount ({appliedCouponCode})</span>
                                        <span className="text-green-700 font-bold">-${discount.toFixed(2)}</span>
                                    </div>
                                )}
                            </div>

                            {/* Total Due */}
                            <div className="border-t border-gray-200 pt-4 mb-5">
                                <div className="flex justify-between items-baseline font-black text-gray-900">
                                    <span className="text-base">Total Final Price</span>
                                    <span className="text-2xl text-[#1E3A8A]">${finalCharge.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                                <p className="text-[11px] text-gray-400 mt-1">Includes all mandatory state & local lodging taxes</p>
                            </div>

                            {/* Trust Badges */}
                            <div className="pt-4 border-t border-gray-100 space-y-2 text-xs text-gray-500">
                                <div className="flex items-center gap-2">
                                    <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                                    <span>No hidden booking or service fees</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                                    <span>Free cancellation per property policy</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
