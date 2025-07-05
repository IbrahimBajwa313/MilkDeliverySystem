import mongoose from "mongoose"

const CustomerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    ratePerLiter: {
      type: Number,
      required: true,
      min: 0,
    },
    defaultMilkQuantity: {
      type: Number,
      required: true,
      min: 0,
      default: 1, // Individual per customer, no system default
    },
    deliveryOrder: {
      type: Number,
      required: true,
      default: 1,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    totalOutstanding: {
      type: Number,
      default: 0,
    },
    rateUpdatedDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
)

CustomerSchema.index({ deliveryOrder: 1, isActive: 1 })
CustomerSchema.index({ phone: 1 })

export default mongoose.models.Customer || mongoose.model("Customer", CustomerSchema)
