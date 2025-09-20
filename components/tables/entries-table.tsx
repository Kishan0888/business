"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  getDataEntries,
  getProducts,
  getTeamMembers,
  deleteDataEntry,
  type DataEntry,
  type Product,
  type TeamMember,
} from "@/lib/firestore"
import { EditEntryDialog } from "@/components/forms/edit-entry-dialog"

const DownloadIcon = () => (
  <div className="w-4 h-4 border border-current rounded relative">
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-2 bg-current"></div>
    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-2 h-1 border-t border-l border-r border-current"></div>
  </div>
)

const FilterIcon = () => (
  <div className="w-4 h-4 relative">
    <div className="absolute top-0 left-0 right-0 h-1 bg-current"></div>
    <div className="absolute top-1 left-1 right-1 h-1 bg-current"></div>
    <div className="absolute top-2 left-2 right-2 h-1 bg-current"></div>
  </div>
)

const TrashIcon = () => (
  <div className="w-4 h-4 border border-current rounded relative">
    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-1 bg-current"></div>
    <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-0.5 h-2 bg-current"></div>
  </div>
)

const CalendarIcon = () => (
  <div className="w-4 h-4 border border-current rounded relative">
    <div className="absolute top-0 left-0 right-0 h-1 bg-current"></div>
    <div className="absolute top-1 left-1 w-0.5 h-0.5 bg-current"></div>
    <div className="absolute top-1 right-1 w-0.5 h-0.5 bg-current"></div>
  </div>
)

const EditIcon = () => (
  <div className="w-4 h-4 relative">
    <div className="absolute bottom-0 left-0 w-2 h-2 border-l border-b border-current"></div>
    <div className="absolute top-0 right-0 w-2 h-2 border border-current transform rotate-45"></div>
  </div>
)

const RefreshIcon = () => <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"></div>

interface EntriesTableProps {
  channel: string
  refreshTrigger: number
}

export function EntriesTable({ channel, refreshTrigger }: EntriesTableProps) {
  const [entries, setEntries] = useState<DataEntry[]>([])
  const [filteredEntries, setFilteredEntries] = useState<DataEntry[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(false)

  const [editingEntry, setEditingEntry] = useState<DataEntry | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  // Filters
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [selectedProduct, setSelectedProduct] = useState("")
  const [selectedTeamMember, setSelectedTeamMember] = useState("")

  useEffect(() => {
    loadData()
  }, [channel, refreshTrigger])

  useEffect(() => {
    applyFilters()
  }, [entries, dateFrom, dateTo, selectedProduct, selectedTeamMember])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (autoRefresh) {
      interval = setInterval(() => {
        loadData()
      }, 30000) // Refresh every 30 seconds
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [autoRefresh, channel])

  const loadData = async () => {
    setLoading(true)
    try {
      const [entriesData, productsData, teamMembersData] = await Promise.all([
        getDataEntries(channel),
        getProducts(),
        getTeamMembers(),
      ])
      setEntries(entriesData)
      setProducts(productsData)
      setTeamMembers(teamMembersData)
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
    if (selectedProduct) {
      filtered = filtered.filter((entry) => entry.product === selectedProduct)
    }
    if (selectedTeamMember) {
      filtered = filtered.filter((entry) => entry.teamMember === selectedTeamMember)
    }

    setFilteredEntries(filtered)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this entry?")) {
      try {
        await deleteDataEntry(id)
        loadData()
      } catch (error) {
        console.error("Error deleting entry:", error)
      }
    }
  }

  const handleEdit = (entry: DataEntry) => {
    setEditingEntry(entry)
    setIsEditDialogOpen(true)
  }

  const handleEditClose = () => {
    setEditingEntry(null)
    setIsEditDialogOpen(false)
  }

  const handleEntryUpdated = () => {
    loadData()
  }

  const exportToCSV = () => {
    if (filteredEntries.length === 0) return

    const headers = [
      "Date",
      "Product",
      "Team Member",
      ...Object.keys(filteredEntries[0]).filter(
        (key) => !["id", "channel", "date", "product", "teamMember", "createdAt"].includes(key),
      ),
    ]

    const csvContent = [
      headers.join(","),
      ...filteredEntries.map((entry) =>
        [
          entry.date,
          entry.product || "",
          entry.teamMember || "",
          ...headers.slice(3).map((header) => entry[header] || ""),
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${channel}-entries-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const clearFilters = () => {
    setDateFrom("")
    setDateTo("")
    setSelectedProduct("")
    setSelectedTeamMember("")
  }

  const getChannelTitle = (channel: string) => {
    const titles: Record<string, string> = {
      "sales-campaign": "Sales Campaign",
      "recurring-sales": "Recurring Sales",
      "lead-generation": "Lead Generation",
      "abandoned-cart": "Abandoned Cart",
      "media-engagement": "Media Engagement",
    }
    return titles[channel] || "Entries"
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon />
                {getChannelTitle(channel)} Entries
              </CardTitle>
              <CardDescription>
                View and manage all entries for {getChannelTitle(channel).toLowerCase()}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant={autoRefresh ? "default" : "outline"}
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className="flex items-center gap-2"
              >
                <div className={autoRefresh ? "animate-spin" : ""}>
                  <RefreshIcon />
                </div>
                Auto Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={exportToCSV} disabled={filteredEntries.length === 0}>
                <DownloadIcon />
                <span className="ml-2">Export CSV</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="mb-6 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 mb-4">
              <FilterIcon />
              <span className="font-medium">Filters</span>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear All
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">From Date</label>
                <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">To Date</label>
                <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Product</label>
                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                  <SelectTrigger>
                    <SelectValue placeholder="All products" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All products</SelectItem>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.name}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Team Member</label>
                <Select value={selectedTeamMember} onValueChange={setSelectedTeamMember}>
                  <SelectTrigger>
                    <SelectValue placeholder="All members" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All members</SelectItem>
                    {teamMembers.map((member) => (
                      <SelectItem key={member.id} value={member.name}>
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Results summary */}
          <div className="mb-4 flex items-center justify-between">
            <Badge variant="secondary">
              {filteredEntries.length} of {entries.length} entries
            </Badge>
            {autoRefresh && (
              <Badge variant="outline" className="text-green-600 border-green-200">
                Auto-refreshing every 30s
              </Badge>
            )}
          </div>

          {/* Table */}
          {filteredEntries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No entries found. Add some data to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Product</TableHead>
                    {channel === "recurring-sales" && <TableHead>Team Member</TableHead>}
                    {(channel === "sales-campaign" ||
                      channel === "recurring-sales" ||
                      channel === "media-engagement") && <TableHead>Orders</TableHead>}
                    {channel === "sales-campaign" && <TableHead>Order Value</TableHead>}
                    {channel === "recurring-sales" && <TableHead>Revenue</TableHead>}
                    {channel === "lead-generation" && <TableHead>Leads Generated</TableHead>}
                    {(channel === "lead-generation" || channel === "abandoned-cart") && (
                      <TableHead>Conversion %</TableHead>
                    )}
                    {(channel === "lead-generation" || channel === "media-engagement") && <TableHead>Value</TableHead>}
                    {channel === "abandoned-cart" && <TableHead>Abandoned Carts</TableHead>}
                    {channel === "abandoned-cart" && <TableHead>Revenue</TableHead>}
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>{entry.date}</TableCell>
                      <TableCell>{entry.product}</TableCell>
                      {channel === "recurring-sales" && <TableCell>{entry.teamMember}</TableCell>}
                      {(channel === "sales-campaign" ||
                        channel === "recurring-sales" ||
                        channel === "media-engagement") && <TableCell>{entry.orders}</TableCell>}
                      {channel === "sales-campaign" && <TableCell>${entry.orderValue}</TableCell>}
                      {channel === "recurring-sales" && <TableCell>${entry.revenue}</TableCell>}
                      {channel === "lead-generation" && <TableCell>{entry.leadsGenerated}</TableCell>}
                      {(channel === "lead-generation" || channel === "abandoned-cart") && (
                        <TableCell>{entry.conversion}%</TableCell>
                      )}
                      {(channel === "lead-generation" || channel === "media-engagement") && (
                        <TableCell>${entry.value}</TableCell>
                      )}
                      {channel === "abandoned-cart" && <TableCell>{entry.abandonedCarts}</TableCell>}
                      {channel === "abandoned-cart" && <TableCell>${entry.revenue}</TableCell>}
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(entry)}
                            className="text-primary hover:text-primary"
                          >
                            <EditIcon />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(entry.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <TrashIcon />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <EditEntryDialog
        entry={editingEntry}
        isOpen={isEditDialogOpen}
        onClose={handleEditClose}
        onEntryUpdated={handleEntryUpdated}
      />
    </>
  )
}
