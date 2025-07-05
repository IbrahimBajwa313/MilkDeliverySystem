"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { PaymentModal } from "@/components/payment-modal"
import { CreditCard, DollarSign, Calendar, User, TrendingUp } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Payment {
  _id: string
  customerId: string
  customerName: string
  billId: string
  amount: number
  paymentDate: string
  paymentMethod: string
  notes: string
  createdAt: string
}

interface Bill {
  _id: string
  customerId: string
  customerName: string
  month: string
  totalDue: number
  amountPaid: number
  remainingBalance: number
  status: string
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [bills, setBills] = useState<Bill[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  })
  const [selectedCustomer, setSelectedCustomer] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchPayments()
    fetchBills()
    fetchCustomers()
  }, [selectedMonth, selectedCustomer])

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
    try {
      const params = new URLSearchParams({ month: selectedMonth })
      const response = await fetch(`/api/bills?${params}`)
      const data = await response.json()
      setBills(data.filter((bill: Bill) => bill.status !== "paid"))
    } catch (error) {
      console.error("Failed to fetch bills:", error)
    }
  }

  const fetchPayments = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedCustomer !== "all") {
        params.append("customerId", selectedCustomer)
      }

      const response = await fetch(`/api/payments?${params}`)
      const data = await response.json()

      // Filter payments by month if needed
      const filteredPayments = data.filter((payment: Payment) => {
        const paymentMonth = new Date(payment.paymentDate).toISOString().slice(0, 7)
        return paymentMonth === selectedMonth
      })

      setPayments(filteredPayments)
    } catch (error) {
      console.error("Failed to fetch payments:", error)
      toast({
        title: "Error",
        description: "Failed to load payments",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getPaymentMethodBadge = (method: string) => {
    switch (method) {
      case "cash":
        return <Badge className="bg-green-100 text-green-800">Cash</Badge>
      case "bank_transfer":
        return <Badge className="bg-blue-100 text-blue-800">Bank Transfer</Badge>
      case "mobile_payment":
        return <Badge className="bg-purple-100 text-purple-800">Mobile Payment</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">{method}</Badge>
    }
  }

  const getTotalPayments = () => {
    return payments.reduce((total, payment) => total + payment.amount, 0)
  }

  const getUnpaidBills = () => {
    return bills.filter((bill) => bill.remainingBalance > 0)
  }

  if (loading) {
    return <div className="text-center py-8">Loading payments...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-2">
        <CreditCard className="w-6 h-6 text-green-600" />
        <h1 className="text-2xl font-bold text-gray-900">Payment Management</h1>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="month">Month</Label>
          <Input id="month" type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="customer">Customer</Label>
          <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Customers</SelectItem>
              {customers.map((customer) => (
                <SelectItem key={customer._id} value={customer._id}>
                  {customer.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600">Total Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">₨{getTotalPayments().toFixed(2)}</div>
            <p className="text-xs text-green-600">{payments.length} transactions</p>
          </CardContent>
        </Card>
        <Card className="border-red-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-600">Unpaid Bills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700">{getUnpaidBills().length}</div>
            <p className="text-xs text-red-600">customers with pending payments</p>
          </CardContent>
        </Card>
        <Card className="border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-600">Outstanding Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">
              ₨
              {getUnpaidBills()
                .reduce((total, bill) => total + bill.remainingBalance, 0)
                .toFixed(2)}
            </div>
            <p className="text-xs text-blue-600">total remaining</p>
          </CardContent>
        </Card>
      </div>

      {/* Unpaid Bills Section */}
      {getUnpaidBills().length > 0 && (
        <Card className="border-orange-200">
          <CardHeader>
            <CardTitle className="text-orange-700 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Pending Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Total Due</TableHead>
                    <TableHead>Paid</TableHead>
                    <TableHead>Remaining</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getUnpaidBills().map((bill) => (
                    <TableRow key={bill._id}>
                      <TableCell className="font-medium">{bill.customerName}</TableCell>
                      <TableCell>₨{bill.totalDue.toFixed(2)}</TableCell>
                      <TableCell>₨{bill.amountPaid.toFixed(2)}</TableCell>
                      <TableCell className="font-medium text-red-600">₨{bill.remainingBalance.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            bill.status === "partial" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"
                          }
                        >
                          {bill.status === "partial" ? "Partial" : "Pending"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <PaymentModal
                          bill={bill}
                          onPaymentSuccess={() => {
                            fetchPayments()
                            fetchBills()
                          }}
                          trigger={
                            <Button size="sm" className="bg-green-600 hover:bg-green-700">
                              <DollarSign className="w-3 h-3 mr-1" />
                              Record Payment
                            </Button>
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment History */}
      <Card className="border-green-200">
        <CardHeader>
          <CardTitle className="text-green-700 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Payment History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment._id}>
                      <TableCell>
                        {new Date(payment.paymentDate).toLocaleDateString("en-US", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-2 text-gray-400" />
                          {payment.customerName}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-green-600">₨{payment.amount.toFixed(2)}</TableCell>
                      <TableCell>{getPaymentMethodBadge(payment.paymentMethod)}</TableCell>
                      <TableCell className="text-sm text-gray-600">{payment.notes || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No payments found for the selected period</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
