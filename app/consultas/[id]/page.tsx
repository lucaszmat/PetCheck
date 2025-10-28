import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { ConsultaDetails } from "@/components/consultas/consulta-details"

interface ConsultaPageProps {
  params: Promise<{ id: string }>
}

export default async function ConsultaPage({ params }: ConsultaPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Buscar dados do usuário
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

  // Buscar consulta específica
  const { data: consulta } = await supabase
    .from("consultas")
    .select(`
      *,
      pets (nome, foto_url, especie, raca)
    `)
    .eq("id", id)
    .eq("tutor_id", data.user.id)
    .single()

  if (!consulta) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      <DashboardHeader user={data.user} profile={profile} />

      <main className="container mx-auto px-4 py-8">
        <ConsultaDetails consulta={consulta} />
      </main>
    </div>
  )
}
