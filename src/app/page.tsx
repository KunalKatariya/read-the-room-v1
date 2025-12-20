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
import { useSearchParams } from "next/navigation";

function AppContent() {
  const searchParams = useSearchParams();
  // Check if we have an ID immediately to prevent flash of landing page
  const hasIdParam = searchParams.has("id");

  const [view, setView] = useState<"landing" | "input" | "result" | "error" | "instructions">(
    hasIdParam ? "result" : "landing" // Optimistically set to result (or loading) to hide hero
  );
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(hasIdParam); // Start loading if ID exists
  const [errorMsg, setErrorMsg] = useState("");

  const startAnalysis = () => {
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
            const { getAnalysisAction } = await import("./actions");
            const privateResult = await getAnalysisAction(id);

            if (privateResult) {
              setResult(privateResult);
              setView("result");
              // If payment=success, we rely on AnalysisResult's internal logic to unlock
            } else {
              console.error("Analysis not found");
              setView("landing"); // Or error
            }

          } else {
            // Inject the current ID so AnalysisResult knows it's already shared
            setResult({ ...data, shareId: id });
            setView("result");
          }
        })
        .catch(err => console.error("Failed to load share", err))
        .finally(() => setLoading(false));
      return;
    }

    // 2. Load saved result from localStorage (if no ID)
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
                try {
                  // Call Server Action directly
                  const res = await analyzeChatAction(text);

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
              isSharedView={!!searchParams.get("id")}
              onBack={() => {
                setView("input");
                setResult(null);
                // Clear URL param
                window.history.replaceState(null, "", window.location.pathname);
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
