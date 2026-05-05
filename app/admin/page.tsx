"use client";

import React, { useEffect, useState } from 'react';
import { db, seedDatabase, seedGiaiCoHoi } from '@/firebase';
import { collection, onSnapshot, query, orderBy, doc, updateDoc, setDoc } from 'firebase/firestore';
import Link from 'next/link';
import BestMomentsManager from '@/components/admin/BestMomentsManager';
import TeamManager from '@/components/admin/TeamManager';

type Match = { 
    id: string; 
    group: string; 
    team1Id: string; 
    team2Id: string; 
    score1: number; 
    score2: number; 
    status: 'SCHEDULED' | 'PLAYING' | 'FINISHED'; 
    order: number;
    title?: string; // e.g. "Semi Final 1"
};

type Member = { name: string; level: number; gender?: 'M' | 'F'; avatar?: string; };
type Team = { id: string; name: string; alias?: string; group?: string; members?: Member[] };
type GCHMatch = {
    id: string;
    matchNumber: number;
    bracket: 'winners' | 'losers' | 'grand_final';
    round: string;
    roundLabel: string;
    player1: string;
    player2: string;
    score1: number | null;
    score2: number | null;
    status: 'SCHEDULED' | 'PLAYING' | 'FINISHED';
    order: number;
};

export default function AdminPage() {
    const [matches, setMatches] = useState<Match[]>([]);
    const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
    const [authorized, setAuthorized] = useState(false);
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(true);
    const [teams, setTeams] = useState<Team[]>([]);
    const [activeTab, setActiveTab] = useState<'A' | 'B' | 'TEAMS' | 'GCH'>('A');
    const [gchMatches, setGchMatches] = useState<GCHMatch[]>([]);

    // Auth Check
    const checkPassword = () => {
        if (password === "emesoft.net") {
            setAuthorized(true);
            localStorage.setItem("admin_auth", "true");
        } else {
            alert("Sai mật khẩu!");
        }
    };

    useEffect(() => {
        const isAuth = localStorage.getItem("admin_auth");
        if (isAuth === "true") setAuthorized(true);
    }, []);

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

        // Listen to Giải Cơ Hội matches
        const unsubGCH = onSnapshot(query(collection(db, "giai_co_hoi_matches"), orderBy("order", "asc")), (snap) => {
            const g: GCHMatch[] = [];
            snap.forEach(d => g.push(d.data() as GCHMatch));
            setGchMatches(g);
        });

        return () => { unsubMatches(); unsubTeams(); unsubGCH(); };
    }, []);

    const getTeam = (id: string) => teams.find(t => t.id === id);
    const getTeamName = (id: string) => getTeam(id)?.name || id;

    const updateMatch = async (matchId: string, updates: Partial<Match>) => {
        try { 
            const ref = doc(db, "matches", matchId);
            await updateDoc(ref, updates);
        } catch (error) {
            console.error("Update failed", error);
        }
    };

    const updateGchMatch = async (matchId: string, updates: Partial<GCHMatch>) => {
        try {
            const ref = doc(db, "giai_co_hoi_matches", matchId);
            await updateDoc(ref, updates as Record<string, unknown>);
        } catch (error) {
            console.error("GCH Update failed", error);
        }
    };

    const seedKnockout = async () => {
        if (!confirm("Initialize Knockout Matches? This will reset/create Semi & Final matches.")) return;
        
        const koMatches: Match[] = [
            { id: "semi1", group: "KO", title: "Bán kết 1", team1Id: "TBD", team2Id: "TBD", score1: 0, score2: 0, status: "SCHEDULED", order: 100 },
            { id: "semi2", group: "KO", title: "Bán kết 2", team1Id: "TBD", team2Id: "TBD", score1: 0, score2: 0, status: "SCHEDULED", order: 101 },
            { id: "bronze", group: "KO", title: "Tranh Hạng 3", team1Id: "TBD", team2Id: "TBD", score1: 0, score2: 0, status: "SCHEDULED", order: 102 },
            { id: "final", group: "KO", title: "Chung Kết", team1Id: "TBD", team2Id: "TBD", score1: 0, score2: 0, status: "SCHEDULED", order: 103 },
        ];

        for (const m of koMatches) {
            await setDoc(doc(db, "matches", m.id), m);
        }
    };

    if (!authorized) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a] text-white p-4">
            <h1 className="text-2xl font-bold font-orbitron mb-6 text-red-500">ADMIN ACCESS REQUIRED</h1>
            <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Access Password"
                className="bg-white/10 border border-white/20 rounded px-4 py-2 mb-4 w-full max-w-xs text-center focus:outline-none focus:border-red-500 transition"
                onKeyDown={(e) => e.key === 'Enter' && checkPassword()}
            />
            <button 
                onClick={checkPassword}
                className="bg-red-600 hover:bg-red-500 text-white font-bold px-6 py-2 rounded transition w-full max-w-xs"
            >
                UNLOCK
            </button>
            <Link href="/" className="mt-8 text-white/30 hover:text-white text-sm">← Back to Site</Link>
        </div>
    );

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    const filteredMatches = matches.filter(m => m.group === activeTab);
    const knockoutMatches = matches.filter(m => m.group === 'KO');
    const hasKO = knockoutMatches.length > 0;
    
    const selectedMatch = matches.find(m => m.id === selectedMatchId);

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white font-outfit relative pb-20">
             {/* Simple Background */}
             <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 bg-[#0a0a0a]">
                <div className="absolute inset-0 bg-white/5 opacity-50"></div>
            </div>

            <div className="relative z-10 container mx-auto px-4 py-6 flex flex-col md:flex-row gap-6">
                {/* Main Content */}
                <div className="flex-1 w-full">
                    {/* Header */}
                    <header className="flex flex-col md:flex-row justify-between items-center mb-6 border-b border-white/10 pb-4 gap-4">
                        <div className="flex items-center gap-4">
                            <h1 className="text-xl font-bold font-orbitron text-white">ADMIN DASHBOARD</h1>
                            <button onClick={seedDatabase} className="text-xs bg-red-900/30 border border-red-500/50 text-red-400 px-3 py-1.5 rounded hover:bg-red-900/50 transition">
                                ⚡ Init DB
                            </button>
                        </div>
                        <div className="flex items-center gap-4">
                            <button onClick={() => { localStorage.removeItem("admin_auth"); setAuthorized(false); }} className="text-xs text-red-400 hover:text-red-300">
                                Logout
                            </button>
                            <Link href="/" className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded transition">
                                View Site
                            </Link>
                        </div>
                    </header>

                    <div className="flex gap-2 mb-4 flex-wrap">
                        {['A', 'B', 'GCH', 'TEAMS'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={`px-4 py-2 rounded text-sm font-bold border ${activeTab === tab 
                                    ? (tab === 'A' ? 'bg-cyan-900/30 border-cyan-500 text-cyan-400' : 
                                       tab === 'B' ? 'bg-lime-900/30 border-lime-500 text-lime-400' :
                                       tab === 'GCH' ? 'bg-yellow-900/30 border-yellow-500 text-yellow-400' :
                                       'bg-purple-900/30 border-purple-500 text-purple-400') 
                                    : 'bg-black/40 border-white/10 text-white/40 hover:text-white'}`}
                            >
                                {tab === 'TEAMS' ? 'Manage Teams' : tab === 'GCH' ? '🏸 Giải Cơ Hội' : `Table ${tab} Matches`}
                            </button>
                        ))}
                    </div>

                    {activeTab === 'TEAMS' ? (
                        <TeamManager teams={teams} />
                    ) : activeTab === 'GCH' ? (
                        <div className="mb-12">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-yellow-400 font-bold text-lg">🏸 Giải Cơ Hội — Double Elimination</h2>
                                <button onClick={async () => { if (confirm('Seed Giải Cơ Hội 10 matches?')) await seedGiaiCoHoi(); }}
                                    className="text-xs bg-yellow-900/30 border border-yellow-500/50 text-yellow-400 px-3 py-1.5 rounded hover:bg-yellow-900/50 transition">
                                    ⚡ Init GCH
                                </button>
                            </div>
                            {gchMatches.length === 0 && <div className="text-white/30 text-center py-10">Chưa có dữ liệu. Bấm &ldquo;Init GCH&rdquo; để khởi tạo.</div>}
                            <div className="flex flex-col gap-3">
                                {gchMatches.map(m => (
                                    <div key={m.id} className="rounded-lg border p-4 flex flex-col md:flex-row gap-3 items-center"
                                        style={{ background: m.bracket === 'grand_final' ? 'rgba(201,162,39,0.07)' : m.bracket === 'winners' ? 'rgba(30,107,184,0.07)' : 'rgba(139,26,26,0.07)',
                                                 borderColor: m.bracket === 'grand_final' ? 'rgba(255,215,0,0.3)' : m.bracket === 'winners' ? 'rgba(30,107,184,0.3)' : 'rgba(192,57,43,0.3)' }}>
                                        <div className="flex-shrink-0 w-24 text-center">
                                            <div className="text-xs font-bold font-mono" style={{ color: m.bracket === 'grand_final' ? '#FFD700' : m.bracket === 'winners' ? '#3a9bd5' : '#e74c3c' }}>
                                                Trận {m.matchNumber}
                                            </div>
                                            <div className="text-[10px] text-white/30 mt-0.5">{m.bracket === 'grand_final' ? 'Grand Final' : m.bracket === 'winners' ? 'Nánh Thắng' : 'Nánh Thua'}</div>
                                        </div>
                                        <div className="flex-1 grid grid-cols-5 gap-2 items-center text-sm">
                                            <input className="col-span-2 bg-white/5 border border-white/10 rounded px-2 py-1 text-white text-xs"
                                                value={m.player1}
                                                onChange={e => updateGchMatch(m.id, { player1: e.target.value })} />
                                            <div className="flex gap-1 items-center justify-center col-span-1">
                                                <input type="number" min={0} max={99} className="w-10 bg-white/5 border border-white/10 rounded px-1 py-1 text-white text-center text-xs"
                                                    value={m.score1 ?? ''}
                                                    onChange={e => updateGchMatch(m.id, { score1: e.target.value === '' ? null : parseInt(e.target.value) })} />
                                                <span className="text-white/30 text-xs">-</span>
                                                <input type="number" min={0} max={99} className="w-10 bg-white/5 border border-white/10 rounded px-1 py-1 text-white text-center text-xs"
                                                    value={m.score2 ?? ''}
                                                    onChange={e => updateGchMatch(m.id, { score2: e.target.value === '' ? null : parseInt(e.target.value) })} />
                                            </div>
                                            <input className="col-span-2 bg-white/5 border border-white/10 rounded px-2 py-1 text-white text-xs"
                                                value={m.player2}
                                                onChange={e => updateGchMatch(m.id, { player2: e.target.value })} />
                                        </div>
                                        <select
                                            value={m.status}
                                            onChange={e => updateGchMatch(m.id, { status: e.target.value as GCHMatch['status'] })}
                                            className="text-xs bg-black border border-white/20 text-white rounded px-2 py-1.5">
                                            <option value="SCHEDULED">SCHEDULED</option>
                                            <option value="PLAYING">PLAYING</option>
                                            <option value="FINISHED">FINISHED</option>
                                        </select>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="mb-12">
                        {/* Mobile View */}
                        <div className="md:hidden">
                            {filteredMatches.map(match => (
                                <MatchCardMobile
                                    key={match.id}
                                    match={match}
                                    teams={teams}
                                    team1Name={getTeamName(match.team1Id)}
                                    team2Name={getTeamName(match.team2Id)}
                                    onUpdate={updateMatch}
                                    isKnockout={false}
                                />
                            ))}
                            {filteredMatches.length === 0 && <div className="text-white/30 text-center py-10">No matches found.</div>}
                        </div>

                        {/* Desktop View */}
                        <div className="hidden md:block overflow-x-auto bg-[#111] rounded-lg border border-white/10 shadow-xl">
                            <table className="w-full text-left text-sm whitespace-nowrap">
                                <thead className="bg-black/50 text-white/50 font-mono text-xs uppercase border-b border-white/10">
                                    <tr>
                                        <th className="px-4 py-3 text-center w-12">#</th>
                                        <th className="px-4 py-3 text-right w-1/4">Team 1</th>
                                        <th className="px-2 py-3 text-center w-32">Score</th>
                                        <th className="px-4 py-3 text-left w-1/4">Team 2</th>
                                        <th className="px-4 py-3 text-center w-32">Status</th>
                                        <th className="px-4 py-3 text-center w-24">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {filteredMatches.map((match) => (
                                        <MatchRow 
                                            key={match.id} 
                                            match={match} 
                                            teams={teams}
                                            team1Name={getTeamName(match.team1Id)} 
                                            team2Name={getTeamName(match.team2Id)} 
                                            onUpdate={updateMatch}
                                            isKnockout={false}
                                            isSelected={selectedMatchId === match.id}
                                            onSelect={() => setSelectedMatchId(match.id)}
                                        />
                                    ))}
                                </tbody>
                            </table>
                            
                            {filteredMatches.length === 0 && (
                                <div className="p-10 text-center text-white/30">No matches found in this group.</div>
                            )}
                        </div>
                        </div>
                    )}

                    {/* Knockout Stage Section */}
                    <div className="border-t border-white/10 pt-8">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold font-quicksand text-yellow-500">🏆 Knockout Stage Setup</h2>
                            {!hasKO && (
                                 <button onClick={seedKnockout} className="bg-yellow-600/20 border border-yellow-500/50 text-yellow-500 text-xs px-3 py-1.5 rounded hover:bg-yellow-600/40 transition">
                                    Initialize Bracket
                                </button>
                            )}
                        </div>

                        {hasKO && (
                            <div className="mt-4">
                                {/* Mobile View */}
                                <div className="md:hidden">
                                    {knockoutMatches.map(match => (
                                        <MatchCardMobile
                                            key={match.id}
                                            match={match}
                                            teams={teams}
                                            team1Name={getTeamName(match.team1Id)}
                                            team2Name={getTeamName(match.team2Id)}
                                            onUpdate={updateMatch}
                                            isKnockout={true}
                                        />
                                    ))}
                                </div>

                                {/* Desktop View */}
                                <div className="hidden md:block overflow-x-auto bg-[#1b1500] rounded-lg border border-yellow-500/20 shadow-xl">
                                    <table className="w-full text-left text-sm whitespace-nowrap">
                                        <thead className="bg-black/50 text-yellow-500/50 font-mono text-xs uppercase border-b border-yellow-500/10">
                                            <tr>
                                                <th className="px-4 py-3 text-center w-32">Stage</th>
                                                <th className="px-4 py-3 text-right w-1/4">Team 1 (Select)</th>
                                                <th className="px-2 py-3 text-center w-32">Score</th>
                                                <th className="px-4 py-3 text-left w-1/4">Team 2 (Select)</th>
                                                <th className="px-4 py-3 text-center w-32">Status</th>
                                                <th className="px-4 py-3 text-center w-24">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-yellow-500/10">
                                            {knockoutMatches.map((match) => (
                                                <MatchRow 
                                                    key={match.id} 
                                                    match={match} 
                                                    teams={teams}
                                                    team1Name={getTeamName(match.team1Id)} 
                                                    team2Name={getTeamName(match.team2Id)} 
                                                    onUpdate={updateMatch}
                                                    isKnockout={true}
                                                    isSelected={selectedMatchId === match.id}
                                                    onSelect={() => setSelectedMatchId(match.id)}
                                                />
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                        </div>

                     {/* Best Moments Management */}
                    <div className="border-t border-white/10 pt-8 mt-8">
                         <BestMomentsManager />
                    </div>
                </div>

{/* Sidebar removed */}
            </div>
        </div>
    );
}

function TeamDetailsCard({ team, teamId }: { team?: Team, teamId: string }) {
    if (!team) return <div className="p-3 rounded bg-white/5 border border-white/10 text-white/30 text-xs text-center">{teamId === 'TBD' ? 'TBD (To Be Determined)' : 'Team Not Found'}</div>;
    return (
        <div className="bg-white/5 rounded-lg border border-white/10 overflow-hidden">
            <div className="p-3 bg-white/5 font-bold border-b border-white/10">{team.name}</div>
            <div className="p-3">
                <div className="text-xs text-white/50 mb-2">Members:</div>
                <div className="space-y-1">
                    {team.members?.map((m, i) => (
                         <div key={i} className="flex justify-between items-center text-sm gap-2">
                             <div className="flex items-center gap-2">
                                 {m.avatar ? (
                                    <img src={m.avatar} alt={m.name} className="w-5 h-5 rounded-full object-cover border border-white/10" />
                                 ) : (
                                     <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] border border-white/10 ${m.gender === 'F' ? 'bg-pink-900/20 text-pink-400' : 'bg-blue-900/20 text-blue-400'}`}>
                                         {m.gender === 'F' ? 'F' : 'M'}
                                     </div>
                                 )}
                                 <span>{m.name}</span>
                             </div>
                            <span className="text-white/30 text-xs">Lvl {m.level}</span>
                        </div>
                    )) || <div className="text-white/30 text-xs italic">No members listed</div>}
                </div>
            </div>
        </div>
    );
}

function MatchRow({ match, teams, team1Name, team2Name, onUpdate, isKnockout, isSelected, onSelect }: { 
    match: Match, 
    teams: Team[], 
    team1Name: string, 
    team2Name: string, 
    onUpdate: (id: string, d: Partial<Match>) => void, 
    isKnockout: boolean,
    isSelected: boolean,
    onSelect: () => void
}) {
    const [s1, setS1] = useState(match.score1);
    const [s2, setS2] = useState(match.score2);
    const [t1, setT1] = useState(match.team1Id);
    const [t2, setT2] = useState(match.team2Id);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        setS1(match.score1);
        setS2(match.score2);
        setT1(match.team1Id);
        setT2(match.team2Id);
        setHasChanges(false);
    }, [match.score1, match.score2, match.team1Id, match.team2Id]);

    const handleScoreChange = (val1: number, val2: number) => {
        setS1(val1);
        setS2(val2);
        setHasChanges(true); 
    };

    const handleTeamChange = (team1: string, team2: string) => {
        setT1(team1);
        setT2(team2);
        setHasChanges(true);
    };

    const saveDetails = () => {
        onUpdate(match.id, { 
            score1: Number(s1), 
            score2: Number(s2),
            team1Id: t1,
            team2Id: t2
        });
        setHasChanges(false);
    };

    const isMatchLive = match.status === 'PLAYING';
    const isLocked = match.status === 'FINISHED';
    
    // Helper to get team details
    const getTeam = (id: string) => teams.find(t => t.id === id);

    return (
        <React.Fragment>
            <tr 
                onClick={onSelect}
                className={`transition cursor-pointer ${
                    isSelected ? 'bg-white/10' : 'hover:bg-white/5'
                } ${isMatchLive ? 'bg-red-900/10' : ''}`}
            >
                <td className="px-4 py-3 text-center font-mono opacity-50">
                    {match.title || `#${match.order}`}
                </td>
                
                {/* Team 1 */}
                <td className={`px-4 py-3 text-right font-medium`}>
                    {isKnockout ? (
                        <select 
                            value={t1} 
                            onChange={(e) => handleTeamChange(e.target.value, t2)}
                            disabled={isLocked}
                            onClick={(e) => e.stopPropagation()}
                            className={`bg-black/40 border border-white/10 rounded px-2 py-1 text-xs text-white max-w-[120px] ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <option value="TBD">Select Team</option>
                            {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                    ) : (
                        <span className={`${match.score1 > match.score2 && match.status === 'FINISHED' ? 'text-green-400' : 'text-gray-300'}`}>
                            {team1Name}
                        </span>
                    )}
                </td>

                {/* Score Inputs */}
                <td className="px-2 py-3">
                    <div className="flex items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <input 
                            type="number" 
                            value={s1}
                            onChange={(e) => handleScoreChange(Number(e.target.value), s2)}
                            disabled={isLocked}
                            className={`w-16 h-10 bg-black/40 border rounded text-center font-bold text-lg focus:ring-1 focus:outline-none no-spinner ${
                                hasChanges ? 'border-yellow-500 text-yellow-500' : 
                                isLocked ? 'border-transparent text-white/50 bg-transparent' : 'border-white/20 text-white'
                            }`}
                        />
                        <span className="text-white/20">-</span>
                        <input 
                            type="number" 
                            value={s2}
                            onChange={(e) => handleScoreChange(s1, Number(e.target.value))}
                             disabled={isLocked}
                            className={`w-16 h-10 bg-black/40 border rounded text-center font-bold text-lg focus:ring-1 focus:outline-none no-spinner ${
                                hasChanges ? 'border-yellow-500 text-yellow-500' : 
                                isLocked ? 'border-transparent text-white/50 bg-transparent' : 'border-white/20 text-white'
                            }`}
                        />
                    </div>
                </td>

                {/* Team 2 */}
                <td className={`px-4 py-3 text-left font-medium`}>
                     {isKnockout ? (
                        <select 
                            value={t2} 
                            onChange={(e) => handleTeamChange(t1, e.target.value)}
                            disabled={isLocked}
                            onClick={(e) => e.stopPropagation()}
                            className={`bg-black/40 border border-white/10 rounded px-2 py-1 text-xs text-white max-w-[120px] ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                             <option value="TBD">Select Team</option>
                             {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                    ) : (
                        <span className={`${match.score2 > match.score1 && match.status === 'FINISHED' ? 'text-green-400' : 'text-gray-300'}`}>
                            {team2Name}
                        </span>
                    )}
                </td>

                {/* Status Dropdown */}
                <td className="px-4 py-3 text-center">
                    <select 
                        value={match.status}
                        onChange={(e) => onUpdate(match.id, { status: e.target.value as any })}
                        onClick={(e) => e.stopPropagation()}
                        className={`bg-transparent text-xs font-bold border rounded px-2 py-1 cursor-pointer focus:outline-none ${
                            match.status === 'PLAYING' ? 'border-red-500 text-red-500' : 
                            match.status === 'FINISHED' ? 'border-green-500 text-green-500' : 
                            'border-white/20 text-white/50'
                        }`}
                    >
                        <option value="SCHEDULED" className="bg-black">SCH</option>
                        <option value="PLAYING" className="bg-black">LIVE</option>
                        <option value="FINISHED" className="bg-black">DONE</option>
                    </select>
                </td>

                {/* Actions */}
                <td className="px-4 py-3 text-center flex gap-2 justify-center items-center">
                    {hasChanges ? (
                        <button 
                            onClick={(e) => { e.stopPropagation(); saveDetails(); }}
                            className="bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-bold px-3 py-1.5 rounded transition"
                        >
                            SAVE
                        </button>
                    ) : (
                        <Link
                            href={`/referee/${match.id}`}
                            target="_blank"
                            onClick={(e) => e.stopPropagation()}
                            className="group relative px-3 py-1.5 rounded-full overflow-hidden transition-all duration-300 ease-out hover:scale-105 active:scale-95 flex items-center gap-2 border border-[#ccff00]/30 hover:border-[#ccff00] hover:shadow-[0_0_15px_rgba(204,255,0,0.3)]"
                            title="Open Live Scoreboard"
                        >
                            {/* Background filler on hover */}
                            <div className="absolute inset-0 bg-[#ccff00] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            
                            {/* Text and Icon */}
                            <span className="relative z-10 text-[10px] font-black tracking-widest text-[#ccff00] group-hover:text-black">LIVE</span>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="relative z-10 w-3 h-3 text-[#ccff00] group-hover:text-black transition-transform group-hover:translate-x-0.5">
                                <path fillRule="evenodd" d="M8.25 3.75H19.5a.75.75 0 01.75.75v11.25a.75.75 0 01-1.5 0V6.31L5.03 20.03a.75.75 0 01-1.06-1.06L17.69 5.25H8.25a.75.75 0 010-1.5z" clipRule="evenodd" />
                            </svg>
                        </Link>
                    )}
                </td>
            </tr>
            {isSelected && (
                <tr className="bg-white/5 border-t border-white/5 animate-in fade-in zoom-in-95 duration-200">
                    <td colSpan={6} className="p-4">
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <div className="text-xs uppercase tracking-widest text-[#00e5ff] mb-2 font-bold">Team 1 Details</div>
                                <TeamDetailsCard team={getTeam(match.team1Id)} teamId={match.team1Id} />
                            </div>
                            <div className="flex-1">
                                <div className="text-xs uppercase tracking-widest text-[#ff00cc] mb-2 font-bold">Team 2 Details</div>
                                <TeamDetailsCard team={getTeam(match.team2Id)} teamId={match.team2Id} />
                            </div>
                        </div>
                    </td>
                </tr>
            )}
        </React.Fragment>
    );
}

function MatchCardMobile({ match, teams, team1Name, team2Name, onUpdate, isKnockout }: { 
    match: Match, 
    teams: Team[], 
    team1Name: string, 
    team2Name: string, 
    onUpdate: (id: string, d: Partial<Match>) => void, 
    isKnockout: boolean
}) {
    const [s1, setS1] = useState(match.score1);
    const [s2, setS2] = useState(match.score2);
    const [t1, setT1] = useState(match.team1Id);
    const [t2, setT2] = useState(match.team2Id);
    const [hasChanges, setHasChanges] = useState(false);
    const [showDetails, setShowDetails] = useState(false);

    const getTeam = (id: string) => teams.find(t => t.id === id);

    useEffect(() => {
        setS1(match.score1);
        setS2(match.score2);
        setT1(match.team1Id);
        setT2(match.team2Id);
        setHasChanges(false);
    }, [match.score1, match.score2, match.team1Id, match.team2Id]);

    const handleScoreChange = (val1: number, val2: number) => {
        setS1(val1);
        setS2(val2);
        setHasChanges(true); 
    };

    const handleTeamChange = (team1: string, team2: string) => {
        setT1(team1);
        setT2(team2);
        setHasChanges(true);
    };

    const saveDetails = () => {
        onUpdate(match.id, { 
            score1: Number(s1), 
            score2: Number(s2),
            team1Id: t1,
            team2Id: t2
        });
        setHasChanges(false);
    };

    const isMatchLive = match.status === 'PLAYING';
    const isLocked = match.status === 'FINISHED';
    
    return (
        <div className={`bg-[#111] border rounded-lg p-4 mb-4 ${
            isMatchLive ? 'border-red-500/30 bg-red-900/10' : 'border-white/10'
        }`}>
            {/* Header: Title + Status */}
            <div className="flex justify-between items-start mb-4">
                <div className="text-xs font-mono text-white/50">{match.title || `#${match.order}`}</div>
                <select 
                    value={match.status}
                    onChange={(e) => onUpdate(match.id, { status: e.target.value as any })}
                    className={`bg-transparent text-xs font-bold border rounded px-2 py-1 ${
                        match.status === 'PLAYING' ? 'border-red-500 text-red-500' : 
                        match.status === 'FINISHED' ? 'border-green-500 text-green-500' : 
                        'border-white/20 text-white/50'
                    }`}
                >
                    <option value="SCHEDULED" className="bg-black">SCH</option>
                    <option value="PLAYING" className="bg-black">LIVE</option>
                    <option value="FINISHED" className="bg-black">DONE</option>
                </select>
            </div>

            {/* Teams Grid */}
            <div className="grid grid-cols-[1fr,auto,1fr] gap-2 items-center mb-4">
                {/* Team 1 */}
                <div className="flex flex-col items-center gap-2">
                     {isKnockout ? (
                        <select 
                            value={t1} 
                            onChange={(e) => handleTeamChange(e.target.value, t2)}
                            disabled={isLocked}
                            className="bg-black/40 border border-white/10 rounded px-1 py-1 text-xs text-white w-full max-w-[100px]"
                        >
                            <option value="TBD">Select</option>
                            {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                    ) : (
                        <span className={`text-sm text-center font-bold truncate w-full ${match.score1 > match.score2 && match.status === 'FINISHED' ? 'text-green-400' : 'text-gray-300'}`}>
                            {team1Name}
                        </span>
                    )}
                    <input 
                        type="number" 
                        value={s1}
                        onChange={(e) => handleScoreChange(Number(e.target.value), s2)}
                        disabled={isLocked}
                        className="w-12 h-10 bg-black/40 border border-white/20 rounded text-center font-bold text-lg"
                    />
                </div>

                <div className="text-white/20 font-bold">-</div>

                {/* Team 2 */}
                <div className="flex flex-col items-center gap-2">
                     {isKnockout ? (
                        <select 
                            value={t2} 
                            onChange={(e) => handleTeamChange(t1, e.target.value)}
                            disabled={isLocked}
                            className="bg-black/40 border border-white/10 rounded px-1 py-1 text-xs text-white w-full max-w-[100px]"
                        >
                            <option value="TBD">Select</option>
                            {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                    ) : (
                        <span className={`text-sm text-center font-bold truncate w-full ${match.score2 > match.score1 && match.status === 'FINISHED' ? 'text-green-400' : 'text-gray-300'}`}>
                            {team2Name}
                        </span>
                    )}
                    <input 
                        type="number" 
                        value={s2}
                        onChange={(e) => handleScoreChange(s1, Number(e.target.value))}
                        disabled={isLocked}
                        className="w-12 h-10 bg-black/40 border border-white/20 rounded text-center font-bold text-lg"
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center pt-3 border-t border-white/5">
                <button 
                    onClick={() => setShowDetails(!showDetails)}
                    className="text-xs text-white/50 hover:text-white flex items-center gap-1"
                >
                    {showDetails ? 'Hide Details' : 'Show Details'}
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-3 h-3 transition-transform ${showDetails ? 'rotate-180' : ''}`}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                </button>

                <div className="flex gap-3">
                    {hasChanges && (
                        <button onClick={saveDetails} className="bg-yellow-500 text-black text-xs font-bold px-4 py-2 rounded">
                            SAVE CHANGES
                        </button>
                    )}
                    <Link
                        href={`/referee/${match.id}`}
                        className="text-xs bg-white/5 border border-white/10 px-3 py-2 rounded hover:bg-white/10 text-white/50 hover:text-white transition"
                    >
                        Open Live Board
                    </Link>
                </div>
            </div>

            {/* Expanded Details */}
            {showDetails && (
                <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-1 gap-4 animate-in fade-in slide-in-from-top-2">
                    <div>
                        <div className="text-[10px] uppercase tracking-widest text-[#00e5ff] mb-2 font-bold">Team 1 Details</div>
                        <TeamDetailsCard team={getTeam(match.team1Id)} teamId={match.team1Id} />
                    </div>
                    <div>
                        <div className="text-[10px] uppercase tracking-widest text-[#ff00cc] mb-2 font-bold">Team 2 Details</div>
                        <TeamDetailsCard team={getTeam(match.team2Id)} teamId={match.team2Id} />
                    </div>
                </div>
            )}
        </div>
    );
}
