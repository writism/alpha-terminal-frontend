"use client"

import { useAdminStats } from "@/features/admin/application/hooks/useAdminStats"

function StatCard({ label, value }: { label: string; value: string }) {
    return (
        <div className="border border-outline px-5 py-4">
            <p className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">{label}</p>
            <p className="mt-1 font-mono text-2xl font-bold text-on-surface">{value}</p>
        </div>
    )
}

export default function AdminPage() {
    const { stats, status } = useAdminStats()

    if (status === "loading") {
        return (
            <div className="flex h-64 items-center justify-center font-mono text-xs text-on-surface-variant">
                LOADING...
            </div>
        )
    }

    if (status === "forbidden") {
        return (
            <div className="flex h-64 items-center justify-center font-mono text-xs text-error">
                [403] 관리자 권한이 필요합니다.
            </div>
        )
    }

    if (status === "error" || !stats) {
        return (
            <div className="flex h-64 items-center justify-center font-mono text-xs text-error">
                [ERROR] 통계를 불러오지 못했습니다.
            </div>
        )
    }

    const dwellMin =
        stats.avg_dwell_time_seconds != null
            ? `${Math.floor(stats.avg_dwell_time_seconds / 60)}m ${Math.round(stats.avg_dwell_time_seconds % 60)}s`
            : "N/A"

    const ctrDisplay = stats.ctr != null ? `${(stats.ctr * 100).toFixed(1)}%` : "N/A"

    return (
        <>
            <div className="sticky top-0 z-40 bg-surface border-b border-outline">
                <div className="max-w-5xl mx-auto px-6 md:px-8 py-3 font-mono text-xs uppercase">
                    <span className="font-bold tracking-widest text-on-surface">ADMIN</span>
                    <span className="ml-2 text-[9px] text-on-surface-variant/60 normal-case">관리자 대시보드</span>
                </div>
            </div>

            <main className="max-w-5xl mx-auto px-6 md:px-8 pt-6 pb-24 md:pb-8 space-y-8">
                {/* 유저 현황 */}
                <section>
                    <h2 className="mb-3 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">
                        USER STATS
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <StatCard label="전체 유저" value={stats.total_users.toLocaleString()} />
                        <StatCard label="오늘 신규" value={stats.new_users_today.toLocaleString()} />
                        <StatCard label="이번주 신규" value={stats.new_users_this_week.toLocaleString()} />
                        <StatCard label="평균 체류시간" value={dwellMin} />
                        <StatCard label="CTR" value={ctrDisplay} />
                    </div>
                </section>

                {/* 리텐션 */}
                <section>
                    <h2 className="mb-3 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">
                        RETENTION (D-1 ~ D-14)
                    </h2>
                    <div className="border border-outline p-4 space-y-2">
                        {stats.retention.map(({ day, rate }) => (
                            <div key={day} className="flex items-center gap-3">
                                <span className="w-10 shrink-0 font-mono text-[10px] text-on-surface-variant">
                                    D-{day}
                                </span>
                                <div className="flex-1 bg-surface-container h-3 overflow-hidden">
                                    <div
                                        className="h-full bg-primary"
                                        style={{ width: `${(rate * 100).toFixed(1)}%` }}
                                    />
                                </div>
                                <span className="w-12 text-right font-mono text-[10px] text-on-surface">
                                    {(rate * 100).toFixed(1)}%
                                </span>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </>
    )
}
