"use client";

import Link from 'next/link';

export default function GiaiCoHoiBanner() {
    return (
        <section className="gch-banner-section">
            <div className="gch-banner-card">
                {/* Decorative orbs */}
                <div className="gch-orb-blue" />
                <div className="gch-orb-red" />

                <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center md:items-start">
                    {/* Left content */}
                    <div className="flex-1 min-w-0">
                        <div className="gch-badge">
                            🔥 Giải Phụ Đặc Biệt
                        </div>

                        <h2 className="gch-banner-title">
                            🏸 GIẢI CƠ HỘI 2026
                        </h2>
                        <p className="gch-banner-subtitle">
                            &ldquo;Cú Lội Ngược Dòng Dành Cho Các Bạn&rdquo; — Double Elimination Bracket
                        </p>

                        <div className="gch-banner-meta">
                            <span className="gch-meta-item">
                                📅 <span>13/5/2026 (Thứ Tư)</span>
                            </span>
                            <span className="gch-meta-item">
                                🕕 <span>Bắt đầu 18:00</span>
                            </span>
                            <span className="gch-meta-item">
                                📍 <span>152 Hoàng Hoa Thám, Tân Bình, HCM</span>
                            </span>
                        </div>

                        <Link href="/tournament-2026" className="gch-cta-btn">
                            Xem Bảng Đấu Chi Tiết
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                            </svg>
                        </Link>
                    </div>

                    {/* Right: mini bracket preview */}
                    <div className="hidden md:flex flex-col gap-3 min-w-[260px]">
                        <div className="text-xs font-bold tracking-widest text-white/30 uppercase mb-1">Sơ đồ giải đấu</div>

                        {/* Winners side preview */}
                        <div>
                            <div className="text-[10px] font-bold tracking-widest uppercase mb-2" style={{ color: '#3a9bd5' }}>
                                🏆 Nhánh Thắng
                            </div>
                            <div className="flex flex-col gap-1.5">
                                {[
                                    { m: 'Trận 1', p1: 'Nhật & Thùy', p2: 'Kiệt & Đức' },
                                    { m: 'Trận 2', p1: 'Hưng & Minh', p2: 'Hiếu & Lệ' },
                                ].map((r) => (
                                    <div key={r.m} className="flex items-center gap-2 text-xs rounded-md overflow-hidden"
                                        style={{ background: 'rgba(30,107,184,0.08)', border: '1px solid rgba(30,107,184,0.2)' }}>
                                        <span className="px-2 py-1.5 font-mono" style={{ color: '#3a9bd5', minWidth: 52, fontSize: '0.6rem', fontWeight: 800 }}>{r.m}</span>
                                        <span className="text-white/70 flex-1 truncate">{r.p1}</span>
                                        <span className="text-white/30 text-[10px] px-1">vs</span>
                                        <span className="text-white/70 flex-1 truncate">{r.p2}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Losers side preview */}
                        <div>
                            <div className="text-[10px] font-bold tracking-widest uppercase mb-2" style={{ color: '#e74c3c' }}>
                                🔁 Nhánh Thua
                            </div>
                            <div className="flex flex-col gap-1.5">
                                {[
                                    { m: 'Trận 6', p1: 'Thua Trận 1', p2: 'Thua Trận 4' },
                                    { m: 'Trận 7', p1: 'Thua Trận 2', p2: 'Thua Trận 3' },
                                ].map((r) => (
                                    <div key={r.m} className="flex items-center gap-2 text-xs rounded-md overflow-hidden"
                                        style={{ background: 'rgba(139,26,26,0.08)', border: '1px solid rgba(139,26,26,0.2)' }}>
                                        <span className="px-2 py-1.5 font-mono" style={{ color: '#e74c3c', minWidth: 52, fontSize: '0.6rem', fontWeight: 800 }}>{r.m}</span>
                                        <span className="text-white/50 flex-1 truncate italic">{r.p1}</span>
                                        <span className="text-white/30 text-[10px] px-1">vs</span>
                                        <span className="text-white/50 flex-1 truncate italic">{r.p2}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Grand final teaser */}
                        <div className="mt-1 rounded-lg p-3 text-center"
                            style={{ background: 'rgba(255,215,0,0.06)', border: '1px solid rgba(255,215,0,0.2)' }}>
                            <div className="text-[10px] text-yellow-400/60 uppercase tracking-widest font-bold mb-1">👑 Chung Kết Tổng</div>
                            <div className="text-xs text-white/60 font-bold">Thắng Trận 5 vs Thắng Trận 9</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
