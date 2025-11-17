"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/hooks/use-auth"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Pill, Calendar, Clock, FileText } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface Medicamento {
  id: string
  nome: string
  dose?: string | null
  frequencia?: string | null
  via?: string | null
  data_inicio?: string | null
  data_fim?: string | null
  observacoes?: string | null
  tutor_id: string
  pet_id?: string | null
  pets?: {
    id: string
    nome: string
  } | null
}

export default function MedicamentoPage() {
  const { id } = useParams() as { id: string }
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()
  const supabase = createClient()

  const [medicamento, setMedicamento] = useState<Medicamento | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // redireciona se não estiver logado
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login")
    }
  }, [isAuthenticated, isLoading, router])

  // busca TODOS os medicamentos do tutor e filtra pelo id (igual fizemos em consultas)
  useEffect(() => {
    if (!id || !user?.id) return

    const fetchMedicamento = async () => {
      try {
        setLoading(true)
        setError(null)

        const { data, error } = await supabase
          .from("medicamentos")
          .select(`*, pets (id, nome)`)
          .eq("tutor_id", (user as any).id)
          .order("created_at", { ascending: true })

        if (error) {
          console.error("Erro ao buscar medicamentos:", error)
          setError("Não foi possível carregar os medicamentos.")
          setMedicamento(null)
          return
        }

        const todos = (data || []) as Medicamento[]
        const encontrado = todos.find((m) => m.id === id) || null

        console.log("[MedicamentoPage] id:", id, {
          totalMedicamentos: todos.length,
          encontrado,
        })

        setMedicamento(encontrado)
      } catch (e: any) {
        console.error("Erro inesperado ao buscar medicamento:", e)
        setError("Ocorreu um erro ao carregar as informações do medicamento.")
        setMedicamento(null)
      } finally {
        setLoading(false)
      }
    }

    fetchMedicamento()
  }, [id, user?.id, supabase])

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
        <p className="text-emerald-600">Carregando medicamento...</p>
      </div>
    )
  }

  if (!isAuthenticated || !user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      <DashboardHeader user={user as any} profile={user as any} />

      <main className="container mx-auto px-4 py-8">
        {!medicamento ? (
          <Card className="max-w-lg mx-auto border-red-100 bg-white/70">
            <CardHeader>
              <CardTitle className="text-red-700">Medicamento não encontrado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-red-600">
                {error ||
                  "Não foi possível localizar esse medicamento para o seu usuário. Verifique se ele ainda existe ou se foi cadastrado com outra conta."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="max-w-3xl mx-auto border-emerald-200 bg-white/80">
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  asChild
                  className="text-emerald-600"
                >
                  <Link href="/medicamentos">
                    <ArrowLeft className="h-4 w-4" />
                  </Link>
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-emerald-800 flex items-center gap-2">
                    <Pill className="h-5 w-5" />
                    {medicamento.nome}
                  </h1>
                  {medicamento.pets?.nome && (
                    <p className="text-sm text-emerald-600">
                      Para o pet <span className="font-semibold">{medicamento.pets.nome}</span>
                    </p>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {medicamento.dose && (
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-emerald-600" />
                    <div>
                      <p className="text-sm text-emerald-600">Dose</p>
                      <p className="font-medium text-emerald-800">{medicamento.dose}</p>
                    </div>
                  </div>
                )}
                {medicamento.frequencia && (
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-emerald-600" />
                    <div>
                      <p className="text-sm text-emerald-600">Frequência</p>
                      <p className="font-medium text-emerald-800">{medicamento.frequencia}</p>
                    </div>
                  </div>
                )}
                {medicamento.via && (
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-emerald-600" />
                    <div>
                      <p className="text-sm text-emerald-600">Via de administração</p>
                      <p className="font-medium text-emerald-800">{medicamento.via}</p>
                    </div>
                  </div>
                )}
                {medicamento.data_inicio && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-emerald-600" />
                    <div>
                      <p className="text-sm text-emerald-600">Início</p>
                      <p className="font-medium text-emerald-800">
                        {format(new Date(medicamento.data_inicio), "dd/MM/yyyy", {
                          locale: ptBR,
                        })}
                      </p>
                    </div>
                  </div>
                )}
                {medicamento.data_fim && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-emerald-600" />
                    <div>
                      <p className="text-sm text-emerald-600">Fim</p>
                      <p className="font-medium text-emerald-800">
                        {format(new Date(medicamento.data_fim), "dd/MM/yyyy", {
                          locale: ptBR,
                        })}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {medicamento.observacoes && (
                <div className="space-y-1">
                  <h2 className="font-medium text-emerald-800">Observações</h2>
                  <p className="text-emerald-700 whitespace-pre-line">
                    {medicamento.observacoes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
