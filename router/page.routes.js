const { Router } = require("express")
const { read_file } = require("../fs/api")

const pageRouter = Router()

// Faqat GET — sahifani qaytaradi. POST so'rovlar sizning API'ingizga ketadi.
pageRouter.get("/", (req, res) => {
  res.render("home", { products: read_file("product.json") })
})
pageRouter.get("/register", (req, res) => res.render("register"))
pageRouter.get("/login", (req, res) => res.render("login"))
pageRouter.get("/verify", (req, res) => res.render("verify", { email: req.query.email || "" }))

module.exports = pageRouter
