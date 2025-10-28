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
import { ArrowLeft, Stethoscope } from "lucide-react"
import Link from "next/link"

interface Pet {
  id: string
  nome: string
}

interface ConsultaFormProps {
  pets: Pet[]
  consulta?: any
  isEditing?: boolean
}

export function ConsultaForm({ pets, consulta, isEditing = false }: ConsultaFormProps) {
  const router = useRouter()
  const supabase = createClient()

  const [formData, setFormData] = useState({
    pet_id: consulta?.pet_id || "",
    tipo_consulta: consulta?.tipo_consulta || "",
    veterinario: consulta?.veterinario || "",
    clinica: consulta?.clinica || "",
    data_consulta: consulta?.data_consulta ? new Date(consulta.data_consulta).toISOString().slice(0, 16) : "",
    diagnostico: consulta?.diagnostico || "",
    tratamento: consulta?.tratamento || "",
    observacoes: consulta?.observacoes || "",
    valor: consulta?.valor || "",
    status: consulta?.status || "agendada",
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) throw new Error("Usuário não autenticado")

      const consultaData = {
        ...formData,
        valor: formData.valor ? Number.parseFloat(formData.valor) : null,
        tutor_id: user.user.id,
        data_consulta: new Date(formData.data_consulta).toISOString(),
      }

      if (isEditing && consulta) {
        const { error } = await supabase.from("consultas").update(consultaData).eq("id", consulta.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from("consultas").insert([consultaData])
        if (error) throw error
      }

      router.push("/consultas")
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
          <Stethoscope className="h-16 w-16 text-emerald-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-emerald-800 mb-2">Nenhum pet cadastrado</h3>
          <p className="text-emerald-600 mb-6">Você precisa cadastrar um pet antes de agendar uma consulta</p>
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
            <Link href="/consultas">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <CardTitle className="text-emerald-800 flex items-center gap-2">
            <Stethoscope className="h-5 w-5" />
            {isEditing ? "Editar Consulta" : "Nova Consulta"}
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
                      {pet.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo_consulta">Tipo de Consulta *</Label>
              <Select
                value={formData.tipo_consulta}
                onValueChange={(value) => handleInputChange("tipo_consulta", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rotina">Rotina</SelectItem>
                  <SelectItem value="vacinacao">Vacinação</SelectItem>
                  <SelectItem value="cirurgia">Cirurgia</SelectItem>
                  <SelectItem value="check-up">Check-up</SelectItem>
                  <SelectItem value="emergencia">Emergência</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="veterinario">Veterinário</Label>
              <Input
                id="veterinario"
                value={formData.veterinario}
                onChange={(e) => handleInputChange("veterinario", e.target.value)}
                placeholder="Nome do veterinário"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clinica">Clínica</Label>
              <Input
                id="clinica"
                value={formData.clinica}
                onChange={(e) => handleInputChange("clinica", e.target.value)}
                placeholder="Nome da clínica"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="data_consulta">Data e Hora *</Label>
              <Input
                id="data_consulta"
                type="datetime-local"
                value={formData.data_consulta}
                onChange={(e) => handleInputChange("data_consulta", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="valor">Valor (R$)</Label>
              <Input
                id="valor"
                type="number"
                step="0.01"
                value={formData.valor}
                onChange={(e) => handleInputChange("valor", e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="agendada">Agendada</SelectItem>
                  <SelectItem value="realizada">Realizada</SelectItem>
                  <SelectItem value="cancelada">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isEditing && (
            <>
              <div className="space-y-2">
                <Label htmlFor="diagnostico">Diagnóstico</Label>
                <Textarea
                  id="diagnostico"
                  value={formData.diagnostico}
                  onChange={(e) => handleInputChange("diagnostico", e.target.value)}
                  placeholder="Diagnóstico do veterinário..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tratamento">Tratamento</Label>
                <Textarea
                  id="tratamento"
                  value={formData.tratamento}
                  onChange={(e) => handleInputChange("tratamento", e.target.value)}
                  placeholder="Tratamento prescrito..."
                  rows={3}
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => handleInputChange("observacoes", e.target.value)}
              placeholder="Observações adicionais..."
              rows={3}
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading} className="bg-emerald-600 hover:bg-emerald-700">
              {isLoading ? "Salvando..." : isEditing ? "Atualizar Consulta" : "Agendar Consulta"}
            </Button>
            <Button
              type="button"
              variant="outline"
              asChild
              className="border-emerald-300 text-emerald-700 bg-transparent"
            >
              <Link href="/consultas">Cancelar</Link>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
