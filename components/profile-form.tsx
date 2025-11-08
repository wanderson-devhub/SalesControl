"use client"

import type React from "react"

import { useState } from "react"
import type { User as UserType } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, Briefcase, Phone, Key, QrCode } from "lucide-react"

interface ProfileFormProps {
  user: UserType
}

export function ProfileForm({ user }: ProfileFormProps) {
  const [formData, setFormData] = useState({
    warName: user.warName,
    rank: user.rank || "",
    company: user.company || "",
    phone: user.phone,
    ...(user.isAdmin && {
      pixKey: user.pixKey || "",
      pixQrCode: user.pixQrCode || "",
    }),
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    let formattedValue = value

    if (name === 'phone') {
      const cleaned = value.replace(/\D/g, '')
      if (cleaned.length <= 11) {
        formattedValue = cleaned.replace(/(\d{0,2})(\d{0,1})(\d{0,4})(\d{0,4})/, (match, p1, p2, p3, p4) => {
          let result = ''
          if (p1) result += `(${p1}`
          if (p2) result += `) ${p2}`
          if (p3) result += ` ${p3}`
          if (p4) result += `-${p4}`
          return result
        })
      }
    }

    setFormData((prev) => ({ ...prev, [name]: formattedValue }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage("Perfil atualizado com sucesso!")
      } else {
        setMessage(data.error || "Erro ao atualizar perfil")
        console.error("Update error:", data)
      }
    } catch (error) {
      setMessage("Erro ao conectar ao servidor")
      console.error("Network error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Informações Pessoais
          </CardTitle>
          <CardDescription>Atualize seus dados de perfil</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="warName">Nome de Guerra</Label>
            <Input id="warName" name="warName" value={formData.warName} onChange={handleChange} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" value={user.email} disabled className="bg-muted" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rank">Posto/Graduação</Label>
            <Select value={formData.rank} onValueChange={(value) => setFormData({ ...formData, rank: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o posto/graduação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Soldado">Soldado</SelectItem>
                <SelectItem value="Cabo">Cabo</SelectItem>
                <SelectItem value="3º Sargento">3º Sargento</SelectItem>
                <SelectItem value="2º Sargento">2º Sargento</SelectItem>
                <SelectItem value="1º Sargento">1º Sargento</SelectItem>
                <SelectItem value="Subtenente">Subtenente</SelectItem>
                <SelectItem value="Aspirante">Aspirante</SelectItem>
                <SelectItem value="2º Tenente">2º Tenente</SelectItem>
                <SelectItem value="1º Tenente">1º Tenente</SelectItem>
                <SelectItem value="Capitão">Capitão</SelectItem>
                <SelectItem value="Major">Major</SelectItem>
                <SelectItem value="Tenente-Coronel">Tenente-Coronel</SelectItem>
                <SelectItem value="Coronel">Coronel</SelectItem>
                <SelectItem value="General de Brigada">General de Brigada</SelectItem>
                <SelectItem value="General de Divisão">General de Divisão</SelectItem>
                <SelectItem value="General de Exército">General de Exército</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">Companhia</Label>
            <Select value={formData.company} onValueChange={(value) => setFormData({ ...formData, company: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a companhia" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1ª Cia">1ª Cia</SelectItem>
                <SelectItem value="2ª Cia">2ª Cia</SelectItem>
                <SelectItem value="3ª Cia">3ª Cia</SelectItem>
                <SelectItem value="4ª Cia">4ª Cia</SelectItem>
                <SelectItem value="5ª Cia">5ª Cia</SelectItem>
                <SelectItem value="6ª Cia">6ª Cia</SelectItem>
                <SelectItem value="7ª Cia">7ª Cia</SelectItem>
                <SelectItem value="8ª Cia">8ª Cia</SelectItem>
                <SelectItem value="9ª Cia">9ª Cia</SelectItem>
                <SelectItem value="10ª Cia">10ª Cia</SelectItem>
                <SelectItem value="11ª Cia">11ª Cia</SelectItem>
                <SelectItem value="12ª Cia">12ª Cia</SelectItem>
                <SelectItem value="Cia Comando">Cia Comando</SelectItem>
                <SelectItem value="Cia Apoio">Cia Apoio</SelectItem>
                <SelectItem value="Pelotão Especial">Pelotão Especial</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                className="pl-10"
                maxLength={16}
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {user.isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Informações de Cobrança (Admin)
            </CardTitle>
            <CardDescription>Configure sua chave Pix e QR Code para cobranças</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pixKey">Chave Pix</Label>
              <Input
                id="pixKey"
                name="pixKey"
                value={formData.pixKey}
                onChange={handleChange}
                placeholder="Seu CPF, Email ou Chave Aleatória"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pixQrCode">QR Code Pix (URL da Imagem)</Label>
              <div className="relative">
                <QrCode className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="pixQrCode"
                  name="pixQrCode"
                  value={formData.pixQrCode}
                  onChange={handleChange}
                  className="pl-10"
                  placeholder="https://..."
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {message && (
        <div
          className={`p-3 border rounded-md text-sm ${
            message.includes("sucesso")
              ? "bg-green-500/10 border-green-500 text-green-600"
              : "bg-destructive/10 border-destructive text-destructive"
          }`}
        >
          {message}
        </div>
      )}

      <Button type="submit" disabled={loading} size="lg">
        {loading ? "Salvando..." : "Salvar Alterações"}
      </Button>
    </form>
  )
}
