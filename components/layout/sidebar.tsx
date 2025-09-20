"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"

interface SidebarProps {
  activeChannel: string
  onChannelChange: (channel: string) => void
}

const ShoppingCartIcon = () => (
  <div className="w-4 h-4 border border-current rounded-sm relative">
    <div className="absolute -top-1 -right-1 w-2 h-2 border border-current rounded-full bg-current"></div>
  </div>
)

const RefreshIcon = () => (
  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
)

const UsersIcon = () => (
  <div className="w-4 h-4 flex gap-0.5">
    <div className="w-1.5 h-1.5 bg-current rounded-full"></div>
    <div className="w-1.5 h-1.5 bg-current rounded-full"></div>
  </div>
)

const ShoppingBagIcon = () => (
  <div className="w-4 h-4 border-2 border-current rounded-b-lg relative">
    <div className="absolute -top-1 left-1 right-1 h-2 border border-current rounded-t-lg"></div>
  </div>
)

const MonitorIcon = () => (
  <div className="w-4 h-4 border border-current rounded relative">
    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-2 h-0.5 bg-current"></div>
  </div>
)

const SettingsIcon = () => (
  <div className="w-4 h-4 border-2 border-current rounded-full relative">
    <div className="absolute inset-1 border border-current rounded-full"></div>
  </div>
)

const TargetIcon = () => (
  <div className="w-4 h-4 border-2 border-current rounded-full relative">
    <div className="absolute inset-1 border border-current rounded-full"></div>
    <div className="absolute inset-2 bg-current rounded-full"></div>
  </div>
)

const BarChartIcon = () => (
  <div className="w-4 h-4 flex items-end gap-0.5">
    <div className="w-1 h-2 bg-current"></div>
    <div className="w-1 h-3 bg-current"></div>
    <div className="w-1 h-1 bg-current"></div>
  </div>
)

const LogOutIcon = () => (
  <div className="w-4 h-4 border border-current rounded-l relative">
    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-2 h-0.5 bg-current"></div>
    <div className="absolute right-0 top-1 w-1 h-1 border-t border-r border-current transform rotate-45"></div>
  </div>
)

const MenuIcon = () => (
  <div className="w-4 h-4 flex flex-col justify-between">
    <div className="w-full h-0.5 bg-current"></div>
    <div className="w-full h-0.5 bg-current"></div>
    <div className="w-full h-0.5 bg-current"></div>
  </div>
)

const XIcon = () => (
  <div className="w-4 h-4 relative">
    <div className="absolute inset-0 w-0.5 bg-current transform rotate-45 origin-center"></div>
    <div className="absolute inset-0 w-0.5 bg-current transform -rotate-45 origin-center"></div>
  </div>
)

const channels = [
  { id: "sales-campaign", name: "Sales Campaign", icon: ShoppingCartIcon },
  { id: "recurring-sales", name: "Recurring Sales", icon: RefreshIcon },
  { id: "lead-generation", name: "Lead Generation", icon: UsersIcon },
  { id: "abandoned-cart", name: "Abandoned Cart", icon: ShoppingBagIcon },
  { id: "media-engagement", name: "Media Engagement", icon: MonitorIcon },
]

const managementItems = [
  { id: "products", name: "Products", icon: SettingsIcon },
  { id: "team-members", name: "Team Members", icon: UsersIcon },
  { id: "targets", name: "Targets", icon: TargetIcon },
  { id: "analytics", name: "Analytics", icon: BarChartIcon },
]

export function Sidebar({ activeChannel, onChannelChange }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { logout, user } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? <MenuIcon /> : <XIcon />}
      </Button>

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full bg-sidebar border-r border-sidebar-border transition-transform duration-300 z-40 ${
          isCollapsed ? "-translate-x-full md:translate-x-0" : "translate-x-0"
        } w-64`}
      >
        <div className="p-6">
          <h1 className="text-xl font-bold text-sidebar-primary">Business Dashboard</h1>
          <p className="text-sm text-sidebar-foreground/70 mt-1">Welcome, {user?.email?.split("@")[0]}</p>
        </div>

        <div className="px-4 space-y-6">
          {/* Channels */}
          <div>
            <h2 className="text-sm font-semibold text-sidebar-foreground/70 mb-3 px-2">DATA CHANNELS</h2>
            <div className="space-y-1">
              {channels.map((channel) => {
                const Icon = channel.icon
                return (
                  <Button
                    key={channel.id}
                    variant={activeChannel === channel.id ? "default" : "ghost"}
                    className={`w-full justify-start ${
                      activeChannel === channel.id
                        ? "bg-sidebar-primary text-sidebar-primary-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent"
                    }`}
                    onClick={() => onChannelChange(channel.id)}
                  >
                    <div className="mr-2">
                      <Icon />
                    </div>
                    {channel.name}
                  </Button>
                )
              })}
            </div>
          </div>

          {/* Management */}
          <div>
            <h2 className="text-sm font-semibold text-sidebar-foreground/70 mb-3 px-2">MANAGEMENT</h2>
            <div className="space-y-1">
              {managementItems.map((item) => {
                const Icon = item.icon
                return (
                  <Button
                    key={item.id}
                    variant={activeChannel === item.id ? "default" : "ghost"}
                    className={`w-full justify-start ${
                      activeChannel === item.id
                        ? "bg-sidebar-primary text-sidebar-primary-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent"
                    }`}
                    onClick={() => onChannelChange(item.id)}
                  >
                    <div className="mr-2">
                      <Icon />
                    </div>
                    {item.name}
                  </Button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Logout button */}
        <div className="absolute bottom-4 left-4 right-4">
          <Button
            variant="outline"
            className="w-full justify-start text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground bg-transparent"
            onClick={handleLogout}
          >
            <div className="mr-2">
              <LogOutIcon />
            </div>
            Logout
          </Button>
        </div>
      </div>

      {/* Overlay for mobile */}
      {!isCollapsed && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setIsCollapsed(true)} />
      )}
    </>
  )
}
