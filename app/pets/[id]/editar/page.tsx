"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/hooks/use-auth"
import { PetForm } from "@/components/pets/pet-form"

interface Pet {
  id: string
  nome: string
  especie: string
  raca?: string
  data_nascimento?: string
  peso?: number | string
  cor?: string
  sexo?: string
  castrado?: boolean
  foto_url?: string
  observacoes?: string
}

export default function EditPetPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()
  const supabase = createClient()

  const [pet, setPet] = useState<Pet | null>(null)
  const [loadingPet, setLoadingPet] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const petId = params?.id as string

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login")
    }
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    if (!petId || !user) return

    const fetchPet = async () => {
      try {
        setLoadingPet(true)
        setError(null)

        const { data, error } = await supabase
          .from("pets")
          .select("*")
          .eq("id", petId)
          .eq("tutor_id", (user as any).id)
          .single()

        if (error) {
          console.error(error)
          setError("Não foi possível carregar os dados do pet.")
          return
        }

        setPet(data as Pet)
      } catch (err) {
        console.error(err)
        setError("Ocorreu um erro ao carregar as informações do pet.")
      } finally {
        setLoadingPet(false)
      }
    }

    fetchPet()
  }, [petId, user, supabase])

  if (isLoading || loadingPet) {
    return (
      <div className="min-h-screen bg-linear-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
        <p className="text-emerald-600">Carregando pet para edição...</p>
      </div>
    )
  }

  if (!isAuthenticated || !user) return null

  if (!pet) {
    return (
      <div className="min-h-screen bg-linear-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
        <p className="text-emerald-600">
          {error || "Pet não encontrado ou você não tem permissão para editá-lo."}
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-50 to-teal-50">
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <PetForm pet={pet} isEditing />
      </main>
    </div>
  )
}
