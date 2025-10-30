"use client"

import { useEffect, useMemo, useState } from "react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { VacinasOverview } from "@/components/vacinas/vacinas-overview"
import { CartaoVacinacao } from "@/components/vacinas/cartao-vacinacao"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { createClient } from "@/lib/supabase/client"

type Vacina = Record<string, unknown>
type Pet = Record<string, unknown>

export default function VacinasPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const [vacinas, setVacinas] = useState<Vacina[] | null>(null)
  const [pets, setPets] = useState<Pet[] | null>(null)
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    if (!isAuthenticated || !user?.id) return
    ;(async () => {
      const { data: petsData } = await supabase
        .from("pets")
        .select("id, nome, especie, foto_url")
        .eq("tutor_id", (user as any).id)
      setPets((petsData as Pet[]) || [])

      const { data: vacinasData } = await supabase
        .from("vacinas")
        .select(`*, pets (nome, foto_url, especie)`) 
        .eq("tutor_id", (user as any).id)
        .order("data_aplicacao", { ascending: false })
      setVacinas((vacinasData as Vacina[]) || [])
    })()
  }, [isAuthenticated, user?.id, supabase])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600" />
      </div>
    )
  }

  if (!isAuthenticated || !user) return null

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-50 to-teal-50">
      <DashboardHeader user={user as any} profile={user as any} />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-emerald-800">Vacinas</h1>
            <p className="text-emerald-600 mt-2">
              {!vacinas || vacinas.length === 0
                ? "Nenhuma vacina registrada"
                : `${vacinas.length} vacina${vacinas.length > 1 ? "s" : ""} registrada${vacinas.length > 1 ? "s" : ""}`}
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
