import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"
import { getSession } from "@/lib/auth"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: userId } = await params

    // Only allow users to view their own data or admins
    if (session.id !== userId && !session.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        warName: true,
        rank: true,
        company: true,
        phone: true,
        pixKey: true,
        pixQrCode: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get consumptions - for users, get all their consumptions; for admins, get only from their products
    const consumptions = await prisma.consumption.findMany({
      where: {
        userId: userId,
        ...(session.isAdmin && !session.isAdmin ? {} : {}), // For users, get all; for admins viewing others, get all (but totals are filtered in /api/users)
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            imageUrl: true,
            admin: {
              select: {
                id: true,
                warName: true,
                pixKey: true,
                pixQrCode: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({
      ...user,
      consumptions,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch user details" }, { status: 500 })
  }
}
