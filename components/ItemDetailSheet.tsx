"use client";

import { useEffect, useRef, useState } from "react";
import { Item } from "@/types";
import { SeasonBadge } from "./SeasonBadge";
import { Check, Link, FileText, ExternalLink, X } from "lucide-react";

interface ItemDetailSheetProps {
  item: Item | null;
  onClose: () => void;
  onUpdate: (id: string, patch: Partial<Pick<Item, "url" | "memo">>) => void;
}

export function ItemDetailSheet({ item, onClose, onUpdate }: ItemDetailSheetProps) {
  const [url, setUrl] = useState("");
  const [memo, setMemo] = useState("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isOpen = item !== null;

  useEffect(() => {
    if (item) {
      setUrl(item.url ?? "");
      setMemo(item.memo ?? "");
      setSaveStatus("saved");
    }
  }, [item?.id]);

  function triggerSave(field: "url" | "memo", value: string) {
    if (!item) return;
    setSaveStatus("saving");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      const patch = { [field]: value || null };
      try {
        const res = await fetch(`/api/items/${item.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patch),
        });
        if (!res.ok) throw new Error();
        onUpdate(item.id, patch as Partial<Pick<Item, "url" | "memo">>);
        setSaveStatus("saved");
      } catch {
        setSaveStatus("idle");
      }
    }, 600);
  }

  const isValidUrl = (v: string) => {
    try { new URL(v); return true; } catch { return false; }
  };

  return (
    <>
      {/* オーバーレイ */}
      <div
        className={`fixed inset-0 bg-black/30 z-40 transition-opacity duration-300 ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />

      {/* ボトムシート */}
      <div
        className={`fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-50 shadow-2xl transition-transform duration-300 ease-out max-h-[72%] flex flex-col ${isOpen ? "translate-y-0" : "translate-y-full"}`}
      >
        {/* ハンドルバー */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-9 h-1 rounded-full bg-gray-200" />
        </div>

        {/* ヘッダー */}
        <div className="flex items-start gap-3 px-4 pb-3 border-b border-gray-100 flex-shrink-0">
          <div
            className="flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center mt-0.5"
            style={{
              borderColor: item?.is_done ? "#10b981" : "#d1d5db",
              backgroundColor: item?.is_done ? "#10b981" : "transparent",
            }}
          >
            {item?.is_done && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-lg font-semibold leading-snug ${item?.is_done ? "line-through text-gray-400" : "text-gray-900"}`}>
              {item?.title}
            </p>
            {item && <div className="mt-1"><SeasonBadge season={item.season} /></div>}
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="閉じる"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* フィールド群 */}
        <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-4">
          {/* URL フィールド */}
          <div className="flex flex-col gap-1.5">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">
              <Link className="w-3 h-3" />
              場所のURL（Google マップなど）
            </label>
            {url && isValidUrl(url) ? (
              <div className="flex items-center gap-2 px-3 py-2.5 bg-blue-50 border border-blue-200 rounded-lg">
                <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <span className="flex-1 text-sm text-blue-600 truncate">{url}</span>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 p-1 text-blue-500 hover:text-blue-700"
                  onClick={(e) => e.stopPropagation()}
                  aria-label="マップを開く"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  onClick={() => { setUrl(""); triggerSave("url", ""); }}
                  className="flex-shrink-0 text-xs text-gray-400 hover:text-gray-600"
                >
                  変更
                </button>
              </div>
            ) : (
              <input
                type="url"
                value={url}
                onChange={(e) => { setUrl(e.target.value); setSaveStatus("saving"); }}
                onBlur={(e) => triggerSave("url", e.target.value)}
                placeholder="https://maps.google.com/..."
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 bg-gray-50 focus:bg-white focus:border-blue-400 focus:outline-none transition-colors"
              />
            )}
          </div>

          {/* メモフィールド */}
          <div className="flex flex-col gap-1.5">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">
              <FileText className="w-3 h-3" />
              メモ
            </label>
            <textarea
              value={memo}
              onChange={(e) => { setMemo(e.target.value); setSaveStatus("saving"); }}
              onBlur={(e) => triggerSave("memo", e.target.value)}
              placeholder="行きたい理由、おすすめ情報など..."
              rows={3}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 bg-gray-50 focus:bg-white focus:border-blue-400 focus:outline-none transition-colors resize-none leading-relaxed"
            />
          </div>
        </div>

        {/* 自動保存インジケーター */}
        <div className="flex justify-end items-center gap-1 px-4 py-2 flex-shrink-0 pb-safe">
          {saveStatus === "saving" && (
            <span className="text-xs text-gray-400">保存中…</span>
          )}
          {saveStatus === "saved" && (
            <>
              <Check className="w-3 h-3 text-emerald-500" strokeWidth={2.5} />
              <span className="text-xs text-emerald-500">自動保存済み</span>
            </>
          )}
        </div>
      </div>
    </>
  );
}
