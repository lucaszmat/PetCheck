"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { MedicamentosOverview } from "@/components/medicamentos/medicamentos-overview"
import { useAuth } from "@/hooks/use-auth"

export default function MedicamentosPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const supabase = useMemo(() => createClient(), [])
  const [pets, setPets] = useState<any[] | null>(null)
  const [medicamentos, setMedicamentos] = useState<any[] | null>(null)

  useEffect(() => {
    if (!isAuthenticated || !user) return
    ;(async () => {
      const { data: petsData } = await supabase
        .from("pets")
        .select("id, nome, especie")
        .eq("tutor_id", (user as any).id)
        .order("nome")
      setPets((petsData as any[]) || [])

      const { data: medsData } = await supabase
        .from("medicamentos")
        .select(`*, pets (nome, especie)`) 
        .eq("tutor_id", (user as any).id)
        .order("created_at", { ascending: false })
      setMedicamentos((medsData as any[]) || [])
    })()
  }, [isAuthenticated, user?.id])

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8">Carregando...</div>
  }

  if (!isAuthenticated || !user) return null

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<div>Carregando...</div>}>
        <MedicamentosOverview pets={pets || []} medicamentos={medicamentos || []} />
      </Suspense>
    </div>
  )
}
