"use client";

import React, { useState, useEffect, useRef } from 'react';

export default function BestMomentsManager() {
    const [images, setImages] = useState<string[]>([]);
    const [stars, setStars] = useState<string[]>([]);
    const [dragging, setDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);

    const fetchImages = async () => {
        try {
            const res = await fetch('/api/best-moments');
            if (res.ok) {
                const data = await res.json();
                setImages(data.images);
                setStars(data.stars || []);
            }
        } catch (error) {
            console.error("Failed to load images");
        }
    };

    useEffect(() => {
        fetchImages();
    }, []);

    const uploadFiles = async (files: FileList) => {
        setUploading(true);
        for (let i = 0; i < files.length; i++) {
            const formData = new FormData();
            formData.append('file', files[i]);
            try {
                await fetch('/api/best-moments', { method: 'POST', body: formData });
            } catch (err) {
                console.error("Upload failed for", files[i].name);
            }
        }
        await fetchImages();
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleDelete = async (filename: string) => {
        if (!confirm("Are you sure you want to delete this image?")) return;
        try {
            const res = await fetch('/api/best-moments', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filename }),
            });
            if (res.ok) {
                const newImages = images.filter(img => img !== filename);
                const newStars = stars.filter(img => img !== filename);
                setImages(newImages);
                setStars(newStars);
                saveData(newImages, newStars);
            }
        } catch (error) {
            console.error("Delete failed");
        }
    };

    const toggleStar = async (filename: string) => {
        const newStars = stars.includes(filename) 
            ? stars.filter(s => s !== filename)
            : [...stars, filename];
        
        setStars(newStars);
        await saveData(images, newStars);
    };

    const saveData = async (currentImages: string[], currentStars: string[]) => {
        try {
            await fetch('/api/best-moments', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ order: currentImages, stars: currentStars }),
            });
        } catch (error) {
            console.error("Failed to save data");
        }
    };

    // Drag handlers
    const handleSortDragStart = (e: React.DragEvent, index: number) => {
        setDraggedItemIndex(index);
        e.dataTransfer.effectAllowed = 'move';
    };
    const handleSortDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedItemIndex === null || draggedItemIndex === index) return;
        const newImages = [...images];
        const draggedItem = newImages[draggedItemIndex];
        newImages.splice(draggedItemIndex, 1);
        newImages.splice(index, 0, draggedItem);
        setImages(newImages);
        setDraggedItemIndex(index);
    };
    const handleSortDragEnd = () => {
        setDraggedItemIndex(null);
        saveData(images, stars);
    };

    // File Drop
    const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragging(true); };
    const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setDragging(false); };
    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault(); setDragging(false);
        if (e.dataTransfer.files.length > 0) await uploadFiles(e.dataTransfer.files);
    };

    return (
        <div className="bg-[#111] p-6 rounded-xl border border-white/10 shadow-lg">
            <h3 className="text-xl font-bold font-orbitron mb-4 text-cyan-400">Best Moments Manager</h3>

            <div 
                className={`border-2 border-dashed rounded-lg p-8 mb-8 text-center transition-colors cursor-pointer ${
                    dragging ? 'border-cyan-400 bg-cyan-900/20' : 'border-white/20 hover:border-white/40 bg-black/40'
                }`}
                onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*" onChange={(e) => e.target.files && uploadFiles(e.target.files)} />
                <p className="text-white/70 font-medium">{uploading ? "Uploading..." : "Drag & drop images here, or click to select"}</p>
            </div>

            <p className="text-xs text-white/30 mb-2 italic">Star images to show them on Homepage. Drag to reorder.</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map((img, idx) => {
                    const isStarred = stars.includes(img);
                    return (
                        <div 
                            key={`${img}-${idx}`} 
                            className={`relative group rounded-lg overflow-hidden border bg-black aspect-video cursor-move transition-all ${
                                draggedItemIndex === idx ? 'opacity-50 border-cyan-400 scale-105 z-10' : 
                                isStarred ? 'border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.2)]' : 'border-white/10 hover:border-white/30'
                            }`}
                            draggable
                            onDragStart={(e) => handleSortDragStart(e, idx)}
                            onDragOver={(e) => handleSortDragOver(e, idx)}
                            onDragEnd={handleSortDragEnd}
                        >
                            {/* Star Button */}
                            <button 
                                onClick={(e) => { e.stopPropagation(); toggleStar(img); }}
                                className={`absolute top-2 left-2 p-1.5 rounded-full z-20 transition-all ${
                                    isStarred ? 'bg-yellow-500 text-black opacity-100' : 'bg-black/50 text-white/30 hover:text-yellow-500 opacity-0 group-hover:opacity-100'
                                }`}
                                title="Toggle Star"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                    <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                                </svg>
                            </button>

                            <img src={`/best-moments/${img}`} alt="Moment" className="w-full h-full object-cover pointer-events-none" />
                            
                            <button 
                                onClick={(e) => { e.stopPropagation(); handleDelete(img); }}
                                className="absolute top-2 right-2 bg-red-600 hover:bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Delete"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                </svg>
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
