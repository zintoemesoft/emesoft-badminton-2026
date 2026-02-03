"use client";

import React, { useEffect, useState } from 'react';
import { db } from '@/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import Link from 'next/link';

type Match = { 
    id: string; 
    group: string; 
    team1Id: string; 
    team2Id: string; 
    status: 'SCHEDULED' | 'PLAYING' | 'FINISHED'; 
    order: number;
    title?: string;
};

type Team = { id: string; name: string };

export default function RefereeSelectionPage() {
    const [matches, setMatches] = useState<Match[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubMatches = onSnapshot(query(collection(db, "matches"), orderBy("order", "asc")), (snap) => {
            const m: Match[] = [];
            snap.forEach(d => m.push(d.data() as Match));
            setMatches(m);
            setLoading(false);
        });

        const unsubTeams = onSnapshot(collection(db, "teams"), (snap) => {
            const t: Team[] = [];
            snap.forEach(d => t.push({ id: d.id, ...d.data() } as Team));
            setTeams(t);
        });

        return () => { unsubMatches(); unsubTeams(); };
    }, []);

    const getTeamName = (id: string) => teams.find(t => t.id === id)?.name || id;

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-black text-white">
            <div className="animate-spin w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full"></div>
        </div>
    );

    // Group matches
    const activeMatches = matches.filter(m => m.status === 'PLAYING');
    const scheduledMatches = matches.filter(m => m.status === 'SCHEDULED');

    return (
        <div className="min-h-screen bg-black text-white font-outfit p-6">
            <header className="mb-8 flex justify-between items-center">
                <div>
                     <h1 className="text-2xl font-bold font-orbitron text-yellow-500">REFEREE MODE</h1>
                     <p className="text-white/50 text-sm">Select a match to officiate</p>
                </div>
                <Link href="/" className="text-xs bg-white/10 px-3 py-1.5 rounded">Exit</Link>
            </header>

            {/* LIVE Matches */}
            {activeMatches.length > 0 && (
                <section className="mb-8">
                    <h2 className="text-red-500 font-bold mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                        LIVE NOW
                    </h2>
                    <div className="grid gap-4">
                        {activeMatches.map(match => (
                            <MatchCard key={match.id} match={match} getTeamName={getTeamName} isLive={true} />
                        ))}
                    </div>
                </section>
            )}

            {/* UPCOMING Matches */}
            <section>
                <h2 className="text-blue-400 font-bold mb-4">UPCOMING</h2>
                <div className="grid gap-4">
                    {scheduledMatches.map(match => (
                        <MatchCard key={match.id} match={match} getTeamName={getTeamName} isLive={false} />
                    ))}
                    {scheduledMatches.length === 0 && (
                        <div className="text-white/30 italic">No scheduled matches pending.</div>
                    )}
                </div>
            </section>
        </div>
    );
}

function MatchCard({ match, getTeamName, isLive }: { match: Match, getTeamName: (id: string) => string, isLive: boolean }) {
    return (
        <Link href={`/referee/${match.id}`} className={`block p-4 rounded-xl border transition active:scale-95 ${isLive ? 'bg-red-900/20 border-red-500/50 hover:bg-red-900/30' : 'bg-[#111] border-white/10 hover:bg-[#222]'}`}>
            <div className="flex justify-between items-center text-sm mb-2 opacity-50 font-mono">
                <span>{match.title || `Match #${match.order}`}</span>
                <span>{match.group === 'KO' ? 'KNOCKOUT' : `TABLE ${match.group}`}</span>
            </div>
            <div className="flex justify-between items-center text-lg font-bold">
                <div className="flex-1 text-right pr-4">{getTeamName(match.team1Id)}</div>
                <div className="bg-white/10 px-3 py-1 rounded font-mono text-sm">VS</div>
                <div className="flex-1 text-left pl-4">{getTeamName(match.team2Id)}</div>
            </div>
        </Link>
    );
}
