
import React from 'react';
import { motion } from 'framer-motion';

import { getPricingAction } from '@/app/actions';

interface PremiumGateProps {
    onUnlock: () => void;
}

export default function PremiumGate({ onUnlock }: PremiumGateProps) {
    const [price, setPrice] = React.useState("$2.99");

    React.useEffect(() => {
        getPricingAction().then(p => {
            if (p) setPrice(p.display);
        });
    }, []);

    return (
        <div className="absolute inset-0 z-10 h-full w-full pointer-events-auto">
            <div className="sticky top-[20vh] flex flex-col items-center justify-center p-4 text-center">
                <div className="bg-white/90 backdrop-blur-md p-5 md:p-8 rounded-3xl shadow-2xl border border-white/50 max-w-sm md:max-w-md w-full">
                    <div className="text-3xl md:text-4xl mb-2 md:mb-4">🔒</div>
                    <h3 className="text-lg md:text-2xl font-bold text-zinc-900 mb-1 md:mb-2">Unlock Full Vibe Check</h3>
                    <p className="text-xs md:text-base text-zinc-600 mb-4 md:mb-6">
                        See the roast, red flags, compatibility rating, and future outlook.
                    </p>

                    <div className="space-y-2 md:space-y-3 mb-5 md:mb-8 text-left">
                        <div className="flex items-center gap-2 text-xs md:text-sm text-zinc-700">
                            <span className="text-green-500">✓</span> Unfiltered Roasts
                        </div>
                        <div className="flex items-center gap-2 text-xs md:text-sm text-zinc-700">
                            <span className="text-green-500">✓</span> Detailed Red & Green Flags
                        </div>
                        <div className="flex items-center gap-2 text-xs md:text-sm text-zinc-700">
                            <span className="text-green-500">✓</span> Movie Analogy & Soulmate Soundtrack
                        </div>
                    </div>

                    <button
                        onClick={onUnlock}
                        className="w-full bg-gradient-to-r from-pink-500 to-violet-600 text-white font-bold py-3 md:py-4 rounded-xl shadow-lg hover:scale-[1.02] transition-transform active:scale-[0.98] text-sm md:text-base"
                    >
                        Unlock ({price})
                    </button>
                    <p className="text-[10px] md:text-xs text-zinc-400 mt-3 md:mt-4">One-time payment. No subscription.</p>
                </div>
            </div>
        </div>
    );
}
