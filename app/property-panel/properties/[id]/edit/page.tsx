"use client";

import { useParams } from "next/navigation";
import PropertyWizard from "@/app/property-panel/properties/add/page";

export default function EditPropertyPage() {
    const params = useParams();
    const propertyId = params.id as string;

    // Reuse the same PropertyWizard component in edit mode
    return <PropertyWizard propertyId={propertyId} />;
}
