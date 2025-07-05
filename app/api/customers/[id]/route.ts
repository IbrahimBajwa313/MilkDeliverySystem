import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/middleware/mongoose"
import Customer from "@/models/Customer"
import mongoose from "mongoose"

async function updateCustomer(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { name, phone, address, ratePerLiter, defaultMilkQuantity } = body

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid customer ID" }, { status: 400 })
    }

    const updatedCustomer = await Customer.findByIdAndUpdate(
      params.id,
      {
        name,
        phone,
        address,
        ratePerLiter: Number.parseFloat(ratePerLiter),
        defaultMilkQuantity: Number.parseFloat(defaultMilkQuantity),
      },
      { new: true, runValidators: true },
    )

    if (!updatedCustomer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }

    return NextResponse.json(updatedCustomer)
  } catch (error) {
    console.error("Failed to update customer:", error)
    return NextResponse.json({ error: "Failed to update customer" }, { status: 500 })
  }
}

async function deleteCustomer(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid customer ID" }, { status: 400 })
    }

    const updatedCustomer = await Customer.findByIdAndUpdate(params.id, { isActive: false }, { new: true })

    if (!updatedCustomer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete customer:", error)
    return NextResponse.json({ error: "Failed to delete customer" }, { status: 500 })
  }
}

export const PUT = connectDB(updateCustomer)
export const DELETE = connectDB(deleteCustomer)
