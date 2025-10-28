import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { ConsultasCalendar } from "@/components/consultas/consultas-calendar"
import { ConsultasList } from "@/components/consultas/consultas-list"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import Link from "next/link"

export default async function ConsultasPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Buscar dados do usuário
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

  // Buscar pets do usuário
  const { data: pets } = await supabase.from("pets").select("*").eq("tutor_id", data.user.id)

  // Buscar consultas do usuário
  const { data: consultas } = await supabase
    .from("consultas")
    .select(`
      *,
      pets (nome, foto_url)
    `)
    .eq("tutor_id", data.user.id)
    .order("data_consulta", { ascending: true })

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      <DashboardHeader user={data.user} profile={profile} />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-emerald-800">Consultas</h1>
            <p className="text-emerald-600 mt-2">
              {consultas?.length === 0
                ? "Nenhuma consulta agendada"
                : `${consultas?.length} consulta${consultas?.length && consultas.length > 1 ? "s" : ""} agendada${consultas?.length && consultas.length > 1 ? "s" : ""}`}
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
