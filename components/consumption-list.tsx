"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, ShoppingCart, Minus, ChevronDown, Copy } from "lucide-react"
import { Input } from "@/components/ui/input"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { formatPrice } from "@/lib/utils"

interface Product {
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

interface Consumption {
  id: string
  quantity: number
  product: Product
  createdAt: Date
}

interface GroupedProducts {
  [adminId: string]: {
    admin: {
      id: string
      warName: string
      pixKey?: string
      pixQrCode?: string
    }
    products: Product[]
  }
}

interface ConsumptionListProps {
  initialConsumptions: Consumption[]
  userId: string
  onConsumptionsChange?: (newConsumptions: Consumption[]) => void
}

export function ConsumptionList({ initialConsumptions, userId, onConsumptionsChange }: ConsumptionListProps) {
  const [consumptions, setConsumptions] = useState<Consumption[]>(initialConsumptions)
  const [products, setProducts] = useState<Product[]>([])
  const [groupedProducts, setGroupedProducts] = useState<GroupedProducts>({})
  const [cart, setCart] = useState<{ [productId: string]: number }>({})
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()


  useEffect(() => {
    fetchProducts()

    const interval = setInterval(fetchProducts, 30000) // Poll every 30 seconds

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    setConsumptions(initialConsumptions)
  }, [initialConsumptions])

  async function fetchProducts() {
    try {
      const response = await fetch("/api/products")
      const data = await response.json()

      // For users, data is grouped by admin
      if (typeof data === 'object' && !Array.isArray(data)) {
        setGroupedProducts(data)
        // Flatten grouped products for cart functionality
        const flattenedProducts = Object.values(data).flatMap((group: any) => group.products)
        setProducts(flattenedProducts)
      } else {
        // For admins, data is array
        setProducts(data)
      }
    } catch (error) {
      console.error("Error fetching products:", error)
    }
  }

  async function handleAddToCart(productId: string) {
    const quantity = cart[productId] || 0
    if (quantity < 1) return

    setLoading(true)
    try {
      const response = await fetch("/api/consumptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          quantity,
        }),
      })

      if (response.ok) {
        const newConsumption = await response.json()
        const updatedConsumptions = [...(consumptions || []), newConsumption]
        setConsumptions(updatedConsumptions)
        onConsumptionsChange?.(updatedConsumptions)
        setCart({ ...cart, [productId]: 0 })
      }
    } catch (error) {
      console.error("Error adding consumption:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleConfirmAllPurchases() {
    const itemsToAdd = Object.entries(cart).filter(([_, qty]) => qty > 0)
    if (itemsToAdd.length === 0) return

    setLoading(true)
    try {
      const promises = itemsToAdd.map(([productId, quantity]) =>
        fetch("/api/consumptions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId, quantity }),
        })
      )

      const responses = await Promise.all(promises)
      const newConsumptions = []

      for (const response of responses) {
        if (response.ok) {
          const newConsumption = await response.json()
          newConsumptions.push(newConsumption)
        }
      }

      if (newConsumptions.length > 0) {
        const updatedConsumptions = [...(consumptions || []), ...newConsumptions]
        setConsumptions(updatedConsumptions)
        onConsumptionsChange?.(updatedConsumptions)
        setCart({})
      }
    } catch (error) {
      console.error("Error adding consumptions:", error)
    } finally {
      setLoading(false)
    }
  }

  function adjustQuantity(productId: string, delta: number) {
    const currentQty = cart[productId] || 0
    const newQty = Math.max(0, currentQty + delta)
    setCart({ ...cart, [productId]: newQty })
  }

  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Copiado!",
        description: "Chave Pix copiada para a área de transferência.",
      })
    } catch (error) {
      console.error("Failed to copy to clipboard:", error)
      toast({
        title: "Erro",
        description: "Não foi possível copiar a chave Pix.",
        variant: "destructive",
      })
    }
  }

  // Group consumptions by date and admin
  const groupedByDateAndAdmin = (consumptions || []).reduce((acc, consumption) => {
    const date = new Date(consumption.createdAt).toLocaleDateString('pt-BR')
    const adminId = consumption.product.admin?.id || 'unknown'
    const adminName = consumption.product.admin?.warName || 'Admin Desconhecido'

    if (!acc[date]) {
      acc[date] = {}
    }
    if (!acc[date][adminId]) {
      acc[date][adminId] = { adminName, items: [] }
    }
    acc[date][adminId].items.push(consumption)
    return acc
  }, {} as Record<string, Record<string, { adminName: string; items: Consumption[] }>>)

  const groupedConsumptions = Object.entries(groupedByDateAndAdmin)
    .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
    .map(([date, adminGroups]) => {
      const adminProducts = Object.entries(adminGroups).map(([adminId, { adminName, items }]) => {
        const productsInAdmin = items.reduce((acc, item) => {
          const productId = item.product.id
          if (!acc[productId]) {
            acc[productId] = { product: item.product, totalQty: 0, totalPrice: 0, items: [] }
          }
          acc[productId].totalQty += item.quantity
          acc[productId].totalPrice += item.quantity * item.product.price
          acc[productId].items.push(item)
          return acc
        }, {} as Record<string, { product: Product; totalQty: number; totalPrice: number; items: Consumption[] }>)

        return { adminId, adminName, products: Object.values(productsInAdmin) }
      })

      return { date, adminGroups: adminProducts }
    })

  const cartTotal = Object.entries(cart).reduce((sum, [productId, qty]) => {
    const product = products.find((p) => p.id === productId)
    return sum + (product ? qty * product.price : 0)
  }, 0)

  return (
    <div className="space-y-6">
      <Card className="shadow-professional hover-lift animate-slide-up">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Adicionar Consumo
          </CardTitle>
          <CardDescription>Selecione produtos e quantidades</CardDescription>
        </CardHeader>
        <CardContent>
          {Object.keys(groupedProducts).length > 0 ? (
            <div className="space-y-8">
              {Object.entries(groupedProducts).map(([adminId, { admin, products: adminProducts }]) => (
                <div key={adminId} className="space-y-4">
                  <div className="border-t border-border pt-6 first:border-t-0 first:pt-0">
                    <Card className="mb-4 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
                      <CardContent>
                        <div className="flex flex-col w-full justify-between gap-4 items-center">
                          <div className="flex items-start gap-3 w-full">
                            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-lg">
                              {admin.warName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-primary">Catálogo de {admin.warName}</h3>
                              {admin.pixKey && (
                                <div className="flex items-center gap-2">
                                  <p className="text-sm text-muted-foreground">Chave Pix:</p>
                                  <div className="flex items-center gap-1">
                                    <span className="font-mono bg-primary/20 px-2 py-1 rounded text-primary font-semibold">{admin.pixKey}</span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => copyToClipboard(admin.pixKey!)}
                                      className="h-6 w-6 p-0 hover:bg-primary/10"
                                    >
                                      <Copy className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          {admin.pixQrCode && (
                            <div className="text-right self-stretch flex flex-col w-full items-end">
                              <p className="text-sm font-semibold text-primary mb-2">QR Code Pix</p>
                              <img
                                src={admin.pixQrCode}
                                alt={`QR Code Pix de ${admin.warName}`}
                                className="w-20 h-20 object-contain border border-primary/20 rounded"
                              />
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                    <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                      {adminProducts.map((product) => (
                        <div key={product.id} className="flex flex-col gap-2">
                          <div className="relative overflow-hidden rounded-lg bg-muted border border-border hover:border-primary transition-colors hover-lift">
                            <img
                              src={product.imageUrl || "/placeholder.svg"}
                              alt={product.name}
                              className="w-full h-20 sm:h-24 object-cover"
                            />
                          </div>
                          <p className="text-sm font-bold text-primary text-center">
                            R$ {formatPrice(product.price)}
                          </p>
                          <h4 className="text-sm font-semibold line-clamp-2">{product.name}</h4>
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              onClick={() => adjustQuantity(product.id, -1)}
                              className="bg-red-500 dark:bg-red-700 h-7 w-7 sm:h-8 sm:w-8 p-0"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <Input
                              type="number"
                              min="0"
                              max="99"
                              value={cart[product.id] || 0}
                              onChange={(e) => setCart({ ...cart, [product.id]: Number.parseInt(e.target.value) || 0 })}
                              className="h-7 sm:h-8 text-center text-xs w-full p-1"
                            />
                            <Button
                              size="sm"
                              onClick={() => adjustQuantity(product.id, 1)}
                              className="bg-green-500 dark:bg-green-700 h-7 w-7 sm:h-8 sm:w-8 p-0"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-5 mb-6">
              {products.map((product) => (
                <div key={product.id} className="flex flex-col gap-2">
                  <div className="relative overflow-hidden rounded-lg bg-muted border border-border hover:border-primary transition-colors hover-lift">
                    <img
                      src={product.imageUrl || "/placeholder.svg"}
                      alt={product.name}
                      className="w-full h-24 object-cover"
                    />
                  </div>
                  <p className="text-sm font-bold text-primary text-center">
                    R$ {formatPrice(product.price)}
                  </p>
                  <h4 className="text-sm font-semibold line-clamp-2">{product.name}</h4>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => adjustQuantity(product.id, -1)}
                      className="h-8 w-8 p-0"
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <Input
                      type="number"
                      min="0"
                      max="99"
                      value={cart[product.id] || 0}
                      onChange={(e) => setCart({ ...cart, [product.id]: Number.parseInt(e.target.value) || 0 })}
                      className="h-8 text-center text-xs w-12 p-1"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => adjustQuantity(product.id, 1)}
                      className="h-8 w-8 p-0"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="border-t border-border pt-4">
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Total do Pedido</p>
                <p className="text-2xl font-bold text-primary">R$ {formatPrice(cartTotal)}</p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    disabled={Object.values(cart).every((qty) => qty === 0) || loading}
                    className="gap-2 hover-lift"
                  >
                    <Plus className="h-4 w-4" />
                    Confirmar Pedido
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmar Pedido</AlertDialogTitle>
                    <AlertDialogDescription>
                      Você está prestes a adicionar {Object.values(cart).reduce((sum, qty) => sum + qty, 0)} itens ao seu consumo totalizando R$ {formatPrice(cartTotal)}.
                      Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleConfirmAllPurchases}>
                      Confirmar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Consumptions history */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Histórico de Consumo</h3>

        {groupedConsumptions.length === 0 ? (
          <Card className="shadow-professional hover-lift">
            <CardContent className="pt-6 text-center text-muted-foreground">
              Nenhum consumo registrado ainda
            </CardContent>
          </Card>
        ) : (
          <>
            {groupedConsumptions.map(({ date, adminGroups }) => (
              <div key={date} className="space-y-4">
                <div className="bg-muted/50 px-4 py-2 rounded-lg">
                  <h4 className="font-semibold text-primary">{date}</h4>
                </div>
                {adminGroups.map(({ adminId, adminName, products }) => (
                  <div key={adminId} className="space-y-2">
                    <div className="bg-primary/10 px-3 py-2 rounded-md border-l-4 border-primary">
                      <h5 className="font-medium text-primary">Catálogo de {adminName}</h5>
                    </div>
                    {products.map(({ product, totalQty, totalPrice, items }) => (
                      <Card key={product.id} className="shadow-professional hover-lift">
                        <CardContent className="pt-6">
                          <div className="flex gap-4">
                            <img
                              src={product.imageUrl || "/placeholder.svg"}
                              alt={product.name}
                              className="w-16 h-16 rounded-lg object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = "/placeholder.svg";
                              }}
                            />
                            <div className="flex-1">
                              <h3 className="font-semibold">{product.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {totalQty} unidades × R$ {formatPrice(product.price)}
                              </p>
                              {items.length > 0 && (
                                <div className="mt-2 space-y-1">
                                  {items.slice(0, 3).map((item, index) => (
                                    <p key={index} className="text-xs text-muted-foreground">
                                      {new Date(item.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - {item.quantity} un.
                                    </p>
                                  ))}
                                  {items.length > 3 && (
                                    <p className="text-xs text-muted-foreground">
                                      +{items.length - 3} pedidos anteriores
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-bold text-primary">R$ {formatPrice(totalPrice)}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
