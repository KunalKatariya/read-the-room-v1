"use client";

import { useState, useEffect, Suspense } from "react";
import LandingHero from "@/components/LandingHero";
import ChatInput from "@/components/ChatInput";
import AnalysisResultView from "@/components/AnalysisResult";
import ErrorView from "@/components/ErrorView";
import ExportInstructions from "@/components/ExportInstructions";
import { analyzeChatWithGemini, type AnalysisResult } from "@/lib/analyzer";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";

function AppContent() {
  const searchParams = useSearchParams();
  const [view, setView] = useState<"landing" | "input" | "result" | "error" | "instructions">("landing");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
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
    // 1. Check for shared ID
    const id = searchParams.get("id");
    if (id) {
      setLoading(true);
      fetch(`/api/share?id=${id}`)
        .then(res => res.json())
        .then(data => {
          if (data.error) {
            console.error("Share not found");
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
        {view === "landing" && (
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
                  const res = await analyzeChatWithGemini(text, apiKey);

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
