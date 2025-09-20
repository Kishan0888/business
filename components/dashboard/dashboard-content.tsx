"use client"

import { useState } from "react"
import { ChannelForm } from "@/components/forms/channel-form"
import { EntriesTable } from "@/components/tables/entries-table"
import { ProductManagement } from "@/components/management/product-management"
import { TeamManagement } from "@/components/management/team-management"
import { TargetManagement } from "@/components/management/target-management"
import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard"

interface DashboardContentProps {
  activeChannel: string
}

export function DashboardContent({ activeChannel }: DashboardContentProps) {
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const getChannelTitle = (channel: string) => {
    const titles: Record<string, string> = {
      "sales-campaign": "Sales Campaign",
      "recurring-sales": "Recurring Sales",
      "lead-generation": "Lead Generation",
      "abandoned-cart": "Abandoned Cart",
      "media-engagement": "Media Engagement",
      products: "Product Management",
      "team-members": "Team Members",
      targets: "Target Management",
      analytics: "Analytics & Reports",
    }
    return titles[channel] || "Dashboard"
  }

  const handleEntryAdded = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  const isDataChannel = [
    "sales-campaign",
    "recurring-sales",
    "lead-generation",
    "abandoned-cart",
    "media-engagement",
  ].includes(activeChannel)

  if (activeChannel === "products") {
    return (
      <div className="p-6">
        <ProductManagement />
      </div>
    )
  }

  if (activeChannel === "team-members") {
    return (
      <div className="p-6">
        <TeamManagement />
      </div>
    )
  }

  if (activeChannel === "targets") {
    return (
      <div className="p-6">
        <TargetManagement />
      </div>
    )
  }

  if (activeChannel === "analytics") {
    return (
      <div className="p-6">
        <AnalyticsDashboard />
      </div>
    )
  }

  if (isDataChannel) {
    return (
      <div className="p-6 space-y-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">{getChannelTitle(activeChannel)}</h1>
          <p className="text-muted-foreground mt-2">
            Enter and manage your {getChannelTitle(activeChannel).toLowerCase()} data
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChannelForm channel={activeChannel} onEntryAdded={handleEntryAdded} />
          <EntriesTable channel={activeChannel} refreshTrigger={refreshTrigger} />
        </div>
      </div>
    )
  }

  // Fallback
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">{getChannelTitle(activeChannel)}</h1>
        <p className="text-muted-foreground mt-2">Manage your business data and analytics</p>
      </div>

      <div className="text-center py-12 text-muted-foreground">
        <p className="text-lg mb-2">Page Not Found</p>
        <p>The requested section could not be found.</p>
      </div>
    </div>
  )
}
