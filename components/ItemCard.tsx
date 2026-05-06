"use client";

import { Item } from "@/types";
import { SeasonBadge } from "./SeasonBadge";
import { formatRelativeTime, formatDoneDate } from "@/lib/time";

interface ItemCardProps {
  item: Item;
  onToggle: (id: string, isDone: boolean) => void;
  onDelete: (id: string) => void;
  disabled?: boolean;
}

export function ItemCard({ item, onToggle, onDelete, disabled }: ItemCardProps) {
  const isDone = item.is_done;

  return (
    <div className="group flex items-center gap-3 px-4 py-2 bg-white rounded-xl border border-gray-100 shadow-sm">
      <button
        onClick={() => onToggle(item.id, !isDone)}
        disabled={disabled}
        className="flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors disabled:opacity-50"
        style={{
          borderColor: isDone ? "#10b981" : "#d1d5db",
          backgroundColor: isDone ? "#10b981" : "transparent",
        }}
        aria-label={isDone ? "未完了に戻す" : "完了にする"}
      >
        {isDone && (
          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <SeasonBadge season={item.season} />
          <span
            className={`text-sm font-medium truncate ${isDone ? "line-through text-gray-400" : "text-gray-800"}`}
          >
            {item.title}
          </span>
        </div>
        <p className="text-xs text-gray-400">
          {isDone && item.done_at
            ? `${formatDoneDate(item.done_at)}に達成`
            : formatRelativeTime(item.created_at)}
        </p>
      </div>

      <button
        onClick={() => onDelete(item.id)}
        disabled={disabled}
        className="flex-shrink-0 p-2 rounded-lg text-gray-300 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 hover:text-red-400 hover:bg-red-50 active:text-red-400 active:bg-red-50 transition-all disabled:opacity-30"
        aria-label="削除"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
        </svg>
      </button>
    </div>
  );
}
