"use client";

import { useState, useEffect } from "react";
import { db } from "@/firebase";
import { doc, getDoc, setDoc, onSnapshot, collection, query, where, serverTimestamp } from "firebase/firestore";
import { User } from "firebase/auth";

type Match = { 
    id: string; 
    group: string; 
    team1Id: string; 
    team2Id: string; 
    score1: number; 
    score2: number; 
    status: string; 
    order: number;
    label?: string;
    placeholder1?: string;
    placeholder2?: string;
};

type Team = { id: string; name: string; };

interface KnockoutBettingProps {
    match: Match;
    team1?: Team;
    team2?: Team;
    user: User | null;
    className?: string;
}

export default function KnockoutBetting({ match, team1, team2, user, className = "" }: KnockoutBettingProps) {
    const [userVote, setUserVote] = useState<string | null>(null);
    const [voteStats, setVoteStats] = useState<{ team1: number, team2: number }>({ team1: 0, team2: 0 });
    const [loading, setLoading] = useState(false);

    // Fetch user's existing vote
    useEffect(() => {
        if (!user || !match.id) {
            setUserVote(null);
            return;
        }

        const betRef = doc(db, "bets", `${match.id}_${user.uid}`);
        const unsub = onSnapshot(betRef, (doc) => {
            if (doc.exists()) {
                setUserVote(doc.data().prediction);
            } else {
                setUserVote(null);
            }
        });

        return () => unsub();
    }, [user, match.id]);

    // Fetch vote stats (optional, but nice)
    useEffect(() => {
        const q = query(collection(db, "bets"), where("matchId", "==", match.id));
        const unsub = onSnapshot(q, (snapshot) => {
            let t1 = 0;
            let t2 = 0;
            snapshot.forEach(doc => {
                const data = doc.data();
                if (data.prediction === 'team1') t1++;
                if (data.prediction === 'team2') t2++;
            });
            setVoteStats({ team1: t1, team2: t2 });
        });
        return () => unsub();
    }, [match.id]);

    const handleVote = async (prediction: 'team1' | 'team2') => {
        if (!user) return;
        setLoading(true);
        try {
            const betRef = doc(db, "bets", `${match.id}_${user.uid}`);
            await setDoc(betRef, {
                userId: user.uid,
                userName: user.displayName || "Anonymous",
                userPhoto: user.photoURL,
                matchId: match.id,
                prediction,
                updatedAt: serverTimestamp()
            });
        } catch (error) {
            console.error("Error placing bet:", error);
        } finally {
            setLoading(false);
        }
    };

    const team1Name = team1 ? team1.name : (match.placeholder1 || "TBD");
    const team2Name = team2 ? team2.name : (match.placeholder2 || "TBD");
    const totalVotes = voteStats.team1 + voteStats.team2;
    const t1Percent = totalVotes > 0 ? ((voteStats.team1 / totalVotes) * 100).toFixed(0) : 0;
    const t2Percent = totalVotes > 0 ? ((voteStats.team2 / totalVotes) * 100).toFixed(0) : 0;

    // Detect special match types for styling
    const isFinal = match.id.includes('final'); 
    const isFinished = match.status === 'FINISHED';
    const winner = match.score1 > match.score2 ? 'team1' : match.score1 < match.score2 ? 'team2' : null;

    return (
        <div className={`match-card relative ${className}`} data-id={match.id}>
            {/* Finals Crown or Winner Badge */}
            {isFinal && !isFinished && <div className="crown-icon">👑</div>}

            {/* Label */}
            <div className={`bracket-label ${isFinal ? 'label-gold' : ''}`}>
                {match.label || "Trận đấu"}
            </div>

            <div className={`match-content ${isFinal ? 'big-match' : ''}`}>
                {/* Team 1 (Top) */}
                <button 
                    onClick={() => handleVote('team1')}
                    disabled={!user || loading || isFinished}
                    className={`team-slot top w-full relative transition-all duration-300 group ${
                        isFinished 
                            ? (winner === 'team1' 
                                ? 'bg-gradient-to-r from-yellow-500/20 to-transparent border-l-4 border-[#ffdd00] opacity-100 scale-105 z-10 shadow-[0_0_30px_rgba(255,221,0,0.1)]' 
                                : 'opacity-30 blur-[1px] grayscale')
                            : (userVote === 'team1' ? 'bg-white/10' : 'hover:bg-white/5')
                    }`}
                >
                    <div className="flex flex-col items-center w-full z-10">
                        <span className={`team-name transition-all ${
                            isFinished 
                                ? (winner === 'team1' ? 'text-[#ffdd00] font-black text-2xl drop-shadow-md' : 'text-white')
                                : (userVote === 'team1' ? 'text-cyan-400' : '')
                        }`}>
                            {team1Name}
                        </span>
                        {/* Score Display if Finished */}
                         {isFinished ? (
                             <span className={`text-3xl font-mono font-bold mt-2 ${winner === 'team1' ? 'text-[#ffdd00]' : 'text-white/50'}`}>
                                 {match.score1}
                             </span>
                         ) : (
                            totalVotes > 0 && <span className="text-xs text-white/50 mt-1">{t1Percent}%</span>
                         )}
                    </div>
                    {/* Vote Indicator BG (Only if not finished or user actually voted) */}
                    {!isFinished && userVote === 'team1' && <div className="absolute inset-0 border border-cyan-500/50 rounded-lg box-border"></div>}
                </button>

                {/* VS or Score Divider */}
                <div className={`vs-text ${isFinal ? 'vs-gold' : ''} ${isFinished ? 'opacity-50 scale-75' : ''}`}>
                   VS
                </div>

                {/* Team 2 (Bottom) */}
                <button 
                    onClick={() => handleVote('team2')}
                    disabled={!user || loading || isFinished}
                    className={`team-slot bottom w-full relative transition-all duration-300 group ${
                         isFinished 
                            ? (winner === 'team2' 
                                ? 'bg-gradient-to-r from-yellow-500/20 to-transparent border-l-4 border-[#ffdd00] opacity-100 scale-105 z-10 shadow-[0_0_30px_rgba(255,221,0,0.1)]' 
                                : 'opacity-30 blur-[1px] grayscale')
                            : (userVote === 'team2' ? 'bg-white/10' : 'hover:bg-white/5')
                    }`}
                >
                     <div className="flex flex-col items-center w-full z-10">
                        <span className={`team-name transition-all ${
                             isFinished 
                                ? (winner === 'team2' ? 'text-[#ffdd00] font-black text-2xl drop-shadow-md' : 'text-white')
                                : (userVote === 'team2' ? 'text-pink-400' : '')
                        }`}>
                             {team2Name}
                        </span>
                         {/* Score Display if Finished */}
                        {isFinished ? (
                             <span className={`text-3xl font-mono font-bold mt-2 ${winner === 'team2' ? 'text-[#ffdd00]' : 'text-white/50'}`}>
                                 {match.score2}
                             </span>
                         ) : (
                            totalVotes > 0 && <span className="text-xs text-white/50 mt-1">{t2Percent}%</span>
                         )}
                    </div>
                     {/* Vote Indicator BG */}
                    {!isFinished && userVote === 'team2' && <div className="absolute inset-0 border border-pink-500/50 rounded-lg box-border"></div>}
                </button>
            </div>
            
            {/* Progress Bar (Hidden if finished) */}
            {!isFinished && totalVotes > 0 && (
                <div className="absolute bottom-0 left-0 w-full h-1 bg-white/10 flex">
                    <div className="bg-cyan-500 h-full transition-all duration-500" style={{ width: `${t1Percent}%` }}></div>
                    <div className="bg-pink-500 h-full transition-all duration-500" style={{ width: `${t2Percent}%` }}></div>
                </div>
            )}
        </div>
    );
}
