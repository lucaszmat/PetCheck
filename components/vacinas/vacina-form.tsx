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
import { ArrowLeft, Shield } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { criarNotificacao } from "@/lib/notifications"

interface Pet {
  id: string
  nome: string
  especie: string
}

interface VacinaFormProps {
  pets: Pet[]
  vacina?: any
  isEditing?: boolean
}

export function VacinaForm({ pets, vacina, isEditing = false }: VacinaFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const { user } = useAuth()

  const [formData, setFormData] = useState({
    pet_id: vacina?.pet_id || "",
    nome_vacina: vacina?.nome_vacina || "",
nome_vacina_custom: "",
    data_aplicacao: vacina?.data_aplicacao || "",
    data_proxima_dose: vacina?.data_proxima_dose 
      ? (vacina.data_proxima_dose.includes("T") 
          ? new Date(vacina.data_proxima_dose).toISOString().slice(0, 16)
          : new Date(vacina.data_proxima_dose + "T09:00:00").toISOString().slice(0, 16))
      : "",
    veterinario: vacina?.veterinario || "",
    clinica: vacina?.clinica || "",
    lote: vacina?.lote || "",
    observacoes: vacina?.observacoes || "",
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Vacinas comuns por espécie
  const vacinasComuns = {
    cão: [
      "V8 (Múltipla)",
      "V10 (Múltipla)",
      "Antirrábica",
      "Gripe Canina (Tosse dos Canis)",
      "Giardíase",
      "Leishmaniose",
      "Traqueobronquite",
    ],
    gato: ["V4 (Múltipla)", "V5 (Múltipla)", "Antirrábica", "FeLV (Leucemia Felina)", "FIV (AIDS Felina)"],
    outro: [],
  }

  const selectedPet = pets.find((p) => p.id === formData.pet_id)
  const vacinasDisponiveis = selectedPet ? vacinasComuns[selectedPet.especie as keyof typeof vacinasComuns] || [] : []

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      if (!user || !(user as any).id) throw new Error("Usuário não autenticado")

      const vacinaData = {
  tutor_id: (user as any).id,
  pet_id: formData.pet_id,
  nome_vacina:
    formData.nome_vacina === "outra"
      ? formData.nome_vacina_custom
      : formData.nome_vacina,
  data_aplicacao: new Date(formData.data_aplicacao).toISOString().split("T")[0],
  data_proxima_dose: formData.data_proxima_dose
    ? new Date(formData.data_proxima_dose).toISOString().split("T")[0]
    : null,
  veterinario: formData.veterinario,
  clinica: formData.clinica,
  lote: formData.lote,
  observacoes: formData.observacoes,
}


      if (isEditing && vacina) {
        const { error } = await supabase.from("vacinas").update(vacinaData).eq("id", vacina.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from("vacinas").insert([vacinaData])
        if (error) throw error
      }

      // Criar lembrete no banco (sempre que houver data_proxima_dose)
      if (formData.data_proxima_dose && !isEditing) {
        const selectedPet = pets.find((p) => p.id === formData.pet_id)
        const dataProximaDoseISO = formData.data_proxima_dose.includes("T")
          ? new Date(formData.data_proxima_dose).toISOString()
          : new Date(formData.data_proxima_dose + "T09:00:00").toISOString()
        
        const lembreteData = {
          tutor_id: (user as any).id,
          pet_id: formData.pet_id,
          titulo: `Próxima dose da vacina ${formData.nome_vacina} - ${selectedPet?.nome || "pet"}`,
          descricao: `Lembrete para aplicar a próxima dose da vacina ${formData.nome_vacina} em ${selectedPet?.nome || "o pet"}`,
          data_lembrete: dataProximaDoseISO,
          tipo: "vacina",
          status: "ativo",
          recorrencia: "unica",
        }

        const { error: lembreteError } = await supabase.from("lembretes").insert([lembreteData])
        if (lembreteError) {
          console.warn("Erro ao criar lembrete:", lembreteError)
          // Não interrompe o fluxo se falhar ao criar o lembrete
        }

        // Criar notificação na API
        const notificacaoResult = await criarNotificacao({
          tutor_id: (user as any).id,
          titulo: `Próxima dose da vacina ${formData.nome_vacina} - ${selectedPet?.nome || "pet"}`,
          data_lembrete: dataProximaDoseISO,
          notificar_antecedencia: true,
          minutos_antecedencia: 60, // Padrão: 1 hora antes
        })

        if (!notificacaoResult.success) {
          console.warn("Aviso: Vacina salva, mas falhou ao criar notificação:", notificacaoResult.error)
          // Não interrompe o fluxo se falhar ao criar notificação
        }
      }

      router.push("/vacinas")
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
          <Shield className="h-16 w-16 text-emerald-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-emerald-800 mb-2">Nenhum pet cadastrado</h3>
          <p className="text-emerald-600 mb-6">Você precisa cadastrar um pet antes de registrar uma vacina</p>
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
            <Link href="/vacinas">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <CardTitle className="text-emerald-800 flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {isEditing ? "Editar Vacina" : "Nova Vacina"}
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
              <Label htmlFor="nome_vacina">Nome da Vacina *</Label>
              {vacinasDisponiveis.length > 0 ? (
                <Select value={formData.nome_vacina} onValueChange={(value) => handleInputChange("nome_vacina", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Ex: V10, Antirrábica, etc." />
                  </SelectTrigger>
                  <SelectContent>
                    {vacinasDisponiveis.map((vacina) => (
                      <SelectItem key={vacina} value={vacina}>
                        {vacina}
                      </SelectItem>
                    ))}
                    <SelectItem value="outra">Outra vacina</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id="nome_vacina"
                  value={formData.nome_vacina}
                  onChange={(e) => handleInputChange("nome_vacina", e.target.value)}
                  placeholder="Ex: V10, Antirrábica, etc."
                  required
                />
              )}
            </div>

            {formData.nome_vacina === "outra" && (
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="nome_vacina_custom">Nome da Vacina</Label>
                <Input
              id="nome_vacina_custom"
              value={formData.nome_vacina_custom}
              onChange={(e) => handleInputChange("nome_vacina_custom", e.target.value)}
              placeholder="Digite o nome da vacina"
              required
              />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="data_aplicacao">Data de Aplicação *</Label>
              <Input
                id="data_aplicacao"
                type="date"
                value={formData.data_aplicacao}
                onChange={(e) => handleInputChange("data_aplicacao", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="data_proxima_dose">Próxima Dose</Label>
              <Input
                id="data_proxima_dose"
                type="datetime-local"
                step="300"
                value={formData.data_proxima_dose}
                onChange={(e) => handleInputChange("data_proxima_dose", e.target.value)}
              />
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

            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="lote">Lote da Vacina</Label>
              <Input
                id="lote"
                value={formData.lote}
                onChange={(e) => handleInputChange("lote", e.target.value)}
                placeholder="Número do lote"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => handleInputChange("observacoes", e.target.value)}
              placeholder="Observações sobre a vacina..."
              rows={4}
            />
          </div>

          {formData.data_proxima_dose && (
            <div className="space-y-4 pt-4 border-t border-emerald-100">
              <p className="text-xs text-emerald-600">
                Um lembrete será criado automaticamente para a próxima dose em {new Date(formData.data_proxima_dose).toLocaleString("pt-BR")}
              </p>
            </div>
          )}

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading} className="bg-emerald-600 hover:bg-emerald-700">
              {isLoading ? "Salvando..." : isEditing ? "Atualizar Vacina" : "Registrar Vacina"}
            </Button>
            <Button
              type="button"
              variant="outline"
              asChild
              className="border-emerald-300 text-emerald-700 bg-transparent"
            >
              <Link href="/vacinas">Cancelar</Link>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
