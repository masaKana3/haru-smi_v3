import { PeriodRecord } from "../../types/period";

// 将来的にAIモデルの設定などをここに持たせるための構成
export type PredictionConfig = {
  method: "simple_average" | "ai_model"; // 拡張用フラグ
  defaultCycle: number;
};

export type PredictionResult = {
  nextPeriodDate: string | null; // YYYY-MM-DD
  daysUntilNext: number | null;  // 今日からあと何日か（マイナスは予定日超過）
  estimatedCycleLength: number;  // 推定された周期日数
};

export type CyclePhase = "menstrual" | "follicular" | "ovulatory" | "luteal" | "unknown";

export type PhaseInfo = {
  phase: CyclePhase;
  dayInCycle: number;
};

const DEFAULT_CONFIG: PredictionConfig = {
  method: "simple_average",
  defaultCycle: 28,
};

const formatYMD = (date: Date): string => {
  const y = date.getFullYear();
  const m = ("0" + (date.getMonth() + 1)).slice(-2);
  const d = ("0" + date.getDate()).slice(-2);
  return `${y}-${m}-${d}`;
};

function diffDays(d1: Date, d2: Date): number {
  const t1 = new Date(d1);
  const t2 = new Date(d2);
  t1.setHours(0, 0, 0, 0);
  t2.setHours(0, 0, 0, 0);
  return Math.round((t2.getTime() - t1.getTime()) / (1000 * 60 * 60 * 24));
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function predictNextPeriod(
  history: PeriodRecord[],
  config: PredictionConfig = DEFAULT_CONFIG
): PredictionResult {
  const sorted = [...history].sort((a, b) => (a.start < b.start ? 1 : -1));

  if (sorted.length === 0) {
    return {
      nextPeriodDate: null,
      daysUntilNext: null,
      estimatedCycleLength: config.defaultCycle,
    };
  }

  const latest = sorted[0];
  const latestDate = new Date(latest.start);
  latestDate.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let cycleLength = config.defaultCycle;

  if (sorted.length >= 2) {
    let sumDiff = 0;
    let count = 0;
    const maxSamples = Math.min(sorted.length - 1, 6);
    
    for (let i = 0; i < maxSamples; i++) {
      const current = new Date(sorted[i].start);
      const prev = new Date(sorted[i + 1].start);
      const diff = diffDays(prev, current);
      
      if (diff >= 20 && diff <= 45) {
        sumDiff += diff;
        count++;
      }
    }

    if (count > 0) {
      cycleLength = Math.round(sumDiff / count);
    }
  }

  const nextDate = addDays(latestDate, cycleLength);
  const daysUntil = diffDays(today, nextDate);

  return {
    nextPeriodDate: formatYMD(nextDate),
    daysUntilNext: daysUntil,
    estimatedCycleLength: cycleLength,
  };
}

// A robust date parsing utility
function parseDate(dateString: string): Date | null {
  try {
    // Handles "YYYY-MM-DD" format by ensuring it's treated as UTC to avoid timezone shifts.
    const date = new Date(dateString + 'T00:00:00Z');
    if (isNaN(date.getTime())) {
      console.error("Invalid date string provided:", dateString);
      return null;
    }
    // The time is already zeroed out by the UTC creation, but this is a safeguard.
    date.setUTCHours(0, 0, 0, 0);
    return date;
  } catch (e) {
    console.error("Date parsing failed:", e);
    return null;
  }
}

export function getCyclePhase(
  latestPeriod: PeriodRecord | null,
  allPeriods: PeriodRecord[], // Kept for API compatibility
  cycleLength: number = DEFAULT_CONFIG.defaultCycle
): PhaseInfo {
  // If there's no latest period or start date, we can't determine the phase.
  if (!latestPeriod?.start) {
    return { phase: "unknown", dayInCycle: 0 };
  }

  const startDate = parseDate(latestPeriod.start);
  
  // If the start date is invalid, we can't proceed.
  if (!startDate) {
    return { phase: "unknown", dayInCycle: 0 };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dayInCycle = diffDays(startDate, today) + 1;

  // 1. --- "Forced" Menstrual Check ---
  // As per instruction: if start date is within 7 days, force menstrual phase.
  // The user's instruction about a "toggle" is interpreted as this date check.
  if (dayInCycle >= 1 && dayInCycle <= 7) {
    return { phase: "menstrual", dayInCycle: Math.floor(dayInCycle) };
  }

  // 2. --- Logic for other phases ---
  if (dayInCycle < 1) {
    // This handles cases where today is before the latest period start date.
    return { phase: "luteal", dayInCycle: Math.floor(dayInCycle) };
  }
  
  let phase: CyclePhase = "unknown";
  if (dayInCycle > 7 && dayInCycle <= cycleLength - 17) {
    phase = "follicular";
  } else if (dayInCycle > cycleLength - 17 && dayInCycle <= cycleLength - 11) {
    phase = "ovulatory";
  } else if (dayInCycle > cycleLength - 11) {
    phase = "luteal";
  }

  return { phase, dayInCycle: Math.floor(dayInCycle) };
}