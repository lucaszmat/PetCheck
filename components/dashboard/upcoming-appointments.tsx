import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Stethoscope, Bell } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface Consulta {
  id: string
  data_consulta: string
  veterinario: string
  motivo: string
  pets: { nome: string; foto_url?: string }
}

interface Lembrete {
  id: string
  data_lembrete: string
  titulo: string
  tipo: string
  pets?: { nome: string }
}

interface UpcomingAppointmentsProps {
  consultas: Consulta[]
  lembretes: Lembrete[]
}

export function UpcomingAppointments({ consultas, lembretes }: UpcomingAppointmentsProps) {
  // Combinar e ordenar consultas e lembretes
  const allAppointments = [
    ...consultas.map((c) => ({
      id: c.id,
      type: "consulta" as const,
      date: c.data_consulta,
      title: `Consulta - ${c.pets.nome}`,
      subtitle: `Dr. ${c.veterinario} • ${c.motivo}`,
      icon: Stethoscope,
    })),
    ...lembretes.map((l) => ({
      id: l.id,
      type: "lembrete" as const,
      date: l.data_lembrete,
      title: l.titulo,
      subtitle: l.pets ? `${l.pets.nome} • ${l.tipo}` : l.tipo,
      icon: Bell,
    })),
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  return (
    <Card className="border-emerald-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-emerald-800 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Próximos Compromissos
            </CardTitle>
            <CardDescription>
              {allAppointments.length === 0
                ? "Nenhum compromisso agendado"
                : `${allAppointments.length} compromisso${allAppointments.length > 1 ? "s" : ""} próximo${
                    allAppointments.length > 1 ? "s" : ""
                  }`}
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-emerald-300 text-emerald-700 bg-transparent"
            asChild
          >
            <Link href="/lembretes">
              Ver todos
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {allAppointments.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-16 w-16 text-emerald-300 mx-auto mb-4" />
            <p className="text-emerald-600 mb-4">Nenhum compromisso agendado</p>
          </div>
        ) : (
          <div className="space-y-4">
            {allAppointments.slice(0, 5).map((appointment) => (
              <div
                key={appointment.id}
                className="flex items-center gap-4 p-3 rounded-lg border border-emerald-100 hover:bg-emerald-50 transition-colors"
              >
                <div
                  className={`p-2 rounded-lg ${
                    appointment.type === "consulta" ? "bg-blue-100 text-blue-600" : "bg-yellow-100 text-yellow-600"
                  }`}
                >
                  <appointment.icon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-emerald-800">{appointment.title}</h4>
                  <p className="text-sm text-emerald-600">{appointment.subtitle}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="h-3 w-3 text-emerald-500" />
                    <span className="text-xs text-emerald-500">
                      {format(new Date(appointment.date), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                    </span>
                  </div>
                </div>
                <Badge
                  variant="secondary"
                  className={`${
                    appointment.type === "consulta" ? "bg-blue-100 text-blue-700" : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {appointment.type === "consulta" ? "Consulta" : "Lembrete"}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
