import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/middleware/mongoose"
import Customer from "@/models/Customer"
import Delivery from "@/models/Delivery"
import mongoose from "mongoose"

async function getReports(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const month = searchParams.get("month") // Format: YYYY-MM
  const customerId = searchParams.get("customerId")

  if (!month) {
    return NextResponse.json({ error: "Month parameter is required" }, { status: 400 })
  }

  try {
    // Create date range for the month
    const startDate = `${month}-01`
    const year = Number.parseInt(month.split("-")[0])
    const monthNum = Number.parseInt(month.split("-")[1])
    const endDate = `${year}-${monthNum.toString().padStart(2, "0")}-${new Date(year, monthNum, 0).getDate()}`

    const matchStage: any = {
      date: { $gte: startDate, $lte: endDate },
      status: "delivered",
    }

    if (customerId && mongoose.Types.ObjectId.isValid(customerId)) {
      matchStage.customerId = new mongoose.Types.ObjectId(customerId)
    }

    // Aggregate deliveries by customer
    const deliveryStats = await Delivery.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$customerId",
          customerName: { $first: "$customerName" },
          totalLiters: { $sum: "$quantity" },
          totalAmount: { $sum: "$amount" }, // Use the amount from deliveries
          deliveryCount: { $sum: 1 },
        },
      },
    ])

    // Get customer details for additional info
    const customerIds = deliveryStats.map((stat) => stat._id)
    const customers = await Customer.find({
      _id: { $in: customerIds },
      isActive: true,
    }).lean()

    const customerMap = new Map(customers.map((customer) => [customer._id.toString(), customer]))

    // Combine stats with customer data
    const reports = deliveryStats
      .map((stat) => {
        const customer = customerMap.get(stat._id.toString())
        return {
          customer,
          totalLiters: stat.totalLiters,
          totalAmount: stat.totalAmount, // Use calculated amount from deliveries
          deliveryCount: stat.deliveryCount,
        }
      })
      .filter((report) => report.customer) // Filter out customers not found

    return NextResponse.json(reports)
  } catch (error) {
    console.error("Failed to generate reports:", error)
    return NextResponse.json({ error: "Failed to generate reports" }, { status: 500 })
  }
}

export const GET = connectDB(getReports)
