"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Heart, Bell, Settings, LogOut } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter, usePathname } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import Link from "next/link"
import { useEffect, useState } from "react"
import { isToday, isTomorrow, isPast } from "date-fns"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface DashboardHeaderProps {
  user: any
  profile: any
}

interface Lembrete {
  id: string
  titulo: string
  data_lembrete: string
  tipo: string
  pets?: { nome: string }
}

export function DashboardHeader({ user, profile }: DashboardHeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const [lembretes, setLembretes] = useState<Lembrete[]>([])

  useEffect(() => {
    const fetchLembretes = async () => {
      const { data } = await supabase
        .from("lembretes")
        .select(`
          id,
          titulo,
          data_lembrete,
          tipo,
          pets (nome)
        `)
        .eq("tutor_id", user.id)
        .eq("status", "ativo")
        .order("data_lembrete", { ascending: true })

      if (data) {
        setLembretes(data)
      }
    }

    fetchLembretes()
  }, [user.id, supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return pathname === "/dashboard"
    }
    return pathname.startsWith(path)
  }

  const lembretesUrgentes = lembretes.filter((l) => {
    const dataLembrete = new Date(l.data_lembrete)
    return isPast(dataLembrete) || isToday(dataLembrete) || isTomorrow(dataLembrete)
  })

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case "consulta":
        return "🏥"
      case "vacina":
        return "💉"
      case "medicamento":
        return "💊"
      case "alimentacao":
        return "🍽️"
      default:
        return "📝"
    }
  }

  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <Heart className="h-8 w-8 text-emerald-600" />
            <h1 className="text-2xl font-bold text-emerald-800">PetCheck</h1>
          </Link>

          {/* Navegação */}
          <nav className="hidden md:flex items-center gap-6">
            <Button
              variant="ghost"
              asChild
              className={`text-emerald-700 hover:text-emerald-800 ${isActive("/dashboard") ? "bg-emerald-100" : ""}`}
            >
              <Link href="/dashboard">Dashboard</Link>
            </Button>
            <Button
              variant="ghost"
              asChild
              className={`text-emerald-700 hover:text-emerald-800 ${isActive("/pets") ? "bg-emerald-100" : ""}`}
            >
              <Link href="/pets">Meus Pets</Link>
            </Button>
            <Button
              variant="ghost"
              asChild
              className={`text-emerald-700 hover:text-emerald-800 ${isActive("/consultas") ? "bg-emerald-100" : ""}`}
            >
              <Link href="/consultas">Consultas</Link>
            </Button>
            <Button
              variant="ghost"
              asChild
              className={`text-emerald-700 hover:text-emerald-800 ${isActive("/vacinas") ? "bg-emerald-100" : ""}`}
            >
              <Link href="/vacinas">Vacinas</Link>
            </Button>
            <Button
              variant="ghost"
              asChild
              className={`text-emerald-700 hover:text-emerald-800 ${isActive("/medicamentos") ? "bg-emerald-100" : ""}`}
            >
              <Link href="/medicamentos">Medicamentos</Link>
            </Button>
            <Button
              variant="ghost"
              asChild
              className={`text-emerald-700 hover:text-emerald-800 ${isActive("/lembretes") ? "bg-emerald-100" : ""}`}
            >
              <Link href="/lembretes">Lembretes</Link>
            </Button>
          </nav>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="text-emerald-700 relative">
                  <Bell className="h-5 w-5" />
                  {lembretesUrgentes.length > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                      {lembretesUrgentes.length}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-emerald-800">Notificações</h4>
                    <Button variant="ghost" size="sm" asChild className="text-emerald-600">
                      <Link href="/lembretes">Ver todos</Link>
                    </Button>
                  </div>

                  {lembretesUrgentes.length === 0 ? (
                    <p className="text-sm text-emerald-600 text-center py-4">Nenhuma notificação urgente</p>
                  ) : (
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {lembretesUrgentes.slice(0, 5).map((lembrete) => {
                        const dataLembrete = new Date(lembrete.data_lembrete)
                        const isVencido = isPast(dataLembrete) && !isToday(dataLembrete)

                        return (
                          <div
                            key={lembrete.id}
                            className={`p-3 rounded-lg border ${
                              isVencido
                                ? "border-red-200 bg-red-50"
                                : isToday(dataLembrete)
                                  ? "border-yellow-200 bg-yellow-50"
                                  : "border-blue-200 bg-blue-50"
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <span className="text-lg">{getTipoIcon(lembrete.tipo)}</span>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-emerald-800 truncate">{lembrete.titulo}</p>
                                {lembrete.pets && <p className="text-xs text-emerald-600">{lembrete.pets.nome}</p>}
                                <p className="text-xs text-emerald-500">
                                  {isVencido
                                    ? "Vencido"
                                    : isToday(dataLembrete)
                                      ? "Hoje"
                                      : isTomorrow(dataLembrete)
                                        ? "Amanhã"
                                        : format(dataLembrete, "dd/MM", { locale: ptBR })}{" "}
                                  às {format(dataLembrete, "HH:mm")}
                                </p>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-emerald-100 text-emerald-700">
                      {profile?.nome?.charAt(0) || user?.email?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline text-emerald-700">{profile?.nome || "Usuário"}</span>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56">
                {/* Configurações -> Link correto */}
                <DropdownMenuItem asChild>
                  <Link href="/configuracoes" className="flex items-center w-full" aria-label="Ir para Configurações">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Configurações</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
