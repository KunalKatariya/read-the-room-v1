"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { ArrowLeft, MessageCircle, Instagram, Send } from "lucide-react"; // Assuming Send as Telegram icon
import { cn } from "@/lib/utils";

interface ExportInstructionsProps {
    onBack: () => void;
}

const PLATFORMS = [
    {
        id: "whatsapp",
        name: "WhatsApp",
        icon: MessageCircle,
        color: "bg-green-500",
        tabs: [
            {
                id: "ios",
                label: "iOS",
                steps: [
                    "Open the chat you want to export.",
                    "Tap the contact's name at the top of the screen.",
                    "Scroll down and tap 'Export Chat'.",
                    "Select 'Without Media'.",
                    "Choose 'Save to Files' to save the ZIP, or share it to your computer.",
                    "Upload the archive or txt file here."
                ]
            },
            {
                id: "android",
                label: "Android",
                steps: [
                    "Open the chat you want to export.",
                    "Tap the three dots (⋮) in the top right corner.",
                    "Tap 'More', then 'Export Chat'.",
                    "Select 'Without Media'.",
                    "Share via Email or Drive to get the file.",
                    "Upload the .txt file here."
                ]
            }
        ]
    },
    {
        id: "instagram",
        name: "Instagram",
        icon: Instagram,
        color: "bg-pink-500",
        tabs: [
            {
                id: "default",
                label: "Default",
                steps: [
                    "We recommend just copy-pasting for Instagram.",
                    "Web Export: Go to 'Your Activity' -> 'Download Your Information'.",
                    "This takes a long time (hours/days).",
                    "Easier way: Scroll up in your chat, highlight the text, Copy (Ctrl+C), and Paste (Ctrl+V) into the text box.",
                    "Screenshots: Unsupported (we can't read images yet!)."
                ]
            }
        ]
    },
    {
        id: "telegram",
        name: "Telegram",
        icon: Send,
        color: "bg-sky-500",
        tabs: [
            {
                id: "default",
                label: "Default",
                steps: [
                    "Open Telegram Desktop (easiest way).",
                    "Click the three dots in the top right of the chat.",
                    "Select 'Export Chat History'.",
                    "Uncheck 'Photos' and 'Videos', make sure format is 'JSON' or 'HTML' (convert to text) or just copy paste.",
                    "Actually, wait. Just open the chat, CTRL+A to select all messages, CTRL+C to copy.",
                    "Paste it directly into our 'Paste Chat' box."
                ]
            }
        ]
    }
];

export default function ExportInstructions({ onBack }: ExportInstructionsProps) {
    const [selectedPlatform, setSelectedPlatform] = useState(PLATFORMS[0]);
    // State to track active tab for the selected platform
    const [activeTabId, setActiveTabId] = useState<string>(PLATFORMS[0].tabs[0].id);

    // Filter to get the current tab's steps
    const currentTab = selectedPlatform.tabs.find(t => t.id === activeTabId) || selectedPlatform.tabs[0];

    return (
        <div className="w-full max-w-3xl mx-auto px-4 z-10 transition-all duration-300 ease-in-out">
            <button onClick={onBack} className="mb-6 text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
                <ArrowLeft size={16} /> Back to upload
            </button>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white border border-zinc-200 rounded-[2rem] shadow-xl shadow-zinc-200/50 overflow-hidden"
            >
                <div className="p-8 pb-4">
                    <h2 className="text-2xl font-black text-zinc-900 tracking-tight mb-2">How to export your chat</h2>
                    <p className="text-zinc-500">Choose your platform to see the steps.</p>
                </div>

                <div className="flex gap-4 p-8 pt-0 overflow-x-auto pb-8 no-scrollbar">
                    {PLATFORMS.map((platform) => {
                        const Icon = platform.icon;
                        const isSelected = selectedPlatform.id === platform.id;
                        return (
                            <button
                                key={platform.id}
                                onClick={() => {
                                    setSelectedPlatform(platform);
                                    setActiveTabId(platform.tabs[0].id); // Reset tab when switching platform
                                }}
                                className={cn(
                                    "flex flex-col items-center gap-3 p-4 rounded-2xl min-w-[100px] border-2 transition-all",
                                    isSelected
                                        ? "border-black bg-zinc-50 shadow-inner"
                                        : "border-zinc-100 hover:border-zinc-200 hover:bg-zinc-50/50"
                                )}
                            >
                                <div className={cn("w-12 h-12 rounded-full flex items-center justify-center text-white shadow-sm", platform.color)}>
                                    <Icon size={24} />
                                </div>
                                <span className={cn("text-xs font-bold uppercase tracking-wide", isSelected ? "text-zinc-900" : "text-zinc-500")}>
                                    {platform.name}
                                </span>
                            </button>
                        );
                    })}
                </div>

                <div className="p-8 pt-0 min-h-[300px]">
                    <motion.div
                        key={selectedPlatform.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2 }}
                        className="bg-zinc-50 rounded-xl p-8 border border-zinc-100"
                    >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                Exporting from {selectedPlatform.name}
                            </h3>

                            {/* Render Tabs if more than one */}
                            {selectedPlatform.tabs.length > 1 && (
                                <div className="bg-white rounded-lg p-1 border border-zinc-200 flex gap-1 self-start md:self-auto">
                                    {selectedPlatform.tabs.map(tab => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTabId(tab.id)}
                                            className={cn(
                                                "px-4 py-1.5 rounded-md text-xs font-bold uppercase transition-all",
                                                activeTabId === tab.id
                                                    ? "bg-zinc-900 text-white shadow-sm"
                                                    : "text-zinc-500 hover:bg-zinc-50"
                                            )}
                                        >
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <motion.div
                            key={activeTabId} // Animate change between tabs
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <ol className="space-y-4">
                                {currentTab.steps.map((step, i) => (
                                    <li key={i} className="flex gap-4 text-zinc-600">
                                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-xs font-bold text-zinc-400">
                                            {i + 1}
                                        </span>
                                        <span className="leading-snug">{step}</span>
                                    </li>
                                ))}
                            </ol>
                        </motion.div>
                    </motion.div>
                </div>

                <div className="p-8 bg-zinc-50/50 text-center text-xs text-zinc-400 border-t border-zinc-100">
                    Pro tip: If all else fails, just copy and paste the most interesting part of the conversation.
                </div>
            </motion.div>
        </div>
    );
}
