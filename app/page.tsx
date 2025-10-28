import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, Calendar, Shield, Bell } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="h-8 w-8 text-emerald-600" />
            <h1 className="text-2xl font-bold text-emerald-800">PetCheck</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/auth/login">Entrar</Link>
            </Button>
            <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
              <Link href="/auth/sign-up">Cadastrar</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-bold text-emerald-800 mb-6 text-balance">
            Cuidado completo para seu pet
          </h2>
          <p className="text-xl text-emerald-700 mb-8 text-pretty">
            Gerencie consultas, vacinas, lembretes e mantenha o histórico completo da saúde do seu companheiro de quatro
            patas
          </p>
          <Button size="lg" asChild className="bg-emerald-600 hover:bg-emerald-700">
            <Link href="/auth/sign-up">Começar agora</Link>
          </Button>
        </div>
      </section>

       {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-emerald-200 hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <Calendar className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle className="text-emerald-800">Calendário Inteligente</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Agende e acompanhe consultas, vacinas e cuidados essenciais
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-emerald-200 hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <Shield className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <CardTitle className="text-emerald-800">Histórico Médico</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Mantenha todos os registros de saúde organizados e acessíveis
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-emerald-200 hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <Bell className="h-12 w-12 text-amber-600 mx-auto mb-4" />
              <CardTitle className="text-emerald-800">Lembretes Inteligentes</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Nunca esqueça de compromissos importantes do seu pet
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-emerald-200 hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <Heart className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <CardTitle className="text-emerald-800">Cuidado Completo</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Tudo que você precisa para manter seu pet saudável e feliz
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-emerald-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="h-6 w-6" />
            <span className="text-xl font-bold">PetCheck</span>
          </div>
          <p className="text-emerald-200">Desenvolvido com amor para você e seu pet</p>
        </div>
      </footer>
    </div>
  )
}
