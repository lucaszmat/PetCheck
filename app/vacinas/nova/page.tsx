import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { VacinaForm } from "@/components/vacinas/vacina-form"

export default async function NovaVacinaPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Buscar dados do usuário
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

  // Buscar pets do usuário
  const { data: pets } = await supabase.from("pets").select("*").eq("tutor_id", data.user.id)

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      <DashboardHeader user={data.user} profile={profile} />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-emerald-800">Registrar Nova Vacina</h1>
            <p className="text-emerald-600 mt-2">Adicione uma nova vacina ao histórico do seu pet</p>
          </div>

          <VacinaForm pets={pets || []} />
        </div>
      </main>
    </div>
  )
}
