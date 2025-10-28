import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { MedicamentoForm } from "@/components/medicamentos/medicamento-form"

interface EditarMedicamentoPageProps {
  params: { id: string }
}

export default async function EditarMedicamentoPage({ params }: EditarMedicamentoPageProps) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: pets } = await supabase.from("pets").select("id, nome, especie").eq("tutor_id", user.id).order("nome")

  const { data: medicamento } = await supabase
    .from("medicamentos")
    .select("*")
    .eq("id", params.id)
    .eq("tutor_id", user.id)
    .single()

  if (!medicamento) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <MedicamentoForm pets={pets || []} medicamento={medicamento} isEditing={true} />
    </div>
  )
}
