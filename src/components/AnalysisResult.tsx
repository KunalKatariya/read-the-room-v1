"use client";

import { motion } from "framer-motion";
import { AnalysisResult } from "@/lib/analyzer";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, ReferenceLine } from "recharts";
import { toPng } from "html-to-image";
import { useRef, useState } from "react";

import { jsPDF } from "jspdf";

interface AnalysisResultViewProps {
    result: AnalysisResult;
    onBack: () => void;
}

export default function AnalysisResultView({ result, onBack }: AnalysisResultViewProps) {
    const receiptRef = useRef<HTMLDivElement>(null);
    const pdfRef = useRef<HTMLDivElement>(null); // Ref for the visible UI
    const desktopPdfRef = useRef<HTMLDivElement>(null); // Ref for the hidden Desktop PDF template
    const [isThinking, setIsThinking] = useState(false);

    // Get participant names for filenames
    const names = result.chartData.dominance.map(d => d.name).join("_") || "readtheroom";

    const handleDownloadReceipt = async () => {
        if (!receiptRef.current) return;
        setIsThinking(true);
        try {
            const dataUrl = await toPng(receiptRef.current, {
                cacheBust: true,
                backgroundColor: "#ffffff",
                pixelRatio: 2, // Retina quality
            });
            const link = document.createElement("a");
            link.href = dataUrl;
            link.download = `${names}_story.png`;
            link.click();
        } catch (error) {
            console.error("Failed to generate receipt", error);
        } finally {
            setIsThinking(false);
        }
    };

    const handleDownloadPDF = async () => {
        if (!desktopPdfRef.current) return;
        setIsThinking(true);
        try {
            // Force capture of the desktop template
            const imgData = await toPng(desktopPdfRef.current, {
                cacheBust: true,
                backgroundColor: '#ffffff',
                pixelRatio: 2,
                width: 1200, // Explicitly capture at desktop width
            });

            const pdfWidth = 210; // A4 width in mm
            // Calculate height based on the ratio of the captured image
            const ratio = desktopPdfRef.current.offsetHeight / desktopPdfRef.current.offsetWidth;
            const pdfHeight = pdfWidth * ratio;

            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: [pdfWidth, pdfHeight]
            });

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${names}_report.pdf`);
        } catch (error) {
            console.error("Failed to generate PDF", error);
        } finally {
            setIsThinking(false);
        }
    };


    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white border border-zinc-200 p-3 rounded-xl shadow-xl text-xs font-medium text-zinc-600">
                    <p>{`Mood: ${payload[0].value}/100`}</p>
                </div>
            );
        }
        return null;
    };

    const COLORS = ["#18181b", "#e4e4e7"];

    const safeRpgCards = (result.rpgCards && result.rpgCards.length > 0) ? result.rpgCards : [
        { name: result.chartData.dominance[0]?.name || "Player 1", role: "The Mystery Guest", level: 1, oneLiner: "Stats loading... (Run a new analysis!)", stats: { yapLevel: 50, simpScore: 50, cringeFactor: 50, chaosMeasure: 50 } },
        { name: result.chartData.dominance[1]?.name || "Player 2", role: "The Unknown Player", level: 1, oneLiner: "Stats loading... (Run a new analysis!)", stats: { yapLevel: 50, simpScore: 50, cringeFactor: 50, chaosMeasure: 50 } }
    ];

    return (
        <div className="w-full max-w-5xl mx-auto px-4 py-8 md:px-6 md:py-16 pb-32">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8 md:mb-12">
                <button onClick={onBack} className="text-sm text-zinc-400 hover:text-zinc-900 transition-colors flex items-center gap-2 font-medium self-start md:self-auto">
                    ← Return to input
                </button>
                <div className="flex gap-4 w-full md:w-auto">
                    <button
                        onClick={handleDownloadPDF}
                        disabled={isThinking}
                        className="flex-1 md:flex-none bg-white text-zinc-900 border border-zinc-200 px-6 py-3 md:py-2 rounded-full text-sm font-bold shadow-sm hover:bg-zinc-50 transition-colors disabled:opacity-50"
                    >
                        {isThinking ? "Processing..." : "📄 PDF Report"}
                    </button>
                    <button
                        onClick={handleDownloadReceipt}
                        disabled={isThinking}
                        className="flex-1 md:flex-none bg-black text-white px-6 py-3 md:py-2 rounded-full text-sm font-bold shadow-lg hover:scale-105 transition-transform disabled:opacity-50"
                    >
                        {isThinking ? "Printing..." : "📸 Download Receipt"}
                    </button>
                </div>
            </div>

            {/* Main Content Wrapper for PDF Capture */}
            <div ref={pdfRef} data-pdf-target="true" className="bg-white rounded-[2rem] p-6 md:p-10 shadow-sm border border-zinc-100">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12 md:mb-20 pt-4 md:pt-8"
                >
                    <div className="inline-block px-4 py-1.5 bg-zinc-50 rounded-full text-xs font-semibold mb-6 uppercase tracking-wider text-zinc-500 border border-zinc-100">
                        The Verdict
                    </div>
                    <h1 className="text-3xl md:text-6xl font-bold mb-6 tracking-tight text-zinc-900 leading-tight">
                        {result.vibeHeadline}
                    </h1>
                    <p className="text-lg md:text-2xl font-light text-zinc-500 max-w-3xl mx-auto italic leading-relaxed">
                        "{result.roast}"
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-6 md:mb-8">
                    {/* Stats Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className="bg-zinc-50/50 rounded-[2rem] p-6 md:p-10 flex flex-col justify-between min-h-[300px] border border-zinc-100/50"
                    >
                        <div className="space-y-8 md:space-y-10">
                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-widest mb-2 text-zinc-400">Total Messages</h3>
                                <div className="text-4xl md:text-5xl font-bold text-zinc-900 tracking-tight">{result.stats.totalMessages}</div>
                            </div>

                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-widest mb-2 text-zinc-400">Your Contribution</h3>
                                <div className="text-4xl md:text-5xl font-bold text-zinc-900 tracking-tight">{result.chartData.dominance[0].value}%</div>
                            </div>

                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-widest mb-2 text-zinc-400">Vibe Score</h3>
                                <div className="flex flex-wrap items-baseline gap-3 md:gap-4">
                                    <span className="text-4xl md:text-5xl font-bold text-zinc-900 tracking-tight">{result.sentiment.score}</span>
                                    <span className="text-sm md:text-lg font-medium text-zinc-500 bg-white px-3 py-1 rounded-full border border-zinc-100">{result.sentiment.label}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Dominance Chart */}
                    {/* Dominance Chart */}
                    <div
                        className="bg-zinc-50/50 rounded-[2rem] p-6 md:p-10 flex flex-col justify-between border border-zinc-100/50 min-h-[300px]"
                    >
                        <h3 className="text-xs font-bold uppercase tracking-widest mb-4 text-zinc-400">Dynamics</h3>
                        <div className="h-[220px] md:h-[250px] w-full flex-1 relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={result.chartData.dominance}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius="55%"
                                        outerRadius="75%"
                                        paddingAngle={4}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {result.chartData.dominance.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                            {/* Center Label for simple visual */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <span className="text-zinc-300 font-bold text-xs opacity-50">VS</span>
                            </div>
                        </div>
                        <div className="flex justify-center gap-4 md:gap-8 text-xs md:text-sm font-medium mt-4 text-zinc-500">
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-zinc-900" /> {result.chartData.dominance[0].name}
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-zinc-200" /> {result.chartData.dominance[1].name}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sentiment Graph */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mb-6 md:mb-8 p-6 md:p-10 bg-white border border-zinc-100 rounded-[2rem] shadow-sm hover:shadow-md transition-shadow"
                >
                    <h3 className="text-xs font-bold uppercase tracking-widest mb-8 text-zinc-400 pl-2">Emotional Arc</h3>
                    <div className="h-[250px] md:h-[300px] w-full relative">
                        {/* Y-Axis Labels Overlay */}
                        <div className="absolute top-0 left-0 text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Lovey-Dovey</div>
                        <div className="absolute bottom-6 left-0 text-[10px] font-bold text-red-500 uppercase tracking-wider">Toxic</div>

                        {/* X-Axis Labels Overlay */}
                        <div className="absolute bottom-0 left-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Start</div>
                        <div className="absolute bottom-0 right-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Now</div>

                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={result.chartData.sentimentTrend} margin={{ top: 20, right: 10, left: 10, bottom: 20 }}>
                                <XAxis dataKey="messageIndex" hide />
                                <YAxis domain={[0, 100]} hide />
                                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#e4e4e7', strokeWidth: 2 }} />
                                <ReferenceLine y={50} stroke="#e4e4e7" strokeDasharray="5 5" />
                                <Line
                                    type="monotone"
                                    dataKey="score"
                                    stroke="#18181b"
                                    strokeWidth={3}
                                    dot={false}
                                    activeDot={{ r: 6, fill: "#18181b", stroke: "#fff", strokeWidth: 2 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {result.turningPoint && (
                        <div className="mt-8 p-4 md:p-6 bg-zinc-50 rounded-xl border border-zinc-100">
                            <h4 className="text-xs font-bold uppercase tracking-widest mb-3 text-zinc-400 flex items-center gap-2">
                                🔀 The Turning Point
                            </h4>
                            <div className="mb-2 italic text-zinc-800 font-serif border-l-2 border-zinc-300 pl-4 py-1 text-sm md:text-base">
                                "{result.turningPoint.message}"
                            </div>
                            <p className="text-xs md:text-sm text-zinc-500 pl-4 leading-relaxed">
                                {result.turningPoint.explanation}
                            </p>
                        </div>
                    )}
                </motion.div>

                {/* Insight Cards */}
                <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 mb-12 md:mb-16">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="p-6 md:p-8 rounded-[2rem] bg-red-500 text-white shadow-xl shadow-red-200/50"
                        >
                            <h3 className="text-red-100 font-bold mb-6 text-sm uppercase tracking-widest flex items-center gap-2 border-b border-white/20 pb-4">
                                🚩 Red Flags detected
                            </h3>
                            <ul className="space-y-4">
                                {result.redFlags.map((flag, i) => (
                                    <li key={i} className="leading-snug font-medium text-lg border-l-2 border-white/40 pl-6 py-1">
                                        {flag.replace(/^[^\w]+/, '')}
                                    </li>
                                ))}
                            </ul>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="p-6 md:p-8 rounded-[2rem] bg-emerald-500 text-white shadow-xl shadow-emerald-200/50"
                        >
                            <h3 className="text-emerald-100 font-bold mb-6 text-sm uppercase tracking-widest flex items-center gap-2 border-b border-white/20 pb-4">
                                ✅ Green Flags
                            </h3>
                            <ul className="space-y-4">
                                {result.greenFlags.length > 0 ? (
                                    result.greenFlags.map((flag, i) => (
                                        <li key={i} className="leading-snug font-medium text-lg border-l-2 border-white/40 pl-6 py-1">
                                            {flag.replace(/^[^\w]+/, '')}
                                        </li>
                                    ))
                                ) : (
                                    <li className="leading-snug font-medium text-lg border-l-2 border-white/40 pl-6 py-1 italic opacity-80">
                                        Absolutely none, darling
                                    </li>
                                )}
                            </ul>
                        </motion.div>
                    </div>

                    {/* Insight Cards Grid - Main UI */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12 max-w-4xl mx-auto">
                        <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-100">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Effort Balance</h3>
                            <p className="text-lg font-bold text-zinc-800 leading-tight">
                                {result.effortBalance}
                            </p>
                        </div>
                        <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-100">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Reply Time</h3>
                            <p className="text-lg font-bold text-zinc-800 leading-tight">
                                {result.stats.replyTimeGap}
                            </p>
                        </div>
                    </div>

                    {/* RPG Character Cards - Main UI */}
                    <div className="mb-16 max-w-4xl mx-auto">
                        <h3 className="text-center text-sm font-bold uppercase tracking-[0.2em] text-zinc-400 mb-8">
                            Character Sheets
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {safeRpgCards.map((card, idx) => (
                                <div key={idx} className="relative overflow-hidden bg-white border-2 border-zinc-900 rounded-xl p-6 shadow-[4px_4px_0px_0px_rgba(24,24,27,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(24,24,27,1)] transition-all">
                                    <div className="absolute top-0 right-0 p-2 bg-zinc-900 text-white text-xs font-bold rounded-bl-xl z-20">
                                        LVL {card.level || 99}
                                    </div>
                                    <div className="mb-6">
                                        <h4 className="text-2xl font-black text-zinc-900 mb-1">{card.name}</h4>
                                        <div className="inline-block px-3 py-1 bg-zinc-100 text-zinc-600 text-xs font-bold uppercase tracking-wide rounded-full border border-zinc-200">
                                            {card.role}
                                        </div>
                                    </div>

                                    <div className="space-y-4 mb-6">
                                        <div>
                                            <div className="flex justify-between text-xs font-bold uppercase mb-1">
                                                <span>Yap Level</span>
                                                <span>{card.stats.yapLevel}/100</span>
                                            </div>
                                            <div className="h-2 bg-zinc-100 rounded-full overflow-hidden border border-zinc-200">
                                                <div
                                                    className="h-full bg-blue-500"
                                                    style={{ width: `${card.stats.yapLevel}%` }}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-xs font-bold uppercase mb-1">
                                                <span>Simp Score</span>
                                                <span>{card.stats.simpScore}/100</span>
                                            </div>
                                            <div className="h-2 bg-zinc-100 rounded-full overflow-hidden border border-zinc-200">
                                                <div
                                                    className="h-full bg-pink-500"
                                                    style={{ width: `${card.stats.simpScore}%` }}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-xs font-bold uppercase mb-1">
                                                <span>Chaos</span>
                                                <span>{card.stats.chaosMeasure}/100</span>
                                            </div>
                                            <div className="h-2 bg-zinc-100 rounded-full overflow-hidden border border-zinc-200">
                                                <div
                                                    className="h-full bg-purple-500"
                                                    style={{ width: `${card.stats.chaosMeasure}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <p className="text-sm font-medium text-zinc-600 italic border-l-4 border-zinc-200 pl-4 py-1">
                                        "{card.oneLiner}"
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="w-full bg-zinc-900 text-white rounded-[2rem] p-6 md:p-10 flex flex-col md:flex-row justify-between items-center gap-8 shadow-2xl shadow-zinc-200/50"
                    >
                        <div className="text-center md:text-left">
                            <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-4">🔮 Attachment Style</h3>
                            <div className="text-3xl md:text-4xl font-black leading-tight mb-2 tracking-tight">{result.attachmentStyle}</div>
                        </div>
                        <div className="w-full h-px bg-zinc-800 md:w-px md:h-16" />
                        <div className="text-center md:text-right">
                            <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-4">🎬 If it were a movie</h3>
                            <span className="text-lg md:text-2xl font-serif italic text-zinc-200">"{result.movieAnalogy}"</span>
                        </div>
                    </motion.div>
                </div>

                {/* Relationship Soundtrack */}
                <div className="mb-16 max-w-4xl mx-auto">
                    <h3 className="text-center text-sm font-bold uppercase tracking-[0.2em] text-zinc-400 mb-8">
                        The Relationship Soundtrack
                    </h3>
                    <div className="bg-zinc-900 rounded-[2rem] p-8 text-white shadow-xl shadow-zinc-200/50">
                        <div className="space-y-6">
                            {(result.songRecommendations || [
                                { title: "Toxic", artist: "Britney Spears", reason: "Do we need to explain?" },
                                { title: "Hot N Cold", artist: "Katy Perry", reason: "Mixed signals slightly detected." },
                                { title: "We Are Never Ever Getting Back Together", artist: "Taylor Swift", reason: "Just a hunch." }
                            ]).map((song, i) => (
                                <div key={i} className="flex items-center gap-4 group">
                                    <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center font-bold text-zinc-500 group-hover:bg-zinc-700 group-hover:text-white transition-colors">
                                        {i + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-col md:flex-row md:items-baseline md:gap-2">
                                            <h4 className="font-bold text-lg truncate">{song.title}</h4>
                                            <span className="text-zinc-500 text-sm font-medium">{song.artist}</span>
                                        </div>
                                        <p className="text-sm text-zinc-400 italic truncate mt-0.5">"{song.reason}"</p>
                                    </div>
                                    <a
                                        href={`https://open.spotify.com/search?q=${encodeURIComponent(song.title + " " + song.artist)}&type=track`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-3 bg-zinc-800 rounded-full hover:bg-[#1DB954] hover:text-white transition-all transform hover:scale-110"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>
                                    </a>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* PDF Specific Footer */}
                <div className="text-center pb-8 border-t border-zinc-100 pt-8 mt-8 md:mt-16">
                    <h2 className="text-xl font-black tracking-tighter text-zinc-900 mb-2">READ THE ROOM</h2>
                    <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                        COMPREHENSIVE VIBE AUDIT • {new Date().toLocaleDateString()}
                    </p>
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="text-center mt-8"
                >
                    <p className="text-zinc-300 text-xs uppercase tracking-widest font-bold">ReadTheRoom v1.0</p>
                </motion.div>
            </div >


            {/* HIDDEN DESKTOP TEMPLATE FOR PDF GENERATION */}
            {/* This strictly enforces desktop layout (grid-cols-2, large fonts) regardless of device */}
            <div style={{ position: "absolute", left: "-9999px", top: "-9999px" }}>
                <div
                    ref={desktopPdfRef}
                    className="bg-white p-16"
                    style={{ width: '1200px' }} // HARDCODED DESKTOP WIDTH
                >
                    <div className="text-center mb-20">
                        <div className="inline-block px-4 py-1.5 bg-zinc-50 rounded-full text-xs font-semibold mb-6 uppercase tracking-wider text-zinc-500 border border-zinc-100">
                            The Verdict
                        </div>
                        <h1 className="text-6xl font-bold mb-6 tracking-tight text-zinc-900 leading-tight">
                            {result.vibeHeadline}
                        </h1>
                        <p className="text-2xl font-light text-zinc-500 max-w-4xl mx-auto italic leading-relaxed">
                            "{result.roast}"
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-12 mb-12">
                        {/* Stats Card */}
                        <div className="bg-zinc-50/50 rounded-[2rem] p-10 flex flex-col justify-between min-h-[350px] border border-zinc-100/50">
                            <div className="space-y-10">
                                <div>
                                    <h3 className="text-xs font-bold uppercase tracking-widest mb-2 text-zinc-400">Total Messages</h3>
                                    <div className="text-5xl font-bold text-zinc-900 tracking-tight">{result.stats.totalMessages}</div>
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold uppercase tracking-widest mb-2 text-zinc-400">Your Contribution</h3>
                                    <div className="text-5xl font-bold text-zinc-900 tracking-tight">{result.chartData.dominance[0].value}%</div>
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold uppercase tracking-widest mb-2 text-zinc-400">Vibe Score</h3>
                                    <div className="flex items-baseline gap-4">
                                        <span className="text-5xl font-bold text-zinc-900 tracking-tight">{result.sentiment.score}</span>
                                        <span className="text-lg font-medium text-zinc-500 bg-white px-3 py-1 rounded-full border border-zinc-100">{result.sentiment.label}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Dominance Chart */}
                        <div className="bg-zinc-50/50 rounded-[2rem] p-10 flex flex-col justify-between border border-zinc-100/50">
                            <h3 className="text-xs font-bold uppercase tracking-widest mb-4 text-zinc-400">Dynamics</h3>
                            <div className="h-[250px] w-full relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={result.chartData.dominance}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={70}
                                            outerRadius={90}
                                            paddingAngle={4}
                                            dataKey="value"
                                            stroke="none"
                                            isAnimationActive={false} // Disable animation for capture
                                        >
                                            {result.chartData.dominance.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <span className="text-zinc-300 font-bold text-xs opacity-50">VS</span>
                                </div>
                            </div>
                            <div className="flex justify-center gap-8 text-sm font-medium mt-4 text-zinc-500">
                                {result.chartData.dominance.map((entry, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <div className={`w-2.5 h-2.5 rounded-full ${i === 0 ? 'bg-zinc-900' : 'bg-zinc-200'}`} /> {entry.name}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sentiment Graph */}
                    <div className="mb-12 p-10 bg-white border border-zinc-100 rounded-[2rem] shadow-sm">
                        <h3 className="text-xs font-bold uppercase tracking-widest mb-8 text-zinc-400 pl-2">Emotional Arc</h3>
                        <div className="h-[350px] w-full relative">
                            {/* Static Labels for PDF */}
                            <div className="absolute top-0 left-0 text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Lovey-Dovey</div>
                            <div className="absolute bottom-6 left-0 text-[10px] font-bold text-red-500 uppercase tracking-wider">Toxic</div>
                            <div className="absolute bottom-0 left-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Start</div>
                            <div className="absolute bottom-0 right-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Now</div>

                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={result.chartData.sentimentTrend} margin={{ top: 20, right: 10, left: 10, bottom: 20 }}>
                                    <XAxis dataKey="messageIndex" hide />
                                    <YAxis domain={[0, 100]} hide />
                                    <ReferenceLine y={50} stroke="#e4e4e7" strokeDasharray="5 5" />
                                    <Line
                                        type="monotone"
                                        dataKey="score"
                                        stroke="#18181b"
                                        strokeWidth={3}
                                        dot={false}
                                        isAnimationActive={false}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        {result.turningPoint && (
                            <div className="mt-8 p-6 bg-zinc-50 rounded-xl border border-zinc-100">
                                <h4 className="text-xs font-bold uppercase tracking-widest mb-3 text-zinc-400 flex items-center gap-2">
                                    🔀 The Turning Point
                                </h4>
                                <div className="mb-2 italic text-zinc-800 font-serif border-l-2 border-zinc-300 pl-4 py-1 text-base">
                                    "{result.turningPoint.message}"
                                </div>
                                <p className="text-sm text-zinc-500 pl-4 leading-relaxed">
                                    {result.turningPoint.explanation}
                                    {result.turningPoint.explanation}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Insight Cards (Red/Green Flags) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                        <div className="p-10 rounded-[2rem] bg-red-500 text-white shadow-sm">
                            <h3 className="text-red-100 font-bold mb-6 text-sm uppercase tracking-widest flex items-center gap-2 border-b border-white/20 pb-4">
                                🚩 Red Flags detected
                            </h3>
                            <ul className="space-y-4">
                                {result.redFlags.map((flag, i) => (
                                    <li key={i} className="leading-snug font-medium text-lg border-l-2 border-white/40 pl-6 py-1">
                                        {flag.replace(/^[^\w]+/, '')}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="p-10 rounded-[2rem] bg-emerald-500 text-white shadow-sm">
                            <h3 className="text-emerald-100 font-bold mb-6 text-sm uppercase tracking-widest flex items-center gap-2 border-b border-white/20 pb-4">
                                ✅ Green Flags
                            </h3>
                            <ul className="space-y-4">
                                {result.greenFlags.length > 0 ? (
                                    result.greenFlags.map((flag, i) => (
                                        <li key={i} className="leading-snug font-medium text-lg border-l-2 border-white/40 pl-6 py-1">
                                            {flag.replace(/^[^\w]+/, '')}
                                        </li>
                                    ))
                                ) : (
                                    <li className="leading-snug font-medium text-lg border-l-2 border-white/40 pl-6 py-1 italic opacity-80">
                                        Absolutely none, darling
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>

                    {/* Insight Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-100">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Effort Balance</h3>
                            <p className="text-lg font-bold text-zinc-800 leading-tight">
                                {result.effortBalance}
                            </p>
                        </div>
                        <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-100">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Reply Time</h3>
                            <p className="text-lg font-bold text-zinc-800 leading-tight">
                                {result.stats.replyTimeGap}
                            </p>
                        </div>
                    </div>

                    {/* RPG Character Cards */}
                    <div className="mb-12">
                        <h3 className="text-center text-sm font-bold uppercase tracking-[0.2em] text-zinc-400 mb-8">
                            Character Sheets
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {safeRpgCards.map((card, idx) => (
                                <div key={idx} className="relative overflow-hidden bg-white border-2 border-zinc-900 rounded-xl p-6 shadow-[4px_4px_0px_0px_rgba(24,24,27,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(24,24,27,1)] transition-all">
                                    <div className="absolute top-0 right-0 p-2 bg-zinc-900 text-white text-xs font-bold rounded-bl-xl z-20">
                                        LVL {card.level || 99}
                                    </div>
                                    <div className="mb-6">
                                        <h4 className="text-2xl font-black text-zinc-900 mb-1">{card.name}</h4>
                                        <div className="inline-block px-3 py-1 bg-zinc-100 text-zinc-600 text-xs font-bold uppercase tracking-wide rounded-full border border-zinc-200">
                                            {card.role}
                                        </div>
                                    </div>

                                    <div className="space-y-4 mb-6">
                                        <div>
                                            <div className="flex justify-between text-xs font-bold uppercase mb-1">
                                                <span>Yap Level</span>
                                                <span>{card.stats.yapLevel}/100</span>
                                            </div>
                                            <div className="h-2 bg-zinc-100 rounded-full overflow-hidden border border-zinc-200">
                                                <div
                                                    className="h-full bg-blue-500"
                                                    style={{ width: `${card.stats.yapLevel}%` }}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-xs font-bold uppercase mb-1">
                                                <span>Simp Score</span>
                                                <span>{card.stats.simpScore}/100</span>
                                            </div>
                                            <div className="h-2 bg-zinc-100 rounded-full overflow-hidden border border-zinc-200">
                                                <div
                                                    className="h-full bg-pink-500"
                                                    style={{ width: `${card.stats.simpScore}%` }}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-xs font-bold uppercase mb-1">
                                                <span>Chaos</span>
                                                <span>{card.stats.chaosMeasure}/100</span>
                                            </div>
                                            <div className="h-2 bg-zinc-100 rounded-full overflow-hidden border border-zinc-200">
                                                <div
                                                    className="h-full bg-purple-500"
                                                    style={{ width: `${card.stats.chaosMeasure}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <p className="text-sm font-medium text-zinc-600 italic border-l-4 border-zinc-200 pl-4 py-1">
                                        "{card.oneLiner}"
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>


                    <div className="w-full bg-zinc-900 text-white rounded-[2rem] p-10 flex flex-row justify-between items-center gap-8 mb-16">
                        <div className="text-left">
                            <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-4">🔮 Attachment Style</h3>
                            <div className="text-4xl font-black leading-tight mb-2 tracking-tight">{result.attachmentStyle}</div>
                        </div>
                        <div className="w-px h-24 bg-zinc-800" />
                        <div className="text-right">
                            <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-4">🎬 If it were a movie</h3>
                            <span className="text-2xl font-serif italic text-zinc-200">"{result.movieAnalogy}"</span>
                        </div>
                    </div>

                    {/* Relationship Soundtrack */}
                    <div className="mb-12">
                        <h3 className="text-center text-sm font-bold uppercase tracking-[0.2em] text-zinc-400 mb-8">
                            The Relationship Soundtrack
                        </h3>
                        <div className="bg-zinc-900 rounded-[2rem] p-8 text-white shadow-xl shadow-zinc-200/50">
                            <div className="space-y-6">
                                {(result.songRecommendations || [
                                    { title: "Toxic", artist: "Britney Spears", reason: "Do we need to explain?" },
                                    { title: "Hot N Cold", artist: "Katy Perry", reason: "Mixed signals slightly detected." },
                                    { title: "We Are Never Ever Getting Back Together", artist: "Taylor Swift", reason: "Just a hunch." }
                                ]).map((song, i) => (
                                    <div key={i} className="flex items-center gap-4 group">
                                        <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center font-bold text-zinc-500 group-hover:bg-zinc-700 group-hover:text-white transition-colors">
                                            {i + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-col md:flex-row md:items-baseline md:gap-2">
                                                <h4 className="font-bold text-lg truncate">{song.title}</h4>
                                                <span className="text-zinc-500 text-sm font-medium">{song.artist}</span>
                                            </div>
                                            <p className="text-sm text-zinc-400 italic truncate mt-0.5">"{song.reason}"</p>
                                        </div>
                                        <div className="p-3 bg-zinc-800 rounded-full text-zinc-500">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="text-center pb-8 border-t border-zinc-100 pt-8 mt-16">
                        <h2 className="text-xl font-black tracking-tighter text-zinc-900 mb-2">read-the-room-v1.vercel.app</h2>
                        <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                            COMPREHENSIVE VIBE AUDIT • {new Date().toLocaleDateString()}
                        </p>
                    </div>
                </div>
            </div>

            {/* Hidden Receipt Template (off-screen but rendered) */}
            <div style={{ position: "absolute", left: "-9999px", top: "-9999px" }}>
                <div
                    ref={receiptRef}
                    style={{
                        width: '540px',
                        height: '960px',
                        backgroundColor: '#f4f4f5', // Zinc-100
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '40px'
                    }}
                >
                    <div
                        style={{
                            width: '100%',
                            backgroundColor: '#ffffff',
                            color: '#18181b',
                            padding: '40px',
                            fontFamily: 'monospace',
                            border: '2px dashed #d4d4d8', // Zinc-300 hex
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' // Tailwind shadow-xl approx
                        }}
                    >
                        <div style={{ textAlign: 'center', borderBottom: '2px dashed #d4d4d8', paddingBottom: '24px', marginBottom: '24px' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px', color: '#18181b' }}>READ THE ROOM™</h2>
                            <p style={{ fontSize: '12px', textTransform: 'uppercase', color: '#71717a' }}>Official Audit</p>
                            <p style={{ fontSize: '12px', color: '#a1a1aa', marginTop: '8px' }}>{new Date().toLocaleDateString()} • {new Date().toLocaleTimeString()}</p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '32px' }}>
                            {/* Participants Section */}
                            <div>
                                <p style={{ fontSize: '12px', textTransform: 'uppercase', color: '#a1a1aa', marginBottom: '4px' }}> Chat Participants</p>
                                <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#18181b' }}>
                                    {result.chartData.dominance[0].name} & {result.chartData.dominance[1].name}
                                </p>
                            </div>

                            <div>
                                <p style={{ fontSize: '12px', textTransform: 'uppercase', color: '#a1a1aa', marginBottom: '4px' }}>Headline</p>
                                <p style={{ fontSize: '18px', fontWeight: 'bold', lineHeight: '1.25', color: '#18181b' }}>{result.vibeHeadline}</p>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <p style={{ fontSize: '12px', textTransform: 'uppercase', color: '#a1a1aa', marginBottom: '4px' }}>Score</p>
                                    <p style={{ fontSize: '30px', fontWeight: '900', color: '#18181b' }}>{result.sentiment.score}/100</p>
                                </div>
                                <div>
                                    <p style={{ fontSize: '12px', textTransform: 'uppercase', color: '#a1a1aa', marginBottom: '4px' }}>Vibe</p>
                                    <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#18181b' }}>{result.sentiment.label}</p>
                                </div>
                            </div>

                            {/* Red Flag Section */}
                            <div>
                                <p style={{ fontSize: '12px', textTransform: 'uppercase', color: '#ef4444', marginBottom: '4px', fontWeight: 'bold' }}>🚩 Red Flags</p>
                                <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#18181b', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                                    "{result.redFlagOverview || result.redFlags[0] || "None detected"}"
                                </p>
                            </div>

                            {/* Green Flag Section */}
                            <div>
                                <p style={{ fontSize: '12px', textTransform: 'uppercase', color: '#10b981', marginBottom: '4px', fontWeight: 'bold' }}>✅ Green Flags</p>
                                <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#18181b', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                                    "{result.greenFlagOverview || result.greenFlags[0] || "None detected"}"
                                </p>
                            </div>

                            <div>
                                <p style={{ fontSize: '12px', textTransform: 'uppercase', color: '#a1a1aa', marginBottom: '4px' }}>🎥 If it were a movie</p>
                                <p style={{ fontStyle: 'italic', fontSize: '14px', color: '#18181b', fontWeight: 'bold' }}>"{result.movieAnalogy}"</p>
                            </div>

                            <div>
                                <p style={{ fontSize: '12px', textTransform: 'uppercase', color: '#a1a1aa', marginBottom: '4px' }}>🎵 The Relationship Soundtrack</p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    {(result.songRecommendations || [
                                        { title: "Toxic", artist: "Britney Spears" },
                                        { title: "Hot N Cold", artist: "Katy Perry" },
                                        { title: "We Are Never Ever Getting Back Together", artist: "Taylor Swift" }
                                    ]).map((song, i) => (
                                        <p key={i} style={{ fontSize: '12px', fontWeight: 'bold', color: '#18181b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {i + 1}. {song.title.toUpperCase()} - {song.artist}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div style={{ textAlign: 'center', borderTop: '2px dashed #d4d4d8', paddingTop: '24px' }}>
                            {/* Removed Total Score as requested */}

                            <div style={{
                                backgroundColor: '#18181b',
                                padding: '16px 32px',
                                margin: '0 auto',
                                width: 'fit-content',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '2px solid #18181b' // Force border to ensure dimensions
                            }}>
                                <p style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', color: '#ffffff', marginBottom: '8px', letterSpacing: '0.2em', lineHeight: '1' }}>GET ROASTED AT</p>
                                <p style={{ fontSize: '14px', fontWeight: '900', color: '#ffffff', letterSpacing: '0.05em', lineHeight: '1' }}>read-the-room-v1.vercel.app</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div >
    );
}
