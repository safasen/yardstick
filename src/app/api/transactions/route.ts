import { connectDB } from "@/lib/mongo"
import { Transaction } from "@/lib/models/Transaction"
import { NextResponse } from "next/server"
import { Types } from "mongoose"

interface RawTransactionFromDB {
  _id: Types.ObjectId | string
  amount: number
  date: string
  description: string
  type: "income" | "expense"
  category?: string
  __v?: number
}

export async function POST(req: Request) {
  await connectDB()
  const body = await req.json()
  const transaction = await Transaction.create(body)
  return NextResponse.json({
    ...transaction.toObject(),
    id: transaction._id.toString(),
  _id: undefined,
  __v: undefined,
  })
}

export async function GET() {
  await connectDB()
  const transactions = await Transaction.find().lean().sort({ date: -1 }) as RawTransactionFromDB[]
  const normalized = transactions.map((t) => ({
    ...t,
    id: (typeof t._id === "string" ? t._id : t._id.toString()),   
    _id: undefined,         
    __v: undefined,         
  }))
  return NextResponse.json(normalized)
}
