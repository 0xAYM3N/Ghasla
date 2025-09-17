import jwt from 'jsonwebtoken'
import cookie from 'cookie'

export default async function handler(req, res) {
  const cookies = cookie.parse(req.headers.cookie || '')
  const token = cookies.token

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    res.status(200).json({ user: decoded })
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' })
  }
}
