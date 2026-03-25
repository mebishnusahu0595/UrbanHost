"use client";

import { useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
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
    Star,
    MapPin,
    Check,
    Wallet,
    Building2,
} from "lucide-react";

const paymentSchema = z.object({
    cardNumber: z.string().min(16, "Valid card number is required"),
    cardName: z.string().min(2, "Cardholder name is required"),
    expiryDate: z.string().regex(/^\d{2}\/\d{2}$/, "Enter MM/YY format"),
    cvv: z.string().min(3, "CVV is required"),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

import { useHotel } from "@/lib/hooks/useHotels";

export default function PaymentPage() {
    const searchParams = useSearchParams();
    const params = useParams();
    const router = useRouter();
    const { data: session } = useSession();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<"card" | "upi" | "netbanking">("card");

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
    });

    const handleCreateBooking = async (guestName?: string) => {
        setIsSubmitting(true);
        try {
            // Create booking in database
            const response = await fetch("/api/bookings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    hotel: hotelId,
                    roomType: selectedRoom.type,
                    checkInDate,
                    checkOutDate,
                    numberOfRooms: parseInt(roomsCount),
                    guests: {
                        adults: parseInt(guests),
                        children: 0
                    },
                    totalPrice: totalAmount - discount, // Apply discount to final price
                    discount: discount,
                    couponCode: appliedCouponCode,
                    specialRequests,
                    guestInfo: {
                        name: guestDetails.name || session?.user?.name || "Guest",
                        email: guestDetails.email || session?.user?.email || "user@example.com",
                        phone: guestDetails.phone || "N/A" // Use entered phone or N/A if not provided
                    }
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to create booking");
            }

            const bookingData = await response.json();
            router.push(`/confirmation/${bookingData.bookingId}`);
        } catch (err: any) {
            alert(err.message || "Payment failed. Please try again.");
            setIsSubmitting(false);
        }
    };

    const onSubmit = async (data: PaymentFormData) => {
        await handleCreateBooking(data.cardName);
    };

    const paymentMethods = [
        { id: "card", label: "Credit/Debit Card", icon: CreditCard },
        { id: "upi", label: "UPI", icon: Wallet },
        { id: "netbanking", label: "Net Banking", icon: Building2 },
    ];

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
                <Button onClick={() => router.push('/')}>Go Home</Button>
            </div>
        );
    }

    const selectedRoom = hotel.rooms?.find((r: any) => r._id === roomId) || hotel.rooms?.[0] || { type: "Standard Room", price: 0 };
    const roomPricePerNight = selectedRoom.price || 0;
    const basePrice = roomPricePerNight * nights * parseInt(roomsCount);
    const taxes = Math.round(basePrice * 0.12);
    const totalAmount = basePrice + taxes;

    const hotelImage = hotel.images?.[0] || "https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=400";
    const hotelLocation = hotel.address ? `${hotel.address.city}, ${hotel.address.state}` : "";

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
            console.log("Coupon API Response:", data); // Debug log
            if (data.success) {
                setDiscount(data.discount || 0);
                setAppliedCouponCode(data.couponCode);
                setCouponError("");
                console.log("Applied discount:", data.discount); // Debug log
            } else {
                setDiscount(0);
                setAppliedCouponCode("");
                setCouponError(data.error || "Invalid coupon");
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

    return (
        <div className="min-h-screen bg-gray-50 pt-8">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Back Button */}
                <button
                    onClick={() => router.back()}
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to booking details
                </button>

                <h1 className="text-3xl font-bold text-gray-900 mb-8">Payment</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Payment Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Guest Details */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Guest Details</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">Full Name</label>
                                    <Input
                                        placeholder="Full Name"
                                        value={guestDetails.name}
                                        onChange={(e) => setGuestDetails({ ...guestDetails, name: e.target.value })}
                                        className="rounded-xl"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">Email Address</label>
                                    <Input
                                        type="email"
                                        placeholder="Email Address"
                                        value={guestDetails.email}
                                        onChange={(e) => setGuestDetails({ ...guestDetails, email: e.target.value })}
                                        className="rounded-xl"
                                    />
                                </div>
                                <div className="space-y-1 md:col-span-2">
                                    <label className="text-sm font-medium text-gray-700">Phone Number (Required for confirmation)</label>
                                    <Input
                                        type="tel"
                                        placeholder="+91 12345 67890"
                                        value={guestDetails.phone}
                                        onChange={(e) => setGuestDetails({ ...guestDetails, phone: e.target.value })}
                                        className="rounded-xl"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Payment Method Selection */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment method</h2>
                            <div className="grid grid-cols-3 gap-3">
                                {paymentMethods.map((method) => (
                                    <button
                                        key={method.id}
                                        onClick={() => setPaymentMethod(method.id as typeof paymentMethod)}
                                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${paymentMethod === method.id
                                            ? "border-blue-500 bg-blue-50"
                                            : "border-gray-200 hover:border-gray-300"
                                            }`}
                                    >
                                        <method.icon
                                            className={`w-6 h-6 ${paymentMethod === method.id ? "text-blue-500" : "text-gray-500"
                                                }`}
                                        />
                                        <span
                                            className={`text-sm font-medium ${paymentMethod === method.id ? "text-blue-700" : "text-gray-700"
                                                }`}
                                        >
                                            {method.label}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Card Details */}
                        {paymentMethod === "card" && (
                            <div className="bg-white rounded-2xl p-6 shadow-sm">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Card details</h2>
                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                            Card number
                                        </label>
                                        <div className="relative">
                                            <Input
                                                {...register("cardNumber")}
                                                placeholder="1234 5678 9012 3456"
                                                className="rounded-xl pl-12"
                                                maxLength={19}
                                            />
                                            <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        </div>
                                        {errors.cardNumber && (
                                            <p className="text-red-500 text-sm mt-1">{errors.cardNumber.message}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                            Cardholder name
                                        </label>
                                        <Input
                                            {...register("cardName")}
                                            placeholder="John Doe"
                                            className="rounded-xl"
                                        />
                                        {errors.cardName && (
                                            <p className="text-red-500 text-sm mt-1">{errors.cardName.message}</p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                                Expiry date
                                            </label>
                                            <Input
                                                {...register("expiryDate")}
                                                placeholder="MM/YY"
                                                className="rounded-xl"
                                                maxLength={5}
                                            />
                                            {errors.expiryDate && (
                                                <p className="text-red-500 text-sm mt-1">{errors.expiryDate.message}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                                CVV
                                            </label>
                                            <Input
                                                {...register("cvv")}
                                                type="password"
                                                placeholder="•••"
                                                className="rounded-xl"
                                                maxLength={4}
                                            />
                                            {errors.cvv && (
                                                <p className="text-red-500 text-sm mt-1">{errors.cvv.message}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 p-4 bg-green-50 rounded-xl mt-4">
                                        <Lock className="w-5 h-5 text-green-600" />
                                        <p className="text-sm text-green-700">
                                            Your payment information is encrypted and secure
                                        </p>
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-xl h-12 text-base font-medium mt-4"
                                    >
                                        {isSubmitting ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Processing Payment...
                                            </div>
                                        ) : (
                                            `Pay ₹${totalAmount - discount}`
                                        )}
                                    </Button>
                                </form>
                            </div>
                        )}

                        {/* UPI */}
                        {paymentMethod === "upi" && (
                            <div className="bg-white rounded-2xl p-6 shadow-sm">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">UPI Payment</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                            UPI ID
                                        </label>
                                        <Input placeholder="yourname@upi" className="rounded-xl" />
                                    </div>
                                    <Button
                                        onClick={() => handleCreateBooking()}
                                        disabled={isSubmitting}
                                        className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-xl h-12 text-base font-medium mt-6"
                                    >
                                        {isSubmitting ? "Processing..." : "Verify & Pay"}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Net Banking */}
                        {paymentMethod === "netbanking" && (
                            <div className="bg-white rounded-2xl p-6 shadow-sm">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Select your bank</h2>
                                <div className="grid grid-cols-2 gap-3">
                                    {["HDFC Bank", "ICICI Bank", "SBI", "Axis Bank", "Kotak", "Others"].map(
                                        (bank) => (
                                            <button
                                                key={bank}
                                                className="p-4 text-left rounded-xl border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-colors"
                                            >
                                                <span className="font-medium text-gray-900">{bank}</span>
                                            </button>
                                        )
                                    )}
                                </div>
                                <Button
                                    onClick={() => handleCreateBooking()}
                                    disabled={isSubmitting}
                                    className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-xl h-12 text-base font-medium mt-6"
                                >
                                    {isSubmitting ? "Processing..." : "Continue to Bank"}
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 bg-white rounded-2xl p-6 shadow-sm">
                            {/* Hotel Info */}
                            <div className="flex gap-4 mb-6 pb-6 border-b border-gray-100">
                                <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                                    <Image
                                        src={hotelImage}
                                        alt={hotel.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-1">
                                        {hotel.name}
                                    </h3>
                                    <div className="flex items-center gap-1 text-sm text-gray-500">
                                        <MapPin className="w-3 h-3" />
                                        {hotelLocation}
                                    </div>
                                </div>
                            </div>


                            {/* Coupon Section */}
                            <div className="mb-6 pb-6 border-b border-gray-100">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Have a coupon?</label>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Enter Code"
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value)}
                                        disabled={!!appliedCouponCode}
                                        className="uppercase"
                                    />
                                    {appliedCouponCode ? (
                                        <Button variant="outline" size="sm" onClick={handleRemoveCoupon} type="button">Remove</Button>
                                    ) : (
                                        <Button size="sm" onClick={handleApplyCoupon} disabled={isApplyingCoupon || !couponCode} type="button">
                                            {isApplyingCoupon ? "..." : "Apply"}
                                        </Button>
                                    )}
                                </div>
                                {couponError && <p className="text-red-500 text-xs mt-2">{couponError}</p>}
                                {appliedCouponCode && <p className="text-green-600 text-xs mt-2 font-medium">Coupon {appliedCouponCode} applied successfully!</p>}
                            </div>

                            {/* Price Breakdown */}
                            <div className="space-y-3 mb-4">
                                <div className="flex justify-between text-gray-600 text-sm">
                                    <span>Room Charges ({nights} {nights === 1 ? 'night' : 'nights'} × {roomsCount} {parseInt(roomsCount) === 1 ? 'room' : 'rooms'})</span>
                                    <span>₹{basePrice.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-gray-600 text-sm">
                                    <span>Taxes & Fees (12%)</span>
                                    <span>₹{taxes.toLocaleString()}</span>
                                </div>
                                {discount > 0 && (
                                    <div className="flex justify-between text-sm bg-green-50 -mx-6 px-6 py-2">
                                        <span className="text-green-700 font-medium">Coupon Discount ({appliedCouponCode})</span>
                                        <span className="text-green-600 font-semibold">-₹{discount.toLocaleString()}</span>
                                    </div>
                                )}
                            </div>

                            {/* Total */}
                            <div className="border-t border-gray-200 pt-4">
                                {discount > 0 && (
                                    <div className="flex justify-between text-gray-400 text-sm mb-1">
                                        <span>Original Total</span>
                                        <span className="line-through">₹{totalAmount.toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="flex justify-between font-bold text-gray-900 text-xl">
                                    <span>Total</span>
                                    <span className={discount > 0 ? "text-green-600" : ""}>₹{(totalAmount - discount).toLocaleString()}</span>
                                </div>
                            </div>

                            <p className="text-sm text-gray-500 mt-3">
                                For {nights} {nights === 1 ? 'night' : 'nights'}, {guests} {parseInt(guests) === 1 ? 'Guest' : 'Guests'} including taxes & fees
                            </p>

                            {/* Trust Badges */}
                            <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Check className="w-4 h-4 text-green-500" />
                                    <span>Secure SSL encrypted payment</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Check className="w-4 h-4 text-green-500" />
                                    <span>No hidden fees</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}
