import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, Shield, Calendar, MapPin, FileText } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { format, isBefore } from "date-fns"
import { ptBR } from "date-fns/locale"

interface Vacina {
  id: string
  nome_vacina: string
  data_aplicacao: string
  data_proxima_dose?: string
  veterinario?: string
  clinica?: string
  lote?: string
  observacoes?: string
  pets: {
    nome: string
    foto_url?: string
    especie: string
    raca?: string
  }
}

interface VacinaDetailsProps {
  vacina: Vacina
}

export function VacinaDetails({ vacina }: VacinaDetailsProps) {
  const getStatusColor = () => {
    if (!vacina.data_proxima_dose) return "bg-blue-100 text-blue-700"
    const hoje = new Date()
    const proximaDose = new Date(vacina.data_proxima_dose)
    if (isBefore(proximaDose, hoje)) return "bg-red-100 text-red-700"
    return "bg-green-100 text-green-700"
  }

  const getStatusText = () => {
    if (!vacina.data_proxima_dose) return "Completa"
    const hoje = new Date()
    const proximaDose = new Date(vacina.data_proxima_dose)
    if (isBefore(proximaDose, hoje)) return "Vencida"
    return "Em dia"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="text-emerald-600">
          <Link href="/vacinas">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-emerald-800">{vacina.nome_vacina}</h1>
          <p className="text-emerald-600 mt-1">
            {vacina.pets.nome} • {format(new Date(vacina.data_aplicacao), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </p>
        </div>
        <Badge variant="secondary" className={getStatusColor()}>
          {getStatusText()}
        </Badge>
        <Button asChild variant="outline" className="border-emerald-300 text-emerald-700 bg-transparent">
          <Link href={`/vacinas/${vacina.id}/editar`}>
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Link>
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Informações da Vacina */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-emerald-200">
            <CardHeader>
              <CardTitle className="text-emerald-800 flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Informações da Vacina
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-emerald-600" />
                  <div>
                    <p className="text-sm text-emerald-600">Data de Aplicação</p>
                    <p className="font-medium text-emerald-800">
                      {format(new Date(vacina.data_aplicacao), "dd/MM/yyyy", { locale: ptBR })}
                    </p>
                  </div>
                </div>

                {vacina.data_proxima_dose && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-emerald-600" />
                    <div>
                      <p className="text-sm text-emerald-600">Próxima Dose</p>
                      <p className="font-medium text-emerald-800">
                        {format(new Date(vacina.data_proxima_dose), "dd/MM/yyyy", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                )}

                {vacina.veterinario && (
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-emerald-600" />
                    <div>
                      <p className="text-sm text-emerald-600">Veterinário</p>
                      <p className="font-medium text-emerald-800">Dr. {vacina.veterinario}</p>
                    </div>
                  </div>
                )}

                {vacina.clinica && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-emerald-600" />
                    <div>
                      <p className="text-sm text-emerald-600">Clínica</p>
                      <p className="font-medium text-emerald-800">{vacina.clinica}</p>
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
                <div>
                  <h4 className="font-medium text-emerald-800 mb-2">Observações</h4>
                  <p className="text-emerald-600">{vacina.observacoes}</p>
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
                {vacina.pets.foto_url ? (
                  <Image
                    src={vacina.pets.foto_url || "/placeholder.svg"}
                    alt={vacina.pets.nome}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <Shield className="h-12 w-12 text-emerald-400" />
                  </div>
                )}
              </div>
              <h3 className="text-lg font-bold text-emerald-800">{vacina.pets.nome}</h3>
              <p className="text-emerald-600">{vacina.pets.raca || vacina.pets.especie}</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-emerald-600">Espécie:</span>
                <span className="text-emerald-800 font-medium">{vacina.pets.especie}</span>
              </div>
              {vacina.pets.raca && (
                <div className="flex justify-between">
                  <span className="text-emerald-600">Raça:</span>
                  <span className="text-emerald-800 font-medium">{vacina.pets.raca}</span>
                </div>
              )}
            </div>

            <Button
              asChild
              variant="outline"
              className="w-full mt-4 border-emerald-300 text-emerald-700 bg-transparent"
            >
              <Link href={`/pets/${vacina.pets}`}>Ver perfil do pet</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
