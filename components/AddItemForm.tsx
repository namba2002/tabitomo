"use client";

import { useState, useRef } from "react";
import { Item, Season } from "@/types";
import { SEASON_CONFIG } from "./SeasonBadge";

interface AddItemFormProps {
  roomId: string;
  onAdd: (item: Item) => void;
}

const SEASONS: Season[] = ["spring", "summer", "autumn", "winter", "undecided"];

export function AddItemForm({ roomId, onAdd }: AddItemFormProps) {
  const [title, setTitle] = useState("");
  const [season, setSeason] = useState<Season>("undecided");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const MAX_LENGTH = 50;
  const trimmedTitle = title.trim();
  const isValid = trimmedTitle.length > 0 && trimmedTitle.length <= MAX_LENGTH;

  function handleExpand() {
    setIsExpanded(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function handleBlur() {
    if (!title) {
      setIsExpanded(false);
      setSeason("undecided");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ room_id: roomId, title: trimmedTitle, season }),
      });

      if (!res.ok) throw new Error();
      const newItem = await res.json();
      onAdd(newItem);
      setTitle("");
      setSeason("undecided");
      setIsExpanded(false);
    } catch {
      setError("追加に失敗しました。もう一度お試しください。");
    } finally {
      setIsLoading(false);
    }
  }

  // 折りたたみ状態
  if (!isExpanded) {
    return (
      <div className="bg-white border-t border-gray-200">
        <button
          onClick={handleExpand}
          className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
        >
          <span className="text-blue-500 text-xl font-light leading-none">+</span>
          <span className="text-gray-400 text-sm">行きたい場所を追加</span>
        </button>
      </div>
    );
  }

  // 展開状態
  return (
    <div className="bg-white border-t border-gray-200">
      {error && <p className="text-xs text-red-500 px-4 pt-2">{error}</p>}

      {/* 季節選択 */}
      <div className="flex gap-2 px-4 pt-3 overflow-x-auto pb-1">
        {SEASONS.map((s) => {
          const { label, className } = SEASON_CONFIG[s];
          const isSelected = season === s;
          return (
            <button
              key={s}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setSeason(s)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium border-2 transition-all ${
                isSelected ? `${className} border-current` : "bg-white border-gray-200 text-gray-500"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* 入力欄 */}
      <form onSubmit={handleSubmit} className="flex gap-2 items-center px-4 py-3">
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleBlur}
            maxLength={MAX_LENGTH}
            placeholder="例）鎌倉でカフェ巡り、サウナなど"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-base focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-gray-50"
          />
          {title.length > 0 && (
            <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs ${title.length > MAX_LENGTH ? "text-red-400" : "text-gray-400"}`}>
              {title.length}/{MAX_LENGTH}
            </span>
          )}
        </div>
        <button
          type="submit"
          disabled={!isValid || isLoading}
          className="flex-shrink-0 px-4 py-3 bg-blue-500 text-white rounded-xl text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors active:scale-95"
        >
          {isLoading ? "追加中..." : "追加"}
        </button>
      </form>
    </div>
  );
}
