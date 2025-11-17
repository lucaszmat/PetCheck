"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Heart, Calendar, Stethoscope, Bell } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface Pet {
  id: string
  nome: string
  especie: string
  raca?: string
  data_nascimento?: string
  peso?: number
  cor?: string
  sexo?: string
  castrado?: boolean
  foto_url?: string
  observacoes?: string
}

interface Consulta {
  id: string
  data_consulta: string
  veterinario: string
  motivo: string
}

interface Lembrete {
  id: string
  data_lembrete: string
  titulo: string
  tipo: string
  status?: string
}

export default function PetDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()
  const supabase = createClient()

  const [pet, setPet] = useState<Pet | null>(null)
  const [loadingPet, setLoadingPet] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [consultas, setConsultas] = useState<Consulta[]>([])
  const [lembretes, setLembretes] = useState<Lembrete[]>([])
  const [loadingHistorico, setLoadingHistorico] = useState(true)

  const petId = params?.id as string

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login")
    }
  }, [isAuthenticated, isLoading, router])

  // Carregar dados básicos do pet
  useEffect(() => {
    if (!petId || !user) return

    const fetchPet = async () => {
      try {
        setLoadingPet(true)
        setError(null)

        const { data, error } = await supabase
          .from("pets")
          .select("id, nome, especie, raca, data_nascimento, peso, cor, sexo, castrado, foto_url, observacoes")
          .eq("id", petId)
          .eq("tutor_id", (user as any).id)
          .single()

        if (error) {
          console.error(error)
          setError("Não foi possível carregar os dados do pet.")
          return
        }

        setPet(data as Pet)
      } catch (err) {
        console.error(err)
        setError("Ocorreu um erro ao carregar as informações do pet.")
      } finally {
        setLoadingPet(false)
      }
    }

    fetchPet()
  }, [petId, user, supabase])

  // Carregar histórico (consultas + lembretes) desse pet
  useEffect(() => {
    if (!petId || !user) return

    const fetchHistorico = async () => {
      try {
        setLoadingHistorico(true)

        const [consultasRes, lembretesRes] = await Promise.all([
          supabase
            .from("consultas")
            .select("id, data_consulta, veterinario, motivo")
            .eq("pet_id", petId)
            .order("data_consulta", { ascending: false })
            .limit(5),

          supabase
            .from("lembretes")
            .select("id, data_lembrete, titulo, tipo, status")
            .eq("pet_id", petId)
            .order("data_lembrete", { ascending: false })
            .limit(5),
        ])

        if (!consultasRes.error && consultasRes.data) {
          setConsultas(consultasRes.data as Consulta[])
        } else if (consultasRes.error) {
          console.error("Erro ao carregar consultas do pet:", consultasRes.error)
        }

        if (!lembretesRes.error && lembretesRes.data) {
          setLembretes(lembretesRes.data as Lembrete[])
        } else if (lembretesRes.error) {
          console.error("Erro ao carregar lembretes do pet:", lembretesRes.error)
        }
      } catch (err) {
        console.error("Erro inesperado ao carregar histórico do pet:", err)
      } finally {
        setLoadingHistorico(false)
      }
    }

    fetchHistorico()
  }, [petId, user, supabase])

  const calculateAge = (birthDate?: string) => {
    if (!birthDate) return null
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age -= 1
    }
    return age
  }

  if (isLoading || loadingPet) {
    return (
      <div className="min-h-screen bg-linear-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
        <p className="text-emerald-600">Carregando informações do pet...</p>
      </div>
    )
  }

  if (!isAuthenticated || !user) return null

  if (!pet) {
    return (
      <div className="min-h-screen bg-linear-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
        <Card className="border-emerald-200 max-w-lg w-full mx-4">
          <CardHeader>
            <CardTitle className="text-emerald-800">Pet não encontrado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-emerald-600">{error || "Não encontramos esse pet para o seu usuário."}</p>
            <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
              <Link href="/pets">
                Voltar para Meus Pets
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const idade = calculateAge(pet.data_nascimento)

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-50 to-teal-50">
      <main className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
        {/* Card principal com dados do pet */}
        <Card className="border-emerald-200">
          <CardHeader className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" asChild className="text-emerald-600">
                <Link href="/pets">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <CardTitle className="text-emerald-800 flex items-center gap-2">
                <Heart className="h-5 w-5" />
                {pet.nome}
              </CardTitle>
            </div>
            <Button asChild variant="outline" className="border-emerald-300 text-emerald-700 bg-transparent">
              <Link href={`/pets/${pet.id}/editar`}>Editar</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-start gap-6">
              <div className="relative h-24 w-24 rounded-full overflow-hidden bg-emerald-100 flex-shrink-0">
                {pet.foto_url ? (
                  <Image
                    src={pet.foto_url || "/placeholder.svg"}
                    alt={pet.nome}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <Heart className="h-10 w-10 text-emerald-400" />
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-emerald-700">
                  <strong>Espécie:</strong> {pet.especie || "Não informado"}
                </p>
                {pet.raca && (
                  <p className="text-emerald-700">
                    <strong>Raça:</strong> {pet.raca}
                  </p>
                )}
                {idade !== null && (
                  <p className="text-emerald-700">
                    <strong>Idade:</strong> {idade} ano{idade === 1 ? "" : "s"}
                  </p>
                )}
                {pet.peso && (
                  <p className="text-emerald-700">
                    <strong>Peso:</strong> {pet.peso} kg
                  </p>
                )}
                {pet.cor && (
                  <p className="text-emerald-700">
                    <strong>Cor:</strong> {pet.cor}
                  </p>
                )}
                <div className="flex flex-wrap gap-2 mt-2">
                  {pet.sexo && (
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                      {pet.sexo}
                    </Badge>
                  )}
                  {pet.castrado && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                      Castrado
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {pet.observacoes && (
              <div className="space-y-1">
                <p className="font-semibold text-emerald-800">Observações</p>
                <p className="text-emerald-700 whitespace-pre-line">{pet.observacoes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Histórico do Pet */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Consultas */}
          <Card className="border-emerald-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-800">
                <Stethoscope className="h-4 w-4" />
                Histórico de Consultas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingHistorico ? (
                <p className="text-emerald-600 text-sm">Carregando histórico...</p>
              ) : consultas.length === 0 ? (
                <p className="text-emerald-600 text-sm">Nenhuma consulta registrada para este pet.</p>
              ) : (
                <div className="space-y-3">
                  {consultas.map((c) => (
                    <div
                      key={c.id}
                      className="border border-emerald-100 rounded-lg p-3 text-sm space-y-1 bg-emerald-50/40"
                    >
                      <div className="flex items-center gap-2 text-emerald-700 font-medium">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {format(new Date(c.data_consulta), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", {
                            locale: ptBR,
                          })}
                        </span>
                      </div>
                      <p className="text-emerald-700">
                        <strong>Veterinário:</strong> {c.veterinario}
                      </p>
                      <p className="text-emerald-700">
                        <strong>Motivo:</strong> {c.motivo}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Lembretes */}
          <Card className="border-emerald-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-800">
                <Bell className="h-4 w-4" />
                Lembretes relacionados
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingHistorico ? (
                <p className="text-emerald-600 text-sm">Carregando histórico...</p>
              ) : lembretes.length === 0 ? (
                <p className="text-emerald-600 text-sm">Nenhum lembrete vinculado a este pet.</p>
              ) : (
                <div className="space-y-3">
                  {lembretes.map((l) => (
                    <div
                      key={l.id}
                      className="border border-emerald-100 rounded-lg p-3 text-sm space-y-1 bg-emerald-50/40"
                    >
                      <div className="flex items-center gap-2 text-emerald-700 font-medium">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {format(new Date(l.data_lembrete), "dd/MM/yyyy 'às' HH:mm", {
                            locale: ptBR,
                          })}
                        </span>
                      </div>
                      <p className="text-emerald-700">
                        <strong>Título:</strong> {l.titulo}
                      </p>
                      <p className="text-emerald-700">
                        <strong>Tipo:</strong> {l.tipo}
                      </p>
                      {l.status && (
                        <Badge
                          variant="secondary"
                          className="mt-1 bg-emerald-100 text-emerald-700"
                        >
                          {l.status}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
