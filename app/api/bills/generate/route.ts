import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/middleware/mongoose"
import Customer from "@/models/Customer"
import Delivery from "@/models/Delivery"
import Bill from "@/models/Bill"

async function generateBills(request: NextRequest) {
  try {
    const body = await request.json()
    const { month } = body // Format: YYYY-MM

    if (!month) {
      return NextResponse.json({ error: "Month parameter is required" }, { status: 400 })
    }

    // Create date range for the month
    const startDate = `${month}-01`
    const year = Number.parseInt(month.split("-")[0])
    const monthNum = Number.parseInt(month.split("-")[1])
    const endDate = `${year}-${monthNum.toString().padStart(2, "0")}-${new Date(year, monthNum, 0).getDate()}`

    // Get all customers
    const customers = await Customer.find({ isActive: true }).lean()

    // Get delivery stats for the month
    const deliveryStats = await Delivery.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lte: endDate },
          status: "delivered",
        },
      },
      {
        $group: {
          _id: "$customerId",
          totalLiters: { $sum: "$quantity" },
          totalAmount: { $sum: "$amount" },
        },
      },
    ])

    const deliveryMap = new Map(deliveryStats.map((stat) => [stat._id.toString(), stat]))

    // Generate or update bills for each customer
    const bills = []
    let newBillsCount = 0
    let updatedBillsCount = 0

    for (const customer of customers) {
      const deliveryStat = deliveryMap.get(customer._id.toString())
      const totalLiters = deliveryStat?.totalLiters || 0
      const totalAmount = deliveryStat?.totalAmount || 0

      const previousBalance = customer.totalOutstanding || 0
      const totalDue = totalAmount + previousBalance

      const billData = {
        customerId: customer._id,
        customerName: customer.name,
        month,
        totalLiters,
        totalAmount,
        previousBalance,
        totalDue,
        amountPaid: 0,
        remainingBalance: totalDue,
        status: totalDue > 0 ? "pending" : "paid",
        billSent: false,
      }

      // Check if bill already exists
      const existingBill = await Bill.findOne({ customerId: customer._id, month })

      if (existingBill) {
        // Update existing bill (preserve payment information)
        const updatedBill = await Bill.findByIdAndUpdate(
          existingBill._id,
          {
            totalLiters,
            totalAmount,
            previousBalance,
            totalDue: totalAmount + previousBalance + existingBill.amountPaid,
            remainingBalance: totalAmount + previousBalance - existingBill.amountPaid,
            status:
              totalAmount + previousBalance - existingBill.amountPaid <= 0
                ? "paid"
                : existingBill.amountPaid > 0
                  ? "partial"
                  : "pending",
          },
          { new: true },
        )
        bills.push(updatedBill)
        updatedBillsCount++
      } else {
        // Create new bill
        const newBill = new Bill(billData)
        const savedBill = await newBill.save()
        bills.push(savedBill)
        newBillsCount++
      }
    }

    return NextResponse.json({
      success: true,
      billsGenerated: newBillsCount,
      billsUpdated: updatedBillsCount,
      totalBills: bills.length,
      month,
    })
  } catch (error) {
    console.error("Failed to generate bills:", error)
    return NextResponse.json({ error: "Failed to generate bills" }, { status: 500 })
  }
}

export const POST = connectDB(generateBills)
