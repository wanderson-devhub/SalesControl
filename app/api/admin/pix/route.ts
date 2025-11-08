import { NextResponse } from "next/server"
import prisma from "@/lib/db"
import { getSession } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Find the admin user
    const admin = await prisma.user.findFirst({
      where: { isAdmin: true },
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
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch admin pix info" }, { status: 500 })
  }
}
