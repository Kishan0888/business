"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { LoginForm } from "@/components/auth/login-form"
import { Sidebar } from "@/components/layout/sidebar"
import { DashboardContent } from "@/components/dashboard/dashboard-content"

export default function Home() {
  const { user, loading } = useAuth()
  const [isSignup, setIsSignup] = useState(false)
  const [activeChannel, setActiveChannel] = useState("sales-campaign")

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return <LoginForm onToggleMode={() => setIsSignup(!isSignup)} isSignup={isSignup} />
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar activeChannel={activeChannel} onChannelChange={setActiveChannel} />
      <div className="md:ml-64">
        <DashboardContent activeChannel={activeChannel} />
      </div>
    </div>
  )
}
