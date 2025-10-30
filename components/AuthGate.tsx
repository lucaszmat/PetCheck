"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"

type Props = {
  children: React.ReactNode
}

// Rotas públicas que não exigem autenticação via API
const PUBLIC_PATHS: RegExp[] = [
  /^\/$/,
  /^\/auth\//,
  /^\/privacy$/,
]

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((re) => re.test(pathname))
}

export default function AuthGate({ children }: Props) {
  const { isAuthenticated, isLoading } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  const isPublic = isPublicPath(pathname || "/")

  useEffect(() => {
    if (isLoading) return
    if (!isPublic && !isAuthenticated) {
      router.replace("/auth/login")
    }
  }, [isAuthenticated, isLoading, isPublic, router])

  if (!isPublic) {
    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600" />
        </div>
      )
    }
    if (!isAuthenticated) {
      return null
    }
  }

  return <>{children}</>
}


