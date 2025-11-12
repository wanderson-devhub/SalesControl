import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"
import { getSession } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const consumptions = await prisma.consumption.findMany({
      where: { userId: session.id },
      include: {
        product: {
          include: { admin: true }
        }
      },
    })

    return NextResponse.json(consumptions)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch consumptions" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { productId, quantity } = await request.json()

    // Verify the product belongs to an admin (no change needed for consumption creation)
    const consumption = await prisma.consumption.create({
      data: {
        userId: session.id,
        productId,
        quantity,
      },
      include: { product: { include: { admin: true } } },
    })

    return NextResponse.json(consumption, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create consumption" }, { status: 500 })
  }
}
