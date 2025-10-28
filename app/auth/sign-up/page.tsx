"use client"

import type React from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Eye, EyeOff, Check, X } from "lucide-react"

export default function Page() {
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [repeatPassword, setRepeatPassword] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showRepeatPassword, setShowRepeatPassword] = useState(false)
  const [step, setStep] = useState<"signup" | "verify">("signup")
  const [sentCode, setSentCode] = useState("")
  const router = useRouter()

  const validatePassword = (password: string) => {
    const minLength = password.length >= 6
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumber = /\d/.test(password)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

    return {
      minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumber,
      hasSpecialChar,
      isValid: minLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar,
    }
  }

  const validatePhone = (phone: string) => {
    const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
    return phoneRegex.test(phone)
  }

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 2) return `(${numbers}`
    if (numbers.length <= 3) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 3)}${numbers.slice(3, 7)}`
    if (numbers.length <= 11)
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 3)}${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 3)}${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`
  }

  const sendSMSVerification = async (phoneNumber: string) => {
    // Simular código de verificação (em produção, usar API real de SMS)
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    setSentCode(code)

    // Simular delay de envio
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Em produção, aqui seria feita a chamada para API de SMS
    console.log(`[v0] Código SMS enviado para ${phoneNumber}: ${code}`)

    return true
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (!validateEmail(email)) {
      setError("Por favor, insira um e-mail válido")
      setIsLoading(false)
      return
    }

    if (!validatePhone(phone)) {
      setError("Por favor, insira um telefone válido no formato (11) 9 9999-9999")
      setIsLoading(false)
      return
    }

    const passwordValidation = validatePassword(password)
    if (!passwordValidation.isValid) {
      setError("A senha não atende aos critérios de segurança")
      setIsLoading(false)
      return
    }

    if (password !== repeatPassword) {
      setError("As senhas não coincidem")
      setIsLoading(false)
      return
    }

    try {
      await sendSMSVerification(phone)
      setStep("verify")
    } catch (error: unknown) {
      setError("Erro ao enviar código de verificação")
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (verificationCode !== sentCode) {
      setError("Código de verificação inválido")
      setIsLoading(false)
      return
    }

    try {
      const supabase = createClient()

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            phone: phone,
            phone_verified: true,
          },
        },
      })

      if (error) throw error

      // Criar perfil com telefone verificado
      if (data.user) {
        const { error: profileError } = await supabase.from("profiles").insert({
          id: data.user.id,
          email: email,
          phone: phone,
          phone_verified: true,
        })

        if (profileError) {
          console.log("[v0] Erro ao criar perfil:", profileError)
        }
      }

      router.push("/dashboard")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Erro ao criar conta")
    } finally {
      setIsLoading(false)
    }
  }

  const passwordValidation = validatePassword(password)

  if (step === "verify") {
    return (
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Verificar Telefone</CardTitle>
              <CardDescription>Enviamos um código de verificação para {phone}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleVerifyCode}>
                <div className="flex flex-col gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="code">Código de Verificação</Label>
                    <Input
                      id="code"
                      type="text"
                      placeholder="000000"
                      maxLength={6}
                      required
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                      className="text-center text-lg tracking-widest"
                    />
                    <p className="text-xs text-muted-foreground">Digite o código de 6 dígitos enviado por WhatsApp</p>
                  </div>
                  {error && <p className="text-sm text-red-500">{error}</p>}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Verificando..." : "Verificar"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setStep("signup")} className="w-full">
                    Voltar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-emerald-600">Criar Conta</CardTitle>
              <CardDescription>Cadastre-se no PetCheck</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignUp}>
                <div className="flex flex-col gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={!validateEmail(email) && email.length > 0 ? "border-red-300" : ""}
                    />
                    {!validateEmail(email) && email.length > 0 && (
                      <p className="text-xs text-red-500">Digite um e-mail válido (exemplo@dominio.com)</p>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="(11) 9 9999-9999"
                      required
                      value={phone}
                      onChange={(e) => setPhone(formatPhone(e.target.value))}
                      className={!validatePhone(phone) && phone.length > 0 ? "border-red-300" : ""}
                    />
                    {!validatePhone(phone) && phone.length > 0 && (
                      <p className="text-xs text-red-500">Formato: (11) 9 9999-9999</p>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="password">Senha</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="******"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>

                    {password.length > 0 && (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs">
                          {passwordValidation.minLength ? (
                            <Check className="h-3 w-3 text-green-500" />
                          ) : (
                            <X className="h-3 w-3 text-red-500" />
                          )}
                          <span className={passwordValidation.minLength ? "text-green-600" : "text-red-600"}>
                            Mínimo 6 caracteres
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          {passwordValidation.hasUpperCase ? (
                            <Check className="h-3 w-3 text-green-500" />
                          ) : (
                            <X className="h-3 w-3 text-red-500" />
                          )}
                          <span className={passwordValidation.hasUpperCase ? "text-green-600" : "text-red-600"}>
                            Pelo menos 1 letra maiúscula
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          {passwordValidation.hasLowerCase ? (
                            <Check className="h-3 w-3 text-green-500" />
                          ) : (
                            <X className="h-3 w-3 text-red-500" />
                          )}
                          <span className={passwordValidation.hasLowerCase ? "text-green-600" : "text-red-600"}>
                            Pelo menos 1 letra minúscula
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          {passwordValidation.hasNumber ? (
                            <Check className="h-3 w-3 text-green-500" />
                          ) : (
                            <X className="h-3 w-3 text-red-500" />
                          )}
                          <span className={passwordValidation.hasNumber ? "text-green-600" : "text-red-600"}>
                            Pelo menos 1 número
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          {passwordValidation.hasSpecialChar ? (
                            <Check className="h-3 w-3 text-green-500" />
                          ) : (
                            <X className="h-3 w-3 text-red-500" />
                          )}
                          <span className={passwordValidation.hasSpecialChar ? "text-green-600" : "text-red-600"}>
                            Pelo menos 1 caractere especial
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="repeat-password">Confirmar Senha</Label>
                    <div className="relative">
                      <Input
                        id="repeat-password"
                        type={showRepeatPassword ? "text" : "password"}
                        placeholder="******"
                        required
                        value={repeatPassword}
                        onChange={(e) => setRepeatPassword(e.target.value)}
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                      >
                        {showRepeatPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {repeatPassword.length > 0 && password !== repeatPassword && (
                      <p className="text-xs text-red-500">As senhas não coincidem</p>
                    )}
                  </div>

                  {error && <p className="text-sm text-red-500">{error}</p>}

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={
                      isLoading || !passwordValidation.isValid || !validatePhone(phone) || !validateEmail(email)
                    }
                  >
                    {isLoading ? "Enviando código..." : "Continuar"}
                  </Button>
                </div>
                <div className="mt-4 text-center text-sm">
                  Já tem uma conta?{" "}
                  <Link href="/auth/login" className="underline underline-offset-4">
                    Fazer Login
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
