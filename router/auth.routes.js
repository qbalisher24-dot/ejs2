const { Router } = require("express");
const { register, login, verify } = require("../controller/auth.controller");
const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/verify", verify);

module.exports = authRouter;
