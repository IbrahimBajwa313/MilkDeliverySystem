"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Users, Truck, Receipt, CreditCard, BarChart3, Settings } from "lucide-react"

const navigation = [
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Delivery", href: "/delivery", icon: Truck },
  { name: "Bills", href: "/bills", icon: Receipt },
  { name: "Payments", href: "/payments", icon: CreditCard },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="bg-white shadow-sm border-b border-blue-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <div className="text-xl font-bold text-blue-600">Tayba Khalis Milk</div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium",
                      pathname === item.href
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:border-blue-300 hover:text-blue-600",
                    )}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile navigation */}
      <div className="sm:hidden">
        <div className="pt-2 pb-3 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "block pl-3 pr-4 py-2 border-l-4 text-base font-medium",
                  pathname === item.href
                    ? "bg-blue-50 border-blue-500 text-blue-700"
                    : "border-transparent text-gray-500 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700",
                )}
              >
                <div className="flex items-center">
                  <Icon className="w-4 h-4 mr-3" />
                  {item.name}
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
