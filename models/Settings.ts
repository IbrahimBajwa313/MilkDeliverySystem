import mongoose from "mongoose"

const SettingsSchema = new mongoose.Schema(
  {
    defaultMilkRate: {
      type: Number,
      required: true,
      min: 0,
      default: 200,
    },
    lastRateChangeDate: {
      type: Date,
      default: Date.now,
    },
    effectiveDate: {
      type: String, // YYYY-MM-DD format
      default: () => new Date().toISOString().split("T")[0],
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.models.Settings || mongoose.model("Settings", SettingsSchema)
