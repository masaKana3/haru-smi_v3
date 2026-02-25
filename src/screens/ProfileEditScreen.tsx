import React, { useEffect, useState } from "react";
import PageHeader from "../components/layout/PageHeader";
import { useStorage } from "../hooks/useStorage";
import { ICONS } from "../lib/constants";

type Props = {
  onBack: () => void;
  onSaved: () => void;
};

export default function ProfileEditScreen({ onBack, onSaved }: Props) {
  const storage = useStorage();
  const [nickname, setNickname] = useState("");
  const [bio, setBio] = useState("");
  const [iconId, setIconId] = useState("azarashi"); // Default icon
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const profile = await storage.loadProfile();
      if (profile) {
        setNickname(profile.nickname);
        setBio(profile.bio);
        // If avatarUrl is not a URL, it's an icon ID
        if (profile.avatarUrl && !profile.avatarUrl.startsWith('http')) {
          setIconId(profile.avatarUrl);
        }
      }
      setLoading(false);
    };
    load();
  }, [storage]);

  const handleSave = async () => {
    if (!nickname.trim()) {
      alert("ニックネームを入力してください。");
      return;
    }
    await storage.saveProfile({
      nickname: nickname.trim(),
      bio: bio.trim(),
      avatarUrl: iconId, // Save the iconId as avatarUrl
    });
    onSaved();
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center text-brandMuted">
        読み込み中...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-brandText">
      <PageHeader title="プロフィール編集" onBack={onBack} />
      <main className="mx-auto max-w-screen-md px-4 pb-10 pt-20 md:px-8 md:pt-24">
        <div className="rounded-card border border-white/20 bg-white/60 p-6 shadow-sm">
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-semibold">ニックネーム</label>
              <input
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full rounded-card border border-brandAccentAlt px-3 py-2 text-sm"
                placeholder="表示名を入力"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">アイコンを選択</label>
              <div className="flex flex-wrap items-center gap-3 pt-1">
                {Object.entries(ICONS).map(([id, src]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setIconId(id)}
                    className={`h-12 w-12 overflow-hidden rounded-full transition-all duration-200 ease-in-out focus:outline-none ${
                      iconId === id
                        ? "ring-2 ring-brandAccent ring-offset-2 ring-offset-white"
                        : "hover:opacity-80"
                    }`}
                    aria-label={`アイコンを${id}に設定`}
                  >
                    <img
                      src={src as string}
                      alt={id}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold">自己紹介</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="min-h-[100px] w-full rounded-card border border-brandAccentAlt px-3 py-2 text-sm"
                placeholder="ひとこと（任意）"
              />
            </div>

            <button
              onClick={handleSave}
              className="mt-4 w-full rounded-button bg-brandAccent py-3 text-sm text-white transition-colors hover:bg-brandAccentHover"
            >
              保存する
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}