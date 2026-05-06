import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { is_done } = body as { is_done: boolean };
  const updateData = {
    is_done,
    done_at: is_done ? new Date().toISOString() : null,
  };

  const { data, error } = await supabase
    .from("items")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "更新に失敗しました" }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { error } = await supabase.from("items").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: "削除に失敗しました" }, { status: 500 });
  }

  return new NextResponse(null, { status: 204 });
}
