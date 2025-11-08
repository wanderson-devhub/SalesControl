import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import prisma from "@/lib/db"
import { Header } from "@/components/header"
import { AdminUsersList } from "@/components/admin-users-list"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Settings } from "lucide-react"

export default async function AdminPage() {
  const session = await getSession()

  if (!session || !session.isAdmin) {
    redirect("/login")
  }

  const admin = await prisma.user.findUnique({
    where: { id: session.id },
  })

  if (!admin) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-background">
      <Header userName={admin.warName} />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Painel Administrativo</h1>
          <Link href="/admin/products">
            <Button className="gap-2 hover-lift">
              <Settings className="h-4 w-4" />
              Gerenciar Produtos
            </Button>
          </Link>
        </div>
        <AdminUsersList adminId={admin.id} />
      </main>
    </div>
  )
}
