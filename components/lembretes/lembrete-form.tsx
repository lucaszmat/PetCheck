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
import { ArrowLeft, Bell } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"

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

  const [formData, setFormData] = useState({
    pet_id: lembrete?.pet_id || "",
    titulo: lembrete?.titulo || "",
    descricao: lembrete?.descricao || "",
    data_lembrete: lembrete?.data_lembrete ? new Date(lembrete.data_lembrete).toISOString().slice(0, 16) : "",
    tipo: lembrete?.tipo || "outro",
    recorrencia: lembrete?.recorrencia || "unica",
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
      }

      if (isEditing && lembrete) {
        const { error } = await supabase.from("lembretes").update(lembreteData).eq("id", lembrete.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from("lembretes").insert([lembreteData])
        if (error) throw error
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

            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de Lembrete</Label>
              <Select value={formData.tipo} onValueChange={(value) => handleInputChange("tipo", value)}>
                <SelectTrigger>
                  <SelectValue />
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
                value={formData.data_lembrete}
                onChange={(e) => handleInputChange("data_lembrete", e.target.value)}
                required
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="recorrencia">Recorrência</Label>
              <Select value={formData.recorrencia} onValueChange={(value) => handleInputChange("recorrencia", value)}>
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
