import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { PetsOverview } from "@/components/dashboard/pets-overview"
import { UpcomingAppointments } from "@/components/dashboard/upcoming-appointments"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { HelpButton } from "@/components/dashboard/help-button"

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Buscar dados do usuário
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

  // Buscar pets do usuário
  const { data: pets } = await supabase
    .from("pets")
    .select("*")
    .eq("tutor_id", data.user.id)
    .order("created_at", { ascending: false })

  // Buscar próximas consultas
  const { data: upcomingConsultas } = await supabase
    .from("consultas")
    .select(`
      *,
      pets (nome, foto_url)
    `)
    .eq("tutor_id", data.user.id)
    .eq("status", "agendada")
    .gte("data_consulta", new Date().toISOString())
    .order("data_consulta", { ascending: true })
    .limit(5)

  // Buscar lembretes ativos
  const { data: lembretes } = await supabase
    .from("lembretes")
    .select(`
      *,
      pets (nome)
    `)
    .eq("tutor_id", data.user.id)
    .eq("status", "ativo")
    .gte("data_lembrete", new Date().toISOString())
    .order("data_lembrete", { ascending: true })
    .limit(5)

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      <DashboardHeader user={data.user} profile={profile} />

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8">
          {/* Seção de boas-vindas e resumo */}
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <PetsOverview pets={pets || []} />
            </div>
            <div>
              <QuickActions />
            </div>
          </div>

          {/* Seção de compromissos e atividades */}
          <div className="grid lg:grid-cols-2 gap-6">
            <UpcomingAppointments consultas={upcomingConsultas || []} lembretes={lembretes || []} />
            <RecentActivity pets={pets || []} />
          </div>
        </div>
      </main>
      <HelpButton />
    </div>
  )
}
