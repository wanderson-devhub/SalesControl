import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import prisma from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    const url = new URL(request.url)
    const includeUnavailable = url.searchParams.get("includeUnavailable") === "true"

    let whereClause: any = includeUnavailable ? {} : { available: true }

    // If admin, filter by their products
    if (session?.isAdmin) {
      whereClause.adminId = session.id
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        admin: {
          select: {
            id: true,
            warName: true,
            pixKey: true,
            pixQrCode: true,
          },
        },
      },
    })

    // For users, group products by admin
    if (!session?.isAdmin) {
      const groupedProducts = products.reduce((acc, product) => {
        const adminId = product.adminId
        if (!acc[adminId]) {
          acc[adminId] = {
            admin: product.admin,
            products: [],
          }
        }
        acc[adminId].products.push({
          id: product.id,
          name: product.name,
          price: product.price,
          available: product.available,
          imageUrl: product.imageUrl,
        })
        return acc
      }, {} as Record<string, { admin: any; products: any[] }>)

      return NextResponse.json(groupedProducts)
    }

    return NextResponse.json(products)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { id, name, price, available, imageUrl } = body

    if (id) {
      // Update existing product
      const product = await prisma.product.update({
        where: { id },
        data: {
          name,
          price: Number.parseFloat(price),
          available,
          imageUrl,
        },
      })
      return NextResponse.json(product)
    } else {
      // Create new product
      const product = await prisma.product.create({
        data: {
          name,
          price: Number.parseFloat(price),
          available,
          imageUrl,
          adminId: session.id,
        },
      })
      return NextResponse.json(product)
    }
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to save product" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Product ID required" }, { status: 400 })
    }

    await prisma.product.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
  }
}
