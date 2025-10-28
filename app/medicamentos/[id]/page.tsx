import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { MedicamentoDetails } from "@/components/medicamentos/medicamento-details"

interface MedicamentoPageProps {
  params: { id: string }
}

export default async function MedicamentoPage({ params }: MedicamentoPageProps) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: medicamento } = await supabase
    .from("medicamentos")
    .select(`
      *,
      pets (nome, especie, raca)
    `)
    .eq("id", params.id)
    .eq("tutor_id", user.id)
    .single()

  if (!medicamento) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <MedicamentoDetails medicamento={medicamento} />
    </div>
  )
}
