const express = require("express");
const router = express.Router();
const checkAuth  = require("../middleware/check-auth");

const RoomControllers = require("../controller/room.controller")

router.post("/addUser", RoomControllers.add_user)
router.post("/addRoom", checkAuth, RoomControllers.add_room)
router.get("/getUsers", RoomControllers.get_all_users)
router.get("/getTables", RoomControllers.get_all_tables)
router.get("/getRooms", RoomControllers.get_all_rooms)

module.exports = router;