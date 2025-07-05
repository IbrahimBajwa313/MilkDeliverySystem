// MongoDB document interfaces
export interface Customer {
  _id?: string
  name: string
  phone: string
  address: string
  ratePerLiter: number
  defaultMilkQuantity: number // Default daily milk quantity in liters
  deliveryOrder: number // Order in which customer appears in delivery list
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Delivery {
  _id?: string
  customerId: string
  customerName: string // Denormalized for easier querying
  date: string // YYYY-MM-DD format
  quantity: number | null // null if not delivered
  status: "delivered" | "not_delivered" | "absent"
  createdAt: Date
  updatedAt: Date
}

export interface DeliveryWithCustomer extends Delivery {
  customer: Customer
}
