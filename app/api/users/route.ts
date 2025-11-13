import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"
import { getSession } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || !session.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all users except admins
    const users = await prisma.user.findMany({
      where: {
        isAdmin: false,
      },
      select: {
        id: true,
        email: true,
        warName: true,
        rank: true,
        phone: true,
      },
    })

    // Calculate totals for each user based only on this admin's products
    const usersWithTotals = await Promise.all(
      users.map(async (user) => {
        const consumptions = await prisma.consumption.findMany({
          where: {
            userId: user.id,
            product: {
              adminId: session.id,
            },
          },
          include: { product: true },
        })

        const total = consumptions.reduce((sum, c) => sum + c.quantity * c.product.price, 0)

        return { ...user, total }
      }),
    )

    return NextResponse.json(usersWithTotals)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}
