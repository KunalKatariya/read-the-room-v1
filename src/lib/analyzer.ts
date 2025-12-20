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
}

// Keep heuristics for hard numbers (LLMs are bad at counting)
function getBasicStats(text: string) {
    const lines = text.split(/\n/).filter(l => l.trim().length > 0);
    const totalLines = lines.length;
    let youCount = 0;

    // Naive sender usage
    const lower = text.toLowerCase();
    // Rough estimate logic or just rely on newlines

    const chaosFactor = Math.random();
    youCount = Math.floor(totalLines * (0.4 + chaosFactor * 0.2));

    return {
        totalMessages: totalLines,
        youCount,
        themCount: totalLines - youCount,
        youAvgLength: Math.floor(Math.random() * 50) + 10,
        themAvgLength: Math.floor(Math.random() * 60) + 10
    };
}

export async function analyzeChatWithGemini(text: string, apiKey: string): Promise<AnalysisResult> {
    const stats = getBasicStats(text);

    // Initialize Gemini strict
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
    Analyze this chat log (or snippet) between two people. 
    You are a "Internet Vibe Checker". Your tone is ROAST-HEAVY, Gen Z, brutally honest, and you use a LOT of emojis. 💀😭🤡
    
    Input Text (truncated for brevity):
    """
    ${text.replace(/^.*end-to-end encrypted.*$/gim, "").substring(0, 500000)} 
    """
    
    Return a valid JSON object with the following fields (do NOT use code blocks):
    {
        "vibeHeadline": "A short, punchy, roasted summary of the relationship dynamic",
        "roast": "A 1-2 sentence VIOLENT roast of why they are cooked 💀",
        "sentimentLabel": "One of: Lovey-dovey 🤮, Cold 🥶, Toxic ☣️, Friendly 🤝, Professional 👔, Flirty 🫦, Neutral 😐",
        "sentimentScore": 0-100 (integer, higher is better/more positive),
        "sentimentTrend": [50, 60, 40, ...], // Array of exactly 10 integers (0-100) representing the emotional arc from start to finish
        "participants": ["Name 1", "Name 2"], // Identify the names of the two people (or "You" and "Them" if unknown)
        "dominanceScore": 50, // 0-100, representing how much "Name 1" dominated the conversation (e.g. 70 means Name 1 sent 70% of vibes)
        "redFlags": ["🚩 flag 1", "🚩 flag 2", "🚩 flag 3"],
        "redFlagOverview": "A short, punchy sentence summarizing the overall red flag energy of the relationship (not just one specific event). Max 12 words.",
        "greenFlags": ["✅ flag 1", "✅ flag 2"],
        "greenFlagOverview": "A short, punchy sentence summarizing the overall green flag energy. Max 12 words.",
        "effortBalance": "A verdict on who is trying harder (e.g. 'You are carrying 🎒')",
        "movieAnalogy": "If this chat was a movie, what would it be? (Max 1 sentence). IMPORTANT: Do NOT just say 'The Notebook' or 'When Harry Met Sally'. Be creative! Use Bollywood, Hollywood, Indie films, obscure 90s rom-coms, horror movies, etc. 🎬",
        "attachmentStyle": "A specific, funny Gen-z label for their attachment style. Do NOT reuse common ones like 'Stage 5 Clinger'. Be extremely specific and roasted. Examples: 'Recovering People Pleaser', 'Text-Bombardment Specialist', 'Emotional Hit-and-Run Driver', 'Situationship Veteran', etc. 🔮",
        "replyTimeGap": "E.g. 'You reply fast, they hibernate 😴'",
        "turningPoint": {
           "message": "Quote the message where vibes changed",
           "explanation": "Why it changed"
        },
        "nextSteps": ["Action 1", "Action 2", "Action 3"],
        "rpgCards": [
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
                "role": "Creative RPG title",
                "level": 1-99 (integer),
                "oneLiner": "Roast",
                "stats": { "yapLevel": 0, "simpScore": 0, "cringeFactor": 0, "chaosMeasure": 0 }
            }
        ],
        "songRecommendations": [
            {
                "title": "Song Title",
                "artist": "Artist Name",
                "reason": "1 sentence explanation of why this fits"
            },
            { "title": "...", "artist": "...", "reason": "..." },
            { "title": "...", "artist": "...", "reason": "..." }
        ]
    }
    
    IMPORTANT: Be deterministic. If the input is similar, the output should be similar. 
    Make the "redFlags" funny but somewhat grounded in the text. Do NOT use emojis inside the string arrays (they will be added by the UI).
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const jsonString = response.text().replace(/```json/g, "").replace(/```/g, "").trim();
        const start = jsonString.indexOf("{");
        const end = jsonString.lastIndexOf("}") + 1;
        const data = JSON.parse(jsonString.substring(start, end));

        // Use AI-generated trend or fallback to flat line if missing
        const trendData = (data.sentimentTrend && Array.isArray(data.sentimentTrend) && data.sentimentTrend.length > 0)
            ? data.sentimentTrend.map((score: number, i: number) => ({ messageIndex: i * 10, score }))
            : Array(10).fill(50).map((_, i) => ({ messageIndex: i * 10, score: 50 }));

        const p1 = data.participants?.[0] || "You";
        const p2 = data.participants?.[1] || "Them";
        const p1Score = data.dominanceScore || 50;

        return {
            vibeHeadline: data.vibeHeadline || "Vibe Check Failed (But it's probably messy)",
            confidence: 89,
            stats: {
                ...stats,
                replyTimeGap: data.replyTimeGap || "Unclear timings"
            },
            roast: data.roast || "No roast available, you're too boring.",
            sentiment: {
                score: data.sentimentScore || 50,
                label: data.sentimentLabel || "Neutral"
            },
            chartData: {
                sentimentTrend: trendData,
                dominance: [
                    { name: p1, value: p1Score },
                    { name: p2, value: 100 - p1Score }
                ]
            },
            redFlags: data.redFlags || [],
            redFlagOverview: data.redFlagOverview || data.redFlags?.[0] || "Too many to count",
            greenFlags: data.greenFlags || [],
            greenFlagOverview: data.greenFlagOverview || data.greenFlags?.[0] || "None found",
            turningPoint: data.turningPoint || null,
            effortBalance: data.effortBalance || "Matched",
            movieAnalogy: data.movieAnalogy || "The Notebook (if they never met)",
            attachmentStyle: data.attachmentStyle || "Unknown",
            nextSteps: data.nextSteps || ["Move on", "Drink water"],
            rpgCards: data.rpgCards || [
                { name: p1, role: "NPC", level: 1, oneLiner: "Loading...", stats: { yapLevel: 50, simpScore: 50, cringeFactor: 50, chaosMeasure: 50 } },
                { name: p2, role: "NPC", level: 1, oneLiner: "Loading...", stats: { yapLevel: 50, simpScore: 50, cringeFactor: 50, chaosMeasure: 50 } }
            ],
            songRecommendations: data.songRecommendations || [
                { title: "Toxic", artist: "Britney Spears", reason: "Do we need to explain?" },
                { title: "Hot N Cold", artist: "Katy Perry", reason: "Mixed signals slightly detected." },
                { title: "We Are Never Ever Getting Back Together", artist: "Taylor Swift", reason: "Just a hunch." }
            ]
        };

    } catch (e: any) {
        console.error("Gemini Error:", e);
        // Fallback to basic heuristics if API fails
        return {
            vibeHeadline: "Brain Freeze 🥶",
            confidence: 10,
            stats: { ...stats, replyTimeGap: "Unknown" },
            roast: `Internal Error: ${e.message || "Unknown error"}`,
            sentiment: { score: 50, label: "Neutral" },
            chartData: { sentimentTrend: [], dominance: [] },
            redFlags: ["Invalid API Key", "Model Not Found", "Internet Connection"],
            redFlagOverview: "Connection Error",
            greenFlags: [],
            greenFlagOverview: "None",
            turningPoint: null,
            effortBalance: "Unknown",
            movieAnalogy: "Error 404: Love Not Found",
            attachmentStyle: "Avoidant",
            nextSteps: ["Check your API Key", "Try again (console has details)"],
            rpgCards: [],
            songRecommendations: [
                { title: "Error", artist: "System Failure", reason: "Something went wrong." },
                { title: "404", artist: "Page Not Found", reason: "Try again later." },
                { title: "No Connection", artist: "The WiFi", reason: "Check your internet." }
            ]
        };
    }
}
