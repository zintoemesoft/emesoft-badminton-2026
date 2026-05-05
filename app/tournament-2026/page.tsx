"use client";

import Link from 'next/link';
import TournamentBracket2026 from '@/components/TournamentBracket2026';

export default function Tournament2026Page() {
    return (
        <div className="t26-page">
            {/* ── HERO ── */}
            <div className="t26-hero">
                <Link href="/" className="t26-hero-eyebrow hover:text-white/70 transition-colors cursor-pointer inline-flex items-center gap-2 mb-4">
                    ← Quay về Trang Chủ
                </Link>
                <p className="t26-hero-eyebrow">EMESOFT · GIẢI CẦU LÔNG NỘI BỘ</p>
                <h1 className="t26-hero-title">BADMINTON TOURNAMENT</h1>
                <h2 className="t26-hero-sub">2026</h2>
                <p className="t26-hero-tagline">🏸 &ldquo;Cú Lội Ngược Dòng Dành Cho Các Bạn&rdquo;</p>
                <div className="t26-hero-info">
                    <div className="t26-info-pill">
                        <span>📅</span>
                        <span>13/5/2026 (Thứ Tư)</span>
                    </div>
                    <div className="t26-info-pill">
                        <span>🕕</span>
                        <span>Bắt đầu 18:00</span>
                    </div>
                    <div className="t26-info-pill">
                        <span>📍</span>
                        <span>152 Hoàng Hoa Thám, Tân Bình, HCM</span>
                    </div>
                </div>
            </div>

            {/* ── LOCATION STRIP ── */}
            <div className="t26-location-banner">
                <span>📍</span>
                <span><strong style={{ color: '#FFD700' }}>Địa điểm:</strong> 152 Hoàng Hoa Thám, Tân Bình, HCM</span>
                <span style={{ margin: '0 12px', opacity: 0.3 }}>·</span>
                <span><strong style={{ color: '#FFD700' }}>Chung Kết:</strong> 20/5/2026 lúc 07:00</span>
            </div>

            {/* ── GIẢI CƠ HỘI BRACKET ── */}
            <section className="t26-bracket-section">
                <h2 className="t26-section-title">🏆 Giải Cơ Hội</h2>
                <p className="t26-section-desc">
                    Double Elimination — Thua một trận vẫn còn cơ hội! Hai nhánh Thắng & Thua tranh suất vào Chung Kết Tổng.
                </p>
                <TournamentBracket2026 />
            </section>

            {/* ── DIVIDER ── */}
            <div className="t26-location-banner">
                <span>🏸</span>
                <span>Kết quả Chung Kết & Tranh Hạng 3 — Ngày <strong style={{ color: '#FFD700' }}>20/5/2026</strong></span>
            </div>

            {/* ── CHUNG KẾT & HẠNG 3 ── */}
            <section className="t26-finals-section">
                <h2 className="t26-section-title" style={{ marginBottom: '8px' }}>🥇 Chung Kết</h2>
                <p className="t26-section-desc">Trận tranh ngôi Vô Địch — 20/5/2026, 07:00</p>

                {/* CHUNG KẾT */}
                <div className="t26-final-match-card">
                    <div className="t26-final-card-header">
                        <span style={{ fontSize: '1.4rem' }}>🏆</span>
                        <div className="t26-final-card-title">Chung Kết</div>
                        <div className="t26-final-card-meta-wrap">
                            <span>📅 20/5/2026</span>
                            <span>🕖 07:00</span>
                        </div>
                    </div>
                    <div className="t26-final-match-body">
                        <div className="t26-final-player">
                            <div className="t26-final-player-name">Hiếu Nguyễn + Thảo Ly</div>
                        </div>
                        <div className="t26-final-vs">V.S</div>
                        <div className="t26-final-player">
                            <div className="t26-final-player-name">Khoa Nguyễn + Dung Trần</div>
                        </div>
                    </div>
                </div>

                {/* TRANH HẠNG 3 */}
                <div className="t26-final-match-card bronze">
                    <div className="t26-final-card-header">
                        <span style={{ fontSize: '1.4rem' }}>🥉</span>
                        <div className="t26-final-card-title">Tranh Hạng 3</div>
                        <div className="t26-final-card-meta-wrap">
                            <span>📅 20/5/2026</span>
                            <span>🕖 07:00</span>
                        </div>
                    </div>
                    <div className="t26-final-match-body">
                        <div className="t26-final-player">
                            <div className="t26-final-player-name">Cường Phan + Tiên Nguyễn</div>
                        </div>
                        <div className="t26-final-vs">V.S</div>
                        <div className="t26-final-player">
                            <div className="t26-final-player-name">Hiếu Trần + Hùng Nguyễn</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── FOOTER ── */}
            <footer style={{
                borderTop: '1px solid rgba(255,255,255,0.06)',
                padding: '32px 20px',
                textAlign: 'center',
                color: 'rgba(255,255,255,0.3)',
                fontSize: '0.85rem'
            }}>
                <p>© 2026 Giải Cầu Lông EmeSoft · Được thiết kế bởi đội ngũ EmeSoft</p>
                <Link href="/" className="inline-block mt-3 text-yellow-500/60 hover:text-yellow-400 text-xs transition-colors">
                    ← Quay về trang chủ Giải Chính
                </Link>
            </footer>
        </div>
    );
}
