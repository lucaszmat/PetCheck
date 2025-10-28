import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { PetForm } from "@/components/pets/pet-form"

export default async function NovoPetPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Buscar dados do usuário
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      <DashboardHeader user={data.user} profile={profile} />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-emerald-800">Adicionar Novo Pet</h1>
            <p className="text-emerald-600 mt-2">Preencha as informações do seu pet</p>
          </div>

          <PetForm />
        </div>
      </main>
    </div>
  )
}
