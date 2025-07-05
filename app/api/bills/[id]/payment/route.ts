import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/middleware/mongoose"
import Bill from "@/models/Bill"
import Customer from "@/models/Customer"
import Payment from "@/models/Payment"
import mongoose from "mongoose"

async function recordPayment(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    const body = await request.json()
    const { amount, paymentMethod = "cash", notes = "" } = body

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid bill ID" }, { status: 400 })
    }

    const paymentAmount = Number.parseFloat(amount)
    if (paymentAmount <= 0) {
      return NextResponse.json({ error: "Payment amount must be greater than 0" }, { status: 400 })
    }

    // Get bill details
    const bill = await Bill.findById(params.id).session(session)
    if (!bill) {
      return NextResponse.json({ error: "Bill not found" }, { status: 404 })
    }

    // Check if payment amount is not more than remaining balance
    if (paymentAmount > bill.remainingBalance) {
      return NextResponse.json({ error: "Payment amount cannot exceed remaining balance" }, { status: 400 })
    }

    // Create payment record
    const payment = new Payment({
      customerId: bill.customerId,
      customerName: bill.customerName,
      billId: bill._id,
      amount: paymentAmount,
      paymentDate: new Date(),
      paymentMethod,
      notes,
    })

    await payment.save({ session })

    // Update bill
    const newAmountPaid = bill.amountPaid + paymentAmount
    const newRemainingBalance = bill.totalDue - newAmountPaid

    let newStatus = "pending"
    if (newRemainingBalance <= 0) {
      newStatus = "paid"
    } else if (newAmountPaid > 0) {
      newStatus = "partial"
    }

    const updatedBill = await Bill.findByIdAndUpdate(
      params.id,
      {
        amountPaid: newAmountPaid,
        remainingBalance: Math.max(0, newRemainingBalance),
        status: newStatus,
      },
      { session, new: true },
    )

    // Update customer's total outstanding
    const customer = await Customer.findById(bill.customerId).session(session)
    if (customer) {
      const newOutstanding = Math.max(0, (customer.totalOutstanding || 0) - paymentAmount)
      await Customer.findByIdAndUpdate(bill.customerId, { totalOutstanding: newOutstanding }, { session })
    }

    await session.commitTransaction()

    return NextResponse.json({
      success: true,
      payment,
      bill: updatedBill,
      message:
        newStatus === "paid" ? "Bill fully paid!" : `Payment recorded. Remaining: ₨${newRemainingBalance.toFixed(2)}`,
    })
  } catch (error) {
    await session.abortTransaction()
    console.error("Failed to record payment:", error)
    return NextResponse.json({ error: "Failed to record payment" }, { status: 500 })
  } finally {
    session.endSession()
  }
}

export const POST = connectDB(recordPayment)
