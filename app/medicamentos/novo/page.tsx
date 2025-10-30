"use client"

import { useEffect, useMemo, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { MedicamentoForm } from "@/components/medicamentos/medicamento-form"
import { useAuth } from "@/hooks/use-auth"

export default function NovoMedicamentoPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const supabase = useMemo(() => createClient(), [])
  const [pets, setPets] = useState<any[]>([])

  useEffect(() => {
    if (!isAuthenticated || !user) return
    ;(async () => {
      const { data } = await supabase
        .from("pets")
        .select("id, nome, especie")
        .eq("tutor_id", (user as any).id)
        .order("nome")
      setPets((data as any[]) || [])
    })()
  }, [isAuthenticated, user?.id])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600" />
      </div>
    )
  }

  if (!isAuthenticated || !user) return null

  return (
    <div className="container mx-auto px-4 py-8">
      <MedicamentoForm pets={pets} />
    </div>
  )
}
