import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

  // Verify caller is admin via their JWT
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const userClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: authHeader } },
  })

  const token = authHeader.replace('Bearer ', '')
  const { data: claims, error: claimsErr } = await userClient.auth.getClaims(token)
  if (claimsErr || !claims?.claims?.sub) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const adminClient = createClient(supabaseUrl, supabaseServiceKey)

  // Check admin role
  const { data: isAdmin } = await adminClient.rpc('has_role', {
    _user_id: claims.claims.sub,
    _role: 'admin',
  })

  if (!isAdmin) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), {
      status: 403,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // Get user_ids from request
  const { user_ids } = await req.json()
  if (!Array.isArray(user_ids) || user_ids.length === 0) {
    return new Response(JSON.stringify({ error: 'user_ids required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // Fetch emails from auth.users using admin API
  const emails: Record<string, string> = {}
  for (const uid of user_ids) {
    const { data } = await adminClient.auth.admin.getUserById(uid)
    if (data?.user?.email) {
      emails[uid] = data.user.email
    }
  }

  return new Response(JSON.stringify({ emails }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
