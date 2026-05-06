"use client";

import { useState } from "react";
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const MAX_LENGTH = 50;
  const trimmedTitle = title.trim();
  const isValid = trimmedTitle.length > 0 && trimmedTitle.length <= MAX_LENGTH;

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
      // 季節選択は維持
    } catch {
      setError("追加に失敗しました。もう一度お試しください。");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="bg-white border-t border-gray-200 px-4 py-4 safe-area-pb">
      {error && (
        <p className="text-xs text-red-500 mb-2">{error}</p>
      )}

      {/* 季節選択 */}
      <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
        {SEASONS.map((s) => {
          const { label, className } = SEASON_CONFIG[s];
          const isSelected = season === s;
          return (
            <button
              key={s}
              type="button"
              onClick={() => setSeason(s)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium border-2 transition-all ${
                isSelected
                  ? `${className} border-current`
                  : "bg-white border-gray-200 text-gray-500"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* 入力欄 */}
      <form onSubmit={handleSubmit} className="flex gap-2 items-center">
        <div className="flex-1 relative">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={MAX_LENGTH}
            placeholder="例）鎌倉でカフェ巡り、サウナ、キャンプなど"
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
