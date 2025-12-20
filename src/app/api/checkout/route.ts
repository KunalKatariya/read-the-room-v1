import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { kv } from "@vercel/kv";

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

        // Create Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: "Vibe Check (Full Report)",
                            description: "Unlock detailed roasts, red flags, and compatibility score.",
                            images: ["https://vibe-check.vercel.app/og-image.png"], // Optional: Add real image URL
                        },
                        unit_amount: 299, // $2.99 USD default
                    },
                    quantity: 1,
                },
            ],
            mode: "payment",
            metadata: {
                analysisId: analysisId, // CRITICAL: This connects payment to the chat
            },
            // Dynamic currency logic:
            // If user is from India, we want to charge ₹199. 
            // Stripe handles this via "multi-currency prices" if you create a Product in dashboard.
            // For inline items like this, we can rely on Stripe's auto-conversion or 
            // explicit currency detection logic here if needed.
            // For MVP, we stick to USD global base.

            success_url: `${req.headers.get("origin")}/?id=${analysisId}&payment=success`,
            cancel_url: `${req.headers.get("origin")}/?id=${analysisId}&payment=cancelled`,
        });

        return NextResponse.json({ url: session.url });
    } catch (error: any) {
        console.error("Stripe Checkout Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
