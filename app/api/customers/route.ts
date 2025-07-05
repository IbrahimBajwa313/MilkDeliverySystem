import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/middleware/mongoose"
import Customer from "@/models/Customer"

async function getCustomers() {
  try {
    const customers = await Customer.find({ isActive: true }).sort({ deliveryOrder: 1, name: 1 }).lean()
    return NextResponse.json(customers)
  } catch (error) {
    console.error("Failed to fetch customers:", error)
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 })
  }
}

async function createCustomer(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, phone, address, ratePerLiter, defaultMilkQuantity } = body

    const lastCustomer = await Customer.findOne({}, { deliveryOrder: 1 }).sort({ deliveryOrder: -1 })

    const newCustomer = new Customer({
      name,
      phone,
      address,
      ratePerLiter: Number.parseFloat(ratePerLiter),
      defaultMilkQuantity: Number.parseFloat(defaultMilkQuantity),
      deliveryOrder: (lastCustomer?.deliveryOrder || 0) + 1,
      isActive: true,
      totalOutstanding: 0,
    })

    const savedCustomer = await newCustomer.save()
    return NextResponse.json(savedCustomer)
  } catch (error) {
    console.error("Failed to create customer:", error)
    return NextResponse.json({ error: "Failed to create customer" }, { status: 500 })
  }
}

export const GET = connectDB(getCustomers)
export const POST = connectDB(createCustomer)
