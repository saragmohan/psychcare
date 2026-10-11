import React from 'react';
import { X, Check, Sparkles } from 'lucide-react';
import { AVATAR_CHARACTERS, type AvatarCharacter } from '../services/avatarCharacters';

interface AvatarPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatarUrl: string;
  onSelectAvatar: (avatarUrl: string) => void;
  userName?: string;
  title?: string;
}

export const AvatarPickerModal: React.FC<AvatarPickerModalProps> = ({
  isOpen,
  onClose,
  currentAvatarUrl,
  onSelectAvatar,
  userName = 'User',
  title = 'Choose Avatar Character',
}) => {
  if (!isOpen) return null;

  const handleChoose = (character: AvatarCharacter) => {
    onSelectAvatar(character.dataUrl);
    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in cursor-pointer overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl text-white space-y-4 max-h-[90vh] overflow-y-auto cursor-default my-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-950 text-indigo-400 border border-indigo-800 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-white">
                {title}
              </h3>
              <p className="text-xs text-slate-400">
                Pick a friendly character profile DP for <strong className="text-indigo-300">{userName}</strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Preview Bar */}
        <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800/80 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src={currentAvatarUrl}
              alt="Current Profile DP"
              className="w-10 h-10 rounded-xl object-cover ring-2 ring-indigo-500/50 shadow-md shrink-0"
            />
            <div>
              <div className="text-xs font-semibold text-white">Current Profile DP</div>
              <div className="text-[11px] text-slate-400">Click any character below to instantly switch</div>
            </div>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-950/80 px-2.5 py-1 rounded-lg border border-indigo-800/50">
            Active
          </span>
        </div>

        {/* Avatar Characters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
          {AVATAR_CHARACTERS.map((char) => {
            const isSelected = currentAvatarUrl === char.dataUrl;

            return (
              <button
                key={char.id}
                type="button"
                onClick={() => handleChoose(char)}
                className={`p-3 rounded-2xl border text-left transition-all relative flex flex-col items-center text-center gap-2 group cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-950/60 border-indigo-500 ring-2 ring-indigo-500/50 shadow-lg shadow-indigo-950/50'
                    : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                }`}
              >
                {/* Active check badge */}
                {isSelected && (
                  <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[10px] shadow">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                )}

                {/* Avatar Icon */}
                <img
                  src={char.dataUrl}
                  alt={char.name}
                  className="w-12 h-12 rounded-xl object-cover ring-2 ring-slate-800 group-hover:scale-105 transition-transform shrink-0 shadow-md"
                />

                <div className="min-w-0 w-full">
                  <div className="font-bold text-xs text-white truncate">{char.name}</div>
                  <div className="text-[10px] text-slate-400 truncate">{char.role}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
