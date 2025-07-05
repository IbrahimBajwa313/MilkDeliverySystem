"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { WhatsAppBillSender } from "@/components/whatsapp-bill-sender"
import { BillDetailsModal } from "@/components/bill-details-modal"
import { PaymentModal } from "@/components/payment-modal"
import { Receipt, FileText, ExternalLink, Eye, RefreshCw, CreditCard, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { generateWhatsAppLink, generateMonthlyBillMessage } from "@/lib/whatsapp"

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
  billSent: boolean
  billSentAt?: string
}

interface Customer {
  _id: string
  phone: string
  ratePerLiter: number
}

export default function BillsPage() {
  const [bills, setBills] = useState<Bill[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  })
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchBills()
    fetchCustomers()
  }, [selectedMonth, statusFilter])

  const fetchCustomers = async () => {
    try {
      const response = await fetch("/api/customers")
      const data = await response.json()
      setCustomers(data)
    } catch (error) {
      console.error("Failed to fetch customers:", error)
    }
  }

  const fetchBills = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        month: selectedMonth,
        ...(statusFilter !== "all" && { status: statusFilter }),
      })

      const response = await fetch(`/api/bills?${params}`)
      const data = await response.json()
      setBills(data)
    } catch (error) {
      console.error("Failed to fetch bills:", error)
      toast({
        title: "Error",
        description: "Failed to load bills",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const refreshBills = async () => {
    setRefreshing(true)
    try {
      await fetchBills()
      toast({
        title: "Success",
        description: "Bills refreshed successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh bills",
        variant: "destructive",
      })
    } finally {
      setRefreshing(false)
    }
  }

  const markBillAsPaid = async (bill: Bill) => {
    try {
      const response = await fetch(`/api/bills/${bill._id}/payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: bill.remainingBalance,
          paymentMethod: "cash",
          notes: "Full payment - marked as paid",
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Bill Paid",
          description: `${bill.customerName}'s bill has been marked as fully paid`,
        })
        fetchBills()
      } else {
        throw new Error(result.error || "Failed to mark bill as paid")
      }
    } catch (error) {
      console.error("Failed to mark bill as paid:", error)
      toast({
        title: "Error",
        description: "Failed to mark bill as paid",
        variant: "destructive",
      })
    }
  }

  const sendIndividualBill = (bill: Bill) => {
    const customer = customers.find((c) => c._id === bill.customerId)
    if (!customer) {
      toast({
        title: "Error",
        description: "Customer information not found",
        variant: "destructive",
      })
      return
    }

    const monthName = new Date(`${bill.month}-01`).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    })

    const message = generateMonthlyBillMessage(
      bill.customerName,
      monthName,
      bill.totalLiters,
      bill.totalAmount,
      bill.previousBalance,
      bill.totalDue,
    )

    const whatsappLink = generateWhatsAppLink(customer.phone, message)
    window.open(whatsappLink, "_blank", "noopener,noreferrer")

    // Mark as sent
    fetch(`/api/bills/${bill._id}/mark-sent`, {
      method: "POST",
    }).then(() => {
      fetchBills()
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>
      case "partial":
        return <Badge className="bg-yellow-100 text-yellow-800">Partial</Badge>
      default:
        return <Badge className="bg-red-100 text-red-800">Pending</Badge>
    }
  }

  const getTotalStats = () => {
    return bills.reduce(
      (acc, bill) => ({
        totalDue: acc.totalDue + bill.totalDue,
        totalPaid: acc.totalPaid + bill.amountPaid,
        totalRemaining: acc.totalRemaining + bill.remainingBalance,
      }),
      { totalDue: 0, totalPaid: 0, totalRemaining: 0 },
    )
  }

  const stats = getTotalStats()

  if (loading) {
    return <div className="text-center py-8">Loading bills...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-2">
          <Receipt className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Billing System</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={refreshBills} disabled={refreshing} variant="outline" size="sm">
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="month">Month</Label>
          <Input id="month" type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="partial">Partial</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* WhatsApp Bill Sender */}
      {bills.length > 0 && <WhatsAppBillSender bills={bills} month={selectedMonth} onBillsSent={fetchBills} />}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-600">Total Due</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">₨{stats.totalDue.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card className="border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600">Total Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">₨{stats.totalPaid.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card className="border-red-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-600">Remaining</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700">₨{stats.totalRemaining.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Bills Table */}
      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-700">Monthly Bills</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Milk (L)</TableHead>
                  <TableHead>This Month</TableHead>
                  <TableHead>Previous Balance</TableHead>
                  <TableHead>Total Due</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead>Remaining</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bills.map((bill) => {
                  const customer = customers.find((c) => c._id === bill.customerId)
                  return (
                    <TableRow key={bill._id}>
                      <TableCell className="font-medium">{bill.customerName}</TableCell>
                      <TableCell>{bill.totalLiters.toFixed(1)}</TableCell>
                      <TableCell>₨{bill.totalAmount.toFixed(2)}</TableCell>
                      <TableCell>₨{bill.previousBalance.toFixed(2)}</TableCell>
                      <TableCell className="font-medium">₨{bill.totalDue.toFixed(2)}</TableCell>
                      <TableCell>₨{bill.amountPaid.toFixed(2)}</TableCell>
                      <TableCell className="font-medium">₨{bill.remainingBalance.toFixed(2)}</TableCell>
                      <TableCell className="text-center">{getStatusBadge(bill.status)}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <BillDetailsModal
                            bill={bill}
                            customerRate={customer?.ratePerLiter || 0}
                            trigger={
                              <Button
                                size="sm"
                                variant="outline"
                                className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                              >
                                <Eye className="w-3 h-3 mr-1" />
                                Details
                              </Button>
                            }
                          />

                          {bill.status !== "paid" && (
                            <>
                              <PaymentModal
                                bill={bill}
                                onPaymentSuccess={fetchBills}
                                trigger={
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                                  >
                                    <CreditCard className="w-3 h-3 mr-1" />
                                    Pay
                                  </Button>
                                }
                              />

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => markBillAsPaid(bill)}
                                className="bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                              >
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Mark Paid
                              </Button>
                            </>
                          )}

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => sendIndividualBill(bill)}
                            className="bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Send
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {bills.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">No bills found for this month</p>
          <p className="text-sm text-gray-400">Bills are automatically generated when you have delivery records</p>
        </div>
      )}
    </div>
  )
}
