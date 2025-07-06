import { connectDB } from "@/lib/mongo"
import { Transaction } from "@/lib/models/Transaction"
import { NextResponse } from "next/server"

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
  const transactions = await Transaction.find().lean().sort({ date: -1 })
  const normalized = transactions.map((t:any) => ({
    ...t,
    id: t._id.toString(),   
    _id: undefined,         
    __v: undefined,         
  }))
  return NextResponse.json(normalized)
}
