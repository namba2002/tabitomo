"use client";

import { useState } from "react";
import { Item, Season } from "@/types";
import { ChevronRight } from "lucide-react";
import { ItemCard } from "./ItemCard";
import { AddItemForm } from "./AddItemForm";
import { SEASON_CONFIG } from "./SeasonBadge";

const FILTER_SEASONS: { value: Season | "all"; label: string }[] = [
  { value: "all", label: "すべて" },
  { value: "spring", label: "春" },
  { value: "summer", label: "夏" },
  { value: "autumn", label: "秋" },
  { value: "winter", label: "冬" },
  { value: "undecided", label: "未定" },
];

interface RoomViewProps {
  initialItems: Item[];
  roomId: string;
}

export function RoomView({ initialItems, roomId }: RoomViewProps) {
  const [items, setItems] = useState<Item[]>(initialItems);
  const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set());
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [toggleError, setToggleError] = useState<string | null>(null);
  const [doneExpanded, setDoneExpanded] = useState(true);
  const [seasonFilter, setSeasonFilter] = useState<Season | "all">("all");

  const filtered = seasonFilter === "all" ? items : items.filter((i) => i.season === seasonFilter);

  const todoItems = filtered
    .filter((i) => !i.is_done)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const doneItems = filtered
    .filter((i) => i.is_done)
    .sort((a, b) => new Date(b.done_at!).getTime() - new Date(a.done_at!).getTime());

  function handleAdd(newItem: Item) {
    setItems((prev) => [newItem, ...prev]);
  }

  async function handleDelete(id: string) {
    if (deletingIds.has(id)) return;
    setDeletingIds((prev) => new Set(prev).add(id));
    setItems((prev) => prev.filter((item) => item.id !== id));

    try {
      const res = await fetch(`/api/items/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
    } catch {
      setItems((prev) => {
        const original = initialItems.find((i) => i.id === id);
        return original ? [...prev, original] : prev;
      });
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }

  async function handleToggle(id: string, isDone: boolean) {
    if (togglingIds.has(id)) return;
    setToggleError(null);

    setTogglingIds((prev) => new Set(prev).add(id));
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, is_done: isDone, done_at: isDone ? new Date().toISOString() : null }
          : item
      )
    );

    try {
      const res = await fetch(`/api/items/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_done: isDone }),
      });

      if (!res.ok) throw new Error();
      const updated = await res.json();
      setItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
    } catch {
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, is_done: !isDone, done_at: null } : item
        )
      );
      setToggleError("更新に失敗しました。もう一度お試しください。");
    } finally {
      setTogglingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* 季節フィルター */}
      <div className="flex gap-2 px-4 py-2 overflow-x-auto border-b border-gray-100">
        {FILTER_SEASONS.map(({ value, label }) => {
          const isSelected = seasonFilter === value;
          const colorClass = value !== "all" ? SEASON_CONFIG[value].className : "bg-blue-100 text-blue-600";
          return (
            <button
              key={value}
              onClick={() => setSeasonFilter(value)}
              className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                isSelected ? colorClass : "bg-gray-100 text-gray-500"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {toggleError && (
          <div className="mb-3 px-3 py-2 bg-red-50 text-red-600 text-sm rounded-lg">
            {toggleError}
          </div>
        )}

        {/* 行きたい場所 */}
        <section className="mb-6">
          <h2 className="text-sm font-semibold text-gray-500 mb-3 flex items-center gap-2">
            行きたい場所
            <span className="bg-blue-100 text-blue-600 text-xs font-bold px-2 py-0.5 rounded-full">
              {todoItems.length}
            </span>
          </h2>
          {todoItems.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">
              行きたい場所を追加してみましょう！
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {todoItems.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                  disabled={togglingIds.has(item.id) || deletingIds.has(item.id)}
                />
              ))}
            </div>
          )}
        </section>

        {/* 行った場所（折りたたみ） */}
        {doneItems.length > 0 && (
          <section className="mb-4">
            <button
              onClick={() => setDoneExpanded((v) => !v)}
              className="flex items-center gap-2 text-sm font-semibold text-gray-500 mb-3 w-full text-left"
            >
              <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${doneExpanded ? "rotate-90" : ""}`} />
              行った場所
              <span className="bg-emerald-100 text-emerald-600 text-xs font-bold px-2 py-0.5 rounded-full">
                {doneItems.length}
              </span>
            </button>
            {doneExpanded && (
              <div className="flex flex-col gap-2">
                {doneItems.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    onToggle={handleToggle}
                    onDelete={handleDelete}
                    disabled={togglingIds.has(item.id) || deletingIds.has(item.id)}
                  />
                ))}
              </div>
            )}
          </section>
        )}
      </div>

      {/* 下部固定入力エリア */}
      <AddItemForm roomId={roomId} onAdd={handleAdd} />
    </div>
  );
}
