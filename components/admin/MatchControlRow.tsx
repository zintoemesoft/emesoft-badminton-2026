import React from 'react';

type Match = { 
    id: string; 
    team1Id: string; 
    team2Id: string; 
    score1: number; 
    score2: number; 
    status: 'SCHEDULED' | 'PLAYING' | 'FINISHED'; 
    order: number;
};

export default function MatchControlRow({ 
    match, 
    team1Name, 
    team2Name, 
    onUpdate 
}: { 
    match: Match, 
    team1Name: string, 
    team2Name: string, 
    onUpdate: (id: string, updates: Partial<Match>) => void 
}) {
    const isLive = match.status === 'PLAYING';
    const isFinished = match.status === 'FINISHED';

    const adjustScore = (team: 1 | 2, delta: number) => {
        const field = team === 1 ? 'score1' : 'score2';
        const currentScore = match[field];
        const newScore = Math.max(0, currentScore + delta);
        onUpdate(match.id, { [field]: newScore });
    };

    return (
        <div className={`flex flex-col gap-3 p-4 rounded-xl border transition-all duration-300 ${isLive ? 'bg-accent/10 border-accent/50 shadow-[0_0_15px_rgba(204,255,0,0.1)]' : 'bg-white/5 border-white/10 hover:border-white/20'}`}>
            {/* Header: Status + Order */}
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <span className="text-xs font-mono text-white/40">MATCH #{match.order}</span>
                <div className="flex gap-1">
                    {['SCHEDULED', 'PLAYING', 'FINISHED'].map((status) => (
                        <button
                            key={status}
                            onClick={() => onUpdate(match.id, { status: status as any })}
                            className={`px-2 py-1 text-[10px] font-bold rounded tracking-wider transition-all ${match.status === status 
                                ? (status === 'PLAYING' ? 'bg-red-500 text-white animate-pulse' : status === 'FINISHED' ? 'bg-green-500 text-black' : 'bg-blue-500 text-white') 
                                : 'bg-black/40 text-white/30 hover:text-white'}`}
                        >
                            {status === 'SCHEDULED' ? 'SCH' : status === 'PLAYING' ? 'LIVE' : 'DONE'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Score Control Area */}
            <div className="flex items-center justify-between gap-2 mt-1">
                {/* Team 1 Panel */}
                <div className="flex-1 flex flex-col items-center gap-2">
                    <div className={`text-sm font-bold text-center leading-tight ${isFinished && match.score1 > match.score2 ? 'text-green-400' : 'text-white'}`}>
                        {team1Name}
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => adjustScore(1, -1)} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white flex items-center justify-center font-mono focus:outline-none ring-offset-2 focus:ring-1 active:scale-95 transition">-</button>
                        <div className="text-2xl font-bold font-mono min-w-[30px] text-center">{match.score1}</div>
                        <button onClick={() => adjustScore(1, 1)} className="w-8 h-8 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-400 flex items-center justify-center font-bold focus:outline-none ring-offset-2 focus:ring-1 active:scale-95 transition">+</button>
                    </div>
                </div>

                {/* VS / Divider */}
                <div className="h-12 w-px bg-white/10 mx-1"></div>

                {/* Team 2 Panel */}
                <div className="flex-1 flex flex-col items-center gap-2">
                    <div className={`text-sm font-bold text-center leading-tight ${isFinished && match.score2 > match.score1 ? 'text-green-400' : 'text-white'}`}>
                        {team2Name}
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => adjustScore(2, -1)} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white flex items-center justify-center font-mono focus:outline-none ring-offset-2 focus:ring-1 active:scale-95 transition">-</button>
                        <div className="text-2xl font-bold font-mono min-w-[30px] text-center">{match.score2}</div>
                        <button onClick={() => adjustScore(2, 1)} className="w-8 h-8 rounded-lg bg-lime-500/20 hover:bg-lime-500/40 text-lime-400 flex items-center justify-center font-bold focus:outline-none ring-offset-2 focus:ring-1 active:scale-95 transition">+</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
