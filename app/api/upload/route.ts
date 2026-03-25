
import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import fs from "fs";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = `${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
        
        // Use /var/www/urbanhost/uploads for production, fallback to public for development
        const uploadDir = process.env.NODE_ENV === 'production' 
            ? path.join("/var/www/urbanhost/uploads", "properties")
            : path.join(process.cwd(), "public", "uploads", "properties");

        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        await writeFile(path.join(uploadDir, filename), buffer);

        return NextResponse.json({
            success: true,
            url: `/uploads/properties/${filename}`
        });

    } catch (error: any) {
        console.error("Upload Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
