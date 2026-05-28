import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const payload = await req.json()
  const webhookUrl = process.env.WEBHOOK_URL
  if (!webhookUrl) {
    return NextResponse.json({ ok: false, error: "WEBHOOK_URL is not set" }, { status: 500 })
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }
  const secret = process.env.WEBHOOK_SECRET
  if (secret) headers["x-webhook-secret"] = secret

  const res = await fetch(webhookUrl, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  })
  return NextResponse.json({ ok: res.ok }, { status: res.ok ? 200 : 502 })
}
