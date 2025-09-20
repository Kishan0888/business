"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp } from "lucide-react"
import type { DataEntry } from "@/lib/firestore"

interface RevenueOverTimeChartProps {
  entries: DataEntry[]
}

export function RevenueOverTimeChart({ entries }: RevenueOverTimeChartProps) {
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
      const dailyRevenue: Record<string, number> = {}
      entries.forEach((entry) => {
        const revenue = entry.orderValue || entry.revenue || entry.value || 0
        if (revenue > 0 && entry.date) {
          dailyRevenue[entry.date] = (dailyRevenue[entry.date] || 0) + revenue
        }
      })

      const sortedDates = Object.keys(dailyRevenue).sort()
      const revenueData = sortedDates.map((date) => dailyRevenue[date])

      if (sortedDates.length === 0) {
        return
      }

      // Create chart
      chartRef.current = new Chart.default(ctx, {
        type: "line",
        data: {
          labels: sortedDates,
          datasets: [
            {
              label: "Revenue",
              data: revenueData,
              borderColor: "#15803d",
              backgroundColor: "rgba(21, 128, 61, 0.1)",
              borderWidth: 3,
              fill: true,
              tension: 0.4,
              pointBackgroundColor: "#15803d",
              pointBorderColor: "#ffffff",
              pointBorderWidth: 2,
              pointRadius: 5,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  return `Revenue: $${context.parsed.y.toLocaleString()}`
                },
              },
            },
          },
          scales: {
            x: {
              title: {
                display: true,
                text: "Date",
              },
              grid: {
                display: false,
              },
            },
            y: {
              title: {
                display: true,
                text: "Revenue ($)",
              },
              beginAtZero: true,
              ticks: {
                callback: (value) => `$${Number(value).toLocaleString()}`,
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

  const hasData = entries.some((entry) => {
    const revenue = entry.orderValue || entry.revenue || entry.value || 0
    return revenue > 0 && entry.date
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Revenue Over Time
        </CardTitle>
        <CardDescription>Daily revenue trend analysis</CardDescription>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <div className="h-[400px]">
            <canvas ref={canvasRef} />
          </div>
        ) : (
          <div className="h-[400px] flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No revenue data available</p>
              <p className="text-sm">Add some entries with revenue to see the trend</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
