import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"
import bcrypt from "bcryptjs"
import { createSession } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Validate input
    if (!email || typeof email !== "string" || !password || typeof password !== "string") {
      return NextResponse.json({ error: "Email/Nome de Guerra e senha são obrigatórios" }, { status: 400 })
    }

    const trimmedEmail = email.trim().toLowerCase()
    
    if (!trimmedEmail || password.length < 1) {
      return NextResponse.json({ error: "Email/Nome de Guerra e senha são obrigatórios" }, { status: 400 })
    }

    // Try to find user by email or warName (case-insensitive for both)
    const users = await prisma.$queryRaw<
      Array<{
        id: string
        email: string
        password: string
        warName: string
        rank: string
        phone: string
        isAdmin: boolean
        pixKey: string | null
        pixQrCode: string | null
        resetToken: string | null
        resetTokenExpiry: Date | null
        createdAt: Date
        updatedAt: Date
      }>
    >`
      SELECT * FROM users
      WHERE LOWER(email) = ${trimmedEmail} OR LOWER(warName) = ${trimmedEmail}
      LIMIT 1
    `

    const user = users[0] || null

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 401 })
    }

    // Validate that user has a password set
    if (!user.password) {
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return NextResponse.json({ error: "Senha incorreta" }, { status: 401 })
    }

    await createSession(user)

    return NextResponse.json(
      { success: true, user: { id: user.id, email: user.email, warName: user.warName, isAdmin: user.isAdmin } },
      { status: 200 },
    )
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
