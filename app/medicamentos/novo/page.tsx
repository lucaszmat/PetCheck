import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { MedicamentoForm } from "@/components/medicamentos/medicamento-form"

export default async function NovoMedicamentoPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: pets } = await supabase.from("pets").select("id, nome, especie").eq("tutor_id", user.id).order("nome")

  return (
    <div className="container mx-auto px-4 py-8">
      <MedicamentoForm pets={pets || []} />
    </div>
  )
}
