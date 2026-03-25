
export const LANGUAGES = [
    { code: "hi", name: "Hindi" },
    { code: "bn", name: "Bengali" },
    { code: "te", name: "Telugu" },
    { code: "mr", name: "Marathi" },
    { code: "ta", name: "Tamil" },
    { code: "ur", name: "Urdu" },
    { code: "gu", name: "Gujarati" },
    { code: "kn", name: "Kannada" },
    { code: "ml", name: "Malayalam" },
    { code: "pa", name: "Punjabi" },
    { code: "es", name: "Spanish" },
    { code: "fr", name: "French" },
    { code: "de", name: "German" },
    { code: "ar", name: "Arabic" },
    { code: "zh", name: "Chinese" },
    { code: "ja", name: "Japanese" }
];

export async function translateText(text: string, targetLang: string): Promise<string> {
    if (!text || !targetLang) return "";

    try {
        const response = await fetch("/api/translate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                text: text,
                target: targetLang
            }),
        });

        const data = await response.json();
        return data.translatedText || "";
    } catch (error) {
        console.error("Translation failed:", error);
        return ""; // Return empty string on failure so user can manually enter
    }
}
