import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { nameToSlug } from "@/lib/slug";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const name = body.name?.trim() || "";

  if (!name || name.length > 50) {
    return NextResponse.json({ error: "グループ名が無効です" }, { status: 400 });
  }

  const baseSlug = nameToSlug(name);

  // 同名slugが存在する場合は末尾に数字を付加
  let slug = baseSlug;
  let suffix = 2;

  while (true) {
    const { data: existing } = await supabase
      .from("rooms")
      .select("id")
      .eq("slug", slug)
      .single();

    if (!existing) break;
    slug = `${baseSlug}-${suffix}`;
    suffix++;
    if (suffix > 99) {
      return NextResponse.json({ error: "同名のグループが多すぎます" }, { status: 409 });
    }
  }

  const { data, error } = await supabase
    .from("rooms")
    .insert({ slug, name })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "ルームの作成に失敗しました" }, { status: 500 });
  }

  return NextResponse.json({ slug: data.slug, name: data.name }, { status: 201 });
}
