const { read_file, write_file } = require("../fs/api")
const { v4 } = require("uuid")

const getAllProducts = (req, res) => {
  const products = read_file("product.json")
  res.status(200).json(products)
}

const addProduct = (req, res) => {
  const { title, desc, price } = req.body
  if (!title || price === undefined) {
    return res.status(400).json({ message: "title and price are required" })
  }
  const products = read_file("product.json")
  products.push({ id: v4(), title, desc, price })
  write_file("product.json", products)
  res.status(201).json({ message: "Added new product" })
}

const getOneProduct = (req, res) => {
  const products = read_file("product.json")
  const product = products.find((p) => p.id === req.params.id)
  if (!product) return res.status(404).json({ message: "Product not found" })
  res.status(200).json(product)
}

const updateProduct = (req, res) => {
  const products = read_file("product.json")
  const product = products.find((p) => p.id === req.params.id)
  if (!product) return res.status(404).json({ message: "Product not found" })
  const { title, desc, price } = req.body
  product.title = title ?? product.title
  product.desc = desc ?? product.desc
  product.price = price ?? product.price
  write_file("product.json", products)
  res.status(200).json({ message: "Updated product" })
}

const deleteProduct = (req, res) => {
  const products = read_file("product.json")
  const index = products.findIndex((p) => p.id === req.params.id)
  if (index === -1) return res.status(404).json({ message: "Product not found" })
  products.splice(index, 1)
  write_file("product.json", products)
  res.status(200).json({ message: "Deleted product" })
}

module.exports = { getAllProducts, addProduct, getOneProduct, updateProduct, deleteProduct }
