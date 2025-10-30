"use client"

import { useEffect, useState } from "react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { PetsList } from "@/components/pets/pets-list"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"

type Pet = {
  id: string
  nome: string
  especie?: string
  created_at?: string
}

export default function PetsPage() {
  const { user, isAuthenticated, isLoading, getAuthHeaders } = useAuth()
  const [pets, setPets] = useState<Pet[] | null>(null)

  useEffect(() => {
    async function fetchPets() {
      try {
        // TODO: trocar para sua rota real quando disponível
        // Ex.: const res = await fetch("https://api.petcheck.codexsengineer.com.br/api/pets", { headers: getAuthHeaders() })
        setPets([])
      } catch {
        setPets([])
      }
    }
    if (isAuthenticated) fetchPets()
  }, [isAuthenticated, user?.id])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600" />
      </div>
    )
  }

  if (!isAuthenticated || !user) return null

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-50 to-teal-50">
      <DashboardHeader user={user as any} profile={user as any} />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-emerald-800">Meus Pets</h1>
            <p className="text-emerald-600 mt-2">
              {!pets || pets.length === 0
                ? "Nenhum pet cadastrado ainda"
                : `${pets.length} pet${pets.length > 1 ? "s" : ""} cadastrado${pets.length > 1 ? "s" : ""}`}
            </p>
          </div>
          <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
            <Link href="/pets/novo">
              <PlusCircle className="h-4 w-4 mr-2" />
              Adicionar Pet
            </Link>
          </Button>
        </div>

        <PetsList pets={pets || []} />
      </main>
    </div>
  )
}
