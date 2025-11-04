"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { MessageCircle, Trash2, Users, ChevronDown } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface User {
  id: string
  email: string
  warName: string
  rank: string
  company: string
  phone: string
  total: number
}

interface AdminUsersListProps {
  adminId: string
}

export function AdminUsersList({ adminId }: AdminUsersListProps) {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | "random">("asc")
  const [filterCompany, setFilterCompany] = useState<string>("all")
  const [filterRank, setFilterRank] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [expandedUser, setExpandedUser] = useState<string | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    try {
      const response = await fetch("/api/users")
      const data = await response.json()
      setUsers(data)
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }

  function getFilteredAndSortedUsers() {
    let filtered = [...users]

    if (searchTerm) {
      filtered = filtered.filter((u) =>
        u.warName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (filterCompany !== "all") {
      filtered = filtered.filter((u) => u.company === filterCompany)
    }

    if (filterRank !== "all") {
      filtered = filtered.filter((u) => u.rank === filterRank)
    }

    if (sortOrder === "asc") {
      filtered.sort((a, b) => a.warName.localeCompare(b.warName))
    } else if (sortOrder === "desc") {
      filtered.sort((a, b) => b.warName.localeCompare(a.warName))
    } else if (sortOrder === "random") {
      filtered.sort(() => Math.random() - 0.5)
    }

    return filtered
  }

  async function handleClearDebt(userId: string) {
    try {
      await fetch("/api/admin/consumptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })
      await fetchUsers()
    } catch (error) {
      console.error("Error clearing debt:", error)
    }
  }

  function handleWhatsAppCharge(user: User) {
    const message = `Olá ${user.warName}, você está devendo R$${user.total.toFixed(2)}. Por favor, efetue o pagamento.`
    const whatsappUrl = `https://wa.me/${user.phone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
  }

  const filteredUsers = getFilteredAndSortedUsers()
  const companies = [...new Set(users.map((u) => u.company))].sort()
  const ranks = [...new Set(users.map((u) => u.rank))].sort()

  if (loading) {
    return <div>Carregando...</div>
  }

  return (
    <div className="space-y-4">
      <div className="bg-card border border-border rounded-lg p-6 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Users className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Total de Usuários</h2>
        </div>
        <p className="text-3xl font-bold text-primary">{filteredUsers.length}</p>
      </div>

      <div className="bg-card border border-border rounded-lg p-4 mb-6">
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">Pesquisar</label>
            <Input
              placeholder="Nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">Ordenação</label>
            <Select value={sortOrder} onValueChange={(value: any) => setSortOrder(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">A-Z</SelectItem>
                <SelectItem value="desc">Z-A</SelectItem>
                <SelectItem value="random">Aleatório</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">Companhia</label>
            <Select value={filterCompany} onValueChange={setFilterCompany}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {companies.map((company) => (
                  <SelectItem key={company} value={company}>
                    {company}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">Graduação</label>
            <Select value={filterRank} onValueChange={setFilterRank}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {ranks.map((rank) => (
                  <SelectItem key={rank} value={rank}>
                    {rank}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {filteredUsers.map((user) => (
          <Card key={user.id}>
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4">
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setExpandedUser(expandedUser === user.id ? null : user.id)}
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{user.warName}</h3>
                    <p className="text-sm text-muted-foreground">
                      {user.rank} • {user.company}
                    </p>
                  </div>
                  <div className="text-right mr-4">
                    <p className="text-sm text-muted-foreground">Total a Pagar</p>
                    <p className="text-2xl font-bold text-primary">R$ {user.total.toFixed(2)}</p>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 transition-transform ${expandedUser === user.id ? "rotate-180" : ""}`}
                  />
                </div>

                {expandedUser === user.id && (
                  <div className="border-t border-border pt-4 mt-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email:</span>
                      <span className="font-medium">{user.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Telefone:</span>
                      <span className="font-medium">{user.phone}</span>
                    </div>
                  </div>
                )}

                <div className="flex gap-2 flex-col sm:flex-row">
                  <Button variant="outline" size="sm" onClick={() => handleWhatsAppCharge(user)} className="gap-2">
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleClearDebt(user.id)} className="gap-2">
                    <Trash2 className="h-4 w-4" />
                    Zerar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
