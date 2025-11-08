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

  console.log("👑 Criando administrador...")

  const admin = await prisma.user.create({
    data: {
      email: "admin@example.com",
      password: await bcrypt.hash("admin123", 10),
      warName: "Admin",
      rank: "Tenente",
      company: "3 Cia",
      phone: "11999999999",
      isAdmin: true,
      pixKey: "123.456.789-00",
      pixQrCode: "https://via.placeholder.com/200?text=QR+Code",
    },
  })

  console.log("👥 Criando 1000 usuários...")

  const ranks = ["Soldado", "Cabo", "Sargento", "Tenente", "Capitão"]
  const companies = ["1 Cia", "2 Cia", "3 Cia", "4 Cia"]

  const users = []
  for (let i = 1; i <= 1000; i++) {
    const user = await prisma.user.create({
      data: {
        email: `user${i}@example.com`,
        password: await bcrypt.hash("user123", 10),
        warName: `Usuário ${i}`,
        rank: ranks[Math.floor(Math.random() * ranks.length)],
        company: companies[Math.floor(Math.random() * companies.length)],
        phone: `11${Math.floor(100000000 + Math.random() * 900000000)}`, // Gera telefone aleatório de 11 dígitos começando com 11
        isAdmin: false,
      },
    })
    users.push(user)
  }

  console.log("🍦 Criando consumos de teste (5 por usuário)...")

  const consumptions = []
  for (const user of users) {
    for (let j = 0; j < 5; j++) {
      const randomProduct = products[Math.floor(Math.random() * products.length)]
      const quantity = Math.floor(Math.random() * 5) + 1 // 1 a 5
      consumptions.push({
        userId: user.id,
        productId: randomProduct.id,
        quantity,
      })
    }
  }

  await prisma.consumption.createMany({
    data: consumptions,
  })

  console.log("✅ Seed de stress finalizado com sucesso!")
  console.log(`📊 Criados: 1 admin, ${users.length} usuários, ${consumptions.length} consumos`)
}

main()
  .catch((e) => {
    console.error("❌ Erro ao executar seed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
