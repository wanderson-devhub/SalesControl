"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Lock, Mail, LogIn } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [guestLoading, setGuestLoading] = useState<"client" | "admin" | null>(null)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Falha ao fazer login")
        return
      }

      router.push(data.user.isAdmin ? "/admin" : "/dashboard")
    } catch (err) {
      setError("Erro ao conectar ao servidor")
    } finally {
      setLoading(false)
    }
  }

  async function handleGuestLogin(type: "client" | "admin") {
    setError("")
    setGuestLoading(type)

    try {
      const response = await fetch("/api/auth/guest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Falha ao fazer login como convidado")
        return
      }

      router.push(type === "admin" ? "/admin" : "/dashboard")
    } catch (err) {
      setError("Erro ao conectar ao servidor")
    } finally {
      setGuestLoading(null)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>Acesse sua conta para controlar o estoque</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive rounded-md text-sm text-destructive">
                {error}
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Conectando..." : "Entrar"}
            </Button>
          </form>

          <div className="mt-6 space-y-3">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Ou teste como convidado</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={guestLoading !== null}
                onClick={() => handleGuestLogin("client")}
              >
                {guestLoading === "client" ? (
                  "Carregando..."
                ) : (
                  <>
                    <LogIn className="h-4 w-4 mr-2" />
                    Cliente
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={guestLoading !== null}
                onClick={() => handleGuestLogin("admin")}
              >
                {guestLoading === "admin" ? (
                  "Carregando..."
                ) : (
                  <>
                    <LogIn className="h-4 w-4 mr-2" />
                    Admin
                  </>
                )}
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center">Acesso de teste com dados fictícios</p>
          </div>

          <div className="mt-4 text-center text-sm space-y-2">
            <div>
              <span className="text-muted-foreground">Não tem conta? </span>
              <Link href="/register" className="text-primary hover:underline font-medium">
                Cadastre-se
              </Link>
            </div>
            <div>
              <Link href="/forgot-password" className="text-primary hover:underline font-medium">
                Esqueceu a senha?
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
