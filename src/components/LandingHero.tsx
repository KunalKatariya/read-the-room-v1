"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { useEffect, useState } from "react";
import { getReviewsAction, type Review } from "@/app/actions";

export default function LandingHero({ onStart }: { onStart: () => void }) {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        // Delay fetch to let the main hero animation (0.8s) finish smoothly first
        const timer = setTimeout(() => {
            getReviewsAction().then(data => {
                if (data && data.length > 0) {
                    setReviews(data);
                }
            });
        }, 800);

        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => {
            window.removeEventListener('resize', checkMobile);
            clearTimeout(timer);
        };
    }, []);

    // Mobile: Marquee if > 1 review (2+)
    // Desktop: Marquee if > 3 reviews (4+)
    const isMarquee = isMobile ? reviews.length > 1 : reviews.length > 3;

    // Ensure we have enough content to scroll smoothly
    // If fewer than 10 items, repeat list until it's at least 10 items long
    // This ensures consistent visual density and speed calculation
    const displayReviews = [...reviews];
    while (isMarquee && displayReviews.length < 10 && displayReviews.length > 0) {
        displayReviews.push(...reviews);
    }

    // Dynamic Duration: Slower pace requested (~45s baseline).
    // ~4s per item ensures it remains readable and leisurely.
    const duration = `${Math.max(45, displayReviews.length * 4)}s`;

    return (
        <section className="min-h-[90vh] flex flex-col items-center justify-center text-center px-4 relative overflow-hidden bg-background pb-20 pt-32">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="z-10 max-w-3xl mb-12"
            >
                <div className="inline-block px-4 py-1.5 mb-8 border border-zinc-200 rounded-full bg-white text-xs font-bold tracking-widest text-zinc-500 uppercase shadow-sm">
                    Not Therapy. Just Vibes.
                </div>
                <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 text-black leading-[0.9]">
                    What’s the <br /><span className="italic text-zinc-400">real</span> vibe?
                </h1>
                <p className="text-base md:text-2xl text-zinc-500 mb-10 max-w-xl mx-auto font-medium tracking-tight">
                    Paste your chat. Get a brutal reality check.
                    <br />
                    <span className="text-zinc-400 text-sm md:text-lg">We read between the lines so you don't have to.</span>
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Button size="lg" className="bg-black text-white hover:bg-zinc-800 text-lg px-8 h-14 rounded-full font-bold shadow-lg shadow-zinc-200" onClick={onStart}>
                        Analyze My Chat
                    </Button>
                </div>
            </motion.div>

            {/* WALL OF SURVIVORS */}
            {reviews.length > 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="w-full flexflex-col items-center gap-4 mt-8"
                >
                    <p className="text-xs font-bold uppercase tracking-widest text-zinc-300 mb-4">Wall of Survivors</p>

                    <div className="relative w-full overflow-hidden pointer-events-none fade-mask">
                        {isMarquee ? (
                            <div
                                className="flex min-w-full w-max animate-marquee will-change-transform"
                                style={{ animationDuration: duration }}
                            >
                                {/* We render the set twice to create the seamless loop effect */}
                                {[...Array(2)].map((_, groupIndex) => (
                                    <div key={groupIndex} className="flex shrink-0">
                                        {displayReviews.map((review, i) => (
                                            <ReviewCard key={`${groupIndex}-${i}`} review={review} className="mr-6" />
                                        ))}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex justify-center flex-wrap gap-4 px-4 w-full">
                                {reviews.map((review, i) => (
                                    <ReviewCard key={i} review={review} />
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>
            )}

            <style jsx global>{`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee {
                    animation-name: marquee;
                    animation-timing-function: linear;
                    animation-iteration-count: infinite;
                }
                .fade-mask {
                    mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
                    -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
                }
            `}</style>
        </section>
    );
}

function ReviewCard({ review, className }: { review: Review, className?: string }) {
    return (
        <div className={`inline-block bg-white/80 backdrop-blur-sm border border-zinc-200 px-4 py-2 rounded-xl shadow-sm min-w-[250px] max-w-[300px] text-left ${className || ""}`}>
            <div className="flex items-center gap-1 mb-1">
                {[...Array(5)].map((_, idx) => (
                    <Star key={idx} size={12} className={idx < review.stars ? "fill-yellow-400 text-yellow-400" : "fill-zinc-200 text-zinc-200"} />
                ))}
                <span className="text-[10px] font-bold text-zinc-400 ml-2 uppercase tracking-wider truncate max-w-[100px]">{review.name}</span>
            </div>
            <p className="text-xs font-medium text-zinc-800 truncate">"{review.text}"</p>
        </div>
    );
}
