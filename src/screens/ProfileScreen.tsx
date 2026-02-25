import React, { useEffect, useState } from "react";
import PostCard from "../components/PostCard";
import { CommunityPost } from "../types/community";
import { useStorage } from "../hooks/useStorage";
import { UserProfile } from "../types/user";
import { useSupabaseAuth } from "../hooks/useSupabaseAuth";
import { ICONS, DEFAULT_ICON } from "../lib/constants";
import PageHeader from "../components/layout/PageHeader";

type Props = {
  onBack: () => void;
  onOpenPostDetail: (postId: string) => void;
  currentUserId: string;
  viewingUserId: string;
  onEditProfile: () => void;
  onOpenProfile?: (userId: string) => void;
};

export default function ProfileScreen({
  onBack,
  onOpenPostDetail,
  currentUserId,
  viewingUserId,
  onEditProfile,
  onOpenProfile,
}: Props) {
  const storage = useStorage();
  const { user } = useSupabaseAuth();
  const [myPosts, setMyPosts] = useState<CommunityPost[]>([]);
  const [likedPosts, setLikedPosts] = useState<CommunityPost[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [totalLikes, setTotalLikes] = useState(0);
  const [activeTab, setActiveTab] = useState<"posts" | "likes">("posts");
  const [isUserAdmin, setIsUserAdmin] = useState(false);

  const isMe = currentUserId === viewingUserId;

  const load = async () => {
    // Check admin status
    storage.isAdmin().then(setIsUserAdmin);

    // プロフィール情報を取得
    const userProfile = await storage.getUserProfile(viewingUserId);
    setProfile(userProfile);

    // 自分のプロフィールの場合は、自分の投稿といいねした投稿を両方読み込む
    if (isMe) {
      const myPostsData = await storage.loadUserPosts(viewingUserId);
      setMyPosts(myPostsData);

      const likedPostsData = await storage.listLikedPosts(viewingUserId);
      setLikedPosts(likedPostsData);
    } else {
      // 他のユーザーのプロフィールの場合は、公開投稿のみを読み込む
      const publicPostsData = await storage.loadUserPublicPosts(viewingUserId);
      setMyPosts(publicPostsData);
      setLikedPosts([]); // 他人の「いいね」は表示しない
      setActiveTab("posts"); // 必ず「投稿」タブをデフォルトにする
    }
    
    // 総獲得いいね数を取得
    const totalLikesCount = await storage.getUserTotalLikes(viewingUserId);
    setTotalLikes(totalLikesCount);
  };

  useEffect(() => {
    load();
  }, [viewingUserId, isMe]);

  const handleLike = async (postId: string) => {
    await storage.likePost(postId, currentUserId);
    // Note: This won't visually update likes as the feature is not fully implemented.
    // load();
  };

  const handleDeletePost = async (postId: string) => {
    const success = await storage.deletePost(postId);
    if (success) {
      load();
    }
  };

  const getAvatarSrc = () => {
    const avatarId = profile?.avatarUrl;
    if (avatarId && ICONS[avatarId]) {
      return ICONS[avatarId];
    }
    return DEFAULT_ICON;
  };

  const displayPosts = activeTab === "posts" ? myPosts : likedPosts;

  return (
    <div className="min-h-screen text-brandText">
      <PageHeader title="プロフィール" onBack={onBack} />
      <main className="mx-auto max-w-screen-md space-y-6 px-4 pb-10 pt-20 md:px-8 md:pt-24">
        <div className="space-y-2 rounded-card border border-white/20 bg-white/70 p-6 text-center shadow-sm">
          <div className="mx-auto flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-brandAccentAlt/30 text-2xl">
            <img
              src={getAvatarSrc()}
              alt="Avatar"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="text-lg font-semibold">
            {profile?.nickname || "ユーザー"}
          </div>
          
          {profile?.bio && (
            <div className="mt-2 whitespace-pre-wrap text-sm text-brandText">
              {profile.bio}
            </div>
          )}

          {isMe && (
            <button onClick={onEditProfile} className="mx-auto mt-2 block text-xs text-brandAccent underline">
              プロフィールを編集
            </button>
          )}

          <div className="mt-4 flex items-center justify-center gap-8 border-t border-brandAccentAlt/30 pt-4">
            <div className="text-center">
              <div className="text-xl font-bold text-brandAccent">{myPosts.length}</div>
              <div className="text-xs text-brandMuted">投稿</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-brandAccent">{totalLikes}</div>
              <div className="text-xs text-brandMuted">獲得いいね</div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="mb-2 flex border-b border-brandAccentAlt/30">
            <button
              onClick={() => setActiveTab("posts")}
              className={`flex-1 pb-2 text-sm font-semibold transition-colors ${
                activeTab === "posts"
                  ? "border-b-2 border-brandAccent text-brandAccent"
                  : "text-brandMuted"
              }`}
            >
              {isMe ? "自分の投稿" : "投稿"}
            </button>
            {isMe && (
              <button
                onClick={() => setActiveTab("likes")}
                className={`flex-1 pb-2 text-sm font-semibold transition-colors ${
                  activeTab === "likes"
                    ? "border-b-2 border-brandAccent text-brandAccent"
                    : "text-brandMuted"
                }`}
              >
                いいねした投稿
              </button>
            )}
          </div>

          {displayPosts.map((post) => (
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
          {displayPosts.length === 0 && (
            <div className="py-4 text-center text-xs text-brandMuted">
              {activeTab === "posts" ? (isMe ? "まだ投稿がありません。" : "公開中の投稿がありません。") : "まだ「いいね」した投稿がありません。"}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}