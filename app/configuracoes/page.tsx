// app/configuracoes/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ConfiguracoesPage() {
  const [selectedTime, setSelectedTime] = useState("08:00");

  const horarios = Array.from({ length: 48 }, (_, i) => {
    const h = Math.floor(i / 2);
    const m = i % 2 === 0 ? "00" : "30";
    return `${String(h).padStart(2, "0")}:${m}`;
  });

  const handleSave = async () => {
    try {
      const res = await fetch("/api/profile/notify-time", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: selectedTime }),
      });

      // parse seguro
      const txt = await res.text();
      const data = txt ? JSON.parse(txt) : null;

      if (!res.ok) {
        throw new Error(data?.error || `Falha (${res.status})`);
      }

      alert("Horário salvo com sucesso!");
    } catch (err: any) {
      alert(err.message || "Erro inesperado");
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      {/* Linha de título + Voltar */}
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

      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Escolha o horário diário para receber notificações via WhatsApp:
        </label>

        <select
          className="border rounded-lg px-3 py-2 w-full"
          value={selectedTime}
          onChange={(e) => setSelectedTime(e.target.value)}
        >
          {horarios.map((h) => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </select>

        <button
          onClick={handleSave}
          className="bg-emerald-600 text-white rounded-lg px-4 py-2 hover:bg-emerald-700"
        >
          Salvar
        </button>
      </div>
    </div>
  );
}
