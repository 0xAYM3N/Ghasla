import fs from "fs"
import path from "path"
import jwt from "jsonwebtoken"

const SECRET_KEY = process.env.SECRET_KEY
const DB_PATH = path.join(process.cwd(), "db.json")

export default function handler(req, res) {
  if (req.method === "POST") {
    const authHeader = req.headers.authorization
    if (!authHeader) {
      return res.status(401).json({ message: "لا يوجد توكن" })
    }

    const token = authHeader.split(" ")[1]

    try {
      const decoded = jwt.verify(token, SECRET_KEY)

      let db = { users: [], bookings: [] }
      if (fs.existsSync(DB_PATH)) {
        db = JSON.parse(fs.readFileSync(DB_PATH, "utf8"))
      }

      const { type, location, price, datetime, status, createdAt, notify } = req.body

      const newBooking = {
        id: Date.now(),
        userId: decoded.id || null,
        email: decoded.email,
        type,
        location,
        price,
        datetime,
        status,
        createdAt,
        notify
      }

      db.bookings.push(newBooking)
      fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2))

      return res.status(201).json({ booking: newBooking })
    } catch (err) {
      return res.status(403).json({ message: "التوكن غير صالح" })
    }
  } else if (req.method === "GET") {
    const authHeader = req.headers.authorization
    if (!authHeader) {
      return res.status(401).json({ message: "لا يوجد توكن" })
    }

    const token = authHeader.split(" ")[1]
    try {
      const decoded = jwt.verify(token, SECRET_KEY)

      let db = { users: [], bookings: [] }
      if (fs.existsSync(DB_PATH)) {
        db = JSON.parse(fs.readFileSync(DB_PATH, "utf8"))
      }

      const userBookings = db.bookings.filter(b => b.email === decoded.email)
      return res.status(200).json({ bookings: userBookings })
    } catch (err) {
      return res.status(403).json({ message: "التوكن غير صالح" })
    }
  } else {
    return res.status(405).json({ message: "Method Not Allowed" })
  }
}
