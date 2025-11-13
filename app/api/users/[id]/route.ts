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
        ...(session.isAdmin ? {
          product: {
            adminId: session.id,
          },
        } : {}), // For users, get all; for admins viewing others, get only from their products
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: userId } = await params

    // Only allow users to update their own data or admins
    if (session.id !== userId && !session.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { warName, rank, phone, pixKey, pixQrCode } = body

    // Validate required fields
    if (!warName || !phone) {
      return NextResponse.json({ error: "Nome de guerra e telefone são obrigatórios" }, { status: 400 })
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        warName,
        rank,
        phone,
        ...(session.isAdmin && { pixKey, pixQrCode }), // Only admins can update pix info
      },
      select: {
        id: true,
        email: true,
        warName: true,
        rank: true,
        phone: true,
        pixKey: true,
        pixQrCode: true,
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("Update user error:", error)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}
