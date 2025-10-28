import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { PetDetails } from "@/components/pets/pet-details"

interface PetPageProps {
  params: Promise<{ id: string }>
}

export default async function PetPage({ params }: PetPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Buscar dados do usuário
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

  // Buscar pet específico
  const { data: pet } = await supabase.from("pets").select("*").eq("id", id).eq("tutor_id", data.user.id).single()

  if (!pet) {
    notFound()
  }

  // Buscar consultas do pet
  const { data: consultas } = await supabase
    .from("consultas")
    .select("*")
    .eq("pet_id", id)
    .order("data_consulta", { ascending: false })

  // Buscar vacinas do pet
  const { data: vacinas } = await supabase
    .from("vacinas")
    .select("*")
    .eq("pet_id", id)
    .order("data_aplicacao", { ascending: false })

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      <DashboardHeader user={data.user} profile={profile} />

      <main className="container mx-auto px-4 py-8">
        <PetDetails pet={pet} consultas={consultas || []} vacinas={vacinas || []} />
      </main>
    </div>
  )
}
