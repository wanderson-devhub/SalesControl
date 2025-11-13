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
    available: boolean
    imageUrl: string
    admin?: {
      id: string
      warName: string
      pixKey?: string
      pixQrCode?: string
    }
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

  // Calculate totals per admin
  const totalsByAdmin = user.consumptions?.reduce((acc, c) => {
    const adminId = c.product.admin?.id || 'unknown'
    const adminName = c.product.admin?.warName || 'Admin Desconhecido'
    if (!acc[adminId]) {
      acc[adminId] = { name: adminName, total: 0 }
    }
    acc[adminId].total += c.quantity * c.product.price
    return acc
  }, {} as Record<string, { name: string; total: number }>) || {}

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
        <div className="mb-6 md:mb-8 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Bem-vindo, {user.warName}!
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground">
            Hoje é {formattedDate}
          </p>
        </div>

        <div className="grid gap-4 mb-6 md:mb-8">
          <div className="bg-card border border-border rounded-lg p-4 md:p-6 shadow-professional hover-lift animate-slide-up">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm md:text-base text-muted-foreground">Total a Pagar</p>
                <p className="text-2xl md:text-3xl font-bold text-primary">R$ {total.toFixed(2)}</p>
                {Object.values(totalsByAdmin).map(({ name, total: adminTotal }) => (
                  <p key={name} className="text-xs md:text-sm text-muted-foreground mt-1">
                    A pagar para {name}: R$ {adminTotal.toFixed(2)}
                  </p>
                ))}
              </div>
              <div className="text-left sm:text-right">
                <p className="text-sm md:text-base text-muted-foreground">Itens Consumidos</p>
                <p className="text-2xl md:text-3xl font-bold">{user.consumptions?.length || 0}</p>
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
