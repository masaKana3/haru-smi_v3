import React, { useState } from "react";
import { useSupabaseAuth } from "../hooks/useSupabaseAuth";

type Props = {
  onSuccess: () => void;
  onCancel: () => void;
};

export default function SignupScreen({ onSuccess, onCancel }: Props) {
  const { signUp } = useSupabaseAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await signUp(email, password);
      alert("登録確認メールを送信しました。メール内のリンクをクリックして登録を完了してください。");
      onSuccess();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "登録に失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-brandText">
      <div className="w-full max-w-sm rounded-card border border-white/20 bg-white/60 p-8 shadow-sm">
        <h2 className="text-center text-xl font-semibold">新規登録</h2>

        {error && (
          <div className="mt-6 rounded bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">メールアドレス</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded border border-brandAccentAlt px-3 py-2"
              placeholder="example@email.com"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">パスワード</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded border border-brandAccentAlt px-3 py-2"
              placeholder="6文字以上"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-button bg-brandAccent py-3 font-medium text-white transition-colors hover:bg-brandAccentHover disabled:opacity-50"
          >
            {loading ? "処理中..." : "登録する"}
          </button>
        </form>

        <button
          onClick={onCancel}
          className="mt-4 w-full text-sm text-brandMuted underline"
        >
          ログイン画面に戻る
        </button>
      </div>
    </div>
  );
}