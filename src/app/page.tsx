"use client";

import { useState, useEffect, Suspense } from "react";
import LandingHero from "@/components/LandingHero";
import ChatInput from "@/components/ChatInput";
import AnalysisResultView from "@/components/AnalysisResult";
import ErrorView from "@/components/ErrorView";
import ExportInstructions from "@/components/ExportInstructions";
import { analyzeChatAction } from "./actions";
import { type AnalysisResult } from "@/lib/analyzer";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";

function AppContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  // Check if we have an ID immediately to prevent flash of landing page
  const hasIdParam = searchParams.has("id");

  const [view, setView] = useState<"landing" | "input" | "result" | "error" | "instructions">(
    hasIdParam ? "result" : "landing" // Optimistically set to result (or loading) to hide hero
  );
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(hasIdParam); // Start loading if ID exists
  const [errorMsg, setErrorMsg] = useState("");

  const [isPublicShare, setIsPublicShare] = useState(false);

  const startAnalysis = () => {
    setIsPublicShare(false); // Reset shared state for new analysis
    setView("input");
  };

  const loadingMessages = [
    "Analyzing text patterns...",
    "Calculating cringe levels...",
    "Detecting red flags...",
    "Consulting the Vibe Council...",
    "Decoding passive aggression...",
    "Checking horoscope compatibility...",
    "Generating brutal honesty..."
  ];

  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);

  useEffect(() => {
    // 1. Check for shared ID OR Analysis ID (from payment redirect)
    const id = searchParams.get("id");

    if (id) {
      setLoading(true);

      // Try fetching as a SHARE first (public)
      fetch(`/api/share?id=${id}`)
        .then(res => res.json())
        .then(async data => {
          if (data.error || !data.roast) {
            // Not a share ID? Maybe it's an Analysis ID (from payment redirect)
            // Dynamically import Server Action to fetch private analysis
            try {
              const { getAnalysisAction } = await import("./actions");
              const privateResult = await getAnalysisAction(id);

              if (privateResult) {
                setResult(privateResult);
                setIsPublicShare(false); // Explicitly private/locked
                setView("result");
              } else {
                // It wasn't a private analysis either. Real error.
                console.error("Analysis not found");
                setErrorMsg(data.error || "Analysis not found. The link might be expired or invalid.");
                setView("error");
              }
            } catch (e) {
              console.error("Failed to recover private analysis", e);
              setErrorMsg(data.error || "Failed to retrieve analysis.");
              setView("error");
            }

          } else {
            // Inject the current ID so AnalysisResult knows it's already shared
            setResult({ ...data, shareId: id });
            setIsPublicShare(true); // Explicitly public/unlocked
            setView("result");
          }
        })
        .catch(err => {
          console.error("Failed to load share", err);
          setErrorMsg("Network error loading shared result.");
          setView("error");
        })
        .finally(() => setLoading(false));
      return;
    } else {
      // STRICT SYNC: If NO ID is present in URL, we MUST NOT be in public share mode.
      // This fixes Safari/Mobile issues where state persists even after URL clears.
      setIsPublicShare(false);
    }

    // 2. Load saved result from localStorage (survives refresh, clears on close)
    const savedResult = localStorage.getItem("vibe_check_result");
    if (savedResult) {
      try {
        const parsed = JSON.parse(savedResult);
        setResult(parsed);
        setView("result");
      } catch (e) {
        console.error("Failed to parse saved result", e);
        localStorage.removeItem("vibe_check_result");
      }
    }
  }, [searchParams]);

  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setLoadingMsgIndex((prev) => (prev + 1) % loadingMessages.length);
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [loading]);

  const handleBack = () => {
    localStorage.removeItem("vibe_check_result");
    setResult(null);
    setIsPublicShare(false);
    setView("landing");
  };

  return (
    <main className="min-h-screen bg-background relative selection:bg-zinc-200 text-foreground font-sans">
      <AnimatePresence mode="wait">
        {view === "landing" && !loading && (
          <LandingHero key="hero" onStart={startAnalysis} />
        )}

        {view === "input" && (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="min-h-screen pt-20 pb-10 flex items-center justify-center p-4"
          >
            <ChatInput
              onBack={() => setView("landing")}
              onShowInstructions={() => setView("instructions")}
              onAnalyze={async (text, apiKey) => {
                setLoading(true);
                // Ensure we are not in shared mode for a new analysis
                setIsPublicShare(false);
                try {
                  // Truncate payload to ~2MB (Server Actions limit is 10MB configured in next.config.ts)
                  const MAX_CHARS = 2000000;
                  // FIX: Take the END of the string (latest messages) instead of the beginning
                  const payload = text.length > MAX_CHARS ? text.substring(text.length - MAX_CHARS) : text;

                  // Call Server Action directly
                  const res = await analyzeChatAction(payload);

                  if (res.roast.startsWith("Internal Error:")) {
                    setErrorMsg(res.roast.replace("Internal Error:", "").trim());
                    setView("error");
                  } else {
                    setResult(res);
                    localStorage.setItem("vibe_check_result", JSON.stringify(res));
                    setView("result");
                  }
                } catch (e: any) {
                  setErrorMsg(e.message || "Unknown error occurred");
                  setView("error");
                } finally {
                  setLoading(false);
                }
              }}
            />
            {loading && (
              <div className="fixed inset-0 bg-white/95 z-50 flex items-center justify-center flex-col gap-8">
                <div className="relative">
                  <div className="w-20 h-20 border-8 border-zinc-100 border-t-black rounded-full animate-spin" />
                </div>
                <p className="text-xl md:text-2xl font-black text-black animate-pulse tracking-tight min-h-[40px] text-center">
                  {loadingMessages[loadingMsgIndex]}
                </p>
              </div>
            )}
          </motion.div>
        )}

        {view === "result" && result && (
          <motion.div
            key="result"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen flex items-center justify-center"
          >
            <AnalysisResultView
              result={result}
              isSharedView={isPublicShare}
              onBack={() => {
                // Clear URL param using Next.js router
                router.replace("/", { scroll: false });

                // Aggressive fallback for Safari
                if (typeof window !== "undefined") {
                  window.history.replaceState(null, "", "/");
                }

                setIsPublicShare(false); // Reset shared state
                localStorage.removeItem("vibe_check_result"); // Ensure no stale data
                setView("input");
                setResult(null);
              }}
            />
          </motion.div>
        )}

        {view === "instructions" && (
          <motion.div
            key="instructions"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex items-center justify-center pt-20 pb-10"
          >
            <ExportInstructions onBack={() => setView("input")} />
          </motion.div>
        )}

        {view === "error" && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex items-center justify-center"
          >
            <ErrorView error={errorMsg} onRetry={() => setView("input")} />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-950" />}>
      <AppContent />
    </Suspense>
  );
}
