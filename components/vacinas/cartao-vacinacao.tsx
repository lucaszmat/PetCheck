"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Shield, Calendar, FileText } from "lucide-react"
import { useState } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface Pet {
  id: string
  nome: string
  especie: string
}

interface Vacina {
  id: string
  nome_vacina: string
  data_aplicacao: string
  data_proxima_dose?: string
  veterinario?: string
  pet_id: string
}

interface CartaoVacinacaoProps {
  pets: Pet[]
  vacinas: Vacina[]
}

export function CartaoVacinacao({ pets, vacinas }: CartaoVacinacaoProps) {
  const [selectedPetId, setSelectedPetId] = useState<string>(pets[0]?.id || "")

  const selectedPet = pets.find((p) => p.id === selectedPetId)
  const petVacinas = vacinas.filter((v) => v.pet_id === selectedPetId)

  // Vacinas essenciais por espécie
  const vacinasEssenciais = {
    cão: ["V8 ou V10 (Múltipla)", "Antirrábica", "Gripe Canina (Tosse dos Canis)", "Giardíase", "Leishmaniose"],
    gato: ["V4 ou V5 (Múltipla)", "Antirrábica", "FeLV (Leucemia Felina)", "FIV (AIDS Felina)"],
    outro: ["Consulte o veterinário"],
  }

  const vacinasRecomendadas =
    vacinasEssenciais[selectedPet?.especie as keyof typeof vacinasEssenciais] || vacinasEssenciais.outro

  const getVacinaStatus = (nomeVacina: string) => {
    const vacina = petVacinas.find((v) => v.nome_vacina.toLowerCase().includes(nomeVacina.toLowerCase()))
    if (!vacina) return "pendente"

    if (!vacina.data_proxima_dose) return "completa"

    const hoje = new Date()
    const proximaDose = new Date(vacina.data_proxima_dose)

    if (proximaDose < hoje) return "vencida"
    return "em-dia"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completa":
        return "bg-green-100 text-green-700"
      case "em-dia":
        return "bg-blue-100 text-blue-700"
      case "vencida":
        return "bg-red-100 text-red-700"
      case "pendente":
        return "bg-gray-100 text-gray-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  if (pets.length === 0) {
    return (
      <Card className="border-emerald-200">
        <CardContent className="text-center py-8">
          <Shield className="h-12 w-12 text-emerald-300 mx-auto mb-4" />
          <p className="text-emerald-600 mb-4">Nenhum pet cadastrado</p>
          <Button variant="outline" className="border-emerald-300 text-emerald-700 bg-transparent">
            Cadastrar pet
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="border-emerald-200">
        <CardHeader>
          <CardTitle className="text-emerald-800 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Cartão de Vacinação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-emerald-700 mb-2 block">Selecionar Pet</label>
              <Select value={selectedPetId} onValueChange={setSelectedPetId}>
                <SelectTrigger>
                  <SelectValue />
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

            {selectedPet && (
              <div>
                <h4 className="font-medium text-emerald-800 mb-3">Vacinas Recomendadas</h4>
                <div className="space-y-2">
                  {vacinasRecomendadas.map((vacina) => {
                    const status = getVacinaStatus(vacina)
                    return (
                      <div
                        key={vacina}
                        className="flex items-center justify-between p-2 rounded border border-emerald-100"
                      >
                        <span className="text-sm text-emerald-800">{vacina}</span>
                        <Badge variant="secondary" className={getStatusColor(status)}>
                          {status === "completa"
                            ? "Completa"
                            : status === "em-dia"
                              ? "Em dia"
                              : status === "vencida"
                                ? "Vencida"
                                : "Pendente"}
                        </Badge>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-emerald-200">
        <CardHeader>
          <CardTitle className="text-emerald-800 flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Próximas Doses
          </CardTitle>
        </CardHeader>
        <CardContent>
          {petVacinas.filter((v) => v.data_proxima_dose).length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-emerald-300 mx-auto mb-4" />
              <p className="text-emerald-600">Nenhuma dose pendente</p>
            </div>
          ) : (
            <div className="space-y-3">
              {petVacinas
                .filter((v) => v.data_proxima_dose)
                .sort((a, b) => new Date(a.data_proxima_dose!).getTime() - new Date(b.data_proxima_dose!).getTime())
                .slice(0, 5)
                .map((vacina) => (
                  <div
                    key={vacina.id}
                    className="flex items-center justify-between p-3 rounded border border-emerald-100"
                  >
                    <div>
                      <p className="font-medium text-emerald-800">{vacina.nome_vacina}</p>
                      <p className="text-xs text-emerald-500">
                        {format(new Date(vacina.data_proxima_dose!), "dd/MM/yyyy", { locale: ptBR })}
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className={
                        new Date(vacina.data_proxima_dose!) < new Date()
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }
                    >
                      {new Date(vacina.data_proxima_dose!) < new Date() ? "Vencida" : "Próxima"}
                    </Badge>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
