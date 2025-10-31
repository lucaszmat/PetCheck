// app/configuracoes/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// utils locais
function buildHalfHourLabels(): string[] {
  const out: string[] = [];
  for (let h = 0; h < 24; h++) {
    out.push(`${String(h).padStart(2, "0")}:00`);
    out.push(`${String(h).padStart(2, "0")}:30`);
  }
  return out;
}

function minutesToPrettyLabel(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m} min antes`;
  if (m === 0) return `${h} h antes`;
  return `${h} h ${m} min antes`;
}

function buildAdvanceOptions() {
  const opts: { value: number; label: string }[] = [];
  for (let m = 30; m <= 720; m += 30) {
    opts.push({ value: m, label: minutesToPrettyLabel(m) });
  }
  return opts;
}

export default function ConfiguracoesPage() {
  const timeOptions = useMemo(buildHalfHourLabels, []);
  const advOptions = useMemo(buildAdvanceOptions, []);

  // estados
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // horário diário
  const [dailyLabel, setDailyLabel] = useState<string>("08:00");

  // consultas (antecedência)
  const [consultaEnabled, setConsultaEnabled] = useState<boolean>(false);
  const [consultaMinutes, setConsultaMinutes] = useState<number>(60);

  // lembretes (antecedência)
  const [lembreteEnabled, setLembreteEnabled] = useState<boolean>(false);
  const [lembreteMinutes, setLembreteMinutes] = useState<number>(60);

  // carregar valores atuais
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const res = await fetch("/api/profile/notify-time", { method: "GET" });
        const txt = await res.text();
        const data = txt ? JSON.parse(txt) : {};
        if (!res.ok) throw new Error(data?.error || `Falha (${res.status})`);

        if (!isMounted) return;

        // horário diário
        if (data?.notify_label) setDailyLabel(data.notify_label);

        // consultas
        setConsultaEnabled(Boolean(data?.consulta_adv_enabled));
        if (typeof data?.consulta_adv_minutes === "number") {
          setConsultaMinutes(data.consulta_adv_minutes);
        }

        // lembretes
        setLembreteEnabled(Boolean(data?.lembrete_adv_enabled));
        if (typeof data?.lembrete_adv_minutes === "number") {
          setLembreteMinutes(data.lembrete_adv_minutes);
        }
      } catch (e: any) {
        setMsg(e?.message || "Não foi possível carregar suas configurações.");
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  async function handleSave() {
    setSaving(true);
    setMsg(null);
    try {
      const payload: any = {
        label: dailyLabel, // horário diário “HH:MM”
        consulta_adv_enabled: consultaEnabled,
        lembrete_adv_enabled: lembreteEnabled,
      };

      if (consultaEnabled) payload.consulta_adv_minutes = consultaMinutes;
      if (lembreteEnabled) payload.lembrete_adv_minutes = lembreteMinutes;

      const res = await fetch("/api/profile/notify-time", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const txt = await res.text();
      const data = txt ? JSON.parse(txt) : null;
      if (!res.ok) throw new Error(data?.error || `Falha (${res.status})`);

      setMsg("Configurações salvas com sucesso ✅");
    } catch (err: any) {
      setMsg(err?.message || "Erro ao salvar suas preferências.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      {/* Título + Voltar */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-emerald-700">Configurações</h1>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-emerald-700 border-emerald-300 hover:bg-emerald-50"
          aria-label="Voltar para o Dashboard"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>
      </div>

      {/* Horário diário */}
      <section className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Horário diário para receber notificações via WhatsApp
        </label>
        <select
          className="border rounded-lg px-3 py-2 w-full"
          value={dailyLabel}
          onChange={(e) => setDailyLabel(e.target.value)}
          disabled={loading}
        >
          {timeOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500">
          Esse horário define o disparo padrão diário. As opções de “antecedência” abaixo são adicionais para eventos específicos.
        </p>
      </section>

      {/* Consultas */}
      <section className="space-y-2">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            className="h-4 w-4"
            checked={consultaEnabled}
            onChange={(e) => setConsultaEnabled(e.target.checked)}
            disabled={loading}
          />
          <span className="text-sm font-medium text-gray-700">
            Consultas — Quero receber notificação com antecedência
          </span>
        </label>

        {consultaEnabled && (
          <select
            className="border rounded-lg px-3 py-2 w-full"
            value={consultaMinutes}
            onChange={(e) => setConsultaMinutes(Number(e.target.value))}
            disabled={loading}
          >
            {advOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        )}
      </section>

      {/* Lembretes */}
      <section className="space-y-2">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            className="h-4 w-4"
            checked={lembreteEnabled}
            onChange={(e) => setLembreteEnabled(e.target.checked)}
            disabled={loading}
          />
          <span className="text-sm font-medium text-gray-700">
            Lembretes — Quero receber notificação com antecedência
          </span>
        </label>

        {lembreteEnabled && (
          <select
            className="border rounded-lg px-3 py-2 w-full"
            value={lembreteMinutes}
            onChange={(e) => setLembreteMinutes(Number(e.target.value))}
            disabled={loading}
          >
            {advOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        )}
      </section>

      {/* Ações */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="bg-emerald-600 text-white rounded-lg px-4 py-2 hover:bg-emerald-700 disabled:opacity-60"
        >
          {saving ? "Salvando…" : "Salvar configurações"}
        </button>
        {msg && <span className="text-sm">{msg}</span>}
      </div>
    </div>
  );
}
