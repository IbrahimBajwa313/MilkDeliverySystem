"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Settings, Save, Users, Calendar } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface SystemSettings {
  defaultMilkRate: number
}

interface UpdateStats {
  customersUpdated: number
  totalCustomers: number
  effectiveDate: string
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>({
    defaultMilkRate: 45,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [customerCount, setCustomerCount] = useState(0)
  const { toast } = useToast()

  useEffect(() => {
    fetchSettings()
    fetchCustomerCount()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/settings")
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCustomerCount = async () => {
    try {
      const response = await fetch("/api/customers/count")
      if (response.ok) {
        const data = await response.json()
        setCustomerCount(data.count)
      }
    } catch (error) {
      console.error("Failed to fetch customer count:", error)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        const result = await response.json()
        const stats: UpdateStats = result.updateStats

        toast({
          title: "Success",
          description: `New rate (₨${settings.defaultMilkRate}) will apply from ${stats.effectiveDate} onwards. Updated ${stats.customersUpdated} customers.`,
        })

        // Refresh customer count
        fetchCustomerCount()
      } else {
        throw new Error("Failed to save settings")
      }
    } catch (error) {
      console.error("Failed to save settings:", error)
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const today = new Date().toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })

  if (loading) {
    return <div className="text-center py-8">Loading settings...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Settings className="w-6 h-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
      </div>

      <div className="max-w-md">
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-700">Milk Rate Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="defaultRate">Default Rate per Liter (₨)</Label>
              <Input
                id="defaultRate"
                type="number"
                step="0.01"
                min="0"
                value={settings.defaultMilkRate}
                onChange={(e) => setSettings({ ...settings, defaultMilkRate: Number.parseFloat(e.target.value) || 0 })}
                className="text-lg font-medium"
              />
            </div>

            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-center space-x-2 text-blue-700 mb-2">
                <Users className="w-4 h-4" />
                <span className="font-medium">Impact</span>
              </div>
              <p className="text-sm text-blue-600">
                This will update the rate for <strong>all {customerCount} customers</strong> for future deliveries.
              </p>
            </div>

            <div className="bg-green-50 p-3 rounded-lg">
              <div className="flex items-center space-x-2 text-green-700 mb-2">
                <Calendar className="w-4 h-4" />
                <span className="font-medium">Effective Date</span>
              </div>
              <p className="text-sm text-green-600">
                New rate will apply from <strong>{today}</strong> onwards. Previous records remain unchanged.
              </p>
            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Updating Rate..." : "Apply New Rate"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="border-green-200 max-w-md">
        <CardHeader>
          <CardTitle className="text-green-700 text-sm">✅ Historical Data Protection</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-green-700 space-y-2">
            <p>• Previous delivery records will NOT be changed</p>
            <p>• Existing bills will keep their original amounts</p>
            <p>• Only future deliveries will use the new rate</p>
            <p>• Milk quantities are set individually per customer</p>
            <p>• Complete audit trail is maintained</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
