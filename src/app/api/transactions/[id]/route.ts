import { connectDB } from "@/lib/mongo"
import { Transaction } from "@/lib/models/Transaction"
import { NextRequest, NextResponse } from "next/server"

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await connectDB()

  const deleted = await Transaction.findByIdAndDelete(params.id)

  if (!deleted) {
    return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
  }

  return NextResponse.json({ message: "Transaction deleted" })
}

export async function PATCH(req: Request,
    context: { params: { id: string } }) {
  const { id } = context.params
  await connectDB()
  const body = await req.json()
  const updated = await Transaction.findByIdAndUpdate(id, body, { new: true })
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json({
    ...updated.toObject(),
    id: updated._id.toString(),
  _id: undefined,
  __v: undefined,
  })
}