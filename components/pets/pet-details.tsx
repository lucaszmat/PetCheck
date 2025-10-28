import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, Heart, Shield, Stethoscope } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
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
  diagnostico?: string
  status: string
}

interface Vacina {
  id: string
  nome_vacina: string
  data_aplicacao: string
  data_proxima_dose?: string
  veterinario?: string
}

interface PetDetailsProps {
  pet: Pet
  consultas: Consulta[]
  vacinas: Vacina[]
}

export function PetDetails({ pet, consultas, vacinas }: PetDetailsProps) {
  const calculateAge = (birthDate: string) => {
    const today = new Date()
    const birth = new Date(birthDate)
    const age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      return age - 1
    }
    return age
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="text-emerald-600">
          <Link href="/pets">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold text-emerald-800">{pet.nome}</h1>
        <Button asChild variant="outline" className="ml-auto border-emerald-300 text-emerald-700 bg-transparent">
          <Link href={`/pets/${pet.id}/editar`}>
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Link>
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Informações do Pet */}
        <Card className="border-emerald-200">
          <CardHeader>
            <CardTitle className="text-emerald-800 flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Informações do Pet
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="relative h-32 w-32 rounded-full overflow-hidden bg-emerald-100 mx-auto mb-4">
                {pet.foto_url ? (
                  <Image src={pet.foto_url || "/placeholder.svg"} alt={pet.nome} fill className="object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <Heart className="h-16 w-16 text-emerald-400" />
                  </div>
                )}
              </div>
              <h3 className="text-xl font-bold text-emerald-800">{pet.nome}</h3>
              <p className="text-emerald-600">{pet.raca || pet.especie}</p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-emerald-600">Espécie:</span>
                <span className="text-emerald-800 font-medium">{pet.especie}</span>
              </div>
              {pet.raca && (
                <div className="flex justify-between">
                  <span className="text-emerald-600">Raça:</span>
                  <span className="text-emerald-800 font-medium">{pet.raca}</span>
                </div>
              )}
              {pet.data_nascimento && (
                <div className="flex justify-between">
                  <span className="text-emerald-600">Idade:</span>
                  <span className="text-emerald-800 font-medium">{calculateAge(pet.data_nascimento)} anos</span>
                </div>
              )}
              {pet.peso && (
                <div className="flex justify-between">
                  <span className="text-emerald-600">Peso:</span>
                  <span className="text-emerald-800 font-medium">{pet.peso}kg</span>
                </div>
              )}
              {pet.sexo && (
                <div className="flex justify-between">
                  <span className="text-emerald-600">Sexo:</span>
                  <span className="text-emerald-800 font-medium">{pet.sexo}</span>
                </div>
              )}
              {pet.cor && (
                <div className="flex justify-between">
                  <span className="text-emerald-600">Cor:</span>
                  <span className="text-emerald-800 font-medium">{pet.cor}</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {pet.castrado && <Badge className="bg-blue-100 text-blue-700">Castrado</Badge>}
            </div>

            {pet.observacoes && (
              <div>
                <h4 className="font-medium text-emerald-800 mb-2">Observações:</h4>
                <p className="text-sm text-emerald-600">{pet.observacoes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Histórico de Consultas */}
        <Card className="border-emerald-200">
          <CardHeader>
            <CardTitle className="text-emerald-800 flex items-center gap-2">
              <Stethoscope className="h-5 w-5" />
              Consultas Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {consultas.length === 0 ? (
              <div className="text-center py-8">
                <Stethoscope className="h-12 w-12 text-emerald-300 mx-auto mb-4" />
                <p className="text-emerald-600 mb-4">Nenhuma consulta registrada</p>
                <Button variant="outline" size="sm" className="border-emerald-300 text-emerald-700 bg-transparent">
                  Agendar consulta
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {consultas.slice(0, 3).map((consulta) => (
                  <div key={consulta.id} className="p-3 rounded-lg border border-emerald-100">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-emerald-800">Dr. {consulta.veterinario}</h4>
                      <Badge
                        variant="secondary"
                        className={
                          consulta.status === "realizada"
                            ? "bg-green-100 text-green-700"
                            : consulta.status === "agendada"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-red-100 text-red-700"
                        }
                      >
                        {consulta.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-emerald-600 mb-1">{consulta.motivo}</p>
                    <p className="text-xs text-emerald-500">
                      {format(new Date(consulta.data_consulta), "dd/MM/yyyy", { locale: ptBR })}
                    </p>
                  </div>
                ))}
                {consultas.length > 3 && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-emerald-300 text-emerald-700 bg-transparent"
                  >
                    Ver todas as consultas
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Histórico de Vacinas */}
        <Card className="border-emerald-200">
          <CardHeader>
            <CardTitle className="text-emerald-800 flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Vacinas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {vacinas.length === 0 ? (
              <div className="text-center py-8">
                <Shield className="h-12 w-12 text-emerald-300 mx-auto mb-4" />
                <p className="text-emerald-600 mb-4">Nenhuma vacina registrada</p>
                <Button variant="outline" size="sm" className="border-emerald-300 text-emerald-700 bg-transparent">
                  Registrar vacina
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {vacinas.slice(0, 3).map((vacina) => (
                  <div key={vacina.id} className="p-3 rounded-lg border border-emerald-100">
                    <h4 className="font-medium text-emerald-800 mb-1">{vacina.nome_vacina}</h4>
                    <p className="text-sm text-emerald-600 mb-1">
                      Aplicada em: {format(new Date(vacina.data_aplicacao), "dd/MM/yyyy", { locale: ptBR })}
                    </p>
                    {vacina.data_proxima_dose && (
                      <p className="text-xs text-emerald-500">
                        Próxima dose: {format(new Date(vacina.data_proxima_dose), "dd/MM/yyyy", { locale: ptBR })}
                      </p>
                    )}
                    {vacina.veterinario && <p className="text-xs text-emerald-500">Dr. {vacina.veterinario}</p>}
                  </div>
                ))}
                {vacinas.length > 3 && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-emerald-300 text-emerald-700 bg-transparent"
                  >
                    Ver todas as vacinas
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
