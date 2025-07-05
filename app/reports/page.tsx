"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BarChart3, Download, Send } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Customer {
  id: string
  name: string
  phone: string
  ratePerLiter: number
}

interface Report {
  customer: Customer
  totalLiters: number
  totalAmount: number
  deliveryCount: number
}

export default function ReportsPage() {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  })
  const [selectedCustomer, setSelectedCustomer] = useState<string>("all")
  const [customers, setCustomers] = useState<Customer[]>([])
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(false)
  const [sendingBills, setSendingBills] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchCustomers()
  }, [])

  useEffect(() => {
    if (customers.length > 0) {
      fetchReports()
    }
  }, [selectedMonth, selectedCustomer, customers])

  const fetchCustomers = async () => {
    try {
      const response = await fetch("/api/customers")
      const data = await response.json()
      setCustomers(data)
    } catch (error) {
      console.error("Failed to fetch customers:", error)
    }
  }

  const fetchReports = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        month: selectedMonth,
        ...(selectedCustomer !== "all" && { customerId: selectedCustomer }),
      })

      const response = await fetch(`/api/reports?${params}`)
      const data = await response.json()
      setReports(data)
    } catch (error) {
      console.error("Failed to fetch reports:", error)
    } finally {
      setLoading(false)
    }
  }

  const sendWhatsAppBills = async () => {
    setSendingBills(true)
    try {
      const response = await fetch("/api/whatsapp/send-bills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month: selectedMonth }),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Bills Sent Successfully",
          description: `Sent ${result.messagesSent} bills out of ${result.totalCustomers} customers.`,
        })
      } else {
        throw new Error("Failed to send bills")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send WhatsApp bills. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSendingBills(false)
    }
  }

  const exportToCSV = () => {
    const headers = ["Customer Name", "Phone", "Total Liters", "Rate per Liter", "Total Amount", "Delivery Count"]
    const csvContent = [
      headers.join(","),
      ...reports.map((report) =>
        [
          report.customer.name,
          report.customer.phone,
          report.totalLiters,
          report.customer.ratePerLiter,
          report.totalAmount.toFixed(2),
          report.deliveryCount,
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `milk-delivery-report-${selectedMonth}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const totalLiters = reports.reduce((sum, report) => sum + report.totalLiters, 0)
  const totalAmount = reports.reduce((sum, report) => sum + report.totalAmount, 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Billing & Reports</h1>
        <div className="flex items-center space-x-2">
          <Button onClick={exportToCSV} variant="outline" disabled={reports.length === 0}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={sendWhatsAppBills} disabled={sendingBills || reports.length === 0}>
            <Send className="w-4 h-4 mr-2" />
            {sendingBills ? "Sending..." : "Send Bills"}
          </Button>
        </div>
      </div>

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
                <SelectItem key={customer.id} value={customer.id}>
                  {customer.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reports.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Liters</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLiters.toFixed(1)}L</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rs.{totalAmount.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Report</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading reports...</div>
          ) : reports.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead className="text-right">Total Liters</TableHead>
                    <TableHead className="text-right">Rate/Liter</TableHead>
                    <TableHead className="text-right">Total Amount</TableHead>
                    <TableHead className="text-right">Deliveries</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report.customer.id}>
                      <TableCell className="font-medium">{report.customer.name}</TableCell>
                      <TableCell>{report.customer.phone}</TableCell>
                      <TableCell className="text-right">{report.totalLiters.toFixed(1)}L</TableCell>
                      <TableCell className="text-right">Rs.{report.customer.ratePerLiter}</TableCell>
                      <TableCell className="text-right font-medium">Rs.{report.totalAmount.toFixed(2)}</TableCell>
                      <TableCell className="text-right">{report.deliveryCount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">No delivery data found for the selected period.</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
