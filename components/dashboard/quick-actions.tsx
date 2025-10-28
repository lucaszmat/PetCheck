import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bell, PlusCircle, Stethoscope, Syringe, Pill } from "lucide-react"
import Link from "next/link"

export function QuickActions() {
  const actions = [
    {
      title: "Nova Consulta",
      description: "Agendar consulta veterinária",
      icon: Stethoscope,
      color: "bg-blue-500 hover:bg-blue-600",
      href: "/consultas/nova",
    },
    {
      title: "Registrar Vacina",
      description: "Adicionar nova vacinação",
      icon: Syringe,
      color: "bg-green-500 hover:bg-green-600",
      href: "/vacinas/nova",
    },
    {
      title: "Novo Medicamento",
      description: "Adicionar medicamento",
      icon: Pill,
      color: "bg-purple-500 hover:bg-purple-600",
      href: "/medicamentos/novo",
    },
    {
      title: "Criar Lembrete",
      description: "Novo lembrete de cuidado",
      icon: Bell,
      color: "bg-yellow-500 hover:bg-yellow-600",
      href: "/lembretes/novo",
    },
    {
      title: "Adicionar Pet",
      description: "Cadastrar novo pet",
      icon: PlusCircle,
      color: "bg-emerald-500 hover:bg-emerald-600",
      href: "/pets/novo",
    },
  ]

  return (
    <Card className="border-emerald-200">
      <CardHeader>
        <CardTitle className="text-emerald-800">Ações Rápidas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          {actions.map((action) => (
            <Button
              key={action.title}
              variant="outline"
              className="h-auto p-4 justify-start border-emerald-200 hover:bg-emerald-50 bg-transparent"
              asChild
            >
              <Link href={action.href}>
                <div className={`p-2 rounded-lg ${action.color} mr-3`}>
                  <action.icon className="h-4 w-4 text-white" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-emerald-800">{action.title}</div>
                  <div className="text-xs text-emerald-600">{action.description}</div>
                </div>
              </Link>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
