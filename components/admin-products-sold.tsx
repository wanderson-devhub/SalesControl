"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Package } from "lucide-react"
import { formatPrice } from "@/lib/utils"

interface Product {
  id: string
  name: string
  price: number
  available: boolean
  imageUrl: string
}

interface ProductSale {
  product: Product
  totalQuantity: number
  totalProfit: number
}

interface AdminProductsSoldProps {
  adminId: string
}

export function AdminProductsSold({ adminId }: AdminProductsSoldProps) {
  const [productsSold, setProductsSold] = useState<ProductSale[]>([])
  const [loading, setLoading] = useState(true)

  const fetchProductsSold = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/products-sold")
      if (response.ok) {
        const data = await response.json()
        setProductsSold(prevData => {
          if (JSON.stringify(data) !== JSON.stringify(prevData)) {
            return data
          }
          return prevData
        })
      }
    } catch (error) {
      console.error("Error fetching products sold:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProductsSold()

    const interval = setInterval(fetchProductsSold, 10000) // Poll every 10 seconds

    return () => clearInterval(interval)
  }, [fetchProductsSold])

  if (loading) {
    return (
      <Card className="shadow-professional hover-lift">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Produtos Vendidos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-12 h-12 bg-muted rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
                <div className="text-right space-y-2">
                  <div className="h-4 bg-muted rounded w-16"></div>
                  <div className="h-3 bg-muted rounded w-12"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (productsSold.length === 0) {
    return (
      <Card className="shadow-professional hover-lift">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Produtos Vendidos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum produto vendido ainda</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-professional hover-lift">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Produtos Vendidos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {productsSold.map((sale, index) => (
            <div key={sale.product.id} className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </Badge>
                <img
                  src={sale.product.imageUrl || "/placeholder.svg"}
                  alt={sale.product.name}
                  className="w-12 h-12 rounded-lg object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/placeholder.svg";
                  }}
                />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{sale.product.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {sale.totalQuantity} unidades × R$ {formatPrice(sale.product.price)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-primary">R$ {formatPrice(sale.totalProfit)}</p>
                <p className="text-xs text-muted-foreground">Total vendido</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
