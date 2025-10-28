import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { LembretesOverview } from "@/components/lembretes/lembretes-overview"
import { LembretesCalendar } from "@/components/lembretes/lembretes-calendar"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import Link from "next/link"

export default async function LembretesPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Buscar dados do usuário
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

  // Buscar pets do usuário
  const { data: pets } = await supabase.from("pets").select("*").eq("tutor_id", data.user.id)

  // Buscar lembretes do usuário
  const { data: lembretes } = await supabase
    .from("lembretes")
    .select(`
      *,
      pets (nome, foto_url)
    `)
    .eq("tutor_id", data.user.id)
    .order("data_lembrete", { ascending: true })

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      <DashboardHeader user={data.user} profile={profile} />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-emerald-800">Lembretes</h1>
            <p className="text-emerald-600 mt-2">
              {lembretes?.length === 0
                ? "Nenhum lembrete criado"
                : `${lembretes?.length} lembrete${lembretes?.length && lembretes.length > 1 ? "s" : ""} criado${lembretes?.length && lembretes.length > 1 ? "s" : ""}`}
            </p>
          </div>
          <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
            <Link href="/lembretes/novo">
              <PlusCircle className="h-4 w-4 mr-2" />
              Criar Lembrete
            </Link>
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <LembretesOverview lembretes={lembretes || []} />
          </div>
          <div>
            <LembretesCalendar lembretes={lembretes || []} />
          </div>
        </div>
      </main>
    </div>
  )
}
