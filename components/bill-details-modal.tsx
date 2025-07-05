"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Calendar, Milk } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Bill {
  _id: string
  customerId: string
  customerName: string
  month: string
  totalLiters: number
  totalAmount: number
  previousBalance: number
  totalDue: number
  amountPaid: number
  remainingBalance: number
  status: "pending" | "partial" | "paid"
}

interface DailyDelivery {
  date: string
  quantity: number | null
  status: "delivered" | "not_delivered" | "absent"
  amount: number
  dayName: string
}

interface BillDetailsModalProps {
  bill: Bill
  customerRate: number
  trigger: React.ReactNode
}

export function BillDetailsModal({ bill, customerRate, trigger }: BillDetailsModalProps) {
  const [open, setOpen] = useState(false)
  const [dailyDeliveries, setDailyDeliveries] = useState<DailyDelivery[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const fetchDailyDeliveries = async () => {
    if (!open) return

    setLoading(true)
    try {
      const response = await fetch(`/api/bills/${bill._id}/details`)
      const data = await response.json()

      if (data.success) {
        setDailyDeliveries(data.dailyDeliveries)
      } else {
        throw new Error("Failed to fetch daily deliveries")
      }
    } catch (error) {
      console.error("Failed to fetch daily deliveries:", error)
      toast({
        title: "Error",
        description: "Failed to load daily delivery details",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDailyDeliveries()
  }, [open])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "delivered":
        return <Badge className="bg-green-100 text-green-800">Delivered</Badge>
      case "not_delivered":
        return <Badge className="bg-red-100 text-red-800">Not Delivered</Badge>
      case "absent":
        return <Badge className="bg-gray-100 text-gray-800">Absent</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">-</Badge>
    }
  }

  const monthName = new Date(`${bill.month}-01`).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  })

  const deliveredDays = dailyDeliveries.filter((d) => d.status === "delivered").length
  const totalDays = dailyDeliveries.length

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <span>
              {bill.customerName} - {monthName} Details
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border-blue-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-blue-600">Total Days</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-blue-700">{totalDays}</div>
              </CardContent>
            </Card>
            <Card className="border-green-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-green-600">Delivered</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-green-700">{deliveredDays}</div>
              </CardContent>
            </Card>
            <Card className="border-purple-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-purple-600">Total Milk</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-purple-700">{bill.totalLiters}L</div>
              </CardContent>
            </Card>
            <Card className="border-orange-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-orange-600">Rate/Liter</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-orange-700">₨{customerRate}</div>
              </CardContent>
            </Card>
          </div>

          {/* Bill Summary */}
          <Card className="border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-700">Bill Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">This Month:</span>
                  <div className="font-medium text-blue-600">₨{bill.totalAmount.toFixed(2)}</div>
                </div>
                <div>
                  <span className="text-gray-500">Previous Balance:</span>
                  <div className="font-medium text-orange-600">₨{bill.previousBalance.toFixed(2)}</div>
                </div>
                <div>
                  <span className="text-gray-500">Total Due:</span>
                  <div className="font-medium text-red-600">₨{bill.totalDue.toFixed(2)}</div>
                </div>
                <div>
                  <span className="text-gray-500">Remaining:</span>
                  <div className="font-medium text-purple-600">₨{bill.remainingBalance.toFixed(2)}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Daily Deliveries Table */}
          <Card className="border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-700 flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Daily Delivery Record
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading daily deliveries...</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Day</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead className="text-center">
                          <div className="flex items-center justify-center">
                            <Milk className="w-4 h-4 mr-1" />
                            Quantity (L)
                          </div>
                        </TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dailyDeliveries.map((delivery) => (
                        <TableRow key={delivery.date}>
                          <TableCell className="font-medium">
                            {new Date(delivery.date).toLocaleDateString("en-US", {
                              day: "2-digit",
                              month: "short",
                            })}
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">{delivery.dayName}</TableCell>
                          <TableCell className="text-center">{getStatusBadge(delivery.status)}</TableCell>
                          <TableCell className="text-center font-medium">
                            {delivery.status === "delivered" && delivery.quantity ? `${delivery.quantity}L` : "-"}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {delivery.amount > 0 ? `₨${delivery.amount.toFixed(2)}` : "-"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
