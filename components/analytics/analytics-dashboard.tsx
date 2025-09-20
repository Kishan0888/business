"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { getDataEntries, getTargets, getProducts, type DataEntry, type Target, type Product } from "@/lib/firestore"
import { BarChart3, TrendingUp, Download, DollarSign, ShoppingCart, Users } from "lucide-react"
import { OrdersByProductChart } from "./orders-by-product-chart"
import { RevenueOverTimeChart } from "./revenue-over-time-chart"
import { ProgressVsTargetChart } from "./progress-vs-target-chart"

export function AnalyticsDashboard() {
  const [entries, setEntries] = useState<DataEntry[]>([])
  const [targets, setTargets] = useState<Target[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [selectedProduct, setSelectedProduct] = useState("all")
  const [selectedChannel, setSelectedChannel] = useState("all")

  // Filtered data
  const [filteredEntries, setFilteredEntries] = useState<DataEntry[]>([])

  const channelOptions = [
    { value: "all", label: "All Channels" },
    { value: "sales-campaign", label: "Sales Campaign" },
    { value: "recurring-sales", label: "Recurring Sales" },
    { value: "lead-generation", label: "Lead Generation" },
    { value: "abandoned-cart", label: "Abandoned Cart" },
    { value: "media-engagement", label: "Media Engagement" },
  ]

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [entries, dateFrom, dateTo, selectedProduct, selectedChannel])

  const loadData = async () => {
    setLoading(true)
    try {
      const [entriesData, targetsData, productsData] = await Promise.all([
        getDataEntries(),
        getTargets(),
        getProducts(),
      ])

      setEntries(entriesData)
      setTargets(targetsData)
      setProducts(productsData)
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...entries]

    if (dateFrom) {
      filtered = filtered.filter((entry) => entry.date >= dateFrom)
    }
    if (dateTo) {
      filtered = filtered.filter((entry) => entry.date <= dateTo)
    }
    if (selectedProduct !== "all") {
      filtered = filtered.filter((entry) => entry.product === selectedProduct)
    }
    if (selectedChannel !== "all") {
      filtered = filtered.filter((entry) => entry.channel === selectedChannel)
    }

    setFilteredEntries(filtered)
  }

  const clearFilters = () => {
    setDateFrom("")
    setDateTo("")
    setSelectedProduct("all")
    setSelectedChannel("all")
  }

  const exportData = () => {
    if (filteredEntries.length === 0) return

    const headers = ["Date", "Channel", "Product", "Revenue/Value", "Orders", "Team Member"]
    const csvContent = [
      headers.join(","),
      ...filteredEntries.map((entry) => {
        const revenue =
          entry.orderValue || entry.revenue || entry.value || entry.abandonedCarts || entry.leadsGenerated || 0
        const orders = entry.orders || entry.leadsGenerated || entry.abandonedCarts || 0
        return [entry.date, entry.channel, entry.product || "", revenue, orders, entry.teamMember || ""].join(",")
      }),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `analytics-report-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  // Calculate summary metrics
  const totalRevenue = filteredEntries.reduce((sum, entry) => {
    return sum + (entry.orderValue || entry.revenue || entry.value || 0)
  }, 0)

  const totalOrders = filteredEntries.reduce((sum, entry) => {
    return sum + (entry.orders || 0)
  }, 0)

  const totalLeads = filteredEntries.reduce((sum, entry) => {
    return sum + (entry.leadsGenerated || 0)
  }, 0)

  const uniqueProducts = new Set(filteredEntries.map((entry) => entry.product).filter(Boolean)).size

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            Analytics & Reports
          </h2>
          <p className="text-muted-foreground mt-1">Comprehensive business insights and performance metrics</p>
        </div>
        <Button onClick={exportData} disabled={filteredEntries.length === 0} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters & Date Range</CardTitle>
          <CardDescription>Customize your analytics view</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label>From Date</Label>
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>To Date</Label>
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Channel</Label>
              <Select value={selectedChannel} onValueChange={setSelectedChannel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {channelOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Product</Label>
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Products</SelectItem>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.name}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button variant="outline" onClick={clearFilters} className="w-full bg-transparent">
                Clear Filters
              </Button>
            </div>
          </div>
          <div className="mt-4">
            <Badge variant="secondary">{filteredEntries.length} entries found</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">${totalRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold">{totalOrders.toLocaleString()}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Leads</p>
                <p className="text-2xl font-bold">{totalLeads.toLocaleString()}</p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Products</p>
                <p className="text-2xl font-bold">{uniqueProducts}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OrdersByProductChart entries={filteredEntries} />
        <RevenueOverTimeChart entries={filteredEntries} />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <ProgressVsTargetChart entries={filteredEntries} targets={targets} />
      </div>
    </div>
  )
}
