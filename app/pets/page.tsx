import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { PetsList } from "@/components/pets/pets-list"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import Link from "next/link"

export default async function PetsPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Buscar dados do usuário
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

  // Buscar todos os pets do usuário
  const { data: pets } = await supabase
    .from("pets")
    .select("*")
    .eq("tutor_id", data.user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      <DashboardHeader user={data.user} profile={profile} />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-emerald-800">Meus Pets</h1>
            <p className="text-emerald-600 mt-2">
              {pets?.length === 0
                ? "Nenhum pet cadastrado ainda"
                : `${pets?.length} pet${pets?.length && pets.length > 1 ? "s" : ""} cadastrado${pets?.length && pets.length > 1 ? "s" : ""}`}
            </p>
          </div>
          <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
            <Link href="/pets/novo">
              <PlusCircle className="h-4 w-4 mr-2" />
              Adicionar Pet
            </Link>
          </Button>
        </div>

        <PetsList pets={pets || []} />
      </main>
    </div>
  )
}
