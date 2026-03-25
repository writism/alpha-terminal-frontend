import type { PipelineProgressEvent } from "@/features/dashboard/domain/model/pipelineProgressEvent"
import type { StockSummary } from "@/features/dashboard/domain/model/stockSummary"
import { DailyReturnsHeatmapLegend } from "@/app/components/DailyReturnsHeatmapLegend"
import type { HeatmapItem } from "@/features/stock/domain/model/dailyReturnsHeatmap"
import StockSummaryCard from "../../components/StockSummaryCard"
import { DashboardPipelineProgressPanel } from "./DashboardPipelineProgressPanel"

type Props = {
    summaries: StockSummary[]
    isSummaryLoading: boolean
    running: boolean
    watchlistCount: number
    progressEvents: PipelineProgressEvent[]
    heatmapBySymbol?: Record<string, HeatmapItem>
    heatmapWeeks?: number
}

export function DashboardSummarySection({
    summaries,
    isSummaryLoading,
    running,
    watchlistCount,
    progressEvents,
    heatmapBySymbol,
    heatmapWeeks = 6,
}: Props) {
    /** 첫 로드만 스켈레톤; 이미 요약이 있으면 새로고침 중에도 카드 유지(BL-FE-34). */
    const showInitialSkeleton = isSummaryLoading && !running && summaries.length === 0

    const hasAnyHeatmap = summaries.some(
        (s) => !!heatmapBySymbol?.[s.symbol.trim().toUpperCase()],
    )

    return (
        <section className="mb-10" aria-label="AI 분석 요약" aria-busy={running || undefined}>
            <h2 className="text-lg font-semibold mb-3">AI 분석 요약</h2>

            {showInitialSkeleton ? (
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-28 w-full rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
                    ))}
                </div>
            ) : null}

            {running ? (
                <div className="rounded-lg border border-dashed border-blue-200 bg-blue-50/40 px-4 py-6 dark:border-blue-900 dark:bg-blue-950/20">
                    {progressEvents.length > 0 ? (
                        <DashboardPipelineProgressPanel events={progressEvents} />
                    ) : (
                        <div
                            role="status"
                            aria-live="polite"
                            className="text-center text-sm text-blue-800 dark:text-blue-200"
                        >
                            분석을 준비하는 중입니다…
                        </div>
                    )}
                </div>
            ) : null}

            {!showInitialSkeleton && summaries.length > 0 ? (
                <>
                    {hasAnyHeatmap ? (
                        <DailyReturnsHeatmapLegend
                            className={`mb-3 rounded-lg border border-gray-200 bg-gray-50/80 px-3 py-2 dark:border-gray-600 dark:bg-gray-900/40 ${running ? "mt-4" : ""}`}
                        />
                    ) : null}
                    <div className={`space-y-3 ${running ? "mt-4" : ""}`}>
                        {summaries.map((stock) => {
                            const hi = heatmapBySymbol?.[stock.symbol.trim().toUpperCase()]
                            return (
                                <StockSummaryCard
                                    key={stock.symbol}
                                    symbol={stock.symbol}
                                    name={stock.name}
                                    summary={stock.summary}
                                    tags={stock.tags}
                                    sentiment={stock.sentiment}
                                    sentiment_score={stock.sentiment_score}
                                    confidence={stock.confidence}
                                    heatmap={hi ? { item: hi, weeks: heatmapWeeks } : undefined}
                                />
                            )
                        })}
                    </div>
                </>
            ) : null}

            {!showInitialSkeleton && !running && summaries.length === 0 ? (
                <div className="py-10 text-center border border-dashed border-gray-300 rounded-lg dark:border-gray-600">
                    <p className="text-gray-500 mb-4">아직 분석된 종목이 없습니다.</p>
                    <p className="text-sm text-gray-500 mb-4">
                        상단의 &quot;선택 종목 분석&quot; 버튼으로 분석을 실행할 수 있습니다.
                    </p>
                    {watchlistCount === 0 && (
                        <a
                            href="/watchlist"
                            className="inline-block px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
                        >
                            관심종목 등록하기
                        </a>
                    )}
                </div>
            ) : null}
        </section>
    )
}
