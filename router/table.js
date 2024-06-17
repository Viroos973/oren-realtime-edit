const express = require("express");
const router = express.Router();

const TableControllers = require("../controller/table.controller")

router.post("/addTable", TableControllers.addTable)

module.exports = router;