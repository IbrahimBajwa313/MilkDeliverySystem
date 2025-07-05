import mongoose from "mongoose"

// Use connection string directly or from env
const connectionStr = process.env.MONGODB_CONNECTION_STRINGS || "mongodb+srv://ibrahimbajwa1065:ABib381381@cluster0.bathrnt.mongodb.net/MilkManagementSystem?retryWrites=true&w=majority"

const connectDB = (handler: any) => async (req: any, res: any) => {
  try {
    if (mongoose.connections[0].readyState) {
      return await handler(req, res)
    }

    await mongoose.connect(connectionStr, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: "MilkManagementSystem",
    } as any) // added 'as any' to avoid TS conflict with Mongoose 7+

    console.log("✅ Connected to MilkManagementSystem database")
    return await handler(req, res)
  } catch (error) {
    console.error("❌ Database connection error:", error)
    if (res && typeof res.status === 'function') {
      return res.status(500).json({ message: "Internal Server Error" })
    }
    throw error
  }
}

export default connectDB
