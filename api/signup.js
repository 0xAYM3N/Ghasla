import { createClient } from '@supabase/supabase-js'
import jwt from 'jsonwebtoken'
import cookie from 'cookie'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end()
  }

  const { email, password } = req.body

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  })

  if (error) return res.status(400).json({ error: error.message })

  const token = jwt.sign(
    { id: data.user.id, email: data.user.email, role: 'user' },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )

  res.setHeader(
    'Set-Cookie',
    cookie.serialize('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    })
  )

  res.status(200).json({ message: 'Account created' })
}
