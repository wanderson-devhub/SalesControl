"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Plus, Edit2, Trash2, Check, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Switch } from "@/components/ui/switch"
import { formatPrice } from "@/lib/utils"

interface Product {
  id: string
  name: string
  price: number
  available: boolean
  imageUrl: string
}

export default function ProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    imageUrl: "",
  })

  useEffect(() => {
    checkSessionAndFetchProducts()
  }, [])

  async function checkSessionAndFetchProducts() {
    try {
      // Check session
      const sessionResponse = await fetch("/api/auth/session")
      if (!sessionResponse.ok) {
        router.push("/login")
        return
      }

      const session = await sessionResponse.json()
      if (!session.isAdmin) {
        router.push("/dashboard")
        return
      }

      // Fetch products
      await fetchProducts()
    } catch (error) {
      console.error("Error checking session:", error)
      router.push("/login")
    }
  }

  async function fetchProducts() {
    try {
      const response = await fetch("/api/products?includeUnavailable=true")
      const data = await response.json()

      // Ensure data is always an array
      if (Array.isArray(data)) {
        setProducts(data)
      } else {
        // If it's an object (grouped by admin), flatten it
        const flattenedProducts: Product[] = []
        Object.values(data).forEach((adminGroup: any) => {
          if (adminGroup.products && Array.isArray(adminGroup.products)) {
            flattenedProducts.push(...adminGroup.products)
          }
        })
        setProducts(flattenedProducts)
      }
    } catch (error) {
      console.error("Error fetching products:", error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveProduct() {
    if (!formData.name || !formData.price) return

    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingProduct?.id,
          name: formData.name,
          price: formData.price,
          available: editingProduct?.available ?? true,
          imageUrl:
            formData.imageUrl || "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=400&fit=crop",
        }),
      })

      if (response.ok) {
        await fetchProducts()
        setIsOpen(false)
        setEditingProduct(null)
        setFormData({ name: "", price: "", imageUrl: "" })
      }
    } catch (error) {
      console.error("Error saving product:", error)
    }
  }

  async function handleDeleteProduct(id: string) {
    try {
      await fetch(`/api/products?id=${id}`, {
        method: "DELETE",
      })
      await fetchProducts()
    } catch (error) {
      console.error("Error deleting product:", error)
    }
  }

  async function handleToggleAvailable(product: Product) {
    try {
      await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: product.id,
          name: product.name,
          price: product.price,
          available: !product.available,
          imageUrl: product.imageUrl,
        }),
      })
      await fetchProducts()
    } catch (error) {
      console.error("Error updating product:", error)
    }
  }

  const openNewDialog = () => {
    setEditingProduct(null)
    setFormData({ name: "", price: "", imageUrl: "" })
    setIsOpen(true)
  }

  const openEditDialog = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      price: product.price.toString(),
      imageUrl: product.imageUrl,
    })
    setIsOpen(true)
  }

  if (loading) {
    return <div className="p-4">Carregando...</div>
  }

  return (
    <div className="p-4 space-y-4 max-w-4xl mx-auto">
      {/* Header responsivo */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Link href="/admin">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-center sm:text-left">Gerenciar Produtos</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewDialog} className="gap-2 w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              Novo Produto
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingProduct ? "Editar Produto" : "Novo Produto"}</DialogTitle>
              <DialogDescription>
                {editingProduct ? "Atualize os dados do produto" : "Adicione um novo produto ao cardápio"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Nome</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Açaí Premium"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Preço (R$)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="Ex: 15.50"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Imagem do Produto</label>
                <div className="space-y-2">
                  <Input
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="URL da imagem ou faça upload abaixo"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          // Convert to base64 for now (can be replaced with proper upload later)
                          const reader = new FileReader()
                          reader.onload = (event) => {
                            const base64 = event.target?.result as string
                            setFormData({ ...formData, imageUrl: base64 })
                          }
                          reader.readAsDataURL(file)
                        }
                      }}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="inline-flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 cursor-pointer text-sm"
                    >
                      📁 Fazer Upload
                    </label>
                    <span className="text-xs text-muted-foreground">ou cole uma URL acima</span>
                  </div>
                </div>
                {formData.imageUrl && (
                  <img
                    src={formData.imageUrl || "/placeholder.svg"}
                    alt="Preview"
                    className="mt-2 w-full h-32 object-cover rounded border"
                  />
                )}
              </div>
              <Button onClick={handleSaveProduct} className="w-full gap-2">
                <Check className="h-4 w-4" />
                {editingProduct ? "Atualizar" : "Criar"} Produto
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        {products.map((product) => (
          <Card key={product.id} className={`${product.available ? "" : "opacity-60"} hover-lift`}>
            <CardContent className="pt-4">
              <img
                src={product.imageUrl || "/placeholder.svg"}
                alt={product.name}
                className="w-full h-24 sm:h-32 object-cover rounded-lg mb-4"
              />
              <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
              <p className="text-primary font-bold mb-4">R$ {formatPrice(product.price)}</p>

              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-muted-foreground">
                  {product.available ? "Disponível" : "Indisponível"}
                </span>
                <Switch checked={product.available} onCheckedChange={() => handleToggleAvailable(product)} />
              </div>

              <div className="flex gap-2 flex-col sm:flex-row">
                <Button variant="outline" size="sm" onClick={() => openEditDialog(product)} className="flex-1 gap-2 py-2">
                  <Edit2 className="h-4 w-4" />
                  Editar
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="flex-1 gap-2 py-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Deletar
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                      <AlertDialogDescription>
                        Você está prestes a deletar o produto "{product.name}". Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDeleteProduct(product.id)}>
                        Deletar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
