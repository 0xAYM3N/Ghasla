import cookie from 'cookie'

export default function handler(req, res) {
  res.setHeader(
    'Set-Cookie',
    cookie.serialize('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      expires: new Date(0)
    })
  )

  res.status(200).json({ message: 'Logged out' })
}
