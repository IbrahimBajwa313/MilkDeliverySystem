import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/middleware/mongoose"
import Bill from "@/models/Bill"
import Delivery from "@/models/Delivery"
import Customer from "@/models/Customer"
import mongoose from "mongoose"

async function getBillDetails(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid bill ID" }, { status: 400 })
    }

    // Get bill details
    const bill = await Bill.findById(params.id).lean()
    if (!bill) {
      return NextResponse.json({ error: "Bill not found" }, { status: 404 })
    }

    // Get customer details for rate
    const customer = await Customer.findById(bill.customerId).lean()
    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }

    // Create date range for the month
    const startDate = `${bill.month}-01`
    const year = Number.parseInt(bill.month.split("-")[0])
    const monthNum = Number.parseInt(bill.month.split("-")[1])
    const endDate = `${year}-${monthNum.toString().padStart(2, "0")}-${new Date(year, monthNum, 0).getDate()}`

    // Get all deliveries for this customer in this month
    const deliveries = await Delivery.find({
      customerId: bill.customerId,
      date: { $gte: startDate, $lte: endDate },
    })
      .sort({ date: 1 })
      .lean()

    // Create a map of deliveries by date
    const deliveryMap = new Map(deliveries.map((delivery) => [delivery.date, delivery]))

    // Generate daily delivery records for the entire month
    const dailyDeliveries = []
    const startDateObj = new Date(startDate)
    const endDateObj = new Date(endDate)

    for (let date = new Date(startDateObj); date <= endDateObj; date.setDate(date.getDate() + 1)) {
      const dateString = date.toISOString().split("T")[0]
      const delivery = deliveryMap.get(dateString)

      dailyDeliveries.push({
        date: dateString,
        quantity: delivery?.quantity || null,
        status: delivery?.status || "not_delivered",
        amount: delivery?.amount || 0,
        dayName: date.toLocaleDateString("en-US", { weekday: "short" }),
      })
    }

    return NextResponse.json({
      success: true,
      bill,
      customer,
      dailyDeliveries,
    })
  } catch (error) {
    console.error("Failed to fetch bill details:", error)
    return NextResponse.json({ error: "Failed to fetch bill details" }, { status: 500 })
  }
}

export const GET = connectDB(getBillDetails)
