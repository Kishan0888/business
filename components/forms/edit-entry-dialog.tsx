"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  updateDataEntry,
  getProducts,
  getTeamMembers,
  type DataEntry,
  type Product,
  type TeamMember,
} from "@/lib/firestore"
import { Edit } from "lucide-react"

interface EditEntryDialogProps {
  entry: DataEntry | null
  isOpen: boolean
  onClose: () => void
  onEntryUpdated: () => void
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

export function EditEntryDialog({ entry, isOpen, onClose, onEntryUpdated }: EditEntryDialogProps) {
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [products, setProducts] = useState<Product[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const config = entry ? channelConfigs[entry.channel as keyof typeof channelConfigs] : null

  useEffect(() => {
    if (entry && isOpen) {
      setFormData({
        date: entry.date,
        product: entry.product || "",
        teamMember: entry.teamMember || "",
        orders: entry.orders || "",
        orderValue: entry.orderValue || "",
        revenue: entry.revenue || "",
        leadsGenerated: entry.leadsGenerated || "",
        conversion: entry.conversion || "",
        value: entry.value || "",
        abandonedCarts: entry.abandonedCarts || "",
      })
      loadData()
    }
  }, [entry, isOpen])

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
    if (!entry) return

    setError("")
    setLoading(true)

    try {
      // Validate required fields
      if (config) {
        const requiredFields = config.fields.filter((field) => field.required)
        for (const field of requiredFields) {
          if (!formData[field.name]) {
            throw new Error(`${field.label} is required`)
          }
        }
      }

      if (!formData.date) {
        throw new Error("Date is required")
      }

      await updateDataEntry(entry.id, {
        date: formData.date,
        product: formData.product,
        teamMember: formData.teamMember,
        orders: formData.orders ? Number(formData.orders) : undefined,
        orderValue: formData.orderValue ? Number(formData.orderValue) : undefined,
        revenue: formData.revenue ? Number(formData.revenue) : undefined,
        leadsGenerated: formData.leadsGenerated ? Number(formData.leadsGenerated) : undefined,
        conversion: formData.conversion ? Number(formData.conversion) : undefined,
        value: formData.value ? Number(formData.value) : undefined,
        abandonedCarts: formData.abandonedCarts ? Number(formData.abandonedCarts) : undefined,
      })

      onEntryUpdated()
      onClose()
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (!entry || !config) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5 text-primary" />
            Edit {config.title}
          </DialogTitle>
          <DialogDescription>Update the entry details</DialogDescription>
        </DialogHeader>
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

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Entry"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
