"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Pill } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { criarNotificacao } from "@/lib/notifications"

interface Pet {
  id: string
  nome: string
  especie: string
}

interface MedicamentoFormProps {
  pets: Pet[]
  medicamento?: any
  isEditing?: boolean
}

export function MedicamentoForm({ pets, medicamento, isEditing = false }: MedicamentoFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const { user } = useAuth()

  const [formData, setFormData] = useState({
    pet_id: medicamento?.pet_id || "",
    nome_medicamento: medicamento?.nome_medicamento || "",
    dosagem: medicamento?.dosagem || "",
    frequencia: medicamento?.frequencia || "",
    data_inicio: medicamento?.data_inicio 
      ? (medicamento.data_inicio.includes("T") 
          ? new Date(medicamento.data_inicio).toISOString().slice(0, 16)
          : new Date(medicamento.data_inicio + "T09:00:00").toISOString().slice(0, 16))
      : "",
    data_termino: medicamento?.data_termino || "",
    observacoes: medicamento?.observacoes || "",
    medicamento_ativo: medicamento?.medicamento_ativo ?? true,
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      if (!user || !(user as any).id) throw new Error("Usuário não autenticado")

      const medicamentoData = {
        ...formData,
        tutor_id: (user as any).id,
        data_inicio: formData.data_inicio.includes("T")
          ? new Date(formData.data_inicio).toISOString()
          : new Date(formData.data_inicio + "T00:00:00").toISOString(),
        data_termino: formData.data_termino ? new Date(formData.data_termino).toISOString().split("T")[0] : null,
      }

      if (isEditing && medicamento) {
        const { error } = await supabase.from("medicamentos").update(medicamentoData).eq("id", medicamento.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from("medicamentos").insert([medicamentoData])
        if (error) throw error
      }

      // Criar lembrete no banco (sempre que medicamento_ativo = true)
      if (formData.medicamento_ativo && !isEditing) {
        const selectedPet = pets.find((p) => p.id === formData.pet_id)
        
        // Mapear frequência para recorrência
        let recorrencia = "unica"
        if (formData.frequencia.includes("diária") || formData.frequencia === "1x ao dia" || formData.frequencia === "2x ao dia" || formData.frequencia === "3x ao dia") {
          recorrencia = "diaria"
        } else if (formData.frequencia.includes("semanal")) {
          recorrencia = "semanal"
        } else if (formData.frequencia.includes("mensal")) {
          recorrencia = "mensal"
        }

        // Usar a hora do formulário
        const dataInicio = formData.data_inicio.includes("T")
          ? new Date(formData.data_inicio).toISOString()
          : new Date(formData.data_inicio + "T09:00:00").toISOString()
        
        const lembreteData = {
          tutor_id: (user as any).id,
          pet_id: formData.pet_id,
          titulo: `Administrar ${formData.nome_medicamento} - ${formData.dosagem}`,
          descricao: `Administrar ${formData.dosagem} de ${formData.nome_medicamento} para ${selectedPet?.nome || "o pet"} (${formData.frequencia})`,
          data_lembrete: dataInicio,
          tipo: "medicamento",
          status: "ativo",
          recorrencia,
        }

        const { error: lembreteError } = await supabase.from("lembretes").insert([lembreteData])
        if (lembreteError) {
          console.warn("Erro ao criar lembrete:", lembreteError)
          // Não interrompe o fluxo se falhar ao criar o lembrete
        }

        // Criar notificação na API
        const notificacaoResult = await criarNotificacao({
          tutor_id: (user as any).id,
          titulo: `Administrar ${formData.nome_medicamento} - ${formData.dosagem} - ${selectedPet?.nome || "pet"}`,
          data_lembrete: dataInicio,
          notificar_antecedencia: true,
          minutos_antecedencia: 30, // Padrão: 30 minutos antes
        })

        if (!notificacaoResult.success) {
          console.warn("Aviso: Medicamento salvo, mas falhou ao criar notificação:", notificacaoResult.error)
          // Não interrompe o fluxo se falhar ao criar notificação
        }
      }

      router.push("/medicamentos")
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  if (pets.length === 0) {
    return (
      <Card className="border-emerald-200">
        <CardContent className="text-center py-16">
          <Pill className="h-16 w-16 text-emerald-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-emerald-800 mb-2">Nenhum pet cadastrado</h3>
          <p className="text-emerald-600 mb-6">Você precisa cadastrar um pet antes de adicionar um medicamento</p>
          <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
            <Link href="/pets/novo">Cadastrar pet</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-emerald-200">
      <CardHeader>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="text-emerald-600">
            <Link href="/medicamentos">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <CardTitle className="text-emerald-800 flex items-center gap-2">
            <Pill className="h-5 w-5" />
            {isEditing ? "Editar Medicamento" : "Novo Medicamento"}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="pet_id">Pet *</Label>
              <Select value={formData.pet_id} onValueChange={(value) => handleInputChange("pet_id", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o pet" />
                </SelectTrigger>
                <SelectContent>
                  {pets.map((pet) => (
                    <SelectItem key={pet.id} value={pet.id}>
                      {pet.nome} ({pet.especie})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nome_medicamento">Nome do Medicamento *</Label>
              <Input
                id="nome_medicamento"
                value={formData.nome_medicamento}
                onChange={(e) => handleInputChange("nome_medicamento", e.target.value)}
                placeholder="Ex: Rimadyl, Metacam, etc."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dosagem">Dosagem *</Label>
              <Input
                id="dosagem"
                value={formData.dosagem}
                onChange={(e) => handleInputChange("dosagem", e.target.value)}
                placeholder="Ex: 25mg, 1 comprimido, etc."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequencia">Frequência *</Label>
              <Select value={formData.frequencia} onValueChange={(value) => handleInputChange("frequencia", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a frequência" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1x ao dia">1x ao dia</SelectItem>
                  <SelectItem value="2x ao dia">2x ao dia</SelectItem>
                  <SelectItem value="3x ao dia">3x ao dia</SelectItem>
                  <SelectItem value="A cada 8 horas">A cada 8 horas</SelectItem>
                  <SelectItem value="A cada 12 horas">A cada 12 horas</SelectItem>
                  <SelectItem value="Quando necessário">Quando necessário</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.frequencia === "outro" && (
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="frequencia_custom">Frequência Personalizada</Label>
                <Input
                  id="frequencia_custom"
                  value={formData.frequencia}
                  onChange={(e) => handleInputChange("frequencia", e.target.value)}
                  placeholder="Descreva a frequência"
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="data_inicio">Data e Hora de Início *</Label>
              <Input
                id="data_inicio"
                type="datetime-local"
                step="300"
                value={formData.data_inicio}
                onChange={(e) => handleInputChange("data_inicio", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="data_termino">Data de Término</Label>
              <Input
                id="data_termino"
                type="date"
                value={formData.data_termino}
                onChange={(e) => handleInputChange("data_termino", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => handleInputChange("observacoes", e.target.value)}
              placeholder="Observações sobre o medicamento, efeitos colaterais, etc..."
              rows={4}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="medicamento_ativo"
              checked={formData.medicamento_ativo}
              onCheckedChange={(checked) => handleInputChange("medicamento_ativo", checked)}
            />
            <Label htmlFor="medicamento_ativo">Medicamento ativo</Label>
          </div>

          {formData.medicamento_ativo && (
            <div className="space-y-4 pt-4 border-t border-emerald-100">
              <p className="text-xs text-emerald-600">
                Um lembrete será criado automaticamente para administrar este medicamento conforme a frequência definida
              </p>
            </div>
          )}

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading} className="bg-emerald-600 hover:bg-emerald-700">
              {isLoading ? "Salvando..." : isEditing ? "Atualizar Medicamento" : "Adicionar Medicamento"}
            </Button>
            <Button
              type="button"
              variant="outline"
              asChild
              className="border-emerald-300 text-emerald-700 bg-transparent"
            >
              <Link href="/medicamentos">Cancelar</Link>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
