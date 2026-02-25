import React from "react";

type NavItemProps = {
  emoji: string;
  label: string;
  isActive: boolean;
  onClick: () => void;
};

const NavItem: React.FC<NavItemProps> = ({ emoji, label, isActive, onClick }) => {
  const activeClass = isActive ? "text-brandAccent" : "text-gray-500";
  return (
    <button onClick={onClick} className={`flex flex-col items-center justify-center gap-1 transition-colors duration-200 ${activeClass}`}>
      <span className="text-2xl">{emoji}</span>
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
  const navItems: Array<{ id: ScreenName; emoji: string; label: string; relatedScreens: string[] }> = [
    { id: 'dashboard', emoji: '🏠', label: 'ホーム', relatedScreens: ['dashboard', 'insight', 'smi_history'] },
    { id: 'history', emoji: '✍️', label: '記録', relatedScreens: ['history', 'daily', 'detail'] },
    { id: 'community', emoji: '💬', label: 'コミュニティ', relatedScreens: ['community', 'diary', 'postCreate', 'postDetail', 'thread'] },
    { id: 'settings', emoji: '⚙️', label: 'マイページ', relatedScreens: ['settings', 'profile', 'profileEdit'] },
  ];

  const getIsActive = (item: typeof navItems[0]) => {
    return item.relatedScreens.includes(activeScreen);
  }

  return (
    <nav className="fixed bottom-0 z-50 w-full border-t border-gray-200/80 bg-white/90 shadow-[0_-2px_10px_rgba(0,0,0,0.04)] backdrop-blur-sm">
      <div className="mx-auto grid h-16 max-w-screen-md grid-cols-4 items-stretch justify-items-center">
        {navItems.map((item) => (
          <NavItem
            key={item.id}
            emoji={item.emoji}
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
