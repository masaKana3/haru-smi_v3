import React, { useEffect, useState, useCallback } from "react";
import PostCard from "../components/PostCard";
import { CommunityPost, CommunityTopic } from "../types/community";
import { useStorage } from "../hooks/useStorage";
import PageHeader from "../components/layout/PageHeader";

type Props = {
  topicId: string;
  onBack: () => void;
  onCreatePost: (topicId: string) => void;
  onOpenPostDetail: (postId: string) => void;
  onOpenProfile: (userId: string) => void; // onOpenProfileをpropsに追加
  currentUserId: string;
};

export default function ThreadScreen({
  topicId,
  onBack,
  onCreatePost,
  onOpenPostDetail,
  onOpenProfile, // propsから受け取る
  currentUserId,
}: Props) {
  const storage = useStorage();
  const [topic, setTopic] = useState<CommunityTopic | null>(null);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUserAdmin, setIsUserAdmin] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    // Fetch admin status, topic details and posts
    const [isAdminStatus, allTopics, postData] = await Promise.all([
      storage.isAdmin(),
      storage.listCommunityTopics(),
      storage.listCommunityPosts(topicId),
    ]);
    
    setIsUserAdmin(isAdminStatus);
    const currentTopic = allTopics.find(t => t.id === topicId);
    setTopic(currentTopic || null);
    setPosts(postData);
    setLoading(false);
  }, [storage, topicId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleLike = async (postId: string) => {
    console.log("Like functionality is not yet implemented for postId:", postId);
  };

  const handleDeletePost = async (postId: string) => {
    const success = await storage.deletePost(postId);
    if (success) {
      loadData();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen text-brandText">
        <PageHeader title="読み込み中..." onBack={onBack} />
        <main className="mx-auto flex max-w-screen-md items-center justify-center px-4 pb-28 pt-20 md:px-8 md:pt-24">
          <p>読み込み中...</p>
        </main>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="min-h-screen text-brandText">
        <PageHeader title="エラー" onBack={onBack} />
        <main className="mx-auto max-w-screen-md px-4 pb-28 pt-20 md:px-8 md:pt-24">
          <div className="rounded-card border border-white/20 bg-white/70 p-6 text-center text-sm text-brandMuted shadow-sm">
            テーマが見つかりませんでした。
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-brandText">
      <PageHeader title={topic.title} onBack={onBack} />
      <main className="mx-auto max-w-screen-md space-y-4 px-4 pb-28 pt-20 md:px-8 md:pt-24">
        <div className="space-y-2 rounded-card border border-white/20 bg-white/70 p-4 shadow-sm">
          <div className="text-sm font-semibold">テーマ</div>
          <div className="text-xs leading-relaxed text-brandMuted">{topic.title}</div>
          <button
            className="text-xs text-brandAccent underline"
            onClick={() => onCreatePost(topic.id)}
          >
            このテーマに投稿する
          </button>
        </div>

        <div className="space-y-3">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              topic={topic}
              onOpen={() => onOpenPostDetail(post.id)}
              onLike={() => handleLike(post.id)}
              onOpenProfile={onOpenProfile}
              onDelete={handleDeletePost}
              currentUserId={currentUserId}
              isAdmin={isUserAdmin}
            />
          ))}
          {posts.length === 0 && (
            <div className="p-4 text-center text-xs text-brandMuted">まだ投稿がありません。</div>
          )}
        </div>
      </main>
    </div>
  );
}
