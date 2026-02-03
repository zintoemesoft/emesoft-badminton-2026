import React from 'react';

// Shared Helper (Should ideally be in a utils file, keeping here for speed for now)
const getIcon = (level: number) => {
    if (level === 3) return '💪'; 
    if (level === 2) return '⚖️'; 
    return '🐣'; 
};

type Member = { name: string; level: number };
type Team = { id: string; name: string; members: Member[]; group: string };

export default function TeamList({ teams }: { teams: Team[] }) {
    if (!teams.length) return <div className="text-center text-white/50 py-10">Đang tải danh sách đội...</div>;

    return (
        <section id="teams" className="section">
            <div className="container">
                <div className="section-header">
                    <h2 className="section-title premium-title">Danh Sách Đội</h2>
                    <div className="team-legend">
                        <div className="legend-item"><span className="icon">💪</span> Mạnh</div>
                        <div className="legend-item"><span className="icon">⚖️</span> Trung bình</div>
                        <div className="legend-item"><span className="icon">🐣</span> Yếu</div>
                    </div>
                </div>

                <div className="teams-grid">
                    {teams.map((team) => {
                        // Determine style based on team ID or group? 
                        // Using simple logic: Group A = Cyan, B = Lime
                        const styleClass = team.group === 'A' ? 'style-cyan' : 'style-lime';
                        
                        return (
                            <div key={team.id} className={`team-card-info ${styleClass}`}>
                                <div className="team-header">{team.name}</div>
                                <div className="members-list">
                                    {team.members.map((m, i) => (
                                        <div key={i} className="member-row">
                                            <span className="icon">{getIcon(m.level)}</span> {m.name}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
