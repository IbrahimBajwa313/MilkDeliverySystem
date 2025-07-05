import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/middleware/mongoose"
import Bill from "@/models/Bill"

async function markBillAsSent(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const bill = await Bill.findByIdAndUpdate(
      params.id,
      {
        billSent: true,
        billSentAt: new Date(),
      },
      { new: true },
    )

    if (!bill) {
      return NextResponse.json({ error: "Bill not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, bill })
  } catch (error) {
    console.error("Failed to mark bill as sent:", error)
    return NextResponse.json({ error: "Failed to update bill" }, { status: 500 })
  }
}

export const POST = connectDB(markBillAsSent)
