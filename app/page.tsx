"use client";

import React, { useEffect, useState } from 'react';
import { db, auth } from '@/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import TeamList from '@/components/TeamList';
import MatchCard from '@/components/MatchCard';
import KnockoutBetting from '@/components/KnockoutBetting';
import { HeroLoginButton, UserSessionHeader } from '@/components/AuthButton';

// Types
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
    stage?: string;
    label?: string;
    placeholder1?: string;
    placeholder2?: string;
};

export default function Home() {
    const [teams, setTeams] = useState<Team[]>([]);
    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);



    useEffect(() => {
        const unsubAuth = onAuthStateChanged(auth, (u) => {
            setUser(u);
        });
        return () => unsubAuth();
    }, []);

    useEffect(() => {
        // Fetch matches
        const unsubMatches = onSnapshot(query(collection(db, "matches"), orderBy("order", "asc")), (snap) => {
            const ms: Match[] = [];
            snap.forEach((doc) => ms.push(doc.data() as Match));
            setMatches(ms);
        });

        // Fetch teams
        const unsubTeams = onSnapshot(collection(db, "teams"), (snap) => {
            const ts: Team[] = [];
            snap.forEach((doc) => ts.push({ id: doc.id, ...doc.data() } as Team));
            setTeams(ts);
        });

        // Cleanup
        return () => {
             unsubMatches();
             unsubTeams();
        };
    }, []);
    
    useEffect(() => {
        if (matches.length > 0 && teams.length > 0 && loading) {
            setLoading(false);
        }
    }, [matches, teams, loading]);

    // Effect for Animations
    useEffect(() => {
        if (!loading) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    }
                });
            }, { threshold: 0.1 });

            document.querySelectorAll('.match-row, .match-card, .betting-card').forEach(item => {
                item.classList.add('fade-in-scroll');
                observer.observe(item);
            });

            return () => observer.disconnect();
        }
    }, [loading]);

    const scrollToSection = (id: string) => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
    };

    const getTeam = (id: string) => teams.find(t => t.id === id);

    // Filter Matches
    const matchesA = matches.filter(m => m.group === 'A');
    const matchesB = matches.filter(m => m.group === 'B');
    const matchSemi1 = matches.find(m => m.id === 'semi1');
    const matchSemi2 = matches.find(m => m.id === 'semi2');
    const matchFinal = matches.find(m => m.id === 'final');
    const matchThird = matches.find(m => m.id === 'third');

    return (
        <main className="main-content">
           
            <div className="background-effects">
                <div className="glow-orb orb-1"></div>
                <div className="glow-orb orb-2"></div>
                <div className="grid-overlay"></div>
            </div>

            <header className="hero-section">
                 <div className="absolute top-0 right-0 p-4">
                        <UserSessionHeader user={user} />
                    </div>
                <div className="container relative z-10">
                    
                
                    <h4 className="sub-headline">GIẢI CẦU LÔNG</h4>
                    <h1 className="main-headline">
                        <span className="text-eme">EME</span>
                        <span className="text-soft">SOFT</span> 
                        <span className="accent-text">2026</span>
                    </h1>
                    <p className="tagline">BỨT PHÁ GIỚI HẠN - CHINH PHỤC ĐỈNH CAO</p>
                    <div className="hero-actions flex flex-col items-center gap-4">
                        <button onClick={() => scrollToSection('schedule')} className="btn btn-primary">Xem Lịch Thi Đấu</button>
                        <HeroLoginButton user={user} />
                    </div>
                </div>
            </header>

            {/* Teams Section */}
            <TeamList teams={teams} />

            <section id="schedule" className="section">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title premium-title">Vòng Bảng</h2>
                    </div>
                    <div className="groups-container">
                        {/* Group A */}
                        <div className="group-card glass-panel style-cyan">
                            <div className="group-header premium-header">
                                <h3 className="gradient-text">BẢNG A</h3>
                                <div className="group-badge">{teams.filter(t => t.group === 'A').length} Đội</div>
                            </div>
                            <div className="matches-list">
                                {matchesA.map((match) => (
                                    <MatchCard 
                                        key={match.id} 
                                        match={match} 
                                        team1={getTeam(match.team1Id)} 
                                        team2={getTeam(match.team2Id)} 
                                    />
                                ))}
                                {matchesA.length === 0 && <div className="text-center opacity-50">Đang cập nhật...</div>}
                            </div>
                        </div>

                        {/* Group B */}
                        <div className="group-card glass-panel style-lime">
                            <div className="group-header premium-header">
                                <h3 className="gradient-text">BẢNG B</h3>
                                <div className="group-badge">{teams.filter(t => t.group === 'B').length} Đội</div>
                            </div>
                             <div className="matches-list">
                                {matchesB.map((match) => (
                                    <MatchCard 
                                        key={match.id} 
                                        match={match} 
                                        team1={getTeam(match.team1Id)} 
                                        team2={getTeam(match.team2Id)} 
                                    />
                                ))}
                                {matchesB.length === 0 && <div className="text-center opacity-50">Đang cập nhật...</div>}
                            </div>
                        </div>
                    </div>
                </div>
            </section>


            {/* Semi Finals */}
            <section id="semi-finals" className="section session-level-2">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title premium-title">Vòng Bán Kết</h2>
                        {!user && <p className="text-center text-white/50 mb-6">Đăng nhập để tham gia dự đoán đội thắng cuộc!</p>}
                    </div>
                    
                    <div className="level-2-container">
                        {matchSemi1 ? (
                            <KnockoutBetting 
                                match={matchSemi1} 
                                team1={getTeam(matchSemi1.team1Id)} 
                                team2={getTeam(matchSemi1.team2Id)} 
                                user={user}
                                className="match-level-2 style-cyan"
                            />
                        ) : (
                            <div className="text-white/50">Đang cập nhật...</div>
                        )}

                        <div className="sword-divider hidden md:block"></div>

                        {matchSemi2 ? (
                            <KnockoutBetting 
                                match={matchSemi2} 
                                team1={getTeam(matchSemi2.team1Id)} 
                                team2={getTeam(matchSemi2.team2Id)} 
                                user={user}
                                className="match-level-2 style-lime"
                            />
                        ) : (
                            <div className="text-white/50">Đang cập nhật...</div>
                        )}
                    </div>
                </div>
            </section>

            {/* Finals */}
            <section id="finals" className="section session-level-3">
                <div className="final-bg-accent"></div>
                <div className="container">
                    <div className="section-header">
                        <div className="glory-text">ĐỈNH VINH QUANG</div>
                        <h2 className="section-title title-final premium-title">Chung Kết</h2>
                    </div>

                    <div className="finals-layout">
                         {matchFinal && (
                            <KnockoutBetting 
                                match={matchFinal} 
                                team1={getTeam(matchFinal.team1Id)} 
                                team2={getTeam(matchFinal.team2Id)} 
                                user={user}
                                className="match-level-3 glowing-border-gold"
                            />
                         )}

                         {matchThird && (
                            <KnockoutBetting 
                                match={matchThird} 
                                team1={getTeam(matchThird.team1Id)} 
                                team2={getTeam(matchThird.team2Id)} 
                                user={user}
                                className="match-level-bronze"
                            />
                         )}
                    </div>
                </div>
            </section>

            <footer className="footer">
                <div className="container">
                    <p>&copy; 2026 Giải Cầu Lông EmeSoft. Được thiết kế bởi đội ngũ EmeSoft.</p>
                </div>
            </footer>
        </main>
    );
}
