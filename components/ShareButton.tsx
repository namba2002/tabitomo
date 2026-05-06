"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";

interface ShareButtonProps {
  roomName: string;
}

export function ShareButton({ roomName }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title: `${roomName} | tabitomo`, url });
      } catch {
        // キャンセルは無視
      }
      return;
    }

    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-blue-500 hover:bg-blue-50 active:bg-blue-100 transition-colors"
    >
      {copied ? (
        <><Check className="w-4 h-4" />コピーしました</>
      ) : (
        <><Share2 className="w-4 h-4" />共有</>
      )}
    </button>
  );
}
