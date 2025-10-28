"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Pill, Edit, Trash2, Calendar, Clock, AlertTriangle } from "lucide-react"
import Link from "next/link"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface MedicamentoDetailsProps {
  medicamento: {
    id: string
    nome_medicamento: string
    dosagem: string
    frequencia: string
    data_inicio: string
    data_termino?: string
    observacoes?: string
    medicamento_ativo: boolean
    pets: {
      nome: string
      especie: string
      raca?: string
    }
  }
}

export function MedicamentoDetails({ medicamento }: MedicamentoDetailsProps) {
  const router = useRouter()
  const supabase = createClient()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const { error } = await supabase.from("medicamentos").delete().eq("id", medicamento.id)

      if (error) throw error
      router.push("/medicamentos")
    } catch (error) {
      console.error("Erro ao excluir medicamento:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  const toggleStatus = async () => {
    try {
      const { error } = await supabase
        .from("medicamentos")
        .update({ medicamento_ativo: !medicamento.medicamento_ativo })
        .eq("id", medicamento.id)

      if (error) throw error
      router.refresh()
    } catch (error) {
      console.error("Erro ao alterar status:", error)
    }
  }

  const calcularDiasRestantes = () => {
    if (!medicamento.data_termino) return null
    const hoje = new Date()
    const dataTermino = new Date(medicamento.data_termino)
    const diffTime = dataTermino.getTime() - hoje.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const diasRestantes = calcularDiasRestantes()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="text-emerald-600">
          <Link href="/medicamentos">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-emerald-800 flex items-center gap-3">
            <Pill className="h-8 w-8" />
            {medicamento.nome_medicamento}
          </h1>
          <p className="text-emerald-600 mt-1">Detalhes do medicamento</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/medicamentos/${medicamento.id}/editar`}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50 bg-transparent">
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir este medicamento? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-red-600 hover:bg-red-700">
                  {isDeleting ? "Excluindo..." : "Excluir"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Informações Principais */}
        <Card className="border-emerald-200">
          <CardHeader>
            <CardTitle className="text-emerald-800 flex items-center gap-2">
              <Pill className="h-5 w-5" />
              Informações do Medicamento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium text-emerald-700">Status:</span>
              <div className="flex items-center gap-2">
                <Badge variant={medicamento.medicamento_ativo ? "default" : "secondary"}>
                  {medicamento.medicamento_ativo ? "Ativo" : "Inativo"}
                </Badge>
                <Button variant="outline" size="sm" onClick={toggleStatus} className="text-xs bg-transparent">
                  {medicamento.medicamento_ativo ? "Desativar" : "Ativar"}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-emerald-700">Pet:</span>
                <p className="text-emerald-600">
                  {medicamento.pets.nome} ({medicamento.pets.especie})
                  {medicamento.pets.raca && ` - ${medicamento.pets.raca}`}
                </p>
              </div>
              <div>
                <span className="font-medium text-emerald-700">Dosagem:</span>
                <p className="text-emerald-600">{medicamento.dosagem}</p>
              </div>
              <div>
                <span className="font-medium text-emerald-700">Frequência:</span>
                <p className="text-emerald-600">{medicamento.frequencia}</p>
              </div>
              <div>
                <span className="font-medium text-emerald-700">Início:</span>
                <p className="text-emerald-600">{new Date(medicamento.data_inicio).toLocaleDateString()}</p>
              </div>
            </div>

            {medicamento.observacoes && (
              <div>
                <span className="font-medium text-emerald-700">Observações:</span>
                <p className="text-emerald-600 mt-1">{medicamento.observacoes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cronograma */}
        <Card className="border-emerald-200">
          <CardHeader>
            <CardTitle className="text-emerald-800 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Cronograma
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg">
              <Clock className="h-5 w-5 text-emerald-600" />
              <div>
                <p className="font-medium text-emerald-800">Data de Início</p>
                <p className="text-sm text-emerald-600">{new Date(medicamento.data_inicio).toLocaleDateString()}</p>
              </div>
            </div>

            {medicamento.data_termino && (
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
                <div className="flex-1">
                  <p className="font-medium text-blue-800">Data de Término</p>
                  <p className="text-sm text-blue-600">{new Date(medicamento.data_termino).toLocaleDateString()}</p>
                </div>
                {diasRestantes !== null && (
                  <div className="text-right">
                    {diasRestantes > 0 ? (
                      <Badge variant="outline" className="text-blue-600">
                        {diasRestantes} dias restantes
                      </Badge>
                    ) : diasRestantes === 0 ? (
                      <Badge className="bg-yellow-500">Termina hoje</Badge>
                    ) : (
                      <Badge variant="destructive">Vencido</Badge>
                    )}
                  </div>
                )}
              </div>
            )}

            {!medicamento.data_termino && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-800">Uso Contínuo</p>
                  <p className="text-sm text-gray-600">Sem data de término definida</p>
                </div>
              </div>
            )}

            {diasRestantes !== null && diasRestantes <= 7 && diasRestantes > 0 && (
              <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-800">Atenção!</p>
                  <p className="text-sm text-yellow-600">
                    O medicamento termina em {diasRestantes} dia{diasRestantes !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
