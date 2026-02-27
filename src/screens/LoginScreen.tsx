import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import HaruRogo from '../assets/img/Haru_rogo.png';

type Props = {
  onLoginSuccess: (userId: string) => void;
  onGoToSignup: () => void;
  onForgotPassword: () => void;
};

export default function LoginScreen({ onLoginSuccess, onGoToSignup, onForgotPassword }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError(null);
    if (!email.trim() || !password.trim()) {
      setError("メールアドレスとパスワードを入力してください。");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      if (data.user) {
        onLoginSuccess(data.user.id);
      }
    } catch (err: any) {
      setError(err.message || "ログイン中にエラーが発生しました。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-brandText">
      <img src={HaruRogo} alt="Haru Logo" className="w-1/2 max-w-[200px] mb-6" />
      <div className="w-full max-w-sm space-y-6 rounded-card border border-white/20 bg-white/70 p-6 shadow-sm">
        <div className="space-y-2 text-center">
          <h2 className="text-lg font-semibold">ログイン</h2>
          <p className="text-xs text-brandMuted">
            おかえりなさい
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-semibold">メールアドレス</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-card border border-brandAccentAlt px-3 py-2 text-sm"
              placeholder="example@email.com"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold">パスワード</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-card border border-brandAccentAlt px-3 py-2 text-sm"
              placeholder="パスワード"
            />
          </div>

          {error && <div className="text-xs text-red-500">{error}</div>}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full rounded-button bg-brandAccent py-3 text-sm text-white transition-colors hover:bg-brandAccentHover disabled:opacity-50"
          >
            {loading ? "ログイン中..." : "ログイン"}
          </button>

          <div className="text-center">
            <button
              onClick={onForgotPassword}
              className="text-xs text-brandMuted hover:text-brandAccent transition-colors"
            >
              パスワードをお忘れの方はこちら
            </button>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={onGoToSignup}
            className="text-sm text-brandAccent underline transition-opacity hover:opacity-80"
          >
            アカウントをお持ちでない方はこちら
          </button>
        </div>
      </div>
    </div>
  );
}
