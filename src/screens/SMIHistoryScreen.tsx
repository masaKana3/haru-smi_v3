import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useStorage } from "../hooks/useStorage";
import { SMIRecord } from "../types/smi";
import PageHeader from "../components/layout/PageHeader";

type Props = {
  onBack: () => void;
  onStartMeasure: () => void;
};

export default function SMIHistoryScreen({ onBack, onStartMeasure }: Props) {
  const storage = useStorage();
  const [history, setHistory] = useState<SMIRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const data = await storage.loadSMIHistory();
      // 日付昇順にソート（グラフ用）
      const sorted = [...data].sort((a, b) => (a.date > b.date ? 1 : -1));
      setHistory(sorted);
      setLoading(false);
    };
    load();
  }, [storage]);

  const latestRecord = history.length > 0 ? history[history.length - 1] : null;
  const latestScore = latestRecord?.total ?? 0;

  // 小山嵩夫氏の評価法に基づくアドバイス
  const getAdvice = (score: number) => {
    if (score <= 25) return "上手に更年期を過ごしています。これまでの生活態度を続けていいでしょう。";
    if (score <= 50) return "食事、運動などに注意を払い、生活様式などにも無理をしないようにしましょう。";
    if (score <= 65) return "医師の診察を受け、生活指導、カウンセリング、薬物療法を受けた方がいいでしょう。";
    if (score <= 80) return "長期間（半年以上）の計画的な治療が必要でしょう。";
    return "各科の精密検査を受け、更年期障害のみである場合は、専門医での長期的な対応が必要でしょう。";
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-brandMuted">
        読み込み中...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-brandText">
      <PageHeader title="履歴とアドバイス" onBack={onBack} />
      <main className="mx-auto max-w-screen-md space-y-6 px-4 pb-10 pt-20 md:px-8 md:pt-24">
        {/* 最新の結果カード */}
        <div className="space-y-4 rounded-card border border-white/20 bg-white/60 p-6 text-center shadow-sm">
          <div className="font-semibold text-brandMuted text-sm">現在の更年期指数</div>
          <div className="text-4xl font-bold text-brandAccent">{latestRecord ? latestScore : "—"}</div>
          
          {latestRecord ? (
            <div className="text-left leading-relaxed text-brandText rounded-md bg-brandInput p-3 text-xs">
              {getAdvice(latestScore)}
            </div>
          ) : (
            <div className="text-xs text-brandMuted">まだ記録がありません。</div>
          )}

          <button
            onClick={onStartMeasure}
            className="w-full rounded-button bg-brandAccent py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brandAccentHover"
          >
            新しく計測する
          </button>
        </div>

        {/* グラフ */}
        {history.length > 0 && (
          <div className="space-y-4 rounded-card border border-white/20 bg-white/60 p-4 shadow-sm">
            <div className="text-sm font-semibold">スコア推移</div>
            <div className="h-64 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fill: '#888', fontSize: 10 }} 
                    tickFormatter={(date) => date.slice(5).replace('-', '/')}
                    axisLine={false}
                    tickLine={false}
                    dy={10}
                  />
                  <YAxis 
                    domain={[0, 100]} 
                    tick={{ fill: '#888', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                    labelStyle={{ color: '#888', marginBottom: '4px' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#D4829A"
                    strokeWidth={3}
                    dot={{ fill: '#D4829A', r: 4, strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}