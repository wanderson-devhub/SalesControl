import { NextResponse } from "next/server"
import prisma from "@/lib/db"
import { getSession } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.isAdmin) {
      // For admins, return their own PIX info
      const admin = await prisma.user.findUnique({
        where: { id: session.id },
        select: {
          pixKey: true,
          pixQrCode: true,
        },
      })

      if (!admin) {
        return NextResponse.json({ error: "Admin not found" }, { status: 404 })
      }

      return NextResponse.json({
        pixKey: admin.pixKey,
        pixQrCode: admin.pixQrCode,
      })
    } else {
      // For users, return PIX info of all admins
      const admins = await prisma.user.findMany({
        where: { isAdmin: true },
        select: {
          id: true,
          warName: true,
          pixKey: true,
          pixQrCode: true,
        },
      })

      return NextResponse.json(admins)
    }
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch admin pix info" }, { status: 500 })
  }
}
