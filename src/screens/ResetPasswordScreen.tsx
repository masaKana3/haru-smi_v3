import React, { useState } from "react";
import { useStorage } from "../hooks/useStorage";

type Props = {
  email: string;
  onSuccess: () => void;
  onCancel: () => void;
};

export default function ResetPasswordScreen({ email, onSuccess, onCancel }: Props) {
  const storage = useStorage();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    if (!password.trim()) {
      setError("新しいパスワードを入力してください。");
      return;
    }
    if (password !== confirmPassword) {
      setError("パスワードが一致しません。");
      return;
    }
    if (password.length < 4) {
      setError("パスワードは4文字以上で設定してください。");
      return;
    }

    setLoading(true);
    try {
      await storage.resetPassword(email, password);
      alert("パスワードを再設定しました。新しいパスワードでログインしてください。");
      onSuccess();
    } catch (err) {
      setError("エラーが発生しました。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-brandText">
      <div className="w-full max-w-sm space-y-6 rounded-card border border-white/20 bg-white/60 p-6 shadow-sm">
        <div className="space-y-2 text-center">
          <h2 className="text-lg font-semibold">新しいパスワードの設定</h2>
          <p className="text-xs text-brandMuted">
            {email} の新しいパスワードを設定します。
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-semibold">新しいパスワード</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-card border border-brandAccentAlt px-3 py-2 text-sm"
              placeholder="4文字以上"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold">パスワード（確認）</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-card border border-brandAccentAlt px-3 py-2 text-sm"
              placeholder="もう一度入力"
            />
          </div>

          {error && <div className="text-xs text-red-500">{error}</div>}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full rounded-button bg-brandAccent py-3 text-sm text-white transition-colors hover:bg-brandAccentHover disabled:opacity-50"
          >
            {loading ? "設定中..." : "パスワードを変更する"}
          </button>
        </div>

        <div className="text-center">
          <button
            onClick={onCancel}
            className="text-sm text-brandAccent underline transition-opacity hover:opacity-80"
          >
            キャンセル
          </button>
        </div>
      </div>
    </div>
  );
}