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
    try {
        // Expires in 30 days (seconds)
        await kv.set(`analysis:${analysisId}`, { isPaid: false }, { ex: 2592000 });
    } catch (error) {
        console.warn("KV Storage failed (are env vars set?)", error);
    }

    // 4. Attach ID to result so frontend knows it
    return { ...result, analysisId }; // Extend result type dynamically
}
