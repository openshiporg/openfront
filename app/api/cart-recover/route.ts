import { cartIdFromProof, verifyCartProof } from "@/features/keystone/security/token-crypto"

// Resume link from the abandoned-cart email. The cart cookie is SameSite=strict, so a redirect chain that
// starts in a mail client would not send it; a tiny same-site page sets it and then navigates to the cart.
export async function GET(request: Request) {
  const url = new URL(request.url)
  const proof = url.searchParams.get("p") || ""
  const country = (url.searchParams.get("c") || "us").toLowerCase().replace(/[^a-z]/g, "").slice(0, 2) || "us"
  const cartId = cartIdFromProof(proof)
  const valid = Boolean(cartId && verifyCartProof(proof, cartId))
  const target = `/${country}/${valid ? "cart" : "store"}`
  const headers = new Headers({ "content-type": "text/html; charset=utf-8", "cache-control": "no-store", "referrer-policy": "no-referrer" })
  if (valid) {
    const secure = process.env.NODE_ENV === "production" ? "; Secure" : ""
    headers.append("set-cookie", `_openfront_cart_id=${proof}; Path=/; Max-Age=${60 * 60 * 24 * 7}; HttpOnly; SameSite=Strict${secure}`)
  }
  const body = `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="refresh" content="0;url=${target}"><title>Your cart</title><p style="font:16px system-ui;padding:24px"><a href="${target}">${valid ? "Return to your cart" : "Continue shopping"}</a></p>`
  return new Response(body, { status: 200, headers })
}
