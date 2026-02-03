import React, { useMemo } from 'react';

type Match = { 
    id: string; 
    team1Id: string; 
    team2Id: string; 
    score1: number; 
    score2: number; 
    status: string; 
};

type Team = { id: string; name: string };

type TeamStats = {
    id: string;
    name: string;
    played: number;
    wins: number;
    losses: number;
    pointsDiff: number; // score difference
};

export default function Standings({ teams, matches }: { teams: Team[], matches: Match[] }) {
    const stats = useMemo(() => {
        const map: Record<string, TeamStats> = {};

        // Initialize
        teams.forEach(t => {
            map[t.id] = { id: t.id, name: t.name, played: 0, wins: 0, losses: 0, pointsDiff: 0 };
        });

        // Calculate
        matches.forEach(m => {
            if (m.status === 'FINISHED') {
                const t1 = map[m.team1Id];
                const t2 = map[m.team2Id];

                if (t1 && t2) {
                    t1.played++;
                    t2.played++;
                    t1.pointsDiff += (m.score1 - m.score2);
                    t2.pointsDiff += (m.score2 - m.score1);

                    if (m.score1 > m.score2) {
                        t1.wins++;
                        t2.losses++;
                    } else if (m.score2 > m.score1) {
                        t2.wins++;
                        t1.losses++;
                    }
                }
            }
        });

        return Object.values(map).sort((a, b) => b.wins - a.wins || b.pointsDiff - a.pointsDiff);
    }, [teams, matches]);

    return (
        <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden backdrop-blur-md">
            <div className="bg-black/40 px-4 py-3 border-b border-white/10 font-bold font-orbitron text-accent text-sm">
                XẾP HẠNG TẠM THỜI
            </div>
            <table className="w-full text-sm text-left">
                <thead className="text-xs text-white/40 uppercase bg-white/5 font-mono">
                    <tr>
                        <th className="px-4 py-2">Team</th>
                        <th className="px-2 py-2 text-center">W</th>
                        <th className="px-2 py-2 text-center">L</th>
                        <th className="px-2 py-2 text-center">Diff</th>
                    </tr>
                </thead>
                <tbody>
                    {stats.map((team, index) => (
                        <tr key={team.id} className="border-b border-white/5 hover:bg-white/5 transition">
                            <td className="px-4 py-3 font-medium text-white truncate max-w-[120px]">
                                <span className={`mr-2 inline-block w-4 text-center ${index < 2 ? 'text-accent' : 'text-white/30'}`}>{index + 1}</span>
                                {team.name}
                            </td>
                            <td className="px-2 py-3 text-center font-bold text-green-400">{team.wins}</td>
                            <td className="px-2 py-3 text-center text-red-400">{team.losses}</td>
                            <td className="px-2 py-3 text-center font-mono opacity-70">{team.pointsDiff > 0 ? `+${team.pointsDiff}` : team.pointsDiff}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
