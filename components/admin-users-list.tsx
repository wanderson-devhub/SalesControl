"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  MessageCircle,
  Trash2,
  Users,
  ChevronDown,
  UserCheck,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface User {
  id: string;
  email: string;
  warName: string;
  rank: string;
  company: string;
  phone: string;
  total: number;
}

interface AdminUsersListProps {
  adminId: string;
}

export function AdminUsersList({ adminId }: AdminUsersListProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState<
    "asc" | "desc" | "random" | "highest" | "lowest"
  >("asc");
  const [filterCompany, setFilterCompany] = useState<string>("all");
  const [filterRank, setFilterRank] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [userDetails, setUserDetails] = useState<Record<string, any>>({});
  const [loadingDetails, setLoadingDetails] = useState<Record<string, boolean>>(
    {}
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("pending");
  const itemsPerPage = 20;

  useEffect(() => {
    fetchUsers();
    // Reset pagination when component mounts
    setCurrentPage(1);
  }, [adminId]);

  async function fetchUsers() {
    try {
      const response = await fetch("/api/users");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error("Invalid response: expected an array");
      }
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]); // Set empty array on error to avoid UI breaking
    } finally {
      setLoading(false);
    }
  }

  function getFilteredAndSortedUsers() {
    let filtered = [...users];

    if (searchTerm) {
      filtered = filtered.filter(
        (u) =>
          (u.warName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
          (u.email?.toLowerCase() || "").includes(searchTerm.toLowerCase())
      );
    }

    if (filterCompany !== "all") {
      filtered = filtered.filter((u) => u.company === filterCompany);
    }

    if (filterRank !== "all") {
      filtered = filtered.filter((u) => u.rank === filterRank);
    }

    if (sortOrder === "asc") {
      filtered.sort((a, b) => (a.warName || "").localeCompare(b.warName || ""));
    } else if (sortOrder === "desc") {
      filtered.sort((a, b) => (b.warName || "").localeCompare(a.warName || ""));
    } else if (sortOrder === "random") {
      filtered.sort(() => Math.random() - 0.5);
    } else if (sortOrder === "highest") {
      filtered.sort((a, b) => (b.total || 0) - (a.total || 0));
    } else if (sortOrder === "lowest") {
      filtered.sort((a, b) => (a.total || 0) - (b.total || 0));
    }

    return filtered;
  }

  async function handleClearDebt(userId: string) {
    try {
      const response = await fetch("/api/admin/consumptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (!response.ok) {
        throw new Error(`Failed to clear debt: ${response.status}`);
      }
      await fetchUsers();
    } catch (error) {
      console.error("Error clearing debt:", error);
      // TODO: Show error toast to user
    }
  }

  function handleWhatsAppCharge(user: User) {
    // Validate user data
    if (!user.warName || !user.phone || typeof user.total !== "number") {
      console.error("Invalid user data for WhatsApp charge");
      return;
    }

    const message = `Olá ${user.rank} ${
      user.warName
    }, Fechamento referente ao *MÊS PASSADO* 📆

💰VALOR: R$: ${user.total.toFixed(2)}

Chave PIX: 87 999717278
Cloudwalk infinite pay 
Vinicius Araújo Leite

*POR FAVOR MANDAR COMPROVANTE*`;

    const cleanPhone = user.phone.replace(/\D/g, "");
    if (!cleanPhone) {
      console.error("Invalid phone number");
      return;
    }

    const whatsappUrl = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(
      message
    )}`;

    // Check if window is available (not in SSR)
    if (typeof window !== "undefined") {
      window.open(whatsappUrl, "_blank");
    }
  }

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterCompany, filterRank, sortOrder]);

  const filteredUsers = getFilteredAndSortedUsers();
  const companies = [
    ...new Set(users.map((u) => u.company).filter(Boolean)),
  ].sort();
  const ranks = [...new Set(users.map((u) => u.rank).filter(Boolean))].sort();

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="bg-card border border-border rounded-lg p-6 mb-6 shadow-professional hover-lift animate-slide-up">
        <div className="flex items-center gap-2 mb-2">
          <Users className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Total de Usuários</h2>
        </div>
        <p className="text-3xl font-bold text-primary">
          {filteredUsers.length}
        </p>
      </div>

      <div className="bg-card border border-border rounded-lg p-4 mb-6 shadow-professional hover-lift">
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Pesquisar
            </label>
            <Input
              placeholder="Nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Ordenação
            </label>
            <Select
              value={sortOrder}
              onValueChange={(value: any) => setSortOrder(value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">A-Z</SelectItem>
                <SelectItem value="desc">Z-A</SelectItem>
                <SelectItem value="random">Aleatório</SelectItem>
                <SelectItem value="highest">Maior Valor</SelectItem>
                <SelectItem value="lowest">Menor Valor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Companhia
            </label>
            <Select value={filterCompany} onValueChange={setFilterCompany}>
              <SelectTrigger className="w-full">
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
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Graduação
            </label>
            <Select value={filterRank} onValueChange={setFilterRank}>
              <SelectTrigger className="w-full">
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pending">Pendentes</TabsTrigger>
            <TabsTrigger value="cleared">Sem dívidas</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-3">
            {filteredUsers.filter((user) => user.total > 0).length === 0 ? (
              <div className="text-center py-8">
                <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Nenhum usuário com dívidas pendentes
                </p>
              </div>
            ) : (
              filteredUsers
                .filter((user) => user.total > 0)
                .slice(
                  (currentPage - 1) * itemsPerPage,
                  currentPage * itemsPerPage
                )
                .map((user) => (
                  <Card key={user.id} className="hover-lift">
                    <CardContent className="pt-6">
                      <div className="flex flex-col gap-4">
                        <div
                          className="flex items-center justify-between cursor-pointer"
                          onClick={async () => {
                            const newExpanded =
                              expandedUser === user.id ? null : user.id;
                            setExpandedUser(newExpanded);
                            if (newExpanded && !userDetails[user.id]) {
                              setLoadingDetails((prev) => ({
                                ...prev,
                                [user.id]: true,
                              }));
                              try {
                                const response = await fetch(
                                  `/api/users/${user.id}`
                                );
                                if (response.ok) {
                                  const data = await response.json();
                                  setUserDetails((prev) => ({
                                    ...prev,
                                    [user.id]: data,
                                  }));
                                }
                              } catch (error) {
                                console.error(
                                  "Error fetching user details:",
                                  error
                                );
                              } finally {
                                setLoadingDetails((prev) => ({
                                  ...prev,
                                  [user.id]: false,
                                }));
                              }
                            }
                          }}
                        >
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">
                              {user.warName}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {user.rank} • {user.company}
                            </p>
                          </div>
                          <div className="text-right mr-4">
                            <p className="text-sm text-muted-foreground">
                              Total a Pagar
                            </p>
                            <p className="text-2xl font-bold text-primary">
                              R$ {user.total.toFixed(2)}
                            </p>
                          </div>
                          <ChevronDown
                            className={`h-5 w-5 transition-transform ${
                              expandedUser === user.id ? "rotate-180" : ""
                            }`}
                          />
                        </div>

                        {expandedUser === user.id && (
                          <div className="border-t border-border pt-4 mt-4 space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Email:
                              </span>
                              <span className="font-medium">{user.email}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Telefone:
                              </span>
                              <span className="font-medium">{user.phone}</span>
                            </div>
                            {loadingDetails[user.id] ? (
                              <div className="text-center py-4">
                                <p className="text-muted-foreground">
                                  Carregando produtos...
                                </p>
                              </div>
                            ) : userDetails[user.id]?.consumptions &&
                              userDetails[user.id].consumptions.length > 0 ? (
                              <div className="mt-4">
                                <h4 className="font-semibold text-primary mb-2">
                                  Produtos Comprados
                                </h4>
                                <div className="space-y-2">
                                  {(() => {
                                    const groupedConsumptions = userDetails[
                                      user.id
                                    ].consumptions.reduce(
                                      (
                                        acc: Record<string, any>,
                                        consumption: any
                                      ) => {
                                        const key = consumption.product.name;
                                        if (!acc[key]) {
                                          acc[key] = {
                                            product: consumption.product,
                                            quantity: 0,
                                            total: 0,
                                          };
                                        }
                                        acc[key].quantity +=
                                          consumption.quantity;
                                        acc[key].total +=
                                          consumption.quantity *
                                          consumption.product.price;
                                        return acc;
                                      },
                                      {}
                                    );
                                    return Object.values(groupedConsumptions)
                                      .sort(
                                        (a: any, b: any) => b.total - a.total
                                      )
                                      .map((grouped: any) => (
                                        <div
                                          key={grouped.product.name}
                                          className="flex justify-between items-center bg-muted/50 p-2 rounded"
                                        >
                                          <div>
                                            <p className="font-medium">
                                              {grouped.product.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                              {grouped.quantity} un. × R${" "}
                                              {grouped.product.price.toFixed(2)}
                                            </p>
                                          </div>
                                          <p className="font-bold text-primary">
                                            R$ {grouped.total.toFixed(2)}
                                          </p>
                                        </div>
                                      ));
                                  })()}
                                </div>
                              </div>
                            ) : (
                              <div className="text-center py-4">
                                <p className="text-muted-foreground">
                                  Nenhum produto comprado
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="flex gap-2 flex-col sm:flex-row">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleWhatsAppCharge(user)}
                            className="gap-2 hover-lift"
                          >
                            <MessageCircle className="h-4 w-4" />
                            WhatsApp
                          </Button>
                          {user.total > 0 && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  className="gap-2 hover-lift"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Zerar
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Confirmar Zerar Dívida
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Você está prestes a zerar a dívida de{" "}
                                    {user.warName} no valor de R${" "}
                                    {user.total.toFixed(2)}. Esta ação não pode
                                    ser desfeita.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>
                                    Cancelar
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleClearDebt(user.id)}
                                  >
                                    Confirmar
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
            )}

            {/* Pagination */}
            {filteredUsers.filter((user) => user.total > 0).length >
              itemsPerPage && (
              <div className="flex justify-center gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Anterior
                </Button>
                <span className="text-sm text-muted-foreground self-center">
                  Página {currentPage} de{" "}
                  {Math.ceil(
                    filteredUsers.filter((user) => user.total > 0).length /
                      itemsPerPage
                  )}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={
                    currentPage * itemsPerPage >=
                    filteredUsers.filter((user) => user.total > 0).length
                  }
                >
                  Próxima
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="cleared" className="space-y-3">
            {filteredUsers.filter((user) => user.total === 0).length === 0 ? (
              <div className="text-center py-8">
                <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Nenhum usuário com dívidas zeradas
                </p>
              </div>
            ) : (
              filteredUsers
                .filter((user) => user.total === 0)
                .slice(
                  (currentPage - 1) * itemsPerPage,
                  currentPage * itemsPerPage
                )
                .map((user) => (
                  <Card key={user.id} className="hover-lift">
                    <CardContent className="pt-6">
                      <div className="flex flex-col gap-4">
                        <div
                          className="flex items-center justify-between cursor-pointer"
                          onClick={() =>
                            setExpandedUser(
                              expandedUser === user.id ? null : user.id
                            )
                          }
                        >
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">
                              {user.warName}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {user.rank} • {user.company}
                            </p>
                          </div>
                          <div className="text-right mr-4">
                            <p className="text-sm text-muted-foreground">
                              Total a Pagar
                            </p>
                            <p className="text-2xl font-bold text-primary">
                              R$ {user.total.toFixed(2)}
                            </p>
                          </div>
                          <ChevronDown
                            className={`h-5 w-5 transition-transform ${
                              expandedUser === user.id ? "rotate-180" : ""
                            }`}
                          />
                        </div>

                        {expandedUser === user.id && (
                          <div className="border-t border-border pt-4 mt-4 space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Email:
                              </span>
                              <span className="font-medium">{user.email}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Telefone:
                              </span>
                              <span className="font-medium">{user.phone}</span>
                            </div>
                          </div>
                        )}

                        <div className="flex gap-2 flex-col sm:flex-row">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleWhatsAppCharge(user)}
                            className="gap-2 hover-lift"
                          >
                            <MessageCircle className="h-4 w-4" />
                            WhatsApp
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
            )}

            {/* Pagination for cleared */}
            {filteredUsers.filter((user) => user.total === 0).length >
              itemsPerPage && (
              <div className="flex justify-center gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Anterior
                </Button>
                <span className="text-sm text-muted-foreground self-center">
                  Página {currentPage} de{" "}
                  {Math.ceil(
                    filteredUsers.filter((user) => user.total === 0).length /
                      itemsPerPage
                  )}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={
                    currentPage * itemsPerPage >=
                    filteredUsers.filter((user) => user.total === 0).length
                  }
                >
                  Próxima
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
