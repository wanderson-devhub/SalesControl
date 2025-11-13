import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"
import { getSession } from "@/lib/auth"

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || !session.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { consumptionId } = await request.json()

    await prisma.consumption.delete({
      where: { id: consumptionId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete consumption" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || !session.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { userId } = await request.json()

    // Delete only consumptions for products owned by this admin
    await prisma.consumption.deleteMany({
      where: {
        userId,
        product: {
          adminId: session.id,
        },
      },
    })

    // Notify user about debt clearance
    await prisma.notification.create({
      data: {
        userId,
        type: 'debt_cleared',
        message: `Suas dívidas foram zeradas pelo administrador ${session.warName}`,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to clear consumptions" }, { status: 500 })
  }
}
