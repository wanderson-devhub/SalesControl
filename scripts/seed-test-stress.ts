// Seed de stress para testar o desempenho do sistema
// Este script cria um grande número de registros para simular uma carga pesada no banco de dados.
// Para inicializar basta inserir -> npx tsx scripts/seed-test-stress.ts

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

  console.log("👑 Criando 2 administradores...")

  const admins = []
  const adminData = [
    {
      email: "admin1@example.com",
      warName: "Admin 1",
      rank: "1º Tenente",
      phone: "11999999991",
      pixKey: "123.456.789-01",
      pixQrCode: "https://via.placeholder.com/200?text=QR+Code+1",
    },
    {
      email: "admin2@example.com",
      warName: "Admin 2",
      rank: "2º Tenente",
      phone: "11999999992",
      pixKey: "123.456.789-02",
      pixQrCode: "https://via.placeholder.com/200?text=QR+Code+2",
    },
  ]

  for (const data of adminData) {
    const admin = await prisma.user.create({
      data: {
        ...data,
        password: await bcrypt.hash("admin123", 10),
        isAdmin: true,
      },
    })
    admins.push(admin)
  }

  const products = []
  for (const admin of admins) {
    const adminProducts = await Promise.all(
      PRODUCTS.map((p) =>
        prisma.product.create({
          data: {
            ...p,
            name: `${p.name} - ${admin.warName}`,
            adminId: admin.id,
          },
        })
      )
    )
    products.push(...adminProducts)
  }

  console.log("👥 Criando 2000 usuários...")

  const ranks = ["Soldado", "Cabo", "3º Sargento", "2º Sargento", "1º Sargento", "2º Tenente", "1º Tenente"]

  const users = []
  for (let i = 1; i <= 2000; i++) {
    const user = await prisma.user.create({
      data: {
        email: `user${i}@example.com`,
        password: await bcrypt.hash("user123", 10),
        warName: `Usuário ${i}`,
        rank: ranks[Math.floor(Math.random() * ranks.length)],
        phone: `11${Math.floor(100000000 + Math.random() * 900000000)}`, // Gera telefone aleatório de 11 dígitos começando com 11
        isAdmin: false,
      },
    })
    users.push(user)
  }

  console.log("🍦 Criando consumos de teste (20 por usuário)...")

  const consumptions = []
  for (const user of users) {
    for (let j = 0; j < 20; j++) {
      const randomProduct = products[Math.floor(Math.random() * products.length)]
      const quantity = Math.floor(Math.random() * 5) + 1 // 1 a 5
      consumptions.push({
        userId: user.id,
        productId: randomProduct.id,
        quantity,
      })
    }
  }

  console.log(`Preparando ${consumptions.length} consumos para inserção...`)

  // Inserir consumos em lotes para evitar sobrecarga
  const batchSize = 1000
  for (let i = 0; i < consumptions.length; i += batchSize) {
    const batch = consumptions.slice(i, i + batchSize)
    await prisma.consumption.createMany({
      data: batch,
    })
    console.log(`Inseridos ${Math.min(i + batchSize, consumptions.length)} de ${consumptions.length} consumos...`)
  }

  console.log("✅ Seed de stress finalizado com sucesso!")
  console.log(`📊 Criados: ${admins.length} admins, ${users.length} usuários, ${consumptions.length} consumos`)
}

main()
  .catch((e) => {
    console.error("❌ Erro ao executar seed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
