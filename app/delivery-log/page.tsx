"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Save } from "lucide-react"

interface Customer {
  id: string
  name: string
  phone: string
  address: string
  ratePerLiter: number
}

interface Delivery {
  id?: string
  customerId: string
  customer?: Customer
  date: string
  quantity: number | null
  status: "delivered" | "not_delivered" | "absent"
}

export default function DeliveryLogPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [deliveries, setDeliveries] = useState<Record<string, Delivery>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchCustomers()
  }, [])

  useEffect(() => {
    if (customers.length > 0) {
      fetchDeliveries()
    }
  }, [selectedDate, customers])

  const fetchCustomers = async () => {
    try {
      const response = await fetch("/api/customers")
      const data = await response.json()
      setCustomers(data)
    } catch (error) {
      console.error("Failed to fetch customers:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchDeliveries = async () => {
    try {
      const response = await fetch(`/api/deliveries?date=${selectedDate}`)
      const data = await response.json()

      // Convert array to object keyed by customerId
      const deliveriesMap = data.reduce((acc: Record<string, Delivery>, delivery: Delivery) => {
        acc[delivery.customerId] = delivery
        return acc
      }, {})

      setDeliveries(deliveriesMap)
    } catch (error) {
      console.error("Failed to fetch deliveries:", error)
    }
  }

  const handleDeliveryChange = (customerId: string, field: string, value: any) => {
    setDeliveries((prev) => ({
      ...prev,
      [customerId]: {
        ...prev[customerId],
        customerId,
        date: selectedDate,
        [field]: value,
      },
    }))
  }

  const saveDelivery = async (customerId: string) => {
    const delivery = deliveries[customerId]
    if (!delivery) return

    setSaving(true)
    try {
      const response = await fetch("/api/deliveries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(delivery),
      })

      if (response.ok) {
        // Refresh deliveries to get updated data
        fetchDeliveries()
      }
    } catch (error) {
      console.error("Failed to save delivery:", error)
    } finally {
      setSaving(false)
    }
  }

  const saveAllDeliveries = async () => {
    setSaving(true)
    try {
      const promises = Object.values(deliveries).map((delivery) =>
        fetch("/api/deliveries", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(delivery),
        }),
      )

      await Promise.all(promises)
      fetchDeliveries()
    } catch (error) {
      console.error("Failed to save deliveries:", error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Daily Milk Delivery Log</h1>
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
          <Button onClick={saveAllDeliveries} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Saving..." : "Save All"}
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {customers.map((customer) => {
          const delivery = deliveries[customer.id] || {
            customerId: customer.id,
            date: selectedDate,
            quantity: null,
            status: "delivered" as const,
          }

          return (
            <Card key={customer.id}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{customer.name}</CardTitle>
                <p className="text-sm text-gray-600">{customer.address}</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  <div>
                    <Label htmlFor={`status-${customer.id}`}>Status</Label>
                    <Select
                      value={delivery.status}
                      onValueChange={(value) => handleDeliveryChange(customer.id, "status", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="not_delivered">Not Delivered</SelectItem>
                        <SelectItem value="absent">Absent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor={`quantity-${customer.id}`}>Quantity (Liters)</Label>
                    <Input
                      id={`quantity-${customer.id}`}
                      type="number"
                      step="0.5"
                      value={delivery.quantity || ""}
                      onChange={(e) => handleDeliveryChange(customer.id, "quantity", e.target.value)}
                      disabled={delivery.status !== "delivered"}
                      placeholder="0.0"
                    />
                  </div>

                  <div>
                    <Label>Amount</Label>
                    <div className="h-10 flex items-center text-sm font-medium text-green-600">
                      Rs.
                      {delivery.status === "delivered" && delivery.quantity
                        ? (Number.parseFloat(delivery.quantity.toString()) * customer.ratePerLiter).toFixed(2)
                        : "0.00"}
                    </div>
                  </div>

                  <Button onClick={() => saveDelivery(customer.id)} disabled={saving} size="sm">
                    Save
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {customers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No customers found. Add customers first to start logging deliveries.</p>
        </div>
      )}
    </div>
  )
}
