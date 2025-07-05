// Direct WhatsApp messaging using wa.me links
export interface WhatsAppMessage {
  to: string
  message: string
}

export async function sendWhatsAppMessage({ to, message }: WhatsAppMessage) {
  try {
    // Clean phone number (remove + and spaces)
    const cleanPhone = to.replace(/[\s+\-()]/g, "")

    // Create WhatsApp link
    const whatsappLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`

    // Open WhatsApp in new window/tab
    if (typeof window !== "undefined") {
      window.open(whatsappLink, "_blank", "noopener,noreferrer")
    }

    return {
      success: true,
      messageId: `wa_${Date.now()}`,
      to: cleanPhone,
      message,
      whatsappLink,
    }
  } catch (error) {
    console.error("WhatsApp link generation error:", error)
    return {
      success: false,
      error: "Failed to generate WhatsApp link",
    }
  }
}

export function generateMonthlyBillMessage(
  customerName: string,
  month: string,
  totalLiters: number,
  totalAmount: number,
  previousBalance: number,
  totalDue: number,
): string {
  return `*Tayba Khalis Milk*

Dear ${customerName},

Your ${month} milk bill:
🥛 Total Milk: ${totalLiters} liters
💰 This Month: Rs. ${totalAmount.toFixed(2)}
📋 Previous Balance: Rs. ${previousBalance.toFixed(2)}
💳 Total Due: Rs. ${totalDue.toFixed(2)}

Please pay at your earliest convenience.
Thank you!

Tayba Khalis Milk`
}

// Generate WhatsApp link for a single customer
export function generateWhatsAppLink(phone: string, message: string): string {
  const cleanPhone = phone.replace(/[\s+\-()]/g, "")
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
}
