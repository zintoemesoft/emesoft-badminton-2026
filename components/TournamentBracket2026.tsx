"use client";

import { useEffect, useState } from 'react';
import { db } from '@/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

export type GCHMatch = {
    id: string;
    matchNumber: number;
    round: string;
    roundLabel: string;
    bracket: 'winners' | 'losers' | 'grand_final';
    player1: string;
    player2: string;
    score1: number | null;
    score2: number | null;
    status: 'SCHEDULED' | 'PLAYING' | 'FINISHED';
    order: number;
};

function StatusDot({ status }: { status: GCHMatch['status'] }) {
    const cls = status === 'PLAYING' ? 'live' : status === 'FINISHED' ? 'finished' : 'scheduled';
    return <span className={`t26-status-dot ${cls}`} title={status} />;
}

function MatchCard({ match }: { match: GCHMatch }) {
    const isFinished = match.status === 'FINISHED';
    const winner = isFinished
        ? (match.score1 !== null && match.score2 !== null
            ? (match.score1 > match.score2 ? 'p1' : match.score1 < match.score2 ? 'p2' : null)
            : null)
        : null;

    const isLive = match.status === 'PLAYING';

    return (
        <div className={`t26-match-card ${match.bracket}`}
            style={isLive ? { boxShadow: match.bracket === 'winners' ? '0 0 12px rgba(30,107,184,0.4)' : '0 0 12px rgba(192,57,43,0.4)' } : {}}>
            <div className="t26-match-header">
                <span>Trận {match.matchNumber} — {match.roundLabel}</span>
                <StatusDot status={match.status} />
            </div>
            <div className="t26-match-body">
                <div className={`t26-team-slot ${winner === 'p1' ? 'winner-team' : winner === 'p2' && isFinished ? 'loser-team' : ''}`}>
                    {match.player1}
                </div>
                <div className="t26-vs-center">
                    <span className="t26-vs-text">VS</span>
                    {isFinished && match.score1 !== null && match.score2 !== null && (
                        <div className="t26-scores">
                            <span style={{ color: winner === 'p1' ? '#FFD700' : 'rgba(255,255,255,0.4)' }}>{match.score1}</span>
                            <span style={{ color: 'rgba(255,255,255,0.2)' }}>-</span>
                            <span style={{ color: winner === 'p2' ? '#FFD700' : 'rgba(255,255,255,0.4)' }}>{match.score2}</span>
                        </div>
                    )}
                </div>
                <div className={`t26-team-slot ${winner === 'p2' ? 'winner-team' : winner === 'p1' && isFinished ? 'loser-team' : ''}`}>
                    {match.player2}
                </div>
            </div>
        </div>
    );
}

function GrandFinalCard({ match }: { match: GCHMatch }) {
    const isFinished = match.status === 'FINISHED';
    const winner = isFinished && match.score1 !== null && match.score2 !== null
        ? (match.score1 > match.score2 ? 'p1' : match.score1 < match.score2 ? 'p2' : null)
        : null;

    return (
        <div className="t26-grand-final-wrap">
            
            <div className="t26-grand-final">
                <div className="t26-grand-final-header">
                    <div className="t26-grand-final-title">
                        <span className="text-3xl">👑</span> Chung Kết Tổng (Trận {match.matchNumber})
                    </div>
                    <div className="t26-grand-final-note">
                        * Nếu đại diện Nhánh Thua thắng, hai đội sẽ đánh thêm Trận 11 để tranh Cup Vô Địch
                    </div>
                </div>
                <div className="t26-grand-final-body">
                    <div className="t26-gf-team">
                        <div className={`t26-gf-team-name ${winner === 'p1' ? 'winner-gf' : ''}`}>
                            {match.player1}
                        </div>
                        <div className="t26-gf-source w-src">Đại diện Nhánh Thắng</div>
                        {isFinished && match.score1 !== null && (
                            <div className="mt-2 font-orbitron text-3xl font-black" style={{ color: winner === 'p1' ? '#FFD700' : 'rgba(255,255,255,0.4)' }}>
                                {match.score1}
                            </div>
                        )}
                    </div>
                    <div className="t26-gf-vs-center">
                        {isFinished && match.score1 !== null && match.score2 !== null ? (
                            <div className="t26-gf-vs-text text-white/20 text-2xl">—</div>
                        ) : (
                            <div className="t26-gf-vs-text">VS</div>
                        )}
                        <StatusDot status={match.status} />
                    </div>
                    <div className="t26-gf-team">
                        <div className={`t26-gf-team-name ${winner === 'p2' ? 'winner-gf' : ''}`}>
                            {match.player2}
                        </div>
                        <div className="t26-gf-source l-src">Đại diện Nhánh Thua</div>
                        {isFinished && match.score2 !== null && (
                            <div className="mt-2 font-orbitron text-3xl font-black" style={{ color: winner === 'p2' ? '#FFD700' : 'rgba(255,255,255,0.4)' }}>
                                {match.score2}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function TournamentBracket2026() {
    const [matches, setMatches] = useState<GCHMatch[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsub = onSnapshot(
            query(collection(db, 'giai_co_hoi_matches'), orderBy('order', 'asc')),
            (snap) => {
                const ms: GCHMatch[] = [];
                snap.forEach(d => ms.push(d.data() as GCHMatch));
                setMatches(ms);
                setLoading(false);
            }
        );
        return () => unsub();
    }, []);

    const winnersMatches = matches.filter(m => m.bracket === 'winners');
    const losersMatches = matches.filter(m => m.bracket === 'losers');
    const grandFinal = matches.find(m => m.bracket === 'grand_final');

    // Group by round for display
    const groupByRound = (ms: GCHMatch[]) => {
        const groups: Record<string, GCHMatch[]> = {};
        ms.forEach(m => {
            if (!groups[m.round]) groups[m.round] = [];
            groups[m.round].push(m);
        });
        return groups;
    };

    const winnersGroups = groupByRound(winnersMatches);
    const losersGroups = groupByRound(losersMatches);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-10 h-10 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (matches.length === 0) {
        return (
            <div className="text-center py-20 text-white/30">
                <div className="text-4xl mb-4">🏸</div>
                <p>Dữ liệu giải đấu đang được cập nhật...</p>
            </div>
        );
    }

    return (
        <div>
            {/* Two-column bracket */}
            <div className="t26-bracket-grid">
                {/* Winners Bracket */}
                <div className="t26-col-winners">
                    <div className="t26-col-header winners-header">
                        <span style={{ fontSize: '1.2rem' }}>🏆</span>
                        <h3>Nhánh Thắng</h3>
                        <span className="sub">Winners Bracket</span>
                    </div>
                    {Object.entries(winnersGroups).map(([round, roundMatches]) => (
                        <div key={round}>
                            <div className="t26-round-label">{roundMatches[0].roundLabel}</div>
                            {roundMatches.map(m => <MatchCard key={m.id} match={m} />)}
                        </div>
                    ))}
                    {winnersMatches.length === 0 && (
                        <div className="text-white/30 text-center text-sm py-8">Đang cập nhật...</div>
                    )}
                </div>

                {/* Losers Bracket */}
                <div className="t26-col-losers">
                    <div className="t26-col-header losers-header">
                        <span style={{ fontSize: '1.2rem' }}>🔁</span>
                        <h3>Nhánh Thua</h3>
                        <span className="sub">Losers Bracket</span>
                    </div>
                    {Object.entries(losersGroups).map(([round, roundMatches]) => (
                        <div key={round}>
                            <div className="t26-round-label">{roundMatches[0].roundLabel}</div>
                            {roundMatches.map(m => <MatchCard key={m.id} match={m} />)}
                        </div>
                    ))}
                    {losersMatches.length === 0 && (
                        <div className="text-white/30 text-center text-sm py-8">Đang cập nhật...</div>
                    )}
                </div>
            </div>

            {/* Grand Final */}
            {grandFinal && (
                <div>
                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-yellow-500/30 to-transparent" />
                        <div className="text-yellow-400/50 text-xs font-bold tracking-widest uppercase">Chung Kết Tổng</div>
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-yellow-500/30 to-transparent" />
                    </div>
                    <GrandFinalCard match={grandFinal} />
                </div>
            )}
        </div>
    );
}
