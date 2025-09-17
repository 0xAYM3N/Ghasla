import jwt from 'jsonwebtoken'
import cookie from 'cookie'

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
    return res.status(200).json({ user: decoded })
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}
