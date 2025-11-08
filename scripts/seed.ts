import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🧹 Limpando dados antigos...")
  await prisma.charge.deleteMany().catch(() => {})
  await prisma.consumption.deleteMany().catch(() => {})
  await prisma.product.deleteMany().catch(() => {})
  await prisma.user.deleteMany().catch(() => {})

  console.log("🌱 Inserindo produtos...")

  const PRODUCTS = [
    {
      name: "Açaí Premium",
      price: 18.5,
      imageUrl:
        "https://images.unsplash.com/photo-1590080876550-7794a9ca8d8a?w=400&h=400&fit=crop",
    },
    {
      name: "Picolé Artesanal",
      price: 8.5,
      imageUrl:
        "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=400&fit=crop",
    },
    {
      name: "Cremosim Gelado",
      price: 12.0,
      imageUrl:
        "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=400&fit=crop",
    },
    {
      name: "Cone de Sorvete",
      price: 7.5,
      imageUrl:
        "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=400&fit=crop",
    },
    {
      name: "Sorvete Especial",
      price: 15.0,
      imageUrl:
        "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=400&fit=crop",
    },
  ]

  const products = await Promise.all(
    PRODUCTS.map((p) =>
      prisma.product.create({
        data: p,
      })
    )
  )

  console.log("👑 Criando usuários...")

  const admin = await prisma.user.create({
    data: {
      email: "admin@example.com",
      password: await bcrypt.hash("admin123", 10),
      warName: "Admin",
      rank: "Tenente",
      company: "3ª Cia",
      phone: "11999999999",
      isAdmin: true,
      pixKey: "123.456.789-00",
      pixQrCode: "https://via.placeholder.com/200?text=QR+Code",
    },
  })

  const user1 = await prisma.user.create({
    data: {
      email: "user1@example.com",
      password: await bcrypt.hash("user123", 10),
      warName: "Soldado Silva",
      rank: "Soldado",
      company: "2ª Cia",
      phone: "11988888888",
      isAdmin: false,
    },
  })

  const user2 = await prisma.user.create({
    data: {
      email: "user2@example.com",
      password: await bcrypt.hash("user123", 10),
      warName: "Cabo Santos",
      rank: "Cabo",
      company: "1ª Cia",
      phone: "11987777777",
      isAdmin: false,
    },
  })

  console.log("🍦 Criando consumos de teste...")

  await prisma.consumption.createMany({
    data: [
      {
        userId: user1.id,
        productId: products[0].id, // Açaí Premium
        quantity: 2,
      },
      {
        userId: user1.id,
        productId: products[1].id, // Picolé Artesanal
        quantity: 3,
      },
      {
        userId: user2.id,
        productId: products[0].id, // Açaí Premium
        quantity: 1,
      },
    ],
  })

  console.log("✅ Seed finalizado com sucesso!")
}

main()
  .catch((e) => {
    console.error("❌ Erro ao executar seed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
