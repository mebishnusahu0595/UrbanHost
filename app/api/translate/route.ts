
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { text, target } = body;

        if (!text || !target) {
            return NextResponse.json({ error: "Missing text or target language" }, { status: 400 });
        }

        const response = await fetch("https://translate.argosopentech.com/translate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                q: text,
                source: "en",
                target: target,
                format: "text"
            }),
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error("LibreTranslate Error:", errText);
            return NextResponse.json({ error: "Translation API failed" }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json({ translatedText: data.translatedText });

    } catch (error) {
        console.error("Translation Proxy Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
