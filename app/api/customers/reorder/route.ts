import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/middleware/mongoose"
import Customer from "@/models/Customer"
import mongoose from "mongoose"

async function reorderCustomers(request: NextRequest) {
  try {
    const body = await request.json()
    const { customerIds } = body // Array of customer IDs in new order

    // Validate all customer IDs
    const validIds = customerIds.filter((id: string) => mongoose.Types.ObjectId.isValid(id))

    if (validIds.length !== customerIds.length) {
      return NextResponse.json({ error: "Invalid customer IDs provided" }, { status: 400 })
    }

    // Update delivery order for each customer using bulk operations
    const bulkOps = validIds.map((customerId: string, index: number) => ({
      updateOne: {
        filter: { _id: new mongoose.Types.ObjectId(customerId) },
        update: { $set: { deliveryOrder: index + 1 } },
      },
    }))

    await Customer.bulkWrite(bulkOps)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to reorder customers:", error)
    return NextResponse.json({ error: "Failed to reorder customers" }, { status: 500 })
  }
}

export const PUT = connectDB(reorderCustomers)
