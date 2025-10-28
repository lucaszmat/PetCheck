import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Stethoscope } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import Link from "next/link"

interface Consulta {
  id: string
  data_consulta: string
  veterinario: string
  motivo: string
  status: string
  pets: { nome: string; foto_url?: string }
}

interface ConsultasListProps {
  consultas: Consulta[]
}

export function ConsultasList({ consultas }: ConsultasListProps) {
  // Separar consultas por status
  const consultasAgendadas = consultas.filter((c) => c.status === "agendada")
  const proximasConsultas = consultasAgendadas.filter((c) => new Date(c.data_consulta) >= new Date()).slice(0, 5)

  return (
    <div className="space-y-6">
      <Card className="border-emerald-200">
        <CardHeader>
          <CardTitle className="text-emerald-800 flex items-center gap-2">
            <Stethoscope className="h-5 w-5" />
            Próximas Consultas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {proximasConsultas.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-16 w-16 text-emerald-300 mx-auto mb-4" />
              <p className="text-emerald-600 mb-4">Nenhuma consulta agendada</p>
              <Button asChild variant="outline" className="border-emerald-300 text-emerald-700 bg-transparent">
                <Link href="/consultas/nova">Agendar consulta</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {proximasConsultas.map((consulta) => (
                <div
                  key={consulta.id}
                  className="p-4 rounded-lg border border-emerald-100 hover:bg-emerald-50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-emerald-800">{consulta.pets.nome}</h4>
                      <p className="text-sm text-emerald-600">Dr. {consulta.veterinario}</p>
                    </div>
                    <Badge
                      variant="secondary"
                      className={
                        consulta.status === "agendada"
                          ? "bg-blue-100 text-blue-700"
                          : consulta.status === "realizada"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                      }
                    >
                      {consulta.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-emerald-600 mb-3">{consulta.motivo}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-emerald-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(consulta.data_consulta), "dd/MM/yyyy", { locale: ptBR })}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(consulta.data_consulta), "HH:mm")}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" asChild className="text-emerald-600">
                      <Link href={`/consultas/${consulta.id}`}>Ver detalhes</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-emerald-200">
        <CardHeader>
          <CardTitle className="text-emerald-800">Resumo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-emerald-600">Total de consultas:</span>
              <span className="font-medium text-emerald-800">{consultas.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-emerald-600">Agendadas:</span>
              <span className="font-medium text-emerald-800">
                {consultas.filter((c) => c.status === "agendada").length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-emerald-600">Realizadas:</span>
              <span className="font-medium text-emerald-800">
                {consultas.filter((c) => c.status === "realizada").length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-emerald-600">Canceladas:</span>
              <span className="font-medium text-emerald-800">
                {consultas.filter((c) => c.status === "cancelada").length}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
