"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/hooks/use-auth"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Syringe, Calendar, FileText } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface Vacina {
  id: string
  tutor_id: string
  pet_id?: string | null

  // campos típicos – se algum tiver nome diferente na tua tabela,
  // é só ajustar aqui e ele continua funcionando
  nome?: string | null
  tipo?: string | null
  fabricante?: string | null
  lote?: string | null
  data_aplicacao?: string | null
  data_reforco?: string | null
  observacoes?: string | null

  pets?: {
    id: string
    nome: string
  } | null
}

export default function VacinaPage() {
  const { id } = useParams() as { id: string }
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()
  const supabase = createClient()

  const [vacina, setVacina] = useState<Vacina | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // redireciona se não estiver logado
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login")
    }
  }, [isAuthenticated, isLoading, router])

  // busca TODAS as vacinas do tutor e filtra pelo id (igual fizemos em consultas/medicamentos)
  useEffect(() => {
    if (!id || !user?.id) return

    const fetchVacina = async () => {
      try {
        setLoading(true)
        setError(null)

        const { data, error } = await supabase
          .from("vacinas")
          .select(`*, pets (id, nome)`)
          .eq("tutor_id", (user as any).id)
          .order("data_aplicacao", { ascending: true })

        if (error) {
          console.error("Erro ao buscar vacinas:", error)
          setError("Não foi possível carregar as vacinas.")
          setVacina(null)
          return
        }

        const todas = (data || []) as Vacina[]
        const encontrada = todas.find((v) => v.id === id) || null

        console.log("[VacinaPage] id:", id, {
          totalVacinas: todas.length,
          encontrada,
        })

        setVacina(encontrada)
      } catch (e: any) {
        console.error("Erro inesperado ao buscar vacina:", e)
        setError("Ocorreu um erro ao carregar as informações da vacina.")
        setVacina(null)
      } finally {
        setLoading(false)
      }
    }

    fetchVacina()
  }, [id, user?.id, supabase])

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
        <p className="text-emerald-600">Carregando vacina...</p>
      </div>
    )
  }

  if (!isAuthenticated || !user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      <DashboardHeader user={user as any} profile={user as any} />

      <main className="container mx-auto px-4 py-8">
        {!vacina ? (
          <Card className="max-w-lg mx-auto border-red-100 bg-white/70">
            <CardHeader>
              <CardTitle className="text-red-700">Vacina não encontrada</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-red-600">
                {error ||
                  "Não foi possível localizar essa vacina para o seu usuário. Verifique se ela ainda existe ou se foi cadastrada com outra conta."}
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
                  <Link href="/vacinas">
                    <ArrowLeft className="h-4 w-4" />
                  </Link>
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-emerald-800 flex items-center gap-2">
                    <Syringe className="h-5 w-5" />
                    {vacina.nome || vacina.tipo || "Vacina"}
                  </h1>
                  {vacina.pets?.nome && (
                    <p className="text-sm text-emerald-600">
                      Para o pet <span className="font-semibold">{vacina.pets.nome}</span>
                    </p>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {vacina.data_aplicacao && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-emerald-600" />
                    <div>
                      <p className="text-sm text-emerald-600">Data de aplicação</p>
                      <p className="font-medium text-emerald-800">
                        {format(new Date(vacina.data_aplicacao), "dd/MM/yyyy", {
                          locale: ptBR,
                        })}
                      </p>
                    </div>
                  </div>
                )}

                {vacina.data_reforco && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-emerald-600" />
                    <div>
                      <p className="text-sm text-emerald-600">Data de reforço</p>
                      <p className="font-medium text-emerald-800">
                        {format(new Date(vacina.data_reforco), "dd/MM/yyyy", {
                          locale: ptBR,
                        })}
                      </p>
                    </div>
                  </div>
                )}

                {vacina.fabricante && (
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-emerald-600" />
                    <div>
                      <p className="text-sm text-emerald-600">Fabricante</p>
                      <p className="font-medium text-emerald-800">{vacina.fabricante}</p>
                    </div>
                  </div>
                )}

                {vacina.lote && (
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-emerald-600" />
                    <div>
                      <p className="text-sm text-emerald-600">Lote</p>
                      <p className="font-medium text-emerald-800">{vacina.lote}</p>
                    </div>
                  </div>
                )}
              </div>

              {vacina.observacoes && (
                <div className="space-y-1">
                  <h2 className="font-medium text-emerald-800">Observações</h2>
                  <p className="text-emerald-700 whitespace-pre-line">
                    {vacina.observacoes}
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
