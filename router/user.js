const express = require("express");
const router = express.Router();
const checkAuth  = require("../middleware/check-auth");

//User Controllers
const UserControllers = require("../controller/user.controller");

router.post("/signup", UserControllers.user_signup)  //user creation or signup
router.post("/login", UserControllers.user_login); //login


module.exports = router;