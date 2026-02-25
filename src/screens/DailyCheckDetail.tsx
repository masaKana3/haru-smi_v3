import React, { useState, useEffect } from "react";
import { DailyAnswerValue, DailyRecord } from "../types/daily";
import { PeriodBleedingLevel, PeriodRecord, PeriodSymptoms } from "../types/period";
import SymptomToggle from "../components/period/SymptomToggle";
import { useStorage } from "../hooks/useStorage";
import PageHeader from "../components/layout/PageHeader";

// ▼ 生理症状の定義（PeriodInputScreenから移植）
const PERIOD_SYMPTOMS: Array<{ key: keyof PeriodSymptoms; label: string }> = [
  { key: "cramp", label: "⚡ 腹痛・生理痛" },
  { key: "backpain", label: "💥 腰痛" },
  { key: "headache", label: "🤕 頭痛" },
  { key: "nausea", label: "🤢 吐き気" },
  { key: "fatigue", label: "💤 だるさ・倦怠感" },
  { key: "mood", label: "☁️ 気分の落ち込み" },
  { key: "irritability", label: "💢 イライラ" },
  { key: "breastPain", label: "👙 胸の張り・痛み" },
];

// 表示ラベル（共通）
const LABELS: Record<string, string> = {
  hotflash: "ほてり",
  sweat: "汗のかきやすさ",
  sleep: "睡眠の質",
  fatigue: "疲れやすさ",
  pain: "肩こり・痛み",
  cold: "冷え",
  mood: "気分の落ち込み",
  irritability: "イライラ",
  condition: "頭痛・めまい・吐き気",
  headache: "頭痛・めまい・吐き気",
  palpitation: "動悸・息切れ",
  bleeding: "出血",
  temperature: "基礎体温",
};

type Props = {
  data: DailyRecord | null;
  selectedDate: string;
  isToday: boolean;
  readOnly?: boolean;
  onBack: () => void;
  onSave: (record: DailyRecord) => void;
};

export default function DailyCheckDetail({
  data,
  selectedDate,
  isToday,
  onBack,
  onSave,
}: Props) {
  const storage = useStorage();

  // 未来の日付かどうかを判定
  const todayStr = new Date().toISOString().slice(0, 10);
  const isFuture = selectedDate > todayStr;

  // データがない場合（未記録の過去日など）はデフォルト値を設定して入力可能にする
  const effectiveData: DailyRecord = data || {
    date: selectedDate,
    answers: {},
    items: [],
    isPeriod: false,
    memo: "",
  };

  //------------------------------------------------------------
  // ① 未来の日付の場合：編集不可（読み取り専用または警告表示）
  //------------------------------------------------------------
  if (isFuture) {
    return (
      <div className="min-h-screen bg-gray-50 text-brandText">
        <PageHeader title={`${selectedDate} の記録`} onBack={onBack} />
        <main className="mx-auto max-w-screen-md px-4 pb-10 pt-20 md:px-8 md:pt-24">
          <div className="w-full rounded-card border border-white/20 bg-white/60 p-6 shadow-sm">
            <div className="mb-4 text-center text-xs text-red-500">
              ※ 未来の日付は編集できません
            </div>

            {data ? (
              <div className="space-y-4">
                {Object.keys(data.answers).map((key) => {
                  const label = LABELS[key] ?? key;
                  return (
                    <div key={key}>
                      <div className="mb-1 text-sm text-brandMutedAlt">{label}</div>
                      <div className="w-full rounded-input bg-brandInput px-3 py-2 text-sm text-neutralMuted">
                        {key === 'temperature' && data.answers[key]
                          ? `${data.answers[key]}℃`
                          : data.answers[key]}
                      </div>
                    </div>
                  );
                })}
                {data.memo && (
                  <div>
                    <div className="mb-1 text-sm text-brandMutedAlt">メモ</div>
                    <div className="w-full whitespace-pre-wrap rounded-input bg-brandInput px-3 py-2 text-sm text-neutralMuted">
                      {data.memo}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-center text-sm text-brandMuted">記録がありません。</p>
            )}
          </div>
        </main>
      </div>
    );
  }

  //------------------------------------------------------------
  // ② 今日または過去の日付：編集フォーム
  //------------------------------------------------------------
  const answers = effectiveData.answers;
  
  // State管理
  const [isPeriodLocal, setIsPeriodLocal] = useState<boolean>(false);
  const [bleeding, setBleeding] = useState<PeriodBleedingLevel | "無い">("無い");
  const [symptoms, setSymptoms] = useState<PeriodSymptoms>({
    cramp: false, backpain: false, headache: false, nausea: false,
    fatigue: false, mood: false, irritability: false, breastPain: false,
  });
  const [temperature, setTemperature] = useState<string>("");
  const [memo, setMemo] = useState<string>("");
  const [hospitalVisit, setHospitalVisit] = useState(false);
  const [medicationChange, setMedicationChange] = useState(false);
  const [bloodTestNote, setBloodTestNote] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null); // デイリー項目の開閉用
  const [localAnswers, setLocalAnswers] = useState<DailyRecord['answers']>(effectiveData.answers);


  // アコーディオン開閉状態
  const [isPeriodOpen, setIsPeriodOpen] = useState(true);
  const [isDailyOpen, setIsDailyOpen] = useState(true);
  const [isOtherOpen, setIsOtherOpen] = useState(false);

  // 初期データロード（haru_periods と DailyRecord の同期）
  useEffect(() => {
    // 1. 生理記録の確認
    const list = JSON.parse(localStorage.getItem("haru_periods") || "[]") as PeriodRecord[];
    const periodRecord = list.find((r) => r.start === effectiveData.date);

    setLocalAnswers(effectiveData.answers);

    if (periodRecord) {
      setIsPeriodLocal(true);
      setBleeding(periodRecord.bleeding);
      setSymptoms(periodRecord.symptoms);
      // メモは PeriodRecord にあればそれを優先、なければ DailyRecord
      setMemo(periodRecord.memo || effectiveData.memo || "");
    } else {
      setIsPeriodLocal(!!effectiveData.isPeriod);
      // answers.bleeding を反映
      const ans = effectiveData.answers.bleeding;
      if (ans === "少ない" || ans === "普通" || ans === "多い") {
        setBleeding(ans as PeriodBleedingLevel);
      } else {
        setBleeding("無い");
      }
      setMemo(effectiveData.memo || "");
    }

    // 2. 体温の確認
    setTemperature(effectiveData.answers.temperature || "");

    // 3. その他項目の確認
    setHospitalVisit(effectiveData.answers.hospital_visit === "true");
    setMedicationChange(effectiveData.answers.medication_change === "true");
    setBloodTestNote((effectiveData.answers.blood_test_note as string) || "");
  }, [effectiveData]);

  const handleSelect = (key: string, value: DailyAnswerValue | string) => {
    setLocalAnswers(prev => ({ ...prev, [key]: value }));
    setExpandedId(null);
  };

  const toggleSymptom = (key: keyof PeriodSymptoms) => {
    setSymptoms((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // セクションヘッダーコンポーネント
  const SectionHeader = ({ title, isOpen, toggle }: { title: string; isOpen: boolean; toggle: () => void }) => (
    <button
      onClick={toggle}
      className="mb-4 flex w-full items-center justify-between border-b border-brandAccentAlt/30 py-3 transition-colors hover:bg-gray-50"
    >
      <span className="border-l-4 border-brandAccent pl-2 font-semibold text-brandTextStrong text-sm">{title}</span>
      <span className="text-xs text-brandMuted">{isOpen ? "▲" : "▼"}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 text-brandText">
      <PageHeader title={`${selectedDate} の記録`} onBack={onBack} />
      <main className="mx-auto max-w-screen-md px-4 pb-10 pt-20 md:px-8 md:pt-24">
        <div className="w-full rounded-card border border-white/20 bg-white/60 p-4 shadow-sm md:p-6">

          {/* --- 1. 生理の記録 --- */}
          <SectionHeader title="生理の記録" isOpen={isPeriodOpen} toggle={() => setIsPeriodOpen(!isPeriodOpen)} />
          
          {isPeriodOpen && (
            <div className="mb-6">
              {/* 生理中トグル */}
              <div className="mb-6 flex items-center justify-between rounded-card bg-brandInput p-3">
                <span className="font-semibold text-brandText text-sm">今日は生理中ですか？</span>
                <button
                  onClick={() => {
                    const next = !isPeriodLocal;
                    setIsPeriodLocal(next);
                    if (next && bleeding === "無い") {
                      setBleeding("普通");
                    }
                  }}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isPeriodLocal ? "bg-brandAccent" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isPeriodLocal ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* 出血量（常時表示） */}
              <div className="mb-6">
                <label className="mb-2 block text-sm text-brandMutedAlt">出血量</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setBleeding("無い")}
                    className={`flex flex-1 flex-col items-center justify-center gap-1 rounded-button border py-3 transition-colors ${
                      bleeding === "無い"
                        ? "border-brandAccent bg-brandAccent text-white"
                        : "border-brandAccentAlt/50 bg-white text-brandText hover:bg-gray-50"
                    }`}
                  >
                    <span className="text-lg leading-none">🚫</span>
                    <span className="text-xs font-medium">無い</span>
                  </button>

                  {(["少ない", "普通", "多い"] as PeriodBleedingLevel[]).map((level) => {
                    let icon = "💧";
                    if (level === "普通") icon = "💧💧";
                    if (level === "多い") icon = "💧💧💧";
                    const isSelected = bleeding === level;
                    return (
                      <button
                        key={level}
                        onClick={() => setBleeding(level)}
                        className={`flex flex-1 flex-col items-center justify-center gap-1 rounded-button border py-3 transition-colors ${
                          isSelected
                            ? "border-brandAccent bg-brandAccent text-white"
                            : "border-brandAccentAlt/50 bg-white text-brandText hover:bg-gray-50"
                        }`}
                      >
                        <span className="text-lg leading-none">{icon}</span>
                        <span className="text-xs font-medium">{level}</span>
                      </button>
                    );
                  })}
                </div>
                {!isPeriodLocal && bleeding !== "無い" && (
                  <p className="mt-2 text-xs text-brandAccent">
                    ※生理外の出血（不正出血）として記録されます
                  </p>
                )}
              </div>

              {/* ▼ 生理詳細（トグルON時のみ表示） */}
              {isPeriodLocal && (
                <div className="mb-2 space-y-6">
                  {/* 症状 */}
                  <div>
                    <label className="mb-3 block text-sm text-brandMutedAlt">症状（複数選択可）</label>
                    <div className="grid grid-cols-2 gap-2">
                      {PERIOD_SYMPTOMS.map((sym) => (
                        <SymptomToggle
                          key={sym.key}
                          label={sym.label}
                          active={symptoms[sym.key]}
                          onToggle={() => toggleSymptom(sym.key)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* --- 2. 体調の記録 --- */}
          <SectionHeader title="体調の記録" isOpen={isDailyOpen} toggle={() => setIsDailyOpen(!isDailyOpen)} />

          {isDailyOpen && (
            <div className="mb-6 space-y-4">
              {/* ▼ デイリー項目一覧（体温・出血以外） */}
              {Object.keys(localAnswers).map((key) => {
                // 体温と出血は別途UIがあるのでここではスキップ
                if (key === "temperature" || key === "bleeding") return null;

                const label = LABELS[key] ?? key;
                return (
                  <div key={key}>
                    <div className="mb-1 text-sm text-brandMutedAlt">
                      {label}
                    </div>
                    <>
                        {/* 現在の値 */}
                        <button
                          onClick={() => setExpandedId(expandedId === key ? null : key)}
                          className="w-full rounded-input bg-brandInput px-3 py-2 text-left"
                        >
                          {localAnswers[key]}
                        </button>

                        {/* 選択肢（展開時） */}
                        {expandedId === key && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {(["強い", "中くらい", "弱い", "無い"] as DailyAnswerValue[]).map((v) => (
                              <button
                                key={v}
                                onClick={() => handleSelect(key, v)}
                                className="rounded-full border bg-white px-3 py-1 text-xs"
                              >
                                {v}
                              </button>
                            ))}
                          </div>
                        )}
                    </>
                  </div>
                );
              })}
            </div>
          )}

          {/* --- 3. その他 --- */}
          <SectionHeader title="その他（診察・検査など）" isOpen={isOtherOpen} toggle={() => setIsOtherOpen(!isOtherOpen)} />

          {isOtherOpen && (
            <div className="mb-2">
              {/* ▼ 基礎体温 */}
              <div className="mb-6">
                <label className="mb-2 block text-sm text-brandMutedAlt">
                  基礎体温 (℃)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="36.50"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  className="w-full rounded-button border bg-brandInput px-3 py-2"
                />
              </div>

              {/* ▼ 診察・検査 */}
              <div className="mb-6 space-y-3">
                <div className="flex items-center justify-between border-b border-brandAccentAlt/30 py-2">
                  <span className="text-sm text-brandText">🏥 病院に行きましたか？</span>
                  <input
                    type="checkbox"
                    checked={hospitalVisit}
                    onChange={(e) => setHospitalVisit(e.target.checked)}
                    className="h-5 w-5 accent-brandAccent"
                  />
                </div>
                <div className="flex items-center justify-between border-b border-brandAccentAlt/30 py-2">
                  <span className="text-sm text-brandText">💊 処方薬の変更はありましたか？</span>
                  <input
                    type="checkbox"
                    checked={medicationChange}
                    onChange={(e) => setMedicationChange(e.target.checked)}
                    className="h-5 w-5 accent-brandAccent"
                  />
                </div>
                <div className="mt-3">
                  <label className="mb-2 block text-sm text-brandMutedAlt">血液検査結果など（メモ）</label>
                  <textarea
                    value={bloodTestNote}
                    onChange={(e) => setBloodTestNote(e.target.value)}
                    className="min-h-[60px] w-full rounded-button border bg-brandInput px-3 py-2 text-sm"
                    placeholder="数値や医師のコメントなど"
                  />
                </div>
              </div>

              {/* ▼ メモ */}
              <div className="mb-2">
                <label className="mb-2 block text-sm text-brandMutedAlt">メモ</label>
                <textarea
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  className="min-h-[80px] w-full rounded-button border bg-brandInput px-3 py-2 text-sm"
                  placeholder="気になったことなど"
                />
              </div>
            </div>
          )}

          {/* ▼ 保存ボタン */}
          <button
            onClick={() => {
              // 1. haru_periods の更新（同期）
              // This logic should ideally be in `useStorage` as well, but for now we keep it
              const list = JSON.parse(localStorage.getItem("haru_periods") || "[]") as PeriodRecord[];
              let nextList = [...list];

              if (isPeriodLocal) {
                if (bleeding === "無い") {
                  alert("生理中は出血量を選択してください。");
                  return;
                }
                const idx = nextList.findIndex((r) => r.start === effectiveData.date);
                
                if (idx >= 0) {
                  nextList[idx] = { ...nextList[idx], bleeding: bleeding as PeriodBleedingLevel, symptoms, memo };
                } else {
                  nextList.push({
                    start: effectiveData.date,
                    bleeding: bleeding as PeriodBleedingLevel,
                    symptoms,
                    memo,
                  });
                  nextList.sort((a, b) => (a.start > b.start ? -1 : 1));
                }
              } else {
                nextList = nextList.filter((r) => r.start !== effectiveData.date);
              }
              localStorage.setItem("haru_periods", JSON.stringify(nextList));

              // 2. DailyRecord の保存
              const finalAnswers = { ...localAnswers };
              if (temperature) finalAnswers.temperature = temperature;
              finalAnswers.bleeding = bleeding;

              if (hospitalVisit) finalAnswers.hospital_visit = "true";
              else delete finalAnswers.hospital_visit;

              if (medicationChange) finalAnswers.medication_change = "true";
              else delete finalAnswers.medication_change;

              if (bloodTestNote) finalAnswers.blood_test_note = bloodTestNote;
              else delete finalAnswers.blood_test_note;
              
              const recordToSave: DailyRecord = {
                ...effectiveData,
                isPeriod: isPeriodLocal,
                answers: finalAnswers,
                memo: memo,
              };

              onSave(recordToSave);
              alert("記録を保存しました！");
            }}
            className="mt-6 w-full rounded-button bg-brandAccent py-3 text-white transition-colors hover:bg-brandAccentHover"
          >
            保存する
          </button>

        </div>
      </main>
    </div>
  );
}

