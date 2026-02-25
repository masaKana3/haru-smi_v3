import React, { useEffect, useMemo, useState } from "react";
import PostCard from "../components/PostCard";
import { CommunityPost } from "../types/community";
import { useStorage } from "../hooks/useStorage";
import PageHeader from "../components/layout/PageHeader";

type Visibility = "public" | "private";
type VisibilityFilter = "all" | Visibility;

type Props = {
  onBack: () => void;
  onOpenPostDetail: (postId: string) => void;
  onCreateDiary: () => void;
  currentUserId: string;
  onOpenProfile: (userId: string) => void;
};

export default function DiaryScreen({
  onBack,
  onOpenPostDetail,
  onCreateDiary,
  currentUserId,
  onOpenProfile,
}: Props) {
  const storage = useStorage();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [visibilityFilter, setVisibilityFilter] = useState<VisibilityFilter>("all");
  const [isUserAdmin, setIsUserAdmin] = useState(false);

  const loadPosts = async () => {
    const data = await storage.loadDiaryPosts(currentUserId);
    setPosts(data);
    storage.isAdmin().then(setIsUserAdmin);
  };

  useEffect(() => {
    loadPosts();
  }, [currentUserId]);

  const handleLike = async (postId: string) => {
    console.log(`Like functionality not implemented for post ${postId}`);
  };

  const handleDeletePost = async (postId: string) => {
    const success = await storage.deletePost(postId);
    if (success) {
      loadPosts();
    }
  };

  const filteredPosts = useMemo(() => {
    return posts
      .filter((post) => {
        if (visibilityFilter === "all") return true;
        if (visibilityFilter === "public") return post.is_public !== false; // true or undefined
        if (visibilityFilter === "private") return post.is_public === false && post.user_id === currentUserId;
        return false;
      })
      .filter((post) => {
        if (!searchTerm.trim()) return true;
        const lowercasedTerm = searchTerm.toLowerCase();
        return (
          post.title?.toLowerCase().includes(lowercasedTerm) ||
          post.content.toLowerCase().includes(lowercasedTerm)
        );
      });
  }, [posts, searchTerm, visibilityFilter, currentUserId]);

  const filterOptions: { label: string; value: VisibilityFilter }[] = [
    { label: "すべて", value: "all" },
    { label: "公開のみ", value: "public" },
    { label: "自分の非公開", value: "private" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-brandText">
      <PageHeader title="日記" onBack={onBack} />
      <main className="mx-auto max-w-screen-md space-y-6 px-4 pb-10 pt-20 md:px-8 md:pt-24">
        <div className="space-y-3 rounded-card border border-white/20 bg-white/60 p-4 shadow-sm">
          <div className="text-sm font-semibold">日記の検索・絞り込み</div>
          <div className="space-y-3 pt-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-card border border-brandAccentAlt px-3 py-2 text-sm"
              placeholder="キーワードで検索..."
            />
            <div className="flex gap-2">
              {filterOptions.map(({ label, value }) => (
                <button
                  key={value}
                  onClick={() => setVisibilityFilter(value)}
                  className={`flex-1 rounded-button border py-2 text-xs ${
                    visibilityFilter === value
                      ? "bg-brandAccent text-white"
                      : "bg-brandInput text-brandText"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="text-sm font-semibold">
              検索結果 ({filteredPosts.length}件)
            </div>
            <button className="text-xs text-brandAccent underline" onClick={onCreateDiary}>
              新しく書く
            </button>
          </div>
          {filteredPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onOpen={() => onOpenPostDetail(post.id)}
              onLike={() => handleLike(post.id)}
              onOpenProfile={onOpenProfile}
              onDelete={handleDeletePost}
              currentUserId={currentUserId}
              isAdmin={isUserAdmin}
            />
          ))}
          {filteredPosts.length === 0 && (
            <div className="py-8 text-center text-xs text-brandMuted">
              {posts.length > 0 ? "条件に合う日記がありません。" : "まだ日記がありません。"}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
