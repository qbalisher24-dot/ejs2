const fs = require("node:fs")
const path = require("node:path")

function read_file(name) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, "../data", name), "utf8"))
}

function write_file(name, data) {
  const file = path.join(__dirname, "../data", name)
  fs.writeFileSync(file + ".tmp", JSON.stringify(data, null, 2))
  fs.renameSync(file + ".tmp", file)
}

module.exports = { read_file, write_file }
