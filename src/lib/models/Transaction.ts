import { Schema, model, models } from "mongoose"

const TransactionSchema = new Schema({
  amount: Number,
  date: String,
  description: String,
  type: { type: String, enum: ["income", "expense"] },
  category: String,
})

export const Transaction = models.Transaction || model("Transaction", TransactionSchema)
