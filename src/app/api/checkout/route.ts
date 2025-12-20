import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { kv } from "@vercel/kv";
import { getPricingForCountry } from "@/lib/pricing";

export async function POST(req: NextRequest) {
    try {
        const { analysisId } = await req.json();

        if (!analysisId) {
            return NextResponse.json({ error: "Missing analysis ID" }, { status: 400 });
        }

        // Verify this analysis exists
        const analysis = await kv.get(`analysis:${analysisId}`);
        if (!analysis) {
            return NextResponse.json({ error: "Analysis not found. Please try analyzing again." }, { status: 404 });
        }

        // Determine pricing server-side based on IP
        const ipCountry = req.headers.get("x-vercel-ip-country") || "US";
        const pricing = getPricingForCountry(ipCountry);

        // Create Checkout Session
        const session = await stripe.checkout.sessions.create({
            automatic_payment_methods: {
                enabled: true,
            },
            line_items: [
                {
                    price_data: {
                        currency: pricing.currency,
                        product_data: {
                            name: "Vibe Check (Full Report)",
                            description: "Unlock detailed roasts, red flags, and compatibility score.",
                            images: ["https://vibe-check.vercel.app/og-image.png"],
                        },
                        unit_amount: pricing.amount,
                    },
                    quantity: 1,
                },
            ],
            mode: "payment",
            metadata: {
                analysisId: analysisId,
            },

            success_url: `${req.headers.get("origin")}/?id=${analysisId}&payment=success`,
            cancel_url: `${req.headers.get("origin")}/?id=${analysisId}&payment=cancelled`,
        } as any);

        return NextResponse.json({ url: session.url });
    } catch (error: any) {
        console.error("Stripe Checkout Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
