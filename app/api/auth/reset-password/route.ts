import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const { token, newPassword } = await request.json()

    if (!token || !newPassword) {
      return NextResponse.json({ error: "Token e nova senha são obrigatórios" }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "A senha deve ter pelo menos 6 caracteres" }, { status: 400 })
    }

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date(),
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: "Token inválido ou expirado" }, { status: 400 })
    }

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    // Atualizar senha e limpar token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    })

    return NextResponse.json({ success: true, message: "Senha atualizada com sucesso" }, { status: 200 })
  } catch (error) {
    console.error("Reset password error:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
