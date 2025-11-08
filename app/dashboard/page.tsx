import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import prisma from "@/lib/db"
import { Header } from "@/components/header"
import { ConsumptionList } from "@/components/consumption-list"

export default async function DashboardPage() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  if (session.isAdmin) {
    redirect("/admin")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    include: {
      consumptions: {
        include: { product: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!user) {
    redirect("/login")
  }

  const total = user.consumptions.reduce((sum, c) => sum + c.quantity * c.product.price, 0)

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

        <ConsumptionList initialConsumptions={user.consumptions} userId={user.id} />
      </main>
    </div>
  )
}
