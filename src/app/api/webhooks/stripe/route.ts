import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { kv } from "@vercel/kv";
import Stripe from "stripe";

// Disable Next.js body parsing (handled manually for signature verification if needed, 
// but Next.js App Router req.text() works fine with Stripe)

export async function POST(req: NextRequest) {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
        return NextResponse.json({ error: "Missing signature or secret" }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err: any) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // Handle the event
    if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;
        const analysisId = session.metadata?.analysisId;

        if (analysisId) {
            console.log(`💰 Payment verified for analysis: ${analysisId}`);

            // Mark as PAID in Vercel KV
            try {
                // Fetch existing data to preserve it
                const currentData = await kv.get(`analysis:${analysisId}`) as any;

                await kv.set(`analysis:${analysisId}`, {
                    ...currentData,
                    isPaid: true
                }, { ex: 2592000 }); // Keep for 30 days

            } catch (e) {
                console.error("KV Update Failed:", e);
                return NextResponse.json({ error: "KV DB Error" }, { status: 500 });
            }
        }
    }

    return NextResponse.json({ received: true });
}
