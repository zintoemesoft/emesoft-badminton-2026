import React from 'react';

// Helpers
const getIcon = (level: number) => {
    if (level === 3) return '💪'; 
    if (level === 2) return '⚖️'; 
    return '🐣'; 
};

type Member = { name: string; level: number };
type Team = { id: string; name: string; members: Member[]; group: string };
type Match = { 
    id: string; 
    group: string; 
    team1Id: string; 
    team2Id: string; 
    score1: number; 
    score2: number; 
    status: string; 
    order: number;
};

type MatchCardProps = {
    match: Match;
    team1?: Team;
    team2?: Team;
};


const MatchDetails = ({ team1, team2, isOpen }: { team1?: Team; team2?: Team; isOpen: boolean }) => {
    if (!team1 && !team2) return null;

    return (
        <div className={`match-expanded-details ${isOpen ? 'open' : ''}`}>
            <div className="expanded-col left">
                <div className="exp-team-name">{team1?.name || 'TBD'}</div>
                <div className="exp-roster">
                    {team1 ? team1.members.map((m, i) => <div key={i}>{getIcon(m.level)} {m.name}</div>) : "Undefined"}
                </div>
            </div>
            <div className="expanded-divider"></div>
            <div className="expanded-col right">
                <div className="exp-team-name">{team2?.name || 'TBD'}</div>
                <div className="exp-roster">
                    {team2 ? team2.members.map((m, i) => <div key={i}>{getIcon(m.level)} {m.name}</div>) : "Undefined"}
                </div>
            </div>
        </div>
    );
};

export default function MatchCard({ match, team1, team2 }: MatchCardProps) {
    const [isSelected, setIsSelected] = React.useState(false);
    
    const isFinished = match.status === 'FINISHED';
    const isPlaying = match.status === 'PLAYING';
    const isDraw = match.score1 === match.score2;
    const winner = match.score1 > match.score2 ? 'team1' : match.score1 < match.score2 ? 'team2' : 'draw';

    return (
        <div 
            onClick={() => setIsSelected(!isSelected)}
            className={`match-row relative overflow-hidden group/card cursor-pointer transition-all duration-300 ${isFinished ? 'border-l-0' : ''} ${isSelected ? 'bg-white/10 scale-[1.02] shadow-xl z-10' : ''}`}
        >
             {/* Winner Gradient Background (Optional - maybe too much, keeping it simple for now) */}
             
            <div className="match-meta w-[15%] md:w-auto text-center md:text-left">
                <div className="text-xs uppercase tracking-widest opacity-70">Trận</div>
                <div className="font-mono font-bold text-lg leading-none">{match.order}</div>
            </div>
            
            <div className="match-versus">
                {/* Team 1 */}
                <span className={`team-name transition-all duration-300 ${
                    isFinished 
                        ? (winner === 'team1' 
                            ? 'text-[#ffdd00] font-black text-xl drop-shadow-[0_0_10px_rgba(255,221,0,0.5)] scale-110 origin-right z-10' 
                            : 'text-white/30 font-normal scale-95 blur-[0.5px]') 
                        : 'text-white font-bold'
                }`}>
                    {team1?.name || '...'}
                </span>
                
                {/* Score / VS */}
                {isFinished || isPlaying ? (
                     <div className="flex flex-col items-center mx-4 relative min-w-[80px]">
                        <div className={`text-2xl font-black font-mono tracking-widest transition-all ${
                            isFinished ? 'text-white scale-110' : 'text-white'
                        }`}>
                            <span className={isFinished && winner === 'team1' ? 'text-[#ffdd00]' : 'text-white'}>{match.score1}</span>
                            <span className="mx-1 opacity-50 text-base align-middle">-</span>
                            <span className={isFinished && winner === 'team2' ? 'text-[#ffdd00]' : 'text-white'}>{match.score2}</span>
                        </div>
                        {isPlaying && <span className="text-[10px] text-[#ccff00] font-bold animate-pulse tracking-widest mt-1">LIVE</span>}
                     </div>
                ) : (
                    <span className="vs-divider mx-4">VS</span>
                )}

                {/* Team 2 */}
                <span className={`team-name transition-all duration-300 ${
                     isFinished 
                        ? (winner === 'team2' 
                            ? 'text-[#ffdd00] font-black text-xl drop-shadow-[0_0_10px_rgba(255,221,0,0.5)] scale-110 origin-left z-10' 
                            : 'text-white/30 font-normal scale-95 blur-[0.5px]') 
                        : 'text-white font-bold'
                }`}>
                    {team2?.name || '...'}
                </span>
            </div>
            
            <MatchDetails team1={team1} team2={team2} isOpen={isSelected} />
        </div>
    );
}
