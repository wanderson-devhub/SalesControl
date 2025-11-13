"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PasswordInput } from "@/components/ui/password-input"
import { Lock, Mail, LogIn, Package, BarChart3, Users, Shield } from "lucide-react"

export default function LandingPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Hero Section */}
      <section className="relative py-12 md:py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-foreground mb-4 md:mb-6">
            Controle de Estoque
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-6 md:mb-8 max-w-3xl mx-auto">
            Gerencie seu inventário de forma eficiente e intuitiva. Controle produtos, consumos e usuários com facilidade.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="text-base md:text-lg px-6 md:px-8 py-3 w-full sm:w-auto">
              Começar Agora
            </Button>
            <Button variant="outline" size="lg" className="text-base md:text-lg px-6 md:px-8 py-3 w-full sm:w-auto">
              Saiba Mais
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-16 px-4 bg-background/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 md:mb-12">Funcionalidades</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            <Card className="text-center p-4 md:p-6">
              <CardHeader>
                <Package className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-4 text-primary" />
                <CardTitle className="text-lg md:text-xl">Gerenciamento de Produtos</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm md:text-base">
                  Adicione, edite e organize seus produtos com categorias e informações detalhadas.
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="text-center p-4 md:p-6">
              <CardHeader>
                <BarChart3 className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-4 text-primary" />
                <CardTitle className="text-lg md:text-xl">Controle de Consumo</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm md:text-base">
                  Monitore o consumo de produtos e gere relatórios detalhados para melhor gestão.
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="text-center p-4 md:p-6 sm:col-span-2 md:col-span-1">
              <CardHeader>
                <Users className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-4 text-primary" />
                <CardTitle className="text-lg md:text-xl">Gestão de Usuários</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm md:text-base">
                  Administre usuários, permissões e acessos de forma segura e eficiente.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Login Section */}
      <section className="py-16 px-4">
        <div className="max-w-md mx-auto">
          <Card className="shadow-professional-lg">
            <CardHeader className="space-y-2">
              <CardTitle className="text-2xl text-center flex items-center justify-center gap-2">
                <Shield className="w-6 h-6" />
                Acesse sua conta
              </CardTitle>
              <CardDescription className="text-center">
                Entre para controlar o estoque
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Nome de Guerra ou Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="text"
                      placeholder="Nome de Guerra ou seu@email.com"
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
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
                    <PasswordInput
                      id="password"
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

              <div className="text-center text-sm space-y-2">
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
      </section>
    </div>
  )
}
