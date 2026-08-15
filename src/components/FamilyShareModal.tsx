import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Users, X, Check, Copy, Share2, Link, Sparkles } from 'lucide-react';

interface FamilyShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFamilyGroup: string;
  onUpdateFamilyGroup: (groupCode: string) => void;
}

export const FamilyShareModal: React.FC<FamilyShareModalProps> = ({
  isOpen,
  onClose,
  currentFamilyGroup,
  onUpdateFamilyGroup,
}) => {
  const [inputCode, setInputCode] = useState(currentFamilyGroup === 'default_family' ? '' : currentFamilyGroup);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = inputCode.trim() || 'default_family';
    onUpdateFamilyGroup(cleanCode);
    onClose();
  };

  const getShareUrl = () => {
    const code = (inputCode.trim() || currentFamilyGroup) === 'default_family' ? 'default_family' : (inputCode.trim() || currentFamilyGroup);
    const url = new URL(window.location.href);
    url.searchParams.set('group', code);
    return url.toString();
  };

  const handleCopyLink = () => {
    const shareUrl = getShareUrl();
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCode = () => {
    const codeToShare = currentFamilyGroup === 'default_family' ? 'default_family' : currentFamilyGroup;
    navigator.clipboard.writeText(codeToShare);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleNativeShare = async () => {
    const shareUrl = getShareUrl();
    const groupName = inputCode.trim() || currentFamilyGroup;
    if (navigator.share) {
      try {
        await navigator.share({
          title: '買い物リストの家族共有',
          text: `「${groupName}」の買い物リストに参加しよう！リンクを開くだけで同期されます。`,
          url: shareUrl,
        });
      } catch (err) {
        // Ignored or cancelled by user
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-2xl border border-slate-100"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-sky-100 text-sky-700 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">家族共有グループ設定</h3>
              <p className="text-[11px] text-slate-500">別端末でも同じリストを即時同期</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              家族共有コード
            </label>
            <input
              type="text"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              placeholder="例: たなか家、yoshida-family"
              className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm font-medium focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              ※家族で同じ単語を設定するか、下の招待URLを送るだけで自動参加できます。
            </p>
          </div>

          {/* Quick Share Buttons */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 space-y-2.5">
            <div className="text-xs font-semibold text-slate-700 flex items-center justify-between">
              <span>家族への招待方法</span>
              <span className="text-[10px] text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded font-bold">1タップ参加</span>
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handleNativeShare}
                className="w-full h-9 bg-sky-500 hover:bg-sky-600 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>LINEやメールで招待リンクを送る</span>
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex-1 h-8 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-sky-600" /> : <Link className="w-3.5 h-3.5 text-slate-500" />}
                  <span>{copiedLink ? 'URLコピー完了' : '招待URLをコピー'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="px-3 h-8 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-[11px] font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-sky-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                  <span>{copiedCode ? 'コピー完了' : 'コードのみ'}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-sky-500 hover:bg-sky-600 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              グループを保存
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
