import React, { useRef } from "react";
import PageHeader from "../components/layout/PageHeader";

type Props = {
  onBack: () => void;
  onLogout: () => void;
  onOpenProfile: () => void;
};

export default function SettingsScreen({ onBack, onLogout, onOpenProfile }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const data: Record<string, string> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("haru_")) {
        const value = localStorage.getItem(key);
        if (value) {
          data[key] = value;
        }
      }
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `haru_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = event.target?.result as string;
        const data = JSON.parse(json);

        if (typeof data !== "object" || data === null) {
          alert("無効なファイル形式です。");
          return;
        }

        if (
          !window.confirm(
            "現在のデータが上書きされます。本当によろしいですか？"
          )
        ) {
          if (fileInputRef.current) fileInputRef.current.value = "";
          return;
        }

        // 既存の haru データをクリア
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith("haru_")) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach((k) => localStorage.removeItem(k));

        // データを復元
        Object.keys(data).forEach((key) => {
          if (key.startsWith("haru_")) {
            localStorage.setItem(key, data[key]);
          }
        });

        alert("データの復元が完了しました。アプリを再読み込みします。");
        window.location.reload();
      } catch (err) {
        alert("ファイルの読み込みに失敗しました。");
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen text-brandText">
      <PageHeader title="設定" onBack={onBack} />
      <main className="mx-auto max-w-screen-md space-y-6 px-4 pb-10 pt-20 md:px-8 md:pt-24">
        <div className="space-y-6 rounded-card border border-white/20 bg-white/70 p-6 shadow-sm">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">アカウント設定</h3>
            <button
              onClick={onOpenProfile}
              className="w-full rounded-button border border-brandAccent bg-white py-3 text-sm text-brandAccent"
            >
              プロフィール確認・変更
            </button>
            <button
              onClick={onLogout}
              className="w-full rounded-button bg-neutralBg py-3 text-sm text-brandText"
            >
              ログアウト
            </button>
          </div>

          <div className="border-t border-brandAccentAlt/30" />

          <div className="space-y-2">
            <h3 className="text-sm font-semibold">データのバックアップ</h3>
            <p className="text-xs leading-relaxed text-brandMuted">
              現在の記録データをファイルとして保存します。機種変更の際などに利用してください。
            </p>
            <button
              onClick={handleExport}
              className="w-full rounded-button bg-brandAccent py-3 text-sm text-white transition-colors hover:bg-brandAccentHover"
            >
              データを書き出す（エクスポート）
            </button>
          </div>

          <div className="border-t border-brandAccentAlt/30" />

          <div className="space-y-2">
            <h3 className="text-sm font-semibold">データの復元</h3>
            <p className="text-xs leading-relaxed text-brandMuted">
              保存したファイルを読み込んでデータを復元します。
              <br />
              <span className="text-red-500">
                ※現在のデータは上書きされます。
              </span>
            </p>
            <input
              type="file"
              accept=".json"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleImport}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full rounded-button border border-brandAccent bg-white py-3 text-sm text-brandAccent"
            >
              データを読み込む（インポート）
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-brandMuted">
          Haru SMI v2.0.0
        </div>
      </main>
    </div>
  );
}