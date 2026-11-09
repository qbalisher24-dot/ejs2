require("dotenv").config({ quiet: true })
const express = require("express")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const cookieParser = require("cookie-parser")
const nodemailer = require("nodemailer")
const fs = require("fs")
const path = require("path")

const app = express()
app.set("view engine", "ejs")
app.use(express.urlencoded({ extended: true })) // formadagi ma'lumot -> req.body
app.use(cookieParser())                          // cookie -> req.cookies

// ===== data/ papkasidagi JSON fayllarni o'qish va yozish =====
const read = (name) => JSON.parse(fs.readFileSync(path.join(__dirname, "data", name), "utf8"))
const write = (name, data) => fs.writeFileSync(path.join(__dirname, "data", name), JSON.stringify(data, null, 2))

// ===== Email yuborish =====
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.MAIL_USER, pass: process.env.APP_KEY }
})

async function sendOtp(email, code) {
  console.log("OTP", email, "->", code) // email kelmasa, kodni terminaldan ko'ring
  try {
    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: email,
      subject: "Tasdiqlash kodi",
      html: `<h2>Kodingiz: ${code}</h2>`
    })
  } catch (err) {
    console.log("Email yuborilmadi:", err.message)
  }
}

// ===== Har so'rovda: cookie'dagi tokendan foydalanuvchini aniqlash =====
app.use((req, res, next) => {
  try {
    res.locals.user = jwt.verify(req.cookies.token, process.env.SECRET_KEY)
  } catch {
    res.locals.user = null // token yo'q yoki eskirgan
  }
  next() // res.locals.user hamma .ejs sahifada "user" bo'lib ko'rinadi
})

// ===== Bosh sahifa =====
app.get("/", (req, res) => {
  res.render("home", { products: read("products.json") })
})

// ===== Register =====
app.get("/register", (req, res) => {
  res.render("register", { error: "" })
})

app.post("/register", async (req, res) => {
  const { email, password } = req.body
  const users = read("users.json")
  if (users.find(u => u.email === email)) {
    return res.render("register", { error: "Bu email band" })
  }

  const otp = String(Math.floor(100000 + Math.random() * 900000)) // 6 xonali kod
  users.push({
    email,
    password: await bcrypt.hash(password, 10),
    role: "user",
    verified: false,
    otp,
    otpTime: Date.now() + 2 * 60 * 1000 // 2 daqiqa amal qiladi
  })
  write("users.json", users)

  await sendOtp(email, otp)
  res.redirect("/verify?email=" + encodeURIComponent(email))
})

// ===== Email tasdiqlash (OTP) =====
app.get("/verify", (req, res) => {
  res.render("verify", { email: req.query.email, error: "" })
})

app.post("/verify", (req, res) => {
  const { email, otp } = req.body
  const users = read("users.json")
  const user = users.find(u => u.email === email)

  if (!user || user.otp !== otp) {
    return res.render("verify", { email, error: "Kod noto'g'ri" })
  }
  if (Date.now() > user.otpTime) {
    return res.render("verify", { email, error: "Kod eskirgan, qaytadan ro'yxatdan o'ting" })
  }

  user.verified = true
  user.otp = null
  write("users.json", users)
  res.redirect("/login")
})

// ===== Login =====
app.get("/login", (req, res) => {
  res.render("login", { error: "" })
})

app.post("/login", async (req, res) => {
  const { email, password } = req.body
  const user = read("users.json").find(u => u.email === email)

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.render("login", { error: "Email yoki parol xato" })
  }
  if (!user.verified) {
    return res.render("login", { error: "Avval emailni tasdiqlang" })
  }

  const token = jwt.sign({ email: user.email, role: user.role }, process.env.SECRET_KEY, { expiresIn: "1d" })
  res.cookie("token", token, { httpOnly: true }) // token brauzer cookie'siga saqlanadi
  res.redirect("/")
})

app.get("/logout", (req, res) => {
  res.clearCookie("token")
  res.redirect("/")
})

// ===== Mahsulot qo'shish (faqat admin) =====
app.post("/add-product", (req, res) => {
  if (res.locals.user?.role !== "admin") {
    return res.status(403).send("Faqat admin qo'sha oladi")
  }
  const products = read("products.json")
  products.push({ title: req.body.title, price: Number(req.body.price) })
  write("products.json", products)
  res.redirect("/")
})

app.listen(3000, () => console.log("http://localhost:3000"))
