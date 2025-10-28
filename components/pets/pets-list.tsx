import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, Calendar, Edit } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface Pet {
  id: string
  nome: string
  especie: string
  raca?: string
  data_nascimento?: string
  peso?: number
  cor?: string
  sexo?: string
  castrado?: boolean
  foto_url?: string
  observacoes?: string
}

interface PetsListProps {
  pets: Pet[]
}

export function PetsList({ pets }: PetsListProps) {
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

  if (pets.length === 0) {
    return (
      <Card className="border-emerald-200">
        <CardContent className="text-center py-16">
          <Heart className="h-24 w-24 text-emerald-300 mx-auto mb-6" />
          <h3 className="text-xl font-semibold text-emerald-800 mb-2">Nenhum pet cadastrado</h3>
          <p className="text-emerald-600 mb-6">Adicione seu primeiro pet para começar a usar o PetCheck</p>
          <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
            <Link href="/pets/novo">
              <Heart className="h-4 w-4 mr-2" />
              Adicionar meu primeiro pet
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {pets.map((pet) => (
        <Card key={pet.id} className="border-emerald-200 hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="relative h-20 w-20 rounded-full overflow-hidden bg-emerald-100 flex-shrink-0">
                {pet.foto_url ? (
                  <Image src={pet.foto_url || "/placeholder.svg"} alt={pet.nome} fill className="object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <Heart className="h-10 w-10 text-emerald-400" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold text-emerald-800 truncate">{pet.nome}</h3>
                <p className="text-emerald-600">
                  {pet.raca || pet.especie}
                  {pet.data_nascimento && ` • ${calculateAge(pet.data_nascimento)} anos`}
                </p>
                {pet.peso && <p className="text-sm text-emerald-500">{pet.peso}kg</p>}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {pet.sexo && (
                <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                  {pet.sexo}
                </Badge>
              )}
              {pet.castrado && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  Castrado
                </Badge>
              )}
              {pet.cor && (
                <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                  {pet.cor}
                </Badge>
              )}
            </div>

            {pet.observacoes && <p className="text-sm text-emerald-600 mb-4 line-clamp-2">{pet.observacoes}</p>}

            <div className="flex gap-2">
              <Button asChild variant="outline" className="flex-1 border-emerald-300 text-emerald-700 bg-transparent">
                <Link href={`/pets/${pet.id}`}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Ver detalhes
                </Link>
              </Button>
              <Button asChild variant="ghost" size="icon" className="text-emerald-600">
                <Link href={`/pets/${pet.id}/editar`}>
                  <Edit className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
