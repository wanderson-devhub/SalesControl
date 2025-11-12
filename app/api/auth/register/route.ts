import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"
import bcrypt from "bcryptjs"
import { createSession } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, password, warName, rank, company, phone } = await request.json()

    // Validate input
    if (!email || !password || !warName || !rank || !company || !phone) {
      return NextResponse.json({ error: "Todos os campos são obrigatórios" }, { status: 400 })
    }

    const normalizedEmail = email.trim().toLowerCase()

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (existingUser) {
      return NextResponse.json({ error: "Email já cadastrado" }, { status: 409 })
    }

    // Check if phone number is already in use
    const existingPhone = await prisma.user.findUnique({
      where: { phone },
    })

    if (existingPhone) {
      return NextResponse.json({ error: "Este número já está sendo usado" }, { status: 409 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hashedPassword,
        warName,
        rank,
        company,
        phone,
      },
    })

    // Create session
    await createSession(user)

    return NextResponse.json(
      { success: true, user: { id: user.id, email: user.email, warName: user.warName } },
      { status: 201 },
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
