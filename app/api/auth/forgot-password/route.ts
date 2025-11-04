import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email é obrigatório" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json({ error: "Email não encontrado" }, { status: 404 })
    }

    // Gerar token de reset
    const resetToken = crypto.randomBytes(32).toString("hex")
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hora

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    })

    return NextResponse.json({
      success: true,
      token: resetToken,
      message: "Token gerado com sucesso"
    }, { status: 200 })
  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
