'use server';

import { analyzeChatWithGemini } from '@/lib/analyzer';
import { kv } from '@vercel/kv';
import { v4 as uuidv4 } from 'uuid';
import { headers } from 'next/headers';
import { getPricingForCountry } from '@/lib/pricing';

// Fallback GIFs for when API rate limits are hit or fails
const FALLBACK_GIFS = [
    "https://media.tenor.com/2bIYwG6LRTWUDujz/elmo-on-fire.gif", // Elmo Fire (Chaos)
    "https://media.tenor.com/images/a83e07d0f3964263080e75a6c1e19488/tenor.gif", // Math Lady (Confused)
    "https://media.giphy.com/media/viaEa64z357P8n10aW/giphy.gif", // Blinking Guy (Shock)
    "https://gifdb.com/images/high/homer-simpson-hiding-in-the-bush-1024x576-92q03k6d48b783t7.gif", // Homer Bush (Awkward)
    "https://media.tenor.com/HuU9Cmp0_aQAAAAd/shaq-shimmy-shaquille-o-neal.gif", // Shaq Shimmy (Excited)
    "https://media.tenor.com/xtVDTs9QRuAAAAAd/its-happening-the-office.gif", // Office Happening (Panic)
    "https://media.tenor.com/GyxtaPIdJxuAAAAAC/spiderman-meme-pointing.gif", // Spiderman (Accusation)
    "https://media.tenor.com/QF03EtQxPUsAAAAC/kermit-the-frog-sipping-tea.gif", // Kermit Tea (Petty)
    "https://media.tenor.com/images/3f7a8f8d6d6a2f4a4d6f8f8d6d6a2f4a/tenor.gif", // Leo Toast (Cheers)
    "https://media.tenor.com/tTk21UjO4JAAAAAC/michael-jackson-popcorn.gif" // Popcorn (Drama)
];

// Helper to fetch GIPHY
export async function getGiphyGifAction(query: string): Promise<string | null> {
    try {
        const apiKey = process.env.GIPHY_API_KEY;
        if (!apiKey) {
            console.warn("No GIPHY_API_KEY found, using fallback");
            return FALLBACK_GIFS[Math.floor(Math.random() * FALLBACK_GIFS.length)];
        }

        const res = await fetch(`https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${encodeURIComponent(query)}&limit=1&rating=pg`);

        if (!res.ok) {
            throw new Error(`GIPHY API Error: ${res.statusText}`);
        }

        const data = await res.json();

        if (data.data && data.data.length > 0) {
            return data.data[0].images.original.url;
        }

        // No results found? Fallback.
        return FALLBACK_GIFS[Math.floor(Math.random() * FALLBACK_GIFS.length)];
    } catch (e) {
        console.error("Giphy Fetch Error (Using Fallback):", e);
        return FALLBACK_GIFS[Math.floor(Math.random() * FALLBACK_GIFS.length)];
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

// ----------------------------------------------------------------------
// REVIEW SYSTEM ACTIONS
// ----------------------------------------------------------------------

export interface Review {
    name: string;
    text: string;
    stars: number;
    date: string;
}

export async function submitReviewAction(stars: number, text: string, name: string) {
    try {
        const headersList = await headers();
        const ip = headersList.get("x-forwarded-for") || "unknown";

        // 1. RATE LIMITING (1 review per IP per hour)
        const rateLimitKey = `review_limit:${ip}`;
        const existingLimit = await kv.get(rateLimitKey);

        if (existingLimit) {
            return { success: false, error: "Too many reviews. Please wait a bit!" };
        }

        // Set rate limit (Expires in 1 hour)
        await kv.set(rateLimitKey, "1", { ex: 3600 });

        // 2. VALIDATION
        if (!text || text.length < 5 || text.length > 200) {
            return { success: false, error: "Review must be between 5 and 200 characters." };
        }
        if (stars < 1 || stars > 5) {
            return { success: false, error: "Invalid rating." };
        }

        const newReview: Review = {
            name: name.trim().slice(0, 20) || "Anonymous", // Cap name length
            text: text.trim(),
            stars,
            date: new Date().toISOString()
        };

        // 3. ANTI-SPAM (Duplicate Content Check)
        // Fetch current list to check duplicates
        const currentReviews = (await kv.lrange("reviews_list", 0, 49)) as unknown as Review[];
        const isDuplicate = currentReviews.some(r => r.text.toLowerCase() === newReview.text.toLowerCase());

        if (isDuplicate) {
            // Silent success (don't tell spammer they failed)
            return { success: true };
        }

        // 4. SAVE (Push to list)
        await kv.lpush("reviews_list", newReview);

        // 5. TRIM (Keep only last 50)
        await kv.ltrim("reviews_list", 0, 49);

        return { success: true };

    } catch (error) {
        console.error("Submit Review Error:", error);
        return { success: false, error: "Failed to submit review." };
    }
}

export async function getReviewsAction() {
    try {
        // Fetch top 50
        const reviews = await kv.lrange("reviews_list", 0, 49);
        return reviews as unknown as Review[];
    } catch (error) {
        console.error("Get Reviews Error:", error);
        return [];
    }
}
