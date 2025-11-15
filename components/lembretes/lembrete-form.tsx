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
import { ArrowLeft, Bell } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { criarNotificacao } from "@/lib/notifications"

interface Pet {
  id: string
  nome: string
}

interface LembreteFormProps {
  pets: Pet[]
  lembrete?: any
  isEditing?: boolean
}

export function LembreteForm({ pets, lembrete, isEditing = false }: LembreteFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const { user } = useAuth()

  const tiposLembrete = [
    { value: "consulta", label: "Consulta Veterinária" },
    { value: "vacina", label: "Vacina" },
    { value: "medicamento", label: "Medicamento" },
    { value: "alimentacao", label: "Alimentação" },
    { value: "outro", label: "Outro" },
  ]

  const tiposRecorrencia = [
    { value: "unica", label: "Única vez" },
    { value: "diaria", label: "Diariamente" },
    { value: "semanal", label: "Semanalmente" },
    { value: "mensal", label: "Mensalmente" },
    { value: "anual", label: "Anualmente" },
  ]

  const [formData, setFormData] = useState({
    pet_id: lembrete?.pet_id || "",
    titulo: lembrete?.titulo || "",
    descricao: lembrete?.descricao || "",
    data_lembrete: lembrete?.data_lembrete ? new Date(lembrete.data_lembrete).toISOString().slice(0, 16) : "",
    // antes era "outro" por padrão; agora deixo vazio pra forçar escolha ou texto
    tipo: lembrete?.tipo || "",
    recorrencia: lembrete?.recorrencia || "unica",
    notificar_antecedencia: lembrete?.notificar_antecedencia ?? false,
    minutos_antecedencia: lembrete?.minutos_antecedencia || 60,
  })

  // controla se o tipo é "Outro" (para mostrar o input)
  const [isOtherTipo, setIsOtherTipo] = useState(() => {
    const t = lembrete?.tipo || ""
    if (!t) return false
    // se o tipo salvo NÃO é um dos valores padrão, consideramos "outro"
    const knownValues = tiposLembrete.map((t) => t.value).filter((v) => v !== "outro")
    return !knownValues.includes(t)
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      if (!user || !(user as any).id) throw new Error("Usuário não autenticado")

      const lembreteData = {
        ...formData,
        tutor_id: (user as any).id,
        data_lembrete: new Date(formData.data_lembrete).toISOString(),
        pet_id: formData.pet_id || null,
        status: "ativo",
        notificar_antecedencia: formData.notificar_antecedencia || false,
        minutos_antecedencia: formData.notificar_antecedencia ? formData.minutos_antecedencia : null,
      }

      if (isEditing && lembrete) {
        const { error } = await supabase.from("lembretes").update(lembreteData).eq("id", lembrete.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from("lembretes").insert([lembreteData])
        if (error) throw error
      }

      // Criar notificação na API (sempre criar notificação em novo lembrete)
      if (!isEditing) {
        const notificacaoResult = await criarNotificacao({
          tutor_id: (user as any).id,
          titulo: formData.titulo || "Lembrete",
          data_lembrete: lembreteData.data_lembrete,
          notificar_antecedencia: formData.notificar_antecedencia || false,
          minutos_antecedencia: formData.minutos_antecedencia || 60,
        })

        if (!notificacaoResult.success) {
          console.warn("Aviso: Lembrete salvo, mas falhou ao criar notificação:", notificacaoResult.error)
        }
      }

      router.push("/lembretes")
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Card className="border-emerald-200">
      <CardHeader>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="text-emerald-600">
            <Link href="/lembretes">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <CardTitle className="text-emerald-800 flex items-center gap-2">
            <Bell className="h-5 w-5" />
            {isEditing ? "Editar Lembrete" : "Novo Lembrete"}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="titulo">Título *</Label>
              <Input
                id="titulo"
                value={formData.titulo}
                onChange={(e) => handleInputChange("titulo", e.target.value)}
                placeholder="Ex: Dar medicamento para Max"
                required
              />
            </div>

            {/* Tipo de Lembrete + Outro */}
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de Lembrete</Label>
              <Select
                value={
                  isOtherTipo && formData.tipo !== ""
                    ? "outro"
                    : formData.tipo
                }
                onValueChange={(value) => {
                  if (value === "outro") {
                    setIsOtherTipo(true)
                    // limpa para o usuário digitar o tipo livre
                    handleInputChange("tipo", "")
                  } else {
                    setIsOtherTipo(false)
                    handleInputChange("tipo", value)
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {tiposLembrete.map((tipo) => (
                    <SelectItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isOtherTipo && (
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="outro-tipo">Qual tipo?</Label>
                <Input
                  id="outro-tipo"
                  placeholder="Ex.: Retorno, Exame, Controle..."
                  value={formData.tipo}
                  onChange={(e) => handleInputChange("tipo", e.target.value)}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="pet_id">Pet (Opcional)</Label>
              <Select
                value={formData.pet_id || "none"}
                onValueChange={(value) => handleInputChange("pet_id", value === "none" ? "" : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um pet (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum pet específico</SelectItem>
                  {pets.map((pet) => (
                    <SelectItem key={pet.id} value={pet.id}>
                      {pet.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="data_lembrete">Data e Hora *</Label>
              <Input
                id="data_lembrete"
                type="datetime-local"
                step="300"
                value={formData.data_lembrete}
                onChange={(e) => handleInputChange("data_lembrete", e.target.value)}
                required
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="recorrencia">Recorrência</Label>
              <Select
                value={formData.recorrencia}
                onValueChange={(value) => handleInputChange("recorrencia", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tiposRecorrencia.map((recorrencia) => (
                    <SelectItem key={recorrencia.value} value={recorrencia.value}>
                      {recorrencia.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => handleInputChange("descricao", e.target.value)}
              placeholder="Detalhes adicionais sobre o lembrete..."
              rows={4}
            />
          </div>

          <div className="space-y-4 pt-4 border-t border-emerald-100">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="notificar_antecedencia"
                checked={formData.notificar_antecedencia}
                onCheckedChange={(checked) => handleInputChange("notificar_antecedencia", checked)}
              />
              <Label htmlFor="notificar_antecedencia" className="font-normal cursor-pointer">
                Notificar com antecedência
              </Label>
            </div>
            {formData.notificar_antecedencia && (
              <div className="space-y-2 pl-6">
                <Label htmlFor="minutos_antecedencia">Minutos antes do lembrete</Label>
                <Input
                  id="minutos_antecedencia"
                  type="number"
                  min="1"
                  value={formData.minutos_antecedencia}
                  onChange={(e) =>
                    handleInputChange(
                      "minutos_antecedencia",
                      Number.isNaN(parseInt(e.target.value)) ? 60 : parseInt(e.target.value)
                    )
                  }
                  placeholder="Ex: 60, 120, etc."
                />
                <p className="text-xs text-emerald-600">
                  Você será notificado {formData.minutos_antecedencia} minuto
                  {formData.minutos_antecedencia !== 1 ? "s" : ""} antes do lembrete
                </p>
              </div>
            )}
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading} className="bg-emerald-600 hover:bg-emerald-700">
              {isLoading ? "Salvando..." : isEditing ? "Atualizar Lembrete" : "Criar Lembrete"}
            </Button>
            <Button
              type="button"
              variant="outline"
              asChild
              className="border-emerald-300 text-emerald-700 bg-transparent"
            >
              <Link href="/lembretes">Cancelar</Link>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
