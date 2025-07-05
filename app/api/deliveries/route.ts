import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/middleware/mongoose"
import Customer from "@/models/Customer"
import Delivery from "@/models/Delivery"
import mongoose from "mongoose"

async function getDeliveries(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const date = searchParams.get("date")

  if (!date) {
    return NextResponse.json({ error: "Date parameter is required" }, { status: 400 })
  }

  try {
    // Get all customers in delivery order
    const customers = await Customer.find({ isActive: true }).sort({ deliveryOrder: 1, name: 1 }).lean()

    // Get deliveries for the specific date
    const deliveries = await Delivery.find({ date }).lean()

    // Create a map of deliveries by customer ID
    const deliveryMap = new Map(deliveries.map((delivery) => [delivery.customerId.toString(), delivery]))

    // Combine customers with their delivery data
    const result = customers.map((customer) => {
      const delivery = deliveryMap.get(customer._id.toString())
      return {
        customer,
        delivery: delivery || {
          customerId: customer._id.toString(),
          customerName: customer.name,
          date,
          quantity: customer.defaultMilkQuantity,
          status: "delivered" as const,
          amount: customer.defaultMilkQuantity * customer.ratePerLiter,
          rateAtTimeOfDelivery: customer.ratePerLiter,
        },
      }
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Failed to fetch deliveries:", error)
    return NextResponse.json({ error: "Failed to fetch deliveries" }, { status: 500 })
  }
}

async function createDelivery(request: NextRequest) {
  try {
    const body = await request.json()
    const { customerId, customerName, date, quantity, status } = body

    // Validate customerId
    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return NextResponse.json({ error: "Invalid customer ID" }, { status: 400 })
    }

    // Get customer's current rate
    const customer = await Customer.findById(customerId).lean()
    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 400 })
    }

    const deliveryQuantity = status === "delivered" ? Number.parseFloat(quantity) || 0 : 0
    const deliveryAmount = deliveryQuantity > 0 ? deliveryQuantity * customer.ratePerLiter : 0

    const deliveryData = {
      customerId: new mongoose.Types.ObjectId(customerId),
      customerName: customerName || customer.name,
      date,
      quantity: deliveryQuantity > 0 ? deliveryQuantity : null,
      status,
      amount: deliveryAmount,
      rateAtTimeOfDelivery: customer.ratePerLiter,
    }

    console.log("Saving delivery:", deliveryData)

    // Use upsert to update existing delivery or create new one
    const result = await Delivery.findOneAndUpdate({ customerId, date }, deliveryData, {
      upsert: true,
      new: true,
      runValidators: true,
    })

    console.log("Saved delivery result:", result)

    return NextResponse.json({ success: true, delivery: result })
  } catch (error) {
    console.error("Failed to save delivery:", error)
    return NextResponse.json({ error: "Failed to save delivery" }, { status: 500 })
  }
}

export const GET = connectDB(getDeliveries)
export const POST = connectDB(createDelivery)
