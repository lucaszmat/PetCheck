"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ConfiguracoesPage() {
  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      
      {/* Título + Voltar */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-emerald-700">
          Configurações
        </h1>

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 
                     text-emerald-700 border-emerald-300 hover:bg-emerald-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>
      </div>

      {/* Conteúdo Temporário */}
      <p className="text-gray-700 text-lg">
        Funcionalidades em desenvolvimento!
      </p>

    </div>
  );
}
