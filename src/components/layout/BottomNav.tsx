import React from "react";
import homeIcon from "../../assets/img/home.png";
import penIcon from "../../assets/img/pen.png";
import bubbleIcon from "../../assets/img/bubble.png";
import userIcon from "../../assets/img/user.png";

type NavItemProps = {
  icon: string;
  label: string;
  isActive: boolean;
  onClick: () => void;
};

const NavItem: React.FC<NavItemProps> = ({ icon, label, isActive, onClick }) => {
  const textClass = isActive ? "text-brandAccent" : "text-gray-400";
  const iconClass = isActive ? "grayscale-0" : "grayscale opacity-70";

  return (
    <button onClick={onClick} className={`flex flex-col items-center justify-center gap-1 font-medium transition-colors duration-200 ${textClass}`}>
      <img src={icon} alt={label} className={`h-6 w-6 transition-all duration-200 ${iconClass}`} />
      <span className="text-xs">{label}</span>
    </button>
  );
};

type ScreenName = "dashboard" | "history" | "community" | "settings";

type BottomNavProps = {
  activeScreen: string;
  onNavigate: (screen: ScreenName) => void;
};

const BottomNav: React.FC<BottomNavProps> = ({ activeScreen, onNavigate }) => {
  const navItems: Array<{ id: ScreenName; icon: string; label: string; relatedScreens: string[] }> = [
    { id: 'dashboard', icon: homeIcon, label: 'ホーム', relatedScreens: ['dashboard', 'insight', 'smi_history'] },
    { id: 'history', icon: penIcon, label: '記録', relatedScreens: ['history', 'daily', 'detail'] },
    { id: 'community', icon: bubbleIcon, label: 'コミュニティ', relatedScreens: ['community', 'diary', 'postCreate', 'postDetail', 'thread', 'profile'] },
    { id: 'settings', icon: userIcon, label: 'マイページ', relatedScreens: ['settings', 'profileEdit'] },
  ];

  const getIsActive = (item: typeof navItems[0]) => {
    // 特別ルール：コミュニティ関連画面でも、自分のプロフィールを見ているときは「マイページ」をアクティブにする
    if (item.id === 'settings' && activeScreen === 'profile') {
      // viewingUserId と currentUserId を比較する必要があるが、このコンポーネントはそれらの情報を持っていない
      // ここでは単純化し、profile スクリーンはマイページに属すると仮定する
      // （より正確な実装には AppNavigator からの追加情報が必要）
    }
    return item.relatedScreens.includes(activeScreen);
  }

  return (
    <nav className="fixed bottom-0 z-50 w-full border-t border-gray-200/80 bg-white/90 shadow-[0_-2px_10px_rgba(0,0,0,0.04)] backdrop-blur-sm">
      <div className="mx-auto grid h-16 max-w-screen-md grid-cols-4 items-stretch justify-items-center">
        {navItems.map((item) => (
          <NavItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            isActive={getIsActive(item)}
            onClick={() => onNavigate(item.id)}
          />
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
