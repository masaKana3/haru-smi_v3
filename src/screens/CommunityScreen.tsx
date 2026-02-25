import React, { useCallback, useEffect, useState } from "react";
import { CommunityPost, CommunityTopic } from "../types/community";
import { useStorage } from "../hooks/useStorage";
import PageHeader from "../components/layout/PageHeader";
import Card from "../components/layout/Card";
import SectionTitle from "../components/layout/SectionTitle";
import { ICONS, DEFAULT_ICON } from "../lib/constants";

type Props = {
  onBack: () => void;
  currentUserId: string;
  onOpenProfile: (userId: string) => void;
  onCreatePost?: (opts?: { topicId?: string; type?: "thread" | "diary" | "official" }) => void;
  onOpenThread?: (topicId: string) => void;
  onOpenDiary?: () => void;
  onOpenPostDetail?: (postId: string) => void;
};

const PostItem: React.FC<{ 
  post: CommunityPost, 
  currentUserId: string, 
  isUserAdmin: boolean,
  onOpenProfile: (userId: string) => void, 
  onOpenPostDetail?: (postId: string) => void,
  onDelete: (postId: string) => void,
}> = ({ post, currentUserId, isUserAdmin, onOpenProfile, onOpenPostDetail, onDelete }) => {
  const author = post.profiles;
  const isOwnPost = post.user_id === currentUserId;
  const authorName = isOwnPost ? "あなた" : author?.nickname || "匿名";

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("この投稿を本当に削除しますか？")) {
      onDelete(post.id);
    }
  };

  const getAvatarSrc = () => {
    const avatarId = author?.avatarUrl;
    if (avatarId && ICONS[avatarId]) {
      return ICONS[avatarId];
    }
    return DEFAULT_ICON;
  };
  
  const renderBadge = () => {
    const badges = [];
    if (post.type === 'diary') {
      badges.push(<span key="diary" className="text-xs px-2 py-0.5 bg-brandBubble text-brandAccent rounded-full">🌿 日記</span>);
    }
    if (post.type === 'thread' && post.community_topics?.title) {
      badges.push(<span key="thread" className="text-xs px-2 py-0.5 bg-brandAccent/20 text-brandAccent rounded-full">💬 {post.community_topics.title}</span>);
    }
    return badges;
  };

  return (
    <div className="bg-white/70 border border-white/20 rounded-card p-4 shadow-sm space-y-3 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => onOpenPostDetail && onOpenPostDetail(post.id)}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <img
            src={getAvatarSrc()}
            alt={authorName}
            className="w-10 h-10 rounded-full bg-gray-200 cursor-pointer flex-shrink-0"
            onClick={(e) => { e.stopPropagation(); !isOwnPost && post.user_id && onOpenProfile(post.user_id); }}
          />
          <div>
            <span className="text-sm font-bold text-brandTextStrong cursor-pointer hover:underline" onClick={(e) => { e.stopPropagation(); !isOwnPost && post.user_id && onOpenProfile(post.user_id); }}>{authorName}</span>
            <div className="text-xs text-brandMuted">
              {new Date(post.created_at).toLocaleString('ja-JP')}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {post.is_public && <span className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded-full">公開</span>}
          {(isOwnPost || isUserAdmin) && (
            <button onClick={handleDelete} className="text-red-500 hover:text-red-700 text-xs p-1">
              🗑️
            </button>
          )}
        </div>
      </div>

      <p className="text-sm text-brandText whitespace-pre-wrap line-clamp-3">{post.content}</p>

      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {renderBadge()}
        </div>
        <div className="flex items-center gap-4 text-xs text-brandMuted">
          <span className="flex items-center gap-1">
            ❤️ {post.likes_count ?? 0}
          </span>
          <span className="flex items-center gap-1">
            💬 {post.comments_count ?? 0}
          </span>
        </div>
      </div>
    </div>
  );
};

export default function CommunityScreen({
  onBack,
  currentUserId,
  onOpenProfile,
  onOpenDiary,
  onOpenThread,
  onOpenPostDetail,
}: Props) {
  const { isAdmin, listCommunityTopics, loadCommunityPosts, createCommunityTopic, deletePost } = useStorage();
  const [isUserAdmin, setIsUserAdmin] = useState(false);
  const [topics, setTopics] = useState<CommunityTopic[]>([]);
  const [timelinePosts, setTimelinePosts] = useState<CommunityPost[]>([]);
  const [loadingTopics, setLoadingTopics] = useState(true);
  const [loadingTimeline, setLoadingTimeline] = useState(true);
  const [newTopicTitle, setNewTopicTitle] = useState("");

  useEffect(() => {
    const checkAdminStatus = async () => {
      const admin = await isAdmin();
      setIsUserAdmin(admin);
    };
    checkAdminStatus();
  }, [isAdmin]);

  const fetchData = useCallback(async () => {
    setLoadingTopics(true);
    setLoadingTimeline(true);
    const [fetchedTopics, fetchedPosts] = await Promise.all([
      listCommunityTopics(),
      loadCommunityPosts()
    ]);
    setTopics(fetchedTopics);
    setTimelinePosts(fetchedPosts);
    setLoadingTopics(false);
    setLoadingTimeline(false);
  }, [listCommunityTopics, loadCommunityPosts]);

  useEffect(() => {
    fetchData();

    const handlePostDeleted = () => {
      console.log("Post deletion event detected, refreshing timeline.");
      fetchData();
    };
    
    window.addEventListener('haru:post-deleted', handlePostDeleted);
    
    return () => {
      window.removeEventListener('haru:post-deleted', handlePostDeleted);
    };
  }, [fetchData]);

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicTitle.trim()) return;
    const newTopic = await createCommunityTopic(newTopicTitle);
    if (newTopic) {
      setNewTopicTitle("");
      fetchData();
    }
  };

  const handleDeletePost = async (postId: string) => {
    // Optimistically remove the post from the state
    setTimelinePosts(prevPosts => prevPosts.filter(post => post.id !== postId));

    const success = await deletePost(postId);
    if (!success) {
      // If deletion fails, revert the change by re-fetching data
      alert("投稿の削除に失敗しました。データを再読み込みします。");
      fetchData();
    }
  };

  return (
    <div className="min-h-screen text-brandText">
      <PageHeader title="コミュニティ" onBack={onBack} />

      {/* Content */}
      <main className="mx-auto max-w-screen-md space-y-6 px-4 pb-28 pt-20 md:px-8 md:pt-24">
        
        {/* Diary Section */}
        <Card as="button" onClick={onOpenDiary} className="w-full p-4 text-left transition-colors hover:bg-gray-50">
          <h2 className="mb-1 text-base font-semibold text-brandTextStrong">日記を書く</h2>
          <p className="text-sm text-brandMuted">今日の出来事や感じたことを記録して、タイムラインで共有しましょう。</p>
        </Card>

        {/* Official Topics Section */}
        <Card className="w-full p-4 space-y-3">
          <SectionTitle>運営テーマ</SectionTitle>
          
          {isUserAdmin && (
            <form onSubmit={handleCreateTopic} className="flex items-center gap-2 pb-1 pt-2">
              <input
                type="text"
                value={newTopicTitle}
                onChange={(e) => setNewTopicTitle(e.target.value)}
                placeholder="新しいお題のタイトル"
                className="flex-grow rounded-md border-none bg-brandInput p-2 text-sm"
              />
              <button type="submit" className="transform-gpu rounded-button bg-brandAccent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brandAccentHover">
                作成
              </button>
            </form>
          )}

          {loadingTopics ? (
            <p className="text-sm text-brandMuted">読み込み中...</p>
          ) : topics.length === 0 ? (
            <p className="text-sm text-brandMuted">現在、運営からのテーマはありません。</p>
          ) : (
            <div className="space-y-2">
              {topics.map(topic => (
                <div key={topic.id} onClick={() => onOpenThread && onOpenThread(topic.id)} className="cursor-pointer rounded-bubble bg-brandPanel/80 p-3 transition-colors hover:bg-brandAccentAlt/30">
                  <p className="font-semibold text-sm text-brandTextStrong">{topic.title}</p>
                  <p className="mt-1 text-xs text-brandMuted">作成日: {new Date(topic.created_at).toLocaleDateString('ja-JP')}</p>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Public Timeline Section */}
        <Card className="w-full p-4 space-y-3">
          <SectionTitle>公開タイムライン</SectionTitle>
          
          {loadingTimeline ? (
             <p className="text-sm text-brandMuted">タイムラインを読み込んでいます...</p>
          ) : timelinePosts.length === 0 ? (
            <p className="text-sm text-brandMuted">まだ投稿がありません。</p>
          ) : (
            <div className="space-y-3">
              {timelinePosts.map(post => (
                <PostItem key={post.id} post={post} currentUserId={currentUserId} isUserAdmin={isUserAdmin} onOpenProfile={onOpenProfile} onOpenPostDetail={onOpenPostDetail} onDelete={handleDeletePost} />
              ))}
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}

