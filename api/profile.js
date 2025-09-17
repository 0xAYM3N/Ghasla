import { createClient } from '@supabase/supabase-js'
import jwt from 'jsonwebtoken'
import cookie from 'cookie'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const cookies = cookie.parse(req.headers.cookie || '')
  const token = cookies.token

  if (!token) return res.status(401).json({ error: 'Unauthorized' })

  let decoded
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET)
  } catch {
    return res.status(401).json({ error: 'Invalid token' })
  }

  const { data, error } = await supabase
    .from('users')
    .select('id, role, balance')
    .eq('id', decoded.id)
    .single()

  if (error) return res.status(500).json({ error: error.message })

  return res.status(200).json({ user: { ...data, email: decoded.email } })
}
