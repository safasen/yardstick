"use client"

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

import type { Transaction } from "@/app/page"


export function CategoricalExpensesChart({data}:{data: Transaction[]}) {
    const expenseData = data.filter((t) => t.type === "expense")
// 2. Aggregate by category
    const categoryTotals = expenseData.reduce((acc, curr) => {
    const category = curr.category || "Others"
    const amount = Math.abs(curr.amount)
    acc[category] = (acc[category] || 0) + amount
    return acc
    }, {} as Record<string, number>)

    // 3. Convert to Recharts-compatible format
    const chartData = Object.entries(categoryTotals).map(([category, value]) => ({
    name: category,
    value,
    }))

    // 4. Color palette
    const COLORS = ["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"]
  return (
    <Card>
      <CardHeader>
        <CardTitle>Expenses by Category</CardTitle>
        <CardDescription>Visual breakdown of spending categories</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {chartData.map((entry, index) => (
                  <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}