"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart } from "lucide-react"
import type { DataEntry } from "@/lib/firestore"

interface OrdersByProductChartProps {
  entries: DataEntry[]
}

export function OrdersByProductChart({ entries }: OrdersByProductChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartRef = useRef<any>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    // Import Chart.js dynamically
    import("chart.js/auto").then((Chart) => {
      const ctx = canvasRef.current?.getContext("2d")
      if (!ctx) return

      // Destroy existing chart
      if (chartRef.current) {
        chartRef.current.destroy()
      }

      // Process data
      const productOrders: Record<string, number> = {}
      entries.forEach((entry) => {
        if (entry.product && entry.orders) {
          productOrders[entry.product] = (productOrders[entry.product] || 0) + entry.orders
        }
      })

      const labels = Object.keys(productOrders)
      const data = Object.values(productOrders)

      if (labels.length === 0) {
        return
      }

      // Create chart
      chartRef.current = new Chart.default(ctx, {
        type: "pie",
        data: {
          labels,
          datasets: [
            {
              data,
              backgroundColor: [
                "#3b82f6", // blue
                "#f97316", // orange
                "#fbbf24", // yellow
                "#34d399", // green
                "#6366f1", // indigo
                "#ec4899", // pink
                "#8b5cf6", // purple
                "#06b6d4", // cyan
              ],
              borderWidth: 2,
              borderColor: "#ffffff",
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "bottom",
              labels: {
                padding: 20,
                usePointStyle: true,
              },
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const label = context.label || ""
                  const value = context.parsed || 0
                  const total = data.reduce((sum, val) => sum + val, 0)
                  const percentage = ((value / total) * 100).toFixed(1)
                  return `${label}: ${value} orders (${percentage}%)`
                },
              },
            },
          },
        },
      })
    })

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy()
      }
    }
  }, [entries])

  const hasData = entries.some((entry) => entry.product && entry.orders)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChart className="h-5 w-5 text-primary" />
          Orders by Product
        </CardTitle>
        <CardDescription>Distribution of orders across different products</CardDescription>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <div className="h-[400px]">
            <canvas ref={canvasRef} />
          </div>
        ) : (
          <div className="h-[400px] flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <PieChart className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No order data available</p>
              <p className="text-sm">Add some entries with orders to see the chart</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
