"use client";
import { useEffect, useState } from "react";

export default function DebugPage() {
    const [data, setData] = useState<any>(null);
    useEffect(() => {
        fetch("/api/properties?status=approved")
            .then(res => res.json())
            .then(setData);
    }, []);

    return (
        <div className="p-10">
            <h1 className="text-2xl font-bold mb-4">Debug Hotel List</h1>
            <pre className="bg-gray-100 p-4 rounded">
                {JSON.stringify(data, null, 2)}
            </pre>
        </div>
    );
}
