"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface Customer {
  _id?: string
  name: string
  phone: string
  address: string
  ratePerLiter: number
  defaultMilkQuantity: number
}

interface CustomerFormProps {
  customer?: Customer
  onSave: (customer: Customer) => void
  trigger: React.ReactNode
}

export function CustomerForm({ customer, onSave, trigger }: CustomerFormProps) {
  const [open, setOpen] = useState(false)
  const [defaultRate, setDefaultRate] = useState(45)
  const [formData, setFormData] = useState<Customer>({
    name: customer?.name || "",
    phone: customer?.phone || "",
    address: customer?.address || "",
    ratePerLiter: customer?.ratePerLiter || defaultRate,
    defaultMilkQuantity: customer?.defaultMilkQuantity || 1, // Manual entry, no system default
    ...(customer?._id && { _id: customer._id }),
  })

  // Fetch current system rate (price from database)
  useEffect(() => {
    const fetchCurrentRate = async () => {
      try {
        const response = await fetch("/api/settings")
        if (response.ok) {
          const settings = await response.json()
          setDefaultRate(settings.defaultMilkRate)

          // For new customers, use current system rate
          if (!customer) {
            setFormData((prev) => ({
              ...prev,
              ratePerLiter: settings.defaultMilkRate,
            }))
          }
        }
      } catch (error) {
        console.error("Failed to fetch current rate:", error)
      }
    }

    if (open) {
      fetchCurrentRate()
    }
  }, [open, customer])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{customer ? "Edit Customer" : "Add New Customer"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone (WhatsApp)</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+919876543210"
              required
            />
          </div>
          <div>
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="rate">Rate per Liter (₨)</Label>
              <Input
                id="rate"
                type="number"
                step="0.01"
                min="0"
                value={formData.ratePerLiter}
                onChange={(e) => setFormData({ ...formData, ratePerLiter: Number.parseFloat(e.target.value) || 0 })}
                required
              />
              <p className="text-xs text-gray-500 mt-1">Current system rate: ₨{defaultRate}</p>
            </div>
            <div>
              <Label htmlFor="defaultQuantity">Daily Milk (Liters)</Label>
              <Input
                id="defaultQuantity"
                type="number"
                step="0.5"
                min="0"
                value={formData.defaultMilkQuantity}
                onChange={(e) =>
                  setFormData({ ...formData, defaultMilkQuantity: Number.parseFloat(e.target.value) || 0 })
                }
                required
                placeholder="Enter quantity manually"
              />
              <p className="text-xs text-gray-500 mt-1">Set individual quantity for this customer</p>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              {customer ? "Update" : "Add"} Customer
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
