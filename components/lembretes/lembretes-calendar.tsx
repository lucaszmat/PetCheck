import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bell, Calendar, Clock } from "lucide-react"
import { format, isToday, isTomorrow, addDays } from "date-fns"
import { ptBR } from "date-fns/locale"

interface Lembrete {
  id: string
  titulo: string
  data_lembrete: string
  tipo: string
  status: string
  pets?: { nome: string }
}

interface LembretesCalendarProps {
  lembretes: Lembrete[]
}

export function LembretesCalendar({ lembretes }: LembretesCalendarProps) {
  const hoje = new Date()
  const proximosDias = Array.from({ length: 7 }, (_, i) => addDays(hoje, i))

  const getLembretesParaData = (data: Date) => {
    return lembretes.filter(
      (l) => l.status === "ativo" && format(new Date(l.data_lembrete), "yyyy-MM-dd") === format(data, "yyyy-MM-dd"),
    )
  }

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case "consulta":
        return "bg-blue-100 text-blue-700"
      case "vacina":
        return "bg-green-100 text-green-700"
      case "medicamento":
        return "bg-purple-100 text-purple-700"
      case "alimentacao":
        return "bg-orange-100 text-orange-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const lembretesAtivos = lembretes.filter((l) => l.status === "ativo")
  const lembretesHoje = lembretesAtivos.filter((l) => isToday(new Date(l.data_lembrete)))
  const lembretesAmanha = lembretesAtivos.filter((l) => isTomorrow(new Date(l.data_lembrete)))

  return (
    <div className="space-y-6">
      <Card className="border-emerald-200">
        <CardHeader>
          <CardTitle className="text-emerald-800 flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Resumo de Lembretes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-emerald-600">Total ativo:</span>
              <span className="font-medium text-emerald-800">{lembretesAtivos.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-emerald-600">Para hoje:</span>
              <span className="font-medium text-emerald-800">{lembretesHoje.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-emerald-600">Para amanhã:</span>
              <span className="font-medium text-emerald-800">{lembretesAmanha.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-emerald-600">Concluídos:</span>
              <span className="font-medium text-emerald-800">
                {lembretes.filter((l) => l.status === "concluido").length}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-emerald-200">
        <CardHeader>
          <CardTitle className="text-emerald-800 flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Próximos 7 Dias
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {proximosDias.map((data) => {
              const lembretesData = getLembretesParaData(data)
              const isHoje = isToday(data)
              const isAmanha = isTomorrow(data)

              return (
                <div
                  key={data.toISOString()}
                  className={`p-3 rounded-lg border ${
                    isHoje
                      ? "border-yellow-300 bg-yellow-50"
                      : isAmanha
                        ? "border-blue-300 bg-blue-50"
                        : "border-emerald-100"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-emerald-800">
                      {isHoje ? "Hoje" : isAmanha ? "Amanhã" : format(data, "EEEE", { locale: ptBR })}
                    </h4>
                    <span className="text-xs text-emerald-500">{format(data, "dd/MM", { locale: ptBR })}</span>
                  </div>

                  {lembretesData.length === 0 ? (
                    <p className="text-xs text-emerald-400">Nenhum lembrete</p>
                  ) : (
                    <div className="space-y-2">
                      {lembretesData.slice(0, 3).map((lembrete) => (
                        <div key={lembrete.id} className="flex items-center gap-2">
                          <div className="flex items-center gap-1 text-xs text-emerald-500">
                            <Clock className="h-3 w-3" />
                            {format(new Date(lembrete.data_lembrete), "HH:mm")}
                          </div>
                          <span className="text-xs text-emerald-800 truncate flex-1">{lembrete.titulo}</span>
                          <Badge variant="secondary" className={`text-xs ${getTipoColor(lembrete.tipo)}`}>
                            {lembrete.tipo}
                          </Badge>
                        </div>
                      ))}
                      {lembretesData.length > 3 && (
                        <p className="text-xs text-emerald-500">+{lembretesData.length - 3} mais</p>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
