import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/middleware/mongoose"
import Settings from "@/models/Settings"
import Customer from "@/models/Customer"

async function getSettings() {
  try {
    let settings = await Settings.findOne().lean()

    // If no settings exist, create default settings
    if (!settings) {
      const defaultSettings = new Settings({
        defaultMilkRate: 45,
      })
      settings = await defaultSettings.save()
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error("Failed to fetch settings:", error)
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
}

async function updateSettings(request: NextRequest) {
  try {
    const body = await request.json()
    const { defaultMilkRate } = body

    // Validate input
    if (!defaultMilkRate || defaultMilkRate < 0) {
      return NextResponse.json({ error: "Invalid milk rate" }, { status: 400 })
    }

    const newRate = Number.parseFloat(defaultMilkRate.toString())
    const effectiveDate = new Date().toISOString().split("T")[0] // Today's date in YYYY-MM-DD format

    // Update settings with effective date
    const settings = await Settings.findOneAndUpdate(
      {},
      {
        defaultMilkRate: newRate,
        lastRateChangeDate: new Date(),
        effectiveDate: effectiveDate,
      },
      { upsert: true, new: true, runValidators: true },
    )

    // Update ALL customers with the new rate for future use
    // This doesn't affect historical data, only sets their current rate
    const updateResult = await Customer.updateMany(
      { isActive: true },
      {
        $set: {
          ratePerLiter: newRate,
          rateUpdatedDate: new Date(),
        },
      },
    )

    return NextResponse.json({
      success: true,
      settings,
      updateStats: {
        customersUpdated: updateResult.modifiedCount,
        totalCustomers: updateResult.matchedCount,
        effectiveDate: new Date().toLocaleDateString("en-US", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
      },
    })
  } catch (error) {
    console.error("Failed to update settings:", error)
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
  }
}

export const GET = connectDB(getSettings)
export const POST = connectDB(updateSettings)
