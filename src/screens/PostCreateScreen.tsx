import React, { useEffect, useState } from "react";
import { CommunityPost, CommunityTopic } from "../types/community";
import { useStorage } from "../hooks/useStorage";
import PageHeader from "../components/layout/PageHeader";

type Props = {
  onBack: () => void;
  onSaved: (postId: string) => void;
  defaultTopicId?: string | null;
  defaultType?: "thread" | "diary" | "official";
  currentUserId: string;
  editingPostId?: string | null;
};

export default function PostCreateScreen({
  onBack,
  onSaved,
  defaultTopicId = null,
  defaultType = "diary",
  currentUserId,
  editingPostId = null,
}: Props) {
  const storage = useStorage();
  const [topics, setTopics] = useState<CommunityTopic[]>([]);
  const isEditing = !!editingPostId;

  const [type, setType] = useState<"thread" | "diary" | "official">(defaultType);
  const [topicId, setTopicId] = useState<string | "">(defaultTopicId || "");
  const [isPublic, setIsPublic] = useState(true);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopics = async () => {
      const topicData = await storage.listCommunityTopics();
      setTopics(topicData);
    };
    fetchTopics();
  }, [storage]);

  useEffect(() => {
    if (isEditing && editingPostId) {
      const loadPost = async () => {
        const post = await storage.getPostById(editingPostId);
        if (post) {
          setTitle(post.title || "");
          setContent(post.content);
          setType(post.type || 'diary');
          setTopicId(post.topic_id || "");
          setIsPublic(post.is_public ?? true);
        }
      };
      loadPost();
    }
  }, [editingPostId, isEditing, storage]);

  const handleSubmit = async () => {
    setError(null);
    if (!content.trim()) {
      setError("内容を入力してください。");
      return;
    }
    if ((type === "thread" || type === "official") && !topicId) {
      setError("テーマを選択してください。");
      return;
    }

    const postData = {
      id: editingPostId || undefined,
      type,
      title: title.trim(),
      content,
      is_public: isPublic,
      topicId: (type === "thread" || type === "official") ? topicId : undefined,
    };

    const post = await storage.createCommunityPost(postData);
    if (post && post.id) {
      onSaved(post.id);
    } else {
      setError("投稿の保存に失敗しました。");
    }
  };

  return (
    <div className="min-h-screen text-brandText">
      <PageHeader title={isEditing ? "投稿を編集" : "投稿を作成"} onBack={onBack} />
      <main className="mx-auto max-w-screen-md px-4 pb-10 pt-20 md:px-8 md:pt-24">
        <div className="space-y-4 rounded-card border border-white/20 bg-white/70 p-4 shadow-sm md:p-6">
          {defaultType !== 'official' && (
            <div className="space-y-1">
              <div className="text-sm font-semibold">タイプ</div>
              <div className="flex items-center gap-3 text-sm">
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    checked={type === "diary"}
                    onChange={() => setType("diary")}
                  />
                  日記
                </label>
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    checked={type === "thread"}
                    onChange={() => setType("thread")}
                  />
                  テーマへの投稿
                </label>
              </div>
            </div>
          )}

          {(type === "thread" || type === "official") && (
            <div className="space-y-1">
              <div className="text-sm font-semibold">テーマを選択</div>
              <select
                value={topicId}
                onChange={(e) => setTopicId(e.target.value)}
                className="w-full rounded-card border border-brandAccentAlt px-3 py-2 text-sm"
                disabled={type === 'official'}
              >
                <option value="">選択してください</option>
                {topics.map((t: CommunityTopic) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-1">
            <div className="text-sm font-semibold">公開範囲</div>
            <div className="flex items-center gap-3 text-sm">
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  checked={isPublic}
                  onChange={() => setIsPublic(true)}
                />
                公開
              </label>
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  checked={!isPublic}
                  onChange={() => setIsPublic(false)}
                />
                非公開
              </label>
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-sm font-semibold">タイトル（任意）</div>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-card border border-brandAccentAlt px-3 py-2 text-sm"
              placeholder="例）今日の気づき"
            />
          </div>

          <div className="space-y-1">
            <div className="text-sm font-semibold">内容</div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[140px] w-full rounded-card border border-brandAccentAlt px-3 py-2 text-sm"
              placeholder="感じたことを書いてみましょう"
            />
          </div>

          {error && <div className="text-xs text-red-500">{error}</div>}

          <button
            onClick={handleSubmit}
            className="w-full rounded-button bg-brandAccent py-3 text-sm text-white transition-colors hover:bg-brandAccentHover"
          >
            {isEditing ? "更新する" : "投稿する"}
          </button>
        </div>
      </main>
    </div>
  );
}
