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
import { ArrowLeft, Heart } from "lucide-react"
import Link from "next/link"

interface PetFormProps {
  pet?: any
  isEditing?: boolean
}

export function PetForm({ pet, isEditing = false }: PetFormProps) {
  const router = useRouter()
  const supabase = createClient()

  const [formData, setFormData] = useState({
    nome: pet?.nome || "",
    especie: pet?.especie || "cão",
    raca: pet?.raca || "",
    data_nascimento: pet?.data_nascimento || "",
    peso: pet?.peso || "",
    cor: pet?.cor || "",
    sexo: pet?.sexo || "",
    castrado: pet?.castrado || false,
    observacoes: pet?.observacoes || "",
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (formData.data_nascimento) {
      const birthDate = new Date(formData.data_nascimento)
      const today = new Date()
      const ageInYears = (today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25)

      if (ageInYears > 60) {
        setError("A idade do pet não pode ser superior a 60 anos")
        setIsLoading(false)
        return
      }

      if (birthDate > today) {
        setError("A data de nascimento não pode ser no futuro")
        setIsLoading(false)
        return
      }
    }

    if (formData.peso && (Number.parseFloat(formData.peso) <= 0 || Number.parseFloat(formData.peso) > 1000)) {
      setError("O peso deve estar entre 0.1kg e 1000kg")
      setIsLoading(false)
      return
    }

    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) throw new Error("Usuário não autenticado")

      const petData = {
        ...formData,
        peso: formData.peso ? Number.parseFloat(formData.peso) : null,
        tutor_id: user.user.id,
      }

      if (isEditing && pet) {
        const { error } = await supabase.from("pets").update(petData).eq("id", pet.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from("pets").insert([petData])
        if (error) throw error
      }

      router.push("/pets")
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
            <Link href="/pets">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <CardTitle className="text-emerald-800 flex items-center gap-2">
            <Heart className="h-5 w-5" />
            {isEditing ? "Editar Pet" : "Novo Pet"}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => handleInputChange("nome", e.target.value)}
                placeholder="Nome do pet"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="especie">Espécie</Label>
              <Select value={formData.especie} onValueChange={(value) => handleInputChange("especie", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cão">Cão</SelectItem>
                  <SelectItem value="gato">Gato</SelectItem>
                  <SelectItem value="pássaro">Pássaro</SelectItem>
                  <SelectItem value="peixe">Peixe</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="raca">Raça</Label>
              <Input
                id="raca"
                value={formData.raca}
                onChange={(e) => handleInputChange("raca", e.target.value)}
                placeholder="Raça do pet"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="data_nascimento">Data de Nascimento</Label>
              <Input
                id="data_nascimento"
                type="date"
                value={formData.data_nascimento}
                onChange={(e) => handleInputChange("data_nascimento", e.target.value)}
                max={new Date().toISOString().split("T")[0]}
                min={new Date(new Date().getFullYear() - 60, 0, 1).toISOString().split("T")[0]}
              />
              <p className="text-xs text-emerald-600">Idade máxima: 60 anos</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="peso">Peso (kg)</Label>
              <Input
                id="peso"
                type="number"
                step="0.1"
                value={formData.peso}
                onChange={(e) => handleInputChange("peso", e.target.value)}
                placeholder="0.0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cor">Cor</Label>
              <Input
                id="cor"
                value={formData.cor}
                onChange={(e) => handleInputChange("cor", e.target.value)}
                placeholder="Cor do pet"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sexo">Sexo</Label>
              <Select value={formData.sexo} onValueChange={(value) => handleInputChange("sexo", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o sexo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="macho">Macho</SelectItem>
                  <SelectItem value="fêmea">Fêmea</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="castrado"
                checked={formData.castrado}
                onCheckedChange={(checked) => handleInputChange("castrado", checked)}
              />
              <Label htmlFor="castrado">Pet castrado</Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => handleInputChange("observacoes", e.target.value)}
              placeholder="Informações adicionais sobre o pet..."
              rows={4}
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading} className="bg-emerald-600 hover:bg-emerald-700">
              {isLoading ? "Salvando..." : isEditing ? "Atualizar Pet" : "Cadastrar Pet"}
            </Button>
            <Button
              type="button"
              variant="outline"
              asChild
              className="border-emerald-300 text-emerald-700 bg-transparent"
            >
              <Link href="/pets">Cancelar</Link>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
