"use client";

import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { submitReviewAction } from "@/app/actions";
import { Button } from "@/components/ui/button";

export default function ReviewForm() {
    const [stars, setStars] = useState(0);
    const [hoverStars, setHoverStars] = useState(0);
    const [text, setText] = useState("");
    const [name, setName] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [error, setError] = useState("");

    // Check if already submitted locally
    useEffect(() => {
        if (localStorage.getItem("vibe_check_reviewed")) {
            setHasSubmitted(true);
        }
    }, []);

    const handleSubmit = async () => {
        if (stars === 0) {
            setError("Please rate us!");
            return;
        }
        if (text.length < 5) {
            setError("Write a bit more? (5 chars min)");
            return;
        }

        setIsSubmitting(true);
        setError("");

        try {
            const res = await submitReviewAction(stars, text, name);

            if (res.success) {
                setHasSubmitted(true);
                localStorage.setItem("vibe_check_reviewed", "true");
            } else {
                setError(res.error || "Something went wrong.");
            }
        } catch (e) {
            setError("Failed to submit.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (hasSubmitted) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-green-50 border border-green-100 p-8 rounded-2xl text-center"
            >
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                    🌟
                </div>
                <h3 className="text-xl font-black text-green-900 mb-2">Review Submitted!</h3>
                <p className="text-green-700 font-medium">Thanks for contributing to the Wall of Survivors.</p>
            </motion.div>
        );
    }

    return (
        <section className="bg-white border border-zinc-200 rounded-[2rem] p-8 md:p-10 shadow-xl shadow-zinc-200/50 mt-12 max-w-2xl mx-auto">
            <div className="text-center mb-8">
                <h3 className="text-2xl font-black text-black mb-2">Rate Your Roast</h3>
                <p className="text-zinc-500">Was it accurate? Did it hurt? Tell the world.</p>
            </div>

            <div className="flex flex-col gap-6">
                {/* Stars */}
                <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            onMouseEnter={() => setHoverStars(star)}
                            onMouseLeave={() => setHoverStars(0)}
                            onClick={() => setStars(star)}
                            className="bg-transparent border-none p-1 transition-transform hover:scale-110 focus:outline-none"
                        >
                            <Star
                                size={40}
                                className={`${star <= (hoverStars || stars)
                                        ? "fill-yellow-400 text-yellow-500"
                                        : "fill-zinc-100 text-zinc-300"
                                    } transition-colors`}
                                strokeWidth={star <= (hoverStars || stars) ? 0 : 2}
                            />
                        </button>
                    ))}
                </div>

                {/* Feedback Text */}
                <div className="space-y-4">
                    <input
                        type="text"
                        placeholder="Your Name (Optional)"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:border-black outline-none transition-all placeholder:text-zinc-400 font-bold"
                    />

                    <textarea
                        placeholder="How was the vibe check? (e.g. 'Brutally honest lol', 'I feel attacked')"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        rows={3}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:border-black outline-none resize-none transition-all placeholder:text-zinc-400"
                    />
                </div>

                {error && (
                    <div className="text-red-500 text-sm font-bold text-center animate-pulse">
                        {error}
                    </div>
                )}

                <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full h-12 bg-black text-white hover:bg-zinc-800 rounded-xl font-bold text-base shadow-lg transition-all active:scale-95"
                >
                    {isSubmitting ? "Submitting..." : "Submit Review"}
                </Button>
            </div>
        </section>
    );
}
