import { Suspense } from "react"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { MedicamentosOverview } from "@/components/medicamentos/medicamentos-overview"

export default async function MedicamentosPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: pets } = await supabase.from("pets").select("id, nome, especie").eq("tutor_id", user.id).order("nome")

  const { data: medicamentos } = await supabase
    .from("medicamentos")
    .select(`
      *,
      pets (nome, especie)
    `)
    .eq("tutor_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<div>Carregando...</div>}>
        <MedicamentosOverview pets={pets || []} medicamentos={medicamentos || []} />
      </Suspense>
    </div>
  )
}
