"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  addTarget,
  getTargets,
  deleteTarget,
  getProducts,
  getDataEntries,
  type Target,
  type Product,
  type DataEntry,
} from "@/lib/firestore"
import { Plus, TargetIcon, Trash2, TrendingUp, Calendar } from "lucide-react"

const channelOptions = [
  { value: "sales-campaign", label: "Sales Campaign" },
  { value: "recurring-sales", label: "Recurring Sales" },
  { value: "lead-generation", label: "Lead Generation" },
  { value: "abandoned-cart", label: "Abandoned Cart" },
  { value: "media-engagement", label: "Media Engagement" },
]

interface TargetWithProgress extends Target {
  progress: number
  progressPercentage: number
}

export function TargetManagement() {
  const [targets, setTargets] = useState<TargetWithProgress[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [entries, setEntries] = useState<DataEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [addingTarget, setAddingTarget] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Form state
  const [selectedChannel, setSelectedChannel] = useState("")
  const [selectedProduct, setSelectedProduct] = useState("")
  const [targetAmount, setTargetAmount] = useState("")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [targetsData, productsData, entriesData] = await Promise.all([
        getTargets(),
        getProducts(),
        getDataEntries(),
      ])

      setProducts(productsData)
      setEntries(entriesData)

      // Calculate progress for each target
      const targetsWithProgress = targetsData.map((target) => {
        const progress = calculateProgress(target, entriesData)
        return {
          ...target,
          progress,
          progressPercentage: target.amount > 0 ? Math.min((progress / target.amount) * 100, 100) : 0,
        }
      })

      setTargets(targetsWithProgress)
    } catch (error) {
      console.error("Error loading data:", error)
      setError("Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  const calculateProgress = (target: Target, entries: DataEntry[]): number => {
    const relevantEntries = entries.filter(
      (entry) => entry.channel === target.channel && entry.product === target.product,
    )

    let progress = 0

    switch (target.channel) {
      case "sales-campaign":
        progress = relevantEntries.reduce((sum, entry) => sum + (entry.orderValue || 0), 0)
        break
      case "recurring-sales":
        progress = relevantEntries.reduce((sum, entry) => sum + (entry.revenue || 0), 0)
        break
      case "lead-generation":
        progress = relevantEntries.reduce((sum, entry) => sum + (entry.value || 0), 0)
        break
      case "abandoned-cart":
        progress = relevantEntries.reduce((sum, entry) => sum + (entry.revenue || 0), 0)
        break
      case "media-engagement":
        progress = relevantEntries.reduce((sum, entry) => sum + (entry.value || 0), 0)
        break
    }

    return progress
  }

  const handleAddTarget = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedChannel || !selectedProduct || !targetAmount) return

    setAddingTarget(true)
    setError("")
    setSuccess("")

    try {
      // Check if target already exists for this channel-product combination
      const existingTarget = targets.find(
        (target) => target.channel === selectedChannel && target.product === selectedProduct,
      )

      if (existingTarget) {
        throw new Error("A target already exists for this channel and product combination")
      }

      await addTarget({
        channel: selectedChannel,
        product: selectedProduct,
        amount: Number.parseFloat(targetAmount),
      })

      setSelectedChannel("")
      setSelectedProduct("")
      setTargetAmount("")
      setSuccess("Target added successfully!")
      setIsDialogOpen(false)
      loadData()

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setAddingTarget(false)
    }
  }

  const handleDeleteTarget = async (id: string, channel: string, product: string) => {
    if (confirm(`Are you sure you want to delete the target for ${channel} - ${product}?`)) {
      try {
        await deleteTarget(id)
        setSuccess("Target deleted successfully!")
        loadData()

        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(""), 3000)
      } catch (error: any) {
        setError(error.message)
      }
    }
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A"
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString()
  }

  const getChannelLabel = (channel: string) => {
    const option = channelOptions.find((opt) => opt.value === channel)
    return option ? option.label : channel
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return "bg-green-500"
    if (percentage >= 75) return "bg-blue-500"
    if (percentage >= 50) return "bg-yellow-500"
    return "bg-red-500"
  }

  const getProgressStatus = (percentage: number) => {
    if (percentage >= 100) return { label: "Achieved", variant: "default" as const }
    if (percentage >= 75) return { label: "On Track", variant: "secondary" as const }
    if (percentage >= 50) return { label: "Behind", variant: "outline" as const }
    return { label: "Critical", variant: "destructive" as const }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <TargetIcon className="h-6 w-6 text-primary" />
            Target Management
          </h2>
          <p className="text-muted-foreground mt-1">Set and track targets for each product and channel</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Target
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Target</DialogTitle>
              <DialogDescription>Set a target amount for a specific channel and product combination.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddTarget} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="channel">Channel</Label>
                <Select value={selectedChannel} onValueChange={setSelectedChannel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select channel" />
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
                <Label htmlFor="product">Product</Label>
                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.name}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Target Amount ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  placeholder="Enter target amount"
                  required
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={addingTarget}>
                  {addingTarget ? "Adding..." : "Add Target"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {success && (
        <Alert className="border-green-200 bg-green-50 text-green-800">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TargetIcon className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Total Targets</span>
            </div>
            <p className="text-2xl font-bold mt-2">{targets.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Achieved</span>
            </div>
            <p className="text-2xl font-bold mt-2 text-green-600">
              {targets.filter((t) => t.progressPercentage >= 100).length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">In Progress</span>
            </div>
            <p className="text-2xl font-bold mt-2 text-yellow-600">
              {targets.filter((t) => t.progressPercentage > 0 && t.progressPercentage < 100).length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium">Not Started</span>
            </div>
            <p className="text-2xl font-bold mt-2 text-red-600">
              {targets.filter((t) => t.progressPercentage === 0).length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Targets & Progress</span>
            <Badge variant="secondary">{targets.length} total</Badge>
          </CardTitle>
          <CardDescription>Track progress towards your targets</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : targets.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <TargetIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">No targets set</p>
              <p>Add your first target to start tracking progress.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Channel</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Target Amount</TableHead>
                    <TableHead>Current Progress</TableHead>
                    <TableHead>Progress Bar</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Created
                    </TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {targets.map((target) => {
                    const status = getProgressStatus(target.progressPercentage)
                    return (
                      <TableRow key={target.id}>
                        <TableCell className="font-medium">{getChannelLabel(target.channel)}</TableCell>
                        <TableCell>{target.product}</TableCell>
                        <TableCell>${target.amount.toLocaleString()}</TableCell>
                        <TableCell>
                          ${target.progress.toLocaleString()} ({target.progressPercentage.toFixed(1)}%)
                        </TableCell>
                        <TableCell className="w-[200px]">
                          <div className="space-y-1">
                            <Progress value={target.progressPercentage} className="h-2" />
                            <div className="text-xs text-muted-foreground">
                              {target.progressPercentage.toFixed(1)}% complete
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{formatDate(target.createdAt)}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteTarget(target.id, target.channel, target.product)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
