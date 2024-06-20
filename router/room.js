const express = require("express");
const router = express.Router();
const checkAuth  = require("../middleware/check-auth");

const RoomControllers = require("../controller/room.controller")

router.post("/addUser", checkAuth, RoomControllers.add_user)
router.post("/addRoom", checkAuth, RoomControllers.add_room)
router.get("/getUsers", checkAuth, RoomControllers.get_all_users)
router.get("/getTables", checkAuth, RoomControllers.get_all_tables)
router.get("/getRooms", checkAuth, RoomControllers.get_all_rooms)
router.put("/renameRoom", checkAuth, RoomControllers.rename_room)
router.delete("/deleteRoom", checkAuth, RoomControllers.room_delete)
router.delete("/deleteUserRoom", checkAuth, RoomControllers.delete_room_users)

module.exports = router;