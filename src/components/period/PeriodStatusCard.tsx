import React from "react";
import Card from "../layout/Card";
import { PredictionResult, PhaseInfo } from "../../logic/core/periodPrediction";

// ▼ フェーズごとのスタイルとアドバイス定義 (DashboardScreenから移動)
const PHASE_STYLES: Record<string, { label: string; color: string; advice: string }> = {
  menstrual: {
    label: "月経期",
    color: "bg-rose-100 text-rose-700 border-rose-200",
    advice: "無理せず体を温めてリラックス。",
  },
  follicular: {
    label: "卵胞期",
    color: "bg-sky-100 text-sky-700 border-sky-200",
    advice: "心身ともに好調！新しい挑戦を。",
  },
  ovulatory: {
    label: "排卵期",
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
    advice: "前向きな気持ちで過ごせそう。",
  },
  luteal: {
    label: "黄体期",
    color: "bg-amber-100 text-amber-700 border-amber-200",
    advice: "むくみやイライラに注意して。",
  },
};

type PeriodStatusCardProps = {
  periodPrediction: PredictionResult | null;
  currentPhase: PhaseInfo | null;
};

// 日付フォーマット関数 (DashboardScreenから移動)
const formatJPDate = (dateStr: string) => {
  const [y, m, d] = dateStr.split("-");
  if (!y || !m || !d) return dateStr;
  return `${y}年${m}月${d}日`;
};

export default function PeriodStatusCard({ periodPrediction, currentPhase }: PeriodStatusCardProps) {
  return (
    <Card className="flex flex-col gap-4 p-4 bg-white shadow-sm">
      {(periodPrediction?.nextPeriodDate || currentPhase) ? (
        <>
          <div className="flex items-center justify-between">
            <div>
              <div className="mb-1 text-xs text-brandMuted">次の生理予定日</div>
              <div className="text-lg font-bold text-brandText">
                {periodPrediction?.nextPeriodDate
                  ? formatJPDate(periodPrediction.nextPeriodDate)
                  : "データ収集中"}
              </div>
            </div>
            <div className="text-right">
              <div className="mb-1 text-xs text-brandMuted">あと</div>
              <div className="text-xl font-bold text-brandAccent">
                {(periodPrediction?.daysUntilNext !== null && typeof periodPrediction?.daysUntilNext !== 'undefined')
                  ? (periodPrediction.daysUntilNext < 0 ? "超過" : `${periodPrediction.daysUntilNext}日`)
                  : "---"}
              </div>
            </div>
          </div>

          {currentPhase && PHASE_STYLES[currentPhase.phase] && (
            <div className="flex items-center gap-3 pt-2">
              <span className={`rounded-full border px-2 py-1 text-[10px] font-bold ${PHASE_STYLES[currentPhase.phase].color}`}>
                {PHASE_STYLES[currentPhase.phase].label}
              </span>
              <span className="text-xs text-brandText">
                {PHASE_STYLES[currentPhase.phase].advice}
              </span>
            </div>
          )}
        </>
      ) : (
        <div>
          <div className="mb-1 text-sm font-semibold text-brandText">生理周期予測</div>
          <p className="text-xs text-brandMuted">
            生理の記録を追加すると、次の生理日や周期の傾向が表示されます。
          </p>
        </div>
      )}
    </Card>
  );
}
