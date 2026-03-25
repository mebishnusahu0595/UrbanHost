import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import PropertyOwnerLayoutClient from "./PropertyOwnerLayoutClient";

export default async function PropertyOwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Not logged in - redirect to login
  if (!session) {
    redirect("/login");
  }

  // Only allow propertyOwner role (admin goes to admin dashboard)
  const userRole = (session.user as any).role;

  if (userRole === 'admin') {
    redirect("/admin/dashboard");
  }

  if (userRole !== 'propertyOwner') {
    // hotelOwner, user, receptionist, etc - redirect to login
    redirect("/login");
  }

  return <PropertyOwnerLayoutClient>{children}</PropertyOwnerLayoutClient>;
}
