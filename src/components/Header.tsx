import React from 'react';
import { ShoppingCart, LogOut, Users, RefreshCw } from 'lucide-react';
import { auth, signOut, User } from '../firebase';

interface HeaderProps {
  user: User;
  familyGroup: string;
  onOpenFamilyModal: () => void;
  isSyncing: boolean;
}

export const Header: React.FC<HeaderProps> = ({ user, familyGroup, onOpenFamilyModal, isSyncing }) => {
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-xl mx-auto px-4 py-2.5 flex items-center justify-between gap-2">
        {/* Logo & App Name */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-sky-500 text-white rounded-xl flex items-center justify-center shadow-xs">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-800 leading-tight flex items-center gap-1.5">
              買い物リスト
              {isSyncing ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-normal text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded-full border border-sky-200">
                  <span className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-ping" />
                  同期中
                </span>
              ) : (
                <span className="inline-flex items-center text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">
                  接続済み
                </span>
              )}
            </h1>
            <p className="text-[11px] text-slate-500 flex items-center gap-1">
              <span>{user.displayName || 'ユーザー'}</span>
            </p>
          </div>
        </div>

        {/* Right Action buttons */}
        <div className="flex items-center gap-1.5">
          {/* Family group code badge */}
          <button
            id="open-family-modal-btn"
            onClick={onOpenFamilyModal}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors border border-slate-200/60"
            title="家族共有コード設定"
          >
            <Users className="w-3.5 h-3.5 text-sky-600" />
            <span className="max-w-[70px] truncate">{familyGroup === 'default_family' ? '家族共有' : familyGroup}</span>
          </button>

          {/* User profile image */}
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName || 'User'}
              className="w-8 h-8 rounded-full border border-slate-200 object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 font-bold text-xs flex items-center justify-center border border-sky-200">
              {(user.displayName || 'U')[0]}
            </div>
          )}

          {/* Logout button */}
          <button
            id="logout-btn"
            onClick={handleLogout}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            title="ログアウト"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
