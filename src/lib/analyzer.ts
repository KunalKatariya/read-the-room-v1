import { GoogleGenerativeAI } from "@google/generative-ai";

export interface AnalysisResult {
    vibeHeadline: string;
    confidence: number;
    shareId?: string;
    analysisId?: string; // UUID for payment tracking
    stats: {
        totalMessages: number;
        youCount: number;
        themCount: number;
        youAvgLength: number;
        themAvgLength: number;
        replyTimeGap: string; // e.g. "You wait 5m, They wait 2h"
    };
    roast: string;
    sentiment: {
        score: number; // 0-100
        label: "Lovey-dovey" | "Cold" | "Toxic" | "Friendly" | "Professional" | "Flirty" | "Neutral";
    };
    chartData: {
        sentimentTrend: { messageIndex: number; score: number }[]; // For line chart
        dominance: { name: string; value: number }[]; // For pie/bar chart
    };
    redFlags: string[];
    redFlagOverview: string; // Short summary for receipt
    greenFlags: string[];
    greenFlagOverview: string; // Short summary for receipt
    turningPoint: {
        message: string;
        explanation: string;
    } | null;
    effortBalance: string;
    movieAnalogy: string;
    attachmentStyle: string;
    nextSteps: string[];
    rpgCards: {
        name: string;
        role: string; // e.g. "The Paladin of Patience"
        level: number; // 1-99
        oneLiner: string;
        stats: {
            yapLevel: number; // 0-100
            simpScore: number; // 0-100
            cringeFactor: number; // 0-100
            chaosMeasure: number; // 0-100
        }
    }[];
    songRecommendations: {
        title: string;
        artist: string;
        reason: string; // "Because you blocked them and then unblocked them"
    }[];
    gifSearchQuery: string; // New field for GIPHY search
    gifUrl?: string; // Persisted GIF URL for sharing consistency
}

// Keep heuristics for hard numbers (LLMs are bad at counting)
function getBasicStats(text: string) {
    const lines = text.split(/\n/).filter(l => l.trim().length > 0);
    return {
        totalMessages: lines.length,
        // Detailed stats will be handled by AI or client-side parsing in future
        // For now we trust AI for the breakdown as regexing names is hard without known names
        replyTimeGap: "Unknown"
    };
}

export async function analyzeChatWithGemini(text: string, apiKey: string, language: string = "English"): Promise<AnalysisResult> {
    const stats = getBasicStats(text);
    console.log(`[Gemini] Starting analysis. Key present: ${!!apiKey}, Text len: ${text.length}, Language: ${language}`);

    // Initialize Gemini strict
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
    Analyze this chat log (or snippet) between one or more people (Group Chat or DM). 
    You are a "Internet Vibe Checker". Your tone is SASSY, PLAYFUL, and primarily a "Bestie who keeps it real". You roast them for their cringe 💀, but you wrap it in love and support 💖. You use a LOT of emojis.
    
    Target Language: ${language}
    
    Input Text (truncated for brevity):
    """
    ${text.replace(/^.*end-to-end encrypted.*$/gim, "").substring(0, 500000)} 
    """
    
    Return a valid JSON object with the following fields (do NOT use code blocks):
    {
        "vibeHeadline": "A short, punchy, summary of the relationship dynamic",
        "roast": "A 1-2 sentence playful roast. Tease them about their cringe moments but keep it lighthearted and end with a 'but you got this' or similar encouraging energy. ✨",
        "sentimentLabel": "One of: Lovey-dovey 🤮, Cold 🥶, Toxic ☣️, Friendly 🤝, Professional 👔, Flirty 🫦, Neutral 😐",
        "sentimentScore": 0-100 (integer, higher is better/more positive),
        "sentimentTrend": [50, 60, 40, ...], // Array of exactly 10 integers (0-100) representing the emotional arc from start to finish
        "participants": ["Name 1", "Name 2", "Name 3"], // Identify ALL active participants (Max 6)
        "dominanceOverview": [
             { "name": "Name 1", "percentage": 60 },
             { "name": "Name 2", "percentage": 40 }
             // ... up to all participants, must sum to roughly 100
        ],
        "redFlags": ["🚩 flag 1", "🚩 flag 2", "🚩 flag 3"],
        "redFlagOverview": "A short, punchy sentence summarizing the overall red flag energy of the relationship (not just one specific event). Max 12 words.",
        "greenFlags": ["✅ flag 1", "✅ flag 2"],
        "greenFlagOverview": "A short, punchy sentence summarizing the overall green flag energy. Max 12 words.",
        "effortBalance": "A verdict on who is trying harder (e.g. 'You are carrying 🎒' or 'Group effort' or 'Name 1 is the CEO of Yapping')",
        "movieAnalogy": "If this chat was a movie, what would it be? (Max 1 sentence). IMPORTANT: Do NOT just say 'The Notebook' or 'When Harry Met Sally'. Be creative! Use Bollywood, Hollywood, Indie films, obscure 90s rom-coms, horror movies, etc. 🎬",
        "attachmentStyle": "A specific, funny Gen-z label for their attachment style. Do NOT reuse common ones like 'Stage 5 Clinger'. Be extremely specific and roasted. Examples: 'Recovering People Pleaser', 'Text-Bombardment Specialist', 'Emotional Hit-and-Run Driver', 'Situationship Veteran', etc. 🔮",
        "replyTimeGap": "E.g. 'You reply fast, they hibernate 😴'",
        "turningPoint": {
           "message": "Quote the message where vibes changed",
           "explanation": "Why it changed"
        },
        "nextSteps": ["Action 1", "Action 2", "Action 3"],
        "rpgCards": [
            // Generate ONE card per participant found (Max 6)
            {
                "name": "Name 1",
                "role": "A creative RPG-style class title (e.g. 'Level 99 Yapper', 'Paladin of Patience')",
                "level": 1-99 (integer),
                "oneLiner": "A roast about their specific behavior",
                "stats": {
                    "yapLevel": 0-100,
                    "simpScore": 0-100,
                    "cringeFactor": 0-100,
                    "chaosMeasure": 0-100
                }
            },
            {
                "name": "Name 2",
                // ... same structure
            }
        ],
        "songRecommendations": [
            {
                "title": "Song Title",
                "artist": "Artist Name",
                "reason": "1 sentence explanation."
            },
            { "title": "...", "artist": "...", "reason": "..." },
            { "title": "...", "artist": "...", "reason": "..." }
        ],
        "gifSearchQuery": "A specific, funny search term for GIPHY that perfectly captures the mood of this relationship (e.g. 'Michael Scott grimacing', 'Elmo fire', 'Woman yelling at cat')."
    }
    
    IMPORTANT INSTRUCTIONS FOR LANGUAGE (${language}):
    1. The content of the fields (values) MUST be in ${language}.
    2. Do NOT simply translate English literals. Use CULTURALLY RELEVANT slang and humor for ${language}.
       - If ${language} is "Hindi", use "Hinglish" (Hindi + English mix) which is popular on the internet. Use words like "Bhai", "Yaar", "Scene", "Matlab", etc. The vibe should be "Delhi/Mumbai Gen Z".
       - If ${language} is "Japanese", use casual/slang Japanese (Tameguchi/Wakamono-kotoba). Use www, 草, and other Japanese net slang. The vibe should be "Tokyo Gen Z".
    3. Keep the JSON keys in ENGLISH. Only translate the VALUES.
    4. Be deterministic.
    5. Make the "redFlags" funny, grounded, and feel free to use emojis!
    6. For "songRecommendations", recommend songs popular in the culture of ${language} if appropriate, or global hits that fit the vibe.
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const responseText = response.text();

        // 1. Try to extract from markdown code blocks first (most reliable)
        const codeBlockMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || responseText.match(/```([\s\S]*?)```/);

        let jsonString = "";
        if (codeBlockMatch && codeBlockMatch[1]) {
            jsonString = codeBlockMatch[1].trim();
        } else {
            const start = responseText.indexOf("{");
            const end = responseText.lastIndexOf("}") + 1;
            if (start !== -1 && end > start) {
                jsonString = responseText.substring(start, end);
            }
        }

        if (!jsonString) throw new Error("No JSON found in response");

        const data = JSON.parse(jsonString);

        // Use AI-generated trend or fallback
        const trendData = (data.sentimentTrend && Array.isArray(data.sentimentTrend) && data.sentimentTrend.length > 0)
            ? data.sentimentTrend.map((score: number, i: number) => ({ messageIndex: i * 10, score }))
            : Array(10).fill(50).map((_, i) => ({ messageIndex: i * 10, score: 50 }));

        // Map Dominance Overview from AI
        const dominanceData = data.dominanceOverview
            ? data.dominanceOverview.map((d: any) => ({ name: d.name, value: d.percentage }))
            : [{ name: "You", value: 50 }, { name: "Them", value: 50 }];

        return {
            vibeHeadline: data.vibeHeadline || "Vibe Check Failed",
            confidence: 89,
            stats: {
                ...stats,
                totalMessages: stats.totalMessages,
                youCount: 0, // Deprecated/Not used directly anymore in favor of chart
                themCount: 0,
                youAvgLength: 0,
                themAvgLength: 0,
                replyTimeGap: data.replyTimeGap || "Unclear timings"
            },
            roast: data.roast || "No roast available.",
            sentiment: {
                score: data.sentimentScore || 50,
                label: data.sentimentLabel || "Neutral"
            },
            chartData: {
                sentimentTrend: trendData,
                dominance: dominanceData
            },
            redFlags: data.redFlags || [],
            redFlagOverview: data.redFlagOverview || "Too many to count",
            greenFlags: data.greenFlags || [],
            greenFlagOverview: data.greenFlagOverview || "None found",
            turningPoint: data.turningPoint || null,
            effortBalance: data.effortBalance || "Matched",
            movieAnalogy: data.movieAnalogy || "The Notebook",
            attachmentStyle: data.attachmentStyle || "Unknown",
            nextSteps: data.nextSteps || ["Move on"],
            rpgCards: data.rpgCards || [],
            songRecommendations: data.songRecommendations || [],
            gifSearchQuery: data.gifSearchQuery || "confused"
        };

    } catch (e: any) {
        console.error("Gemini Error:", e);
        return {
            vibeHeadline: "Brain Freeze 🥶",
            confidence: 10,
            stats: { ...stats, totalMessages: 0, youCount: 0, themCount: 0, youAvgLength: 0, themAvgLength: 0, replyTimeGap: "Unknown" },
            roast: `Internal Error: ${e.message || "Unknown error"}`,
            sentiment: { score: 50, label: "Neutral" },
            chartData: { sentimentTrend: [], dominance: [] },
            redFlags: ["Error"],
            redFlagOverview: "Error",
            greenFlags: [],
            greenFlagOverview: "Error",
            turningPoint: null,
            effortBalance: "Unknown",
            movieAnalogy: "Error",
            attachmentStyle: "Error",
            nextSteps: [],
            rpgCards: [],
            songRecommendations: [],
            gifSearchQuery: "error"
        };
    }
}
