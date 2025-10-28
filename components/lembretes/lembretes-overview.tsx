"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, Check, Clock, AlertTriangle, Calendar, Repeat } from "lucide-react"
import { format, isToday, isTomorrow, isPast, isThisWeek } from "date-fns"
import { ptBR } from "date-fns/locale"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface Lembrete {
  id: string
  titulo: string
  descricao?: string
  data_lembrete: string
  tipo: string
  status: string
  recorrencia?: string
  pets?: { nome: string }
}

interface LembretesOverviewProps {
  lembretes: Lembrete[]
}

export function LembretesOverview({ lembretes }: LembretesOverviewProps) {
  const [isUpdating, setIsUpdating] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  // Separar lembretes por status e data
  const hoje = new Date()
  const lembretesAtivos = lembretes.filter((l) => l.status === "ativo")
  const lembretesVencidos = lembretesAtivos.filter(
    (l) => isPast(new Date(l.data_lembrete)) && !isToday(new Date(l.data_lembrete)),
  )
  const lembretesHoje = lembretesAtivos.filter((l) => isToday(new Date(l.data_lembrete)))
  const lembreteAmanha = lembretesAtivos.filter((l) => isTomorrow(new Date(l.data_lembrete)))
  const lembretesProximos = lembretesAtivos.filter(
    (l) =>
      isThisWeek(new Date(l.data_lembrete)) &&
      !isToday(new Date(l.data_lembrete)) &&
      !isTomorrow(new Date(l.data_lembrete)) &&
      !isPast(new Date(l.data_lembrete)),
  )

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case "consulta":
        return "🏥"
      case "vacina":
        return "💉"
      case "medicamento":
        return "💊"
      case "alimentacao":
        return "🍽️"
      default:
        return "📝"
    }
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

  const marcarComoConcluido = async (lembreteId: string) => {
    setIsUpdating(lembreteId)
    try {
      const { error } = await supabase.from("lembretes").update({ status: "concluido" }).eq("id", lembreteId)

      if (error) throw error
      router.refresh()
    } catch (error) {
      console.error("Erro ao marcar lembrete como concluído:", error)
    } finally {
      setIsUpdating(null)
    }
  }

  const renderLembreteCard = (lembrete: Lembrete) => (
    <div
      key={lembrete.id}
      className="flex items-center gap-4 p-4 rounded-lg border border-emerald-100 hover:bg-emerald-50 transition-colors"
    >
      <div className="text-2xl">{getTipoIcon(lembrete.tipo)}</div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-medium text-emerald-800">{lembrete.titulo}</h4>
          {lembrete.pets && (
            <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
              {lembrete.pets.nome}
            </Badge>
          )}
          <Badge variant="secondary" className={getTipoColor(lembrete.tipo)}>
            {lembrete.tipo}
          </Badge>
          {lembrete.recorrencia && lembrete.recorrencia !== "unica" && (
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
              <Repeat className="h-3 w-3 mr-1" />
              {lembrete.recorrencia}
            </Badge>
          )}
        </div>
        {lembrete.descricao && <p className="text-sm text-emerald-600 mb-2">{lembrete.descricao}</p>}
        <div className="flex items-center gap-1 text-xs text-emerald-500">
          <Clock className="h-3 w-3" />
          {format(new Date(lembrete.data_lembrete), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => marcarComoConcluido(lembrete.id)}
        disabled={isUpdating === lembrete.id}
        className="border-emerald-300 text-emerald-700 bg-transparent"
      >
        <Check className="h-4 w-4 mr-1" />
        {isUpdating === lembrete.id ? "..." : "Concluir"}
      </Button>
    </div>
  )

  if (lembretes.length === 0) {
    return (
      <Card className="border-emerald-200">
        <CardContent className="text-center py-16">
          <Bell className="h-24 w-24 text-emerald-300 mx-auto mb-6" />
          <h3 className="text-xl font-semibold text-emerald-800 mb-2">Nenhum lembrete criado</h3>
          <p className="text-emerald-600 mb-6">Crie lembretes para não esquecer dos cuidados importantes</p>
          <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
            <a href="/lembretes/novo">
              <Bell className="h-4 w-4 mr-2" />
              Criar primeiro lembrete
            </a>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Lembretes Vencidos */}
      {lembretesVencidos.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Lembretes Vencidos ({lembretesVencidos.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">{lembretesVencidos.map(renderLembreteCard)}</div>
          </CardContent>
        </Card>
      )}

      {/* Lembretes de Hoje */}
      {lembretesHoje.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-800 flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Para Hoje ({lembretesHoje.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">{lembretesHoje.map(renderLembreteCard)}</div>
          </CardContent>
        </Card>
      )}

      {/* Lembretes de Amanhã */}
      {lembreteAmanha.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Para Amanhã ({lembreteAmanha.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">{lembreteAmanha.map(renderLembreteCard)}</div>
          </CardContent>
        </Card>
      )}

      {/* Próximos Lembretes */}
      {lembretesProximos.length > 0 && (
        <Card className="border-emerald-200">
          <CardHeader>
            <CardTitle className="text-emerald-800 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Próximos Lembretes ({lembretesProximos.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">{lembretesProximos.map(renderLembreteCard)}</div>
          </CardContent>
        </Card>
      )}

      {/* Lembretes Concluídos */}
      {lembretes.filter((l) => l.status === "concluido").length > 0 && (
        <Card className="border-emerald-200">
          <CardHeader>
            <CardTitle className="text-emerald-800 flex items-center gap-2">
              <Check className="h-5 w-5" />
              Concluídos ({lembretes.filter((l) => l.status === "concluido").length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lembretes
                .filter((l) => l.status === "concluido")
                .slice(0, 5)
                .map((lembrete) => (
                  <div
                    key={lembrete.id}
                    className="flex items-center gap-4 p-4 rounded-lg border border-emerald-100 opacity-60"
                  >
                    <div className="text-2xl">{getTipoIcon(lembrete.tipo)}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-emerald-800 line-through">{lembrete.titulo}</h4>
                        {lembrete.pets && (
                          <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                            {lembrete.pets.nome}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-emerald-500">
                        <Check className="h-3 w-3" />
                        Concluído
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
