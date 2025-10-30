"use client"

import { useEffect, useMemo, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { ConsultaForm } from "@/components/consultas/consulta-form"
import { useAuth } from "@/hooks/use-auth"

export default function NovaConsultaPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const supabase = useMemo(() => createClient(), [])
  const [pets, setPets] = useState<any[]>([])

  useEffect(() => {
    if (!isAuthenticated || !user) return
    ;(async () => {
      const { data } = await supabase
        .from("pets")
        .select("id, nome, especie")
        .eq("tutor_id", (user as any).id)
        .order("created_at", { ascending: false })
      setPets((data as any[]) || [])
    })()
  }, [isAuthenticated, user?.id])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600" />
      </div>
    )
  }

  if (!isAuthenticated || !user) return null

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-50 to-teal-50">
      <DashboardHeader user={user as any} profile={user as any} />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-emerald-800">Agendar Nova Consulta</h1>
            <p className="text-emerald-600 mt-2">Preencha as informações da consulta veterinária</p>
          </div>

          <ConsultaForm pets={pets} />
        </div>
      </main>
    </div>
  )
}
