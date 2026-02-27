import React from "react";
import SMIQuestionScreen from "../screens/SMIQuestionScreen";
import DashboardScreen from "../screens/DashboardScreen";
import DailyCheckScreen from "../screens/DailyCheckScreen";
import ResultScreen from "../screens/ResultScreen";
import DailyCheckDetail from "../screens/DailyCheckDetail";
import HistoryScreen from "../screens/HistoryScreen";
import InsightScreen from "../screens/InsightScreen";
import CommunityScreen from "../screens/CommunityScreen";
import PostCreateScreen from "../screens/PostCreateScreen";
import ThreadScreen from "../screens/ThreadScreen";
import DiaryScreen from "../screens/DiaryScreen";
import PostDetailScreen from "../screens/PostDetailScreen";
import ProfileScreen from "../screens/ProfileScreen";
import SettingsScreen from "../screens/SettingsScreen";
import ProfileEditScreen from "../screens/ProfileEditScreen";
import SMIHistoryScreen from "../screens/SMIHistoryScreen";
import { DailyQuestion, DailyRecord } from "../types/daily";
import { PeriodRecord } from "../types/period";
import { SMIConvertedAnswer } from "../types/smi";
import { useNavigation } from "../hooks/useNavigation";
import { useCommunityNavigation } from "../hooks/useCommunityNavigation";
import BottomNav from "../components/layout/BottomNav";

type Props = {
  nav: ReturnType<typeof useNavigation>;
  totalScore: number | null;
  todayDaily: DailyRecord | null;
  dailyItems: DailyQuestion[];
  historyRecords: DailyRecord[];
  latestPeriod: PeriodRecord | null;
  allPeriodRecords: PeriodRecord[];
  selectedDate: string;
  currentUserId: string;
  onFinishSMI: (total: number, answers: SMIConvertedAnswer[]) => void;
  onStartDailyCheck: () => void;
  onSaveDaily: (data: DailyRecord) => void;
  onSelectDate: (dateStr: string) => void;
  onUpdateTodayDaily: (updated: DailyRecord) => void;
  onLogout: () => void;
  viewingUserId: string | null;
  onOpenProfile: (userId: string) => void;
};

export default function AppNavigator({
  nav,
  totalScore,
  todayDaily,
  dailyItems,
  historyRecords,
  latestPeriod,
  allPeriodRecords,
  selectedDate,
  currentUserId,
  onFinishSMI,
  onStartDailyCheck,
  onSaveDaily,
  onSelectDate,
  onUpdateTodayDaily,
  onLogout,
  viewingUserId,
  onOpenProfile,
}: Props) {
  const communityNav = useCommunityNavigation(nav);

  const showBottomNav = ![
    "smi", 
    "result",
  ].includes(nav.screen);

  return (
    <div className="w-full min-h-screen">
      {nav.screen === "smi" && <SMIQuestionScreen onFinish={onFinishSMI} onCancel={() => nav.goBack("dashboard")} />}

      {nav.screen === "result" && (
        <ResultScreen total={totalScore} onGoDashboard={() => nav.navigate("dashboard")} />
      )}

      {nav.screen === "dashboard" && (
        <DashboardScreen
          total={totalScore}
          onDailyCheck={onStartDailyCheck}
          todayDaily={todayDaily}
          historyRecords={historyRecords}
          onSelectDate={onSelectDate}
          selectedDate={selectedDate}
          onShowHistory={() => nav.navigate("history")}
          onOpenSMIHistory={() => nav.navigate("smi_history")}
          onOpenInsight={() => nav.navigate("insight")}
          onOpenCommunity={() => nav.navigate("community")}
          onOpenThread={communityNav.handleOpenThread}
          onOpenSettings={() => nav.navigate("settings")}
          latestPeriod={latestPeriod}
          allPeriodRecords={allPeriodRecords}
        />
      )}

      {nav.screen === "daily" && (
        <DailyCheckScreen
          dailyItems={dailyItems}
          onComplete={(data) => {
            onSaveDaily(data);
          }}
          onCancel={() => nav.goBack("dashboard")}
        />
      )}

      {nav.screen === "detail" && (
        <DailyCheckDetail
          data={todayDaily}
          selectedDate={selectedDate}
          isToday={selectedDate === new Date().toISOString().slice(0, 10)}
          readOnly={selectedDate > new Date().toISOString().slice(0, 10)}
          onBack={() => nav.goBack("dashboard")}
          onSave={onSaveDaily}
          allPeriodRecords={allPeriodRecords}
        />
      )}

      {nav.screen === "history" && (
        <HistoryScreen
          records={historyRecords}
          onBack={() => nav.navigate("dashboard")}
          onSelectDate={(date) => {
            nav.setPrevScreen("history");
            onSelectDate(date);
          }}
        />
      )}

      {nav.screen === "smi_history" && (
        <SMIHistoryScreen onBack={() => nav.navigate("dashboard")} onStartMeasure={() => nav.navigate("smi")} />
      )}

      {nav.screen === "community" && (
        <CommunityScreen
          onBack={() => nav.navigate("dashboard")}
          onCreatePost={communityNav.handleCreatePost}
          onOpenThread={communityNav.handleOpenThread}
          onOpenDiary={() => communityNav.handleCreatePost({ type: "diary" })}
          onOpenPostDetail={communityNav.handleOpenPostDetail}
          currentUserId={currentUserId}
          onOpenProfile={onOpenProfile}
        />
      )}

      {nav.screen === "postCreate" && (
        <PostCreateScreen
          onBack={() => nav.goBack("community")}
          onSaved={(postId) => {
            nav.setActivePostId(postId);
            nav.navigate("postDetail");
          }}
          defaultTopicId={nav.activeTopicId}
          defaultType={nav.activeTopicId ? "thread" : "diary"}
          currentUserId={currentUserId}
          editingPostId={nav.activePostId}
        />
      )}

      {nav.screen === "thread" && nav.activeTopicId && (
        <ThreadScreen
          topicId={nav.activeTopicId}
          onBack={() => nav.goBack("community")}
          onCreatePost={(topicId) => communityNav.handleCreatePost({ topicId, type: "thread" })}
          onOpenPostDetail={communityNav.handleOpenPostDetail}
          onOpenProfile={onOpenProfile}
          currentUserId={currentUserId}
        />
      )}

      {nav.screen === "diary" && (
        <DiaryScreen
          onBack={() => nav.navigate("community")}
          onOpenPostDetail={communityNav.handleOpenPostDetail}
          onCreateDiary={() => communityNav.handleCreatePost({ type: "diary" })}
          currentUserId={currentUserId}
          onOpenProfile={onOpenProfile}
        />
      )}

      {nav.screen === "postDetail" && nav.activePostId && (
        <PostDetailScreen
          postId={nav.activePostId}
          onBack={() => nav.goBack()}
          currentUserId={currentUserId}
          onEdit={() => communityNav.handleEditPost(nav.activePostId!)}
          onDeleted={() => communityNav.handlePostDeleted()}
          onOpenProfile={onOpenProfile}
        />
      )}

      {nav.screen === "profile" && (
        <ProfileScreen
          onBack={() => nav.goBack("settings")}
          onOpenPostDetail={communityNav.handleOpenPostDetail}
          currentUserId={currentUserId}
          viewingUserId={viewingUserId || currentUserId}
          onEditProfile={() => nav.navigate("profileEdit")}
          onOpenProfile={onOpenProfile}
        />
      )}

      {nav.screen === "insight" && (
        <InsightScreen
          todayDaily={todayDaily}
          onBack={() => nav.navigate("dashboard")}
          latestPeriod={latestPeriod}
          allDailyRecords={historyRecords}
          allPeriodRecords={allPeriodRecords}
        />
      )}

      {nav.screen === "settings" && (
        <SettingsScreen
          onBack={() => nav.navigate("dashboard")}
          onLogout={onLogout}
          onOpenProfile={() => onOpenProfile(currentUserId)}
        />
      )}

      {nav.screen === "profileEdit" && (
        <ProfileEditScreen
          onBack={() => nav.goBack("profile")}
          onSaved={() => nav.goBack("profile")}
        />
      )}
      
      {showBottomNav && (
        <BottomNav
          activeScreen={nav.screen}
          onNavigate={(screen) => nav.navigate(screen)}
        />
      )}
    </div>
  );
}