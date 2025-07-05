"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Send, ExternalLink, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Bill {
  _id: string
  customerName: string
  totalDue: number
  billSent: boolean
}

interface WhatsAppBillSenderProps {
  bills: Bill[]
  month: string
  onBillsSent: () => void
}

export function WhatsAppBillSender({ bills, month, onBillsSent }: WhatsAppBillSenderProps) {
  const [sending, setSending] = useState(false)
  const [whatsappLinks, setWhatsappLinks] = useState<string[]>([])
  const [currentLinkIndex, setCurrentLinkIndex] = useState(0)
  const { toast } = useToast()

  const sendBills = async () => {
    setSending(true)
    try {
      const pendingBills = bills.filter((bill) => !bill.billSent && bill.totalDue > 0)

      if (pendingBills.length === 0) {
        toast({
          title: "No Bills to Send",
          description: "All bills have been sent or have zero amount due.",
        })
        return
      }

      const response = await fetch("/api/whatsapp/send-bills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          month,
          billIds: pendingBills.map((bill) => bill._id),
        }),
      })

      const result = await response.json()

      if (result.success && result.whatsappLinks) {
        setWhatsappLinks(result.whatsappLinks)
        setCurrentLinkIndex(0)

        toast({
          title: "WhatsApp Links Ready!",
          description: `${result.messagesSent} bill links are ready. Send them one by one.`,
        })

        onBillsSent()
      } else {
        throw new Error("Failed to generate WhatsApp links")
      }
    } catch (error) {
      console.error("Failed to generate links:", error)
      toast({
        title: "Error",
        description: "Failed to generate WhatsApp links",
        variant: "destructive",
      })
    } finally {
      setSending(false)
    }
  }

  const openNextWhatsApp = () => {
    if (currentLinkIndex < whatsappLinks.length) {
      window.open(whatsappLinks[currentLinkIndex], "_blank", "noopener,noreferrer")
      setCurrentLinkIndex((prev) => prev + 1)
    }
  }

  const openAllWhatsApp = () => {
    whatsappLinks.forEach((link, index) => {
      setTimeout(() => {
        window.open(link, "_blank", "noopener,noreferrer")
      }, index * 1000) // 1 second delay between each
    })
    setCurrentLinkIndex(whatsappLinks.length)
  }

  return (
    <Card className="border-blue-200">
      <CardHeader>
        <CardTitle className="text-blue-700 flex items-center">
          <Send className="w-5 h-5 mr-2" />
          Send WhatsApp Bills
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {whatsappLinks.length === 0 ? (
          <div className="text-center">
            <Button onClick={sendBills} disabled={sending} className="bg-green-600 hover:bg-green-700" size="lg">
              <Send className="w-4 h-4 mr-2" />
              {sending ? "Preparing Links..." : "Generate WhatsApp Links"}
            </Button>
            <p className="text-sm text-gray-600 mt-2">This will prepare WhatsApp links for all pending bills</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge className="bg-green-100 text-green-800">{whatsappLinks.length} Links Ready</Badge>
              <Badge className="bg-blue-100 text-blue-800">
                {currentLinkIndex} / {whatsappLinks.length} Sent
              </Badge>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={openNextWhatsApp}
                disabled={currentLinkIndex >= whatsappLinks.length}
                className="bg-green-600 hover:bg-green-700"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Send Next ({currentLinkIndex + 1})
              </Button>

              <Button
                onClick={openAllWhatsApp}
                disabled={currentLinkIndex >= whatsappLinks.length}
                variant="outline"
                className="border-green-600 text-green-600 hover:bg-green-50"
              >
                Send All
              </Button>
            </div>

            {currentLinkIndex >= whatsappLinks.length && (
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Check className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-green-700 font-medium">All bills have been sent!</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
