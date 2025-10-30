"use client"

import { useEffect, useMemo, useState } from "react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { ConsultasCalendar } from "@/components/consultas/consultas-calendar"
import { ConsultasList } from "@/components/consultas/consultas-list"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { createClient } from "@/lib/supabase/client"

export default function ConsultasPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const [consultas, setConsultas] = useState<any[] | null>(null)
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    if (!isAuthenticated || !user?.id) return
    ;(async () => {
      const { data } = await supabase
        .from("consultas")
        .select(`*, pets (nome, foto_url)`) 
        .eq("tutor_id", (user as any).id)
        .order("data_consulta", { ascending: true })
      setConsultas((data as any[]) || [])
    })()
  }, [isAuthenticated, user?.id, supabase])

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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-emerald-800">Consultas</h1>
            <p className="text-emerald-600 mt-2">
              {!consultas || consultas.length === 0
                ? "Nenhuma consulta agendada"
                : `${consultas.length} consulta${consultas.length > 1 ? "s" : ""} agendada${consultas.length > 1 ? "s" : ""}`}
            </p>
          </div>
          <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
            <Link href="/consultas/nova">
              <PlusCircle className="h-4 w-4 mr-2" />
              Agendar Consulta
            </Link>
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <ConsultasCalendar consultas={consultas || []} />
          </div>
          <div>
            <ConsultasList consultas={consultas || []} />
          </div>
        </div>
      </main>
    </div>
  )
}
