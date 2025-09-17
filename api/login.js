import { createClient } from '@supabase/supabase-js'
import jwt from 'jsonwebtoken'
import cookie from 'cookie'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  let body = {}
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
  } catch (e) {
    return res.status(400).json({ error: 'Invalid request body' })
  }

  const { email, password } = body

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' })
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error || !data?.user) {
    return res.status(400).json({ error: 'Invalid credentials' })
  }

  const token = jwt.sign(
    { userId: data.user.id },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )

  res.setHeader('Set-Cookie', cookie.serialize('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/'
  }))

  return res.status(200).json({ message: 'Logged in' })
}
