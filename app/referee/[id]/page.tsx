"use client";

import React, { useEffect, useState, useRef } from 'react';
import { db } from '@/firebase';
import { doc, onSnapshot, updateDoc, getDoc } from 'firebase/firestore';
import Link from 'next/link';
import FlipCard from '@/components/ui/FlipCard';

type Match = { 
    id: string; 
    group: string; 
    team1Id: string; 
    team2Id: string; 
    score1: number; 
    score2: number; 
    status: 'SCHEDULED' | 'PLAYING' | 'FINISHED'; 
    order: number;
    title?: string;
};

type Team = { id: string; name: string };

export default function LiveScoringPage({ params }: { params: { id: string } }) {
    const [match, setMatch] = useState<Match | null>(null);
    const [team1, setTeam1] = useState<Team | null>(null);
    const [team2, setTeam2] = useState<Team | null>(null);
    const [loading, setLoading] = useState(true);
    
    // History for Undo
    const historyRef = useRef<{s1: number, s2: number}[]>([]);

    useEffect(() => {
        const matchId = params.id;
        const unsub = onSnapshot(doc(db, "matches", matchId), async (snap) => {
            if (snap.exists()) {
                const m = snap.data() as Match;
                setMatch(m);
                
                // Fetch team names if not already fetched
                if (!team1 || !team2) {
                    // Helper to get name
                    const getName = async (teamId: string, placeholder?: string) => {
                        if (teamId.startsWith("TBD_") || teamId.includes("TBD")) {
                           return placeholder || "TBD";
                        }
                        const tSnap = await getDoc(doc(db, "teams", teamId));
                        if (tSnap.exists()) return tSnap.data().name;
                        return placeholder || teamId; 
                    };

                    const name1 = await getName(m.team1Id, (m as any).placeholder1); // Cast to any to access extra props if type definition is partial
                    const name2 = await getName(m.team2Id, (m as any).placeholder2);

                    setTeam1({ id: m.team1Id, name: name1 });
                    setTeam2({ id: m.team2Id, name: name2 });
                }
                setLoading(false);
            }
        });

        // Wake Lock API attempt
        if ('wakeLock' in navigator) {
            // @ts-ignore
            navigator.wakeLock.request('screen').catch(err => console.log('Wake lock failed', err));
        }

        return () => unsub();
    }, [params.id, team1, team2]);

    const updateScore = async (delta1: number, delta2: number) => {
        if (!match) return;

        // Save history for undo only if gaining points
        if (delta1 > 0 || delta2 > 0) {
            historyRef.current.push({ s1: match.score1, s2: match.score2 });
            if (historyRef.current.length > 5) historyRef.current.shift(); // Keep last 5
        }

        const newS1 = Math.max(0, match.score1 + delta1);
        const newS2 = Math.max(0, match.score2 + delta2);

        // Optimistic update (local state updates automatically via listener, but this feels snappier if we manually set it? NO, stick to listener for consistency)
        await updateDoc(doc(db, "matches", match.id), {
            score1: newS1,
            score2: newS2,
            status: 'PLAYING' // Auto-set to playing if score changes
        });
    };

    const undo = async () => {
        if (!match || historyRef.current.length === 0) return;
        const prev = historyRef.current.pop();
        if (prev) {
             await updateDoc(doc(db, "matches", match.id), {
                score1: prev.s1,
                score2: prev.s2
            });
        }
    };

    const toggleStatus = async () => {
        if (!match) return;
        const nextStatus = match.status === 'SCHEDULED' ? 'PLAYING' : match.status === 'PLAYING' ? 'FINISHED' : 'PLAYING';
        if (nextStatus === 'FINISHED' && !confirm("End Match?")) return;
        
        await updateDoc(doc(db, "matches", match.id), { status: nextStatus });
    };

    if (loading || !match) return (
        <div className="min-h-screen bg-neutral-900 text-white flex items-center justify-center">Loading...</div>
    );

    return (
        <div className="fixed  inset-0 bg-[#333] font-outfit flex flex-col items-center justify-center overflow-hidden">
            {/* Ambient Background (Blue wall look from reference or just neutral) */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#1e3a8a] to-[#black] opacity-40"></div>
            
            {/* Header (Minimal) */}
            <header className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-50 text-white/50">
                <Link href="/referee" className="hover:text-white transition">← Exit</Link>
                <div className="text-sm font-mono tracking-widest uppercase">{match.group === 'KO' ? (match.title || (match as any).label) : `Match #${match.order}`}</div>
                <button onClick={undo} disabled={historyRef.current.length === 0} className="hover:text-yellow-400 disabled:opacity-20 transition">UNDO</button>
            </header>

            {/* THE STAND */}
            <div className="relative w-full h-full flex flex-row items-end justify-center pb-10 perspective-2000">
                
                {/* Stand Base / Backplate */}
                <div className="relative bg-[#050505] rounded-t-[3rem] p-4 md:p-8 pb-0 pt-20 w-full h-full flex flex-col md:flex-row landscape:flex-row justify-center items-center gap-8 md:gap-16 shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.1)] border-t border-white/10 ring-1 ring-white/5 transform md:rotateX(10deg) origin-bottom transition-transform duration-500 overflow-y-auto md:overflow-visible">
                    
                    {/* Metal Hinge Bar (Visual) */}
                    <div className="absolute top-12 left-8 right-8 h-4 bg-gradient-to-b from-gray-700 to-gray-900 rounded-full shadow-inner"></div>

                    {/* Team 1 Section */}
                    <div 
                        className="flex-1 flex flex-col items-center relative group cursor-pointer z-10"
                        onClick={() => updateScore(1, 0)}
                    >
                         {/* Name Plate */}
                        <div className="bg-white/10 backdrop-blur-md px-6 py-2 rounded-t-lg border-t border-x border-white/20 text-center min-w-[150px] md:min-w-[200px] mb-2 md:mb-4 shadow-lg transform -translate-y-2 group-hover:-translate-y-4 transition-transform">
                            <h2 className="text-lg md:text-3xl font-bold text-white tracking-wide truncate max-w-[200px] md:max-w-[300px]">{team1?.name || "Team 1"}</h2>
                        </div>

                        {/* Flip Card */}
                        <div className="relative hover:scale-[1.02] transition-transform active:scale-[0.98]">
                        <FlipCard value={match.score1} size="xl" />
                             {/* Tap Hint */}
                             <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                <div className="bg-black/50 text-white/70 px-4 py-1 rounded-full text-sm font-bold backdrop-blur">TAP TO SCORE</div>
                             </div>
                        </div>

                        {/* Minus Button */}
                        <button 
                            onClick={(e) => { e.stopPropagation(); updateScore(-1, 0); }}
                            className="mt-8 px-8 py-3 bg-[#1a1a1a] rounded-full border border-white/10 text-white/30 hover:text-red-400 hover:border-red-500/50 hover:bg-red-900/10 transition flex items-center gap-2 shadow-lg active:translate-y-1"
                        >
                            <span className="text-xl font-bold">-</span>
                            <span className="text-xs font-bold tracking-widest">REMOVE</span>
                        </button>
                    </div>

                    {/* VS / Divider Area */}
                     <div className="w-[2px] bg-white/5 h-[60%] self-center rounded-full hidden md:block landscape:block"></div>

                    {/* Team 2 Section */}
                   <div 
                        className="flex-1 flex flex-col items-center relative group cursor-pointer z-10"
                        onClick={() => updateScore(0, 1)}
                    >
                         {/* Name Plate */}
                        <div className="bg-white/10 backdrop-blur-md px-6 py-2 rounded-t-lg border-t border-x border-white/20 text-center min-w-[150px] md:min-w-[200px] mb-2 md:mb-4 shadow-lg transform -translate-y-2 group-hover:-translate-y-4 transition-transform">
                            <h2 className="text-lg md:text-3xl font-bold text-white tracking-wide truncate max-w-[200px] md:max-w-[300px]">{team2?.name || "Team 2"}</h2>
                        </div>

                        {/* Flip Card */}
                        <div className="relative hover:scale-[1.02] transition-transform active:scale-[0.98]">
                        <FlipCard value={match.score2} size="xl" />
                            {/* Tap Hint */}
                             <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                <div className="bg-black/50 text-white/70 px-4 py-1 rounded-full text-sm font-bold backdrop-blur">TAP TO SCORE</div>
                             </div>
                        </div>

                         {/* Minus Button */}
                        <button 
                             onClick={(e) => { e.stopPropagation(); updateScore(0, -1); }}
                             className="mt-8 px-8 py-3 bg-[#1a1a1a] rounded-full border border-white/10 text-white/30 hover:text-red-400 hover:border-red-500/50 hover:bg-red-900/10 transition flex items-center gap-2 shadow-lg active:translate-y-1"
                        >
                            <span className="text-xl font-bold">-</span>
                            <span className="text-xs font-bold tracking-widest">REMOVE</span>
                        </button>
                    </div>

                    {/* Logo Branding (like CIMA in reference) */}
                    <div className="absolute bottom-8 text-white/5 font-black text-4xl tracking-[1em] select-none pointer-events-none">
                        EMESOFT
                    </div>
                </div>
            </div>
        </div>
    );
}

