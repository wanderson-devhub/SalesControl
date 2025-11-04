"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, ArrowLeft } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setMessage("")
    setLoading(true)

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Erro ao verificar email")
        return
      }

      // Redirecionar para página de reset com token
      router.push(`/reset-password?token=${data.token}`)
    } catch (err) {
      setError("Erro ao conectar ao servidor")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl">Esqueceu a Senha</CardTitle>
          <CardDescription>Digite seu email para receber um link de reset</CardDescription>
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

            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive rounded-md text-sm text-destructive">
                {error}
              </div>
            )}

            {message && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md text-sm text-green-800">
                {message}
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Enviando..." : "Enviar Link de Reset"}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            <Link href="/login" className="text-primary hover:underline font-medium flex items-center justify-center gap-1">
              <ArrowLeft className="h-4 w-4" />
              Voltar ao Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
