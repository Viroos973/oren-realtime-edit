const express = require("express");
const router = express.Router();
const checkAuth  = require("../middleware/check-auth");

//User Controllers
const UserControllers = require("../controller/user.controller");

router.post("/signup", UserControllers.user_signup)
router.post("/login", UserControllers.user_login)
router.post("/logout", checkAuth, UserControllers.user_logout)
router.get("/profile", checkAuth, UserControllers.get_profile)
router.delete("/deleteUser", checkAuth, UserControllers.user_delete)


module.exports = router;