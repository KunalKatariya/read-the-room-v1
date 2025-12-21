'use server';

import { analyzeChatWithGemini } from '@/lib/analyzer';
import { kv } from '@vercel/kv';
import { v4 as uuidv4 } from 'uuid';
import { headers } from 'next/headers';
import { getPricingForCountry } from '@/lib/pricing';

// Helper to fetch GIPHY
export async function getGiphyGifAction(query: string): Promise<string | null> {
    try {
        const apiKey = process.env.GIPHY_API_KEY;
        if (!apiKey) {
            console.warn("No GIPHY_API_KEY found");
            return null;
        }

        const res = await fetch(`https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${encodeURIComponent(query)}&limit=1&rating=pg`);
        const data = await res.json();

        if (data.data && data.data.length > 0) {
            return data.data[0].images.original.url;
        }
        return null;
    } catch (e) {
        console.error("Giphy Fetch Error:", e);
        return null;
    }
}

// ----------------------------------------------------------------------
export async function getPricingAction() {
    const headersList = await headers();
    const country = headersList.get("x-vercel-ip-country") || "US"; // Default to US if local/unknown

    // If running locally, "country" might be null.
    // We can simulate other countries here for testing if we want.
    // const country = "IN"; 

    return getPricingForCountry(country);
}

export async function analyzeChatAction(text: string) {
    console.log(`[Action] Starting analysis for text length: ${text.length}`);

    try {
        const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
        // 1. Generate unique analysis ID
        const analysisId = uuidv4();

        // 2. Perform Analysis
        console.log(`[Action] Calling Gemini...`);
        const result = await analyzeChatWithGemini(text, apiKey);
        console.log(`[Action] Gemini finished. Headline: ${result.vibeHeadline}`);

        // 3. Store initial payment state (UNPAID)
        // We ALSO need to store the RESULT itself so we can retrieve it after payment redirect
        try {
            // Expires in 30 days (seconds)
            await kv.set(`analysis:${analysisId}`, {
                isPaid: false,
                result: result // Store result in KV
            }, { ex: 2592000 });
        } catch (error) {
            console.warn("[Action] KV Storage failed (are env vars set?)", error);
        }

        // 4. Attach ID to result so frontend knows it
        return { ...result, analysisId }; // Extend result type dynamically
    } catch (error: any) {
        console.error("[Action] analyzeChatAction CRITICAL FAILURE:", error);
        throw new Error(error.message || "Server Analysis Failed");
    }
}

export async function getAnalysisAction(analysisId: string) {
    try {
        const data = await kv.get(`analysis:${analysisId}`) as any;
        if (!data || !data.result) return null;

        return {
            ...data.result,
            analysisId: analysisId,
            isPaid: data.isPaid || false
        };
    } catch (e) {
        console.error("Failed to fetch analysis", e);
        return null;
    }
}
