import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const payload = await req.json()
  const res = await fetch(process.env.WEBHOOK_URL!, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-webhook-secret": process.env.WEBHOOK_SECRET!,
    },
    body: JSON.stringify(payload),
  })
  return NextResponse.json({ ok: res.ok }, { status: res.ok ? 200 : 502 })
}
