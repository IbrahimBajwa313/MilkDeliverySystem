import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/middleware/mongoose"
import Delivery from "@/models/Delivery"
import Customer from "@/models/Customer"
import mongoose from "mongoose"

async function bulkSaveDeliveries(request: NextRequest) {
  try {
    const body = await request.json()
    const { deliveries, date } = body

    console.log("Bulk saving deliveries for date:", date)
    console.log("Number of deliveries:", deliveries.length)

    // Get all customers to get their rates
    const customerIds = deliveries
      .map((d: any) => d.customerId)
      .filter((id: string) => mongoose.Types.ObjectId.isValid(id))
    const customers = await Customer.find({ _id: { $in: customerIds } }).lean()
    const customerMap = new Map(customers.map((c) => [c._id.toString(), c]))

    console.log("Found customers:", customers.length)

    // Prepare bulk operations with proper amount calculation
    const bulkOps = []

    for (const delivery of deliveries) {
      if (!mongoose.Types.ObjectId.isValid(delivery.customerId)) {
        console.error("Invalid customer ID:", delivery.customerId)
        continue
      }

      const customer = customerMap.get(delivery.customerId)
      if (!customer) {
        console.error("Customer not found for delivery:", delivery.customerId)
        continue
      }

      const quantity = delivery.status === "delivered" ? Number.parseFloat(delivery.quantity) || 0 : 0
      const amount = quantity > 0 ? quantity * customer.ratePerLiter : 0

      const deliveryData = {
        customerId: new mongoose.Types.ObjectId(delivery.customerId),
        customerName: delivery.customerName || customer.name,
        date,
        quantity: quantity > 0 ? quantity : null,
        status: delivery.status,
        amount: amount,
        rateAtTimeOfDelivery: customer.ratePerLiter,
      }

      console.log(`Delivery for ${customer.name}: ${quantity}L × ₨${customer.ratePerLiter} = ₨${amount}`)

      bulkOps.push({
        replaceOne: {
          filter: { customerId: new mongoose.Types.ObjectId(delivery.customerId), date },
          replacement: deliveryData,
          upsert: true,
        },
      })
    }

    if (bulkOps.length === 0) {
      return NextResponse.json({ error: "No valid deliveries to save" }, { status: 400 })
    }

    console.log("Executing bulk operations:", bulkOps.length)

    const result = await Delivery.bulkWrite(bulkOps)

    console.log("Bulk write result:", {
      modified: result.modifiedCount,
      upserted: result.upsertedCount,
      inserted: result.insertedCount,
    })

    // Verify the data was saved correctly
    const savedDeliveries = await Delivery.find({ date }).lean()
    console.log("Saved deliveries count:", savedDeliveries.length)
    console.log("Sample saved delivery:", savedDeliveries[0])

    return NextResponse.json({
      success: true,
      modified: result.modifiedCount,
      upserted: result.upsertedCount,
      inserted: result.insertedCount,
      totalSaved: savedDeliveries.length,
    })
  } catch (error) {
    console.error("Failed to save bulk deliveries:", error)
    return NextResponse.json({ error: "Failed to save bulk deliveries" }, { status: 500 })
  }
}

export const POST = connectDB(bulkSaveDeliveries)
