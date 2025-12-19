"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowDown } from "lucide-react";

export default function LandingHero({ onStart }: { onStart: () => void }) {
    return (
        <section className="min-h-[90vh] flex flex-col items-center justify-center text-center px-4 relative overflow-hidden bg-background">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="z-10 max-w-3xl"
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

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 1 }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 text-muted-foreground/50 animate-bounce"
            >
                <ArrowDown className="w-6 h-6" />
            </motion.div>
        </section>
    );
}
