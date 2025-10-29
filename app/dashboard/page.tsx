"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { PetsOverview } from "@/components/dashboard/pets-overview"
import { UpcomingAppointments } from "@/components/dashboard/upcoming-appointments"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { HelpButton } from "@/components/dashboard/help-button"

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login")
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-emerald-600">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-50 to-teal-50">
      <DashboardHeader user={user} profile={user} />

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8">
          {/* Seção de boas-vindas e resumo */}
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <PetsOverview pets={[]} />
            </div>
            <div>
              <QuickActions />
            </div>
          </div>

          {/* Seção de compromissos e atividades */}
          <div className="grid lg:grid-cols-2 gap-6">
            <UpcomingAppointments consultas={[]} lembretes={[]} />
            <RecentActivity pets={[]} />
          </div>
        </div>
      </main>
      <HelpButton />
    </div>
  )
}