import connectToDatabase from "@/lib/db";
import Hotel from "@/models/Hotel";
import PropertyWizard from "@/app/property-panel/properties/add/page";
import { notFound } from "next/navigation";

export default async function EditHotelPage({ params }: { params: Promise<{ id: string }> }) {
    await connectToDatabase();
    const { id } = await params;
    const hotel = await Hotel.findById(id).populate('owner', 'name email phone').lean();

    if (!hotel) return notFound();

    // Convert ObjectIds/Dates to strings to pass to Client Component
    const serializedHotel = JSON.parse(JSON.stringify(hotel));

    return <PropertyWizard isEditMode={true} initialData={serializedHotel} isAdmin={true} />;
}
