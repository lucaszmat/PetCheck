"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, ChevronLeft, ChevronRight, Clock } from "lucide-react"
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns"
import { ptBR } from "date-fns/locale"

interface Consulta {
  id: string
  data_consulta: string
  veterinario: string
  motivo: string
  status: string
  pets: { nome: string }
}

interface ConsultasCalendarProps {
  consultas: Consulta[]
}

export function ConsultasCalendar({ consultas }: ConsultasCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const getConsultasForDate = (date: Date) => {
    return consultas.filter((consulta) => isSameDay(new Date(consulta.data_consulta), date))
  }

  const selectedDateConsultas = selectedDate ? getConsultasForDate(selectedDate) : []

  const previousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1))
  }

  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1))
  }

  return (
    <div className="space-y-6">
      <Card className="border-emerald-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-emerald-800 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {format(currentDate, "MMMM yyyy", { locale: ptBR })}
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={previousMonth}
                className="border-emerald-300 text-emerald-700 bg-transparent"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={nextMonth}
                className="border-emerald-300 text-emerald-700 bg-transparent"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2 mb-4">
            {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
              <div key={day} className="text-center text-sm font-medium text-emerald-600 p-2">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {days.map((day) => {
              const dayConsultas = getConsultasForDate(day)
              const isSelected = selectedDate && isSameDay(day, selectedDate)
              const isToday = isSameDay(day, new Date())

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={`
                    p-2 text-sm rounded-lg border transition-colors min-h-[60px] flex flex-col items-center justify-start
                    ${isSelected ? "bg-emerald-100 border-emerald-300" : "border-emerald-100 hover:bg-emerald-50"}
                    ${isToday ? "ring-2 ring-emerald-400" : ""}
                    ${!isSameMonth(day, currentDate) ? "text-emerald-300" : "text-emerald-800"}
                  `}
                >
                  <span className="font-medium">{format(day, "d")}</span>
                  {dayConsultas.length > 0 && (
                    <div className="flex flex-col gap-1 mt-1">
                      {dayConsultas.slice(0, 2).map((consulta) => (
                        <div
                          key={consulta.id}
                          className={`w-full text-xs px-1 py-0.5 rounded text-white truncate ${
                            consulta.status === "agendada"
                              ? "bg-blue-500"
                              : consulta.status === "realizada"
                                ? "bg-green-500"
                                : "bg-red-500"
                          }`}
                        >
                          {consulta.pets.nome}
                        </div>
                      ))}
                      {dayConsultas.length > 2 && (
                        <div className="text-xs text-emerald-600">+{dayConsultas.length - 2}</div>
                      )}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {selectedDate && selectedDateConsultas.length > 0 && (
        <Card className="border-emerald-200">
          <CardHeader>
            <CardTitle className="text-emerald-800">
              Consultas - {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {selectedDateConsultas.map((consulta) => (
                <div key={consulta.id} className="flex items-center gap-4 p-4 rounded-lg border border-emerald-100">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium text-emerald-800">{consulta.pets.nome}</h4>
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
                    <p className="text-sm text-emerald-600 mb-1">Dr. {consulta.veterinario}</p>
                    <p className="text-sm text-emerald-600 mb-2">{consulta.motivo}</p>
                    <div className="flex items-center gap-1 text-xs text-emerald-500">
                      <Clock className="h-3 w-3" />
                      {format(new Date(consulta.data_consulta), "HH:mm")}
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
