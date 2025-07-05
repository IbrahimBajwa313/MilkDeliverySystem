"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CustomerForm } from "@/components/customer-form"
import { Plus, Edit, Trash2, Phone, MapPin, GripVertical } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface Customer {
  _id: string
  name: string
  phone: string
  address: string
  ratePerLiter: number
  defaultMilkQuantity: number
  deliveryOrder: number
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCustomers()
  }, [])

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

  const handleAddCustomer = async (customerData: Omit<Customer, "_id" | "deliveryOrder">) => {
    try {
      const response = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customerData),
      })

      if (response.ok) {
        fetchCustomers()
      }
    } catch (error) {
      console.error("Failed to add customer:", error)
    }
  }

  const handleEditCustomer = async (customerData: Customer) => {
    try {
      const response = await fetch(`/api/customers/${customerData._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customerData),
      })

      if (response.ok) {
        fetchCustomers()
      }
    } catch (error) {
      console.error("Failed to update customer:", error)
    }
  }

  const handleDeleteCustomer = async (customerId: string) => {
    try {
      const response = await fetch(`/api/customers/${customerId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchCustomers()
      }
    } catch (error) {
      console.error("Failed to delete customer:", error)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading customers...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Customer Management</h1>
        <CustomerForm
          onSave={handleAddCustomer}
          trigger={
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Customer
            </Button>
          }
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {customers.map((customer) => (
          <Card key={customer._id} className="border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center justify-between">
                <span>{customer.name}</span>
                <div className="flex items-center text-sm text-gray-500">
                  <GripVertical className="w-4 h-4" />#{customer.deliveryOrder}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="w-4 h-4 mr-2" />
                {customer.phone}
              </div>
              <div className="flex items-start text-sm text-gray-600">
                <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                <span className="line-clamp-2">{customer.address}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">Rate:</span>
                  <div className="font-medium text-green-600">₨{customer.ratePerLiter}/L</div>
                </div>
                <div>
                  <span className="text-gray-500">Daily:</span>
                  <div className="font-medium text-blue-600">{customer.defaultMilkQuantity}L</div>
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <CustomerForm
                  customer={customer}
                  onSave={handleEditCustomer}
                  trigger={
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                  }
                />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Customer</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete {customer.name}? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDeleteCustomer(customer._id)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {customers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No customers found</p>
          <CustomerForm
            onSave={handleAddCustomer}
            trigger={
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Customer
              </Button>
            }
          />
        </div>
      )}
    </div>
  )
}
