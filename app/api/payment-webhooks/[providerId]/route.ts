import { NextRequest, NextResponse } from "next/server";
import { keystoneContext } from "@/features/keystone/context";
import handlePaymentProviderWebhook from "@/features/keystone/mutations/handlePaymentProviderWebhook";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ providerId: string }> }
) {
  const { providerId } = await params;
  const declaredLength = Number(request.headers.get("content-length") || 0);
  if (declaredLength > 1_000_000) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }
  const rawBody = await request.text();
  if (Buffer.byteLength(rawBody, "utf8") > 1_000_000) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }
  let event: unknown;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  try {
    const headers = Object.fromEntries(request.headers.entries());
    const result = await handlePaymentProviderWebhook(
      null,
      {
        providerId,
        event,
        headers: { ...headers, __rawBody: rawBody },
      },
      keystoneContext
    );
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Webhook rejected" },
      { status: 400 }
    );
  }
}
