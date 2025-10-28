"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Pill, Plus, Calendar, AlertCircle } from "lucide-react"
import Link from "next/link"

interface Pet {
  id: string
  nome: string
  especie: string
}

interface Medicamento {
  id: string
  nome_medicamento: string
  dosagem: string
  frequencia: string
  data_inicio: string
  data_termino?: string
  observacoes?: string
  medicamento_ativo: boolean
  pets: { nome: string; especie: string }
}

interface MedicamentosOverviewProps {
  pets: Pet[]
  medicamentos: Medicamento[]
}

export function MedicamentosOverview({ pets, medicamentos }: MedicamentosOverviewProps) {
  const [filtroAtivo, setFiltroAtivo] = useState<"todos" | "ativos" | "inativos">("todos")

  const medicamentosFiltrados = medicamentos.filter((med) => {
    if (filtroAtivo === "ativos") return med.medicamento_ativo
    if (filtroAtivo === "inativos") return !med.medicamento_ativo
    return true
  })

  const medicamentosAtivos = medicamentos.filter((med) => med.medicamento_ativo).length
  const medicamentosVencendo = medicamentos.filter((med) => {
    if (!med.data_termino || !med.medicamento_ativo) return false
    const hoje = new Date()
    const dataTermino = new Date(med.data_termino)
    const diasRestantes = Math.ceil((dataTermino.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
    return diasRestantes <= 7 && diasRestantes >= 0
  }).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-emerald-800 flex items-center gap-3">
            <Pill className="h-8 w-8" />
            Medicamentos
          </h1>
          <p className="text-emerald-600 mt-2">Gerencie os medicamentos dos seus pets</p>
        </div>
        <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
          <Link href="/medicamentos/novo">
            <Plus className="h-4 w-4 mr-2" />
            Novo Medicamento
          </Link>
        </Button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="border-emerald-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-100 rounded-full">
                <Pill className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-800">{medicamentosAtivos}</p>
                <p className="text-sm text-emerald-600">Medicamentos Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-full">
                <AlertCircle className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-800">{medicamentosVencendo}</p>
                <p className="text-sm text-orange-600">Terminando em 7 dias</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-800">{medicamentos.length}</p>
                <p className="text-sm text-blue-600">Total de Registros</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex gap-2">
        <Button
          variant={filtroAtivo === "todos" ? "default" : "outline"}
          onClick={() => setFiltroAtivo("todos")}
          className={filtroAtivo === "todos" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
        >
          Todos
        </Button>
        <Button
          variant={filtroAtivo === "ativos" ? "default" : "outline"}
          onClick={() => setFiltroAtivo("ativos")}
          className={filtroAtivo === "ativos" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
        >
          Ativos
        </Button>
        <Button
          variant={filtroAtivo === "inativos" ? "default" : "outline"}
          onClick={() => setFiltroAtivo("inativos")}
          className={filtroAtivo === "inativos" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
        >
          Inativos
        </Button>
      </div>

      {/* Lista de Medicamentos */}
      {medicamentosFiltrados.length === 0 ? (
        <Card className="border-emerald-200">
          <CardContent className="text-center py-16">
            <Pill className="h-16 w-16 text-emerald-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-emerald-800 mb-2">Nenhum medicamento encontrado</h3>
            <p className="text-emerald-600 mb-6">
              {filtroAtivo === "todos"
                ? "Comece adicionando o primeiro medicamento"
                : `Nenhum medicamento ${filtroAtivo === "ativos" ? "ativo" : "inativo"} encontrado`}
            </p>
            <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
              <Link href="/medicamentos/novo">Adicionar Medicamento</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {medicamentosFiltrados.map((medicamento) => (
            <Card key={medicamento.id} className="border-emerald-200">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-emerald-800">{medicamento.nome_medicamento}</h3>
                      <Badge variant={medicamento.medicamento_ativo ? "default" : "secondary"}>
                        {medicamento.medicamento_ativo ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 text-sm text-emerald-600">
                      <div>
                        <p>
                          <strong>Pet:</strong> {medicamento.pets.nome}
                        </p>
                        <p>
                          <strong>Dosagem:</strong> {medicamento.dosagem}
                        </p>
                      </div>
                      <div>
                        <p>
                          <strong>Frequência:</strong> {medicamento.frequencia}
                        </p>
                        <p>
                          <strong>Início:</strong> {new Date(medicamento.data_inicio).toLocaleDateString()}
                        </p>
                        {medicamento.data_termino && (
                          <p>
                            <strong>Término:</strong> {new Date(medicamento.data_termino).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>

                    {medicamento.observacoes && (
                      <p className="text-sm text-emerald-600 mt-2">
                        <strong>Obs:</strong> {medicamento.observacoes}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/medicamentos/${medicamento.id}`}>Ver</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
