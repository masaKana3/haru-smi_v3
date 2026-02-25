import React from "react";

type ResultScreenProps = {
  total: number | null;
  onGoDashboard: () => void;
};

export default function ResultScreen({ total, onGoDashboard }: ResultScreenProps) {
  const safeTotal = total ?? 0;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-brandText">
      <div className="w-full max-w-sm rounded-card border border-white/20 bg-white/60 p-8 text-center shadow-sm">
        <h2 className="text-[20px] font-semibold">あなたの更年期指数（SMI）</h2>

        <div className="relative mx-auto mb-6 mt-6 h-36 w-36">
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 36 36">
            <path
              className="text-brandTrack"
              strokeWidth="3.5"
              stroke="currentColor"
              fill="none"
              d="M18 2a16 16 0 1 1 0 32 16 16 0 1 1 0-32"
            />
            <path
              className="text-brandAccent"
              strokeWidth="3.5"
              strokeDasharray={`${(safeTotal / 100) * 100}, 100`}
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              d="M18 2a16 16 0 1 1 0 32 16 16 0 1 1 0-32"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-3xl font-bold text-brandTextStrong">
            {safeTotal}
          </div>
        </div>

        <p className="mb-6 text-sm leading-relaxed text-brandText">
          {safeTotal <= 25 && "上手に更年期を過ごしています。"}
          {safeTotal > 25 && safeTotal <= 50 && "生活の見直しに気を配りましょう。"}
          {safeTotal > 50 && safeTotal <= 65 && "医師・カウンセリングの相談が有用です。"}
          {safeTotal > 65 && safeTotal <= 80 && "長期的なケアが必要です。"}
          {safeTotal > 80 && "専門医での長期的な対応が必要です。"}
        </p>

        <button
          onClick={onGoDashboard}
          className="w-full rounded-button bg-brandAccent py-3 text-white transition-colors hover:bg-brandAccentHover"
        >
          ダッシュボードへ
        </button>
      </div>
    </div>
  );
}