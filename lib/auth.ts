import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Otp from "@/models/Otp";

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                try {
                    await dbConnect();

                    const user = await User.findOne({
                        email: credentials.email.toLowerCase()
                    }).select('+password');

                    if (!user) {
                        return null;
                    }

                    const isPasswordValid = await user.comparePassword(credentials.password);

                    if (!isPasswordValid) {
                        return null;
                    }

                    return {
                        id: user._id.toString(),
                        email: user.email,
                        name: user.name,
                        role: user.role,
                        canEditHotels: user.canEditHotels,
                    };
                } catch (error) {
                    console.error('Auth error:', error);
                    return null;
                }
            },
        }),
        CredentialsProvider({
            id: 'phone-login',
            name: "Phone Login",
            credentials: {
                phone: { label: "Phone", type: "text" },
                otp: { label: "OTP", type: "text" },
            },
            async authorize(credentials) {
                if (!credentials?.phone || !credentials?.otp) {
                    throw new Error("Phone and OTP required");
                }

                await dbConnect();

                try {
                    const cleanPhone = credentials.phone.replace(/\D/g, '');
                    console.log(`[PhoneLogin] Attempting login for ${cleanPhone} with OTP input: ${credentials.otp}`);

                    const otpRecord = await Otp.findOne({ phone: cleanPhone });

                    if (otpRecord) {
                        console.log(`[PhoneLogin] Found OTP record. Matches: ${otpRecord.otp === credentials.otp}, Expires: ${otpRecord.expiresAt}`);
                    } else {
                        console.log(`[PhoneLogin] No OTP record found for phone: ${cleanPhone}`);
                    }

                    if (!otpRecord || otpRecord.otp !== credentials.otp) {
                        throw new Error("Invalid or Expired OTP");
                    }

                    if (otpRecord.expiresAt && new Date() > otpRecord.expiresAt) {
                        console.log(`[PhoneLogin] OTP Expired. Current: ${new Date()}, Expiry: ${otpRecord.expiresAt}`);
                        throw new Error("OTP Expired");
                    }

                    const user = await User.findOne({ phone: cleanPhone });

                    if (!user) {
                        console.log(`[PhoneLogin] User not found for phone: ${cleanPhone}`);
                        throw new Error("USER_NOT_FOUND");
                    }

                    await otpRecord.deleteOne();
                    console.log(`[PhoneLogin] Login successful. OTP consumed.`);

                    return {
                        id: user._id.toString(),
                        email: user.email,
                        name: user.name,
                        role: user.role,
                        phone: user.phone,
                        canEditHotels: user.canEditHotels,
                    };
                } catch (e: any) {
                    console.error("[PhoneLogin] Auth Error:", e.message);
                    throw new Error(e.message || "Auth Failed");
                }
            },
        }),
        CredentialsProvider({
            id: 'email-otp',
            name: "Email OTP",
            credentials: {
                email: { label: "Email", type: "email" },
                otp: { label: "OTP", type: "text" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.otp) {
                    throw new Error("Email and OTP required");
                }

                await dbConnect();

                try {
                    const user = await User.findOne({
                        email: credentials.email.toLowerCase()
                    }).select('+otp +otpExpiry');

                    if (!user) {
                        throw new Error("User not found. Please request OTP first.");
                    }

                    if (!user.otp || user.otp !== credentials.otp) {
                        throw new Error("Invalid OTP");
                    }

                    if (user.otpExpiry && new Date() > user.otpExpiry) {
                        throw new Error("OTP Expired");
                    }

                    // Clear OTP after successful login
                    user.otp = undefined;
                    user.otpExpiry = undefined;

                    // DO NOT auto-promote to propertyOwner
                    // Admin will assign role when approving their first property

                    await user.save();

                    return {
                        id: user._id.toString(),
                        email: user.email,
                        name: user.name,
                        role: user.role,
                        canEditHotels: user.canEditHotels,
                    };
                } catch (e: any) {
                    throw new Error(e.message || "Auth Failed");
                }
            },
        }),
    ],
    pages: {
        signIn: "/login",
        error: "/login",
    },
    callbacks: {
        async signIn({ user, account }) {
            if (account?.provider === "google") {
                try {
                    await dbConnect();
                    let existingUser = await User.findOne({ email: user.email?.toLowerCase() });
                    if (!existingUser) {
                        // Create new user for Google sign-in
                        existingUser = await User.create({
                            name: user.name || "Urban Host User",
                            email: user.email?.toLowerCase() || "",
                            avatar: user.image || "",
                            role: "user",
                            isEmailVerified: true,
                        });
                    }
                    // Set the user ID from database
                    user.id = existingUser._id.toString();
                } catch (error) {
                    console.error("Google sign-in error:", error);
                    return false;
                }
            }
            return true;
        },
        async jwt({ token, user, account, trigger, session }) {
            if (user) {
                token.id = user.id;
                token.role = (user as any).role;
                token.canEditHotels = (user as any).canEditHotels;
            }

            // Sync with DB to get latest role (e.g. after approval or promotion)
            if (token.id) {
                try {
                    await dbConnect();
                    const dbUser = await User.findById(token.id).select('role canEditHotels');
                    if (dbUser) {
                        token.role = dbUser.role;
                        token.canEditHotels = dbUser.canEditHotels;
                        // Log for debugging if needed
                        // console.log(`JWT Callback: User ${dbUser._id} has role ${dbUser.role}`);
                    }
                } catch (e) {
                    console.error("JWT Sync error:", e);
                }
            }

            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).id = token.id as string;
                (session.user as any).role = token.role as string;
                (session.user as any).canEditHotels = token.canEditHotels as boolean;
            }
            return session;
        },
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
    useSecureCookies: false, // Disable secure cookies for HTTP
};
