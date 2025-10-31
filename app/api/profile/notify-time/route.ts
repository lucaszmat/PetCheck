// app/api/profile/notify-time/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/** ----- Utilitários de conversão/validação ----- */
function minutesToLabel(m: number | null | undefined) {
  if (m == null) return null;
  const hh = String(Math.floor(m / 60)).padStart(2, "0");
  const mm = String(m % 60).padStart(2, "0");
  return `${hh}:${mm}`;
}

function labelToMinutes(label: string | undefined): number | null {
  if (!label) return null;
  const m = /^(\d{2}):(\d{2})$/.exec(label);
  if (!m) return null;
  const hh = Number(m[1]);
  const mm = Number(m[2]);
  if (hh < 0 || hh > 23) return null;
  if (mm !== 0 && mm !== 30) return null;
  return hh * 60 + mm;
}

function isValidAdvMinutes(v: unknown) {
  if (v == null) return true; // permite null quando desabilitado
  const n = Number(v);
  return Number.isInteger(n) && n >= 30 && n <= 720 && n % 30 === 0;
}

function getSupabase() {
  const cookieStore = cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
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

/** ----- GET: retorna preferências atuais do perfil ----- */
export async function GET() {
  try {
    const supabase = getSupabase();
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select(
        "notify_minutes, consulta_adv_enabled, consulta_adv_minutes, lembrete_adv_enabled, lembrete_adv_minutes"
      )
      .eq("id", user.id)
      .single();

    if (error) {
      // Se ainda não existe linha do perfil, retorna defaults "vazios"
      return NextResponse.json({
        notify_minutes: null,
        notify_label: null,
        consulta_adv_enabled: false,
        consulta_adv_minutes: null,
        lembrete_adv_enabled: false,
        lembrete_adv_minutes: null,
      });
    }

    return NextResponse.json({
      notify_minutes: profile?.notify_minutes ?? null,
      notify_label: minutesToLabel(profile?.notify_minutes),
      consulta_adv_enabled: !!profile?.consulta_adv_enabled,
      consulta_adv_minutes: profile?.consulta_adv_minutes ?? null,
      lembrete_adv_enabled: !!profile?.lembrete_adv_enabled,
      lembrete_adv_minutes: profile?.lembrete_adv_minutes ?? null,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Erro inesperado" }, { status: 500 });
  }
}

/** ----- POST: atualiza parcialmente as preferências ----- */
/**
 * Aceita tanto:
 * {
 *   label?: "HH:MM",
 *   consulta_adv_enabled?: boolean,
 *   consulta_adv_minutes?: number, // 30..720 step 30
 *   lembrete_adv_enabled?: boolean,
 *   lembrete_adv_minutes?: number
 * }
 *
 * ...quanto um payload aninhado:
 * {
 *   label?: "HH:MM",
 *   consulta?: { enabled?: boolean, minutes?: number },
 *   lembrete?: { enabled?: boolean, minutes?: number }
 * }
 */
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

    const body = (await req.json().catch(() => ({}))) as any;

    // 1) Buscar estado atual para atualização parcial
    const { data: current } = await supabase
      .from("profiles")
      .select(
        "notify_minutes, consulta_adv_enabled, consulta_adv_minutes, lembrete_adv_enabled, lembrete_adv_minutes"
      )
      .eq("id", user.id)
      .maybeSingle();

    // 2) Normalizar payload (aceita plano e aninhado)
    const notifyMinutes = body.label !== undefined ? labelToMinutes(body.label) : current?.notify_minutes ?? null;
    if (body.label !== undefined && notifyMinutes == null) {
      return NextResponse.json({ error: "Horário inválido" }, { status: 400 });
    }

    const consulta_enabled =
      body.consulta_adv_enabled ??
      body?.consulta?.enabled ??
      (current?.consulta_adv_enabled ?? false);

    const consulta_minutes_raw =
      body.consulta_adv_minutes ??
      body?.consulta?.minutes ??
      (current?.consulta_adv_minutes ?? null);

    const lembrete_enabled =
      body.lembrete_adv_enabled ??
      body?.lembrete?.enabled ??
      (current?.lembrete_adv_enabled ?? false);

    const lembrete_minutes_raw =
      body.lembrete_adv_minutes ??
      body?.lembrete?.minutes ??
      (current?.lembrete_adv_minutes ?? null);

    // 3) Validar minutes somente quando enabled
    const consulta_minutes = consulta_enabled ? consulta_minutes_raw : null;
    const lembrete_minutes = lembrete_enabled ? lembrete_minutes_raw : null;

    if (consulta_enabled && !isValidAdvMinutes(consulta_minutes)) {
      return NextResponse.json({ error: "Minutos de antecedência (consultas) inválidos" }, { status: 400 });
    }
    if (lembrete_enabled && !isValidAdvMinutes(lembrete_minutes)) {
      return NextResponse.json({ error: "Minutos de antecedência (lembretes) inválidos" }, { status: 400 });
    }

    // 4) Decidir insert/update
    const payload: Record<string, any> = {
      id: user.id,
    };
    if (body.label !== undefined) payload.notify_minutes = notifyMinutes;
    if (body.consulta_adv_enabled !== undefined || body?.consulta?.enabled !== undefined)
      payload.consulta_adv_enabled = consulta_enabled;
    if (
      body.consulta_adv_minutes !== undefined ||
      body?.consulta?.minutes !== undefined ||
      (!consulta_enabled && current?.consulta_adv_minutes !== null)
    )
      payload.consulta_adv_minutes = consulta_minutes;

    if (body.lembrete_adv_enabled !== undefined || body?.lembrete?.enabled !== undefined)
      payload.lembrete_adv_enabled = lembrete_enabled;
    if (
      body.lembrete_adv_minutes !== undefined ||
      body?.lembrete?.minutes !== undefined ||
      (!lembrete_enabled && current?.lembrete_adv_minutes !== null)
    )
      payload.lembrete_adv_minutes = lembrete_minutes;

    let resp;
    if (current) {
      resp = await supabase.from("profiles").update(payload).eq("id", user.id).select().single();
    } else {
      // cria a linha de perfil com os campos enviados
      resp = await supabase.from("profiles").insert(payload).select().single();
    }

    if (resp.error) {
      return NextResponse.json({ error: resp.error.message }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      data: {
        notify_minutes: resp.data.notify_minutes ?? null,
        notify_label: minutesToLabel(resp.data.notify_minutes),
        consulta_adv_enabled: !!resp.data.consulta_adv_enabled,
        consulta_adv_minutes: resp.data.consulta_adv_minutes ?? null,
        lembrete_adv_enabled: !!resp.data.lembrete_adv_enabled,
        lembrete_adv_minutes: resp.data.lembrete_adv_minutes ?? null,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Erro inesperado" }, { status: 500 });
  }
}
