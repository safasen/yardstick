"use client"

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

import { parseISO, eachMonthOfInterval, startOfMonth, endOfMonth, format, subMonths} from 'date-fns'
import type { Transaction } from "@/app/page"


export function MonthlyExpensesChart({ data }: { data: Transaction[] }) {
    const monthlyData = (() => {
        const now = new Date()
        const months = eachMonthOfInterval({
            start: subMonths(now,5),
            end: now
        })
    
        return months.map((month) => {
            const start = startOfMonth(month)
            const end = endOfMonth(month)
    
            const total = data.filter((t) => {
                const date = parseISO(t.date)
                return t.type === "expense" && date >= start && date <= end
            }).reduce((sum, t) => 
                sum + Math.abs(t.amount), 0
            )
    
            return {
                month: format(month, "MMM yyyy"),
                expenses: total,
              }
        })
    })()
  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Expenses</CardTitle>
        <CardDescription>Track your spending over the last 6 months</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="4 4" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}