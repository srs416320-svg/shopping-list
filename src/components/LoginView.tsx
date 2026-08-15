import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShoppingCart, Users, Zap, CheckCircle2, ShieldCheck, AlertCircle, ExternalLink } from 'lucide-react';
import { auth, googleProvider, signInWithPopup, signInWithRedirect } from '../firebase';

interface LoginViewProps {
  isLoading: boolean;
  error: string | null;
  setError: (err: string | null) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ isLoading, error, setError }) => {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isDomainError, setIsDomainError] = useState(false);

  const handleGoogleLogin = async (useRedirect = false) => {
    setIsLoggingIn(true);
    setError(null);
    setIsDomainError(false);

    if (useRedirect) {
      try {
        await signInWithRedirect(auth, googleProvider);
        return;
      } catch (err: any) {
        console.error('Redirect sign-in error:', err);
        setError(err.message || 'ログイン処理に失敗しました。');
        setIsLoggingIn(false);
        return;
      }
    }

    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.warn('Popup login error:', err);
      if (err.code === 'auth/unauthorized-domain') {
        setIsDomainError(true);
        setError(
          `このドメイン（${window.location.hostname}）がFirebaseで未許可です。Firebase Consoleの「Authentication」→「設定」→「承認済みドメイン」に「${window.location.hostname}」を追加してください。`
        );
      } else if (
        err.code === 'auth/popup-blocked' ||
        err.code === 'auth/popup-closed-by-user' ||
        err.code === 'auth/cancelled-popup-request'
      ) {
        try {
          await signInWithRedirect(auth, googleProvider);
          return;
        } catch (redirectErr: any) {
          setError('ポップアップがブロックされました。「リダイレクトでログイン」をお試しください。');
        }
      } else {
        setError(err.message || 'ログインエラーが発生しました。もう一度お試しください。');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 sm:p-6">
      <motion.div 
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 p-6 sm:p-8 space-y-6"
      >
        {/* Logo and App Title */}
        <div className="text-center space-y-3">
          <div className="mx-auto w-16 h-16 bg-sky-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
            <ShoppingCart className="w-9 h-9" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">買い物リスト</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">家族でリアルタイム共有・らくらく買い出し</p>
          </div>
        </div>

        {/* Features highlights */}
        <div className="bg-slate-50 rounded-xl p-4 space-y-3 border border-slate-100 text-sm">
          <div className="flex items-center gap-3 text-slate-700">
            <div className="p-1.5 bg-sky-100 text-sky-700 rounded-lg shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <span>買い出し時に別端末と<strong>即時リアルタイム同期</strong></span>
          </div>

          <div className="flex items-center gap-3 text-slate-700">
            <div className="p-1.5 bg-blue-100 text-blue-700 rounded-lg shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <span>家族で同じコードまたはURLから簡単共有</span>
          </div>

          <div className="flex items-center gap-3 text-slate-700">
            <div className="p-1.5 bg-purple-100 text-purple-700 rounded-lg shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span>タップするだけでチェック＆一括整理</span>
          </div>
        </div>

        {/* Error message / Unauthorized domain guide */}
        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs sm:text-sm space-y-2">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed font-medium">{error}</div>
            </div>

            {isDomainError && (
              <div className="pt-2 border-t border-rose-200/60 text-[11px] text-rose-700 space-y-1">
                <p className="font-bold">【GitHub Pagesで使うための設定手順】</p>
                <ol className="list-decimal pl-4 space-y-0.5">
                  <li>Firebase Console &gt; Authentication を開く</li>
                  <li>「設定」タブ &gt;「承認済みドメイン」をクリック</li>
                  <li>「ドメインを追加」で <code className="bg-rose-100 px-1 rounded font-mono">{window.location.hostname}</code> を入力</li>
                </ol>
              </div>
            )}
          </div>
        )}

        {/* Google Login Buttons */}
        <div className="space-y-3 pt-1">
          <button
            id="google-login-btn"
            onClick={() => handleGoogleLogin(false)}
            disabled={isLoading || isLoggingIn}
            className="w-full h-12 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-700 shadow-sm flex items-center justify-center gap-3 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoggingIn || isLoading ? (
              <div className="w-5 h-5 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            <span className="text-sm font-semibold">Google でログイン</span>
          </button>

          <p className="text-[11px] text-center text-slate-400 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            安全な Firebase 認証を使用しています
          </p>
        </div>
      </motion.div>
    </div>
  );
};
