"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Stethoscope, Heart } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface Consulta {
  id: string
  data_consulta: string
  veterinario: string
  motivo: string
  pets?: {
    nome: string
    foto_url?: string | null
  } | null
  status?: string | null
}

interface ConsultasListProps {
  consultas: Consulta[]
}

export function ConsultasList({ consultas }: ConsultasListProps) {
  if (!consultas || consultas.length === 0) {
    return (
      <Card className="border-emerald-200">
        <CardContent className="py-8 text-center space-y-3">
          <Calendar className="h-10 w-10 text-emerald-300 mx-auto" />
          <p className="text-emerald-700 font-medium">Nenhuma consulta agendada</p>
          <Button asChild className="bg-emerald-600 hover:bg-emerald-700 mt-2">
            <Link href="/consultas/nova">
              Agendar consulta
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {consultas.map((consulta) => {
        const dataFormatada = format(
          new Date(consulta.data_consulta),
          "dd/MM/yyyy 'às' HH:mm",
          { locale: ptBR }
        )

        return (
          <Card
            key={consulta.id}
            className="border-emerald-200 hover:shadow-md transition-shadow"
          >
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="flex items-center gap-2 text-emerald-700 text-sm">
                    <Calendar className="h-4 w-4" />
                    <span>{dataFormatada}</span>
                  </p>
                  <p className="text-emerald-800 font-semibold text-sm">
                    {consulta.pets?.nome ? (
                      <>
                        <Heart className="inline h-3 w-3 mr-1 text-emerald-500" />
                        {consulta.pets.nome}
                      </>
                    ) : (
                      "Consulta"
                    )}
                  </p>
                  <p className="text-sm text-emerald-700">
                    <strong>Vet:</strong> {consulta.veterinario}
                  </p>
                  <p className="text-xs text-emerald-600 line-clamp-2">
                    {consulta.motivo}
                  </p>
                </div>
                {consulta.status && (
                  <Badge className="bg-emerald-100 text-emerald-700 text-[11px]">
                    {consulta.status}
                  </Badge>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  asChild
                  variant="outline"
                  className="flex-1 border-emerald-300 text-emerald-700 bg-transparent justify-center gap-2"
                >
                  <Link href={`/consultas/${consulta.id}`}>
                    <Stethoscope className="h-4 w-4" />
                    Ver detalhes
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
