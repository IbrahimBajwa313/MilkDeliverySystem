import mongoose from "mongoose"

const DeliverySchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      min: 0,
      default: null,
    },
    status: {
      type: String,
      enum: ["delivered", "not_delivered", "absent"],
      default: "delivered",
    },
    amount: {
      type: Number,
      default: 0,
      min: 0,
    },
    rateAtTimeOfDelivery: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
)

DeliverySchema.index({ customerId: 1, date: 1 }, { unique: true })
DeliverySchema.index({ date: 1 })
DeliverySchema.index({ status: 1 })

export default mongoose.models.Delivery || mongoose.model("Delivery", DeliverySchema)
