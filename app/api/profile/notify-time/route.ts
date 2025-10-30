// app/api/profile/notify-time/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

function labelToMinutes(label: string): number | null {
  const m = /^(\d{2}):(\d{2})$/.exec(label || "");
  if (!m) return null;
  const hh = Number(m[1]);
  const mm = Number(m[2]);
  if (hh < 0 || hh > 23) return null;
  if (mm !== 0 && mm !== 30) return null;
  return hh * 60 + mm;
}

function getSupabase() {
  const cookieStore = cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("Env SUPABASE ausente (NEXT_PUBLIC_SUPABASE_URL/ANON_KEY)");
  }
  return createServerClient(url, key, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set() {},
      remove() {},
    },
  });
}

export async function POST(req: Request) {
  try {
    const supabase = getSupabase();

    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = (await req.json().catch(() => ({}))) as { label?: string };
    const minutes = labelToMinutes(body?.label || "");

    if (minutes == null) {
      return NextResponse.json({ error: "Horário inválido" }, { status: 400 });
    }

    const { error: upsertErr } = await supabase
      .from("profiles")
      .upsert({ id: user.id, notify_minutes: minutes }, { onConflict: "id" });

    if (upsertErr) {
      return NextResponse.json({ error: upsertErr.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, notify_minutes: minutes });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Erro inesperado" }, { status: 500 });
  }
}
