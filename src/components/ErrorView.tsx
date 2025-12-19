"use client";

import { motion } from "framer-motion";

interface ErrorViewProps {
    error: string;
    onRetry: () => void;
}

export default function ErrorView({ error, onRetry }: ErrorViewProps) {
    return (
        <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6 text-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md md:max-w-2xl w-full bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-zinc-100"
            >
                <div className="text-6xl mb-6">🫠</div>
                <h1 className="text-2xl font-black text-zinc-900 mb-4 tracking-tight">
                    Vibe Check Overload
                </h1>
                <p className="text-zinc-600 mb-8 leading-relaxed">
                    Our brain is literally melting right now because too many people are checking their vibes. <br /><br />
                    <span className="font-bold text-zinc-800">It's not you, it's us.</span> (Okay, it might be a little bit you).
                </p>

                {/* Hidden for users, check console if needed */}
                {/* {error && <div className="hidden">Error: {error}</div>} */}

                <button
                    onClick={onRetry}
                    className="w-full py-4 bg-zinc-900 text-white rounded-xl font-bold hover:bg-zinc-800 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                    Try Again (Maybe?)
                </button>
            </motion.div>
        </div>
    );
}
