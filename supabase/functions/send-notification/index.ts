import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  try {
    const body = await req.json()
    const { type, table, record, old_record } = body

    if (table !== "properties") {
      return new Response("Ignored", { status: 200 })
    }

    let title: string
    let bodyText: string

    if (type === "INSERT") {
      title = "New Property Listed"
      bodyText = `${record.title} - ${record.type}`
    } else if (type === "UPDATE" && record.is_sold && !old_record?.is_sold) {
      title = "Property Sold Out"
      bodyText = `${record.title} has been sold`
    } else {
      return new Response("No notification needed", { status: 200 })
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")

    const tokensRes = await fetch(
      `${supabaseUrl}/rest/v1/push_tokens?select=token`,
      {
        headers: {
          apikey: serviceRoleKey!,
          Authorization: `Bearer ${serviceRoleKey!}`,
        },
      },
    )
    const tokens: { token: string }[] = await tokensRes.json()

    if (!Array.isArray(tokens) || tokens.length === 0) {
      return new Response("No tokens", { status: 200 })
    }

    const messages = tokens.map((t) => ({
      to: t.token,
      sound: "default",
      title,
      body: bodyText,
      data: {
        propertyId: record.id,
        type: type === "INSERT" ? "new_listing" : "sold",
      },
    }))

    const expoRes = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(messages),
    })

    const result = await expoRes.json()
    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    })
  }
})
