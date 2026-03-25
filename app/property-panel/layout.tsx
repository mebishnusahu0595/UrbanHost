
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { Navbar } from "@/components/layout/Navbar";
import dbConnect from "@/lib/mongodb";
import Hotel from "@/models/Hotel";

export const dynamic = "force-dynamic";

export default async function PropertyPanelLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    let session;
    try {
        session = await getServerSession(authOptions);
    } catch (error) {
        console.error("Layout Session Error:", error);
        redirect("/login");
    }

    if (!session) {
        redirect("/partner/login");
    }

    // Allow user, hotelOwner for property-panel
    // propertyOwner goes to property-owner portal, admin goes to admin dashboard
    const userRole = (session.user as any).role;

    if (userRole === 'admin') {
        redirect("/admin/dashboard");
    }

    if (userRole === 'propertyOwner') {
        // Property owners should use the property-owner portal
        redirect("/property-owner/dashboard");
    }

    // Only allow: user (new signup), hotelOwner
    const allowedRoles = ['user', 'hotelOwner'];

    if (!allowedRoles.includes(userRole)) {
        console.warn(`Access denied to property-panel for role: ${userRole}. Redirecting to login.`);
        redirect("/login");
    }

    // Check if user has at least one approved property (skip for admin)
    if (userRole !== 'admin') {
        try {
            await dbConnect();
            const hasApprovedProperty = await Hotel.findOne({
                owner: (session.user as any).id,
                status: { $in: ['approved', 'published'] }
            });

            if (!hasApprovedProperty) {
                console.warn(`Property owner ${(session.user as any).id} has no approved properties yet.`);
                // Allow access to property-panel even without approved properties
                // They can submit properties and wait for approval
                // Once approved, they should login to /login with email+password for property-owner dashboard
            }
        } catch (error) {
            console.error("Error checking approved properties:", error);
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                {children}
            </div>
        </div>
    );
}
