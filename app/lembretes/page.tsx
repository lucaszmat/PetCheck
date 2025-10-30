"use client"

import { useEffect, useMemo, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { LembretesOverview } from "@/components/lembretes/lembretes-overview"
import { LembretesCalendar } from "@/components/lembretes/lembretes-calendar"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"

export default function LembretesPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const supabase = useMemo(() => createClient(), [])
  const [lembretes, setLembretes] = useState<any[] | null>(null)

  useEffect(() => {
    if (!isAuthenticated || !user) return
    ;(async () => {
      const { data } = await supabase
        .from("lembretes")
        .select(`*, pets (nome, foto_url)`).eq("tutor_id", (user as any).id)
        .order("data_lembrete", { ascending: true })
      setLembretes((data as any[]) || [])
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-emerald-800">Lembretes</h1>
            <p className="text-emerald-600 mt-2">
              {!lembretes || lembretes.length === 0
                ? "Nenhum lembrete criado"
                : `${lembretes.length} lembrete${lembretes.length > 1 ? "s" : ""} criado${lembretes.length > 1 ? "s" : ""}`}
            </p>
          </div>
          <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
            <Link href="/lembretes/novo">
              <PlusCircle className="h-4 w-4 mr-2" />
              Criar Lembrete
            </Link>
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <LembretesOverview lembretes={lembretes || []} />
          </div>
          <div>
            <LembretesCalendar lembretes={lembretes || []} />
          </div>
        </div>
      </main>
    </div>
  )
}
