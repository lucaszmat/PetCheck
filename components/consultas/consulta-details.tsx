import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, Stethoscope, Calendar, Clock, MapPin, DollarSign } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface Consulta {
  id: string
  data_consulta: string
  veterinario: string
  clinica?: string
  motivo: string
  diagnostico?: string
  tratamento?: string
  observacoes?: string
  valor?: number
  status: string
  pets: {
    id: string  
    nome: string
    foto_url?: string
    especie: string
    raca?: string
  }
}

interface ConsultaDetailsProps {
  consulta: Consulta
}

export function ConsultaDetails({ consulta }: ConsultaDetailsProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "agendada":
        return "bg-blue-100 text-blue-700"
      case "realizada":
        return "bg-green-100 text-green-700"
      case "cancelada":
        return "bg-red-100 text-red-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="text-emerald-600">
          <Link href="/consultas">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-emerald-800">Consulta - {consulta.pets.nome}</h1>
          <p className="text-emerald-600 mt-1">
            {format(new Date(consulta.data_consulta), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
          </p>
        </div>
        <Badge variant="secondary" className={getStatusColor(consulta.status)}>
          {consulta.status}
        </Badge>
        <Button asChild variant="outline" className="border-emerald-300 text-emerald-700 bg-transparent">
          <Link href={`/consultas/${consulta.id}/editar`}>
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Link>
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Informações da Consulta */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-emerald-200">
            <CardHeader>
              <CardTitle className="text-emerald-800 flex items-center gap-2">
                <Stethoscope className="h-5 w-5" />
                Informações da Consulta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-emerald-600" />
                  <div>
                    <p className="text-sm text-emerald-600">Data</p>
                    <p className="font-medium text-emerald-800">
                      {format(new Date(consulta.data_consulta), "dd/MM/yyyy", { locale: ptBR })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-emerald-600" />
                  <div>
                    <p className="text-sm text-emerald-600">Horário</p>
                    <p className="font-medium text-emerald-800">
                      {format(new Date(consulta.data_consulta), "HH:mm")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Stethoscope className="h-5 w-5 text-emerald-600" />
                  <div>
                    <p className="text-sm text-emerald-600">Veterinário</p>
                    <p className="font-medium text-emerald-800">Dr. {consulta.veterinario}</p>
                  </div>
                </div>
                {consulta.clinica && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-emerald-600" />
                    <div>
                      <p className="text-sm text-emerald-600">Clínica</p>
                      <p className="font-medium text-emerald-800">{consulta.clinica}</p>
                    </div>
                  </div>
                )}
                {consulta.valor && (
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-emerald-600" />
                    <div>
                      <p className="text-sm text-emerald-600">Valor</p>
                      <p className="font-medium text-emerald-800">
                        R$ {consulta.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-medium text-emerald-800 mb-2">Motivo da Consulta</h4>
                <p className="text-emerald-600">{consulta.motivo}</p>
              </div>

              {consulta.diagnostico && (
                <div>
                  <h4 className="font-medium text-emerald-800 mb-2">Diagnóstico</h4>
                  <p className="text-emerald-600">{consulta.diagnostico}</p>
                </div>
              )}

              {consulta.tratamento && (
                <div>
                  <h4 className="font-medium text-emerald-800 mb-2">Tratamento</h4>
                  <p className="text-emerald-600">{consulta.tratamento}</p>
                </div>
              )}

              {consulta.observacoes && (
                <div>
                  <h4 className="font-medium text-emerald-800 mb-2">Observações</h4>
                  <p className="text-emerald-600">{consulta.observacoes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Informações do Pet */}
        <Card className="border-emerald-200">
          <CardHeader>
            <CardTitle className="text-emerald-800">Pet</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-4">
              <div className="relative h-24 w-24 rounded-full overflow-hidden bg-emerald-100 mx-auto mb-3">
                {consulta.pets.foto_url ? (
                  <Image
                    src={consulta.pets.foto_url || "/placeholder.svg"}
                    alt={consulta.pets.nome}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <Stethoscope className="h-12 w-12 text-emerald-400" />
                  </div>
                )}
              </div>
              <h3 className="text-lg font-bold text-emerald-800">{consulta.pets.nome}</h3>
              <p className="text-emerald-600">{consulta.pets.raca || consulta.pets.especie}</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-emerald-600">Espécie:</span>
                <span className="text-emerald-800 font-medium">{consulta.pets.especie}</span>
              </div>
              {consulta.pets.raca && (
                <div className="flex justify-between">
                  <span className="text-emerald-600">Raça:</span>
                  <span className="text-emerald-800 font-medium">{consulta.pets.raca}</span>
                </div>
              )}
            </div>

            {consulta.pets.id && (
              <Button
                asChild
                variant="outline"
                className="w-full mt-4 border-emerald-300 text-emerald-700 bg-transparent"
              >
                <Link href={`/pets/${consulta.pets.id}`}>Ver perfil do pet</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
