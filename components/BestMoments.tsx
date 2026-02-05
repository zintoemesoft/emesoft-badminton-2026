"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link"; // Import Link

export default function BestMoments() {
    const [images, setImages] = useState<string[]>([]);
    
    useEffect(() => {
        const fetchImages = async () => {
            try {
                const res = await fetch('/api/best-moments');
                if (res.ok) {
                    const data = await res.json();
                    const allImages = data.images as string[];
                    const stars = (data.stars as string[]) || [];

                    // Filter to show only starred images, in the order they appear in the main list
                    // If no stars are set, maybe show first 10? Or none? 
                    // Let's show only starred as requested. If none starred, show empty or fallback?
                    // User said "if stars are marked, they go to best moments". 
                    // Let's assume if 0 stars, maybe show all (fallback) or 0. 
                    // To be safe and follow instructions: Show only starred.
                    
                    const starredImages = allImages.filter(img => stars.includes(img));
                    
                    // Fallback: If less than 5 starred, maybe show top 10 recent?
                    // User request: "Design lại nếu các ảnh có đánh sao sẽ lên best-moments" -> imply exclusive.
                    // But if 0 starred, it looks empty. Let's fallback to all if 0 starred.
                    if (starredImages.length > 0) {
                        setImages(starredImages);
                    } else {
                        // Limit to top 10 if no stars to avoid "running too fast" with too many images
                        setImages(allImages.slice(0, 10)); 
                    }
                }
            } catch (error) {
                console.error("Failed to fetch best moments:", error);
            }
        };

        fetchImages();
    }, []);

    if (images.length === 0) return null;

    return (
        <section id="best-moments" className="py-20 overflow-hidden relative">
             <div className="container mx-auto px-4 mb-8 flex justify-between items-end">
                <div>
                    <h2 className="text-4xl md:text-5xl font-bold font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 mb-2">
                        KHOẢNH KHẮC
                    </h2>
                    <div className="h-1 w-20 bg-gradient-to-r from-cyan-400 to-transparent rounded-full"></div>
                </div>
                
                <Link href="/gallery" className="group flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors">
                    <span className="font-orbitron tracking-wide">XEM TẤT CẢ</span>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 group-hover:translate-x-1 transition-transform">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                </Link>
            </div>

            <div className="relative w-full overflow-hidden">
                {/* Gradient Masks */}
                <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-[#0a0a0a] to-transparent z-10 pointer-events-none"></div>
                <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-[#0a0a0a] to-transparent z-10 pointer-events-none"></div>
                
                <div className="flex gap-4 animate-marquee hover:pause whitespace-nowrap py-4">
                    {/* Duplicate set for seamless loop */}
                    {[...images, ...images].map((img, idx) => (
                        <div 
                            key={`${img}-${idx}`} 
                            className="relative w-[300px] h-[200px] md:w-[400px] md:h-[260px] flex-shrink-0 rounded-xl overflow-hidden border border-white/10 group cursor-pointer"
                        >
                            <img 
                                src={`/best-moments/${img}`} 
                                alt="Moment" 
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                                <span className="text-cyan-400 font-orbitron text-sm">EMESOFT 2026</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
