"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { ConsumptionList } from "@/components/consumption-list"

interface Consumption {
  id: string
  quantity: number
  createdAt: Date
  product: {
    id: string
    name: string
    price: number
    imageUrl: string
  }
}

interface User {
  id: string
  warName: string
  pixKey?: string
  pixQrCode?: string
  consumptions: Consumption[]
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        // Check session via API instead of importing server-side auth
        const sessionResponse = await fetch("/api/auth/session")
        if (!sessionResponse.ok) {
          router.push("/login")
          return
        }

        const session = await sessionResponse.json()
        if (session.isAdmin) {
          router.push("/admin")
          return
        }

        const userData = await fetch("/api/users/" + session.id).then(res => res.json())
        setUser(userData)
      } catch (error) {
        console.error("Error loading data:", error)
        router.push("/login")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [router])

  const handleConsumptionsChange = (newConsumptions: Consumption[]) => {
    if (user) {
      setUser({ ...user, consumptions: newConsumptions })
    }
  }

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Carregando...</div>
  }

  if (!user) {
    return null
  }

  const total = user.consumptions?.reduce((sum, c) => sum + c.quantity * c.product.price, 0) || 0

  // Get current date in Portuguese format
  const currentDate = new Date()
  const monthNames = [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
  ]
  const formattedDate = `${currentDate.getDate()} de ${monthNames[currentDate.getMonth()]}`

  return (
    <div className="min-h-screen bg-background">
      <Header userName={user.warName} />
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome message */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Bem-vindo, {user.warName}!
          </h1>
          <p className="text-lg text-muted-foreground">
            Hoje é {formattedDate}
          </p>
        </div>

        {/* Pix Key Section */}
        {user.pixKey && (
          <div className="bg-card border border-border rounded-lg p-6 shadow-professional hover-lift animate-slide-up mb-8">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-4">Chave Pix</h2>
              <div className="bg-primary/10 px-6 py-4 rounded-lg border border-primary/20 inline-block">
                <code className="text-lg font-mono text-primary">
                  {user.pixKey}
                </code>
              </div>
              {user.pixQrCode && (
                <div className="mt-4">
                  <img
                    src={user.pixQrCode}
                    alt="QR Code Pix"
                    className="w-32 h-32 mx-auto"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        <div className="grid gap-4 mb-8">
          <div className="bg-card border border-border rounded-lg p-6 shadow-professional hover-lift animate-slide-up">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground">Total a Pagar</p>
                <p className="text-3xl font-bold text-primary">R$ {total.toFixed(2)}</p>
              </div>
              <div className="text-right">
                <p className="text-muted-foreground">Itens Consumidos</p>
                <p className="text-3xl font-bold">{user.consumptions.length}</p>
              </div>
            </div>
          </div>
        </div>

        <ConsumptionList
          initialConsumptions={user.consumptions}
          userId={user.id}
          onConsumptionsChange={handleConsumptionsChange}
        />
      </main>
    </div>
  )
}
