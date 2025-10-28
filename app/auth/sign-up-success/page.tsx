import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail, Heart } from "lucide-react"
import Link from "next/link"

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Card className="border-emerald-200">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Heart className="h-8 w-8 text-emerald-600" />
              <span className="text-2xl font-bold text-emerald-800">PetCheck</span>
            </div>
            <Mail className="h-16 w-16 text-emerald-600 mx-auto mb-4" />
            <CardTitle className="text-2xl text-emerald-800">Verifique seu email</CardTitle>
            <CardDescription className="text-emerald-700">
              Enviamos um link de confirmação para seu email. Clique no link para ativar sua conta.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-emerald-600 mb-6">
              Não recebeu o email? Verifique sua caixa de spam ou tente novamente.
            </p>
            <Button variant="outline" asChild className="w-full bg-transparent">
              <Link href="/auth/login">Voltar para o login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
