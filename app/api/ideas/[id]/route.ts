import { NextRequest, NextResponse } from "next/server";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    return NextResponse.json({ message: "Supabase admin access is not configured yet." }, { status: 500 });
  }

  const accessToken = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!accessToken) {
    return NextResponse.json({ message: "Missing auth session." }, { status: 401 });
  }

  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser(accessToken);

  if (authError || !user) {
    return NextResponse.json({ message: "Unauthorized delete request." }, { status: 401 });
  }

  const { id } = await params;

  if (!id) {
    return NextResponse.json({ message: "Missing idea ID." }, { status: 400 });
  }

  const { error, count } = await supabase
    .from("ideas")
    .delete({ count: "exact" })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  if (!count) {
    return NextResponse.json({ message: "That generation could not be found." }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
