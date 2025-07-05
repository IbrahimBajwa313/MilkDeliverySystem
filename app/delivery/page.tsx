"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Save, Truck, Phone, MapPin } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Customer {
  _id: string
  name: string
  phone: string
  address: string
  ratePerLiter: number
  defaultMilkQuantity: number
  deliveryOrder: number
}

interface DeliveryEntry {
  customerId: string
  customerName: string
  date: string
  quantity: number | null
  status: "delivered" | "not_delivered" | "absent"
  amount: number
}

interface CustomerDelivery {
  customer: Customer
  delivery: DeliveryEntry
}

export default function DeliveryPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [customerDeliveries, setCustomerDeliveries] = useState<CustomerDelivery[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchDeliveries()
  }, [selectedDate])

  const fetchDeliveries = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/deliveries?date=${selectedDate}`)
      const data = await response.json()
      setCustomerDeliveries(data)
    } catch (error) {
      console.error("Failed to fetch deliveries:", error)
      toast({
        title: "Error",
        description: "Failed to load delivery data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const updateDelivery = (customerId: string, field: keyof DeliveryEntry, value: any) => {
    setCustomerDeliveries((prev) =>
      prev.map((item) => {
        if (item.customer._id === customerId) {
          const updatedDelivery = {
            ...item.delivery,
            [field]: value,
          }

          // Handle status changes
          if (field === "status") {
            if (value === "delivered") {
              // When changing to delivered, auto-populate with default quantity if empty
              if (!updatedDelivery.quantity || updatedDelivery.quantity === 0) {
                updatedDelivery.quantity = item.customer.defaultMilkQuantity
              }
              // Calculate amount
              updatedDelivery.amount = (updatedDelivery.quantity || 0) * item.customer.ratePerLiter
            } else {
              // When changing to not_delivered or absent, clear quantity and amount
              updatedDelivery.quantity = null
              updatedDelivery.amount = 0
            }
          }

          // Handle quantity changes
          if (field === "quantity") {
            const quantity = value ? Number.parseFloat(value) : 0
            updatedDelivery.quantity = quantity > 0 ? quantity : null

            // Only calculate amount if status is delivered
            if (updatedDelivery.status === "delivered" && updatedDelivery.quantity) {
              updatedDelivery.amount = updatedDelivery.quantity * item.customer.ratePerLiter
            } else {
              updatedDelivery.amount = 0
            }
          }

          return {
            ...item,
            delivery: updatedDelivery,
          }
        }
        return item
      }),
    )
  }

  const saveAllDeliveries = async () => {
    setSaving(true)
    try {
      const deliveries = customerDeliveries.map((item) => item.delivery)

      const response = await fetch("/api/deliveries/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deliveries, date: selectedDate }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "All deliveries saved successfully",
        })
        fetchDeliveries()
      } else {
        throw new Error("Failed to save deliveries")
      }
    } catch (error) {
      console.error("Failed to save deliveries:", error)
      toast({
        title: "Error",
        description: "Failed to save deliveries",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const getTotalQuantity = () => {
    return customerDeliveries.reduce((total, item) => {
      if (item.delivery.status === "delivered" && item.delivery.quantity) {
        return total + item.delivery.quantity
      }
      return total
    }, 0)
  }

  const getTotalAmount = () => {
    return customerDeliveries.reduce((total, item) => {
      return total + (item.delivery.amount || 0)
    }, 0)
  }

  if (loading) {
    return <div className="text-center py-8">Loading delivery data...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-2">
          <Truck className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Daily Delivery</h1>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <Label htmlFor="date">Date:</Label>
            <Input
              id="date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-auto"
            />
          </div>
          <Button onClick={saveAllDeliveries} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Saving..." : "Save All"}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-600">Total Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">{customerDeliveries.length}</div>
          </CardContent>
        </Card>
        <Card className="border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-600">Total Milk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">{getTotalQuantity().toFixed(1)} L</div>
          </CardContent>
        </Card>
        <Card className="border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-600">Total Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">₨{getTotalAmount().toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Delivery Table */}
      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-700">Customer Deliveries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">#</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="hidden sm:table-cell">Contact</TableHead>
                  <TableHead className="hidden md:table-cell">Address</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Milk (L)</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customerDeliveries.map((item, index) => (
                  <TableRow key={item.customer._id}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{item.customer.name}</div>
                        <div className="text-sm text-gray-500 sm:hidden">
                          <div className="flex items-center">
                            <Phone className="w-3 h-3 mr-1" />
                            {item.customer.phone}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="flex items-center text-sm">
                        <Phone className="w-3 h-3 mr-1" />
                        {item.customer.phone}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-start text-sm max-w-[200px]">
                        <MapPin className="w-3 h-3 mr-1 mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-2">{item.customer.address}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={item.delivery.status}
                        onValueChange={(value) => updateDelivery(item.customer._id, "status", value)}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="not_delivered">Not Delivered</SelectItem>
                          <SelectItem value="absent">Absent</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.5"
                        min="0"
                        value={item.delivery.quantity || ""}
                        onChange={(e) => updateDelivery(item.customer._id, "quantity", e.target.value)}
                        disabled={item.delivery.status !== "delivered"}
                        className="w-[80px] text-center"
                        placeholder={item.customer.defaultMilkQuantity.toString()}
                      />
                    </TableCell>
                    <TableCell className="text-right font-medium">₨{(item.delivery.amount || 0).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {customerDeliveries.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No customers found. Add customers first to start deliveries.</p>
        </div>
      )}
    </div>
  )
}
