import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/middleware/mongoose"
import Bill from "@/models/Bill"
import Customer from "@/models/Customer"
import Delivery from "@/models/Delivery"
import mongoose from "mongoose"

async function getBills(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const month = searchParams.get("month")
  const customerId = searchParams.get("customerId")
  const status = searchParams.get("status")

  try {
    if (!month) {
      return NextResponse.json({ error: "Month parameter is required" }, { status: 400 })
    }

    console.log("Fetching bills for month:", month)

    // Auto-generate/update bills for the requested month
    await autoGenerateAndUpdateBills(month)

    // Then fetch bills with filters
    const query: any = { month }
    if (customerId && mongoose.Types.ObjectId.isValid(customerId)) {
      query.customerId = new mongoose.Types.ObjectId(customerId)
    }
    if (status) query.status = status

    const bills = await Bill.find(query).sort({ month: -1, customerName: 1 }).lean()

    console.log(`Found ${bills.length} bills for month ${month}`)
    if (bills.length > 0) {
      console.log("Sample bill:", bills[0])
    }

    return NextResponse.json(bills)
  } catch (error) {
    console.error("Failed to fetch bills:", error)
    return NextResponse.json({ error: "Failed to fetch bills" }, { status: 500 })
  }
}

async function autoGenerateAndUpdateBills(month: string) {
  try {
    console.log(`Auto-generating bills for month: ${month}`)

    // Create date range for the month
    const startDate = `${month}-01`
    const year = Number.parseInt(month.split("-")[0])
    const monthNum = Number.parseInt(month.split("-")[1])
    const endDate = `${year}-${monthNum.toString().padStart(2, "0")}-${new Date(year, monthNum, 0).getDate()}`

    console.log(`Date range: ${startDate} to ${endDate}`)

    // First, let's check what deliveries exist
    const allDeliveries = await Delivery.find({
      date: { $gte: startDate, $lte: endDate },
    }).lean()

    console.log(`Total deliveries in date range: ${allDeliveries.length}`)
    console.log("Sample delivery:", allDeliveries[0])

    const deliveredDeliveries = allDeliveries.filter((d) => d.status === "delivered")
    console.log(`Delivered deliveries: ${deliveredDeliveries.length}`)

    // Get all customers
    const customers = await Customer.find({ isActive: true }).lean()
    console.log(`Found ${customers.length} active customers`)

    // Get delivery stats for the month - simplified aggregation
    const deliveryStats = await Delivery.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lte: endDate },
          status: "delivered",
          quantity: { $gt: 0 }, // Only include deliveries with quantity > 0
        },
      },
      {
        $group: {
          _id: "$customerId",
          totalLiters: { $sum: "$quantity" },
          totalAmount: { $sum: "$amount" },
          deliveryCount: { $sum: 1 },
        },
      },
    ])

    console.log(`Delivery stats results: ${deliveryStats.length}`)
    console.log("Sample delivery stat:", deliveryStats[0])

    const deliveryMap = new Map(deliveryStats.map((stat) => [stat._id.toString(), stat]))

    // Generate or update bills for each customer who has deliveries
    let billsCreated = 0
    let billsUpdated = 0

    for (const customer of customers) {
      const deliveryStat = deliveryMap.get(customer._id.toString())

      // Only create bills for customers who have deliveries with amount > 0
      if (deliveryStat && deliveryStat.totalAmount > 0) {
        const totalLiters = deliveryStat.totalLiters || 0
        const totalAmount = deliveryStat.totalAmount || 0

        console.log(`Customer ${customer.name}: ${totalLiters}L, ₨${totalAmount}`)

        // Get previous balance from customer's outstanding
        const previousBalance = customer.totalOutstanding || 0
        const totalDue = totalAmount + previousBalance

        // Check if bill already exists
        const existingBill = await Bill.findOne({ customerId: customer._id, month })

        if (existingBill) {
          // Update existing bill (preserve payment information)
          const newTotalDue = totalAmount + previousBalance
          const newRemainingBalance = newTotalDue - existingBill.amountPaid

          await Bill.findByIdAndUpdate(existingBill._id, {
            totalLiters,
            totalAmount,
            previousBalance,
            totalDue: newTotalDue,
            remainingBalance: Math.max(0, newRemainingBalance),
            status: newRemainingBalance <= 0 ? "paid" : existingBill.amountPaid > 0 ? "partial" : "pending",
          })
          billsUpdated++
          console.log(`Updated bill for ${customer.name}`)
        } else {
          // Create new bill
          const newBill = new Bill({
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
          })

          await newBill.save()
          billsCreated++
          console.log(`Created bill for ${customer.name}`)
        }
      } else {
        console.log(`No deliveries found for customer ${customer.name}`)
      }
    }

    console.log(`Bills created: ${billsCreated}, Bills updated: ${billsUpdated}`)
  } catch (error) {
    console.error("Failed to auto-generate bills:", error)
  }
}

export const GET = connectDB(getBills)
