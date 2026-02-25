import React, { useEffect, useRef, useState } from "react";
import { getOptionsForItemId } from "../utils/DailyCheckUtils";
import {
  DailyAnswers,
  DailyAnswerValue,
  DailyQuestion,
  DailyRecord,
} from "../types/daily";
import ChatBubble from "../components/daily/ChatBubble";
import ChoiceButtons from "../components/daily/ChoiceButtons";
import { useStorage } from "../hooks/useStorage";
import PageHeader from "../components/layout/PageHeader";

type ChatMessage = {
  id: number;
  from: "bot" | "user";
  text: string;
};

type Props = {
  dailyItems: DailyQuestion[];
  onComplete?: (data: DailyRecord) => void;
  onCancel?: () => void;
};

export default function DailyCheckScreen({ dailyItems, onComplete, onCancel }: Props) {
  const [index, setIndex] = useState<number>(0);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [answers, setAnswers] = useState<DailyAnswers>({});
  const [userAvatar, setUserAvatar] = useState<string | undefined>();
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const storage = useStorage();

  // ユーザーアバターの読み込み
  useEffect(() => {
    const fetchProfile = async () => {
      const profile = await storage.loadProfile();
      if (profile?.avatarUrl) {
        setUserAvatar(profile.avatarUrl);
      }
    };
    fetchProfile();
  }, [storage]);

  // 初期メッセージ
  useEffect(() => {
    if (!dailyItems || dailyItems.length === 0) return;
    if (messages.length > 0) return;

    const first = dailyItems[0];

    setMessages([
      {
        id: 1,
        from: "bot",
        text: "今日の体調について、少しだけ教えてもらっても良いですか？",
      },
      {
        id: 2,
        from: "bot",
        text: first.question,
      },
    ]);
  }, [dailyItems, messages.length]);

  // 自動スクロール
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (!dailyItems || dailyItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 text-brandText">
        <PageHeader title="デイリーチェック" onBack={onCancel} />
        <main className="mx-auto max-w-screen-md px-4 py-10 pt-20 md:px-8 md:pt-24">
          <div className="rounded-card border border-white/20 bg-white/60 p-6 text-sm shadow-sm">
            デイリーチェック項目がまだ設定されていません。
          </div>
        </main>
      </div>
    );
  }

  const currentItem = dailyItems[index];
  const options: DailyAnswerValue[] = currentItem ? getOptionsForItemId(currentItem.id) : [];

  const handleSelect = (option: DailyAnswerValue) => {
    if (!currentItem || typeof option !== 'string') return;

    const newAnswers = { ...answers, [currentItem.id]: option };
    setAnswers(newAnswers);
    setMessages((prev) => [...prev, { id: prev.length + 1, from: "user", text: option }]);

    const nextIndex = index + 1;
    if (nextIndex < dailyItems.length) {
      const nextItem = dailyItems[nextIndex];
      setIndex(nextIndex);
      setMessages((prev) => [...prev, { id: prev.length + 1, from: "bot", text: nextItem.question }]);
    } else {
      finishCheck(newAnswers);
    }
  };

  const handleTemperatureSubmit = (temp: string) => {
    if (!currentItem) return;

    const newAnswers = { ...answers, [currentItem.id]: temp };
    setAnswers(newAnswers);
    setMessages((prev) => [...prev, { id: prev.length + 1, from: "user", text: `${temp} ℃` }]);

    const nextIndex = index + 1;
    if (nextIndex < dailyItems.length) {
      const nextItem = dailyItems[nextIndex];
      setIndex(nextIndex);
      setMessages((prev) => [...prev, { id: prev.length + 1, from: "bot", text: nextItem.question }]);
    } else {
      finishCheck(newAnswers);
    }
  };

  const handleTemperatureSkip = () => {
    if (!currentItem) return;
    setMessages((prev) => [...prev, { id: prev.length + 1, from: "user", text: "（スキップ）" }]);

    const nextIndex = index + 1;
    if (nextIndex < dailyItems.length) {
      const nextItem = dailyItems[nextIndex];
      setIndex(nextIndex);
      setMessages((prev) => [...prev, { id: prev.length + 1, from: "bot", text: nextItem.question }]);
    } else {
      finishCheck(answers);
    }
  };

  const finishCheck = (finalAnswers: DailyAnswers) => {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10);
    const dataToSave: DailyRecord = { date: dateStr, answers: finalAnswers, items: dailyItems };
    setMessages((prev) => [...prev, { id: prev.length + 1, from: "bot", text: "教えてくれてありがとうございます。内容を確認してください。" }]);
    if (onComplete) onComplete(dataToSave);
  };

  return (
    <div className="flex h-screen flex-col bg-gray-50 text-brandText">
      <PageHeader title="デイリーチェック" onBack={onCancel} />
      <main className="mx-auto w-full max-w-screen-md flex-1 overflow-hidden px-4 md:px-8">
        <div className="flex h-full flex-col">
          {/* チャットエリア */}
          <div className="flex-1 space-y-4 overflow-y-auto py-4">
            {messages.map((m) => (
              <ChatBubble key={m.id} from={m.from} text={m.text} avatarUrl={userAvatar} />
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* 選択肢 or 数値入力 */}
          <div className="py-4">
            {currentItem && currentItem.id !== "temperature" && options.length > 0 && (
              <ChoiceButtons options={options} onSelect={handleSelect} />
            )}
            {currentItem && currentItem.id === "temperature" && (
              <TemperatureInput onSubmit={handleTemperatureSubmit} onSkip={handleTemperatureSkip} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function TemperatureInput({ onSubmit, onSkip }: { onSubmit: (temp: string) => void; onSkip: () => void }) {
  const [temp, setTemp] = useState("");

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSubmit();
  };

  const handleSubmit = () => {
    if (temp.trim()) onSubmit(temp.trim());
  };

  return (
    <div className="ml-10 flex max-w-[70%] flex-col items-end gap-2">
      <input
        type="number"
        step="0.01"
        value={temp}
        onChange={(e) => setTemp(e.target.value)}
        onKeyPress={handleKeyPress}
        className="w-full rounded-bubble border border-brandAccentAlt px-3 py-2 text-sm"
        placeholder="36.50"
      />
      <div className="mt-1 flex items-center gap-3">
        <button onClick={onSkip} className="text-xs text-brandMuted underline hover:text-brandText">
          スキップ
        </button>
        <button onClick={handleSubmit} className="transform-gpu rounded-button bg-brandAccent px-4 py-2 text-xs text-white shadow-sm transition-colors hover:bg-brandAccentHover">
          決定
        </button>
      </div>
    </div>
  );
}
