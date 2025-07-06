"use client"
import { MonthlyExpensesChart } from "@/components/barChart";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DollarSign, Edit, Plus, Receipt, Trash2, TrendingUp } from "lucide-react";
import { TransactionForm } from "@/components/transcation-form";

import { Button } from "@/components/ui/button";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { CategoricalExpensesChart } from "@/components/pieChart";

export interface Transaction {
  id: string
  amount: number
  date: string
  description: string
  type: "income" | "expense"
  category?: string
}

const CATEGORIES = [
  "Groceries",
  "Gas",
  "Utilities",
  "Entertainment",
  "Dining Out",
  "Shopping",
  "Transportation",
  "Healthcare",
  "Education",
  "Other",
]
export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)

  useEffect(() => {
    async function fetchTransactions() {
      try {
        const res = await fetch("/api/transactions")
        const data = await res.json()
        setTransactions(data)
      } catch (err) {
        console.error("Failed to load transactions", err)
      } finally {
        setLoading(false)
      }
    }
  
    fetchTransactions()
  }, [])

  const addTransaction = async (transaction: Omit<Transaction, "id">) => {
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transaction),
      })
  
      if (!res.ok) throw new Error("Failed to add transaction")
  
      const savedTransaction: Transaction = await res.json()
  
      
      setTransactions((prev) => [...prev, savedTransaction])
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Add failed:", error)
    }
  }

  const updateTransaction = async (id: string, transaction: Omit<Transaction, "id">) => {
    try {
      const res = await fetch(`/api/transactions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transaction),
      })
  
      if (!res.ok) throw new Error("Failed to update transaction")
  
      const updated = await res.json()
  
      setTransactions((prev) =>
        prev.map((t) => (t.id === id ? updated : t))
      )
      setEditingTransaction(null)
      setIsDialogOpen(false)
    } catch (err) {
      console.error("Update failed:", err)
    }
  }

  const deleteTransaction = async (id: string) => {
    try {
      const res = await fetch(`/api/transactions/${id}`, {
        method: "DELETE",
      })
  
      if (!res.ok) throw new Error("Failed to delete transaction")
  
      setTransactions((prev) => prev.filter((t) => t.id !== id))
    } catch (err) {
      console.error("Delete failed:", err)
    }
  }

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingTransaction(null)
  }

  const totalIncome = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + Math.abs(t.amount), 0)

  const balance = totalIncome - totalExpenses

  const categoryBreakdown = useMemo(() => {
    const expenseTransactions = transactions.filter((t) => t.type === "expense")
    const categoryTotals = expenseTransactions.reduce(
      (acc, transaction) => {
        const category = transaction.category || "Others"
        acc[category] = (acc[category] || 0) + Math.abs(transaction.amount)
        return acc
      },
      {} as Record<string, number>,
    )

    return Object.entries(categoryTotals)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3) // Top 3 categories
  }, [transactions])
  return (
    <div className="min-h-screen w-full">
      <div className="flex-1 flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-6">
          <h1 className="font-semibold">Dashboard</h1>
          <div className="ml-auto">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingTransaction(null)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Transaction
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingTransaction ? "Edit Transaction" : "Add New Transaction"}</DialogTitle>
                  <DialogDescription>
                    {editingTransaction
                      ? "Update the transaction details below."
                      : "Enter the details for your new transaction."}
                  </DialogDescription>
                </DialogHeader>
                <TransactionForm
                  transaction={editingTransaction}
                  onSubmit={
                    editingTransaction ? (data) => updateTransaction(editingTransaction.id, data) : addTransaction
                  }
                  onCancel={handleCloseDialog}
                  categories={CATEGORIES}
                />
              </DialogContent>
            </Dialog>
          </div>
        </header>
      </div>
      <main className="flex-1 p-6 space-y-6">
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">${totalIncome.toFixed(2)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground rotate-180" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">${totalExpenses.toFixed(2)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Balance</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${balance >= 0 ? "text-green-600" : "text-red-600"}`}>
                  ${balance.toFixed(2)}
                </div>
              </CardContent>
            </Card>
            {categoryBreakdown.length > 0 && categoryBreakdown.slice(0, 3).map((item, index) => (
              <Card key={item.category}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {item.category}
                  </CardTitle>
                  <Receipt className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">${item.amount.toFixed(2)}</div>
                </CardContent>
              </Card>
            ))}
          </div>
            <MonthlyExpensesChart data={transactions} />
            <CategoricalExpensesChart data={transactions} />
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Your latest financial transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>{format(parseISO(transaction.date), "MMM dd, yyyy")}</TableCell>
                        <TableCell className="font-medium">{transaction.description.length <= 7 ? transaction.description: (transaction.description.slice(0,8) + "..")}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{transaction.category || "Others"}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={transaction.type === "income" ? "default" : "secondary"}>
                            {transaction.type}
                          </Badge>
                        </TableCell>
                        <TableCell
                          className={`text-right font-medium ${
                            transaction.type === "income" ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {transaction.type === "income" ? "+" : "-"}${Math.abs(transaction.amount).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(transaction)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => deleteTransaction(transaction.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
      </main>

    </div>
  );
}
