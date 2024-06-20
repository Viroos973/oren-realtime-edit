const express = require("express");
const router = express.Router();

const TableControllers = require("../controller/table.controller")
const checkAuth = require("../middleware/check-auth");

router.post("/addTable", checkAuth, TableControllers.addTable)
router.put("/renameTable", checkAuth, TableControllers.rename_tables)
router.delete("/deleteTable", checkAuth, TableControllers.table_delete)

module.exports = router;