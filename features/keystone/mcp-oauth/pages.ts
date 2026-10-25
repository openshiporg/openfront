/**
 * Server-rendered OAuth screens in the dashboard's look (the shadcn zinc tokens,
 * 0.625rem radius, light and dark). Their CSP allows inline styles and one
 * nonce'd script, so they depend on nothing else in the app.
 * Plain module: no @/ imports.
 */
import { escapeHtml as e } from './core'
import type { Connection } from './service'

const STYLE = `
:root{color-scheme:light dark;--background:oklch(1 0 0);--foreground:oklch(.141 .005 285.823);--card:oklch(1 0 0);--muted:oklch(.967 .001 286.375);--muted-foreground:oklch(.552 .016 285.938);--primary:oklch(.21 .006 285.885);--primary-foreground:oklch(.985 0 0);--secondary:oklch(.967 .001 286.375);--border:oklch(.92 .004 286.32);--input:oklch(.92 .004 286.32);--ring:oklch(.705 .015 286.067);--destructive:oklch(.577 .245 27.325);--radius:.625rem}
@media (prefers-color-scheme:dark){:root{--background:oklch(.141 .005 285.823);--foreground:oklch(.985 0 0);--card:oklch(.21 .006 285.885);--muted:oklch(.274 .006 286.033);--muted-foreground:oklch(.705 .015 286.067);--primary:oklch(.92 .004 286.32);--primary-foreground:oklch(.21 .006 285.885);--secondary:oklch(.274 .006 286.033);--border:oklch(1 0 0/10%);--input:oklch(1 0 0/15%);--ring:oklch(.552 .016 285.938);--destructive:oklch(.704 .191 22.216)}}
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%}
body{margin:0;min-height:100svh;display:flex;align-items:center;justify-content:center;padding:24px 16px;background:var(--background);color:var(--foreground);font:14px/1.5 "Geist",ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;-webkit-font-smoothing:antialiased}
main{width:100%;max-width:400px}
.brand{display:flex;align-items:center;gap:10px;margin-bottom:24px;color:var(--muted-foreground);font-size:13px;font-weight:500}
.pair{display:flex;align-items:center;gap:8px}.tile{display:grid;place-items:center;width:36px;height:36px;border:1px solid var(--border);border-radius:calc(var(--radius) - 2px);background:var(--card);color:var(--foreground);font-weight:600;font-size:15px}.dots{display:flex;gap:3px}.dots i{width:3px;height:3px;border-radius:50%;background:var(--muted-foreground);opacity:.6}
h1{margin:0;font-size:18px;line-height:1.4;font-weight:600;overflow-wrap:anywhere}
.sub{margin:6px 0 0;color:var(--muted-foreground);font-size:14px;overflow-wrap:anywhere}
.card{margin-top:20px;border:1px solid var(--border);border-radius:var(--radius);background:var(--card);overflow:hidden}
.section{padding:14px 16px}.section+.section{border-top:1px solid var(--border)}
.label{margin:0 0 6px;color:var(--muted-foreground);font-size:12px;font-weight:500;text-transform:uppercase;letter-spacing:.04em}
.who{display:flex;align-items:center;justify-content:space-between;gap:12px}.who strong{display:block;font-weight:500;overflow-wrap:anywhere}.who span{color:var(--muted-foreground);font-size:13px;overflow-wrap:anywhere}
.badge{display:inline-flex;align-items:center;height:20px;padding:0 8px;border:1px solid var(--border);border-radius:999px;font-size:12px;font-weight:500;white-space:nowrap}
ul{margin:0;padding:0;list-style:none}li.can{display:flex;gap:8px;padding:3px 0}li.can::before{content:"";flex:none;width:6px;height:6px;margin-top:8px;border-radius:50%;background:var(--foreground);opacity:.55}
.check{display:flex;gap:10px;align-items:flex-start;cursor:pointer}.check input{margin:3px 0 0;width:16px;height:16px;accent-color:var(--primary)}.check small{display:block;color:var(--muted-foreground);font-size:13px}
.note{margin:12px 0 0;color:var(--muted-foreground);font-size:13px;overflow-wrap:anywhere}
form{margin:0}.field{margin-top:16px}.field label{display:block;margin-bottom:8px;font-weight:500;font-size:14px}
input[type=email],input[type=password],input[type=text]{display:block;width:100%;height:36px;padding:4px 12px;border:1px solid var(--input);border-radius:calc(var(--radius) - 2px);background:color-mix(in oklab,var(--muted) 40%,transparent);color:var(--foreground);font:inherit;outline:none}
input:focus-visible{border-color:var(--ring);box-shadow:0 0 0 3px color-mix(in oklab,var(--ring) 50%,transparent)}
.actions{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:20px}.actions.one{grid-template-columns:1fr}
button{display:inline-flex;align-items:center;justify-content:center;gap:8px;width:100%;height:36px;padding:0 16px;border:1px solid transparent;border-radius:calc(var(--radius) - 2px);font:inherit;font-weight:500;cursor:pointer}
button:focus-visible{outline:none;box-shadow:0 0 0 3px color-mix(in oklab,var(--ring) 50%,transparent)}button:disabled{opacity:.6;cursor:wait}
.primary{background:var(--primary);color:var(--primary-foreground)}.primary:hover{background:color-mix(in oklab,var(--primary) 90%,transparent)}
.outline{background:var(--background);border-color:var(--border);color:var(--foreground)}.outline:hover{background:var(--secondary)}
.danger{width:auto;height:32px;padding:0 12px;background:var(--background);border-color:var(--border);color:var(--destructive);font-size:13px}
.error{margin-top:16px;padding:12px 14px;border:1px solid color-mix(in oklab,var(--destructive) 50%,transparent);border-radius:calc(var(--radius) - 4px);background:color-mix(in oklab,var(--destructive) 5%,transparent);color:var(--destructive);font-size:13px}
.ok{margin-top:16px;padding:12px 14px;border:1px solid var(--border);border-radius:calc(var(--radius) - 4px);background:var(--muted);font-size:13px}
.links{margin-top:20px;color:var(--muted-foreground);font-size:13px}a{color:var(--foreground);font-weight:500;text-underline-offset:3px}
.row{display:flex;align-items:center;justify-content:space-between;gap:12px}.row strong{display:block;font-weight:500;overflow-wrap:anywhere}.row span{display:block;color:var(--muted-foreground);font-size:13px;overflow-wrap:anywhere}
.empty{color:var(--muted-foreground)}
.spinner{width:14px;height:14px;border:2px solid currentColor;border-right-color:transparent;border-radius:50%;animation:spin .7s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}@media (prefers-reduced-motion:reduce){.spinner{animation:none}}
`

function initial(value: string): string {
  return e((value.trim()[0] || 'A').toUpperCase())
}

function brand(clientName: string | null, siteName: string): string {
  if (!clientName) return `<div class="brand"><span class="tile">${initial(siteName)}</span>${e(siteName)}</div>`
  return `<div class="brand"><span class="pair" aria-hidden="true"><span class="tile">${initial(clientName)}</span><span class="dots"><i></i><i></i><i></i></span><span class="tile">${initial(siteName)}</span></span></div>`
}

/** Disable a form's buttons while it submits, like the dashboard's pending buttons. */
function pendingScript(nonce: string): string {
  return `<script nonce="${e(nonce)}">document.querySelectorAll('form').forEach(function(f){f.addEventListener('submit',function(ev){var b=ev.submitter||f.querySelector('button[type=submit]');setTimeout(function(){f.querySelectorAll('button').forEach(function(x){x.disabled=true});if(b){b.innerHTML='<span class="spinner" aria-hidden="true"></span>'}},0)})})</script>`
}

function page(title: string, body: string, nonce: string): string {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${e(title)}</title><style>${STYLE}</style></head><body><main>${body}</main>${pendingScript(nonce)}</body></html>`
}

export function renderMessage({ title, message, siteName, nonce }: { title: string; message: string; siteName: string; nonce: string }): string {
  return page(title, `${brand(null, siteName)}<h1>${e(title)}</h1><p class="sub">${e(message)}</p>`, nonce)
}

export type SignInView = {
  siteName: string
  clientName: string | null
  callbackHost: string | null
  mode: 'signin' | 'signup'
  allowSignUp: boolean
  error?: string | null
  email?: string
  name?: string
  signInHref: string
  signUpHref: string
  nonce: string
}

export function renderSignIn(view: SignInView): string {
  const signup = view.mode === 'signup' && view.allowSignUp
  const heading = view.clientName
    ? `${signup ? 'Create an account' : 'Sign in'} to connect ${view.clientName}`
    : signup ? `Create your ${view.siteName} account` : `Sign in to ${view.siteName}`
  const sub = view.clientName
    ? `${view.clientName} wants to use your ${view.siteName} account. It will only be able to do what you can do.`
    : 'See and disconnect the apps that can use your account.'
  const nameField = signup
    ? `<div class="field"><label for="name">Name</label><input type="text" id="name" name="name" autocomplete="name" required maxlength="120" value="${e(view.name ?? '')}"></div>`
    : ''
  const switcher = view.allowSignUp
    ? signup
      ? `Already have an account? <a href="${e(view.signInHref)}">Sign in</a>`
      : `Don't have an account? <a href="${e(view.signUpHref)}">Create one</a>`
    : ''
  const body = `${brand(view.clientName, view.siteName)}
<h1>${e(heading)}</h1><p class="sub">${e(sub)}</p>
<form method="post">
<input type="hidden" name="intent" value="${signup ? 'signup' : 'signin'}">
${nameField}
<div class="field"><label for="email">Email</label><input type="email" id="email" name="email" autocomplete="email" placeholder="you@example.com" required maxlength="320" value="${e(view.email ?? '')}"></div>
<div class="field"><label for="password">Password</label><input type="password" id="password" name="password" autocomplete="${signup ? 'new-password' : 'current-password'}" placeholder="••••••••" required maxlength="1024"></div>
${view.error ? `<div class="error" role="alert">${e(view.error)}</div>` : ''}
<div class="actions one"><button type="submit" class="primary">${signup ? 'Create account' : 'Sign in'}</button></div>
</form>
${view.callbackHost ? `<p class="note">After you approve, you'll return to ${e(view.callbackHost)}.</p>` : ''}
${switcher ? `<p class="links">${switcher}</p>` : ''}`
  return page(heading, body, view.nonce)
}

export type ConsentView = {
  siteName: string
  clientName: string
  callbackHost: string
  userName: string
  userEmail: string
  accountLabel: string
  capabilities: string[]
  offerWrite: boolean
  ticket: string
  switchAccountHref: string
  nonce: string
}

export function renderConsent(view: ConsentView): string {
  const title = `Connect ${view.clientName} to ${view.siteName}`
  const lines = view.capabilities.map(line => `<li class="can">${e(line)}</li>`).join('')
  const write = view.offerWrite
    ? `<div class="section"><label class="check"><input type="checkbox" name="allow_write" value="1" checked form="approve"><span>Allow changes<small>Untick to let ${e(view.clientName)} only look, never change anything.</small></span></label></div>`
    : ''
  const body = `${brand(view.clientName, view.siteName)}
<h1>${e(title)}</h1>
<p class="sub">${e(view.clientName)} will act as you. It can only do what your account can already do, and you can disconnect it at any time.</p>
<div class="card">
<div class="section"><p class="label">Signed in as</p><div class="who"><div><strong>${e(view.userName || view.userEmail)}</strong><span>${e(view.userEmail)}</span></div><span class="badge">${e(view.accountLabel)}</span></div></div>
<div class="section"><p class="label">It will be able to</p><ul>${lines}</ul></div>
${write}
</div>
<p class="note">You'll return to <strong>${e(view.callbackHost)}</strong>. Only approve a connection you started.</p>
<div class="actions">
<form method="post"><input type="hidden" name="intent" value="deny"><input type="hidden" name="ticket" value="${e(view.ticket)}"><button type="submit" class="outline">Deny</button></form>
<form method="post" id="approve"><input type="hidden" name="intent" value="approve"><input type="hidden" name="ticket" value="${e(view.ticket)}"><button type="submit" class="primary">Allow</button></form>
</div>
<p class="links">Not you? <a href="${e(view.switchAccountHref)}">Use a different account</a></p>`
  return page(title, body, view.nonce)
}

export type ConnectionsView = {
  siteName: string
  userName: string
  userEmail: string
  connections: Connection[]
  notice?: string | null
  nonce: string
}

export function renderConnections(view: ConnectionsView): string {
  const rows = view.connections.length
    ? view.connections
        .map(connection => {
          const access = connection.scopes.includes('mcp:write') ? 'Can make changes' : 'Read only'
          const since = connection.connectedAt ? ` · since ${connection.connectedAt.slice(0, 10)}` : ''
          return `<div class="section row"><div><strong>${e(connection.name)}</strong><span>${e(connection.callbackHost || 'Unknown callback')} · ${access}${since}</span></div><form method="post"><input type="hidden" name="intent" value="revoke"><input type="hidden" name="client_id" value="${e(connection.clientId)}"><button type="submit" class="danger">Disconnect</button></form></div>`
        })
        .join('')
    : `<div class="section empty">No apps are connected to your account.</div>`
  const body = `${brand(null, view.siteName)}
<h1>Connected apps</h1>
<p class="sub">Apps like ChatGPT and Claude that can act as ${e(view.userName || view.userEmail)} (${e(view.userEmail)}). Disconnecting stops them at once.</p>
${view.notice ? `<div class="ok" role="status">${e(view.notice)}</div>` : ''}
<div class="card">${rows}</div>
<form method="post" class="links"><input type="hidden" name="intent" value="signout"><button type="submit" class="outline">Sign out</button></form>`
  return page('Connected apps', body, view.nonce)
}
