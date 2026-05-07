"use client";

import { useRef, useState } from "react";
import { Item, Season } from "@/types";
import { ChevronRight } from "lucide-react";
import { ItemCard } from "./ItemCard";
import { AddItemForm } from "./AddItemForm";
import { ItemDetailSheet } from "./ItemDetailSheet";
import { SEASON_CONFIG } from "./SeasonBadge";
import { supabaseBrowser } from "@/lib/supabase-browser";
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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

function SortableItemCard(props: {
  item: Item;
  onToggle: (id: string, isDone: boolean) => void;
  onDelete: (id: string) => void;
  onOpen: (item: Item) => void;
  disabled?: boolean;
  showHandle: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: props.item.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: "relative" as const,
    zIndex: isDragging ? 1 : 0,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <ItemCard
        item={props.item}
        onToggle={props.onToggle}
        onDelete={props.onDelete}
        onOpen={props.onOpen}
        disabled={props.disabled}
        showHandle={props.showHandle}
        dragHandleListeners={listeners}
        dragHandleAttributes={attributes}
      />
    </div>
  );
}

export function RoomView({ initialItems, roomId }: RoomViewProps) {
  const [items, setItems] = useState<Item[]>(initialItems);
  const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set());
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [toggleError, setToggleError] = useState<string | null>(null);
  const [doneExpanded, setDoneExpanded] = useState(true);
  const [seasonFilter, setSeasonFilter] = useState<Season | "all">("all");
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [isDraggingList, setIsDraggingList] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    // touchstart で preventDefault() 済みのため、TouchSensor がタッチドラッグを担当する
    useSensor(TouchSensor, { activationConstraint: { delay: 0, tolerance: 5 } })
  );

  const filtered = seasonFilter === "all" ? items : items.filter((i) => i.season === seasonFilter);

  const todoItems = filtered
    .filter((i) => !i.is_done)
    .sort((a, b) => a.sort_order - b.sort_order || new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const doneItems = filtered
    .filter((i) => i.is_done)
    .sort((a, b) => new Date(b.done_at!).getTime() - new Date(a.done_at!).getTime());

  const showDragHandles = seasonFilter === "all";

  function handleOptimisticAdd(tempItem: Item) {
    setItems((prev) => [tempItem, ...prev]);
  }

  function handleConfirm(tempId: string, realItem: Item) {
    setItems((prev) => prev.map((i) => (i.id === tempId ? realItem : i)));
  }

  function handleRollback(tempId: string) {
    setItems((prev) => prev.filter((i) => i.id !== tempId));
  }

  async function handleDragEnd(event: DragEndEvent) {
    setIsDraggingList(false);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeIndex = todoItems.findIndex((i) => i.id === active.id);
    const overIndex = todoItems.findIndex((i) => i.id === over.id);
    if (activeIndex === -1 || overIndex === -1) return;

    const reordered = [...todoItems];
    const [moved] = reordered.splice(activeIndex, 1);
    reordered.splice(overIndex, 0, moved);

    const updates = reordered.map((item, index) => ({ ...item, sort_order: index }));
    setItems((prev) =>
      prev.map((item) => {
        const updated = updates.find((u) => u.id === item.id);
        return updated ? updated : item;
      })
    );

    await Promise.all(
      updates.map(({ id, sort_order }) =>
        supabaseBrowser.from("items").update({ sort_order }).eq("id", id)
      )
    );
  }

  function handleDetailUpdate(id: string, patch: Partial<Pick<Item, "url" | "memo" | "season">>) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
    setSelectedItem((prev) => (prev?.id === id ? { ...prev, ...patch } : prev));
  }

  async function handleDelete(id: string) {
    if (deletingIds.has(id)) return;
    setDeletingIds((prev) => new Set(prev).add(id));
    setItems((prev) => prev.filter((item) => item.id !== id));

    try {
      const { error } = await supabaseBrowser.from("items").delete().eq("id", id);
      if (error) throw new Error();
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
      const doneAt = isDone ? new Date().toISOString() : null;
      const { data: updated, error } = await supabaseBrowser
        .from("items")
        .update({ is_done: isDone, done_at: doneAt })
        .eq("id", id)
        .select()
        .single();
      if (error) throw new Error();
      setItems((prev) => prev.map((item) => (item.id === id ? (updated as Item) : item)));
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
    <div className="flex flex-col flex-1 min-h-0 relative">
      <ItemDetailSheet
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onUpdate={handleDetailUpdate}
      />
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

      <div ref={scrollRef} className={`flex-1 px-4 py-4 pb-20 overscroll-none ${selectedItem || isDraggingList ? "overflow-hidden" : "overflow-y-auto"}`}>
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
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={() => setIsDraggingList(true)}
              onDragEnd={handleDragEnd}
              onDragCancel={() => setIsDraggingList(false)}
            >
              <SortableContext items={todoItems.map((i) => i.id)} strategy={verticalListSortingStrategy}>
                <div className="flex flex-col">
                  {todoItems.map((item) => (
                    <SortableItemCard
                      key={item.id}
                      item={item}
                      onToggle={handleToggle}
                      onDelete={handleDelete}
                      onOpen={setSelectedItem}
                      disabled={togglingIds.has(item.id) || deletingIds.has(item.id)}
                      showHandle={showDragHandles}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
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
              <div className="flex flex-col">
                {doneItems.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    onToggle={handleToggle}
                    onDelete={handleDelete}
                    onOpen={setSelectedItem}
                    disabled={togglingIds.has(item.id) || deletingIds.has(item.id)}
                  />
                ))}
              </div>
            )}
          </section>
        )}
      </div>

      {/* 下部固定入力エリア（absolute でフレックスレイアウトから外す） */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <AddItemForm
          roomId={roomId}
          onOptimisticAdd={handleOptimisticAdd}
          onConfirm={handleConfirm}
          onRollback={handleRollback}
          onAfterSubmit={() => {
            if (scrollRef.current) scrollRef.current.scrollTop = 0;
          }}
        />
      </div>
    </div>
  );
}
