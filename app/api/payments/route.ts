import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/middleware/mongoose"
import Payment from "@/models/Payment"
import Bill from "@/models/Bill"
import Customer from "@/models/Customer"
import mongoose from "mongoose"

async function getPayments(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const customerId = searchParams.get("customerId")
  const billId = searchParams.get("billId")

  try {
    const query: any = {}
    if (customerId) query.customerId = customerId
    if (billId) query.billId = billId

    const payments = await Payment.find(query).sort({ paymentDate: -1 }).lean()

    return NextResponse.json(payments)
  } catch (error) {
    console.error("Failed to fetch payments:", error)
    return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 })
  }
}

async function createPayment(request: NextRequest) {
  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    const body = await request.json()
    const { customerId, billId, amount, paymentDate, paymentMethod, notes } = body

    // Get bill details
    const bill = await Bill.findById(billId).session(session)
    if (!bill) {
      throw new Error("Bill not found")
    }

    // Create payment record
    const payment = new Payment({
      customerId,
      customerName: bill.customerName,
      billId,
      amount: Number.parseFloat(amount),
      paymentDate: new Date(paymentDate),
      paymentMethod,
      notes,
    })

    await payment.save({ session })

    // Update bill
    const newAmountPaid = bill.amountPaid + Number.parseFloat(amount)
    const newRemainingBalance = bill.totalDue - newAmountPaid

    let newStatus = "pending"
    if (newRemainingBalance <= 0) {
      newStatus = "paid"
    } else if (newAmountPaid > 0) {
      newStatus = "partial"
    }

    await Bill.findByIdAndUpdate(
      billId,
      {
        amountPaid: newAmountPaid,
        remainingBalance: Math.max(0, newRemainingBalance),
        status: newStatus,
      },
      { session },
    )

    // Update customer's total outstanding
    const customer = await Customer.findById(customerId).session(session)
    if (customer) {
      const newOutstanding = Math.max(0, (customer.totalOutstanding || 0) - Number.parseFloat(amount))
      await Customer.findByIdAndUpdate(customerId, { totalOutstanding: newOutstanding }, { session })
    }

    await session.commitTransaction()

    return NextResponse.json({ success: true, payment })
  } catch (error) {
    await session.abortTransaction()
    console.error("Failed to create payment:", error)
    return NextResponse.json({ error: "Failed to create payment" }, { status: 500 })
  } finally {
    session.endSession()
  }
}

export const GET = connectDB(getPayments)
export const POST = connectDB(createPayment)
