import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { VacinasOverview } from "@/components/vacinas/vacinas-overview"
import { CartaoVacinacao } from "@/components/vacinas/cartao-vacinacao"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import Link from "next/link"

export default async function VacinasPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Buscar dados do usuário
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

  // Buscar pets do usuário
  const { data: pets } = await supabase.from("pets").select("*").eq("tutor_id", data.user.id)

  // Buscar vacinas do usuário
  const { data: vacinas } = await supabase
    .from("vacinas")
    .select(`
      *,
      pets (nome, foto_url, especie)
    `)
    .eq("tutor_id", data.user.id)
    .order("data_aplicacao", { ascending: false })

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      <DashboardHeader user={data.user} profile={profile} />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-emerald-800">Vacinas</h1>
            <p className="text-emerald-600 mt-2">
              {vacinas?.length === 0
                ? "Nenhuma vacina registrada"
                : `${vacinas?.length} vacina${vacinas?.length && vacinas.length > 1 ? "s" : ""} registrada${vacinas?.length && vacinas.length > 1 ? "s" : ""}`}
            </p>
          </div>
          <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
            <Link href="/vacinas/nova">
              <PlusCircle className="h-4 w-4 mr-2" />
              Registrar Vacina
            </Link>
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <VacinasOverview vacinas={vacinas || []} />
          </div>
          <div>
            <CartaoVacinacao pets={pets || []} vacinas={vacinas || []} />
          </div>
        </div>
      </main>
    </div>
  )
}
