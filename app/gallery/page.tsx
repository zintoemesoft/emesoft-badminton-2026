"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function GalleryPage() {
    const [images, setImages] = useState<string[]>([]);
    const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

    useEffect(() => {
        // Fetch all images
        fetch('/api/best-moments')
            .then(res => res.json())
            .then(data => setImages(data.images))
            .catch(err => console.error(err));
    }, []);

    const openLightbox = (index: number) => {
        setSelectedImageIndex(index);
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    };

    const closeLightbox = () => {
        setSelectedImageIndex(null);
        document.body.style.overflow = 'auto';
    };

    const navigate = (direction: 'prev' | 'next', e: React.MouseEvent) => {
        e.stopPropagation();
        if (selectedImageIndex === null) return;
        
        let newIndex = direction === 'next' ? selectedImageIndex + 1 : selectedImageIndex - 1;
        
        if (newIndex >= images.length) newIndex = 0; // Loop
        if (newIndex < 0) newIndex = images.length - 1; // Loop
        
        setSelectedImageIndex(newIndex);
    };

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (selectedImageIndex === null) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowRight') setSelectedImageIndex(prev => (prev === null || prev >= images.length - 1) ? 0 : prev + 1);
            if (e.key === 'ArrowLeft') setSelectedImageIndex(prev => (prev === null || prev <= 0) ? images.length - 1 : prev - 1);
        };
        
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedImageIndex, images.length]);

    return (
        <main className="min-h-screen bg-[#0a0a0a] text-white">
            {/* Header */}
            <header className="fixed top-0 w-full z-40 bg-black/80 backdrop-blur-md border-b border-white/10">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 text-white/70 hover:text-cyan-400 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                        </svg>
                        <span className="font-orbitron font-bold">TRANG CHỦ</span>
                    </Link>
                    <h1 className="text-xl font-orbitron font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
                        THƯ VIỆN ẢNH
                    </h1>
                    <div className="w-24"></div> {/* Spacer for center alignment */}
                </div>
            </header>

            {/* Gallery Grid */}
            <div className="container mx-auto px-4 pt-24 pb-12">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {images.map((img, idx) => (
                        <div 
                            key={idx} 
                            onClick={() => openLightbox(idx)}
                            className="group relative aspect-square rounded-xl overflow-hidden border border-white/10 bg-white/5 cursor-pointer hover:border-cyan-400/50 transition-colors"
                        >
                            <img 
                                src={`/best-moments/${img}`} 
                                alt={`Gallery image ${idx}`}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                        </div>
                    ))}
                </div>
                {images.length === 0 && (
                     <div className="text-center text-white/30 mt-20">Đang tải hoặc chưa có ảnh...</div>
                )}
            </div>

            {/* Lightbox */}
            {selectedImageIndex !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm" onClick={closeLightbox}>
                    
                    {/* Close Button */}
                    <button onClick={closeLightbox} className="absolute top-4 right-4 p-2 text-white/50 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors z-50">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    {/* Navigation Buttons */}
                    <button 
                        onClick={(e) => navigate('prev', e)}
                        className="absolute left-4 p-3 text-white/50 hover:text-cyan-400 bg-black/50 hover:bg-black/80 rounded-full transition-all hidden md:block"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                        </svg>
                    </button>
                    
                    <button 
                        onClick={(e) => navigate('next', e)}
                        className="absolute right-4 p-3 text-white/50 hover:text-cyan-400 bg-black/50 hover:bg-black/80 rounded-full transition-all hidden md:block"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                    </button>

                    {/* Image Container */}
                    <div 
                        className="relative max-w-[90vw] max-h-[90vh] rounded shadow-2xl overflow-hidden" 
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img 
                            src={`/best-moments/${images[selectedImageIndex]}`} 
                            alt="Full screen"
                            className="max-w-full max-h-[90vh] object-contain"
                        />
                    </div>
                    
                    {/* Index Counter */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/50 font-orbitron text-sm bg-black/50 px-3 py-1 rounded-full">
                        {selectedImageIndex + 1} / {images.length}
                    </div>
                </div>
            )}
        </main>
    );
}
