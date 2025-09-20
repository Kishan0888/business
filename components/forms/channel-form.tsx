"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { addDataEntry, getProducts, getTeamMembers, type Product, type TeamMember } from "@/lib/firestore"

const PlusIcon = () => (
  <div className="w-5 h-5 relative">
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-3 h-0.5 bg-current"></div>
    </div>
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-0.5 h-3 bg-current"></div>
    </div>
  </div>
)

interface ChannelFormProps {
  channel: string
  onEntryAdded: () => void
}

const channelConfigs = {
  "sales-campaign": {
    title: "Sales Campaign Entry",
    fields: [
      { name: "product", label: "Product", type: "select", required: true },
      { name: "orders", label: "No. of Orders", type: "number", required: true },
      { name: "orderValue", label: "Order Value", type: "number", required: true, prefix: "$" },
    ],
  },
  "recurring-sales": {
    title: "Recurring Sales Entry",
    fields: [
      { name: "product", label: "Product", type: "select", required: true },
      { name: "orders", label: "No. of Orders", type: "number", required: true },
      { name: "revenue", label: "Revenue", type: "number", required: true, prefix: "$" },
      { name: "teamMember", label: "Team Member", type: "team-select", required: true },
    ],
  },
  "lead-generation": {
    title: "Lead Generation Entry",
    fields: [
      { name: "product", label: "Product", type: "select", required: true },
      { name: "leadsGenerated", label: "Leads Generated", type: "number", required: true },
      { name: "conversion", label: "Conversion (%)", type: "number", required: true, suffix: "%" },
      { name: "value", label: "Value", type: "number", required: true, prefix: "$" },
    ],
  },
  "abandoned-cart": {
    title: "Abandoned Cart Entry",
    fields: [
      { name: "product", label: "Product", type: "select", required: true },
      { name: "abandonedCarts", label: "Abandoned Carts Received", type: "number", required: true },
      { name: "conversion", label: "Conversion (%)", type: "number", required: true, suffix: "%" },
      { name: "revenue", label: "Revenue", type: "number", required: true, prefix: "$" },
    ],
  },
  "media-engagement": {
    title: "Media Engagement Entry",
    fields: [
      { name: "orders", label: "No. of Orders", type: "number", required: true },
      { name: "value", label: "Value", type: "number", required: true, prefix: "$" },
    ],
  },
}

export function ChannelForm({ channel, onEntryAdded }: ChannelFormProps) {
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [products, setProducts] = useState<Product[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const config = channelConfigs[channel as keyof typeof channelConfigs]

  useEffect(() => {
    loadData()
    // Reset form when channel changes
    setFormData({ date: new Date().toISOString().split("T")[0] })
  }, [channel])

  const loadData = async () => {
    try {
      const [productsData, teamMembersData] = await Promise.all([getProducts(), getTeamMembers()])
      setProducts(productsData)
      setTeamMembers(teamMembersData)
    } catch (error) {
      console.error("Error loading data:", error)
    }
  }

  const handleInputChange = (name: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    try {
      // Validate required fields
      const requiredFields = config.fields.filter((field) => field.required)
      for (const field of requiredFields) {
        if (!formData[field.name]) {
          throw new Error(`${field.label} is required`)
        }
      }

      if (!formData.date) {
        throw new Error("Date is required")
      }

      await addDataEntry({
        channel,
        date: formData.date,
        ...formData,
      })

      setSuccess("Entry added successfully!")
      setFormData({ date: new Date().toISOString().split("T")[0] })
      onEntryAdded()

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (!config) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Invalid channel selected.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PlusIcon />
          {config.title}
        </CardTitle>
        <CardDescription>Enter daily data for {config.title.toLowerCase()}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Date field */}
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date || ""}
              onChange={(e) => handleInputChange("date", e.target.value)}
              required
            />
          </div>

          {/* Dynamic fields based on channel */}
          {config.fields.map((field) => (
            <div key={field.name} className="space-y-2">
              <Label htmlFor={field.name}>{field.label}</Label>

              {field.type === "select" && (
                <Select
                  value={formData[field.name] || ""}
                  onValueChange={(value) => handleInputChange(field.name, value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.name}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {field.type === "team-select" && (
                <Select
                  value={formData[field.name] || ""}
                  onValueChange={(value) => handleInputChange(field.name, value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {teamMembers.map((member) => (
                      <SelectItem key={member.id} value={member.name}>
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {field.type === "number" && (
                <div className="relative">
                  {field.prefix && (
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                      {field.prefix}
                    </span>
                  )}
                  <Input
                    id={field.name}
                    type="number"
                    step="0.01"
                    value={formData[field.name] || ""}
                    onChange={(e) => handleInputChange(field.name, Number.parseFloat(e.target.value) || 0)}
                    className={field.prefix ? "pl-8" : field.suffix ? "pr-8" : ""}
                    required={field.required}
                  />
                  {field.suffix && (
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                      {field.suffix}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50 text-green-800">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Adding Entry..." : "Add Entry"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
