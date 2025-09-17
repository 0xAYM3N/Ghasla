import jwt from 'jsonwebtoken'
import cookie from 'cookie'
import { createClient } from '@supabase/supabase-js'

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

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' })
  }

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ error: 'Server misconfigured: JWT_SECRET missing' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    const { data, error } = await supabase
      .from('users')
      .select('id, role, balance, auth_users!inner(email)')
      .eq('id', decoded.id)
      .single()

    if (error || !data) {
      return res.status(404).json({ error: 'User not found' })
    }

    console.log('Fetched user profile:', data)

    return res.status(200).json({ user: data })
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}

