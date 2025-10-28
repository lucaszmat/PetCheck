import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Heart, Calendar, Shield } from "lucide-react"

interface Pet {
  id: string
  nome: string
  created_at: string
}

interface RecentActivityProps {
  pets: Pet[]
}

export function RecentActivity({ pets }: RecentActivityProps) {
  // Simular atividades recentes baseadas nos pets
  const recentActivities = pets.slice(0, 3).map((pet, index) => ({
    id: pet.id,
    type: index === 0 ? "pet_added" : index === 1 ? "vaccine_due" : "checkup_reminder",
    petName: pet.nome,
    date: pet.created_at,
    description:
      index === 0
        ? `${pet.nome} foi adicionado ao sistema`
        : index === 1
          ? `Vacina de ${pet.nome} está próxima do vencimento`
          : `Lembrete de check-up para ${pet.nome}`,
  }))

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "pet_added":
        return Heart
      case "vaccine_due":
        return Shield
      case "checkup_reminder":
        return Calendar
      default:
        return Activity
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case "pet_added":
        return "bg-green-100 text-green-600"
      case "vaccine_due":
        return "bg-orange-100 text-orange-600"
      case "checkup_reminder":
        return "bg-blue-100 text-blue-600"
      default:
        return "bg-gray-100 text-gray-600"
    }
  }

  return (
    <Card className="border-emerald-200">
      <CardHeader>
        <CardTitle className="text-emerald-800 flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Atividade Recente
        </CardTitle>
        <CardDescription>Últimas atualizações dos seus pets</CardDescription>
      </CardHeader>
      <CardContent>
        {recentActivities.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="h-16 w-16 text-emerald-300 mx-auto mb-4" />
            <p className="text-emerald-600">Nenhuma atividade recente</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentActivities.map((activity) => {
              const Icon = getActivityIcon(activity.type)
              return (
                <div key={activity.id} className="flex items-start gap-4 p-3 rounded-lg border border-emerald-100">
                  <div className={`p-2 rounded-lg ${getActivityColor(activity.type)}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-emerald-800">{activity.description}</p>
                    <p className="text-xs text-emerald-500 mt-1">
                      {new Date(activity.date).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
