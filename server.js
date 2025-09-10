// server.js
const jsonServer = require('json-server')
const auth = require('json-server-auth')
const cors = require('cors')

const app = jsonServer.create()
const router = jsonServer.router('db.json') // ربط ملف db.json

app.db = router.db // 👈 هذا أهم خطوة: ربط db مع app

app.use(cors())
app.use(jsonServer.defaults())
app.use(auth) // 👈 إضافة auth قبل الراوتر
app.use(router)

app.listen(3000, () => {
  console.log('🚀 JSON Server with Auth running on http://localhost:3000')
})

