import { Sidebar } from "./sidebar/Sidebar";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== 'admin') {
        redirect("/login");
    }

    return (
        <div className="h-screen overflow-hidden bg-gray-50 flex">
            <Sidebar />
            {/* Main content - pt-16 for mobile header, md:ml-64 for desktop sidebar */}
            <main className="flex-1 flex flex-col pt-16 md:pt-0 md:ml-64 h-full overflow-hidden relative">
                {/* Scrollable content area */}
                <div className="flex-1 overflow-y-auto w-full">
                    {children}
                </div>
            </main>
        </div>
    );
}
