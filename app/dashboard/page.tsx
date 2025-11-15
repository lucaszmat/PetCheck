"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { PetsOverview } from "@/components/dashboard/pets-overview"
import { UpcomingAppointments } from "@/components/dashboard/upcoming-appointments"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { HelpButton } from "@/components/dashboard/help-button"
import { createClient } from "@/lib/supabase/client"

// Tipos básicos compatíveis com os componentes
interface Pet {
  id: string
  nome: string
  especie?: string
  raca?: string
  cor?: string
  sexo?: string
  castrado?: boolean
  foto_url?: string | null
}

interface Lembrete {
  id: string
  data_lembrete: string
  titulo: string
  tipo: string
  pets?: { nome: string }
}

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  const [pets, setPets] = useState<Pet[]>([])
  const [lembretes, setLembretes] = useState<Lembrete[]>([])

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login")
    }
  }, [isAuthenticated, isLoading, router])

  // Carregar pets e lembretes do tutor logado
  useEffect(() => {
    if (isLoading) return
    if (!isAuthenticated || !user) return

    const supabase = createClient()

    const carregarDados = async () => {
      try {
        const nowIso = new Date().toISOString()

        const [lembretesRes, petsRes] = await Promise.all([
          supabase
            .from("lembretes")
            .select("id, data_lembrete, titulo, tipo, pets ( nome )")
            .eq("tutor_id", (user as any).id)
            .gte("data_lembrete", nowIso)
            .order("data_lembrete", { ascending: true })
            .limit(2), // só os 2 próximos

          supabase
            .from("pets")
            .select("id, nome, especie, raca, cor, sexo, castrado, foto_url")
            .eq("tutor_id", (user as any).id)
            .order("nome", { ascending: true }),
        ])

        if (!lembretesRes.error && lembretesRes.data) {
          setLembretes(lembretesRes.data as Lembrete[])
        } else if (lembretesRes.error) {
          console.error("Erro ao buscar lembretes:", lembretesRes.error)
        }

        if (!petsRes.error && petsRes.data) {
          setPets(petsRes.data as Pet[])
        } else if (petsRes.error) {
          console.error("Erro ao buscar pets:", petsRes.error)
        }
      } catch (err) {
        console.error("Erro inesperado ao carregar dados do dashboard:", err)
      }
    }

    carregarDados()
  }, [isLoading, isAuthenticated, user])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-emerald-600">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-50 to-teal-50">
      <DashboardHeader user={user} profile={user} />

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8">
          {/* Seção de boas-vindas e resumo */}
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {/* Agora passando os pets reais */}
              <PetsOverview pets={pets} />
            </div>
            <div>
              <QuickActions />
            </div>
          </div>

          {/* Seção de compromissos e atividades */}
          <div className="grid lg:grid-cols-2 gap-6">
            <UpcomingAppointments
              consultas={[]}        // ainda sem consultas integradas
              lembretes={lembretes} // 2 próximos lembretes
            />
            <RecentActivity pets={pets} />
          </div>
        </div>
      </main>

      <HelpButton />
    </div>
  )
}
