"use client";

import { useState } from "react";
import { Upload, X, ArrowUp, ArrowDown, ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import imageCompression from 'browser-image-compression';
import { Button } from "@/components/ui/button";

export interface ImageFile {
    id: string;
    file: File;
    preview: string;
    base64?: string;
}

interface ImageUploadProps {
    images: ImageFile[];
    setImages: (images: ImageFile[]) => void;
    maxImages?: number; // Default 5
}

export default function ImageUpload({ images, setImages, maxImages = 5 }: ImageUploadProps) {
    const [isProcessing, setIsProcessing] = useState(false);

    const processImages = async (files: FileList | null) => {
        if (!files) return;

        if (images.length + files.length > maxImages) {
            alert(`Max ${maxImages} screenshots allowed.`);
            return;
        }

        setIsProcessing(true);

        const newImages: ImageFile[] = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (!file.type.startsWith("image/")) continue;

            try {
                // COMPRESSION OPTIONS
                const options = {
                    maxSizeMB: 1,          // Max 1MB
                    maxWidthOrHeight: 1280,// Reasonable for screenshots
                    useWebWorker: true
                };

                const compressedFile = await imageCompression(file, options);

                // Convert to Base64 for preview & upload
                const base64 = await imageCompression.getDataUrlFromFile(compressedFile);

                newImages.push({
                    id: Math.random().toString(36).substring(7),
                    file: compressedFile,
                    preview: base64,
                    base64: base64
                });
            } catch (error) {
                console.error("Compression failed:", error);
            }
        }

        setImages([...images, ...newImages]);
        setIsProcessing(false);
    };

    const removeImage = (id: string) => {
        setImages(images.filter(img => img.id !== id));
    };

    const moveImage = (index: number, direction: -1 | 1) => {
        const newImages = [...images];
        const targetIndex = index + direction;

        if (targetIndex >= 0 && targetIndex < newImages.length) {
            [newImages[index], newImages[targetIndex]] = [newImages[targetIndex], newImages[index]];
            setImages(newImages);
        }
    };

    return (
        <div className="w-full space-y-4">
            {/* DROP AREA */}
            <div className="relative">
                <label
                    htmlFor="screenshot-upload"
                    className={`
            border-2 border-dashed rounded-xl h-[120px] 
            flex flex-col items-center justify-center gap-2 
            cursor-pointer transition-all
            ${images.length >= maxImages
                            ? "border-zinc-200 bg-zinc-50 opacity-50 cursor-not-allowed"
                            : "border-zinc-300 hover:border-black hover:bg-zinc-50"}
          `}
                >
                    <div className="p-2 bg-zinc-100 rounded-full">
                        <ImageIcon className="w-6 h-6 text-zinc-600" />
                    </div>
                    <div className="text-center">
                        <p className="font-bold text-sm text-black">
                            {isProcessing ? "Processing..." : "Add Screenshots"}
                        </p>
                        <p className="text-xs text-zinc-400">
                            {images.length} / {maxImages} uploaded
                        </p>
                    </div>
                </label>
                <input
                    id="screenshot-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => processImages(e.target.files)}
                    disabled={images.length >= maxImages || isProcessing}
                />
            </div>

            {/* PREVIEW LIST */}
            <div className="space-y-2">
                <AnimatePresence>
                    {images.map((img, index) => (
                        <motion.div
                            key={img.id}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex items-center gap-3 bg-white border border-zinc-200 p-2 rounded-lg shadow-sm"
                        >
                            <div className="relative w-12 h-16 bg-zinc-100 rounded overflow-hidden shrink-0 border border-zinc-100">
                                <img src={img.preview} alt="Screenshot" className="w-full h-full object-cover" />
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-zinc-700 truncate">{img.file.name}</p>
                                <p className="text-[10px] text-zinc-400">{(img.file.size / 1024).toFixed(0)} KB</p>
                            </div>

                            {/* REORDER CONTROLS */}
                            <div className="flex gap-1">
                                <button
                                    onClick={() => moveImage(index, -1)}
                                    disabled={index === 0}
                                    className="p-1 hover:bg-zinc-100 rounded text-zinc-400 hover:text-black disabled:opacity-30 transition-colors"
                                >
                                    <ArrowUp size={14} />
                                </button>
                                <button
                                    onClick={() => moveImage(index, 1)}
                                    disabled={index === images.length - 1}
                                    className="p-1 hover:bg-zinc-100 rounded text-zinc-400 hover:text-black disabled:opacity-30 transition-colors"
                                >
                                    <ArrowDown size={14} />
                                </button>
                            </div>

                            {/* DELETE */}
                            <button
                                onClick={() => removeImage(img.id)}
                                className="p-2 hover:bg-red-50 text-zinc-400 hover:text-red-500 rounded-lg transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
