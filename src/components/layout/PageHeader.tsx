import React from 'react';

type Props = {
  title: string;
  onBack?: () => void;
  showBackButton?: boolean;
};

export default function PageHeader({ title, onBack, showBackButton = true }: Props) {
  return (
    <header className="sticky top-0 z-50 w-full bg-[#D4829A] text-white shadow-md">
      <div className="relative mx-auto flex h-14 max-w-screen-md items-center justify-center px-4 md:h-16 md:px-8">
        {showBackButton && onBack && (
          <div className="absolute left-4 md:left-8">
            <button onClick={onBack} className="text-sm transition-opacity hover:opacity-80">
              戻る
            </button>
          </div>
        )}
        <h1 className="text-lg font-semibold md:text-xl">{title}</h1>
      </div>
    </header>
  );
}
