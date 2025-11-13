"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign } from "lucide-react"
import { formatPrice } from "@/lib/utils"

interface ProfitData {
  totalProfit: number
  totalQuantitySold: number
}

interface AdminProfitSummaryProps {
  initialProfit: number
  initialQuantity: number
}

export function AdminProfitSummary({ initialProfit, initialQuantity }: AdminProfitSummaryProps) {
  const [profitData, setProfitData] = useState<ProfitData>({
    totalProfit: initialProfit,
    totalQuantitySold: initialQuantity,
  })
  const [loading, setLoading] = useState(false)

  const fetchProfitData = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/profit")
      if (response.ok) {
        const data = await response.json()
        setProfitData(prevData => {
          if (JSON.stringify(data) !== JSON.stringify(prevData)) {
            return data
          }
          return prevData
        })
      }
    } catch (error) {
      console.error("Error fetching profit data:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Set initial data
    setProfitData({
      totalProfit: initialProfit,
      totalQuantitySold: initialQuantity,
    })
  }, [initialProfit, initialQuantity])

  useEffect(() => {
    const interval = setInterval(fetchProfitData, 10000) // Poll every 10 seconds

    return () => clearInterval(interval)
  }, [fetchProfitData])

  return (
    <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 dark:from-green-300 dark:to-emerald-200 dark:border-green-400">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2 text-green-800">
          <DollarSign className="h-5 w-5" />
          Lucro Total
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`text-3xl font-bold text-green-900 mb-2 ${loading ? 'animate-pulse' : ''}`}>
          R$ {formatPrice(profitData.totalProfit)}
        </div>
        <p className="text-sm text-green-700 dark:text-green-900">
          Total de {profitData.totalQuantitySold} produtos vendidos
        </p>
      </CardContent>
    </Card>
  )
}
