"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { CreditCard, DollarSign } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Bill {
  _id: string
  customerName: string
  totalDue: number
  amountPaid: number
  remainingBalance: number
  status: string
}

interface PaymentModalProps {
  bill: Bill
  onPaymentSuccess: () => void
  trigger: React.ReactNode
}

export function PaymentModal({ bill, onPaymentSuccess, trigger }: PaymentModalProps) {
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("cash")
  const [notes, setNotes] = useState("")
  const [processing, setProcessing] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const paymentAmount = Number.parseFloat(amount)
    if (paymentAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid payment amount",
        variant: "destructive",
      })
      return
    }

    if (paymentAmount > bill.remainingBalance) {
      toast({
        title: "Amount Too High",
        description: `Payment cannot exceed remaining balance of ₨${bill.remainingBalance.toFixed(2)}`,
        variant: "destructive",
      })
      return
    }

    setProcessing(true)
    try {
      const response = await fetch(`/api/bills/${bill._id}/payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: paymentAmount,
          paymentMethod,
          notes,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Payment Recorded",
          description: result.message,
        })
        setOpen(false)
        setAmount("")
        setNotes("")
        onPaymentSuccess()
      } else {
        throw new Error(result.error || "Failed to record payment")
      }
    } catch (error) {
      console.error("Payment error:", error)
      toast({
        title: "Payment Failed",
        description: "Failed to record payment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setProcessing(false)
    }
  }

  const handleFullPayment = () => {
    setAmount(bill.remainingBalance.toString())
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <CreditCard className="w-5 h-5 text-green-600" />
            <span>Record Payment - {bill.customerName}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Bill Summary */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-500">Total Due:</span>
                <div className="font-medium">₨{bill.totalDue.toFixed(2)}</div>
              </div>
              <div>
                <span className="text-gray-500">Already Paid:</span>
                <div className="font-medium text-green-600">₨{bill.amountPaid.toFixed(2)}</div>
              </div>
              <div className="col-span-2">
                <span className="text-gray-500">Remaining Balance:</span>
                <div className="font-bold text-red-600 text-lg">₨{bill.remainingBalance.toFixed(2)}</div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="amount">Payment Amount (₨)</Label>
              <div className="flex space-x-2">
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  max={bill.remainingBalance}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  required
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleFullPayment}
                  className="whitespace-nowrap bg-transparent"
                >
                  Full Payment
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="mobile_payment">Mobile Payment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about this payment..."
                rows={2}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={processing} className="bg-green-600 hover:bg-green-700">
                <DollarSign className="w-4 h-4 mr-2" />
                {processing ? "Recording..." : "Record Payment"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
