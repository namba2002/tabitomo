"use client";

import { Item } from "@/types";
import { SeasonBadge } from "./SeasonBadge";
import { formatRelativeTime, formatDoneDate } from "@/lib/time";
import { Check, Trash2, Link, FileText, GripVertical } from "lucide-react";
import type { DraggableAttributes } from "@dnd-kit/core";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";

interface ItemCardProps {
  item: Item;
  onToggle: (id: string, isDone: boolean) => void;
  onDelete: (id: string) => void;
  onOpen: (item: Item) => void;
  disabled?: boolean;
  showHandle?: boolean;
  dragHandleListeners?: SyntheticListenerMap;
  dragHandleAttributes?: DraggableAttributes;
}

export function ItemCard({ item, onToggle, onDelete, onOpen, disabled, showHandle, dragHandleListeners, dragHandleAttributes }: ItemCardProps) {
  const isDone = item.is_done;

  return (
    <div className="group flex items-center gap-3 px-4 py-2 bg-white border-b border-gray-100">
      {/* チェックボックス — 完了トグル専用 */}
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
        {isDone && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
      </button>

      {/* タイトル行 — タップで詳細シートを開く */}
      <button
        onClick={() => onOpen(item)}
        disabled={disabled}
        className="flex-1 min-w-0 text-left rounded-lg px-1 -mx-1 hover:bg-blue-50 active:bg-blue-100 transition-colors disabled:opacity-50"
        aria-label="詳細を開く"
      >
        <div className="flex items-center gap-2 mb-0.5">
          <SeasonBadge season={item.season} />
          <span className={`text-sm font-medium truncate ${isDone ? "line-through text-gray-400" : "text-gray-800"}`}>
            {item.title}
          </span>
        </div>
        <p className="text-xs text-gray-400">
          {isDone && item.done_at
            ? `${formatDoneDate(item.done_at)}に達成`
            : formatRelativeTime(item.created_at)}
        </p>
      </button>

      {/* URLアイコン・メモアイコン */}
      <div className="flex-shrink-0 flex items-center gap-1">
        <button
          onClick={() => onOpen(item)}
          disabled={disabled}
          className={`p-1.5 rounded-lg transition-colors ${item.url ? "text-blue-400 hover:bg-blue-50 active:bg-blue-100" : "text-gray-200 hover:bg-gray-50 active:bg-gray-100"}`}
          aria-label={item.url ? "URLを編集" : "URLを追加"}
        >
          <Link className="w-4 h-4" />
        </button>
        <button
          onClick={() => onOpen(item)}
          disabled={disabled}
          className={`p-1.5 rounded-lg transition-colors ${item.memo ? "text-amber-400 hover:bg-amber-50 active:bg-amber-100" : "text-gray-200 hover:bg-gray-50 active:bg-gray-100"}`}
          aria-label={item.memo ? "メモを編集" : "メモを追加"}
        >
          <FileText className="w-4 h-4" />
        </button>
      </div>

      {/* 削除ボタン */}
      <button
        onClick={() => onDelete(item.id)}
        disabled={disabled}
        className="flex-shrink-0 p-2 rounded-lg text-gray-300 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 hover:text-red-400 hover:bg-red-50 active:text-red-400 active:bg-red-50 transition-all disabled:opacity-30"
        aria-label="削除"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      {/* ドラッグハンドル（右端） */}
      {showHandle && (
        <button
          className="flex-shrink-0 p-1.5 text-gray-300 cursor-grab active:cursor-grabbing"
          style={{ touchAction: "none", userSelect: "none" }}
          aria-label="並び替え"
          {...dragHandleListeners}
          {...dragHandleAttributes}
        >
          <GripVertical className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
