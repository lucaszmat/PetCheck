"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/hooks/use-auth"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { ConsultaDetails } from "@/components/consultas/consulta-details"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Consulta {
  id: string
  pet_id?: string | null
  tutor_id: string
  veterinario: string
  clinica?: string | null
  data_consulta: string
  motivo: string
  diagnostico?: string | null
  tratamento?: string | null
  observacoes?: string | null
  valor?: number | null
  status: string
  tipo_consulta?: string | null
  notificar_antecedencia?: boolean | null
  minutos_antecedencia?: number | null
  pets?: {
    id: string
    nome: string
    foto_url?: string | null
    especie: string
    raca?: string | null
  } | null
}

export default function ConsultaPage() {
  const { id } = useParams() as { id: string }
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()
  const supabase = createClient()

  const [consulta, setConsulta] = useState<Consulta | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // redireciona se não estiver logado
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login")
    }
  }, [isAuthenticated, isLoading, router])

  // busca TODAS as consultas do tutor e filtra pelo id em memória
  useEffect(() => {
    if (!id || !user?.id) return

    const fetchConsulta = async () => {
      try {
        setLoading(true)
        setError(null)

        // MESMA QUERY da lista de consultas
        const { data, error } = await supabase
          .from("consultas")
          .select(`*, pets (id, nome, foto_url, especie, raca)`)
          .eq("tutor_id", (user as any).id)
          .order("data_consulta", { ascending: true })

        if (error) {
          console.error("Erro ao buscar consultas:", error)
          setError("Não foi possível carregar as consultas.")
          setConsulta(null)
          return
        }

        const todas = (data || []) as Consulta[]
        const encontrada = todas.find((c) => c.id === id) || null

        console.log("[ConsultaPage] id:", id, {
          totalConsultas: todas.length,
          encontrada,
        })

        setConsulta(encontrada)
      } catch (e: any) {
        console.error("Erro inesperado ao buscar consulta:", e)
        setError("Ocorreu um erro ao carregar as informações da consulta.")
        setConsulta(null)
      } finally {
        setLoading(false)
      }
    }

    fetchConsulta()
  }, [id, user?.id, supabase])

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
        <p className="text-emerald-600">Carregando consulta...</p>
      </div>
    )
  }

  if (!isAuthenticated || !user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      <DashboardHeader user={user as any} profile={user as any} />

      <main className="container mx-auto px-4 py-8">
        {!consulta ? (
          <Card className="max-w-lg mx-auto border-red-100 bg-white/70">
            <CardHeader>
              <CardTitle className="text-red-700">Consulta não encontrada</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-red-600">
                {error ||
                  "Não foi possível localizar essa consulta para o seu usuário. Verifique se ela ainda existe ou se foi agendada com outra conta."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <ConsultaDetails consulta={consulta as any} />
        )}
      </main>
    </div>
  )
}
