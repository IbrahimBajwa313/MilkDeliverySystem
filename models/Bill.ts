import mongoose from "mongoose"

const BillSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    customerName: {
      type: String,
      required: true,
    },
    month: {
      type: String, // YYYY-MM format
      required: true,
    },
    totalLiters: {
      type: Number,
      required: true,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    previousBalance: {
      type: Number,
      default: 0,
    },
    totalDue: {
      type: Number,
      required: true,
      default: 0,
    },
    amountPaid: {
      type: Number,
      default: 0,
    },
    remainingBalance: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["pending", "partial", "paid"],
      default: "pending",
    },
    billSent: {
      type: Boolean,
      default: false,
    },
    billSentAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
)

BillSchema.index({ customerId: 1, month: 1 }, { unique: true })
BillSchema.index({ month: 1 })
BillSchema.index({ status: 1 })

export default mongoose.models.Bill || mongoose.model("Bill", BillSchema)
