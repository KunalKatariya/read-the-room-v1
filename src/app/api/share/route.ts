import { createClient } from "@vercel/kv";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

// 10 days in seconds
const EXPIRATION_SECONDS = 60 * 60 * 24 * 10;

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
        const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

        // Debug checks
        if (!url || !token) {
            console.error("Missing Redis/KV environment variables");
            return NextResponse.json({ error: "Database not connected (Missing Env Vars)" }, { status: 500 });
        }

        const kv = createClient({
            url,
            token,
        });

        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id") || uuidv4();

        // Store in KV with expiration
        await kv.set(`share:${id}`, body, { ex: EXPIRATION_SECONDS });

        return NextResponse.json({ id });
    } catch (error: any) {
        console.error("Share error:", error);
        return NextResponse.json({ error: "Failed to create share link", details: error.message || String(error) }, { status: 500 });
    }
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
        return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }

    try {
        const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
        const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

        if (!url || !token) {
            return NextResponse.json({ error: "Database not connected" }, { status: 500 });
        }

        const kv = createClient({
            url,
            token,
        });

        const data = await kv.get(`share:${id}`);

        if (!data) {
            return NextResponse.json({ error: "Result not found" }, { status: 404 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error("Retrieve error:", error);
        return NextResponse.json({ error: "Failed to retrieve result" }, { status: 500 });
    }
}
