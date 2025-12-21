"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Upload, MessageSquareText, FileText, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
    onAnalyze: (text: string, apiKey: string) => void;
    onBack: () => void;
    onShowInstructions?: () => void;
}

export default function ChatInput({ onAnalyze, onBack, onShowInstructions }: ChatInputProps) {
    const [mode, setMode] = useState<"paste" | "upload">("paste");
    const [text, setText] = useState("");
    const [isDragging, setIsDragging] = useState(false);

    // Mock file read
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const text = await file.text();
        setText(text);
        setMode("paste"); // Switch to paste view to show content
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => setIsDragging(false);

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file && (file.type === "text/plain" || file.name.endsWith(".txt") || file.name.endsWith(".csv"))) {
            const text = await file.text();
            setText(text);
            setMode("paste");
        }
    };

    // Check for Env Var
    const envKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    const hasEnvKey = envKey && envKey.length > 10 && !envKey.includes("PLACEHOLDER");

    return (
        <div className="w-full max-w-2xl mx-auto px-4 z-10">
            <button onClick={onBack} className="mb-6 text-sm text-muted-foreground hover:text-foreground transition-colors">
                ← Back to home
            </button>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white border border-zinc-200 rounded-[2rem] shadow-xl shadow-zinc-200/50 overflow-hidden"
            >
                <div className="flex border-b border-zinc-100">
                    <button
                        onClick={() => setMode("paste")}
                        className={cn(
                            "flex-1 py-4 text-sm font-bold tracking-wide transition-colors flex items-center justify-center gap-2",
                            mode === "paste" ? "bg-zinc-50 text-black border-b-2 border-black" : "text-zinc-400 hover:bg-zinc-50 hover:text-zinc-600"
                        )}
                    >
                        <MessageSquareText size={16} /> Paste Chat
                    </button>
                    <button
                        onClick={() => setMode("upload")}
                        className={cn(
                            "flex-1 py-4 text-sm font-bold tracking-wide transition-colors flex items-center justify-center gap-2",
                            mode === "upload" ? "bg-zinc-50 text-black border-b-2 border-black" : "text-zinc-400 hover:bg-zinc-50 hover:text-zinc-600"
                        )}
                    >
                        <FileText size={16} /> Upload File
                    </button>
                </div>


                {/* Persistent Helper Bar */}
                <div className="bg-zinc-50 border-b border-zinc-100 px-6 py-2 flex justify-end items-center">
                    {onShowInstructions && (
                        <button
                            onClick={(e) => { e.preventDefault(); onShowInstructions(); }}
                            className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1.5 transition-colors"
                        >
                            <HelpCircle size={14} />
                            How to export chat history?
                        </button>
                    )}
                </div>

                <div className="p-8">
                    {mode === "paste" ? (
                        <div className="space-y-4">
                            <Textarea
                                placeholder="Paste your conversation here... (e.g. WhatsApp export or just copy-paste)"
                                className="min-h-[300px] font-mono text-sm leading-relaxed resize-none bg-zinc-50/50 border-zinc-200 focus:bg-white focus:border-black transition-all placeholder:text-zinc-300 text-zinc-800"
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                            />
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs text-zinc-400 font-medium uppercase tracking-wide">
                                <span>{text.length} chars</span>
                                <span>We don't store this, <span className="text-pink-400 font-bold">pinky promise 😉</span></span>
                            </div>
                        </div>
                    ) : (
                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={cn(
                                "border-2 border-dashed rounded-xl h-[300px] flex flex-col items-center justify-center gap-4 transition-all",
                                isDragging ? "border-black bg-zinc-50" : "border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"
                            )}
                        >
                            <div className="p-4 bg-zinc-100 rounded-full">
                                <Upload className="w-8 h-8 text-black" />
                            </div>
                            <div className="text-center">
                                <p className="font-bold text-black">Drag & drop your chat file</p>
                                <p className="text-sm text-zinc-400 mt-1">.txt, .csv, or plain text</p>
                            </div>
                            <input
                                type="file"
                                accept=".txt,.csv"
                                className="hidden"
                                id="file-upload"
                                onChange={handleFileChange}
                            />
                            <Button variant="outline" onClick={() => document.getElementById("file-upload")?.click()}>
                                Browse Files
                            </Button>
                        </div>
                    )}
                </div>

                <div className="p-8 border-t border-zinc-100 bg-zinc-50/50 flex flex-col gap-6">
                    {!hasEnvKey && (
                        <>
                            <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl text-xs text-orange-800 flex flex-col gap-1">
                                <strong className="font-bold uppercase tracking-wide text-orange-900">Config Required</strong>
                                <span>You need a Google Gemini API Key. <a href="https://aistudio.google.com/app/apikey" target="_blank" className="underline font-medium">Get one here</a>.</span>
                            </div>
                            <input
                                type="password"
                                placeholder="Paste Gemini API Key (begins with AIza...)"
                                className="w-full bg-white border border-zinc-200 rounded-lg px-4 py-3 text-sm focus:border-black outline-none shadow-sm transition-all placeholder:text-zinc-300"
                                id="api-key-input"
                            />
                        </>
                    )}

                    <div className="flex justify-end">
                        <Button
                            size="lg"
                            onClick={() => {
                                let key = envKey;
                                if (!hasEnvKey) {
                                    key = (document.getElementById("api-key-input") as HTMLInputElement).value;
                                }

                                if (!key) {
                                    alert("Please enter an API Key");
                                    return;
                                }
                                onAnalyze(text, key);
                            }}
                            disabled={text.length < 10}
                            className="w-full sm:w-auto bg-black text-white hover:bg-zinc-800 font-bold rounded-full h-14 px-8 shadow-xl shadow-zinc-200"
                        >
                            Analyze Vibe ✨
                        </Button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
