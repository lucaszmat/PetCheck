import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, Heart, Calendar } from "lucide-react"
import Image from "next/image"

interface Pet {
  id: string
  nome: string
  especie: string
  raca?: string
  data_nascimento?: string
  foto_url?: string
  sexo?: string
}

interface PetsOverviewProps {
  pets: Pet[]
}

export function PetsOverview({ pets }: PetsOverviewProps) {
  const calculateAge = (birthDate: string) => {
    const today = new Date()
    const birth = new Date(birthDate)
    const age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      return age - 1
    }
    return age
  }

  return (
    <Card className="border-emerald-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-emerald-800 flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Meus Pets
            </CardTitle>
            <CardDescription>
              {pets.length === 0
                ? "Adicione seu primeiro pet para começar"
                : `Você tem ${pets.length} pet${pets.length > 1 ? "s" : ""} cadastrado${pets.length > 1 ? "s" : ""}`}
            </CardDescription>
          </div>
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            <PlusCircle className="h-4 w-4 mr-2" />
            Adicionar Pet
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {pets.length === 0 ? (
          <div className="text-center py-8">
            <Heart className="h-16 w-16 text-emerald-300 mx-auto mb-4" />
            <p className="text-emerald-600 mb-4">Nenhum pet cadastrado ainda</p>
            <Button variant="outline" className="border-emerald-300 text-emerald-700 bg-transparent">
              Cadastrar meu primeiro pet
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {pets.slice(0, 4).map((pet) => (
              <div
                key={pet.id}
                className="flex items-center gap-4 p-4 rounded-lg border border-emerald-100 hover:bg-emerald-50 transition-colors"
              >
                <div className="relative h-16 w-16 rounded-full overflow-hidden bg-emerald-100">
                  {pet.foto_url ? (
                    <Image src={pet.foto_url || "/placeholder.svg"} alt={pet.nome} fill className="object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <Heart className="h-8 w-8 text-emerald-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-emerald-800">{pet.nome}</h3>
                  <p className="text-sm text-emerald-600">
                    {pet.raca || pet.especie}
                    {pet.data_nascimento && ` • ${calculateAge(pet.data_nascimento)} anos`}
                  </p>
                  <div className="flex gap-2 mt-2">
                    {pet.sexo && (
                      <Badge variant="secondary" className="text-xs bg-emerald-100 text-emerald-700">
                        {pet.sexo}
                      </Badge>
                    )}
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="text-emerald-600">
                  <Calendar className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {pets.length > 4 && (
              <div className="md:col-span-2 text-center pt-4">
                <Button variant="outline" className="border-emerald-300 text-emerald-700 bg-transparent">
                  Ver todos os pets ({pets.length})
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
