// app/configuracoes/settings-form.tsx
'use client';

import * as React from 'react';

type Props = {
  initialLabel: string | null;
};

function buildTimeOptions(): string[] {
  const out: string[] = [];
  for (let h = 0; h < 24; h++) {
    out.push(`${String(h).padStart(2, '0')}:00`);
    out.push(`${String(h).padStart(2, '0')}:30`);
  }
  return out;
}

const OPTIONS = buildTimeOptions();

export default function SettingsForm({ initialLabel }: Props) {
  const [value, setValue] = React.useState<string>(initialLabel ?? '08:00');
  const [saving, setSaving] = React.useState(false);
  const [msg, setMsg] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch('/api/profile/notify-time', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: value }), // ex.: "08:30"
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Falha ao salvar');
      setMsg('Horário de notificação salvo com sucesso ✅');
    } catch (err: any) {
      setMsg(err.message || 'Erro inesperado');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <label className="block text-sm font-medium">Horário diário para receber WhatsApp</label>
      <select
        className="w-full border rounded-lg px-3 py-2"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      >
        {OPTIONS.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>

      <button
        type="submit"
        disabled={saving}
        className="inline-flex items-center gap-2 rounded-lg px-4 py-2 border bg-emerald-600 text-white disabled:opacity-60"
      >
        {saving ? 'Salvando…' : 'Salvar'}
      </button>

      {msg && <p className="text-sm">{msg}</p>}
    </form>
  );
}
