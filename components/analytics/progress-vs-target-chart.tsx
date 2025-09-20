"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3 } from "lucide-react"
import type { DataEntry, Target } from "@/lib/firestore"

interface ProgressVsTargetChartProps {
  entries: DataEntry[]
  targets: Target[]
}

export function ProgressVsTargetChart({ entries, targets }: ProgressVsTargetChartProps) {
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

      if (targets.length === 0) {
        return
      }

      // Calculate progress for each target
      const chartData = targets.map((target) => {
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

        return {
          label: `${target.product} (${target.channel})`,
          target: target.amount,
          progress,
          percentage: target.amount > 0 ? (progress / target.amount) * 100 : 0,
        }
      })

      const labels = chartData.map((item) => item.label)
      const targetData = chartData.map((item) => item.target)
      const progressData = chartData.map((item) => item.progress)

      // Create chart
      chartRef.current = new Chart.default(ctx, {
        type: "bar",
        data: {
          labels,
          datasets: [
            {
              label: "Target",
              data: targetData,
              backgroundColor: "rgba(156, 163, 175, 0.5)",
              borderColor: "#9ca3af",
              borderWidth: 1,
            },
            {
              label: "Progress",
              data: progressData,
              backgroundColor: "rgba(21, 128, 61, 0.8)",
              borderColor: "#15803d",
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "top",
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const value = context.parsed.y
                  const dataIndex = context.dataIndex
                  const percentage = chartData[dataIndex]?.percentage || 0
                  return `${context.dataset.label}: $${value.toLocaleString()} ${
                    context.dataset.label === "Progress" ? `(${percentage.toFixed(1)}%)` : ""
                  }`
                },
              },
            },
          },
          scales: {
            x: {
              title: {
                display: true,
                text: "Product (Channel)",
              },
            },
            y: {
              title: {
                display: true,
                text: "Amount ($)",
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
  }, [entries, targets])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Progress vs Target
        </CardTitle>
        <CardDescription>Compare actual progress against set targets for each product</CardDescription>
      </CardHeader>
      <CardContent>
        {targets.length > 0 ? (
          <div className="h-[400px]">
            <canvas ref={canvasRef} />
          </div>
        ) : (
          <div className="h-[400px] flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No targets set</p>
              <p className="text-sm">Set some targets to see progress comparison</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
