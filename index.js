const express = require("express")
require("dotenv").config()
const cors = require("cors")
const productRouter = require("./router/product.routes")
const authRouter = require("./router/auth.routes")
const pageRouter = require("./router/page.routes") // EJS sahifalar

const app = express()
const PORT = process.env.PORT || 3000
app.use(cors())
app.use(express.json())
app.use(productRouter)
app.use(authRouter)

app.set("view engine", "ejs") // views/ papkasidagi .ejs fayllar
app.use(pageRouter)

app.listen(PORT, () => {
  console.log("Server is running at: " + PORT)
})
