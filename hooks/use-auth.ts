"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

interface User {
  id: string
  nome: string
  email: string
  telefone: string
  phone: string
  phone_verified: boolean
  created_at: string
  updated_at: string
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
  })

  useEffect(() => {
    const token = localStorage.getItem("auth_token")
    const userData = localStorage.getItem("user_data")

    if (token && userData) {
      try {
        const user = JSON.parse(userData)
        setAuthState({
          user,
          token,
          isLoading: false,
          isAuthenticated: true,
        })
      } catch (error) {
        console.error("Erro ao parsear dados do usuário:", error)
        logout()
      }
    } else {
      setAuthState({
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
      })
    }
  }, [])

  const login = async (email: string, senha: string) => {
    try {
      const response = await fetch("https://api.petcheck.codexsengineer.com.br/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          senha,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Email ou senha incorretos")
      }

      if (data.success && data.data) {
        localStorage.setItem("auth_token", data.data.token)
        localStorage.setItem("user_data", JSON.stringify(data.data.user))

        setAuthState({
          user: data.data.user,
          token: data.data.token,
          isLoading: false,
          isAuthenticated: true,
        })

        // Vincular sessão do Supabase para passar pelas RLS nas escritas
        try {
          const supabase = createClient()
          const { error: supaErr } = await supabase.auth.signInWithPassword({
            email,
            password: senha,
          })
          if (supaErr) {
            // eslint-disable-next-line no-console
            console.warn("Supabase auth falhou (RLS pode bloquear inserts):", supaErr.message)
          }
        } catch (e) {
          // eslint-disable-next-line no-console
          console.warn("Exceção ao autenticar Supabase:", e)
        }

        return { success: true, user: data.data.user }
      }

      throw new Error("Resposta inválida da API")
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Erro ao fazer login" 
      }
    }
  }

  const logout = () => {
    localStorage.removeItem("auth_token")
    localStorage.removeItem("user_data")
    try {
      const supabase = createClient()
      supabase.auth.signOut()
    } catch {}
    setAuthState({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
    })
  }

  const getAuthHeaders = () => {
    const token = authState.token || localStorage.getItem("auth_token")
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  return {
    ...authState,
    login,
    logout,
    getAuthHeaders,
  }
}
