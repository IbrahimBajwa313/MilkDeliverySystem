import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/middleware/mongoose"
import Bill from "@/models/Bill"
import Customer from "@/models/Customer"
import { generateMonthlyBillMessage, generateWhatsAppLink } from "@/lib/whatsapp"

async function sendBills(request: NextRequest) {
  try {
    const body = await request.json()
    const { month, billIds } = body

    const query: any = {}
    if (month) query.month = month
    if (billIds && billIds.length > 0) query._id = { $in: billIds }

    // Get bills with customer details
    const bills = await Bill.find(query).lean()

    // Get customer details
    const customerIds = bills.map((bill) => bill.customerId)
    const customers = await Customer.find({ _id: { $in: customerIds } }).lean()
    const customerMap = new Map(customers.map((customer) => [customer._id.toString(), customer]))

    const results = []
    const monthName = new Date(`${month || bills[0]?.month}-01`).toLocaleDateString("ur-PK", {
      month: "long",
      year: "numeric",
    })

    // Generate WhatsApp links for each bill
    for (const bill of bills) {
      if (bill.totalDue > 0) {
        const customer = customerMap.get(bill.customerId.toString())

        if (customer) {
          const message = generateMonthlyBillMessage(
            bill.customerName,
            monthName,
            bill.totalLiters,
            bill.totalAmount,
            bill.previousBalance,
            bill.totalDue,
          )

          const whatsappLink = generateWhatsAppLink(customer.phone, message)

          // Mark bill as sent
          await Bill.findByIdAndUpdate(bill._id, {
            billSent: true,
            billSentAt: new Date(),
          })

          results.push({
            billId: bill._id,
            customerName: bill.customerName,
            phone: customer.phone,
            whatsappLink,
            success: true,
          })
        }
      }
    }

    return NextResponse.json({
      success: true,
      messagesSent: results.length,
      totalBills: results.length,
      results,
      whatsappLinks: results.map((r) => r.whatsappLink),
    })
  } catch (error) {
    console.error("Failed to generate WhatsApp links:", error)
    return NextResponse.json({ error: "Failed to generate WhatsApp links" }, { status: 500 })
  }
}

export const POST = connectDB(sendBills)
