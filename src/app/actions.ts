'use server';

import { analyzeChatWithGemini } from '@/lib/analyzer';
import { kv } from '@vercel/kv';
import { v4 as uuidv4 } from 'uuid';

export async function analyzeChatAction(text: string) {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || ""; // Should ideally be server-side var

    // 1. Generate unique analysis ID
    const analysisId = uuidv4();

    // 2. Perform Analysis
    const result = await analyzeChatWithGemini(text, apiKey);

    // 3. Store initial payment state (UNPAID)
    // We ALSO need to store the RESULT itself so we can retrieve it after payment redirect
    try {
        // Expires in 30 days (seconds)
        await kv.set(`analysis:${analysisId}`, {
            isPaid: false,
            result: result // Store result in KV
        }, { ex: 2592000 });
    } catch (error) {
        console.warn("KV Storage failed (are env vars set?)", error);
    }

    // 4. Attach ID to result so frontend knows it
    return { ...result, analysisId }; // Extend result type dynamically
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
