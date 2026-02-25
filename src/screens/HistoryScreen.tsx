import React, { useEffect, useMemo, useState } from "react";
import CalendarGrid from "../components/calendar/CalendarGrid";
import { DailyRecord } from "../types/daily";
import { buildCalendarEntries } from "../utils/calendarEntries";
import { loadMenstrualMarkers } from "../logic/calendar/menstrualMarkers";
import PageHeader from "../components/layout/PageHeader";

type Props = {
  onBack: () => void;
  onSelectDate: (date: string) => void;
  records?: DailyRecord[];
};

export default function HistoryScreen({
  onBack,
  onSelectDate,
  records: propRecords,
}: Props) {
  const [records, setRecords] = useState<DailyRecord[]>(propRecords ?? []);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    if (propRecords && propRecords.length > 0) {
      setRecords(propRecords);
      return;
    }

    const list: DailyRecord[] = [];

    // localStorage のキーを全部走査して「haru_daily_」だけ拾う
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);

      if (key && key.startsWith("haru_daily_")) {
        const raw = localStorage.getItem(key);
        try {
          const parsed = raw ? (JSON.parse(raw) as DailyRecord) : null;
          if (parsed) {
            list.push(parsed);
          }
        } catch (e) {
          console.error("JSON parse error:", key);
        }
      }
    }

    // 日付の新しい順にソート
    list.sort((a, b) => (a.date > b.date ? -1 : 1));

    setRecords(list);
  }, [propRecords]);

  const calendarEntries = useMemo(() => buildCalendarEntries(records), [records]);
  const menstrualMarkers = useMemo(() => loadMenstrualMarkers(), [records]);

  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
    onSelectDate(date);
  };

  return (
    <div className="min-h-screen text-brandText">
      <PageHeader title="体調カレンダー" onBack={onBack} />
      <main className="mx-auto max-w-screen-md px-4 pb-10 pt-20 md:px-8 md:pt-24">
        <CalendarGrid
          entries={calendarEntries}
          menstrualMarkers={menstrualMarkers}
          selectedDate={selectedDate ?? undefined}
          onSelectDate={handleSelectDate}
        />

        {records.length === 0 && (
          <p className="py-8 text-center text-xs text-neutralText">
            過去の記録はありません。日々の記録をつけてみましょう。
          </p>
        )}
      </main>
    </div>
  );
}
