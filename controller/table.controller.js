const Rooms = require("../Model/room.model")
const Document = require("../Model/document.model")
const uuid = require("uuid")
const Room_User = require("../Model/room-user.model");

exports.addTable = (req, res) => {
    Rooms.findOne({_id: req.query.roomId})
        .then(room => {
            if (!room) {
                res.status(409).json({
                    message: `Room not found`
                });
            } else {
                Room_User.findOne({room_id: req.query.roomId, user_id: req.userData.userId})
                    .then(roomUser => {
                        if (!roomUser) {
                            res.status(400).json({
                                error: "You aren't a member this project"
                            })
                        } else {
                            const tableId = uuid.v4()

                            Document.create({
                                _id: tableId,
                                room_id: req.query.roomId,
                                name: req.body.name,
                                data: null,
                                columns: null
                            })
                                .then(() => {
                                    res.status(200).json({
                                        tableId: tableId
                                    })
                                })
                                .catch(err => {
                                    console.log(err)
                                    res.status(500).json({
                                        error: err
                                    })
                                })
                        }
                    })
            }
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({
                error: err
            })
        })
}

exports.rename_tables = (req, res) => {
    Document.findOne({_id: req.query.tableId})
        .then(tables => {
            if (tables.matchedCount === 0) {
                res.status(404).json({
                    message: `Tables not found`
                });
            } else {
                Room_User.findOne({room_id: tables.room_id, user_id: req.userData.userId})
                    .then(roomUser => {
                        if (!roomUser) {
                            res.status(400).json({
                                error: "You aren't a member this project"
                            })
                        } else {
                            Document.updateOne({_id: req.query.tableId}, {$set: {name: req.body.name}})
                                .then(result => {
                                    res.status(200).json({
                                        message: `Tables updated successfully`
                                    });
                                })
                                .catch(err => {
                                    console.log(err)
                                    res.status(500).json({
                                        error: err
                                    })
                                })
                        }
                    })
            }
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({
                error: err
            })
        })
}

exports.table_delete = (req, res) => {
    Document.findOne({_id: req.query.tableId})
        .then( table => {
            if(table){
                Room_User.findOne({room_id: table.room_id, user_id: req.userData.userId})
                    .then(roomUser => {
                        if (!roomUser) {
                            res.status(400).json({
                                error: "You aren't a member this project"
                            })
                        } else {
                            Document.deleteOne({ _id: table._id })
                                .then(result => {
                                    res.status(200).json({
                                        message: `${table.name} deleted successfully!`
                                    })
                                }).catch(err => {
                                res.status(500).json({
                                    error: err
                                })
                            })
                        }
                    })
            }
            else{
                res.status(404).json({
                    error: "Table not found"
                })
            }

        })
        .catch( err => {
            res.status(500).json({
                error: err
            })
        });
}