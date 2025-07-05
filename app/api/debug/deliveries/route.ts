import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/middleware/mongoose"
import Delivery from "@/models/Delivery"

async function getDeliveryDebugInfo(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const month = searchParams.get("month")

  try {
    if (!month) {
      return NextResponse.json({ error: "Month parameter is required" }, { status: 400 })
    }

    // Create date range for the month
    const startDate = `${month}-01`
    const year = Number.parseInt(month.split("-")[0])
    const monthNum = Number.parseInt(month.split("-")[1])
    const endDate = `${year}-${monthNum.toString().padStart(2, "0")}-${new Date(year, monthNum, 0).getDate()}`

    // Get all deliveries for the month
    const allDeliveries = await Delivery.find({
      date: { $gte: startDate, $lte: endDate },
    }).lean()

    // Get delivered deliveries
    const deliveredDeliveries = await Delivery.find({
      date: { $gte: startDate, $lte: endDate },
      status: "delivered",
    }).lean()

    // Get deliveries with amount > 0
    const deliveriesWithAmount = await Delivery.find({
      date: { $gte: startDate, $lte: endDate },
      status: "delivered",
      amount: { $gt: 0 },
    }).lean()

    // Sample deliveries
    const sampleDeliveries = allDeliveries.slice(0, 5)

    return NextResponse.json({
      month,
      dateRange: { startDate, endDate },
      counts: {
        total: allDeliveries.length,
        delivered: deliveredDeliveries.length,
        withAmount: deliveriesWithAmount.length,
      },
      sampleDeliveries,
      totalAmount: deliveriesWithAmount.reduce((sum, d) => sum + (d.amount || 0), 0),
    })
  } catch (error) {
    console.error("Failed to get debug info:", error)
    return NextResponse.json({ error: "Failed to get debug info" }, { status: 500 })
  }
}

export const GET = connectDB(getDeliveryDebugInfo)
