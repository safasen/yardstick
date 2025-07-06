import { useForm } from 'react-hook-form'
import { zodResolver } from "@hookform/resolvers/zod"; 
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import type { Transaction } from '@/app/page';

const formSchema = z.object({
    amount: z
      .string()
      .min(1, "Amount is required")
      .refine((val) => !isNaN(Number(val)) && Number(val) !== 0, "Amount must be a valid non-zero number"),
    date: z.string().min(1, "Date is required"),
    description: z.string().min(1, "Description is required").max(100, "Description must be less than 100 characters"),
    type: z.enum(["income", "expense"], {
      required_error: "Please select a transaction type",
    }),
    category: z.string().optional()
  })
  
  type FormData = z.infer<typeof formSchema>
  
  interface TransactionFormProps {
    transaction?: Transaction | null
    onSubmit: (data: Omit<Transaction, "id">) => void
    onCancel: () => void
    categories: string[]
  }
  
  export function TransactionForm({ transaction, onSubmit, onCancel, categories }: TransactionFormProps) {
    const form = useForm<FormData>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        amount: transaction ? Math.abs(transaction.amount).toString() : "",
        date: transaction?.date || new Date().toISOString().split("T")[0],
        description: transaction?.description || "",
        type: transaction?.type || "expense",
        category: transaction?.category || "",
      },
    })
  
    const handleSubmit = (data: FormData) => {
      const amount = data.type === "expense" ? -Math.abs(Number(data.amount)) : Math.abs(Number(data.amount))
  
      onSubmit({
        amount,
        date: data.date,
        description: data.description,
        type: data.type,
        category: data?.category
      })
  
      form.reset()
    }
  
    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select transaction type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category (Optional)</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
  
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="0.00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
  
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
  
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="Enter transaction description..." className="resize-none" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
  
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">{transaction ? "Update" : "Add"} Transaction</Button>
          </div>
        </form>
      </Form>
    )
  }
  