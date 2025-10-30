"use client"

import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { PetForm } from "@/components/pets/pet-form"
import { useAuth } from "@/hooks/use-auth"

export default function NovoPetPage() {
  const { user, isAuthenticated, isLoading } = useAuth()

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
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-emerald-800">Adicionar Novo Pet</h1>
            <p className="text-emerald-600 mt-2">Preencha as informações do seu pet</p>
          </div>

          <PetForm />
        </div>
      </main>
    </div>
  )
}
