import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Shield, Calendar, AlertTriangle, CheckCircle } from "lucide-react"
import { format, isAfter, isBefore, addDays } from "date-fns"
import { ptBR } from "date-fns/locale"
import Link from "next/link"

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
  }
}

interface VacinasOverviewProps {
  vacinas: Vacina[]
}

export function VacinasOverview({ vacinas }: VacinasOverviewProps) {
  // Separar vacinas por status
  const hoje = new Date()
  const proximoMes = addDays(hoje, 30)

  const vacinasVencidas = vacinas.filter((v) => v.data_proxima_dose && isBefore(new Date(v.data_proxima_dose), hoje))

  const vacinasProximasVencimento = vacinas.filter(
    (v) =>
      v.data_proxima_dose &&
      isAfter(new Date(v.data_proxima_dose), hoje) &&
      isBefore(new Date(v.data_proxima_dose), proximoMes),
  )

  const vacinasEmDia = vacinas.filter((v) => !v.data_proxima_dose || isAfter(new Date(v.data_proxima_dose), proximoMes))

  const getVacinaStatus = (vacina: Vacina) => {
    if (!vacina.data_proxima_dose) return "completa"
    if (isBefore(new Date(vacina.data_proxima_dose), hoje)) return "vencida"
    if (isBefore(new Date(vacina.data_proxima_dose), proximoMes)) return "proxima"
    return "em-dia"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "vencida":
        return "bg-red-100 text-red-700"
      case "proxima":
        return "bg-yellow-100 text-yellow-700"
      case "em-dia":
        return "bg-green-100 text-green-700"
      case "completa":
        return "bg-blue-100 text-blue-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "vencida":
        return AlertTriangle
      case "proxima":
        return Calendar
      case "em-dia":
      case "completa":
        return CheckCircle
      default:
        return Shield
    }
  }

  if (vacinas.length === 0) {
    return (
      <Card className="border-emerald-200">
        <CardContent className="text-center py-16">
          <Shield className="h-24 w-24 text-emerald-300 mx-auto mb-6" />
          <h3 className="text-xl font-semibold text-emerald-800 mb-2">Nenhuma vacina registrada</h3>
          <p className="text-emerald-600 mb-6">Comece registrando as vacinas dos seus pets</p>
          <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
            <Link href="/vacinas/nova">
              <Shield className="h-4 w-4 mr-2" />
              Registrar primeira vacina
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Alertas */}
      {(vacinasVencidas.length > 0 || vacinasProximasVencimento.length > 0) && (
        <div className="space-y-4">
          {vacinasVencidas.length > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-800 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Vacinas Vencidas ({vacinasVencidas.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {vacinasVencidas.slice(0, 3).map((vacina) => (
                    <div key={vacina.id} className="flex items-center justify-between p-2 bg-white rounded">
                      <div>
                        <span className="font-medium text-red-800">{vacina.pets.nome}</span>
                        <span className="text-red-600 ml-2">- {vacina.nome_vacina}</span>
                      </div>
                      <span className="text-xs text-red-500">
                        Venceu em {format(new Date(vacina.data_proxima_dose!), "dd/MM/yyyy")}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {vacinasProximasVencimento.length > 0 && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader>
                <CardTitle className="text-yellow-800 flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Próximas do Vencimento ({vacinasProximasVencimento.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {vacinasProximasVencimento.slice(0, 3).map((vacina) => (
                    <div key={vacina.id} className="flex items-center justify-between p-2 bg-white rounded">
                      <div>
                        <span className="font-medium text-yellow-800">{vacina.pets.nome}</span>
                        <span className="text-yellow-600 ml-2">- {vacina.nome_vacina}</span>
                      </div>
                      <span className="text-xs text-yellow-600">
                        {format(new Date(vacina.data_proxima_dose!), "dd/MM/yyyy")}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Lista de Vacinas */}
      <Card className="border-emerald-200">
        <CardHeader>
          <CardTitle className="text-emerald-800 flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Histórico de Vacinas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {vacinas.map((vacina) => {
              const status = getVacinaStatus(vacina)
              const StatusIcon = getStatusIcon(status)

              return (
                <div
                  key={vacina.id}
                  className="flex items-center gap-4 p-4 rounded-lg border border-emerald-100 hover:bg-emerald-50 transition-colors"
                >
                  <div className={`p-2 rounded-lg ${getStatusColor(status)}`}>
                    <StatusIcon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-emerald-800">{vacina.nome_vacina}</h4>
                      <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                        {vacina.pets.nome}
                      </Badge>
                    </div>
                    <p className="text-sm text-emerald-600 mb-1">
                      Aplicada em: {format(new Date(vacina.data_aplicacao), "dd/MM/yyyy", { locale: ptBR })}
                    </p>
                    {vacina.data_proxima_dose && (
                      <p className="text-sm text-emerald-600">
                        Próxima dose: {format(new Date(vacina.data_proxima_dose), "dd/MM/yyyy", { locale: ptBR })}
                      </p>
                    )}
                    {vacina.veterinario && <p className="text-xs text-emerald-500">Dr. {vacina.veterinario}</p>}
                  </div>
                  <Badge variant="secondary" className={getStatusColor(status)}>
                    {status === "vencida"
                      ? "Vencida"
                      : status === "proxima"
                        ? "Próxima"
                        : status === "em-dia"
                          ? "Em dia"
                          : "Completa"}
                  </Badge>
                  <Button variant="ghost" size="sm" asChild className="text-emerald-600">
                    <Link href={`/vacinas/${vacina.id}`}>Ver detalhes</Link>
                  </Button>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
