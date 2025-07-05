import mongoose from "mongoose"

const PaymentSchema = new mongoose.Schema(
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
    billId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bill",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentDate: {
      type: Date,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "bank_transfer", "mobile_payment"],
      default: "cash",
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
)

PaymentSchema.index({ customerId: 1, paymentDate: -1 })
PaymentSchema.index({ billId: 1 })

export default mongoose.models.Payment || mongoose.model("Payment", PaymentSchema)
